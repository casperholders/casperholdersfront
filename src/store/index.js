import Vue from 'vue'
import Vuex from 'vuex'
import {Signer} from "casper-js-sdk";

Vue.use(Vuex)

const debug = process.env.NODE_ENV !== 'production'

const state = () => ({
    drawer: false,
    signer: {
        connected: false,
        lock: false,
        activeKey: null,
        version: "",
    }
})


const getters = {
    drawer: (state) => {
        return state.drawer;
    },
    signer: (state) => {
        return state.signer
    }
}

const mutations = {
    setDrawer (state, { drawer }) {
        state.drawer = drawer;
    },
    setSigner(state, {connected, activeKey, version}) {
        state.signer.connected = connected;
        state.signer.activeKey = activeKey;
        state.signer.version = version;
    },
    updateSigner (state, {connected, lock, activeKey}) {
        state.signer.connected = connected;
        state.signer.activeKey = activeKey;
        state.signer.lock = lock;
    }
}

const actions = {
    toggleDrawer (context) {
        context.commit('setDrawer', {drawer: !this.state.drawer});
    },
    setDrawer (context, drawer) {
        context.commit('setDrawer', {drawer: drawer});
    },
    async updateSignerStatus (context) {
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
        }catch (e) {
            console.log("Unable to retrieve Signer connexion status")
        }
        try {
            version = await Signer.getVersion();
        } catch (e) {
            console.log("Unable to retrieve Signer version")
        }
        context.commit('setSigner', {connected: connected, activeKey: activeKey, version: version});
    },
    connectedSignerEvent(context, detail) {
        context.commit('updateSigner', {connected: detail.isConnected, lock: !detail.isUnlocked, activeKey: detail.activeKey})
    }
}

export default new Vuex.Store({
    state,
    getters,
    mutations,
    actions,
    strict: debug,
})