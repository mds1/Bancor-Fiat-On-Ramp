const { constants, ether, expectEvent, send } = require("@openzeppelin/test-helpers");

// Interfaces
const IERC20 = artifacts.require("IERC20");
const IEtherToken = artifacts.require("IEtherToken");

// Contracts
const ProvideLiquidity = artifacts.require("ProvideLiquidity");
const Factory = artifacts.require("ProvideLiquidityFactory");

// Addresses
const bancorConverter = "0xd3ec78814966Ca1Eb4c923aF4Da86BF7e6c743bA";
const bnt = "0x1F573D6Fb3F13d689FF844B4cE37794d79a7FF1C";
const ethBnt = "0xb1CD6e4153B2a390Cf00A6556b0fC1458C4A5533";
const etherToken = "0xc0829421C1d260BD3cB3E0F06cfE2D52db2cE315";

// Helpers
const fromWei = web3.utils.fromWei;
const MAX_UINT = constants.MAX_UINT256.toString();

contract("Provide Liquidity", accounts => {
  // Contract instances
  let BntContract;
  let EthBntContract;
  let EtherContract;
  let ProvideLiquidityContract;

  // Users
  const bancor = accounts[0];
  const alice = accounts[1];

  // Addresses
  let factory;
  let provideLiquidity;

  beforeEach(async () => {
    // Create contract instances
    BntContract = await IERC20.at(bnt);
    EthBntContract = await IERC20.at(ethBnt);
    EtherContract = await IEtherToken.at(etherToken);

    // Deploy factory
    FactoryInstance = await Factory.new({ from: bancor });
    factory = FactoryInstance.address;

    // Deploy and initialize ProvideLiquidity instance logic template
    ProvideLiquidityContract = await ProvideLiquidity.new({ from: bancor });
    await ProvideLiquidityContract.initializeContract(bancor, { from: bancor }); // set bancor as user for template
    provideLiquidity = ProvideLiquidityContract.address;
  });

  // ======================================= Initialization ========================================

  it("deploys properly", async () => {
    // Check that factory and logic template was deployed properly
    expect(factory.startsWith("0x")).to.be.true;
    expect(provideLiquidity.startsWith("0x")).to.be.true;
  });

  // ======================================== Functionality ========================================

  it("properly deploys and configures proxy contracts", async () => {
    // This test calls the deployment directly instead of via the GSN
    const { logs } = await FactoryInstance.createContract(provideLiquidity, { from: alice });

    // Get instance of the newly deployed proxy
    const proxy = await FactoryInstance.getContract(alice);
    const ProxyInstance = await ProvideLiquidity.at(proxy);

    // Ensure proxy was deployed properly and check parameters
    expect(await FactoryInstance.owner()).to.equal(bancor);
    expect(await FactoryInstance.isClone(provideLiquidity, proxy)).to.be.true;
    expect(await ProxyInstance.user()).to.equal(alice);
    expect(await ProxyInstance.factory()).to.equal(factory);
    expect((await EtherContract.allowance(proxy, bancorConverter)).toString())
      .to.equal(MAX_UINT);
    expect((await BntContract.allowance(proxy, bancorConverter)).toString())
      .to.equal(MAX_UINT);
    await expectEvent.inLogs(logs, "ProxyCreated", { proxy, user: alice });
  });

  it("allows users to interact with their proxy", async () => {
    // Setup ------------------------------------------------------------------------
    // Deploy proxy
    await FactoryInstance.createContract(provideLiquidity, { from: alice });
    const proxy = await FactoryInstance.getContract(alice);

    // Send ETH to the proxy contract
    await send.ether(bancor, proxy, ether("5"));

    // Enter the pool ---------------------------------------------------------------
    // Enter the pool
    await FactoryInstance.enterPool({ from: alice });

    // Print token balances
    console.log("Balance after Entering Pool ------------------------");
    console.log("ETHBNT Proxy: ", fromWei(await EthBntContract.balanceOf(proxy)));
    console.log("ETH Proxy: ", fromWei(await EtherContract.balanceOf(proxy)));
    console.log("BNT Proxy: ", fromWei(await BntContract.balanceOf(proxy)));
    console.log("ETHBNT Alice: ", fromWei(await EthBntContract.balanceOf(alice)));
    console.log("ETH Alice: ", fromWei(await EtherContract.balanceOf(alice)));
    console.log("BNT ALice: ", fromWei(await BntContract.balanceOf(alice)));

    // Check token balances
    expect(parseFloat(fromWei(await EthBntContract.balanceOf(proxy)))).to.be.above(0);
    expect(fromWei(await EthBntContract.balanceOf(alice))).to.equal("0");
    expect(fromWei(await EtherContract.balanceOf(alice))).to.equal("0");
    expect(fromWei(await BntContract.balanceOf(alice))).to.equal("0");

    // Exit the pool ----------------------------------------------------------------
    // Get our current ETHBNT balance
    const initialBalance = await EthBntContract.balanceOf(proxy);

    // Exit the pool
    await FactoryInstance.exitPool(initialBalance, { from: alice });

    // Print token balances
    console.log("Balance after Exiting Pool ------------------------");
    console.log("ETHBNT Proxy: ", fromWei(await EthBntContract.balanceOf(proxy)));
    console.log("ETH Proxy: ", fromWei(await EtherContract.balanceOf(proxy)));
    console.log("BNT Proxy: ", fromWei(await BntContract.balanceOf(proxy)));
    console.log("ETHBNT Alice: ", fromWei(await EthBntContract.balanceOf(alice)));
    console.log("ETH Alice: ", fromWei(await EtherContract.balanceOf(alice)));
    console.log("BNT ALice: ", fromWei(await BntContract.balanceOf(alice)));

    // Check balances
    expect(fromWei(await EthBntContract.balanceOf(alice))).to.equal("0");
    expect(fromWei(await EtherContract.balanceOf(alice))).to.equal("0");
    expect(fromWei(await BntContract.balanceOf(alice))).to.equal("0");
    expect(parseFloat(fromWei(await EthBntContract.balanceOf(proxy)))).to.equal(0);
    expect(parseFloat(fromWei(await EtherContract.balanceOf(proxy)))).to.be.above(0);
    expect(parseFloat(fromWei(await BntContract.balanceOf(proxy)))).to.be.above(0);
  });
});
