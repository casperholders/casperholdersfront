import { CASPER_SIGNER, LEDGER_SIGNER, LOCAL_SIGNER } from '@/helpers/signers';
import { CasperSigner } from '@casperholders/core/dist/services/signers/casperSigner';
import { LedgerSigner } from '@casperholders/core/dist/services/signers/ledgerSigner';
import { LocalSigner } from '@casperholders/core/dist/services/signers/localSigner';
import { Keys, Signer } from 'casper-js-sdk';
import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

const debug = process.env.NODE_ENV !== 'production';

let randomKey;
let validatorKey;

function generateAsymmetricKey(fakeKey) {
  const privateKey = Keys.Ed25519.parsePrivateKey(
    Keys.Ed25519.readBase64WithPEM(fakeKey),
  );
  const publicKey = Keys.Ed25519.privateToPublicKey(privateKey);
  return Keys.Ed25519.parseKeyPair(publicKey, privateKey);
}

export const ledgerOptions = {
  casperApp: undefined,
};

/**
 * If we run the app in End to End test mode we override the signer with
 * a LocalSigner and set fake keys to be used in the options sent to the signer.
 */
if (process.env.VUE_APP_E2E === 'true') {
  randomKey = generateAsymmetricKey(process.env.VUE_APP_FAKE_KEY);
  validatorKey = generateAsymmetricKey(process.env.VUE_APP_FAKE_VALIDATOR_KEY);
}

const SIGNER_TYPES = {
  [CASPER_SIGNER]: CasperSigner,
  [LOCAL_SIGNER]: LocalSigner,
  [LEDGER_SIGNER]: LedgerSigner,
};

const SIGNER_OPTIONS_FACTORIES = {
  [CASPER_SIGNER]: (state) => ({
    getOptionsForTransfer: (to) => ({
      activeKey: state.signer.activeKey,
      to,
    }),
    getOptionsForOperations: () => ({
      activeKey: state.signer.activeKey,
      to: state.signer.activeKey,
    }),
    getOptionsForValidatorOperations: () => ({
      activeKey: state.signer.activeKey,
      to: state.signer.activeKey,
    }),
  }),
  [LEDGER_SIGNER]: (state) => ({
    getOptionsForTransfer: () => ({
      app: ledgerOptions.casperApp,
      publicKey: state.signer.activeKey,
    }),
    getOptionsForOperations: () => ({
      app: ledgerOptions.casperApp,
      publicKey: state.signer.activeKey,
    }),
    getOptionsForValidatorOperations: () => ({
      app: ledgerOptions.casperApp,
      publicKey: state.signer.activeKey,
    }),
  }),
  [LOCAL_SIGNER]: () => ({
    getOptionsForTransfer: () => ({
      key: randomKey,
    }),
    getOptionsForOperations: () => ({
      key: randomKey,
    }),
    getOptionsForValidatorOperations: () => ({
      key: validatorKey,
    }),
  }),
  // [LEDGER_SIGNER]: undefined,
};

/**
 * The vuex store contains :
 * - The Casper Signer state
 * - An array of DeployResult objects used to keep track
 *   of the different deploys done by the user on the website
 */
const initialState = () => ({
  signer: {
    connected: process.env.VUE_APP_E2E === 'true',
    lock: false,
    activeKey: null,
    version: '',
  },
  signerType: process.env.VUE_APP_E2E === 'true' ? LOCAL_SIGNER : '',
  operations: [],
});

const getters = {
  filterOperations: (state) => (operationName) => state.operations
    .filter((operation) => operation.name === operationName),
  getOperation: (state) => (hash) => state.operations
    .filter((operation) => operation.hash.toLowerCase() === hash.toLowerCase())[0],
  signerObject: (state) => SIGNER_TYPES[state.signerType],
  signerOptionsFactory: (state) => SIGNER_OPTIONS_FACTORIES[state.signerType](state),
};

const mutations = {
  updateSigner(state, { connected, activeKey }) {
    if (connected) {
      state.signer.connected = connected;
    }
    if (activeKey) {
      state.signer.activeKey = activeKey;
    }
    state.signerType = process.env.VUE_APP_E2E === 'true' ? LOCAL_SIGNER : CASPER_SIGNER;
  },
  updateLedger(state, { activeKey }) {
    state.signer.activeKey = `02${activeKey}`;
    state.signer.lock = false;
    state.signer.connected = true;
    state.signerType = LEDGER_SIGNER;
  },
  updateSignerLock(state, { lock }) {
    state.signer.lock = lock;
  },
  updateSignerVersion(state, { version }) {
    state.signer.version = version;
  },
  addDeployResult(state, { deployResult }) {
    state.operations.push(deployResult);
  },
  removeDeployResult(state, { deployResult }) {
    state.operations.splice(
      state.operations.findIndex(
        (operation) => operation.hash.toLowerCase() === deployResult.hash.toLowerCase(),
      ),
      1,
    );
  },
  updateDeployResult(state, { deployResult }) {
    state.operations.splice(
      state.operations.findIndex(
        (operation) => operation.hash.toLowerCase() === deployResult.hash.toLowerCase(),
      ),
      1,
      deployResult,
    );
  },
  logout(state) {
    state.signer.activeKey = null;
    state.signer.lock = false;
    state.signer.connected = false;
    state.signerType = '';
  },
};

const actions = {
  /**
   * Get the initial signer state
   * @param context
   * @returns {Promise<void>}
   */
  async initSignerStatus(context) {
    let version = '';
    try {
      version = await Signer.getVersion();
    } catch (e) {
      console.log('Unable to retrieve Signer version');
    }
    context.commit('updateSignerVersion', { version });
  },
  updateFromSignerEvent(context, detail) {
    if (this.state.signerType === CASPER_SIGNER || this.state.signerType === LOCAL_SIGNER || this.state.signerType === '') {
      context.commit('updateSigner', {
        connected: detail.isConnected,
        activeKey: detail.activeKey,
      });
      context.commit('updateSignerLock', { lock: !detail.isUnlocked });
    }
  },
  updateFromLedgerEvent(context, activeKey) {
    context.commit('updateLedger', { activeKey });
  },
  addDeployResult(context, deployResult) {
    context.commit('addDeployResult', { deployResult });
  },
  removeDeployResult(context, deployResult) {
    context.commit('removeDeployResult', { deployResult });
  },
  updateDeployResult(context, deployResult) {
    context.commit('updateDeployResult', { deployResult });
  },
  logout(context) {
    context.commit('logout');
  },
};

export default new Vuex.Store({
  state: initialState,
  getters,
  mutations,
  actions,
  strict: debug,
});
