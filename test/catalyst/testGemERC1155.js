const {ethers, getNamedAccounts, ethereum} = require("@nomiclabs/buidler");
const erc1155Tests = require("../erc1155")(
  async () => {
    const {deployer, others, gemMinter} = await getNamedAccounts();
    await deployments.fixture();
    const contract = await ethers.getContract("Gem");

    let counter = 0;

    // eslint-disable-next-line max-params
    async function mint(user) {
      const tx = await contract.connect(contract.provider.getSigner(gemMinter)).functions.mint(user, 1, 1);
      const receipt = await tx.wait();
      counter++;
      return {receipt, tokenId: receipt.events.find((v) => v.event === "TransferSingle").args[3].toString()};
    }
    return {ethereum, contractAddress: contract.address, users: others, mint, deployer, counter};
  },
  {
    batchTransfer: true,
    mandatoryERC1155Receiver: true,
  }
);

function recurse(test) {
  if (test.subTests) {
    // eslint-disable-next-line mocha/no-setup-in-describe
    describe(test.title, function () {
      // eslint-disable-next-line mocha/no-setup-in-describe
      for (const subTest of test.subTests) {
        // eslint-disable-next-line mocha/no-setup-in-describe
        recurse(subTest);
      }
    });
  } else {
    it(test.title, test.test);
  }
}

describe("Gem:ERC1155", function () {
  for (const test of erc1155Tests) {
    // eslint-disable-next-line mocha/no-setup-in-describe
    recurse(test);
  }
});
