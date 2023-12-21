import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { COMMON_DEPLOY_PARAMS } from "../../helpers/env";
import {
  POOL_ADDRESSES_PROVIDER_ID,
  POOL_CONFIGURATOR_IMPL_ID,
  RESERVES_SETUP_HELPER_ID,
} from "../../helpers/deploy-ids";
import { getPoolConfiguratorProxy, waitForTx } from "../../helpers";
import {
  setupZkDeployer,
  isZkSyncNetwork,
  deployContract,
} from "../../helpers/utilities/zkDeployer";
import * as hre from "hardhat";

const func: DeployFunction = async function ({
  getNamedAccounts,
  deployments,
}: HardhatRuntimeEnvironment) {
  const { deploy, get } = deployments;
  const { deployer } = await getNamedAccounts();
  // @zkSync
  const isZkSync = isZkSyncNetwork(hre);
  const zkDeployer = isZkSync ? setupZkDeployer() : null;

  const { address: addressesProviderAddress } = await deployments.get(
    POOL_ADDRESSES_PROVIDER_ID
  );

  const configuratorLogicArtifact = await get("ConfiguratorLogic");

  let poolConfiguratorInstance: any;
  if (isZkSync && zkDeployer) {
    // Deploy PoolConfigurator implementation
    ({ deployedInstance: poolConfiguratorInstance } = await deployContract(
      zkDeployer,
      deployments,
      "PoolConfigurator",
      [],
      POOL_CONFIGURATOR_IMPL_ID
    ));
  } else {
    poolConfiguratorInstance = await deploy(POOL_CONFIGURATOR_IMPL_ID, {
      contract: "PoolConfigurator",
      from: deployer,
      args: [],
      libraries: {
        ConfiguratorLogic: configuratorLogicArtifact.address,
      },
      ...COMMON_DEPLOY_PARAMS,
    });
  }

  // Initialize implementation
  const poolConfig = await getPoolConfiguratorProxy(
    poolConfiguratorInstance.address
  );
  await waitForTx(await poolConfig.initialize(addressesProviderAddress));
  console.log("Initialized PoolConfigurator Implementation");

  if (isZkSync && zkDeployer) {
    // Deploy ReservesSetupHelper
    await deployContract(
      zkDeployer,
      deployments,
      "ReservesSetupHelper",
      [],
      RESERVES_SETUP_HELPER_ID
    );
  } else {
    // Deploy ReservesSetupHelper
    await deploy(RESERVES_SETUP_HELPER_ID, {
      from: deployer,
      args: [],
      contract: "ReservesSetupHelper",
    });
  }

  return true;
};

func.id = "PoolConfigurator";
func.tags = ["market"];

export default func;
