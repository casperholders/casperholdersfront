# CasperHolders

## The first third party UI to interact with the Casper Blockchain.

## CasperHolders is not affiliated with CasperNetwork / CasperAssociation.
## This is a project from a community member.

This project contains the sources files for the CasperHolders website.

The CasperHolders software is closed source for the moment.

- For the simple fact that Casper GoLang SDK / JS SDK are not fully released / functional
- And to ensure my validator node can profit from this work

When CasperNetwork release the full SDK I will rewrite the majority of the code to ensure a proper integration.

After that the source code will be release in the coming months.

## FAQ

### Why the CasperHolders software is slow on windows ?
The technology behind the CasperHolder software rely on the default WebView provided by Windows wich is Internet Explorer 11 ...

And so the CasperHolders can be a bit slow compared to Linux. To mitigate that the particles background is disabled by default on Windows !

### What does the CasperHolders exactly ?
CasperHolder use the casper-client developed by CasperNetwork.

For example on Linux you must install the casper-client CLI before using the CasperHolders software.

On Windows you must install WSL2 and Docker. The casper-client is wrapped inside a docker container to eliminate the need to build smart contracts or anything else.

# Important notes

**The CasperHolders Software doesn't make any external request to any services.**

**Except the Casper Network itself and the CasperHolders website to ensure that you run the latest software version available.**

**The CasperHolders Software doesn't share any data with anybody.**

**The software doesn't read your private key, and your private key is not saved/shared with anybody.**

**The software only use the path of your private key as an argument in the casper-client CLI.**

# Run locally

```
yarn install
yarn serve
```
