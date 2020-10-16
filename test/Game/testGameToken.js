const {ethers, getNamedAccounts, deployments} = require("@nomiclabs/buidler");
const {assert, expect} = require("local-chai");
const {expectRevert, emptyBytes, waitFor} = require("local-utils");
const {findEvents} = require("../../lib/findEvents.js");
const {setupTest} = require("./fixtures");
const {execute} = deployments;

let assetAdmin;
let assetBouncerAdmin;
let userWithAssets;
let id;

const dummyHash = "0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF";
const packId = 0;
const supply = 4;
const rarity = 3;

async function supplyAssets(creator) {
  await execute("Asset", {from: assetBouncerAdmin, skipUnknownSigner: true}, "setBouncer", assetAdmin, true);
  // mint some assets to a user who can then create a GAME token with assets:
  const receipt = await execute(
    "Asset",
    {from: assetAdmin, skipUnknownSigner: true},
    "mint",
    creator.address,
    packId,
    dummyHash,
    supply,
    rarity,
    creator.address,
    emptyBytes
  );
  return {receipt};
}

describe("GameToken", function () {
  before(async function () {
    ({assetAdmin, assetBouncerAdmin, others} = await getNamedAccounts());
    const {userWithSAND} = await setupTest();
    const {receipt} = await supplyAssets(userWithSAND);
    userWithAssets = userWithSAND;
    const assetContract = await ethers.getContract("Asset");
    const transferEvents = await findEvents(assetContract, "TransferSingle", receipt.blockHash);
    id = transferEvents[0].args[3];
  });

  describe("GameToken: Minting GAMEs - Without Assets", function () {
    let gameId;

    describe("GameToken: With Minter", function () {
      let gameToken;
      let gameTokenAsAdmin;
      let users;
      let minterGameId;

      before(async function () {
        ({gameToken, gameTokenAsAdmin, users} = await setupTest());
      });

      // @review finish test !
      it("minter can create GAMEs when _minter is set", async function () {
        await gameTokenAsAdmin.setMinter(users[3].address);
        const Minter = users[3];
        const minterReceipt = Minter.Game.createGame(users[3].address, users[4].address, [], []);
        newGameEvents = await findEvents(gameToken, "NewGame", minterReceipt.blockHash);
        const minterGameId = newGameEvents[0].args[0];
      });

      it("reverts if non-minter trys to mint Game when _minter set", async function () {
        await expectRevert(gameToken.createGame(users[2].address, users[2].address, [], []), "INVALID_MINTER");
      });
    });

    describe("GameToken: No Minter", function () {});

    // @review finish test. Add testing for proper transfer of asset ownership, linking of game token and asset id's, all event args, etc...
    it("by default anyone can mint Games", async function () {
      const {gameToken, GameOwner} = await setupTest();
      const receipt = await waitFor(GameOwner.Game.createGame(GameOwner.address, GameOwner.address, [], []));
      newGameEvents = await findEvents(gameToken, "NewGame", receipt.blockHash);
      gameId = newGameEvents[0].args[0];
    });
  });

  describe("GameToken: Modifying GAMEs", function () {
    let gameToken;
    let GameOwner;
    let GameEditor1;
    let GameEditor2;
    let users;
    let gameId;

    before(async function () {
      ({gameToken, GameOwner, GameEditor1, GameEditor2, users} = await setupTest());
      const receipt = await waitFor(GameOwner.Game.createGame(GameOwner.address, GameOwner.address, [], []));
      newGameEvents = await findEvents(gameToken, "NewGame", receipt.blockHash);
      gameId = newGameEvents[0].args[0];
    });

    it("should allow the owner to add game editors", async function () {
      await GameOwner.Game.setGameEditor(gameId, GameEditor1.address, true);
      await GameOwner.Game.setGameEditor(gameId, GameEditor2.address, true);
      const isEditor1 = await gameToken.isGameEditor(gameId, GameEditor1.address);
      const isEditor2 = await gameToken.isGameEditor(gameId, GameEditor2.address);
      assert.ok(isEditor1);
      assert.ok(isEditor2);
    });
    it("should allow the owner to remove game editors", async function () {
      await GameOwner.Game.setGameEditor(gameId, GameEditor1.address, false);
      await GameOwner.Game.setGameEditor(gameId, GameEditor2.address, false);
      const isEditor1 = await gameToken.isGameEditor(gameId, GameEditor1.address);
      const isEditor2 = await gameToken.isGameEditor(gameId, GameEditor2.address);
      assert.notOk(isEditor1);
      assert.notOk(isEditor2);
    });

    it("should revert if non-owner trys to set Game Editors", async function () {
      const editor = users[1];
      await expectRevert(gameToken.setGameEditor(42, editor.address, false), "EDITOR_ACCESS_DENIED");
    });

    it.skip("Owner can add single Asset", async function () {
      await GameOwner.Game.addSingleAsset();
    });

    it.skip("Owner can add multiple Assets", async function () {
      await GameOwner.Game.addMultipleAssets();
    });

    it.skip("Owner can remove single Asset", async function () {
      await GameOwner.Game.removeSingleAsset();
    });

    it.skip("Owner can remove multiple Assets", async function () {
      await GameOwner.Game.removeMultipleAssets();
    });

    it.skip("Editor can add single Asset", async function () {
      await GameEditor1.Game.addSingleAsset();
    });

    it.skip("Editor can add multiple Assets", async function () {
      await GameEditor1.Game.addMultipleAssets();
    });

    it.skip("Editor can remove single Asset", async function () {
      await GameEditor1.Game.removeSingleAsset();
    });

    it.skip("Editor can remove multiple Assets", async function () {
      await GameEditor1.Game.removeSingleAsset();
    });
  });

  describe("GameToken: MetaData", function () {
    let gameToken;
    let gameId;
    let GameOwner;
    let GameEditor1;

    before(async function () {
      ({gameToken, GameOwner, GameEditor1} = await setupTest());
      const receipt = await waitFor(GameOwner.Game.createGame(GameOwner.address, GameOwner.address, [], []));
      newGameEvents = await findEvents(gameToken, "NewGame", receipt.blockHash);
      gameId = newGameEvents[0].args[0];
      await GameOwner.Game.setGameEditor(gameId, GameEditor1.address, true);
    });

    it("can get the ERC721 token contract name", async function () {
      const name = await gameToken.name();
      expect(name).to.be.equal("Sandbox's GAMEs");
    });

    it("can get the ERC721 token contract symbol", async function () {
      const symbol = await gameToken.symbol();
      expect(symbol).to.be.equal("GAME");
    });

    // @review contract level URI vs game-level URI
    it("GAME owner can set the tokenURI", async function () {
      await GameOwner.Game.setTokenURI(gameId, "Hello World");
      const URI = await gameToken.tokenURI(gameId);
      expect(URI).to.be.equal("Hello World");
    });

    it("GAME editors can set the tokenURI", async function () {
      await GameEditor1.Game.setTokenURI(gameId, "Hello Sandbox");
      const URI = await gameToken.tokenURI(gameId);
      expect(URI).to.be.equal("Hello Sandbox");
    });

    it("should revert if ownerOf == address(0)", async function () {
      const {gameToken} = await setupTest();
      await expectRevert(gameToken.tokenURI(11), "Id does not exist");
    });

    it("should revert if not ownerOf or gameEditor", async function () {
      const {gameToken} = await setupTest();
      await expectRevert(gameToken.setTokenURI(11, "New URI"), "URI_ACCESS_DENIED");
    });
  });
});