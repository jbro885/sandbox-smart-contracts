pragma solidity 0.6.5;

import "../BaseWithStorage/wip/ERC20BaseToken.sol";
import "../BaseWithStorage/ERC20BasicApproveExtension.sol";


contract GemToken is ERC20BasicApproveExtension, ERC20BaseToken {
    function mint(address to, uint256 amount) external onlyAdmin {
        _mint(to, amount);
    }

    function batchBurnFrom(
        address from,
        uint256[] calldata ids,
        uint256[] calldata amounts
    ) external {}

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

    constructor(
        string memory name,
        string memory symbol,
        address admin
    ) public ERC20BaseToken(name, symbol, admin) {}
}
