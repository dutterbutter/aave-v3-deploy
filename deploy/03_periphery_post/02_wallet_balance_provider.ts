import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { COMMON_DEPLOY_PARAMS } from "../../helpers/env";
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

  if (isZkSync && zkDeployer) {
    await deployContract(
      zkDeployer,
      deployments,
      "WalletBalanceProvider",
      [],
      "WalletBalanceProvider"
    );
  } else {
    await deploy("WalletBalanceProvider", {
      from: deployer,
      ...COMMON_DEPLOY_PARAMS,
    });
  }
};

func.tags = ["periphery-post", "walletProvider"];

export default func;
