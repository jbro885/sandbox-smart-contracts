pragma solidity 0.6.5;


interface ERC677 {
    function transferAndCall(
        address to,
        uint256 value,
        bytes calldata data
    ) external returns (bool success);

    event Transfer(address indexed from, address indexed to, uint256 value, bytes data);
}
