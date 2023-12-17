import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { COMMON_DEPLOY_PARAMS } from "../../helpers/env";
import { getContractAddress, getContractABI } from "../../helpers/utilities/zkDeployer";


// @zkSync: These libraries are already deployed
// See hardhat.config.ts for the deployment addresses
// This just saves to deployment
const func: DeployFunction = async function ({
  getNamedAccounts,
  deployments,
  ...hre
}: HardhatRuntimeEnvironment) {
  const { save } = deployments;
  
  await save("SupplyLogic", {
    address: await getContractAddress("SupplyLogic"),
    abi: await getContractABI("SupplyLogic"),
  });

  await save("BorrowLogic", {
    address: await getContractAddress("BorrowLogic"),
    abi: await getContractABI("BorrowLogic"),
  });

  await save("LiquidationLogic", {
    address: await getContractAddress("LiquidationLogic"),
    abi: await getContractABI("LiquidationLogic"),
  });

  await save("EModeLogic", {
    address: await getContractAddress("EModeLogic"),
    abi: await getContractABI("EModeLogic"),    
  });

  await save("BridgeLogic", {
    address: await getContractAddress("BridgeLogic"),
    abi: await getContractABI("BridgeLogic"),
  });

  await save("ConfiguratorLogic", {
    address: await getContractAddress("ConfiguratorLogic"),
    abi: await getContractABI("ConfiguratorLogic"),
  });

  await save("FlashLoanLogic", {
    address: await getContractAddress("FlashLoanLogic"),
    abi: await getContractABI("FlashLoanLogic"),
  });

  await save("PoolLogic", {
    address: await getContractAddress("PoolLogic"),
    abi: await getContractABI("PoolLogic"),
  });

  return true;
};

func.id = "LogicLibraries";
func.tags = ["core", "logic"];

export default func;
