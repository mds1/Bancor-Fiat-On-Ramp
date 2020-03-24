const { expectRevert, constants } = require("@openzeppelin/test-helpers");
const ProvideLiquidity = artifacts.require("ProvideLiquidity");

const bancorConverter = '0xA2cAF0d7495360CFa58DeC48FaF6B4977cA3DF93'

contract('Provide Liquidity', accounts => {
  let ProvideLiquidityContract;
  let BancorConverterContract;

  before(async() => {
    // Deploy ProvideLiquidity instance
    ProvideLiquidityContract = await ProvideLiquidity.new();
  })

  // ======================================= Initialization ========================================
  it('deploys properly', async () => {
    expect(ProvideLiquidityContract.address.startsWith('0x')).to.be.true;
  });
})