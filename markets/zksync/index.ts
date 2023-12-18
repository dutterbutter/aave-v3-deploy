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

// @zkSync TODO: need to confirm these settings with the correct ones
export const zkSyncConfig: IAaveConfiguration = {
  ...AaveMarket,
  ProviderId: 37,
  MarketId: "zkSync Aave Market",
  ATokenNamePrefix: "zkSync",
  StableDebtTokenNamePrefix: "zkSync",
  VariableDebtTokenNamePrefix: "zkSync",
  SymbolPrefix: "zks",
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
      // @zkSync TODO: need to update these addresses with the correct ones
      DAI: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
      LINK: "0x350a791Bfc2C21F9Ed5d10980Dad2e2638ffa7f6",
      USDC: "0x7F5c764cBc14f9669B88837ca1490cCa17c31607",
      WBTC: "0x68f180fcCe6836688e9084f035309E29Bf0A2095",
      WETH: "0x4200000000000000000000000000000000000006",
      USDT: "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58",
      AAVE: "0x76FB31fb4af56892A25e32cFC43De717950c9278",
      SUSD: "0x8c6f28f2F1A3C87F0f938b96d27520d9751ec8d9",
    },
    [ezkSyncNetwork.zkSyncGoerli]: {
      DAI: ZERO_ADDRESS,
      LINK: ZERO_ADDRESS,
      USDC: ZERO_ADDRESS,
      WBTC: ZERO_ADDRESS,
      WETH: ZERO_ADDRESS,
      USDT: ZERO_ADDRESS,
    },
    [ezkSyncNetwork.zkSyncSepolia]: {
      DAI: ZERO_ADDRESS,
      LINK: ZERO_ADDRESS,
      USDC: ZERO_ADDRESS,
      WBTC: ZERO_ADDRESS,
      WETH: ZERO_ADDRESS,
      USDT: ZERO_ADDRESS,
    },
    [ezkSyncNetwork.zkSyncLocal]: {
      DAI: ZERO_ADDRESS,
      LINK: ZERO_ADDRESS,
      USDC: ZERO_ADDRESS,
      WBTC: ZERO_ADDRESS,
      WETH: ZERO_ADDRESS,
      USDT: ZERO_ADDRESS,
    },
  },
  // @zkSync TODO: need to update these settings with the correct ones
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
      // @zkSync TODO: need to confirm these addresses: https://docs.chain.link/data-feeds/price-feeds/addresses?network=zksync&page=1#zksync-era-mainnet
      DAI: "0x5d336664b5D7A332Cd256Bf68CbF2270C6202fc6",
      LINK: "0x1b5a683579f53b9E30B538F70544444389633c75",
      USDC: "0x1824D297C6d6D311A204495277B63e943C2D376E",
      WBTC: "0x4Cba285c15e3B540C474A114a7b135193e4f1EA6",
      WETH: "0x6D41d1dc818112880b40e26BD6FD347E41008eDA",
      USDT: "0xB615075979AE1836B476F651f1eB79f0Cd3956a9",
      AAVE: "0x2137c69DCb41f611Cc8f39F8A98047e774d6ED74",
      // Using USDC / USD oracle due missing oracle for SUSD, but usage as collateral is deactivated
      SUSD: "0x1824D297C6d6D311A204495277B63e943C2D376E",
    },
    [ezkSyncNetwork.zkSyncGoerli]: {
      // @zkSync TODO: need to confirm these addresses: https://docs.chain.link/data-feeds/price-feeds/addresses?network=zksync&page=1#zksync-era-mainnet
      DAI: "0x9201e30038e1A51913666847cb8e3c25652E88F6",
      LINK: "0x47f0cB12d135c80B1ceF68D32BF781cd75AF49cc",
      USDC: "0x37FBa63C443Ca1Bf262B9E6cc46c4B46273F687C",
      WBTC: "0x0d1952b0Ed690Af2b8aF899CE3DAd24c97bc975b",
      WETH: "0x2bBaff398B72d5B26f4f9B3397cfd9DC578a9f08",
      USDT: "0x137dA9d2Dd5170F22C5132BE2024774243D748a3",
      // Using USDC / USD oracle due missing oracle for SUSD, but usage as collateral is deactivated
      SUSD: "0x37FBa63C443Ca1Bf262B9E6cc46c4B46273F687C",
    },
  },
};

export default zkSyncConfig;
