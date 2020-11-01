const {ethers, getNamedAccounts} = require("@nomiclabs/buidler");
const {BigNumber} = require("@ethersproject/bignumber");
const {expect} = require("local-chai");
const {zeroAddress, expectRevert} = require("local-utils");

describe("ERC677Token", function () {
  async function initContracts(name, symbol) {
    const accounts = await getNamedAccounts();
    let token = await initContract("ERC20Token", accounts.deployer, [name, symbol, accounts.deployer]);
    let tokenReceiver = await initContract("MockERC677Receiver", accounts.deployer, []);
    let tx = await token
      .connect(ethers.provider.getSigner(accounts.deployer))
      .mint(accounts.deployer, BigNumber.from("800000000000000000"));
    await tx.wait();
    return {token, tokenReceiver};
  }

  async function initContract(contractName, deployer, params) {
    const ethersFactory = await ethers.getContractFactory(contractName, deployer);
    let contractRef = await ethersFactory.deploy(...params);
    return contractRef;
  }

  it("Transfering tokens to ERC677Receiver contract should emit an onTokenTransferEvent", async function () {
    let {token, tokenReceiver} = await initContracts("MOCK", "MOCK");
    const accounts = await getNamedAccounts();
    let fromBalanceBefore = await token.balanceOf(accounts.deployer);
    let toBalanceBefore = await token.balanceOf(tokenReceiver.address);
    let amount = BigNumber.from("100000000000000000");
    let tx = await token
      .connect(ethers.provider.getSigner(accounts.deployer))
      .transferAndCall(tokenReceiver.address, amount, Buffer.from("data"));
    let receipt = await tx.wait();
    let fromBalanceAfter = await token.balanceOf(accounts.deployer);
    let toBalanceAfter = await token.balanceOf(tokenReceiver.address);
    expect(fromBalanceBefore).to.equal(fromBalanceAfter.add(amount));
    expect(toBalanceAfter).to.equal(toBalanceBefore.add(amount));
  });
  it("Transfering tokens to EOA should not emit an onTokenTransferEvent", async function () {
    let {token} = await initContracts("MOCK", "MOCK");
    const accounts = await getNamedAccounts();
    let fromBalanceBefore = await token.balanceOf(accounts.deployer);
    let toBalanceBefore = await token.balanceOf(accounts.others[0]);
    let amount = BigNumber.from("100000000000000000");
    let tx = await token
      .connect(ethers.provider.getSigner(accounts.deployer))
      .transferAndCall(accounts.others[0], amount, Buffer.from("data"));
    let receipt = await tx.wait();
    let fromBalanceAfter = await token.balanceOf(accounts.deployer);
    let toBalanceAfter = await token.balanceOf(accounts.others[0]);
    expect(fromBalanceBefore).to.equal(fromBalanceAfter.add(amount));
    expect(toBalanceAfter).to.equal(toBalanceBefore.add(amount));
  });
});
