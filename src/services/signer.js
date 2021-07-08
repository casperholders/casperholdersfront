import store from "../store";
import {NoActiveKeyError} from "./errors/noActiveKeyError";
import {CLPublicKey, DeployUtil, Signer as SignerLib} from "casper-js-sdk";
import {SignError} from "@/services/errors/signError";
import {Api} from "@/services/api";

const NETWORK = process.env.VUE_APP_NETWORK
const VALIDATOR = process.env.VUE_APP_VALIDATOR

export class Signer {
    static get activeKey() {
        if (store.state.signer.connected && store.state.signer.activeKey) {
            return store.state.signer.activeKey;
        }

        throw new NoActiveKeyError();
    }

    static async prepareAndSignTransferDeploy(address, amount, transferID) {
        const paymentAmount = 10000;
        let deployParams = new DeployUtil.DeployParams(
            CLPublicKey.fromHex(Signer.activeKey),
            NETWORK
        );
        let session = DeployUtil.ExecutableDeployItem.newTransfer(
            amount * 1000000000,
            CLPublicKey.fromHex(address),
            undefined,
            transferID
        );
        let payment = DeployUtil.standardPayment(paymentAmount);
        let deploy = DeployUtil.makeDeploy(deployParams, session, payment);
        let deployJson = DeployUtil.deployToJson(deploy)

        console.log(DeployUtil.validateDeploy(DeployUtil.deployFromJson(deployJson)))

        try {
            return await SignerLib.sign(deployJson, Signer.activeKey, address)
        } catch (e) {
            console.log(e);
            throw new SignError();
        }
    }

    static async prepareAndSignFromApi(operation, amount){
        const parsedDeploy = await Api.post(`${operation}/prepare`,{
            amount: amount,
            from: Signer.activeKey
        })

        try {
            return await SignerLib.sign(parsedDeploy, Signer.activeKey, VALIDATOR)
        } catch (e) {
            console.log(e)
            throw new SignError();
        }
    }

    static async prepareAndSignDelegateDeploy(amount){
        return await Signer.prepareAndSignFromApi('delegate', amount);
    }

    static async prepareAndSignUndelegateDeploy(amount){
        return await Signer.prepareAndSignFromApi('undelegate', amount);
    }

    static async prepareAndSignAddBidDeploy(amount) {
        return await Signer.prepareAndSignFromApi('addbid', amount);
    }

    static async prepareAndSignWithdrawDeploy(amount) {
        return await Signer.prepareAndSignFromApi('withdrawbid', amount);
    }
}