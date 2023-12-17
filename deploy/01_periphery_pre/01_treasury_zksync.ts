import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { setupZkDeployer } from "../../helpers/utilities/zkDeployer";
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

const func: DeployFunction = async function ({
  getNamedAccounts,
  deployments,
  ethers,
}: HardhatRuntimeEnvironment) {
  const { deployer: deployerAddress } = await getNamedAccounts();
  const { save } = deployments;
  // Set up deployer wallet for zkSync
  const zkDeployer = setupZkDeployer();

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
    console.log("TREASURY_PROXY_ID saved!")
    await save(TREASURY_CONTROLLER_ID, {
      address: controller,
      abi: AaveEcosystemReserveController__factory.abi,
    });
    console.log("TREASURY_CONTROLLER_ID saved!")
    await save(TREASURY_IMPL_ID, {
      address: impl,
      abi: AaveEcosystemReserveV2__factory.abi,
    });
    console.log("TREASURY_IMPL_ID saved!")
    return true;
  }

  // @zkSync TODO: Not using deployContract helper here as it seems
  // we are saving the proxy address and not the implementation address.
  // Deploy Treasury proxy
  const upgradeabilityProxyArtifact = await zkDeployer.loadArtifact(
    "InitializableAdminUpgradeabilityProxy"
  );
  const treasuryProxyArtifact = await zkDeployer.deploy(upgradeabilityProxyArtifact, []);
  console.log("TreasuryProxy deployed:", treasuryProxyArtifact.address)

  // Deploy Treasury Controller
  const aaveEcosystemReserveControllerArtifact = await zkDeployer.loadArtifact(
    "AaveEcosystemReserveController"
  );
  // Understand purpose of TREASURY_CONTROLLER_ID
  const treasuryController = await zkDeployer.deploy(aaveEcosystemReserveControllerArtifact, [
      treasuryOwner
  ]);
  console.log("TreasuryImpl deployed:", treasuryController.address)

  // Deploy Treasury implementation and initialize proxy
  const aaveEcosystemReserveV2Artifact = await zkDeployer.loadArtifact(
    "AaveEcosystemReserveV2"
  );
  const treasuryImplArtifact = await zkDeployer.deploy(aaveEcosystemReserveV2Artifact, []);
  console.log("TreasuryImpl deployed:", treasuryImplArtifact.address)

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
