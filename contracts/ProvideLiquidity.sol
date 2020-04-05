pragma solidity ^0.6.0;

/**
 * @notice This contract only lets the user supply ETH to
 * the Bancor liquidity pool
 */

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/upgrades/contracts/Initializable.sol";
import "./IBancorNetwork.sol";
import "./IBancorConverter.sol";
import "./IBancorFormula.sol";
import "./IEtherToken.sol";

contract ProvideLiquidity is Initializable {

  // User is effectively the contract owner. All funds in this contract
  // are only for the user
  address public user;

  // Factory is the address of the parent factory contract. This is used
  // to restrict function calls to being either directly from the user
  // or from the factory contract
  address public factory;

  // Contracts needed to interact with Bancor
  IBancorNetwork public constant BancorNetwork =
    IBancorNetwork(0x3Ab6564d5c214bc416EE8421E05219960504eeAD);
  IBancorConverter public constant BancorConverter =
    IBancorConverter(0xd3ec78814966Ca1Eb4c923aF4Da86BF7e6c743bA);
  IBancorFormula public constant BancorFormula =
    IBancorFormula(0x524619EB9b4cdFFa7DA13029b33f24635478AFc0);

  // Supported tokens
  IEtherToken public constant EtherToken = IEtherToken(0xc0829421C1d260BD3cB3E0F06cfE2D52db2cE315);
  IERC20 public constant EtherTokenIERC20 = IERC20(0xc0829421C1d260BD3cB3E0F06cfE2D52db2cE315);
  IERC20 public constant BntToken = IERC20(0x1F573D6Fb3F13d689FF844B4cE37794d79a7FF1C);
  IERC20 public constant EthBntToken = IERC20(0xb1CD6e4153B2a390Cf00A6556b0fC1458C4A5533);

  // ===============================================================================================
  //                                          Events
  // ===============================================================================================

  /**
   * @notice Emitted when the contract is initialized
   */
  event Initialized(address indexed user);

  /**
   * @notice Emitted when user enters the pool
   */
  event PoolEntered(uint256 indexed amount);

  /**
   * @notice Emitted when the user leaves the pool
   */
  event PoolExited(uint256 indexed amount);

  /**
   * @dev Emitted when a token is withdrawn without being converted to Chai
   */
  event TokensWithdrawn(uint256 indexed amount, address token);

  /**
   * @dev Emitted when Ether is withdrawn without being converted to Chai
   */
  event EtherWithdrawn(uint256 indexed amount);

  // ===============================================================================================
  //                                      Main Functionality
  // ===============================================================================================

  modifier onlyUser() {
    require(msg.sender == user || msg.sender == factory, "ProvideLiquidity: Caller is not authorized");
    _;
  }

  /**
   * @notice Set the address of the user who this contract is for and
   * executes token approvals
   * @dev initializer modifier ensures this can only be called once
   */
  function initializeContract(address _user) external initializer {
    emit Initialized(_user);
    user = _user;
    factory = msg.sender;

    // Approvals
    EtherToken.approve(address(BancorConverter), uint256(-1));
    BntToken.approve(address(BancorConverter), uint256(-1));
  }

  /**
   * @notice Swap Ether for Bancor's Ether Token
   */
  function swapEtherForEtherToken() internal {
    uint256 _amount = address(this).balance / 2; // use half of the Ether
    EtherToken.deposit{value: _amount}();
  }

  /**
   * @notice Swap half of the Ether Tokens held by this contract for BNT
   */
  function swapEtherForBnt() internal {
    // Define conversion path
    IERC20[] memory _path = new IERC20[](3);
    (_path[0], _path[1], _path[2]) = (EtherTokenIERC20, EthBntToken, BntToken);

    // Define other swap parameters
    uint256 _amount = address(this).balance / 2; // use half of the Ether
    uint256 _minReturn = 1; // TODO update this
    address _affiliate = 0x0000000000000000000000000000000000000000;
    uint256 _fee = 0;

    // Convert token
    BancorNetwork.convert2{value: _amount}(_path, _amount, _minReturn, _affiliate, _fee);
  }

  /**
   * @notice Calculates the amount of ETHBNT tokens we should be receiving.
   * This value is needed as an input when entering a liquidity pool
   * @return uint256, amount of tokens
   */
  function calculatePoolTokenAmount() internal returns (uint256) {
    // Get BNT parameters
    uint256 _reserveBalBnt = BntToken.balanceOf(address(BancorConverter));
    uint256 _amtBnt = BntToken.balanceOf(address(this));

    // Get EtherToken parameters
    uint256 _reserveBalEth = EtherToken.balanceOf(address(BancorConverter));
    uint256 _amtEth = EtherToken.balanceOf(address(this));

    // Get parameters that are the same for both EtherToken and BNT
    uint32 _ratio = 1000000; // 1,000,000 since we are doing a 50/50 split
    uint256 _supply = EthBntToken.totalSupply(); // ETHBNT pool token supply

    // Calculate the amount of reserve tokens received from each contribution
    uint256 _amtResBnt = BancorFormula.calculateFundCost(_supply, _reserveBalBnt, _ratio, _amtBnt);
    uint256 _amtResEth = BancorFormula.calculateFundCost(_supply, _reserveBalEth, _ratio, _amtEth);

    // Sum reserve token amounts to get the total
    return _amtResBnt + _amtResEth;
  }

  /**
   * @notice Enters user into Bancor's ETH liquidity pool.
   */
  function enterPool() external onlyUser {
    // Swap half of the Ether sent for BNT
    swapEtherForBnt();

    // Swap the other half of the Ether sent for EtherToken
    swapEtherForEtherToken();

    // Enter the pool
    uint256 _amount = calculatePoolTokenAmount();
    emit PoolEntered(_amount);
    BancorConverter.fund(_amount);
  }

  /**
   * @notice Exits the pool
   * @param _amount Amount of pool tokens to redeem
   */
  function exitPool(uint256 _amount) external onlyUser {
    // Redeem them for the underlying
    emit PoolExited(_amount);
    BancorConverter.liquidate(_amount);
  }

  /**
   * @notice Required so contract can receive Ether deposits
   * @dev Solidity 0.6.0 changes fallback function implementation.
   * See: https://solidity.readthedocs.io/en/v0.6.4/contracts.html#receive-ether-function
   */
  receive() external payable {}

  // ===============================================================================================
  //                                          Escape Hatches
  // ===============================================================================================

  /**
   * @notice Transfers all tokens of the input adress to the recipient. This is
   * useful if you want to withdraw any tokens to your wallet, or if tokens
   * were accidentally sent to this contract they can now be withdrawn.
   * @param _tokenAddress address of token to send
   * @param _recipient address to send tokens to
   */
  function withdrawTokens(address _tokenAddress, address _recipient) external onlyUser {
    IERC20 _token = IERC20(_tokenAddress);
    uint256 _balance = _token.balanceOf(address(this));
    emit TokensWithdrawn(_balance, _tokenAddress);
    _token.transfer(_recipient, _balance);
  }

  /**
   * @notice Transfers all Ether to the specified address
   * @param _recipient address to send tokens to
   */
  function withdrawEther(address _recipient) external onlyUser {
    uint256 _balance = address(this).balance;
    emit EtherWithdrawn(_balance);
    payable(_recipient).transfer(_balance);
  }
}