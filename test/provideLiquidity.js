const { balance, BN, constants, ether, expectRevert } = require("@openzeppelin/test-helpers");
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
const initialEthAmount = ether('5'); // default Ether amount

contract("Provide Liquidity", accounts => {
  // Contract instances
  let ProvideLiquidityContract;
  let EtherTokenContract;
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
    EtherTokenContract = await IEtherToken.at(etherToken);
    BntTokenContract = await IERC20.at(bnt);
    EthBntTokenContract = await IERC20.at(ethBnt);

  });

  // ======================================= Initialization ========================================
  it.skip("deploys properly", async () => {
    expect(ProvideLiquidityContract.address.startsWith("0x")).to.be.true;
  });

  it('lets users enter the ETH liquidity pool', async() => {
    await ProvideLiquidityContract.enterPool({from: alice, value: initialEthAmount, gasPrice: '1'});

    const ethBntTokenBal = fromWei(await EthBntTokenContract.balanceOf(provideLiquidity));
    console.log('ethBntTokenBal ', ethBntTokenBal);


  })

  // after(async () => {
  //   // Send all Dai back to the daiExchange
  //   await DaiContract.transfer(daiExchange, await DaiContract.balanceOf(alice), { from: alice });
  // });
});
