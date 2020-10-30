pragma solidity 0.6.5;

import "../BaseWithStorage/wip/ERC20BaseToken.sol";
import "../BaseWithStorage/ERC20BasicApproveExtension.sol";
import "../Base/TheSandbox712.sol";
import "../common/interfaces/ERC677.sol";
import "../common/interfaces/ERC677Receiver.sol";


contract GemToken is ERC20BasicApproveExtension, ERC20BaseToken, TheSandbox712, ERC677 {
    mapping(address => uint256) public nonces;

    /// @notice Function to permit the expenditure of SAND by a nominated spender
    /// @param owner the owner of the ERC20 tokens
    /// @param spender the nominated spender of the ERC20 tokens
    /// @param value the value (allowance) of the ERC20 tokens that the nominated spender will be allowed to spend
    /// @param deadline the deadline for granting permission to the spender
    /// @param v the final 1 byte of signature
    /// @param r the first 32 bytes of signature
    /// @param s the second 32 bytes of signature
    function permit(
        address owner,
        address spender,
        uint256 value,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) public {
        require(deadline >= block.timestamp, "PAST_DEADLINE");
        bytes32 digest = keccak256(
            abi.encodePacked("\x19\x01", domainSeparator(), keccak256(abi.encode(PERMIT_TYPEHASH, owner, spender, value, nonces[owner]++, deadline)))
        );
        address recoveredAddress = ecrecover(digest, v, r, s);
        require(recoveredAddress != address(0) && recoveredAddress == owner, "INVALID_SIGNATURE");
        _approveFor(owner, spender, value);
    }

    function mint(address to, uint256 amount) external onlyAdmin {
        _mint(to, amount);
    }

    function batchBurnFrom(
        address from,
        uint256[] calldata ids,
        uint256[] calldata amounts
    ) external {}

    /**
     * @dev transfer token to a contract address with additional data if the recipient is a contact.
     * @param _to The address to transfer to.
     * @param _value The amount to be transferred.
     * @param _data The extra data to be passed to the receiving contract.
     */
    function transferAndCall(
        address _to,
        uint256 _value,
        bytes calldata _data
    ) external override returns (bool success) {
        _transfer(msg.sender, _to, _value);
        emit Transfer(msg.sender, _to, _value, _data);
        if (isContract(_to)) {
            ERC677Receiver receiver = ERC677Receiver(_to);
            receiver.onTokenTransfer(msg.sender, _value, _data);
        }
        return true;
    }

    // //////////////////// INTERNALS ////////////////////

    function _addAllowanceIfNeeded(
        address owner,
        address spender,
        uint256 amountNeeded
    ) internal override(ERC20BasicApproveExtension, ERC20BaseToken) {
        ERC20BaseToken._addAllowanceIfNeeded(owner, spender, amountNeeded);
    }

    function _approveFor(
        address owner,
        address spender,
        uint256 amount
    ) internal override(ERC20BasicApproveExtension, ERC20BaseToken) {
        ERC20BaseToken._approveFor(owner, spender, amount);
    }

    function isContract(address _addr) private view returns (bool hasCode) {
        uint256 length;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            length := extcodesize(_addr)
        }
        return length > 0;
    }

    // //////////////////////// DATA /////////////////////
    bytes32 constant PERMIT_TYPEHASH = keccak256("Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)");

    // /////////////////// CONSTRUCTOR ////////////////////
    constructor(
        string memory name,
        string memory symbol,
        address admin
    ) public ERC20BaseToken(name, symbol, admin) {}
}
