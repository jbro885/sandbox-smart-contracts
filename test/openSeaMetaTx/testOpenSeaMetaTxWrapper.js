const {ethers, deployments, getNamedAccounts} = require("@nomiclabs/buidler");
const {BigNumber} = require("@ethersproject/bignumber");
const {expect} = require("local-chai");
const {expectRevert, zeroAddress} = require("local-utils");
const {signTypedData_v4, TypedDataUtils} = require("eth-sig-util");
const {bufferToHex, keccak256} = require("ethereumjs-util");

let dummyTrustedForwarder;
let signers;
describe("OpenSeaMetaTxWrapper", function () {
  beforeEach(async function () {
    signers = await ethers.getSigners();
    dummyTrustedforwarder = signers[11];
  });
  async function initContracts() {
    const {deployer} = await getNamedAccounts();
    let ethersFactory = await ethers.getContractFactory("OpenSeaMockExchange", deployer);
    let openSeaMockExchange = await ethersFactory.deploy();
    ethersFactory = await ethers.getContractFactory("Forwarder", deployer);
    ethersFactory = await ethers.getContractFactory("MetaTxWrapper", deployer);
    let metaTxWrapper = await ethersFactory.deploy(dummyTrustedForwarder, openSeaMockExchange.address);
    return {openSeaMockExchange, metaTxWrapper};
  }

  it("", async function () {
    const eip712Domain = {
      name: "EIP712Domain",
      fields: [
        {name: "name", type: "string"},
        {name: "version", type: "string"},
        {name: "chainId", type: "uint256"},
        {name: "verifyingContract", type: "address"},
      ],
    };

    const eip712Order = {
      name: "Order",
      fields: [
        {name: "registry", type: "address"},
        {name: "maker", type: "address"},
        {name: "staticTarget", type: "address"},
        {name: "staticSelector", type: "bytes4"},
        {name: "staticExtradata", type: "bytes"},
        {name: "maximumFill", type: "uint256"},
        {name: "listingTime", type: "uint256"},
        {name: "expirationTime", type: "uint256"},
        {name: "salt", type: "uint256"},
      ],
    };
    let exchangeAddress = "0x0000000000000000000000000000000000000000";
    let x = {
      types: {
        EIP712Domain: eip712Domain.fields,
        Order: eip712Order.fields,
      },
      domain: {
        name: "Wyvern Exchange",
        version: "3.1",
        chainId: 50,
        verifyingContract: exchangeAddress,
      },
      primaryType: "Order",
      message: order,
    };
  });
  it.skip("test real forwarder", async function () {
    const GENERIC_PARAMS = "address from,address to,uint256 value,uint256 gas,uint256 nonce,bytes data";
    let typeName = `ForwardRequest(${GENERIC_PARAMS})`;
    let typeHash = bufferToHex(keccak256(typeName));
    //
    // let tx = await forwarder.connect(ethers.provider.getSigner(others[0])).registerRequestType("TestCall", "");

    await forwarder.registerRequestType("TestCall", "");
    const EIP712DomainType = [
      {name: "name", type: "string"},
      {name: "version", type: "string"},
      {name: "chainId", type: "uint256"},
      {name: "verifyingContract", type: "address"},
    ];

    const ForwardRequestType = [
      {name: "from", type: "address"},
      {name: "to", type: "address"},
      {name: "value", type: "uint256"},
      {name: "gas", type: "uint256"},
      {name: "nonce", type: "uint256"},
      {name: "data", type: "bytes"},
    ];

    let data = {
      domain: {
        name: "Test Domain",
        version: "1",
        chainId: 1234,
        verifyingContract: forwarder.address,
      },
      primaryType: "ForwardRequest",
      types: {
        EIP712Domain: EIP712DomainType,
        ForwardRequest: ForwardRequestType,
      },
      message: {},
    };
    const req1 = {
      to: metaTxWrapper.address,
      data: "0x",
      value: "0",
      from: signer,
      nonce: 0,
      gas: 1e6,
    };
    const sig = signTypedData_v4(signer, {
      data: {...data, message: req1},
    });
    const domainSeparator = TypedDataUtils.hashStruct("EIP712Domain", data.domain, data.types);
    await forwarder.execute(req1, bufferToHex(domainSeparator), typeHash, "0x", sig);
  });
});
