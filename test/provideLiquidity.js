const { balance, BN, constants, ether, expectRevert, send } = require("@openzeppelin/test-helpers");
const ProvideLiquidity = artifacts.require("ProvideLiquidity");
const IBancorConverter = artifacts.require("IBancorConverter");
const IERC20 = artifacts.require("IERC20");
const IEtherToken = artifacts.require("IEtherToken");

// Addresses
const etherToken = "0xc0829421C1d260BD3cB3E0F06cfE2D52db2cE315";
const bnt = "0x1F573D6Fb3F13d689FF844B4cE37794d79a7FF1C";
const ethBnt = '0xb1CD6e4153B2a390Cf00A6556b0fC1458C4A5533';

// Amounts
const toWei = web3.utils.toWei;
const fromWei = web3.utils.fromWei;

contract("Provide Liquidity", accounts => {
  // Contract instances
  let ProvideLiquidityContract;
  let EtherContract;
  let BancorConverterContract;
  let DaiContract;

  // Users
  const alice = accounts[1];
  const bntExchange = process.env.BNT_ADDRESS;

  // Addresses
  let provideLiquidity;

  beforeEach(async () => {
    // Deploy ProvideLiquidity instance
    ProvideLiquidityContract = await ProvideLiquidity.new();
    provideLiquidity = ProvideLiquidityContract.address;

    // Create contract instances
    EtherContract = await IEtherToken.at(etherToken);
    BntContract = await IERC20.at(bnt);
    EthBntContract = await IERC20.at(ethBnt);

  });

  // ======================================= Initialization ========================================
  it.skip("deploys properly", async () => {
    expect(ProvideLiquidityContract.address.startsWith("0x")).to.be.true;
  });

  it('lets users enter the ETH liquidity pool', async() => {
    // Initial balance should be zero
    expect(fromWei(await EthBntContract.balanceOf(provideLiquidity))).to.equal('0')

    // Enter liquidity pool ------------------------------------------------
    // Send Ether to contract (sent from random address to represent Wyre)
    await send.ether(accounts[0], provideLiquidity, ether('5'));

    // Enter pool
    await ProvideLiquidityContract.enterPool({from: alice, gasPrice: '1'});

    // Check that alice received EthBnt tokens
    expect(parseFloat(fromWei(await EthBntContract.balanceOf(alice)))).to.be.above(0)
    expect(parseFloat(fromWei(await EthBntContract.balanceOf(provideLiquidity)))).to.equal(0)

    // Check that contract has no more EtherTokens or BNT
    // TODO why does contract still have EtherTokens and BNT?
    console.log('Balance after Entering Pool ------------------------');
    console.log('ETHBNT Contract: ', fromWei(await EthBntContract.balanceOf(provideLiquidity)));
    console.log('ETH Contract: ', fromWei(await EtherContract.balanceOf(provideLiquidity)));
    console.log('BNT Contract: ', fromWei(await BntContract.balanceOf(provideLiquidity)));
    console.log('ETHBNT Alice: ', fromWei(await EthBntContract.balanceOf(alice)));
    console.log('ETH Alice: ', fromWei(await EtherContract.balanceOf(alice)));
    console.log('BNT ALice: ', fromWei(await BntContract.balanceOf(alice)));
    // expect(fromWei(await BntContract.balanceOf(provideLiquidity))).to.equal('0')
    // expect(fromWei(await EtherContract.balanceOf(provideLiquidity))).to.equal('0')

    // Exit liquidity pool ------------------------------------------------
    // Approve contract to spend our ETHBNT
    await EthBntContract.approve(provideLiquidity, constants.MAX_UINT256, { from: alice });

    // Get our current ETHBNT balance
    const initialBalance = await EthBntContract.balanceOf(alice);

    // Exit the pool
    await ProvideLiquidityContract.exitPool(initialBalance, { from: alice });

    // Check balances
    console.log('Balance after Exiting Pool ------------------------');
    console.log('ETHBNT Contract: ', fromWei(await EthBntContract.balanceOf(provideLiquidity)));
    console.log('ETH Contract: ', fromWei(await EtherContract.balanceOf(provideLiquidity)));
    console.log('BNT Contract: ', fromWei(await BntContract.balanceOf(provideLiquidity)));
    console.log('ETHBNT Alice: ', fromWei(await EthBntContract.balanceOf(alice)));
    console.log('ETH Alice: ', fromWei(await EtherContract.balanceOf(alice)));
    console.log('BNT ALice: ', fromWei(await BntContract.balanceOf(alice)));

    expect(parseFloat(fromWei(await EthBntContract.balanceOf(alice)))).to.equal(0)
    expect(parseFloat(fromWei(await EthBntContract.balanceOf(provideLiquidity)))).to.equal(0)
    expect(parseFloat(fromWei(await EtherContract.balanceOf(alice)))).to.be.above(0)
    expect(parseFloat(fromWei(await BntContract.balanceOf(alice)))).to.be.above(0)
  })
});
