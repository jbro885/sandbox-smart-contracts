// const {assert} = require("local-chai");
const ethers = require("ethers");
// const {expectRevert, zeroAddress, emptyBytes} = require("local-utils");
const {Contract, ContractFactory} = ethers;
const {Web3Provider} = ethers.providers;

const erc1155ABI = [];

const receiver = [];

const nonReceiving = [];

const mandatoryReceiver = [];

module.exports = (init, extensions) => {
  const tests = [];

  function preTest(test) {
    return async () => {
      const {ethereum, contractAddress, mint, deployer, users} = await init();
      const ethersProvider = new Web3Provider(ethereum);
      const mandatoryReceiverFactory = new ContractFactory(
        mandatoryReceiver.abi,
        mandatoryReceiver.bytecode,
        ethersProvider.getSigner(deployer)
      );
      const receiverFactory = new ContractFactory(receiver.abi, receiver.bytecode, ethersProvider.getSigner(deployer));
      const nonReceivingFactory = new ContractFactory(
        nonReceiving.abi,
        nonReceiving.bytecode,
        ethersProvider.getSigner(deployer)
      );

      function deployMandatoryERC1155TokenReceiver(...args) {
        return mandatoryReceiverFactory.deploy(...args);
      }
      function deployNonReceivingContract(...args) {
        return nonReceivingFactory.deploy(...args);
      }
      function deployERC1155TokenReceiver(...args) {
        return receiverFactory.deploy(...args);
      }

      const contract = new Contract(contractAddress, erc1155ABI, ethersProvider);
      const owner = users[0];
      const user0 = users[1];
      const user1 = users[2];
      const user2 = users[3];
      const tokenIds = [];
      for (let i = 0; i < 3; i++) {
        const {tokenId} = await mint(owner);
        tokenIds.push(tokenId);
      }
      const contractAsOwner = contract.connect(ethersProvider.getSigner(owner));
      const contractAsUser0 = contract.connect(ethersProvider.getSigner(user0));
      const contractAsUser1 = contract.connect(ethersProvider.getSigner(user1));
      const contractAsUser2 = contract.connect(ethersProvider.getSigner(user2));
      return test({
        deployMandatoryERC1155TokenReceiver,
        deployNonReceivingContract,
        deployERC1155TokenReceiver,
        contract,
        contractAsOwner,
        mint,
        contractAsUser0,
        contractAsUser1,
        contractAsUser2,
        owner,
        user0,
        user1,
        user2,
        tokenIds,
      });
    };
  }

  function describe(title, func) {
    const subTests = [];
    func((title, test) => {
      subTests.push({title, test: preTest(test)});
    });
    tests.push({title, subTests});
  }

  // add tests
  describe("example", function (it) {});

  return tests;
};
