import {
  DETERMINISTIC_DEPLOYMENT,
  DETERMINISTIC_FACTORIES,
  ETHERSCAN_KEY,
  getCommonNetworkConfig,
  hardhatNetworkSettings,
  loadTasks,
} from "./helpers/hardhat-config-helpers";
import {
  eArbitrumNetwork,
  eAvalancheNetwork,
  eEthereumNetwork,
  eFantomNetwork,
  eHarmonyNetwork,
  eOptimismNetwork,
  ePolygonNetwork,
  eTenderly,
  ezkSyncNetwork,
} from "./helpers/types";
import { DEFAULT_NAMED_ACCOUNTS } from "./helpers/constants";

import "@nomicfoundation/hardhat-toolbox";
import "hardhat-deploy";
import "hardhat-contract-sizer";
import "@matterlabs/hardhat-zksync-deploy";
import "@matterlabs/hardhat-zksync-solc";
import "@matterlabs/hardhat-zksync-verify";
import "hardhat-dependency-compiler";
import "@nomicfoundation/hardhat-chai-matchers";

const SKIP_LOAD = process.env.SKIP_LOAD === "true";
const TASK_FOLDERS = ["misc", "market-registry"];

// Prevent to load tasks before compilation and typechain
if (!SKIP_LOAD) {
  loadTasks(TASK_FOLDERS);
}

export default {
  contractSizer: {
    alphaSort: true,
    runOnCompile: false,
    disambiguatePaths: false,
  },
  zksolc: {
    version: "latest",
    settings: {
      forceEvmla: false,
      libraries: {
        // TODO: need to clarify addresses here
        "@aave/core-v3/contracts/protocol/libraries/logic/LiquidationLogic.sol":
          {
            LiquidationLogic: "0x7A7AA626a497Eb9021BE271f25D265E627f4396D",
          },

        "@aave/core-v3/contracts/protocol/libraries/logic/EModeLogic.sol": {
          EModeLogic: "0x0F1fa870cae47A14b9155e4A9b74694a4573c063",
        },

        "@aave/core-v3/contracts/protocol/libraries/logic/BorrowLogic.sol": {
          BorrowLogic: "0x953E2859b9FDD4A2672F10eD44f9A9A9f7A651AF",
        },
        "@aave/core-v3/contracts/protocol/libraries/logic/FlashLoanLogic.sol": {
          FlashLoanLogic: "0xfA467fF2268D224b6759E3cD7d0Ec1e8300d376A",
        },

        "@aave/core-v3/contracts/protocol/libraries/logic/SupplyLogic.sol": {
          SupplyLogic: "0xe0F0DF7E3f306F52743403946A9D3e8b27c78e6F",
        },

        "@aave/core-v3/contracts/protocol/libraries/logic/PoolLogic.sol": {
          PoolLogic: "0x480F31A8eA654E51FA207E77cDD54b9297fF5Ee6",
        },
        "@aave/core-v3/contracts/protocol/libraries/logic/BridgeLogic.sol": {
          BridgeLogic: "0x020cDC455Bf6c8b6F42642d6aC221ABE219a9CD0",
        },

        "@aave/core-v3/contracts/protocol/libraries/logic/ConfiguratorLogic.sol":
          {
            ConfiguratorLogic: "0x4778bd941658c73ef7d539d61c2cA5530D067A9C",
          },
      },
    },
  },
  solidity: {
    compilers: [
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
  typechain: {
    outDir: "typechain",
    target: "ethers-v5",
  },
  networks: {
    hardhat: hardhatNetworkSettings,
    localhost: {
      url: "http://127.0.0.1:8545",
      ...hardhatNetworkSettings,
    },
    tenderly: getCommonNetworkConfig("tenderly", 3030),
    main: getCommonNetworkConfig(eEthereumNetwork.main, 1),
    kovan: getCommonNetworkConfig(eEthereumNetwork.kovan, 42),
    rinkeby: getCommonNetworkConfig(eEthereumNetwork.rinkeby, 4),
    ropsten: getCommonNetworkConfig(eEthereumNetwork.ropsten, 3),
    [ePolygonNetwork.polygon]: getCommonNetworkConfig(
      ePolygonNetwork.polygon,
      137
    ),
    [ePolygonNetwork.mumbai]: getCommonNetworkConfig(
      ePolygonNetwork.mumbai,
      80001
    ),
    arbitrum: getCommonNetworkConfig(eArbitrumNetwork.arbitrum, 42161),
    [eArbitrumNetwork.arbitrumTestnet]: getCommonNetworkConfig(
      eArbitrumNetwork.arbitrumTestnet,
      421611
    ),
    [eHarmonyNetwork.main]: getCommonNetworkConfig(
      eHarmonyNetwork.main,
      1666600000
    ),
    [eHarmonyNetwork.testnet]: getCommonNetworkConfig(
      eHarmonyNetwork.testnet,
      1666700000
    ),
    [eAvalancheNetwork.avalanche]: getCommonNetworkConfig(
      eAvalancheNetwork.avalanche,
      43114
    ),
    [eAvalancheNetwork.fuji]: getCommonNetworkConfig(
      eAvalancheNetwork.fuji,
      43113
    ),
    [eFantomNetwork.main]: getCommonNetworkConfig(eFantomNetwork.main, 250),
    [eFantomNetwork.testnet]: getCommonNetworkConfig(
      eFantomNetwork.testnet,
      4002
    ),
    [eOptimismNetwork.testnet]: getCommonNetworkConfig(
      eOptimismNetwork.testnet,
      420
    ),
    [eOptimismNetwork.main]: getCommonNetworkConfig(eOptimismNetwork.main, 10),
    [eEthereumNetwork.goerli]: getCommonNetworkConfig(
      eEthereumNetwork.goerli,
      5
    ),
    [eEthereumNetwork.sepolia]: getCommonNetworkConfig(
      eEthereumNetwork.sepolia,
      11155111
    ),
    [eArbitrumNetwork.goerliNitro]: getCommonNetworkConfig(
      eArbitrumNetwork.goerliNitro,
      421613
    ),
    [ezkSyncNetwork.main]: getCommonNetworkConfig(ezkSyncNetwork.main, 324),
    [ezkSyncNetwork.testnet]: getCommonNetworkConfig(
      ezkSyncNetwork.testnet,
      300
    ),
  },
  namedAccounts: {
    ...DEFAULT_NAMED_ACCOUNTS,
  },
  mocha: {
    timeout: 0,
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
      "@aave/core-v3/contracts/protocol/libraries/logic/SupplyLogic.sol",
      "@aave/core-v3/contracts/protocol/libraries/logic/EModeLogic.sol",
      "@aave/core-v3/contracts/protocol/libraries/logic/BorrowLogic.sol",
      "@aave/core-v3/contracts/protocol/libraries/logic/BridgeLogic.sol",
      "@aave/core-v3/contracts/protocol/libraries/logic/FlashLoanLogic.sol",
      "@aave/core-v3/contracts/protocol/libraries/logic/CalldataLogic.sol",
      "@aave/core-v3/contracts/protocol/pool/Pool.sol",
      "@aave/core-v3/contracts/protocol/pool/L2Pool.sol",
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
      "@aave/core-v3/contracts/mocks/helpers/MockPool.sol",
      "@aave/core-v3/contracts/mocks/helpers/MockL2Pool.sol",
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
  deterministicDeployment: DETERMINISTIC_DEPLOYMENT
    ? DETERMINISTIC_FACTORIES
    : undefined,
  etherscan: {
    apiKey: ETHERSCAN_KEY,
  },
};
