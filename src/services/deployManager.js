import {CLPublicKey, DeployUtil} from "casper-js-sdk";

export class DeployManager {
    #network;
    #client;

    constructor(network, client) {
        this.#network = network;
        this.#client = client;
    }

    prepareDeployTransfer(from, amount, target,  transferID){
        let deployParams = new DeployUtil.DeployParams(
            CLPublicKey.fromHex(from),
            this.#network
        );
        let session = DeployUtil.ExecutableDeployItem.newTransfer(
            amount * 1000000000,
            CLPublicKey.fromHex(target),
            undefined,
            transferID
        );
        let payment = DeployUtil.standardPayment(10000);
        let deploy = DeployUtil.makeDeploy(deployParams, session, payment);
        return DeployUtil.deployToJson(deploy)
    }

    prepareDeployContractStoredByHash(from, hash, entryPoint, args, fee){
        let deployParams = new DeployUtil.DeployParams(
            CLPublicKey.fromHex(from),
            this.#network
        );
        let session = DeployUtil.ExecutableDeployItem.newStoredContractByHash(
            Uint8Array.from(Buffer.from(hash, "hex")),
            entryPoint,
            args
        );
        let payment = DeployUtil.standardPayment(fee);
        let deploy = DeployUtil.makeDeploy(deployParams, session, payment);
        return DeployUtil.deployToJson(deploy)
    }

    async sendDeploy(deploy){
        return await this.#client.casperClient.putDeploy(deploy)
    }


}