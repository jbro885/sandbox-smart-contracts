pragma solidity 0.6.5;

import "@nomiclabs/buidler/console.sol";


contract OpenSeaMockExchange {
    function atomicMatch_(
        address[14] memory addrs,
        uint256[18] memory uints,
        uint8[8] memory feeMethodsSidesKindsHowToCalls,
        bytes memory calldataBuy,
        bytes memory calldataSell,
        bytes memory replacementPatternBuy,
        bytes memory replacementPatternSell,
        bytes memory staticExtradataBuy,
        bytes memory staticExtradataSell,
        uint8[2] memory vs,
        bytes32[5] memory rssMetadata
    ) public payable {}

    function foo() public {
        uint256 x = 2;
        console.log("hi there");
    }
}
