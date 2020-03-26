pragma solidity ^0.6.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IBancorNetwork {
  function convert2(
    IERC20[] calldata _path,
    uint256 _amount,
    uint256 _minReturn,
    address _affiliateAccount,
    uint256 _affiliateFee
  ) external payable returns (uint256);

  function claimAndConvert2(
    IERC20[] calldata _path,
    uint256 _amount,
    uint256 _minReturn,
    address _affiliateAccount,
    uint256 _affiliateFee
  ) external returns (uint256);

  function convertFor2(
    IERC20[] calldata _path,
    uint256 _amount,
    uint256 _minReturn,
    address _for,
    address _affiliateAccount,
    uint256 _affiliateFee
  ) external payable returns (uint256);

  function claimAndConvertFor2(
    IERC20[] calldata _path,
    uint256 _amount,
    uint256 _minReturn,
    address _for,
    address _affiliateAccount,
    uint256 _affiliateFee
  ) external returns (uint256);

  function convertForPrioritized4(
    IERC20[] calldata _path,
    uint256 _amount,
    uint256 _minReturn,
    address _for,
    uint256[] calldata _signature,
    address _affiliateAccount,
    uint256 _affiliateFee
  ) external payable returns (uint256);

  // deprecated, backward compatibility
  function convert(
    IERC20[] calldata _path,
    uint256 _amount,
    uint256 _minReturn
  ) external payable returns (uint256);

  // deprecated, backward compatibility
  function claimAndConvert(
    IERC20[] calldata _path,
    uint256 _amount,
    uint256 _minReturn
  ) external returns (uint256);

  // deprecated, backward compatibility
  function convertFor(
    IERC20[] calldata _path,
    uint256 _amount,
    uint256 _minReturn,
    address _for
  ) external payable returns (uint256);

  // deprecated, backward compatibility
  function claimAndConvertFor(
    IERC20[] calldata _path,
    uint256 _amount,
    uint256 _minReturn,
    address _for
  ) external returns (uint256);

  // deprecated, backward compatibility
  function convertForPrioritized3(
    IERC20[] calldata _path,
    uint256 _amount,
    uint256 _minReturn,
    address _for,
    uint256 _customVal,
    uint256 _block,
    uint8 _v,
    bytes32 _r,
    bytes32 _s
  ) external payable returns (uint256);

  // deprecated, backward compatibility
  function convertForPrioritized2(
    IERC20[] calldata _path,
    uint256 _amount,
    uint256 _minReturn,
    address _for,
    uint256 _block,
    uint8 _v,
    bytes32 _r,
    bytes32 _s
  ) external payable returns (uint256);

  // deprecated, backward compatibility
  function convertForPrioritized(
    IERC20[] calldata _path,
    uint256 _amount,
    uint256 _minReturn,
    address _for,
    uint256 _block,
    uint256 _nonce,
    uint8 _v,
    bytes32 _r,
    bytes32 _s
  ) external payable returns (uint256);

}
