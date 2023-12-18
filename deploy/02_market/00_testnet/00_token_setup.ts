import {
  STAKE_AAVE_PROXY,
  TESTNET_REWARD_TOKEN_PREFIX,
} from "../../../helpers/deploy-ids";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { COMMON_DEPLOY_PARAMS } from "../../../helpers/env";
import {
  checkRequiredEnvironment,
  ConfigNames,
  isIncentivesEnabled,
  isProductionMarket,
  loadPoolConfig,
} from "../../../helpers/market-config-helpers";
import { eNetwork } from "../../../helpers/types";
import {
  // FAUCET_ID,
  TESTNET_TOKEN_PREFIX,
  FAUCET_OWNABLE_ID,
} from "../../../helpers/deploy-ids";
import Bluebird from "bluebird";
import {
  deployInitializableAdminUpgradeabilityProxy,
  setupStkAave,
} from "../../../helpers/contract-deployments";
import { MARKET_NAME, PERMISSIONED_FAUCET } from "../../../helpers/env";
import {
  setupZkDeployer,
  isZkSyncNetwork,
  deployContract,
} from "../../../helpers/utilities/zkDeployer";
import * as hre from "hardhat";

const func: DeployFunction = async function ({
  getNamedAccounts,
  deployments,
}: HardhatRuntimeEnvironment) {
  const { deploy } = deployments;
  const { deployer, incentivesEmissionManager, incentivesRewardsVault } =
    await getNamedAccounts();

  // @zkSync
  const isZkSync = isZkSyncNetwork(hre);
  const zkDeployer = isZkSync ? setupZkDeployer() : null;
  
  const poolConfig = await loadPoolConfig(MARKET_NAME as ConfigNames);
  const network = (
    process.env.FORK ? process.env.FORK : hre.network.name
  ) as eNetwork;

  console.log("Live network:", !!hre.config.networks[network].live);

  if (isProductionMarket(poolConfig)) {
    console.log(
      "[Deployment] Skipping testnet token setup at production market"
    );
    // Early exit if is not a testnet market
    return;
  }
  let faucetOwnable: any;
  if (isZkSync && zkDeployer) {
    // zkSync-specific deployment logic
    console.log("- Deployment of FaucetOwnable contract");
    ({ deployedInstance: faucetOwnable } = await deployContract(
      zkDeployer,
      deployments,
      "Faucet",
      [zkDeployer.zkWallet.address, PERMISSIONED_FAUCET],
      FAUCET_OWNABLE_ID
    ));
  } else {
    // Deployment of FaucetOwnable helper contract
    // TestnetERC20 is owned by Faucet. Faucet is owned by defender relayer.
    console.log("- Deployment of FaucetOwnable contract");
    faucetOwnable = await deploy(FAUCET_OWNABLE_ID, {
      from: deployer,
      contract: "Faucet",
      args: [deployer, PERMISSIONED_FAUCET],
      ...COMMON_DEPLOY_PARAMS,
    });
  }
  console.log(
    `- Setting up testnet tokens for "${MARKET_NAME}" market at "${network}" network`
  );

  const reservesConfig = poolConfig.ReservesConfig;
  const reserveSymbols = Object.keys(reservesConfig);

  if (reserveSymbols.length === 0) {
    console.warn(
      "Market Config does not contain ReservesConfig. Skipping testnet token setup."
    );
    return;
  }

  // 0. Deployment of ERC20 mintable tokens for testing purposes
  await Bluebird.each(reserveSymbols, async (symbol) => {
    if (!reservesConfig[symbol]) {
      throw `[Deployment] Missing token "${symbol}" at ReservesConfig`;
    }

    if (symbol === poolConfig.WrappedNativeTokenSymbol) {
      console.log("Deploy of WETH9 mock");

      if (isZkSync && zkDeployer) {
        const { deployedInstance: WETH9MockInstance } = await deployContract(
          zkDeployer,
          deployments,
          "WETH9Mock",
          [
            poolConfig.WrappedNativeTokenSymbol,
            poolConfig.WrappedNativeTokenSymbol,
            faucetOwnable.address,
          ],
          `${poolConfig.WrappedNativeTokenSymbol}${TESTNET_TOKEN_PREFIX}`
        );
      } else {
        await deploy(
          `${poolConfig.WrappedNativeTokenSymbol}${TESTNET_TOKEN_PREFIX}`,
          {
            from: deployer,
            contract: "WETH9Mock",
            args: [
              poolConfig.WrappedNativeTokenSymbol,
              poolConfig.WrappedNativeTokenSymbol,
              faucetOwnable.address,
            ],
            ...COMMON_DEPLOY_PARAMS,
          }
        );
      }
    } else {
      console.log("Deploy of TestnetERC20 contract", symbol);

      if (isZkSync && zkDeployer) {
        const { deployedInstance: testnetERC20Instance } = await deployContract(
          zkDeployer,
          deployments,
          "TestnetERC20",
          [
            symbol,
            symbol,
            reservesConfig[symbol].reserveDecimals,
            faucetOwnable.address,
          ],
          `${symbol}${TESTNET_TOKEN_PREFIX}`
        );
      } else {
        await deploy(`${symbol}${TESTNET_TOKEN_PREFIX}`, {
          from: deployer,
          contract: "TestnetERC20",
          args: [
            symbol,
            symbol,
            reservesConfig[symbol].reserveDecimals,
            faucetOwnable.address,
          ],
          ...COMMON_DEPLOY_PARAMS,
        });
      }
    }
  });

  if (isIncentivesEnabled(poolConfig)) {
    // 2. Deployment of Reward Tokens

    const rewardSymbols: string[] = Object.keys(
      poolConfig.IncentivesConfig.rewards[network] || {}
    );

    for (let y = 0; y < rewardSymbols.length; y++) {
      const reward = rewardSymbols[y];

      if (isZkSync && zkDeployer) {
        const { deployedInstance: testnetERC20Instance } = await deployContract(
          zkDeployer,
          deployments,
          "TestnetERC20",
          [reward, reward, 18, faucetOwnable.address],
          `${reward}${TESTNET_REWARD_TOKEN_PREFIX}`
        );
      } else {
        await deploy(`${reward}${TESTNET_REWARD_TOKEN_PREFIX}`, {
          from: deployer,
          contract: "TestnetERC20",
          args: [reward, reward, 18, faucetOwnable.address],
          ...COMMON_DEPLOY_PARAMS,
        });
      }
    }

    // 3. Deployment of Stake Aave
    const COOLDOWN_SECONDS = "3600";
    const UNSTAKE_WINDOW = "1800";
    const aaveTokenArtifact = await deployments.get(
      `AAVE${TESTNET_TOKEN_PREFIX}`
    );

    const stakeProxy = await deployInitializableAdminUpgradeabilityProxy(
      STAKE_AAVE_PROXY
    );

    // Setup StkAave
    await setupStkAave(stakeProxy, [
      aaveTokenArtifact.address,
      aaveTokenArtifact.address,
      COOLDOWN_SECONDS,
      UNSTAKE_WINDOW,
      incentivesRewardsVault,
      incentivesEmissionManager,
      (1000 * 60 * 60).toString(),
    ]);

    console.log("Testnet Reserve Tokens");
    console.log("======================");

    const allDeployments = await deployments.all();
    const testnetDeployment = Object.keys(allDeployments).filter((x) =>
      x.includes(TESTNET_TOKEN_PREFIX)
    );
    testnetDeployment.forEach((key) =>
      console.log(key, allDeployments[key].address)
    );

    console.log("Testnet Reward Tokens");
    console.log("======================");

    const rewardDeployment = Object.keys(allDeployments).filter((x) =>
      x.includes(TESTNET_REWARD_TOKEN_PREFIX)
    );

    rewardDeployment.forEach((key) =>
      console.log(key, allDeployments[key].address)
    );

    console.log(
      "Native Token Wrapper WETH9",
      (
        await deployments.get(
          `${poolConfig.WrappedNativeTokenSymbol}${TESTNET_TOKEN_PREFIX}`
        )
      ).address
    );
  }
  console.log(
    "[Deployment][WARNING] Remember to setup the above testnet addresses at the ReservesConfig field inside the market configuration file and reuse testnet tokens"
  );
  console.log(
    "[Deployment][WARNING] Remember to setup the Native Token Wrapper (ex WETH or WMATIC) at `helpers/constants.ts`"
  );
};

func.tags = ["market", "init-testnet", "token-setup"];

func.dependencies = ["before-deploy", "periphery-pre"];

func.skip = async () => checkRequiredEnvironment();

export default func;
