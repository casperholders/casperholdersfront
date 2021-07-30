# CasperHolders
## The first third party UI to interact with the Casper Blockchain.

### CasperHolders is not affiliated with CasperNetwork / CasperAssociation.This is a project from a community member.

## CasperHolders is not affiliated with CasperNetwork / CasperAssociation.
## This is a project from a community member.

This project contains the sources files for the CasperHolders website.

# Important notes

**The CasperHolders Software doesn't make any external request to any services.**

**Except to the Casper Network itself.**

**The CasperHolders Software doesn't store/share any personal data with anybody.**

**The software doesn't read your private key, and your private key is not saved/shared with anybody.**

**The software doesn't read your smart contract, and your smart contract is not saved/shared with anybody.**

# How to build

## Local dev

```bash
yarn install
yarn serve
```

## Production build for TestNet

Will use the .env.testnet file

```bash
yarn build-testnet
```

## Production build for MainNet

Will use the .env.testnet file

```bash
yarn build-mainnet
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