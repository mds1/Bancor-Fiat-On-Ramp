pragma solidity ^0.6.0;

/**
Providing Liquidity on Bancor
source: https://docs.bancor.network/api-reference/ethereum-smart-contracts

Anyone can become a liquidity provider to a Relay and contribute to its reserves.
This is different than buying tokens on Bancor. It requires staking tokens in a
Relay. Users can stake their tokens in a Relay by buying “Relay Tokens” on
bancor.network, or through any third-party liquidity portal built atop the Bancor
Protocol. Relay Tokens can be sold at any time to withdraw a proportional share
of the Relay’s liquidity.

Each time a Relay processes a conversion, a small liquidity provider fee (usually
0.1-0.3%) is taken out of each trade and deposited into the Relay’s reserves.
These fees function as an incentive for liquidity providers who can withdraw
their proportional share of the reserves including the accumulated fees. The
larger a Relay’s reserves, the lower the slippage costs incurred by traders
transacting with the Relay, driving more conversion volume and, in turn, more
fees for liquidity providers.

Currently, whoever initiates the Relay determines its fees, while in the future,
liquidity providers will be able to vote on the Relay’s fee. Bancor takes no
platform fee from trades.
*/

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/upgrades/contracts/Initializable.sol";
import "./IBancorConverter.sol";

contract ProvideLiquidity is Initializable {

  address public user;
  IBancorConverter public bancorConverter;

  event UserSet(address indexed user);

  constructor() public {
    // Create instance of Bancor Converter
    bancorConverter = IBancorConverter(0xA2cAF0d7495360CFa58DeC48FaF6B4977cA3DF93);
  }

  /**
   * @notice Set the address of the user who this contract is for
   * @dev initializer modifier ensures this can only be called once
   */
  function setUser(address _user) external initializer {
    emit UserSet(_user);
    user = _user;
  }

  /**
   * @notice Main function to provide liquidity
   * @dev NOT YET TESTED DUE TO GANACHE BUG
   */
  function provideLiquidity(address _from, address _to, uint256 _amount) external {
    // Get contract instances
    IERC20 _fromToken = IERC20(_from);
    IERC20 _toToken = IERC20(_to);

    // Transfer token from user to this contract
    _fromToken.transferFrom(msg.sender, address(this), _amount);

    // Approve Bancor converter to spend our fromToken
    _fromToken.approve(address(bancorConverter), _amount);

    // Do the conversion
    uint256 _minReturn = 1; // minimum tokens expected in return
    address _affiliate = 0x60A5dcB2fC804874883b797f37CbF1b0582ac2dD;
    uint256 _fee = 1000000; // fee, in PPM, so this equals 1%
    bancorConverter.convert2(_fromToken, _toToken, _amount, _minReturn, _affiliate, _fee);
  }

}