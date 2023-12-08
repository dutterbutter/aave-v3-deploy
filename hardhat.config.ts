import { HardhatUserConfig } from "hardhat/config";

import "@matterlabs/hardhat-zksync-deploy";
import "@matterlabs/hardhat-zksync-solc";
import "hardhat-dependency-compiler";
import "@matterlabs/hardhat-zksync-verify";

const config: HardhatUserConfig = {
  zksolc: {
    version: "latest",
    settings: {
      forceEvmla: false,
      optimizer: {
        enabled: true, // optional. True by default
        mode: "3", // optional. 3 by default, z to optimize bytecode size
      },
      libraries: {
        "@aave/core-v3/contracts/protocol/libraries/logic/ConfiguratorLogic.sol":
          {
            ConfiguratorLogic: "0x8b6E8186dE74fe0128C0a6a3B2733c1365f4c9e2",
          },
          // libraries
          // "@aave/core-v3/contracts/protocol/libraries/logic/ConfiguratorLogic.sol",
          // "@aave/core-v3/contracts/protocol/libraries/logic/BridgeLogic.sol",
          // "@aave/core-v3/contracts/protocol/libraries/logic/PoolLogic.sol",
          // "@aave/core-v3/contracts/protocol/libraries/logic/SupplyLogic.sol",
          // "@aave/core-v3/contracts/protocol/libraries/logic/FlashLoanLogic.sol",
          // "@aave/core-v3/contracts/protocol/libraries/logic/BorrowLogic.sol",
          // "@aave/core-v3/contracts/protocol/libraries/logic/EModeLogic.sol",
          // "@aave/core-v3/contracts/protocol/libraries/logic/LiquidationLogic.sol",
      },
    },
  },
  defaultNetwork: "zkSyncTestnet",
  networks: {
    hardhat: {
      zksync: false,
    },
    zkSyncTestnet: {
      url: "http://127.0.0.1:8011",
      ethNetwork: "goerli",
      zksync: true,
    },
  },
  solidity: {
    compilers: [
      {
        version: "0.8.20",
      },
      {
        version: "0.8.10",
        settings: {
          optimizer: { enabled: true, runs: 100_000 },
          evmVersion: "berlin",
        },
      },
      {
        version: "0.7.5",
        settings: {
          optimizer: { enabled: true, runs: 100_000 },
        },
      },
    ],
  },
  dependencyCompiler: {
    paths: [
      "@aave/core-v3/contracts/protocol/configuration/PoolAddressesProviderRegistry.sol",
      "@aave/core-v3/contracts/protocol/configuration/PoolAddressesProvider.sol",
      "@aave/core-v3/contracts/misc/AaveOracle.sol",
      "@aave/core-v3/contracts/protocol/tokenization/AToken.sol",
      "@aave/core-v3/contracts/protocol/tokenization/DelegationAwareAToken.sol",
      "@aave/core-v3/contracts/protocol/tokenization/StableDebtToken.sol",
      "@aave/core-v3/contracts/protocol/tokenization/VariableDebtToken.sol",
      "@aave/core-v3/contracts/protocol/libraries/logic/GenericLogic.sol",
      "@aave/core-v3/contracts/protocol/libraries/logic/ValidationLogic.sol",
      "@aave/core-v3/contracts/protocol/libraries/logic/ReserveLogic.sol",
     // "@aave/core-v3/contracts/protocol/libraries/logic/SupplyLogic.sol",
     // "@aave/core-v3/contracts/protocol/libraries/logic/EModeLogic.sol",
     // "@aave/core-v3/contracts/protocol/libraries/logic/BorrowLogic.sol",
     // "@aave/core-v3/contracts/protocol/libraries/logic/BridgeLogic.sol",
     // "@aave/core-v3/contracts/protocol/libraries/logic/FlashLoanLogic.sol",
     // "@aave/core-v3/contracts/protocol/libraries/logic/CalldataLogic.sol",

      // "@aave/core-v3/contracts/protocol/pool/Pool.sol",
      // "@aave/core-v3/contracts/protocol/pool/L2Pool.sol",
      "@aave/core-v3/contracts/protocol/pool/PoolConfigurator.sol",
      "@aave/core-v3/contracts/protocol/pool/DefaultReserveInterestRateStrategy.sol",
      "@aave/core-v3/contracts/protocol/libraries/aave-upgradeability/InitializableImmutableAdminUpgradeabilityProxy.sol",
      "@aave/core-v3/contracts/dependencies/openzeppelin/upgradeability/InitializableAdminUpgradeabilityProxy.sol",
      "@aave/core-v3/contracts/deployments/ReservesSetupHelper.sol",
      "@aave/core-v3/contracts/misc/AaveProtocolDataProvider.sol",
      "@aave/core-v3/contracts/misc/L2Encoder.sol",
      "@aave/core-v3/contracts/protocol/configuration/ACLManager.sol",
      "@aave/core-v3/contracts/dependencies/weth/WETH9.sol",
      "@aave/core-v3/contracts/mocks/helpers/MockIncentivesController.sol",
      "@aave/core-v3/contracts/mocks/helpers/MockReserveConfiguration.sol",
      "@aave/core-v3/contracts/mocks/oracle/CLAggregators/MockAggregator.sol",
      "@aave/core-v3/contracts/mocks/tokens/MintableERC20.sol",
      "@aave/core-v3/contracts/mocks/flashloan/MockFlashLoanReceiver.sol",
      "@aave/core-v3/contracts/mocks/tokens/WETH9Mocked.sol",

      "@aave/core-v3/contracts/mocks/upgradeability/MockVariableDebtToken.sol",
      "@aave/core-v3/contracts/mocks/upgradeability/MockAToken.sol",
      "@aave/core-v3/contracts/mocks/upgradeability/MockStableDebtToken.sol",
      "@aave/core-v3/contracts/mocks/upgradeability/MockInitializableImplementation.sol",

      // "@aave/core-v3/contracts/mocks/helpers/MockPool.sol",
      // "@aave/core-v3/contracts/mocks/helpers/MockL2Pool.sol",

      "@aave/core-v3/contracts/dependencies/openzeppelin/contracts/IERC20Detailed.sol",
      "@aave/core-v3/contracts/dependencies/openzeppelin/contracts/IERC20.sol",

      "@aave/core-v3/contracts/mocks/oracle/PriceOracle.sol",
      "@aave/core-v3/contracts/mocks/tokens/MintableDelegationERC20.sol",

      "@aave/periphery-v3/contracts/misc/UiPoolDataProviderV3.sol",
      "@aave/periphery-v3/contracts/misc/WalletBalanceProvider.sol",
      "@aave/periphery-v3/contracts/misc/WrappedTokenGatewayV3.sol",
      "@aave/periphery-v3/contracts/misc/interfaces/IWETH.sol",
      "@aave/periphery-v3/contracts/misc/UiIncentiveDataProviderV3.sol",

      "@aave/periphery-v3/contracts/rewards/RewardsController.sol",
      "@aave/periphery-v3/contracts/rewards/transfer-strategies/StakedTokenTransferStrategy.sol",
      "@aave/periphery-v3/contracts/rewards/transfer-strategies/PullRewardsTransferStrategy.sol",
      "@aave/periphery-v3/contracts/rewards/EmissionManager.sol",

      "@aave/periphery-v3/contracts/mocks/WETH9Mock.sol",
      "@aave/periphery-v3/contracts/mocks/testnet-helpers/Faucet.sol",
      "@aave/periphery-v3/contracts/mocks/testnet-helpers/TestnetERC20.sol",

      "@aave/periphery-v3/contracts/treasury/Collector.sol",
      "@aave/periphery-v3/contracts/treasury/CollectorController.sol",

      "@aave/periphery-v3/contracts/treasury/AaveEcosystemReserveV2.sol",
      "@aave/periphery-v3/contracts/treasury/AaveEcosystemReserveController.sol",

      "@aave/periphery-v3/contracts/adapters/paraswap/ParaSwapLiquiditySwapAdapter.sol",
      "@aave/periphery-v3/contracts/adapters/paraswap/ParaSwapRepayAdapter.sol",

      "@aave/safety-module/contracts/stake/StakedAave.sol",
      "@aave/safety-module/contracts/stake/StakedAaveV2.sol",
      "@aave/safety-module/contracts/proposals/extend-stkaave-distribution/StakedTokenV2Rev3.sol",
    ],
  },
};

export default config;
