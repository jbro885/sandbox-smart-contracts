pragma solidity 0.6.5;

contract FeeDistributor {
    event Deposit(address, uint256);
    address payable[] public recepients;
    uint256[] public percentages;

    constructor(address payable[] memory _recepients, uint256[] memory _percentages) public {
        recepients = _recepients;
        percentages = _percentages;
    }

    // do we want to have an option to change recepients ?
    // do we want to validate the recepients somehow ? should we call after transfer in case of contract ?

    // does anyone can invoke this function ?
    // function withdrawAll(address token) external {
    //     if (token == address(0)) {
    //         etherWithdrawal();
    //     } else {
    //         tokenWithdrawal(token);
    //     }
    // }

    // // should we care about handling the case of revert by one of the recps?
    // function etherWithdrawal() private{
    //     for (uint256 i = 0; i < recepients.length; i++) {
    //         recepients[i].call.value(0);
    //     }
    // }

    // function tokenWithdrawal(address token) private {
    //     ERC20(token).transfer()
    // }

    function() external payable {
        emit Deposit(msg.sender, msg.value);
    }
}
