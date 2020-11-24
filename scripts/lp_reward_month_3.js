const {BigNumber} = require("@ethersproject/bignumber");
const {getNamedAccounts, deployments} = require("@nomiclabs/buidler");
const {execute, log} = deployments;

(async () => {
  const {liquidityRewardAdmin, liquidityRewardProvider} = await getNamedAccounts();
  // Monthly reward 1,500,000 SAND
  const REWARD_AMOUNT = BigNumber.from(1500000).mul("1000000000000000000");
  const REWARD_NAME = "LandWeightedSANDRewardPool";

  const rewardPool = await deployments.get(REWARD_NAME);

  log("transferring SAND reward to the Reward Pool");
  await execute(
    "Sand",
    {from: liquidityRewardProvider, skipUnknownSigner: true, gasLimit: 1000000, log: true},
    "transfer",
    rewardPool.address,
    REWARD_AMOUNT
  );

  log("notifying the Reward Amount");
  await execute(
    REWARD_NAME,
    {from: liquidityRewardAdmin, skipUnknownSigner: true, gasLimit: 1000000, log: true},
    "notifyRewardAmount",
    REWARD_AMOUNT
  );
})();
