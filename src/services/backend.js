import store from '../store'
import {CLPublicKey, CLString, CLU512, CLU8, DeployUtil, RuntimeArgs, Signer} from "casper-js-sdk";

export class Backend {
    static #signer = store.state.signer;

    //TODO Keeping this as an example. Waiting for an actual response from the casper team
    static async sendAddBid(amount) {
        const networkName = this.getNetwork();
        const paymentAmount = 10000;
        const publicKey = CLPublicKey.fromHex(this.#signer.activeKey);
        let deployParams = new DeployUtil.DeployParams(
            publicKey,
            networkName
        );
        console.log(Buffer.from("hash-3c0c3884a1f853de3cc3b77ce2f1146f8e6e2ec83583a8f17c98710b20cadc8a"))
        let session = DeployUtil.ExecutableDeployItem.newStoredContractByHash(
            new CLString("hash-3c0c3884a1f853de3cc3b77ce2f1146f8e6e2ec83583a8f17c98710b20cadc8a").clType().toBytes(),
            "add_bid",
            RuntimeArgs.fromMap({
                public_key: publicKey,
                amount: new CLU512(amount*1000000000),
                delegation_rate: new CLU8(10)
            })
        );
        let payment = DeployUtil.standardPayment(paymentAmount);
        let deploy = DeployUtil.makeDeploy(deployParams, session, payment);
        console.log(DeployUtil.validateDeploy(deploy))
        let deployJson = DeployUtil.deployToJson(deploy)
        let signedDeploy


        try {
            signedDeploy = await Signer.sign(deployJson, this.#signer.activeKey, this.#signer.activeKey)
            console.log(DeployUtil.validateDeploy(DeployUtil.deployFromJson(signedDeploy)))
        } catch (e) {
            console.log(e);
            throw "Failed to sign the contract. Please retry if you canceled the operation.";
        }

        try {
            let transferData = await (await fetch(this.getApi() + "/addBid/", {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    deploy: signedDeploy
                })
            })).json()

            return transferData.deploy_hash
        } catch (e) {
            console.log(e)
            throw "Failed to fetch internal api to send deploy.";
        }
    }

    static getApi(){
        return process.env.VUE_APP_API
    }

    static getValidator(){
        return process.env.VUE_APP_VALIDATOR
    }

    static getNetwork(){
        return process.env.VUE_APP_NETWORK
    }
}