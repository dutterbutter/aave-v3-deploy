import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { COMMON_DEPLOY_PARAMS } from "../../helpers/env";
import {
  chainlinkAggregatorProxy,
  chainlinkEthUsdAggregatorProxy,
} from "../../helpers/constants";
import { eNetwork } from "../../helpers";
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

  const network = (
    process.env.FORK ? process.env.FORK : hre.network.name
  ) as eNetwork;

  if (!chainlinkAggregatorProxy[network]) {
    console.log(
      '[Deployments] Skipping the deployment of UiPoolDataProvider due missing constant "chainlinkAggregatorProxy" configuration at ./helpers/constants.ts'
    );
    return;
  }

  if (isZkSync && zkDeployer) {
    // Deploy UiIncentiveDataProvider getter helper
    await deployContract(
      zkDeployer,
      deployments,
      "UiIncentiveDataProviderV3",
      [],
      "UiIncentiveDataProviderV3"
    );

    // Deploy UiPoolDataProvider getter helper
    await deployContract(
      zkDeployer,
      deployments,
      "UiPoolDataProviderV3",
      [
        chainlinkAggregatorProxy[network],
        chainlinkEthUsdAggregatorProxy[network],
      ],
      "UiPoolDataProviderV3"
    );
  } else {
    // Deploy UiIncentiveDataProvider getter helper
    await deploy("UiIncentiveDataProviderV3", {
      from: deployer,
    });

    // Deploy UiPoolDataProvider getter helper
    await deploy("UiPoolDataProviderV3", {
      from: deployer,
      args: [
        chainlinkAggregatorProxy[network],
        chainlinkEthUsdAggregatorProxy[network],
      ],
      ...COMMON_DEPLOY_PARAMS,
    });
  }
};

func.tags = ["periphery-post", "ui-helpers"];

export default func;
