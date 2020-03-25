const { BN, constants, expectRevert } = require("@openzeppelin/test-helpers");
const ProvideLiquidity = artifacts.require("ProvideLiquidity");
const IBancorConverter = artifacts.require("IBancorConverter");
const IERC20 = artifacts.require("IERC20");

// Addresses
const bancorConverter = "0xA2cAF0d7495360CFa58DeC48FaF6B4977cA3DF93";
const dai = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
const daibnt = "0xee01b3AB5F6728adc137Be101d99c678938E6E72";

// Amounts
const toWei = web3.utils.toWei;
const amount = toWei("100").toString(); // default Dai amount

contract("Provide Liquidity", accounts => {
  // Contract instances
  let ProvideLiquidityContract;
  let BancorConverterContract;
  let DaiContract;

  // Users
  const alice = accounts[1];
  const exchange = process.env.EXCHANGE_ADDRESS;

  beforeEach(async () => {
    // Deploy ProvideLiquidity instance
    ProvideLiquidityContract = await ProvideLiquidity.new();

    // Create instance of Bancor Converter contract
    BancorConverterContract = await IBancorConverter.at(bancorConverter);

    // Create instance of Dai contract
    DaiContract = await IERC20.at(dai);

    // Send Dai to Alice
    await DaiContract.transfer(alice, amount, { from: exchange });
    expect((await DaiContract.balanceOf(alice)).toString()).to.equal(amount);

    // Approve ProvideLiquidity contract to spend Alice's Dai
    await DaiContract.approve(ProvideLiquidityContract.address, constants.MAX_UINT256, {from: alice});
  });

  // ======================================= Initialization ========================================
  it("deploys properly", async () => {
    console.log(2);
    expect(ProvideLiquidityContract.address.startsWith("0x")).to.be.true;
    expect(BancorConverterContract.address.startsWith("0x")).to.be.true;
    expect(await ProvideLiquidityContract.bancorConverter()).to.equal( bancorConverter );
    console.log(5);
  });

  // it("lets users provide liquidity", async () => {
  //   // Provide liquidity
  //   await ProvideLiquidityContract.provideLiquidity(dai, daibnt, amount, {from: alice});
  // });

  // after(async () => {
  //   // Send all Dai back to the exchange
  //   await DaiContract.transfer(exchange, await DaiContract.balanceOf(alice), { from: alice });
  // });
});
