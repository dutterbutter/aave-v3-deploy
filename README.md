# Aave V3 Deployments

[![npm (scoped)](https://img.shields.io/npm/v/@aave/deploy-v3)](https://www.npmjs.com/package/@aave/deploy-v3)

This Node.js repository contains the configuration and deployment scripts for the Aave V3 protocol core and periphery contracts. The repository makes use of `hardhat` and `hardhat-deploy` tools to facilitate the deployment of Aave V3 protocol.

## Requirements

- Node.js >= 16
- Alchemy key
  - If you use a custom RPC node, you can change the default RPC provider URL at [./helpers/hardhat-config-helpers.ts:25](./helpers/hardhat-config-helpers.ts).
- Etherscan API key _(Optional)_

## Getting Started

1. Install Node.JS dependencies:

   ```
   npm i
   ```

2. Compile contracts before running any other command, to generate Typechain TS typings:

   ```
   npm run compile
   ```

3. Compiling contracts targeting `zkSync`:

   ```
   # zkSync-goerli | zkSync-sepolia | zkSyncLocal | zkSync
   HARDHAT_NETWORK=zkSync-goerli SKIP_LOAD=true npx hardhat compile
   ```

- **3a.** Once compiled you will be prompted "**To compile and deploy libraries, please run: `yarn hardhat deploy-zksync:libraries --private-key <PRIVATE_KEY>`**"

   ```
   yarn hardhat deploy-zksync:libraries --compile-all-contract --private-key <PRIVATE_KEY> --network zkSync-goerli
   ```

- **3b.** Once deployed add deployed library output from console to HardHat configuration in the `libraries {}` field under `zksolc`:

   ```
   libraries: {
      // @zkSync: These are deployed addresses on zkSync Goerli
      // TODO: need to update these addresses with the correct ones later
      "@aave/core-v3/contracts/protocol/libraries/logic/ConfiguratorLogic.sol": {
         "ConfiguratorLogic": "0xe24eA68C46fe765E030Bc14baFa087a865d389a6"
      },
      "@aave/core-v3/contracts/protocol/libraries/logic/PoolLogic.sol": {
         "PoolLogic": "0x670eFBdFa365A8de51a72447837226852E53fe43"
      },
      "@aave/core-v3/contracts/protocol/libraries/logic/BridgeLogic.sol": {
         "BridgeLogic": "0x10079a3854039F10E071bB3f054D463568EAC317"
      },
      "@aave/core-v3/contracts/protocol/libraries/logic/SupplyLogic.sol": {
         "SupplyLogic": "0x0c950296714AB383ff4D478262863204a5d4788e"
      },
      "@aave/core-v3/contracts/protocol/libraries/logic/BorrowLogic.sol": {
         "BorrowLogic": "0xF65f7A0F52B921e18Ff8e25f14AEAB3978f8fBdB"
      },
      "@aave/core-v3/contracts/protocol/libraries/logic/FlashLoanLogic.sol": {
         "FlashLoanLogic": "0x6B6025aCFfbc5306FA61cB8708b589baBCb7658e"
      },
      "@aave/core-v3/contracts/protocol/libraries/logic/EModeLogic.sol": {
         "EModeLogic": "0x9cfD416c110A3CE6E7c40AB63965EA0a5553aa7c"
      },
      "@aave/core-v3/contracts/protocol/libraries/logic/LiquidationLogic.sol": {
         "LiquidationLogic": "0xC25F04991577522ef546218606E8a35a565bCDA2"
      }
   },
   ```
## How to deploy Aave V3 in testnet network

To deploy Aave V3 in a Testnet network, copy the `.env.example` into a `.env` file, and fill the environment variables `MNEMONIC`, and `ALCHEMY_KEY`.

```
cp .env.example .env
```

Edit the `.env` file to fill the environment variables `MNEMONIC`, `ALCHEMY_KEY` and `MARKET_NAME`. You can check all possible pool configurations in this [file](https://github.com/aave/aave-v3-deploy/blob/09e91b80aff219da80f35a9fc55dafc5d698b574/helpers/market-config-helpers.ts#L95).

```
nano .env
```

Run the deployments scripts and specify which network & aave market configs you wish to deploy.

```
HARDHAT_NETWORK=goerli npx hardhat deploy
```

## How to deploy Aave V3 in fork network

You can use the environment variable `FORK` with the network name to deploy into a fork.

```
FORK=main MARKET_NAME=Aave npx hardhat deploy
```

## How to integrate in your Hardhat project

You can install the `@aave/deploy-v3` package in your Hardhat project to be able to import deployments with `hardhat-deploy` and build on top of Aave in local or testnet network.

To make it work, you must install the following packages in your project:

```
npm i --save-dev @aave/deploy-v3 @aave/core-v3 @aave/periphery-v3
```

Then, proceed to load the deploy scripts adding the `externals` field in your Hardhat config file at `hardhat.config.js|ts`.

```
# Content of hardhat.config.ts file

export default hardhatConfig: HardhatUserConfig = {
   {...},
   external: {
    contracts: [
      {
        artifacts: 'node_modules/@aave/deploy-v3/artifacts',
        deploy: 'node_modules/@aave/deploy-v3/dist/deploy',
      },
    ],
  },
}
```

After all is configured, you can run `npx hardhat deploy` to run the scripts or you can also run it programmatically in your tests using fixtures:

```
import {getPoolAddressesProvider} from '@aave/deploy-v3';

describe('Tests', () => {
   before(async () => {
      // Set the MARKET_NAME env var
      process.env.MARKET_NAME = "Aave"

      // Deploy Aave V3 contracts before running tests
      await hre.deployments.fixture(['market', 'periphery-post']);`
   })

   it('Get Pool address from AddressesProvider', async () => {
      const addressesProvider = await getPoolAddressesProvider();

      const poolAddress = await addressesProvider.getPool();

      console.log('Pool', poolAddress);
   })
})

```

## How to verify your contract deployments

```
npx hardhat --network XYZ etherscan-verify --api-key YZX
```

## Project Structure

| Path                  | Description                                                                                                                     |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| deploy/               | Main deployment scripts dir location                                                                                            |
| ├─ 00-core/           | Core deployment, only needed to run once per network.                                                                           |
| ├─ 01-periphery_pre/  | Periphery contracts deployment, only need to run once per network.                                                              |
| ├─ 02-market/         | Market deployment scripts, depends of Core and Periphery deployment.                                                            |
| ├─ 03-periphery_post/ | Periphery contracts deployment after market is deployed.                                                                        |
| deployments/          | Artifacts location of the deployments, contains the addresses, the abi, solidity input metadata and the constructor parameters. |
| markets/              | Directory to configure Aave markets                                                                                             |
| tasks/                | Hardhat tasks to setup and review market configs                                                                                |
| helpers/              | Utility helpers to manage configs and deployments                                                                               |

## License

Please be aware that [Aave V3](https://github.com/aave/aave-v3-core) is under [BSUL](https://github.com/aave/aave-v3-core/blob/master/LICENSE.md) license as of 27 January 2023 or date specified at v3-license-date.aave.eth. The Licensor hereby grants you the right to copy, modify, create derivative works, redistribute, and make non-production use of the Licensed Work. Any exceptions to this license may be specified by Aave governance. This repository containing the deployment scripts for the Aave V3 smart contracts can only be used for local or testing purposes. If you wish to deploy to a production environment you can reach out to Aave Governance [here](https://governance.aave.com/).
