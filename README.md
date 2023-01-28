# CasperHolders
[![codecov](https://codecov.io/gh/casperholders/casperholdersfront/branch/main/graph/badge.svg?token=J111YFA2Q3)](https://codecov.io/gh/casperholders/casperholdersfront)
[![Lines of Code](https://sonarcloud.io/api/project_badges/measure?project=casperholders_casperholdersfront&metric=ncloc)](https://sonarcloud.io/summary/new_code?id=casperholders_casperholdersfront)
[![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=casperholders_casperholdersfront&metric=sqale_rating)](https://sonarcloud.io/summary/new_code?id=casperholders_casperholdersfront)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=casperholders_casperholdersfront&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=casperholders_casperholdersfront)
[![Reliability Rating](https://sonarcloud.io/api/project_badges/measure?project=casperholders_casperholdersfront&metric=reliability_rating)](https://sonarcloud.io/summary/new_code?id=casperholders_casperholdersfront)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=casperholders_casperholdersfront&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=casperholders_casperholdersfront)

## The first third party UI to interact with the Casper Blockchain.

Built with :
- [pnpm](https://pnpm.io/)
- [Vite 4](https://vitejs.dev/)
- [VueJS 2](https://v2.vuejs.org/)
- [Vuetify 2](https://vuetifyjs.com/en/)
- [Vuex](https://vuex.vuejs.org/)
- [Cypress](https://www.cypress.io/)
- **[Node 16](https://nodejs.org/en/) Important ! Blocking issue for the CI with Node 18**
- **[Docker](https://www.docker.com/) Important ! Needed for E2E local tests**

We plan to refactor a lot of things in the next release. (Vue3 / Vuetify 3 / Pinia etc.)

### CasperHolders is not affiliated with CasperNetwork / CasperAssociation. This is a project from a community member.

This project contains the sources files for the CasperHolders website.

# Important notes

**The CasperHolders Software doesn't make any external request to any services.**

**Except to the Casper Network itself.**

**The CasperHolders Software doesn't store/share any personal data with anybody.**

**The software doesn't read your private key, and your private key is not saved/shared with anybody.**

**The software doesn't read your smart contract, and your smart contract is not saved/shared with anybody.**

# How to build

## Local dev

If you don't have pnpm you can use this documentation : https://pnpm.io/installation

```bash
pnpm install
pnpm dev
```

## Local tests

### !! Important !!

In order to run correctly the tests locally create a file name .env.e2e.local with the following content :

```
VITE_APP_FAKE_KEY="<TestnetPrivateKeyWithoutPem>"
VITE_APP_FAKE_VALIDATOR_KEY="<TestnetValidatorPrivateKeyWithoutPem>"
VITE_APP_FAKE_MULTISIG_KEY="<TestnetMultiSigPrivateKeyWithoutPem>"
VITE_APP_FAKE_SECOND_MULTISIG_KEY="<TestnetSecondMultisigPrivateKeyWithoutPem>"
VITE_APP_E2E=true

VITE_APP_FAKE_KEY="<TestnetPrivateKeyWithoutPem>" # will enable you to test all users interactions (Transfer / Stake / Unstake)  
VITE_APP_FAKE_PUBLIC_KEY="<TestnetPublicKeyHex>" # for ease of use if needed
VITE_APP_FAKE_VALIDATOR_KEY="<TestnetPrivateKeyWithoutPem>" # will enable you to test all validators operations (Add & Withdraw bid)
VITE_APP_FAKE_VALIDATOR_PUBLIC_KEY="<TestnetPublicKeyHex>" # for ease of use if needed
VITE_APP_FAKE_MULTISIG_KEY="<TestnetPrivateKeyWithoutPem>" # main test multisig account.
VITE_APP_FAKE_MULTISIG_PUBLIC_KEY="<TestnetPublicKeyHex>" # for ease of use if needed
VITE_APP_FAKE_SECOND_MULTISIG_KEY="<TestnetPrivateKeyWithoutPem>" # authorized key for the multisig account
VITE_APP_FAKE_SECOND_MULTISIG_PUBLIC_KEY="<TestnetPublicKeyHex>" # for ease of use if needed
VITE_APP_AUCTION_MANAGER_HASH=<SystemContractAuctionHash> # Set automatically with the .github/data/setupNetwork.sh
VITE_APP_RPC=http://localhost:11100/http://mynctl:11101/rpc
VITE_APP_EVENTS=http://localhost:11100/http://mynctl:18101/events/main?start_from=0
VITE_APP_API=http://localhost:19101
VITE_APP_DATA_API=http://localhost:3000
VITE_APP_E2E=true # tell the app to run in E2E mode and will bypass the casper signer to use a local signer with the fake keys provided.
# Check the globalPlugin.js to see how it works.  
VITE_COVERAGE=true
```

### Run tests
#### Prerequisites
```bash
pnpm config set enable-pre-post-scripts true 
```

```bash
pnpm e2e
pnpm test:e2e
```

## Production build for TestNet

Will use the .env.testnet file

```bash
pnpm build-testnet
```

## Production build for MainNet

Will use the .env.testnet file

```bash
pnpm build-mainnet
```

## Docker build

Use the correct value for the mode argument to build either for testnet or mainnet .env file

```bash
docker build --build-arg mode=(testnet|mainnet) . 
```

## Kubernetes deployment

Use the correct folder for either testnet or mainnet config.

### Warning: The current kubernetes files are specific to my kubenertes architecture. It's basically an example how to use CasperHolders on Kubernetes.

```bash
kubectl apply -f kubernetes/(testnet|mainnet)/
```

# Architecture

The CasperHolders application(s) contains actually 4 main parts :

## CasperHolders Front
Contains all the UI for the CasperHolders website (This repo)

The website interact directly with a Casper Node that's why we don't need a proper api.

The connection to a Casper node is done directly with a nginx reverse proxy.

The nginx reverse proxy configuration **is not open source** as this simple to do for any sysadmin and is part of the *commercial** part of the website.

## CasperHolders Core
Contains almost all the CasperHolders logic. [Link](https://github.com/casperholders/casperholderscore)

## CasperParser

Parse the whole blockchain into a database.

This is used to retrieve users operations / smart contracts and calculate the APY faster on the API. [Link](https://github.com/casperholders/casperparser)

## CasperHolders API

[Link](https://github.com/casperholders/casperholdersapi)

Used to retrieve validator metadata, the APY on the network and store multisig deploys.

Can impact the metrics graph on the front page on the website and the ability to send/retrieve multisigs.

You may get some errors in the javascript console by not providing the API url.
    
# Notes
(* Every component hosted on casperholders.io is Open Source and every component hosted on casperholders.com is Closed Source)


