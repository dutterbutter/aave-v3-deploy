import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { PoolAddressesProviderRegistry } from "../../typechain";
import { waitForTx } from "../../helpers/utilities/tx";
import { COMMON_DEPLOY_PARAMS } from "../../helpers/env";
import { setupZkDeployer, deployContract, isZkSyncNetwork } from "../../helpers/utilities/zkDeployer";
import * as hre from "hardhat";

const func: DeployFunction = async function ({
  getNamedAccounts,
  deployments,
  ethers,
}: HardhatRuntimeEnvironment) {
  const { deploy } = deployments;
  const { deployer, addressesProviderRegistryOwner } = await getNamedAccounts();

  if (isZkSyncNetwork(hre)) {
    const zkDeployer = setupZkDeployer();

    // Deploy PoolAddressesProviderRegistry
    // Save the deployment to the deployments folder
    const { artifact: registryArtifact, deployedInstance: registryInstance } = await deployContract(
      zkDeployer,
      deployments,
      "PoolAddressesProviderRegistry",
      [zkDeployer.zkWallet.address],
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
  } else {
    const poolAddressesProviderRegistryArtifact = await deploy(
      "PoolAddressesProviderRegistry",
      {
        from: deployer,
        args: [deployer],
        ...COMMON_DEPLOY_PARAMS,
      }
    );
  
    const registryInstance = (
      (await hre.ethers.getContractAt(
        poolAddressesProviderRegistryArtifact.abi,
        poolAddressesProviderRegistryArtifact.address
      )) as PoolAddressesProviderRegistry
    ).connect(await hre.ethers.getSigner(deployer));
  
    await waitForTx(
      await registryInstance.transferOwnership(addressesProviderRegistryOwner)
    );
  
    deployments.log(
      `[Deployment] Transferred ownership of PoolAddressesProviderRegistry to: ${addressesProviderRegistryOwner} `
    );
  }
  
  return true;
};

func.id = "PoolAddressesProviderRegistry";
func.tags = ["core", "registry"];

export default func;
