pragma solidity ^0.6.0;

interface IBancorConverter {
  function fund(uint256 _amount) external;
  function liquidate(uint256 _amount) external;
}
