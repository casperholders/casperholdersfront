import VuexKeyManager from '@/services/keys/vuexKeyManager';
import { Balance } from '@casperholders/core/dist/services/balance/balance';
import { ClientCasper } from '@casperholders/core/dist/services/clients/clientCasper';
import { DeployManager } from '@casperholders/core/dist/services/deploys/deployManager';
import { CasperSigner } from '@casperholders/core/dist/services/signers/casperSigner';
import { LocalSigner } from '@casperholders/core/dist/services/signers/localSigner';
import { Keys } from 'casper-js-sdk';

const AUCTION_MANAGER_HASH = process.env.VUE_APP_AUCTION_MANAGER_HASH;
const ACCOUNT_INFO_HASH = process.env.VUE_APP_ACCOUNT_INFO_HASH;
const NETWORK = process.env.VUE_APP_NETWORK;
const VALIDATOR = process.env.VUE_APP_VALIDATOR;
const RPC = process.env.VUE_APP_RPC;
const API = process.env.VUE_APP_API;

const client = new ClientCasper(RPC);
const deployManager = new DeployManager(client);
const balance = new Balance(VuexKeyManager, client, VALIDATOR);
let signer = CasperSigner;
let key;
let validatorKey;

/**
 * If we run the app in End to End test mode we override the signer with
 * a LocalSigner and set fake keys to be used in the options sent to the signer.
 */
if (process.env.VUE_APP_E2E === 'true') {
  signer = LocalSigner;
  let privateKey = Keys.Ed25519.parsePrivateKey(
    Keys.Ed25519.readBase64WithPEM(process.env.VUE_APP_FAKE_KEY),
  );
  let publicKey = Keys.Ed25519.privateToPublicKey(privateKey);
  key = Keys.Ed25519.parseKeyPair(publicKey, privateKey);
  privateKey = Keys.Ed25519.parsePrivateKey(
    Keys.Ed25519.readBase64WithPEM(process.env.VUE_APP_FAKE_VALIDATOR_KEY),
  );
  publicKey = Keys.Ed25519.privateToPublicKey(privateKey);
  validatorKey = Keys.Ed25519.parseKeyPair(publicKey, privateKey);
}

/**
 * This plugin is used to expose different object / env value to the Vue instance
 */
export default {
  install(Vue) {
    /* eslint-disable no-param-reassign */
    Vue.prototype.$getCsprLiveUrl = () => (
      NETWORK === 'casper' ? 'https://cspr.live/' : 'https://testnet.cspr.live/'
    );
    Vue.prototype.$getValidator = () => process.env.VUE_APP_VALIDATOR;
    Vue.prototype.$getValidatorUrl = function () {
      return `${this.$getCsprLiveUrl()}validator/${this.$getValidator()}`;
    };
    Vue.prototype.$getAuctionHash = () => AUCTION_MANAGER_HASH;
    Vue.prototype.$getAccountInfoHash = () => ACCOUNT_INFO_HASH;
    Vue.prototype.$getClientCasper = () => client;
    Vue.prototype.$getNetwork = () => NETWORK;
    Vue.prototype.$getApi = () => API;
    Vue.prototype.$getHumanReadableNetwork = () => (
      NETWORK === 'casper' ? 'MainNet' : 'TestNet'
    );
    Vue.prototype.$getBalanceService = () => balance;
    Vue.prototype.$getSigner = () => signer;
    Vue.prototype.$getDeployManager = () => deployManager;
    Vue.prototype.$getOptionsActiveKey = function () {
      if (process.env.VUE_APP_E2E === 'true') {
        return {
          key,
        };
      }
      return {
        activeKey: this.$store.state.signer.activeKey,
        to: this.$store.state.signer.activeKey,
      };
    };
    Vue.prototype.$getOptionsActiveKeyValidatorOperations = function () {
      if (process.env.VUE_APP_E2E === 'true') {
        return {
          key: validatorKey,
        };
      }
      return {
        activeKey: this.$store.state.signer.activeKey,
        to: this.$store.state.signer.activeKey,
      };
    };
    Vue.prototype.$getOptionsValidator = function () {
      if (process.env.VUE_APP_E2E === 'true') {
        return {
          key,
        };
      }
      return {
        activeKey: this.$store.state.signer.activeKey,
        to: process.env.VUE_APP_VALIDATOR,
      };
    };
    Vue.prototype.$getOptionsTo = function (to) {
      if (process.env.VUE_APP_E2E === 'true') {
        return {
          key,
        };
      }
      return {
        activeKey: this.$store.state.signer.activeKey,
        to,
      };
    };
  },
};
