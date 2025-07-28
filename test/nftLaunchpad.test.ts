import { expect } from "chai";
import { ethers } from "hardhat";
import type { Signer } from "ethers";
import { 
  Launchpad,
  NFTCollection,
  Launchpad__factory,
  NFTCollection__factory
} from "../typechain-types";

describe("NFT Launchpad", function () {
  let launchpad: Launchpad;
  let nftCollection: NFTCollection;
  let owner: Signer;
  let creator1: Signer;
  let creator2: Signer;
  let buyer: Signer;

  before(async function () {
    [owner, creator1, creator2, buyer] = await ethers.getSigners();

    // Deploy Launchpad
    const LaunchpadFactory = (await ethers.getContractFactory("Launchpad")) as Launchpad__factory;
    launchpad = await LaunchpadFactory.deploy();
    await launchpad.waitForDeployment();

    // Create test collections
    const tx1 = await launchpad.connect(creator1).createCollection(
      "Test Collection 1",
      "TEST1",
      100,
      ethers.parseEther("0.01")
    );
    await tx1.wait();

    const tx2 = await launchpad.connect(creator2).createCollection(
      "Test Collection 2",
      "TEST2",
      200,
      ethers.parseEther("0.02")
    );
    await tx2.wait();
  });

  describe("Launchpad Deployment", function () {
    it("Should deploy successfully", async function () {
      expect(await launchpad.getAddress()).to.be.properAddress;
    });

    it("Should track created collections", async function () {
      const count = await launchpad.getCollectionsCount();
      expect(count).to.equal(2);
    });
  });

  describe("Collection Creation", function () {
    it("Should allow anyone to create collections", async function () {
      const initialCount = await launchpad.getCollectionsCount();
      const [, , , newCreator] = await ethers.getSigners();
      
      await launchpad.connect(newCreator).createCollection(
        "New Collection",
        "NEW",
        50,
        ethers.parseEther("0.05")
      );

      expect(await launchpad.getCollectionsCount()).to.equal(initialCount + 1n);
    });

    it("Should track creator addresses", async function () {
      const collectionAddr = await launchpad.deployedCollections(0);
      const collection = (await ethers.getContractFactory("NFTCollection")).attach(collectionAddr) as NFTCollection;
      
      expect(await collection.creator()).to.equal(await creator1.getAddress());
    });
  });

  describe("NFT Functionality", function () {
    beforeEach(async function () {
      const collectionAddr = await launchpad.deployedCollections(0);
      nftCollection = (await ethers.getContractFactory("NFTCollection")).attach(collectionAddr) as NFTCollection;
    });

    it("Should mint NFTs correctly", async function () {
      await expect(
        nftCollection.connect(buyer).mint(await buyer.getAddress(), {
          value: ethers.parseEther("0.01")
        }))
        .to.emit(nftCollection, "Transfer");
    });

    it("Should enforce max supply", async function () {
      // Mint remaining NFTs (99 more since 1 was already minted in previous test)
      for (let i = 0; i < 99; i++) {
        await nftCollection.connect(buyer).mint(await buyer.getAddress(), {
          value: ethers.parseEther("0.01")
        });
      }
      
      await expect(
        nftCollection.connect(buyer).mint(await buyer.getAddress(), {
          value: ethers.parseEther("0.01")
        })
      ).to.be.revertedWith("Max supply reached");
    });
  });
});