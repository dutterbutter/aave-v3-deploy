import { ezkSyncNetwork, IAaveConfiguration } from "../../helpers/types";
import AaveMarket from "../aave";
import {
  strategyDAI,
  strategyLINK,
  strategyUSDC,
  strategyWBTC,
  strategyWETH,
  strategyUSDT,
  strategyAAVE,
} from "../aave/reservesConfigs";
import { ZERO_ADDRESS } from "../../helpers";
import { strategySUSD } from "./reservesConfig";

export const zkSyncConfig: IAaveConfiguration = {
  ...AaveMarket,
  ProviderId: 35,
  MarketId: "zkSync Aave Market",
  ATokenNamePrefix: "zkSync",
  StableDebtTokenNamePrefix: "zkSync",
  VariableDebtTokenNamePrefix: "zkSync",
  SymbolPrefix: "ETH",
  ReservesConfig: {
    DAI: strategyDAI,
    LINK: strategyLINK,
    USDC: strategyUSDC,
    WBTC: strategyWBTC,
    WETH: strategyWETH,
    USDT: strategyUSDT,
    AAVE: strategyAAVE,
    SUSD: strategySUSD,
  },
  ReserveAssets: {
    [ezkSyncNetwork.main]: {
      DAI: "",
      LINK: "",
      USDC: "",
      WBTC: "",
      WETH: "",
      USDT: "",
      AAVE: "",
      SUSD: "",
    },
    [ezkSyncNetwork.testnet]: {
      DAI: ZERO_ADDRESS,
      LINK: ZERO_ADDRESS,
      USDC: ZERO_ADDRESS,
      WBTC: ZERO_ADDRESS,
      WETH: ZERO_ADDRESS,
      USDT: ZERO_ADDRESS,
    },
  },
  EModes: {
    StableEMode: {
      id: "1",
      ltv: "9700",
      liquidationThreshold: "9750",
      liquidationBonus: "10100",
      label: "Stablecoins",
      assets: ["USDC", "USDT", "DAI", "SUSD"],
    },
  },
  ChainlinkAggregator: {
    [ezkSyncNetwork.main]: {
      DAI: "",
      LINK: "",
      USDC: "",
      WBTC: "",
      WETH: "",
      USDT: "",
      AAVE: "",
      // Using USDC / USD oracle due missing oracle for SUSD, but usage as collateral is deactivated
      SUSD: "",
    },
  },
};

export default zkSyncConfig;
