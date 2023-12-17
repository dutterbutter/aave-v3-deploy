import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { setupZkDeployer, deployContract } from "../../helpers/utilities/zkDeployer";
import { waitForTx } from "../../helpers/utilities/tx";
import * as hre from "hardhat";
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
  const { save } = deployments;
  // Set up zkSync Deployer
  const zkDeployer = setupZkDeployer();

  // Deploy PoolAddressesProviderRegistry
  // Save the deployment to the deployments folder
  const { artifact: registryArtifact, deployedInstance: registryInstance } = await deployContract(
    zkDeployer,
    deployments,
    "PoolAddressesProviderRegistry",
    [deployerAddress],
    "PoolAddressesProviderRegistry"
  );

  const registryContract = new ethers.Contract(
    registryInstance.address,
    registryArtifact.abi,
    zkDeployer.zkWallet
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
