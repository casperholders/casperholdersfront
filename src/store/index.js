import clientCasper from '@/helpers/clientCasper';
import deployManager from '@/helpers/deployManager';
import { CASPER_SIGNER, LEDGER_SIGNER, LOCAL_SIGNER, TORUS_SIGNER } from '@/helpers/signers';
import {
  KeyManagementResult,
  TorusSigner,
  LocalSigner,
  LedgerSigner,
  CasperSigner,
} from '@casperholders/core';
import cloneDeep from 'lodash.clonedeep';
import { CLPublicKey, Keys, Signer } from 'casper-js-sdk';
import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

const debug = process.env.NODE_ENV !== 'production';

let randomKey;
let validatorKey;
let multiSigKeys;

/**
 * Generate a random fake asymmetric key for E2E tests
 * @param fakeKey
 * @returns {AsymmetricKey}
 */
function generateAsymmetricKey(fakeKey) {
  const privateKey = Keys.Ed25519.parsePrivateKey(
    Keys.Ed25519.readBase64WithPEM(fakeKey),
  );
  const publicKey = Keys.Ed25519.privateToPublicKey(privateKey);
  return Keys.Ed25519.parseKeyPair(publicKey, privateKey);
}

/**
 * Store the casperApp if the user is connected with ledger
 */
export const ledgerOptions = {
  casperApp: undefined,
};

export const torusOptions = {
  torusInstance: undefined,
};

/**
 * If we run the app in End to End test mode we override the signer with
 * a LocalSigner and set fake keys to be used in the options sent to the signer.
 */
if (process.env.VUE_APP_E2E === 'true') {
  randomKey = generateAsymmetricKey(process.env.VUE_APP_FAKE_KEY);
  validatorKey = generateAsymmetricKey(process.env.VUE_APP_FAKE_VALIDATOR_KEY);
  multiSigKeys = {
    firstKey: generateAsymmetricKey(process.env.VUE_APP_FAKE_MULTISIG_KEY),
    secondKey: generateAsymmetricKey(process.env.VUE_APP_FAKE_SECOND_MULTISIG_KEY),
  };
}

/**
 * Types of signer
 */
const SIGNER_TYPES = {
  [CASPER_SIGNER]: CasperSigner,
  [LOCAL_SIGNER]: LocalSigner,
  [LEDGER_SIGNER]: LedgerSigner,
  [TORUS_SIGNER]: TorusSigner,
};

/**
 * Object used to retrieve the correct options for a given signer Type
 */
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
      keyPath: state.ledger.keyPath,
    }),
    getOptionsForOperations: () => ({
      app: ledgerOptions.casperApp,
      publicKey: state.signer.activeKey,
      keyPath: state.ledger.keyPath,
    }),
    getOptionsForValidatorOperations: () => ({
      app: ledgerOptions.casperApp,
      publicKey: state.signer.activeKey,
      keyPath: state.ledger.keyPath,
    }),
  }),
  [LOCAL_SIGNER]: (state) => ({
    getOptionsForTransfer: () => ({
      key: state.multisig ? multiSigKeys[state.multisig] : randomKey,
    }),
    getOptionsForOperations: () => ({
      key: state.multisig ? multiSigKeys[state.multisig] : randomKey,
    }),
    getOptionsForValidatorOperations: () => ({
      key: validatorKey,
    }),
  }),
  [TORUS_SIGNER]: () => ({
    getOptionsForTransfer: () => ({
      torus: torusOptions.torusInstance,
    }),
    getOptionsForOperations: () => ({
      torus: torusOptions.torusInstance,
    }),
    getOptionsForValidatorOperations: () => ({
      torus: torusOptions.torusInstance,
    }),
  }),
};

