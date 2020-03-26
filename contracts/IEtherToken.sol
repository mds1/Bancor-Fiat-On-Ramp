pragma solidity ^0.6.0;

interface IEtherToken {
  // General ERC20
  function totalSupply() external view returns (uint256);
  function balanceOf(address account) external view returns (uint256);
  function transfer(address recipient, uint256 amount) external returns (bool);
  function allowance(address owner, address spender) external view returns (uint256);
  function approve(address spender, uint256 amount) external returns (bool);
  function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
  // Ether token specific
  function deposit() external payable;
  function withdraw(uint256 _amount) external;
  function withdrawTo(address _to, uint256 _amount) external;
}
