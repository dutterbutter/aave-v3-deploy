import {
  ConfigNames,
  loadPoolConfig,
} from "../../helpers/market-config-helpers";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { COMMON_DEPLOY_PARAMS } from "../../helpers/env";
import { V3_PERIPHERY_VERSION } from "../../helpers/constants";
import {
  POOL_ADDRESSES_PROVIDER_ID,
  POOL_PROXY_ID,
} from "../../helpers/deploy-ids";
import { checkRequiredEnvironment as checkRequiredEnvironment } from "../../helpers/market-config-helpers";
import { eNetwork } from "../../helpers/types";
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

  const poolConfig = await loadPoolConfig(MARKET_NAME as ConfigNames);
  const network = (
    process.env.FORK ? process.env.FORK : hre.network.name
  ) as eNetwork;

  // Deploy Mock Flash Loan Receiver if testnet deployment
  if (!hre.config.networks[network].live || poolConfig.TestnetMarket) {
    if (isZkSync && zkDeployer) {
      await deployContract(
        zkDeployer,
        deployments,
        "MockFlashLoanReceiver",
        [await (await deployments.get(POOL_ADDRESSES_PROVIDER_ID)).address],
        "MockFlashLoanReceiver"
      );
    } else {
      await deploy("MockFlashLoanReceiver", {
        from: deployer,
        args: [await (await deployments.get(POOL_ADDRESSES_PROVIDER_ID)).address],
        ...COMMON_DEPLOY_PARAMS,
      });
    }

  }

  return true;
};

// This script can only be run successfully once per market, core version, and network
func.id = `PeripheryInit:${MARKET_NAME}:aave-v3-periphery@${V3_PERIPHERY_VERSION}`;

func.tags = ["market", "init-periphery"];

func.dependencies = [
  "before-deploy",
  "core",
  "periphery-pre",
  "provider",
  "init-pool",
  "oracles",
];

func.skip = async () => checkRequiredEnvironment();

export default func;
