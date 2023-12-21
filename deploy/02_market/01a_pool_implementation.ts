import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { COMMON_DEPLOY_PARAMS } from "../../helpers/env";
import {
  POOL_ADDRESSES_PROVIDER_ID,
  POOL_IMPL_ID,
} from "../../helpers/deploy-ids";
import { MARKET_NAME } from "../../helpers/env";
import {
  ConfigNames,
  eNetwork,
  getPool,
  getPoolLibraries,
  isL2PoolSupported,
  loadPoolConfig,
  waitForTx,
} from "../../helpers";
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
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  // @zkSync
  const isZkSync = isZkSyncNetwork(hre);
  const zkDeployer = isZkSync ? setupZkDeployer() : null;

  const poolConfig = await loadPoolConfig(MARKET_NAME as ConfigNames);
  const network = (
    process.env.FORK ? process.env.FORK : hre.network.name
  ) as eNetwork;

  const { address: addressesProviderAddress } = await deployments.get(
    POOL_ADDRESSES_PROVIDER_ID
  );

  if (isL2PoolSupported(poolConfig)) {
    console.log(
      `[INFO] Skipped common Pool due current network '${network}' is not supported`
    );
    return;
  }
  const commonLibraries = await getPoolLibraries();
  if (isZkSync && zkDeployer) {
    // Deploy common Pool contract
    // @zlSync TODO: review libraries linking
    const { artifact: poolArtifact, deployedInstance: poolInstance } =
      await deployContract(
        zkDeployer,
        deployments,
        "Pool",
        [addressesProviderAddress],
        POOL_IMPL_ID
        // {
        //   libraries: {
        //     ...commonLibraries,
        //   },
        // }
      );
    // Initialize implementation
    const pool = await getPool(poolInstance.address);
    await waitForTx(await pool.initialize(addressesProviderAddress));
    console.log("Initialized Pool Implementation");
  } else {
    // Deploy common Pool contract
    const poolArtifact = await deploy(POOL_IMPL_ID, {
      contract: "Pool",
      from: deployer,
      args: [addressesProviderAddress],
      libraries: {
        ...commonLibraries,
      },
      ...COMMON_DEPLOY_PARAMS,
    });

    // Initialize implementation
    const pool = await getPool(poolArtifact.address);
    await waitForTx(await pool.initialize(addressesProviderAddress));
    console.log("Initialized Pool Implementation");
  }
};

func.id = "PoolImplementation";
func.tags = ["market"];

export default func;
