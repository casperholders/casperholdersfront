import Vue from 'vue'
import Vuex from 'vuex'
import {Signer} from "casper-js-sdk";

Vue.use(Vuex)

const debug = process.env.NODE_ENV !== 'production'

const state = () => ({
    signer: {
        connected: false,
        lock: false,
        activeKey: null,
        version: "",
    },
    operations: []
})

const getters = {
    filterOperations: (state) => (operationName) => {
        return state.operations.filter(operation => operation.name === operationName)
    },
    getOperation: (state) => (hash) => {
        return state.operations.filter(operation => operation.hash === hash)[0]
    },
}

const mutations = {
    updateSigner(state, {connected, activeKey}) {
        if(connected){
            state.signer.connected = connected;
        }
        if(activeKey){
            state.signer.activeKey = activeKey;
        }
    },
    updateSignerLock(state, {lock}) {
        state.signer.lock = lock
    },
    updateSignerVersion(state, {version}) {
        state.signer.version = version;
    },
    addDeployResult(state, {deployResult}) {
        state.operations.push(deployResult)
    },
    removeDeployResult(state, {deployResult}) {
        state.operations.splice(state.operations.findIndex(operation => operation.hash === deployResult.hash), 1);
    },
    updateDeployResult(state, {deployResult}) {
        state.operations.splice(state.operations.findIndex(operation => operation.hash === deployResult.hash), 1, deployResult);
    }
}

const actions = {
    async initSignerStatus(context) {
        let connected = false;
        let activeKey = "";
        let version = "";
        try {
            connected = await Signer.isConnected();
            try {
                activeKey = await Signer.getActivePublicKey();
            } catch (e) {
                console.log("Unable to retrieve Signer active key")
            }
        } catch (e) {
            console.log("Unable to retrieve Signer connexion status")
        }
        try {
            version = await Signer.getVersion();
        } catch (e) {
            console.log("Unable to retrieve Signer version")
        }
        context.commit('updateSigner', {connected: connected, activeKey: activeKey});
        context.commit('updateSignerVersion', {version: version});
    },
    updateFromSignerEvent(context, detail) {
        context.commit('updateSigner', {connected: detail.isConnected, activeKey: detail.activeKey});
        context.commit('updateSignerLock', {lock: !detail.isUnlocked});
    },
    addDeployResult(context, deployResult) {
        context.commit('addDeployResult', {deployResult: deployResult})
    },
    removeDeployResult(context, deployResult) {
        context.commit('removeDeployResult', {deployResult: deployResult})
    },
    updateDeployResult(context, deployResult) {
        context.commit('updateDeployResult', {deployResult: deployResult})
    }
}

export default new Vuex.Store({
    state,
    getters,
    mutations,
    actions,
    strict: debug,
})