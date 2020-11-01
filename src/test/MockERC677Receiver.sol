pragma solidity 0.6.5;
import "../common/interfaces/ERC677Receiver.sol";


contract MockERC677Receiver is ERC677Receiver {
    event onTokenTransferEvent(address indexed _sender, uint256 _value, bytes _data);

    function onTokenTransfer(
        address _sender,
        uint256 _value,
        bytes calldata _data
    ) external override {
        emit onTokenTransferEvent(_sender, _value, _data);
    }
}
