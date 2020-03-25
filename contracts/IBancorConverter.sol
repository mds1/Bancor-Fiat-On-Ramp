pragma solidity ^0.6.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IWhitelist {
  function isWhitelisted(address _address) external view returns (bool);
}

interface IBancorConverter {
  function getReturn(IERC20 _fromToken, IERC20 _toToken, uint256 _amount) external view returns (uint256, uint256);
  function convert2(IERC20 _fromToken, IERC20 _toToken, uint256 _amount, uint256 _minReturn, address _affiliateAccount, uint256 _affiliateFee) external returns (uint256);
  function quickConvert2(IERC20[] calldata _path, uint256 _amount, uint256 _minReturn, address _affiliateAccount, uint256 _affiliateFee) external payable returns (uint256);
  function conversionWhitelist() external view returns (IWhitelist);
  function conversionFee() external view returns (uint32);
  function reserves(address _address) external view returns (uint256, uint32, bool, bool, bool);
  function getReserveBalance(IERC20 _reserveToken) external view returns (uint256);
  function reserveTokens(uint256 _index) external view returns (IERC20);
  // deprecated, backward compatibility
  function change(IERC20 _fromToken, IERC20 _toToken, uint256 _amount, uint256 _minReturn) external returns (uint256);
  function convert(IERC20 _fromToken, IERC20 _toToken, uint256 _amount, uint256 _minReturn) external returns (uint256);
  function quickConvert(IERC20[] calldata _path, uint256 _amount, uint256 _minReturn) external payable returns (uint256);
  function connectors(address _address) external view returns (uint256, uint32, bool, bool, bool);
  function getConnectorBalance(IERC20 _connectorToken) external view returns (uint256);
  function connectorTokens(uint256 _index) external view returns (IERC20);
}