/**
 * The vuex store contains :
 * - The Casper Signer state
 * - An array of DeployResult objects used to keep track
 *   of the different deploys done by the user on the website
 * - The type of signer currently used
 * - The state of the connect dialog
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
  offlineDeploys: [],
  weightedDeploys: [],
  connectDialog: false,
  multisig: false,
  ledger: {
    keyPath: 0,
  },
  internet: true,
  impersonatePublicKey: '',
});

const getters = {
  filterOperations: (state) => (operationName) => state.operations
    .filter((operation) => operation.name === operationName),
  getOperation: (state) => (hash) => state.operations
    .filter((operation) => operation.hash.toLowerCase() === hash.toLowerCase())[0],
  signerObject: (state) => SIGNER_TYPES[state.signerType],
  signerOptionsFactory: (state) => SIGNER_OPTIONS_FACTORIES[state.signerType](state),
  activeKey: (state) => (state.impersonatePublicKey !== '' ? state.impersonatePublicKey : state.signer.activeKey),
};

const mutations = {
  updateSigner(state, { connected, activeKey, multisig }) {
    if (connected) {
      state.signer.connected = connected;
    }
    if (activeKey) {
      state.signer.activeKey = activeKey;
    }
    if (multisig) {
      state.multisig = multisig;
    }
    state.signerType = process.env.VUE_APP_E2E === 'true' ? LOCAL_SIGNER : CASPER_SIGNER;
  },
  updateLedger(state, { options }) {
    state.signer.activeKey = options.activeKey.key;
    state.signer.lock = false;
    state.signer.connected = true;
    state.signerType = LEDGER_SIGNER;
    state.ledger.keyPath = options.keyPath;
  },
  updateTorus(state, { publicKey }) {
    state.signer.activeKey = publicKey;
    state.signer.lock = false;
    state.signer.connected = true;
    state.signerType = TORUS_SIGNER;
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
  openConnectDialog(state) {
    state.connectDialog = true;
  },
  closeConnectDialog(state) {
    state.connectDialog = false;
  },
  initConnectivityStatus(state) {
    state.internet = navigator.onLine;
  },
  onlineEvent(state) {
    state.internet = true;
  },
  offlineEvent(state) {
    state.internet = false;
  },
  addOfflineDeploy(state, { pendingDeploy }) {
    state.offlineDeploys.push(pendingDeploy);
  },
  removePendingDeploy(state, { index }) {
    state.offlineDeploys.splice(index, 1);
  },
  removePendingDeployPop(state) {
    state.offlineDeploys.pop();
  },
  addErrorPendingDeploy(state, { index, e }) {
    state.offlineDeploys[index].error = e;
  },
  impersonatePublicKey(state, { publicKey }) {
    state.impersonatePublicKey = publicKey;
  },
  addWeightDeploy(state, { weightDeploy }) {
    state.weightedDeploys.push(weightDeploy);
  },
  removeWeightDeploy(state, { index }) {
    state.weightedDeploys.splice(index, 1);
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
        multisig: detail.isMultisig ? detail.isMultisig : false,
      });
      context.commit('updateSignerLock', { lock: !detail.isUnlocked });
    }
  },
  updateFromLedgerEvent(context, options) {
    context.commit('updateLedger', { options });
  },
  updateFromTorusEvent(context, publicKey) {
    context.commit('updateTorus', { publicKey });
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
  openConnectDialog(context) {
    context.commit('openConnectDialog');
  },
  closeConnectDialog(context) {
    context.commit('closeConnectDialog');
  },
  initConnectivityStatus(context) {
    context.commit('initConnectivityStatus');
  },
  async onlineEvent(context) {
    context.commit('onlineEvent');
    // eslint-disable-next-line no-restricted-syntax
    for (let i = context.state.offlineDeploys.length - 1; i >= 0; i--) {
      const pendingDeploy = context.state.offlineDeploys[i];
      try {
        // eslint-disable-next-line no-await-in-loop
        let currentWeight = 0;
        // eslint-disable-next-line no-await-in-loop
        const latestBlock = await clientCasper.casperRPC.getLatestBlockInfo();
        // eslint-disable-next-line no-await-in-loop
        const stateRootHash = await clientCasper.casperRPC.getStateRootHash(
          latestBlock.block.hash,
        );
        // eslint-disable-next-line no-await-in-loop
        const keyInfo = await clientCasper.casperRPC.getBlockState(
          stateRootHash,
          pendingDeploy.deploy.header.account.toAccountHashStr(),
          [],
        );
        pendingDeploy.deploy.approvals.forEach((approval) => {
          const approvalAccount = keyInfo.Account.associatedKeys.find(
            (v) => v.accountHash === CLPublicKey.fromHex(approval.signer).toAccountHashStr(),
          );
          currentWeight += approvalAccount ? approvalAccount.weight : 0;
        });
        let weightNeeded = keyInfo.Account.actionThresholds.deployment;
        if (pendingDeploy.deployResultType === KeyManagementResult.getName()) {
          weightNeeded = keyInfo.Account.actionThresholds.keyManagement;
        }
        if (currentWeight >= weightNeeded) {
          // eslint-disable-next-line no-await-in-loop,no-unreachable
          const deployResult = await deployManager.sendDeploy(
            pendingDeploy.deploy,
            pendingDeploy.deployResultType,
          );
          context.commit('addDeployResult', { deployResult });
          context.commit('removePendingDeployPop');
        } else {
          const weightDeploy = cloneDeep(pendingDeploy);
          context.commit('addWeightDeploy', { weightDeploy });
          context.commit('removePendingDeployPop');
        }
      } catch (e) {
        console.log(e);
        context.commit('addErrorPendingDeploy', { i, e });
      }
    }
  },
  async retrySendingDeploy(context, index) {
    try {
      const deployResult = await deployManager.sendDeploy(
        context.state.offlineDeploys[index].deploy,
        context.state.offlineDeploys[index].deployResultType,
      );
      context.commit('addDeployResult', { deployResult });
      context.commit('removePendingDeploy', { index });
    } catch (e) {
      context.commit('addErrorPendingDeploy', { index, e });
    }
  },
  offlineEvent(context) {
    context.commit('offlineEvent');
  },
  addOfflineDeploy(context, pendingDeploy) {
    context.commit('addOfflineDeploy', { pendingDeploy });
  },
  removeOfflineDeploy(context, index) {
    context.commit('removePendingDeploy', { index });
  },
  impersonatePublicKey(context, publicKey) {
    context.commit('impersonatePublicKey', { publicKey });
  },
  addWeightDeploy(context, weightDeploy) {
    context.commit('addWeightDeploy', { weightDeploy });
  },
  removeWeightDeploy(context, index) {
    context.commit('removeWeightDeploy', { index });
  },
};

export default new Vuex.Store({
  state: initialState,
  getters,
  mutations,
  actions,
  strict: debug,
});
