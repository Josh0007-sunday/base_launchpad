import { ethers } from "hardhat";
import hre from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  // Deploy Launchpad
  const Launchpad = await ethers.getContractFactory("Launchpad");
  const launchpad = await Launchpad.deploy();
  await launchpad.waitForDeployment();

  console.log("Launchpad deployed to:", await launchpad.getAddress());

  // Optional: Create a sample collection
  const tx = await launchpad.createCollection(
    "Example Collection",
    "EXMPL",
    1000, // maxSupply
    ethers.parseEther("0.05") // mintPrice
  );
  await tx.wait();

  const collectionAddress = await launchpad.deployedCollections(0);
  console.log("Sample collection deployed to:", collectionAddress);

  // Optional: Verify contracts
  if (process.env.VERIFY_CONTRACTS === "true") {
    console.log("Waiting for 5 block confirmations...");
    await launchpad.deploymentTransaction()?.wait(5);
    
    console.log("Verifying Launchpad...");
    await hre.run("verify:verify", {
      address: await launchpad.getAddress(),
      constructorArguments: [],
    });

    const NFTCollection = await ethers.getContractFactory("NFTCollection");
    console.log("Verifying Sample Collection...");
    await hre.run("verify:verify", {
      address: collectionAddress,
      constructorArguments: [
        "Example Collection",
        "EXMPL",
        1000,
        ethers.parseEther("0.05")
      ],
    });
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
