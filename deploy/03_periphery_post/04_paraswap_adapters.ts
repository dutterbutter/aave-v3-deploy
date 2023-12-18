import { getParamPerNetwork } from "../../helpers/market-config-helpers";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { COMMON_DEPLOY_PARAMS } from "../../helpers/env";
import {
  ConfigNames,
  eNetwork,
  loadPoolConfig,
  POOL_ADDRESSES_PROVIDER_ID,
  POOL_ADMIN,
  V3_PERIPHERY_VERSION,
} from "../../helpers";
import { MARKET_NAME } from "../../helpers/env";
import {
  setupZkDeployer,
  isZkSyncNetwork,
  deployContract,
} from "../../helpers/utilities/zkDeployer";
import * as hre from "hardhat";
import { is } from "bluebird";

const func: DeployFunction = async function ({
  getNamedAccounts,
  deployments
}: HardhatRuntimeEnvironment) {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  // @zkSync
  const isZkSync = isZkSyncNetwork(hre);
  const zkDeployer = isZkSync ? setupZkDeployer() : null;

  const network = (
    process.env.FORK ? process.env.FORK : hre.network.name
  ) as eNetwork;
  const poolConfig = await loadPoolConfig(MARKET_NAME as ConfigNames);

  const paraswapAugustusRegistry = getParamPerNetwork(
    poolConfig.ParaswapRegistry,
    network
  );

  if (!paraswapAugustusRegistry) {
    console.log(
      "[WARNING] Skipping the deployment of the Paraswap Liquidity Swap and Repay adapters due missing 'ParaswapRegistry' address at pool configuration."
    );
    return;
  }

  const { address: addressesProvider } = await deployments.get(
    POOL_ADDRESSES_PROVIDER_ID
  );
  const poolAdmin = POOL_ADMIN[network];

  if (isZkSync && zkDeployer) {
    await deployContract(
      zkDeployer,
      deployments,
      "ParaSwapLiquiditySwapAdapter",
      [addressesProvider, paraswapAugustusRegistry, poolAdmin],
      "ParaSwapLiquiditySwapAdapter"
    );

    await deployContract(
      zkDeployer,
      deployments,
      "ParaSwapRepayAdapter",
      [addressesProvider, paraswapAugustusRegistry, poolAdmin],
      "ParaSwapRepayAdapter"
    );

    return true;
  } else {
    await deploy("ParaSwapLiquiditySwapAdapter", {
      from: deployer,
      ...COMMON_DEPLOY_PARAMS,
      args: [addressesProvider, paraswapAugustusRegistry, poolAdmin],
    });
  
    await deploy("ParaSwapRepayAdapter", {
      from: deployer,
      ...COMMON_DEPLOY_PARAMS,
      args: [addressesProvider, paraswapAugustusRegistry, poolAdmin],
    });
  
    return true;
  }
};

// This script can only be run successfully once per market, core version, and network
func.id = `ParaswapAdapters:${MARKET_NAME}:aave-v3-periphery@${V3_PERIPHERY_VERSION}`;

func.tags = ["periphery-post", "paraswap-adapters"];

export default func;
