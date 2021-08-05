import {Balance, CasperSigner, ClientCasper, DeployManager} from "@casperholders/core";
import {VuexKeyManager} from "@/services/keys/vuexKeyManager";

const AUCTION_MANAGER_HASH = process.env.VUE_APP_AUCTION_MANAGER_HASH;
const NETWORK = process.env.VUE_APP_NETWORK;
const VALIDATOR = process.env.VUE_APP_VALIDATOR;
const RPC = process.env.VUE_APP_RPC;
const API = process.env.VUE_APP_API;

const client = new ClientCasper(RPC);
const deployManager = new DeployManager(client);
const balance = new Balance(VuexKeyManager, client, VALIDATOR);
const signer = CasperSigner;

export default {

    install(Vue) {
        Vue.prototype.$getCsprLiveUrl = function () {
            if (NETWORK === "casper") {
                return "https://cspr.live/"
            }
            return "https://testnet.cspr.live/"
        }
        Vue.prototype.$getValidator = function () {
            return process.env.VUE_APP_VALIDATOR
        }
        Vue.prototype.$getValidatorUrl = function () {
            return this.$getCsprLiveUrl() + "validator/" + this.$getValidator();
        }
        Vue.prototype.$getAuctionHash = function () {
            return AUCTION_MANAGER_HASH;
        }
        Vue.prototype.$getNetwork = function () {
            return NETWORK;
        }
        Vue.prototype.$getApi = function () {
            return API;
        }
        Vue.prototype.$getHumanReadableNetwork = function () {
            if (NETWORK === "casper") {
                return "MainNet";
            }
            return "TestNet";
        }
        Vue.prototype.$getBalanceService = function () {
            return balance;
        }
        Vue.prototype.$getSigner = function () {
            return signer;
        }
        Vue.prototype.$getDeployManager = function () {
            return deployManager;
        }
    }
}