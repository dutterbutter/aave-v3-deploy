import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Deployer } from "@matterlabs/hardhat-zksync-deploy";
import { Wallet, Provider } from "zksync-web3";
import { waitForTx } from "../../helpers/utilities/tx";
import * as hre from "hardhat";
require("dotenv").config();

const wallet_key = process.env.LOCAL_PRIVATE_KEY || "";
// @zkSync: This correctly deploys and transfers ownership of the registry contract
// TODO: Abstract out the deployer wallet and zkDeployer into a helper function
// TODO: Merge this with the deploy/00_core/00_markets_registry.ts file
const func: DeployFunction = async function ({
  getNamedAccounts,
  deployments,
  ethers,
}: HardhatRuntimeEnvironment) {
  const { deployer: deployerAddress, addressesProviderRegistryOwner } =
    await getNamedAccounts();
  // Set up deployer wallet
  const provider = new Provider(`http://127.0.0.1:8011`);
  const deployerWallet = new Wallet(wallet_key, provider);
  const zkDeployer = new Deployer(hre, deployerWallet);

  const registryArtifact = await zkDeployer.loadArtifact(
    "PoolAddressesProviderRegistry"
  );
  const registryInstance = await zkDeployer.deploy(registryArtifact, [
    deployerAddress,
  ]);

  const registryContract = new ethers.Contract(
    registryInstance.address,
    registryArtifact.abi,
    deployerWallet
  );

  await waitForTx(
    await registryContract.transferOwnership(addressesProviderRegistryOwner)
  );

  deployments.log(
    `[Deployment] Transferred ownership of PoolAddressesProviderRegistry to: ${addressesProviderRegistryOwner} `
  );

  return true;
};

func.id = "PoolAddressesProviderRegistry";
func.tags = ["core", "registry"];

export default func;
