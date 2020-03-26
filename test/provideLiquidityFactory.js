const { BN, constants, expectEvent } = require("@openzeppelin/test-helpers");
const ProvideLiquidity = artifacts.require("ProvideLiquidity");
const Factory = artifacts.require("ProvideLiquidityFactory");

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
  const bancor = accounts[0];
  const alice = accounts[1];

  // Addresses
  let factory;
  let provideLiquidity;

  beforeEach(async () => {
    // Deploy and initialize factory
    FactoryInstance = await Factory.new({ from: bancor });
    factory = FactoryInstance.address;

    // Deploy ProvideLiquidity instance logic template
    ProvideLiquidityContract = await ProvideLiquidity.new({ from: bancor });
    await ProvideLiquidityContract.setUser(bancor, { from: bancor }); // set bancor as user for template
    provideLiquidity = ProvideLiquidityContract.address;
  });

  // ======================================= Initialization ========================================
  it("deploys properly", async () => {
    // Check that factory was deployed properly
    expect(factory.startsWith("0x")).to.be.true;
    expect(provideLiquidity.startsWith("0x")).to.be.true;
    // Check that logic template was deployed properly
    expect(await ProvideLiquidityContract.bancorConverter()).to.equal(bancorConverter);
  });

  // ======================================== Functionality ========================================
  it("properly deploys and configures proxy contracts", async () => {
    // This test calls the deployment directly instead of via the GSN
    const { logs } = await FactoryInstance.createContract(provideLiquidity, { from: alice });
    // Get instance of the newly deployed proxy
    const proxy = await FactoryInstance.getContract(alice);
    const ProxyInstance = await ProvideLiquidity.at(proxy)
    // Check parameters
    expect(await FactoryInstance.isClone(provideLiquidity, proxy)).to.be.true;
    expect(await ProxyInstance.user()).to.equal(alice)
    await expectEvent.inLogs(logs, 'ProxyCreated', { proxy, user: alice });
  });
});
