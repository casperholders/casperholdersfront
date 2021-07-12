import {AuctionManager} from "@/services/auctionManager";
import {CasperSigner} from "@/services/casperSigner";
import {DeployManager} from "@/services/deployManager";
import {CasperKeyManager} from "@/services/casperKeyManager";
import {Balance} from "@/services/balance";
import {TransferManager} from "@/services/transferManager";
import {ClientCasper} from "@/services/clientCasper";

const AUCTION_MANAGER_HASH = process.env.VUE_APP_AUCTION_MANAGER_HASH;
const NETWORK = process.env.VUE_APP_NETWORK;
const VALIDATOR = process.env.VUE_APP_VALIDATOR;
const RPC = process.env.VUE_APP_RPC
const signer = new CasperSigner(null);
const client = new ClientCasper(RPC)
const deployManager = new DeployManager(NETWORK, client);
const auctionManager = new AuctionManager(AUCTION_MANAGER_HASH, signer, deployManager, VALIDATOR, CasperKeyManager);
const balance = new Balance(CasperKeyManager, client, VALIDATOR)
const transferManager = new TransferManager(signer,deployManager,CasperKeyManager)

export default {

    install(Vue) {
        Vue.prototype.getCsprLiveUrl = function () {
            if (this.getNetwork() === "casper") {
                return "https://cspr.live/"
            }
            return "https://testnet.cspr.live/"
        }
        Vue.prototype.getNetwork = function () {
            return process.env.VUE_APP_NETWORK
        }
        Vue.prototype.getValidator = function () {
            return process.env.VUE_APP_VALIDATOR
        }
        Vue.prototype.getApi = function () {
            return process.env.VUE_APP_API
        }
        Vue.prototype.getValidatorUrl = function () {
            return this.getCsprLiveUrl() + "validator/" + this.getValidator();
        }
        Vue.prototype.getAuctionManager = function () {
            return auctionManager;
        }
        Vue.prototype.getActiveKey = function () {
            return CasperKeyManager.activeKey;
        }
        Vue.prototype.getBalanceService = function () {
            return balance;
        }
        Vue.prototype.getTransferManager = function () {
            return transferManager;
        }
    }
}