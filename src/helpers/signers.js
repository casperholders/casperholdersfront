import casper from '@/assets/images/casper_logo.svg';
import casperWalletSvg from '@/assets/images/casperWallet.svg';
import ledger from '@/assets/images/ledger_logo.png';
import metaMask from '@/assets/images/metaMask.svg';
import torus from '@/assets/images/torus.svg';

/**
 * Make types of signer available in the whole app
 */
export const CASPER_SIGNER = 'casperSigner';
export const LOCAL_SIGNER = 'localSigner';
export const LEDGER_SIGNER = 'ledgerSigner';
export const METAMASK_SIGNER = 'metamaskSigner';
export const CASPER_WALLET_SIGNER = 'casperWalletSigner';
export const TORUS_SIGNER = 'torusSigner';

export const SIGNERS_INFO = {
  metamaskSigner: {
    title: 'Metamask',
    icon: metaMask,
    description: 'The leading self-custodial wallet',
    walletId: 'connectCasperWallet',
    disabled: () => !window.ethereum,
    download: 'https://metamask.io/',
  },
  casperWalletSigner: {
    title: 'Casper Wallet',
    icon: casperWalletSvg,
    description: 'Native wallet for the Casper Network',
    walletId: 'connectCasperWallet',
    disabled: () => !window.CasperWalletInstance,
    download: 'https://www.casperwallet.io/',
  },
  casperSigner: {
    title: 'Casper Signer',
    icon: casper,
    description: 'Legacy wallet for the Casper Network',
    walletId: 'connectCasperSigner',
    disabled: () => !window.casperlabsHelper,
    download: 'https://chrome.google.com/webstore/detail/casper-signer/djhndpllfiibmcdbnmaaahkhchcoijce',
  },
  ledgerSigner: {
    title: 'Ledger',
    icon: ledger,
    description: 'Unlock your ledger and open the Casper app first.',
    walletId: 'connectLedger',
    disabled: () => false,
  },
  torusSigner: {
    title: 'Torus',
    icon: torus,
    description: 'Non-custodial Key Management, Meets Passwordless Auth.',
    walletId: 'connectTorus',
    disabled: () => false,
  },
};

export const LEDGER_TYPES = {
  LEDGER_BLE: {
    title: 'Ledger Bluetooth',
    icon: ledger,
    description: 'Support Nano X on Web & Mobile',
    walletId: 'connectLedgerBLE',
    disabled: () => false,
  },
  LEDGER_USB: {
    title: 'Ledger USB',
    icon: ledger,
    description: 'Support Nano S/X on Web & Android Chrome (OTG)',
    walletId: 'connectLedgerUSB',
    disabled: () => false,
  },
};
