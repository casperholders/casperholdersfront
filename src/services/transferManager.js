import {CasperSigner} from "@/services/casperSigner";

export class TransferManager {
    #signer;
    #deployManager;
    #keyManager;

    /**
     *
     * @param signer {AbstractSigner}
     * @param deployManager {DeployManager}
     * @param keyManager {AbstractKeyManager}
     */
    constructor(signer, deployManager, keyManager) {
        this.#signer = signer;
        this.#deployManager = deployManager;
        this.#keyManager = keyManager;
    }

    async sendTransfer(amount, to, transferID) {
        const prepareDeploy = this.#deployManager.prepareDeployTransfer(this.#keyManager.activeKey, amount, to, transferID)
        if(this.#signer instanceof CasperSigner){
            this.#signer.to = to;
        }
        const signedDeploy = await this.#signer.sign(prepareDeploy);
        return await this.#deployManager.sendDeploy(signedDeploy);
    }
}