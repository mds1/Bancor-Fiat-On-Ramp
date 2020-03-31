# Bancor Fiat On Ramp

This tool enables a gasless Fiat on/off ramp for entering/exiting Bancor liquidity pools.
It does not require the user to have an existing wallet nor does it require them to have
ETH for gas.

The workflow will be discussed below, followed by an overview of the architecture and
then deployment steps.

## Workflow

This section will describe the workflow from a user's perspective. Italics are used
to indicate architecture details or current limitations.

### Initial Setup

This process occurs the first time a user uses this website:

1. Connect wallet
2. Deploy proxy contract for user. *This is done by calling `Factory.createContract(target)` where `target` is the address of a deployed and initialized version of `ProvideLiquidity.sol`. This deploys a [minimal proxy](https://blog.openzeppelin.com/deep-dive-into-the-minimal-proxy-contract/) for the user that delegates all calls to the deployed and initialized version of `ProvideLiquidity.sol`.*
   1. *The user calls `createContract(target)` via a provider configured using OpenZeppelin's [GSN Provider](https://github.com/OpenZeppelin/openzeppelin-gsn-provider). This is what enables Gas Station Network (GSN) support*

### Enter Liquidity Pool

This process occurs whenever a user wants to enter into a liquidity pool:

1. Connect wallet
2. Select pool to deposit into and select deposit amount in USD
   1. The selected pool is saved in local storage
   2. *Right now ETH-BNT is the only supported pool*
3. Click Deposit
4. User will be redirected to Wyre's [hosted widget](https://docs.sendwyre.com/docs/widget-getting-started-2)
   1. This supports international and domestic deposits via debit card and Apple Pay
   2. Apple Pay requires the user be on a supported device with Safari
   3. Wyre widget will be auto-populated with (1) ETH as the currency to purchase, (2) the user's proxy contract address as the recipient address, (3) their selected deposit amount, and (4) redirect parameters to redirect them back to this website
5. User completes purchase in the Wyre widget and is redirected back to the website
6. Frontend watches for Ether to be received by their proxy contract
7. Upon receipt, frontend prompts user to complete their deposit into the liquidity pool
   1. The selected liquidity pool is read from local storage
8. User signs the transaction which is relayed via the Gas Station Network (GSN)
   1. TODO does this work well with factory contracts? Perhaps user signature should be requested manually, e.g. similar to how `permit` function works

### Leaving Liquidity Pool

TODO

## Architecture

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

```text
yarn install
cd app
yarn install
```

### Run App

```text
cd app
yarn run dev
```

### Run Tests

```text
yarn run test
```

### Deployment

TODO
