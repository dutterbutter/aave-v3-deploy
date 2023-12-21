import { getPool, getPoolLibraries } from "../../helpers/contract-getters";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { COMMON_DEPLOY_PARAMS } from "../../helpers/env";
import {
  L2_POOL_IMPL_ID,
  POOL_ADDRESSES_PROVIDER_ID,
} from "../../helpers/deploy-ids";
import { MARKET_NAME } from "../../helpers/env";
import {
  ConfigNames,
  eNetwork,
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

  if (!isL2PoolSupported(poolConfig)) {
    console.log(
      `[INFO] Skipped L2 Pool due current network '${network}' is not supported`
    );
    return;
  }

  const { address: addressesProviderAddress } = await deployments.get(
    POOL_ADDRESSES_PROVIDER_ID
  );

  const commonLibraries = await getPoolLibraries();

  let poolInstance: any;
  if (isZkSync && zkDeployer) {
    // Deploy L2 libraries
    const {
      artifact: calldataLogicLibraryArtifact,
      deployedInstance: calldataLogicLibrary,
    } = await deployContract(
      zkDeployer,
      deployments,
      "CalldataLogic",
      [],
      "CalldataLogic"
    );

    // Deploy L2 supported Pool
    // @zkSync: TODO: Ask about Library linking
    ({ deployedInstance: poolInstance } = await deployContract(
      zkDeployer,
      deployments,
      "L2Pool",
      [addressesProviderAddress],
      L2_POOL_IMPL_ID
      // TODO: Ask about Library linking
      // {
      //   libraries: {
      //     ...commonLibraries,
      //     CalldataLogic: calldataLogicLibrary.address,
      //   },
      // }
    ));
  } else {
    // Deploy L2 libraries
    const calldataLogicLibrary = await deploy("CalldataLogic", {
      from: deployer,
    });
    // Deploy L2 supported Pool
    poolInstance = await deploy(L2_POOL_IMPL_ID, {
      contract: "L2Pool",
      from: deployer,
      args: [addressesProviderAddress],
      libraries: {
        ...commonLibraries,
        CalldataLogic: calldataLogicLibrary.address,
      },
      ...COMMON_DEPLOY_PARAMS,
    });
  }

  // Initialize implementation
  const pool = await getPool(poolInstance.address);
  await waitForTx(await pool.initialize(addressesProviderAddress));
  console.log("Initialized L2Pool Implementation");
};

func.id = "L2PoolImplementations";
func.tags = ["market"];

export default func;
