const {ethers, getNamedAccounts} = require("@nomiclabs/buidler");
const {BigNumber} = require("@ethersproject/bignumber");
const {expect} = require("local-chai");
const {expectRevert} = require("local-utils");

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
    await tx.wait();
    const tokenReceiverEvents = await tokenReceiver.queryFilter("onTokenTransferEvent");
    let event = tokenReceiverEvents.filter((e) => e.event === "onTokenTransferEvent")[0];
    let fromBalanceAfter = await token.balanceOf(accounts.deployer);
    let toBalanceAfter = await token.balanceOf(tokenReceiver.address);
    expect(event.args[0].toLowerCase()).to.equal(accounts.deployer.toLowerCase());
    expect(event.args[1]).to.equal(amount);
    expect(event.args[2]).to.equal("0x64617461");
    expect(fromBalanceBefore).to.equal(fromBalanceAfter.add(amount));
    expect(toBalanceAfter).to.equal(toBalanceBefore.add(amount));
  });
  it("Transfering tokens to EOA", async function () {
    let {token} = await initContracts("MOCK", "MOCK");
    const accounts = await getNamedAccounts();
    let fromBalanceBefore = await token.balanceOf(accounts.deployer);
    let toBalanceBefore = await token.balanceOf(accounts.others[0]);
    let amount = BigNumber.from("100000000000000000");
    let tx = await token
      .connect(ethers.provider.getSigner(accounts.deployer))
      .transferAndCall(accounts.others[0], amount, Buffer.from("data"));
    await tx.wait();
    let fromBalanceAfter = await token.balanceOf(accounts.deployer);
    let toBalanceAfter = await token.balanceOf(accounts.others[0]);
    expect(fromBalanceBefore).to.equal(fromBalanceAfter.add(amount));
    expect(toBalanceAfter).to.equal(toBalanceBefore.add(amount));
  });
  it("Transfering tokens to a non receiver contract should fail", async function () {
    const accounts = await getNamedAccounts();
    let {token} = await initContracts("MOCK", "MOCK");
    let emptyContract = await initContract("EmptyContract", accounts.deployer, []);
    let toBalanceBefore = await token.balanceOf(emptyContract.address);

    let amount = BigNumber.from("100000000000000000");
    expectRevert(
      token
        .connect(ethers.provider.getSigner(accounts.deployer))
        .transferAndCall(emptyContract.address, amount, Buffer.from("data"))
    );
    let toBalanceAfter = await token.balanceOf(emptyContract.address);
    expect(toBalanceAfter).to.equal(toBalanceBefore);
  });
  it("Transfering tokens to a contract with fallback function should succeed", async function () {
    const accounts = await getNamedAccounts();
    let {token} = await initContracts("MOCK", "MOCK");
    let fallbackContract = await initContract("FallBackContract", accounts.deployer, []);
    let toBalanceBefore = await token.balanceOf(fallbackContract.address);

    let amount = BigNumber.from("100000000000000000");
    expectRevert(
      token
        .connect(ethers.provider.getSigner(accounts.deployer))
        .transferAndCall(fallbackContract.address, amount, Buffer.from("data"))
    );
    let toBalanceAfter = await token.balanceOf(fallbackContract.address);
    expect(toBalanceAfter).to.equal(toBalanceBefore.add(amount));
  });
});
