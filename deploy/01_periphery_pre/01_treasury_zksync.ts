import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Deployer } from "@matterlabs/hardhat-zksync-deploy";
import { Wallet, Provider } from "zksync-web3";
import { POOL_ADMIN } from "./../../helpers/constants";
import { getProxyImplementationBySlot } from "./../../helpers/utilities/tx";
import { getFirstSigner } from "./../../helpers/utilities/signer";
import { eNetwork } from "./../../helpers/types";
import { MARKET_NAME } from "./../../helpers/env";
import {
  loadPoolConfig,
  getParamPerNetwork,
  isTestnetMarket,
} from "./../../helpers/market-config-helpers";
import { ZERO_ADDRESS } from "../../helpers/constants";
import {
  TREASURY_CONTROLLER_ID,
  TREASURY_IMPL_ID,
} from "../../helpers/deploy-ids";
import { COMMON_DEPLOY_PARAMS } from "../../helpers/env";
import { TREASURY_PROXY_ID } from "../../helpers/deploy-ids";
import {
  InitializableAdminUpgradeabilityProxy,
  waitForTx,
} from "../../helpers";
import {
  AaveEcosystemReserveController__factory,
  AaveEcosystemReserveV2,
  AaveEcosystemReserveV2__factory,
  InitializableAdminUpgradeabilityProxy__factory,
} from "../../typechain";
import { getAddress } from "ethers/lib/utils";
import * as hre from "hardhat";
require("dotenv").config();

const wallet_key = process.env.LOCAL_PRIVATE_KEY || "";

const func: DeployFunction = async function ({
  getNamedAccounts,
  deployments,
  ethers,
}: HardhatRuntimeEnvironment) {
  const { deployer: deployerAddress } = await getNamedAccounts();
  const { save } = deployments;
  // Set up deployer wallet for zkSync
  const provider = new Provider(`http://127.0.0.1:8011`);
  const deployerWallet = new Wallet(wallet_key, provider);
  const zkDeployer = new Deployer(hre, deployerWallet);

  const { ReserveFactorTreasuryAddress } = await loadPoolConfig(MARKET_NAME);

  const network = (process.env.FORK || hre.network.name) as eNetwork;
  const treasuryAddress = getParamPerNetwork(
    ReserveFactorTreasuryAddress,
    network
  );
  let treasuryOwner = POOL_ADMIN[network];

  if (isTestnetMarket(await loadPoolConfig(MARKET_NAME))) {
    treasuryOwner = zkDeployer.zkWallet.address;
  }

  if (treasuryAddress && getAddress(treasuryAddress) !== ZERO_ADDRESS) {
    const treasuryContract = await AaveEcosystemReserveV2__factory.connect(
      treasuryAddress,
      await getFirstSigner()
    );
    const controller = await treasuryContract.getFundsAdmin();
    const impl = await getProxyImplementationBySlot(treasuryAddress);

    await save(TREASURY_PROXY_ID, {
      address: treasuryAddress,
      abi: InitializableAdminUpgradeabilityProxy__factory.abi,
    });
    await save(TREASURY_CONTROLLER_ID, {
      address: controller,
      abi: AaveEcosystemReserveController__factory.abi,
    });
    await save(TREASURY_IMPL_ID, {
      address: impl,
      abi: AaveEcosystemReserveV2__factory.abi,
    });

    return true;
  }

  // Deploy Treasury proxy
  const upgradeabilityProxyArtifact = await zkDeployer.loadArtifact(
    "InitializableAdminUpgradeabilityProxy"
  );
  console.log("treasuryProxy")
  const treasuryProxyArtifact = await zkDeployer.deploy(upgradeabilityProxyArtifact, []);
  console.log("TreasuryProxy deployed::", treasuryProxyArtifact.address)

  // Deploy Treasury Controller
  const aaveEcosystemReserveControllerArtifact = await zkDeployer.loadArtifact(
    "AaveEcosystemReserveController"
  );
  // Understand purpose of TREASURY_CONTROLLER_ID
  const treasuryController = await zkDeployer.deploy(aaveEcosystemReserveControllerArtifact, [
      treasuryOwner
  ]);
  console.log("TreasuryImpl deployed::", treasuryController.address)

  // Deploy Treasury implementation and initialize proxy
  const aaveEcosystemReserveV2Artifact = await zkDeployer.loadArtifact(
    "AaveEcosystemReserveV2"
  );
  // Understand purpose of TREASURY_CONTROLLER_ID
  const treasuryImplArtifact = await zkDeployer.deploy(aaveEcosystemReserveV2Artifact, []);
  console.log("TreasuryImpl deployed::", treasuryImplArtifact.address)

  const treasuryImpl = (await hre.ethers.getContractAt(
    aaveEcosystemReserveV2Artifact.abi,
    treasuryImplArtifact.address
  )) as AaveEcosystemReserveV2;

  // Call to initialize at implementation contract to prevent other calls.
  await waitForTx(await treasuryImpl.initialize(ZERO_ADDRESS));

  // Initialize proxy
  const proxy = (await hre.ethers.getContractAt(
    upgradeabilityProxyArtifact.abi,
    treasuryProxyArtifact.address
  )) as InitializableAdminUpgradeabilityProxy;

  const initializePayload = treasuryImpl.interface.encodeFunctionData(
    "initialize",
    [treasuryController.address]
  );

  const rec = await waitForTx(
    await proxy["initialize(address,address,bytes)"](
      treasuryImplArtifact.address,
      treasuryOwner,
      initializePayload
    )
  );

  console.log("TreasuryProxy initialized::", rec)

  return true;
};

func.tags = ["periphery-pre", "TreasuryProxy"];
func.dependencies = [];
func.id = "Treasury";

export default func;
