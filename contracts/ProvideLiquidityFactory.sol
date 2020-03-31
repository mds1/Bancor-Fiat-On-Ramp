pragma solidity ^0.6.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/GSN/GSNRecipient.sol";
import "./ProvideLiquidity.sol";

/**
 * @notice This contract is a factory to deploy contract instances for users
 * @dev This is based on EIP 1167: Minimal Proxy Contract. References:
 *   The EIP
 *     - https://eips.ethereum.org/EIPS/eip-1167
 *   Clone Factory repo and projects, included with the associated EIP
 *     - https://github.com/optionality/clone-factory
 *     - https://github.com/optionality/clone-factory/blob/master/contracts/CloneFactory.sol
 *   Open Zeppelin blog post and discussion
 *     - https://blog.openzeppelin.com/deep-dive-into-the-minimal-proxy-contract/
 *     - https://forum.openzeppelin.com/t/deep-dive-into-the-minimal-proxy-contract/1928
 *
 */
contract ProvideLiquidityFactory is Ownable, GSNRecipient {

  // Store list of all users (for convenience)
  address[] public users;

  // Maps user => their contract
  mapping (address => address) public getContract;

  // Emitted when a new proxy is created
  event ProxyCreated(address indexed proxy, address indexed user);

  constructor() public {}

  /**
   * @notice Called to deploy a clone of _target for _user
   * @param _target address of the underlying logic contract to delegate to
   */
  function createContract(address _target) external {
    // Contract user is the user who sent the meta-transaction
    address _user = _msgSender();

    // Define function call to initialize the new ProvideLiquidity contract
    bytes memory _payload = abi.encodeWithSignature("initialize(address)", _user);

    // Deploy proxy
    address _contract = deployMinimal(_target, _payload);
    emit ProxyCreated(_contract, _user);

    // Update state
    users.push(_user);
    getContract[_user] = _contract;
  }

  /**
   * @notice Check if _query address is a clone of _target
   * @dev source: https://github.com/optionality/clone-factory/blob/master/contracts/CloneFactory.sol
   * @param _target address of the underlying logic contract to compare against
   * @param _query address to check
   */
  function isClone(address _target, address _query) external view returns (bool result) {
    bytes20 targetBytes = bytes20(_target);
    assembly {
      let clone := mload(0x40)
      mstore(clone, 0x363d3d373d3d3d363d7300000000000000000000000000000000000000000000)
      mstore(add(clone, 0xa), targetBytes)
      mstore(add(clone, 0x1e), 0x5af43d82803e903d91602b57fd5bf30000000000000000000000000000000000)

      let other := add(clone, 0x40)
      extcodecopy(_query, other, 0, 0x2d)
      result := and(
        eq(mload(clone), mload(other)),
        eq(mload(add(clone, 0xd)), mload(add(other, 0xd)))
      )
    }
  }

  /**
   * @notice Deploys minimal proxy
   * @dev Pulled and modified from OpenZeppelin's ProxyFactory.sol (not using it as a library)
   * because it currently does not support Solidity ^0.6.0
   * Source: https://github.com/OpenZeppelin/openzeppelin-sdk/blob/release/2.8/packages/lib/contracts/upgradeability/ProxyFactory.sol#L18
   */
  function deployMinimal(address _logic, bytes memory _data) public returns (address proxy) {
    // Adapted from https://github.com/optionality/clone-factory/blob/32782f82dfc5a00d103a7e61a17a5dedbd1e8e9d/contracts/CloneFactory.sol
    bytes20 targetBytes = bytes20(_logic);
    assembly {
      let clone := mload(0x40)
      mstore(clone, 0x3d602d80600a3d3981f3363d3d373d3d3d363d73000000000000000000000000)
      mstore(add(clone, 0x14), targetBytes)
      mstore(add(clone, 0x28), 0x5af43d82803e903d91602b57fd5bf30000000000000000000000000000000000)
      proxy := create(0, clone, 0x37)
    }

    if(_data.length > 0) {
      (bool success,) = proxy.call(_data);
      require(success);
    }
  }

  /**
   * @notice Returns list of all user addresses
   */
  function getUsers() external view returns (address[] memory) {
    return users;
  }


  // ===============================================================================================
  //                               Gas Station Network Functions
  // ===============================================================================================

  /**
   * @dev Determine if we should receive a relayed call.
   * There are multiple ways to make this work, including:
   *   - having a whitelist of trusted users
   *   - only accepting calls to an onboarding function
   *   - charging users in tokens (possibly issued by you)
   *   - delegating the acceptance logic off-chain
   * All relayed call requests can be rejected at no cost to the recipient.
   *
   * In this function, we return a number indicating whether we:
   *   - Accept the call: 0, signalled by the call to `_approveRelayedCall()`
   *   - Reject the call: Any other number, signalled by the call to `_rejectRelayedCall(uint256)`
   *
   * We can also return some arbitrary data that will get passed along
   * to the pre and post functions as an execution context.
   *
   * Source: https://docs.openzeppelin.com/contracts/2.x/gsn#_acceptrelayedcall
   */
  function acceptRelayedCall(
    address relay,
    address from,
    bytes calldata encodedFunction,
    uint256 transactionFee,
    uint256 gasPrice,
    uint256 gasLimit,
    uint256 nonce,
    bytes calldata approvalData,
    uint256 maxPossibleCharge
  ) external view override returns (uint256, bytes memory) {
    // Right now we approve all calls
    return _approveRelayedCall();
  }

  /**
   * @dev After call is accepted, but before it's executed, we can use
   * this function to charge the user for their call, perform some
   * bookeeping, etc.
   *
   * This function will inform us of the maximum cost the call may
   * have, and can be used to charge the user in advance. This is
   * useful if the user may spend their allowance as part of the call,
   * so we can lock some funds here.
   *
   * Source: https://docs.openzeppelin.com/contracts/2.x/gsn#_pre_and_postrelayedcall
   */
  function _preRelayedCall(bytes memory context) internal override returns (bytes32) {
  }

  /**
   * @dev After call is accepted and executed, we can use this function
   * to charge the user for their call, perform some bookeeping, etc.
   *
   * This function will give us an accurate estimate of the transaction
   * cost, making it a natural place to charge users. It will also let
   * us know if the relayed call reverted or not. This allows us, for
   * instance, to not charge users for reverted calls - but remember
   * that we will be charged by the relayer nonetheless.
   *
   * Source: https://docs.openzeppelin.com/contracts/2.x/gsn#_pre_and_postrelayedcall
   */
  function _postRelayedCall(bytes memory context, bool, uint256 actualCharge, bytes32)
    internal
    override
  {}

  function setRelayHubAddress() public {
    if(getHubAddr() == address(0)) {
      _upgradeRelayHub(0xD216153c06E857cD7f72665E0aF1d7D82172F494);
    }
  }

  function getRecipientBalance() public view returns (uint) {
    return IRelayHub(getHubAddr()).balanceOf(address(this));
  }

  /**
   * @dev Withdraw funds from RelayHub
   * @param _amount Amount of Ether to withdraw
   * @param _recipient Address to send the Ether to
   */
  function withdrawRelayHubFunds(uint256 _amount, address payable _recipient) external onlyOwner {
    IRelayHub(getHubAddr()).withdraw(_amount, _recipient);
  }

  /**
   * @notice GSN function override
   * @dev https://github.com/OpenZeppelin/openzeppelin-contracts/releases/tag/v3.0.0-beta.0
   */
  function _msgSender() internal view override(Context, GSNRecipient) returns (address payable) {
    return GSNRecipient._msgSender();
  }

  /**
   * @notice GSN function override
   * @dev https://github.com/OpenZeppelin/openzeppelin-contracts/releases/tag/v3.0.0-beta.0
   */
  function _msgData() internal view override(Context, GSNRecipient) returns (bytes memory) {
    return GSNRecipient._msgData();
  }
}
