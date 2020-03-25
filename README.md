# Bancor Fiat On Ramp

Fiat on/off ramps for entering/exiting Bancor liquidity pools

## Setup

Create a file at the project root called .env with the following contents:

```bash
export INFURA_ID=yourInfuraId
export EXCHANGE_ADDRESS=0x6262998Ced04146fA42253a5C0AF90CA02dfd2A3
export MNEMONIC="your mnemonic"
```

Here, `EXCHANGE_ADDRESS` is simply an account with many tokens used to
acquire Dai, etc. for testing.

Next, create `app/.env` with the following contents:

```bash
export BLOCKNATIVE_API_KEY=yourBlocknativeApiKey
export INFURA_ID=yourInfuraId
export PORTIS_API_KEY=yourPortisApiKey
export FORTMATIC_API_KEY=yourFortmaticApiKey
export SQUARELINK_API_KEY=yourSquarelinkApiKey
export WYRE_ENV=dev
```

Here, `WYRE_ENV` is used to determine whether to load the development or production version
of the Wyre widget. `BLOCKNATIVE_API_KEY` is used to connect wallets, and the remaining
API keys are needed to enable connection to that wallet type.

Now install dependencies with:

```text
yarn install
cd app
yarn install
```

## Run App

```text
cd app
yarn run dev
```

## Run Tests

```text
yarn run test
```
