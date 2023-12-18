import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { COMMON_DEPLOY_PARAMS } from "../../helpers/env";
import {
  setupZkDeployer,
  isZkSyncNetwork,
  getContractAddress,
  getContractABI,
} from "../../helpers/utilities/zkDeployer";
import * as hre from "hardhat";

// @zkSync: These libraries are already deployed
// See hardhat.config.ts for the deployment addresses
// if zkSync we will save deployments only
const func: DeployFunction = async function ({
  getNamedAccounts,
  deployments,
}: HardhatRuntimeEnvironment) {
  const { deploy, save } = deployments;
  const { deployer } = await getNamedAccounts();

  // @zkSync
  const isZkSync = isZkSyncNetwork(hre);
  const zkDeployer = isZkSync ? setupZkDeployer() : null;

  if (isZkSync && zkDeployer) {
    await save("SupplyLogic", {
      address: getContractAddress(hre, "SupplyLogic"),
      abi: await getContractABI("SupplyLogic"),
    });

    await save("BorrowLogic", {
      address: getContractAddress(hre, "BorrowLogic"),
      abi: await getContractABI("BorrowLogic"),
    });

    await save("LiquidationLogic", {
      address: getContractAddress(hre, "LiquidationLogic"),
      abi: await getContractABI("LiquidationLogic"),
    });

    await save("EModeLogic", {
      address: getContractAddress(hre, "EModeLogic"),
      abi: await getContractABI("EModeLogic"),
    });

    await save("BridgeLogic", {
      address: getContractAddress(hre, "BridgeLogic"),
      abi: await getContractABI("BridgeLogic"),
    });

    await save("ConfiguratorLogic", {
      address: getContractAddress(hre, "ConfiguratorLogic"),
      abi: await getContractABI("ConfiguratorLogic"),
    });

    // @zkSync: BorrowLogic is a library for FlashLoanLogic
    // TODO: check this
    await save("FlashLoanLogic", {
      address: getContractAddress(hre, "FlashLoanLogic"),
      abi: await getContractABI("FlashLoanLogic"),
    });

    await save("PoolLogic", {
      address: getContractAddress(hre, "PoolLogic"),
      abi: await getContractABI("PoolLogic"),
    });

    return true;
  } else {
    await deploy("SupplyLogic", {
      from: deployer,
      args: [],
      ...COMMON_DEPLOY_PARAMS,
    });

    const borrowLogicArtifact = await deploy("BorrowLogic", {
      from: deployer,
      args: [],
      ...COMMON_DEPLOY_PARAMS,
    });

    await deploy("LiquidationLogic", {
      from: deployer,
      ...COMMON_DEPLOY_PARAMS,
    });

    await deploy("EModeLogic", {
      from: deployer,
      ...COMMON_DEPLOY_PARAMS,
    });

    await deploy("BridgeLogic", {
      from: deployer,
      ...COMMON_DEPLOY_PARAMS,
    });

    await deploy("ConfiguratorLogic", {
      from: deployer,
      ...COMMON_DEPLOY_PARAMS,
    });

    await deploy("FlashLoanLogic", {
      from: deployer,
      ...COMMON_DEPLOY_PARAMS,
      libraries: {
        BorrowLogic: borrowLogicArtifact.address,
      },
    });

    await deploy("PoolLogic", {
      from: deployer,
      ...COMMON_DEPLOY_PARAMS,
    });

    return true;
  }
};

func.id = "LogicLibraries";
func.tags = ["core", "logic"];

export default func;
