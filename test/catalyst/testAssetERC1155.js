const {ethers, getNamedAccounts, ethereum} = require("@nomiclabs/buidler");
const erc1155Tests = require("../erc1155")(
  async () => {
    const {catalystMinter, deployer, others} = await getNamedAccounts();
    await deployments.fixture();
    const contract = await ethers.getContract("CatalystMinter");
    // await contract.connect(contract.provider.getSigner(catalystMinter)).then((tx) => tx.wait());

    let counter = 0;

    // eslint-disable-next-line max-params
    async function mint(from, packId, metadataHash, catalystId, gemIds, quantity, to, data) {
      const tokenId = await contract
        .connect(contract.provider.getSigner(deployer))
        .functions.mint(from, packId, metadataHash, catalystId, gemIds, quantity, to, data);
      const receipt = await tx.wait();
      counter++;
      return {receipt, tokenId};
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
