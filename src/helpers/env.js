/**
 * Make some env variables available in the whole app
 */
export const AUCTION_MANAGER_HASH = import.meta.env.VITE_APP_AUCTION_MANAGER_HASH;
export const ACCOUNT_INFO_HASH = import.meta.env.VITE_APP_ACCOUNT_INFO_HASH;
export const NETWORK = import.meta.env.VITE_APP_NETWORK;
export const API = import.meta.env.VITE_APP_API;
export const DATA_API = import.meta.env.VITE_APP_DATA_API;
export const CSPR_LIVE_URL = NETWORK === 'casper' ? 'https://cspr.live/' : 'https://testnet.cspr.live/';
export const HUMAN_READABLE_NETWORK = NETWORK === 'casper' ? 'Mainnet' : 'Testnet';
