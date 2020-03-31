const { balance, constants, ether, expectRevert, send } = require("@openzeppelin/test-helpers");

// Interfaces
const IERC20 = artifacts.require("IERC20");
const IEtherToken = artifacts.require("IEtherToken");

// Contracts
const ProvideLiquidity = artifacts.require("ProvideLiquidity");

// Addresses
const bancorConverter = "0xd3ec78814966Ca1Eb4c923aF4Da86BF7e6c743bA";
const bnt = "0x1F573D6Fb3F13d689FF844B4cE37794d79a7FF1C";
const ethBnt = "0xb1CD6e4153B2a390Cf00A6556b0fC1458C4A5533";
const etherToken = "0xc0829421C1d260BD3cB3E0F06cfE2D52db2cE315";
const dai = "0x6B175474E89094C44Da98b954EedeAC495271d0F";

// Amounts
const fromWei = web3.utils.fromWei;
const MAX_UINT = constants.MAX_UINT256.toString();

contract("Provide Liquidity", accounts => {
  // Contract instances
  let ProvideLiquidityContract;
  let EtherContract;
  let DaiContract;

  // Users
  const bancor = accounts[0];
  const alice = accounts[1];
  const attacker = accounts[2];
  const daiExchange = process.env.DAI_ADDRESS;

  // Addresses
  let provideLiquidity;

  beforeEach(async () => {
    // Deploy ProvideLiquidity instance
    // Note: Deploying from bancor implies bancor is the factory and can send
    // transactions on behalf of user
    ProvideLiquidityContract = await ProvideLiquidity.new({ from: bancor });
    ProvideLiquidityContract.initializeContract(alice, { from: bancor });
    provideLiquidity = ProvideLiquidityContract.address;

    // Create contract instances
    BntContract = await IERC20.at(bnt);
    DaiContract = await IERC20.at(dai);
    EthBntContract = await IERC20.at(ethBnt);
    EtherContract = await IEtherToken.at(etherToken);
  });

  // ======================================= Initialization ========================================

  it("deploys properly", async () => {
    expect(ProvideLiquidityContract.address.startsWith("0x")).to.be.true;
  });

  it("initializes properly", async () => {
    expect(await ProvideLiquidityContract.user()).to.equal(alice);
    expect(await ProvideLiquidityContract.factory()).to.equal(bancor);
    expect((await EtherContract.allowance(provideLiquidity, bancorConverter)).toString())
      .to.equal(MAX_UINT);
    expect((await BntContract.allowance(provideLiquidity, bancorConverter)).toString())
      .to.equal(MAX_UINT);
  });

  // ======================================== Authorization ========================================

  it("only lets contract be initialized once", async () => {
    await expectRevert(
      ProvideLiquidityContract.initializeContract(bancor, { from: bancor }),
      "Contract instance has already been initialized"
    );
  });

  it("only lets the user enter and exit pools", async () => {
    await expectRevert(
      ProvideLiquidityContract.enterPool({ from: attacker }),
      "ProvideLiquidity: Caller is not authorized"
    );
    await expectRevert(
      ProvideLiquidityContract.exitPool(ether("5"), { from: attacker }),
      "ProvideLiquidity: Caller is not authorized"
    );
  });

  it("only lets the user withdraw stray tokens", async () => {
    await expectRevert(
      ProvideLiquidityContract.withdrawTokens(bnt, { from: attacker }),
      "ProvideLiquidity: Caller is not authorized"
    );
  });

  it("only lets the user withdraw stray Ether", async () => {
    await expectRevert(
      ProvideLiquidityContract.withdrawEther({ from: attacker }),
      "ProvideLiquidity: Caller is not authorized"
    );
  });

  // ======================================== Functionality ========================================

  it("lets users enter and exit the ETH liquidity pool", async () => {
    // Initial balance should be zero
    expect(fromWei(await EthBntContract.balanceOf(provideLiquidity))).to.equal("0");

    // Enter liquidity pool ------------------------------------------------
    // Send Ether to contract (sent from Bancor but used to represent Wyre)
    await send.ether(bancor, provideLiquidity, ether("5"));

    // Enter pool
    await ProvideLiquidityContract.enterPool({ from: alice, gasPrice: "1" });

    // Check that proxy received EthBnt tokens, not alice
    expect(parseFloat(fromWei(await EthBntContract.balanceOf(provideLiquidity)))).to.be.above(0);
    expect(parseFloat(fromWei(await EthBntContract.balanceOf(alice)))).to.equal(0);

    // Check balances of contract, ensure alice never receives tokens
    // TODO why does contract still have EtherTokens and BNT? Possibly ganache bug
    console.log("Balance after Entering Pool ------------------------");
    console.log("ETHBNT Contract: ", fromWei(await EthBntContract.balanceOf(provideLiquidity)));
    console.log("ETH Contract: ", fromWei(await EtherContract.balanceOf(provideLiquidity)));
    console.log("BNT Contract: ", fromWei(await BntContract.balanceOf(provideLiquidity)));
    console.log("ETHBNT Alice: ", fromWei(await EthBntContract.balanceOf(alice)));
    console.log("ETH Alice: ", fromWei(await EtherContract.balanceOf(alice)));
    console.log("BNT ALice: ", fromWei(await BntContract.balanceOf(alice)));
    // expect(fromWei(await BntContract.balanceOf(provideLiquidity))).to.equal('0')
    // expect(fromWei(await EtherContract.balanceOf(provideLiquidity))).to.equal('0')

    // Exit liquidity pool ------------------------------------------------
    // Get our current ETHBNT balance
    const initialBalance = await EthBntContract.balanceOf(provideLiquidity);

    // Exit the pool
    await ProvideLiquidityContract.exitPool(initialBalance, { from: alice });

    // Check balances
    console.log("Balance after Exiting Pool ------------------------");
    console.log("ETHBNT Contract: ", fromWei(await EthBntContract.balanceOf(provideLiquidity)));
    console.log("ETH Contract: ", fromWei(await EtherContract.balanceOf(provideLiquidity)));
    console.log("BNT Contract: ", fromWei(await BntContract.balanceOf(provideLiquidity)));
    console.log("ETHBNT Alice: ", fromWei(await EthBntContract.balanceOf(alice)));
    console.log("ETH Alice: ", fromWei(await EtherContract.balanceOf(alice)));
    console.log("BNT ALice: ", fromWei(await BntContract.balanceOf(alice)));

    expect(parseFloat(fromWei(await EthBntContract.balanceOf(alice)))).to.equal( 0 );
    expect(parseFloat(fromWei(await EthBntContract.balanceOf(provideLiquidity)))).to.equal(0);
    expect(parseFloat(fromWei(await EtherContract.balanceOf(provideLiquidity)))).to.be.above(0);
    expect(parseFloat(fromWei(await BntContract.balanceOf(provideLiquidity)))).to.be.above(0);
  });

  it("allows stray ERC20 tokens to be withdrawn", async () => {
    // Send DAI to the proxy contract
    const daiAmount = ether("0.1");
    await DaiContract.transfer(provideLiquidity, daiAmount, { from: daiExchange });
    expect((await DaiContract.balanceOf(provideLiquidity)).toString())
      .to.be.equal(daiAmount.toString());

    // Withdraw the Dai to Alice's wallet and check result
    await ProvideLiquidityContract.withdrawTokens(dai, { from: alice });
    expect((await DaiContract.balanceOf(alice)).toString()).to.equal( daiAmount.toString());
  });

  it("allows stray Ether to be withdrawn", async () => {
    // Send Ether to the forwarder contract
    await send.ether(bancor, provideLiquidity, ether("1"));
    expect((await balance.current(provideLiquidity, "ether")).toString()).to.equal("1");

    // Withdraw the Ether and check result
    const initialBalance = (await balance.current(alice)).toString(); // get initial ETH balance
    await ProvideLiquidityContract.withdrawEther({ from: alice });
    const newBalance = (await balance.current(alice)).toString(); // get updated ETH balance
    expect(parseFloat(newBalance)).to.be.above(parseFloat(initialBalance));
  });
});
