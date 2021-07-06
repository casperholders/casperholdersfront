import store from '../store'
import {CLPublicKey, CLString, CLU512, CLU8, DeployUtil, RuntimeArgs, Signer} from "casper-js-sdk";

export class Backend {
    static #signer = store.state.signer;

    static async getBalance() {
        if (this.#signer.connected && this.#signer.activeKey !== null) {
            try {
                const balanceData = await (await fetch(this.getApi() + "/balance/" + this.#signer.activeKey)).json()
                return balanceData.balance / 1000000000
            } catch (e) {
                console.log(e)
                throw "Unknown. Please check your public key hex."
            }
        }
        throw "Unknown. Unlock and/or connect to Casper Signer first."
    }

    static async getStakeBalance() {
        let stakeData
        try {
            stakeData = await (await fetch(this.getApi()+"/balance/stake/" + this.#signer.activeKey)).json()
        } catch (e) {
            console.log(e)
            throw "Unknown. Please check your public key hex."
        }
        if (stakeData.balance === 0){
            throw stakeData.error
        }
        return stakeData.balance / 1000000000
    }

    static async getValidatorBalance() {
        if (this.#signer.connected && this.#signer.activeKey !== null) {
            try {
                const balanceData = await (await fetch(this.getApi() + "/balance/validator/" + this.#signer.activeKey)).json()
                return {
                    balance: balanceData.balance / 1000000000,
                    commission: balanceData.commission
                }
            } catch (e) {
                console.log(e)
                throw "Unknown. Please check that your node is correctly bonded to the network."
            }
        }
        throw "Unknown. Unlock and/or connect to Casper Signer first."
    }

    static async sendDelegate(amount){
        let parsedDeploy
        let signedDeploy

        try {
            const delegatePrepareData = await (await fetch(this.getApi() + "/delegate/prepare", {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    amount: amount,
                    from: this.#signer.activeKey
                })
            })).json()

            parsedDeploy = DeployUtil.deployToJson(DeployUtil.deployFromJson(delegatePrepareData))
        } catch (e) {
            console.log(e);
            throw "Failed to fetch internal api to prepare contract";
        }

        try {
            signedDeploy = await Signer.sign(parsedDeploy, this.#signer.activeKey, this.getValidator())
        } catch (e) {
            console.log(e)
            throw "Failed to sign the contract. Please retry if you canceled the operation.";
        }

        try {
            const delegateData = await (await fetch(this.getApi() + "/delegate/", {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    deploy: signedDeploy
                })
            })).json()
            return delegateData.deploy_hash
        } catch (e) {
            console.log(e)
            throw "Failed to fetch internal api to send deploy.";
        }
    }

    static async sendUndelegate(amount){
        let parsedDeploy
        let signedDeploy

        try {
            const undelegatePrepareData = await (await fetch(this.getApi() + "/undelegate/prepare", {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    amount: amount,
                    from: this.#signer.activeKey
                })
            })).json()
            parsedDeploy = DeployUtil.deployToJson(DeployUtil.deployFromJson(undelegatePrepareData))
        } catch (e) {
            console.log(e);
            throw "Failed to fetch internal api to prepare contract";
        }

        try {
            signedDeploy = await Signer.sign(parsedDeploy, this.#signer.activeKey, this.getValidator())
        } catch (e) {
            console.log(e)
            throw "Failed to sign the contract. Please retry if you canceled the operation.";
        }

        try {
            const undelegateData = await (await fetch(this.getApi() + "/undelegate/", {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    deploy: signedDeploy
                })
            })).json()
            return undelegateData.deploy_hash
        } catch (e) {
            console.log(e)
            throw "Failed to fetch internal api to send deploy.";
        }
    }

    static async sendTransfer(address, amount, transferID) {
        const networkName = this.getNetwork();
        const paymentAmount = 10000;
        const from = CLPublicKey.fromHex(this.#signer.activeKey);
        const to = CLPublicKey.fromHex(address);
        let deployParams = new DeployUtil.DeployParams(
            from,
            networkName
        );
        let session = DeployUtil.ExecutableDeployItem.newTransfer(
            amount * 1000000000,
            to,
            undefined,
            transferID
        );
        let payment = DeployUtil.standardPayment(paymentAmount);
        let deploy = DeployUtil.makeDeploy(deployParams, session, payment);
        let deployJson = DeployUtil.deployToJson(deploy)
        let signedDeploy


        try {
            signedDeploy = await Signer.sign(deployJson, this.#signer.activeKey, address)
            DeployUtil.validateDeploy(DeployUtil.deployFromJson(signedDeploy))
        } catch (e) {
            console.log(e);
            throw "Failed to sign the contract. Please retry if you canceled the operation.";
        }

        try {
            let transferData = await (await fetch(this.getApi() + "/transfer/", {
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