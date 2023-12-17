import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { setupZkDeployer } from "../../helpers/utilities/zkDeployer";
import { V3_CORE_VERSION, ZERO_ADDRESS } from "../../helpers/constants";
import {
  checkRequiredEnvironment,
  ConfigNames,
  getReserveAddresses,
  loadPoolConfig,
} from "../../helpers/market-config-helpers";
import {
  POOL_ADDRESSES_PROVIDER_ID,
  POOL_DATA_PROVIDER,
} from "../../helpers/deploy-ids";
import { addMarketToRegistry } from "../../helpers/init-helpers";
import { eNetwork } from "../../helpers/types";
import { getAddress } from "ethers/lib/utils";
import { waitForTx } from "../../helpers/utilities/tx";
import { PoolAddressesProvider } from "../../typechain";
import {
  containsSameMembers,
  isEqualAddress,
} from "../../helpers/utilities/utils";
import { COMMON_DEPLOY_PARAMS, MARKET_NAME } from "../../helpers/env";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  // const { getNamedAccounts, deployments } = hre;
  // const { deploy } = deployments;
  // //const { deployer } = await getNamedAccounts();
  const zkDeployer = setupZkDeployer();
  const poolConfig = await loadPoolConfig(MARKET_NAME as ConfigNames);
  const network = (
    process.env.FORK ? process.env.FORK : hre.network.name
  ) as eNetwork;
  console.log("network: ", network);
  // 0. Check beforehand that all reserves have non-zero addresses
  const reserves = await getReserveAddresses(poolConfig, network);
  console.log("Reserves:::: ",reserves);
  const reservesConfig = poolConfig.ReservesConfig;
  //console.log("reservesConfig:::: ", reservesConfig);
  const reserveConfigSymbols = Object.keys(reservesConfig);
  const reserveSymbols = Object.keys(reserves);

  if (!containsSameMembers(reserveConfigSymbols, reserveSymbols)) {
    console.log("reserveConfigSymbols:::: ", reserveConfigSymbols);
    console.log("reserveSymbols::: ",reserveSymbols);
    throw "[Deployment][Error] Mismatch between Config.ReservesConfig and Config.ReserveAssets token symbols";
  }
  if (reserveSymbols.length === 0) {
    console.warn(
      "[Warning] Market Config does not contain ReservesConfig. Skipping check of Reserves and ReservesConfig."
    );
  }
  for (let y = 0; y < reserveSymbols.length; y++) {
    if (
      !reserves[reserveSymbols[y]] ||
      getAddress(reserves[reserveSymbols[y]]) === ZERO_ADDRESS
    ) {
      throw `[Deployment][Error] Missing token ${reserveSymbols[y]} ReserveAssets configuration`;
    }
  }

  // 1. Deploy PoolAddressesProvider
  // NOTE: The script passes 0 as market id to create the same address of PoolAddressesProvider
  // in multiple networks via CREATE2. Later in this script it will update the corresponding Market ID.
  const addressesProviderArtifact = await zkDeployer.loadArtifact(
    "PoolAddressesProvider"
  );
  const addressesProviderInstance = await zkDeployer.deploy(addressesProviderArtifact, [
    "0", zkDeployer.zkWallet.address,
  ]);
  console.log("addressesProvider: ", addressesProviderInstance.address);
  // const addressesProviderArtifact = await deploy(POOL_ADDRESSES_PROVIDER_ID, {
  //   from: deployer,
  //   contract: "PoolAddressesProvider",
  //   args: ["0", deployer],
  //   ...COMMON_DEPLOY_PARAMS,
  // });
  // const signer = await hre.ethers.getSigner(deployer);

  // const addressesProviderInstance = (
  //   (await hre.ethers.getContractAt(
  //     addressesProviderArtifact.abi,
  //     addressesProviderArtifact.address
  //   )) as PoolAddressesProvider
  // ).connect(signer);

  // 2. Set the MarketId
  const rec = await waitForTx(
    await addressesProviderInstance.setMarketId(poolConfig.MarketId)
  );
  console.log("setMarketId: ", rec);
  // 3. Add AddressesProvider to Registry
  await addMarketToRegistry(
    poolConfig.ProviderId,
    addressesProviderInstance.address
  );

  // 4. Deploy AaveProtocolDataProvider getters contract
  const protocolDataProviderArtifact = await zkDeployer.loadArtifact(
    "AaveProtocolDataProvider"
  );
  const protocolDataProvider = await zkDeployer.deploy(protocolDataProviderArtifact, [
    addressesProviderInstance.address,
  ]);
  console.log("protocolDataProvider: ", protocolDataProvider.address);
  // @zkSync: TODO: understand the usage of POOL_DATA_PROVIDER
  // const protocolDataProvider = await deploy(POOL_DATA_PROVIDER, {
  //   from: deployer,
  //   contract: "AaveProtocolDataProvider",
  //   args: [addressesProviderArtifact.address],
  //   ...COMMON_DEPLOY_PARAMS,
  // });
  const currentProtocolDataProvider =
    await addressesProviderInstance.getPoolDataProvider();

  // Set the ProtocolDataProvider if is not already set at addresses provider
  if (
    !isEqualAddress(protocolDataProvider.address, currentProtocolDataProvider)
  ) {
    const rec2 = await waitForTx(
      await addressesProviderInstance.setPoolDataProvider(
        protocolDataProvider.address
      )
    );
    console.log("setPoolDataProvider: ", rec2);
  }

  return true;
};

// This script can only be run successfully once per market, core version, and network
func.id = `PoolAddressesProvider:${MARKET_NAME}:aave-v3-core@${V3_CORE_VERSION}`;

func.tags = ["market", "provider"];

func.dependencies = ["before-deploy", "core", "periphery-pre", "token-setup"];

func.skip = async () => checkRequiredEnvironment();

export default func;
