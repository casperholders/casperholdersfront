/**
 * Make some env variables available in the whole app
 */
export const AUCTION_MANAGER_HASH = process.env.VUE_APP_AUCTION_MANAGER_HASH;
export const ACCOUNT_INFO_HASH = process.env.VUE_APP_ACCOUNT_INFO_HASH;
export const NETWORK = process.env.VUE_APP_NETWORK;
export const API = process.env.VUE_APP_API;
export const DATA_API = process.env.VUE_APP_DATA_API;
export const CSPR_LIVE_URL = NETWORK === 'casper' ? 'https://cspr.live/' : 'https://testnet.cspr.live/';
export const HUMAN_READABLE_NETWORK = NETWORK === 'casper' ? 'MainNet' : 'TestNet';
