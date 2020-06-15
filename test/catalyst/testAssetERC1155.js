const {ethers, getNamedAccounts, ethereum} = require("@nomiclabs/buidler");
const {utils} = require("ethers");
const erc1155Tests = require("../erc1155")(
  async () => {
    const {deployer, others} = await getNamedAccounts();
    await deployments.fixture();
    const contract = await ethers.getContract("CatalystMinter");

    let counter = 0;
    const testPackId = 01;
    const testMetadataHash = utils.formatBytes32String("metadataHash");

    // eslint-disable-next-line max-params
    async function mint(user) {
      // TODO give user catalysts and gems
      const tx = await contract
        .connect(contract.provider.getSigner(user))
        .functions.mint(user, testPackId, testMetadataHash, 1, [1, 2, 3], 1, user, "0x");
      const receipt = await tx.wait();
      counter++;
      return {receipt, tokenId: receipt.events.find((v) => v.event === "TransferSingle").args[3].toString()};
    }

    return {ethereum, contractAddress: contract.address, users: others, mint, deployer};
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

describe("Asset:ERC1155", function () {
  for (const test of erc1155Tests) {
    // eslint-disable-next-line mocha/no-setup-in-describe
    recurse(test);
  }
});
