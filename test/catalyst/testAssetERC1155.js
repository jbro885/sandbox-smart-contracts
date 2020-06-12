const {ethers, getNamedAccounts, ethereum} = require("@nomiclabs/buidler");
const erc1155Tests = require("../erc1155")(
  async () => {
    const {catalystMinter, others} = await getNamedAccounts();

    await deployments.fixture();

    const contract = await ethers.getContract("CatalystMinter");

    await contract.connect(contract.provider.getSigner(catalystMinter)).then((tx) => tx.wait());

    // mint(
    // address from,
    // uint40 packId,
    // bytes32 metadataHash,
    // uint256 catalystId,
    // uint256[] calldata gemIds,
    // uint256 quantity,
    // address to,
    // bytes calldata data
    // )

    // eslint-disable-next-line max-params
    async function mint(from, packId, metadataHash, catalystId, gemIds, quantity, to, data) {
      await waitFor(contract.mint(from, packId, metadataHash, catalystId, gemIds, quantity, to, data));
    }
    return {ethereum, contractAddress: contract.address, users: others, mint};
  },
  {
    batchTransfer: true,
    burn: true,
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
