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
    alerts: []
})

const getters = {
}

const mutations = {
    setSigner(state, {connected, activeKey, version}) {
        state.signer.connected = connected;
        state.signer.activeKey = activeKey;
        state.signer.version = version;
    },
    updateSigner (state, {connected, lock, activeKey}) {
        state.signer.connected = connected;
        state.signer.activeKey = activeKey;
        state.signer.lock = lock;
    },
    alertSigner (state) {
        const alertSigner = state.alerts.findIndex((alert) => alert.message === "Signer not connected")

        if (state.signer.connected && state.signer.activeKey != null){
            state.alerts.push({
                message: "Signer connected",
                bottom: true,
                right: true,
                color: 'green',
                transition: 'fade-transition',
                timeout: 1000,
            })
            if(alertSigner > -1) {
                state.alerts.splice(alertSigner, 1);
            }
        }
        if ((!state.signer.connected || state.signer.activeKey == null) && alertSigner === -1){
            state.alerts.push({
                message: "Signer not connected",
                bottom: true,
                right: true,
                color: 'red',
                transition: 'fade-transition',
                timeout: -1,
            })
        }
    },
    alert (state, {message, color, timeout}) {
        state.alerts.push({
            message: message,
            bottom: true,
            right: true,
            color: color,
            transition: 'fade-transition',
            timeout: timeout,
        })
    },
    updateAlerts(state, {alerts}){
        state.alerts = alerts
    }
}

const actions = {
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
        context.commit('alertSigner');
    },
    connectedSignerEvent(context, detail) {
        context.commit('updateSigner', {connected: detail.isConnected, lock: !detail.isUnlocked, activeKey: detail.activeKey});
        context.commit('alertSigner');
    },
    alert(context, detail){
        context.commit('alert', {message: detail.message, color: detail.color, timeout: detail.timeout});
    },
    updateAlerts(context, detail){
        context.commit("updateAlerts", {alerts: detail})
    }
}

export default new Vuex.Store({
    state,
    getters,
    mutations,
    actions,
    strict: debug,
})