import { Deployer } from "@matterlabs/hardhat-zksync-deploy";
import { Wallet, Provider } from "zksync-web3";
import { DeploymentsExtension } from "hardhat-deploy/types";
const fs = require("fs").promises;
const path = require("path");
import * as hre from "hardhat";
import { HardhatRuntimeEnvironment } from "hardhat/types";
require("dotenv").config();

/**
 * Determines if the current network is zkSync.
 * @param {HardhatRuntimeEnvironment} hre - The Hardhat Runtime Environment.
 * @returns {boolean} - True if the network is zkSync, false otherwise.
 */
export function isZkSyncNetwork(hre: HardhatRuntimeEnvironment): boolean {
    return hre.network.name.includes('zkSync');
}

/**
 * Sets up and returns a zkSync Deployer instance.
 * @returns {Deployer} zkDeployer instance.
 */
// @zkSync: TODO: update to make URL configurable
export function setupZkDeployer(): Deployer {
  const walletKey = process.env.LOCAL_PRIVATE_KEY || "";
  const provider = new Provider(`http://127.0.0.1:8011`);
  const deployerWallet = new Wallet(walletKey, provider);
  return new Deployer(hre, deployerWallet);
}

/**
 * Loads an artifact and deploys it, then saves the deployment information.
 *
 * @param {Deployer} zkDeployer - The zkSync Deployer instance.
 * @param {DeploymentsExtension} deployments - The deployments extension from Hardhat.
 * @param {string} artifactName - The name of the contract artifact.
 * @param {Array<any>} constructorArgs - Arguments for the contract constructor.
 * @param {string} saveName - The name under which to save the deployment.
 * @returns {Promise<{ artifact: any, deployedInstance: any }>} An object containing the artifact and the deployed contract instance.
 */
export async function deployContract(
  zkDeployer: Deployer,
  deployments: DeploymentsExtension,
  artifactName: string,
  constructorArgs: Array<any> = [],
  saveName: string
): Promise<{ artifact: any; deployedInstance: any }> {
  const artifact = await zkDeployer.loadArtifact(artifactName);
  const deployedInstance = await zkDeployer.deploy(artifact, constructorArgs);

  console.info(
    "Deployed",
    artifactName,
    "at: ",
    deployedInstance.address,
    "\n"
  );

  // Save the deployment information
  await deployments.save(saveName, {
    abi: artifact.abi,
    address: deployedInstance.address,
  });

  return { artifact, deployedInstance };
}

/**
 * Retrieves the ABI for a given contract.
 * @param {string} contractName - The name of the contract.
 * @returns {Promise<any>} - The ABI of the contract.
 */
export async function getContractABI(contractName: string) {
  const artifactsDir =
    "artifacts-zk/@aave/core-v3/contracts/protocol/libraries/logic";
  const artifactPath = path.join(
    artifactsDir,
    `${contractName}.sol`,
    `${contractName}.json`
  );

  try {
    const data = await fs.readFile(artifactPath, "utf-8");
    const artifact = JSON.parse(data);
    return artifact.abi;
  } catch (error) {
    console.error("Error reading ABI:", error);
    throw error;
  }
}

/**
 * Retrieves the contract address from the Hardhat configuration.
 * @param {HardhatRuntimeEnvironment} hre - The Hardhat Runtime Environment.
 * @param {string} contractName - The name of the contract.
 * @returns {string | undefined} - The address of the contract, or undefined if not found.
 */
export function getContractAddress(hre: HardhatRuntimeEnvironment, contractName: string): string | undefined {
    // Accessing the libraries directly from the Hardhat config
    const libraries = hre.config.zksolc?.settings?.libraries;
  
    // Construct the contract path
    const contractPath = `@aave/core-v3/contracts/protocol/libraries/logic/${contractName}.sol`;
  
    // Return the address if it exists, otherwise undefined
    return libraries?.[contractPath]?.[contractName];
}
