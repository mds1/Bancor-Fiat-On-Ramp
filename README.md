# Bancor Fiat On Ramp

This tool enables an easy Fiat on/off ramp for entering/exiting Bancor liquidity pools. Features:

- The user does not need to have a wallet setup
- Gas Station Network (GSN) support so the user does not need Ether for gas

## Workflow

This section will describe the workflow from a user's perspective. Italics are used to indicate architecture details, current limitations, and suggested improvements.

### Initial Setup

This process occurs the first time a user uses this website:

1. Connect wallet
   1. If a user has a wallet, they should click "Connect Wallet to Get Started". This supports MetaMask, WalletConnect, Fortmatic, Torus, and more.
   2. If a user does not have a wallet, they should click "Connect Account". This will enable them to login with a Google, Facebook, Reddit, Discord, or Twitch account via [Torus](https://tor.us/)
2. Deploy proxy contract for user.
   1. *After the user logs in, we check `Factory.getContract` to see if the user has an existing proxy contract.*
   2. *SInce this is their first visit, they won't, so we call `Factory.createContract(target)` where `target` is the address of a deployed and initialized version of `ProvideLiquidity.sol`. This deploys a [minimal proxy](https://blog.openzeppelin.com/deep-dive-into-the-minimal-proxy-contract/) for the user that delegates all calls to the deployed and initialized version of `ProvideLiquidity.sol`.*
   3. *This call to `createContract(target)` is done by the user via a provider configured using OpenZeppelin's [GSN Provider](https://github.com/OpenZeppelin/openzeppelin-gsn-provider). This is what enables GSN support*
   4. *Potential upgrade: Use CREATE2 to generate a deterministic proxy address and provide a better UX*

### Enter Liquidity Pool

This process occurs whenever a user wants to enter into a liquidity pool:

1. Connect wallet
2. Select pool to deposit into and select deposit amount in USD
   1. *The selected pool is saved in local storage. This is done because later we'll navigate away from this domain to complete the purchase, and the Wyre widget then redirects back to this site. Therefore local storage is used to save the user's preferences. Alternatively, we could use a query parameter in the Wyre `redirectUrl`, but local storage approach will carry over better to other payment processors since they likely have different APIs*
   2. *Right now ETH-BNT is the only supported pool*
3. Click Deposit
4. User will be redirected to Wyre's hosted widget
   1. *Documentation found [here](https://docs.sendwyre.com/docs/widget-getting-started-2) and [here](https://docs.sendwyre.com/docs/wyre-widget-v2)*
   2. *This supports international and domestic deposits via debit card and Apple Pay. However, Wyre currently does not support ACH for countries outside the US, so withdrawing back to fiat will only be support for the US as of now. Wyre's [push-to-debit](https://docs.sendwyre.com/docs/wyre-push-to-debit-card) feature may add international withdrawal support soon.*
   3. *Apple Pay requires the user be on a supported device with Safari*
   4. *Wyre widget will be auto-populated with (1) ETH as the currency to purchase, (2) the user's proxy contract address as the recipient address, (3) their selected deposit amount, and (4) a redirect URL which simply redirects them back to this website*
5. User completes purchase in the Wyre widget and is redirected back to the website
   1. *Suggested improvement: Use Wyre's `failureRedirectUrl` to handle failed payments*
6. Frontend watches for Ether to be received by their proxy contract
   1. *Wyre does not provide us with a transaction hash, likely because this is a two step process (handle payment processing > send transaction). Instead, we store the user's current Ether balance in local storage before they initiate the payment, and wait for that balance to increase.*
7. Upon receipt, frontend prompts user to click "Complete" to complete their deposit into the liquidity pool
   1. *The selected liquidity pool is read from local storage, and the ETH required is already held by their proxy contract*
8. User signs the transaction which is relayed via the GSN
   1. *Relaying is done using the same GSN provider mentioned above*
   2. *The specific function the user calls is `Factory.enterPool()`. Why do we call this on the factory contract instead of their proxy? The reason is because the GSN requires to you to fund the `RelayHub` for each contract you want to pay gas for. Those funds are then used to pay gas. It would be inconvenient to have to fund `RelayHub` for a new contract every time a new proxy contract is deployed. Instead, we enable users to interact with their proxy through the Factory contract, and the factory contract will look up that user's proxy address. It's worth nothing that if a user does have ETH for gas, they can choose to interact with their proxy directly*
9. Once the transaction is complete, the user has successfully entered the liquidity pool and pool tokens are held by their proxy contract.
   1. *Pool tokens are not sent back to the user because then there would be no way for a  user to exit the liquidity pool unless they had ETH for gas. Only Dai and Chai enable approval by signature via their `permit()` function, but all other ERC20s require the user to have ETH to directly call the `permit()` function themselves*

### Leaving Liquidity Pool

TODO


## Development Setup

Create a file at the project root called .env with the following contents:

```bash
export INFURA_ID=yourInfuraId
export DAI_ADDRESS=0x6262998Ced04146fA42253a5C0AF90CA02dfd2A3
export BNT_ADDRESS=0xF977814e90dA44bFA03b6295A0616a897441aceC
export MNEMONIC="your mnemonic"
```

Here, `DAI_ADDRESS` is simply an account with a lot of Dai used to
acquire Dai, and `BNT_ADDRESS` is the same but for BNT. These addresses
are used for testing.

Next, create `app/.env` with the following contents:

```bash
export BLOCKNATIVE_API_KEY=yourBlocknativeApiKey
export INFURA_ID=yourInfuraId
export PORTIS_API_KEY=yourPortisApiKey
export FORTMATIC_API_KEY=yourFortmaticApiKey
export SQUARELINK_API_KEY=yourSquarelinkApiKey
export WYRE_ENV=dev
```

Here, `WYRE_ENV` is used to determine whether to load the development or production version
of the Wyre widget. `BLOCKNATIVE_API_KEY` is used to connect wallets, and the remaining
API keys are needed to enable connection to that wallet type.

Now install dependencies with:

```bash
yarn install
cd app
yarn install
```

### Run App

```bash
cd app
yarn run dev
```

### Run Tests

```bash
# Start ganache-cli
yarn run ganache

# Then in a new terminal window run
yarn run test
```

### Deployment

1. Compile the contracts with `npx oz compile`
2. Make sure your `MNEMONIC` is set in `.env` and if necessary configure the derivation path used in `truffle-config.js`.
3. Run `source .env`
4. Run `npx oz accounts` to confirm the right address would be used for deployment
5. Run `npx oz create` and follow the prompts to deploy `ProvideLiquidity.sol`. Call the `initializeContract(address _user)` function and pass in the deployer's address as the `_user`. Since this is just a logic template, it doesn't matter much who the user is
6. View the contract on Etherscan and confirm that it was successfully initialized by checking the value of the `user` variable. You can do this in the Read as Proxy tab. If it was not initialized, make sure to do so manually.
7. Run `npx oz create` and follow the prompts to deploy `ProvideLiquidityFactory.sol`. Call the `initializeContract()` function and confirm it was called properly. Note that this function does not require any inputs.

Done! There will now be a file called `.openzeppelin/<network>.json` which contains deployment info for the contracts. Be sure not to delete that file.

Be aware that these deployed contracts will be upgradable by default. The easiest way to remove upgradeability is to change the upgradeability admin to the zero address. Alternatively, you can use newer versions of the OpenZeppelin CLI which support deploying regular contracts.

More information on deploying and upgrading contracts with the OpenZeppelin CLI can be found at:

- [OpenZeppelin Documentation](https://docs.openzeppelin.com/openzeppelin/)
- [Command Line Interface (CLI)](https://docs.openzeppelin.com/cli/2.8/)
- [Guide: Full start-to-finish OpenZeppelin workflow for CLI deployment and upgrades](https://forum.openzeppelin.com/t/guide-full-start-to-finish-openzeppelin-workflow-for-cli-deployment-and-upgrades/2191)
