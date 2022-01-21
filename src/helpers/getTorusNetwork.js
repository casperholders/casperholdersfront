import { NETWORK } from '@/helpers/env';

const CHAINS = {
  CASPER_MAINNET: 'casper',
  CASPER_TESTNET: 'casper-test',
};

const SUPPORTED_NETWORKS = {
  [CHAINS.CASPER_MAINNET]: {
    blockExplorerUrl: 'https://cspr.live',
    chainId: '0x1',
    displayName: 'Casper Mainnet',
    logo: 'https://cspr.live/assets/icons/logos/cspr-live-full.svg',
    rpcTarget: 'https://casper-node.tor.us',
    ticker: 'CSPR',
    tickerName: 'Casper Token',
    networkKey: CHAINS.CASPER_MAINNET,
  },
  [CHAINS.CASPER_TESTNET]: {
    blockExplorerUrl: 'https://testnet.cspr.live',
    chainId: '0x2',
    displayName: 'Casper Testnet',
    logo: 'https://testnet.cspr.live/assets/icons/logos/cspr-live-full.svg',
    rpcTarget: 'https://testnet.casper-node.tor.us',
    ticker: 'CSPR',
    tickerName: 'Casper Token',
    networkKey: CHAINS.CASPER_TESTNET,
  },
};

export default function getTorusNetwork() {
  return SUPPORTED_NETWORKS[NETWORK];
}
