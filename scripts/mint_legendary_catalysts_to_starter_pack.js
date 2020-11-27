const {getNamedAccounts, deployments} = require("@nomiclabs/buidler");
const {execute} = deployments;

const LEGENDARY = 3;

(async () => {
  const starterPack = await deployments.get("StarterPackV1");
  const {catalystMinter} = await getNamedAccounts();
  await execute(
    "Catalyst",
    {from: catalystMinter, skipUnknownSigner: true, log: true},
    "mint",
    starterPack.address,
    LEGENDARY,
    100
  );
})();
