pragma solidity ^0.6.0;

interface IBancorFormula {
  function calculateFundCost(
    uint256 _supply,
    uint256 _reserveBalance,
    uint32 _totalRatio,
    uint256 _amount
  ) external returns (uint256);

  function calculateLiquidateReturn(
    uint256 _supply,
    uint256 _reserveBalance,
    uint32 _totalRatio,
    uint256 _amount
  ) external returns (uint256);
}
