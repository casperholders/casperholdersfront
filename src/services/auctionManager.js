import {CLPublicKey, CLU512, CLU8, RuntimeArgs} from "casper-js-sdk";
import {CasperSigner} from "@/services/casperSigner";

export class AuctionManager {
    #hash;
    #signer;
    #deployManager;
    #validator;
    #keyManager;

    /**
     *
     * @param hash {string}
     * @param signer {AbstractSigner}
     * @param deployManager {DeployManager}
     * @param validator {string}
     * @param keyManager {AbstractKeyManager}
     */
    constructor(hash, signer, deployManager, validator, keyManager) {
        this.#hash = hash;
        this.#signer = signer;
        this.#deployManager = deployManager;
        this.#validator = validator;
        this.#keyManager = keyManager;
    }

    async #prepareSignAndSendDeploy(entrypoint, args, fee, to){
        const prepareDeploy = this.#deployManager.prepareDeployContractStoredByHash(this.#keyManager.activeKey, this.#hash, entrypoint, args, fee)
        if(this.#signer instanceof CasperSigner){
            this.#signer.to = to;
        }
        console.log(prepareDeploy)
        const signedDeploy = await this.#signer.sign(prepareDeploy);
        return await this.#deployManager.sendDeploy(signedDeploy);
    }

    async sendAddBid(amount, commission){
        const args = RuntimeArgs.fromMap({
            public_key: CLPublicKey.fromHex(this.#keyManager.activeKey),
            amount: new CLU512(amount*1000000000),
            delegation_rate: new CLU8(commission)
        })
        return await this.#prepareSignAndSendDeploy('add_bid', args, 2800000000, this.#keyManager.activeKey);
    }

    async sendWithdrawBid(amount){
        const args = RuntimeArgs.fromMap({
            public_key: CLPublicKey.fromHex(this.#keyManager.activeKey),
            amount: new CLU512(amount*1000000000),
        })
        return await this.#prepareSignAndSendDeploy('withdraw_bid', args, 220000000, this.#keyManager.activeKey);
    }

    async sendDelegate(amount){
        const args = RuntimeArgs.fromMap({
            delegator: CLPublicKey.fromHex(this.#keyManager.activeKey),
            validator: CLPublicKey.fromHex(this.#validator),
            amount: new CLU512(amount*1000000000)
        })
        return await this.#prepareSignAndSendDeploy('delegate', args, 2910000000, this.#validator);
    }

    async sendUndelegate(amount){
        const args = RuntimeArgs.fromMap({
            delegator: CLPublicKey.fromHex(this.#keyManager.activeKey),
            validator: CLPublicKey.fromHex(this.#validator),
            amount: new CLU512(amount*1000000000)
        })
        return await this.#prepareSignAndSendDeploy('undelegate', args, 410000000, this.#validator);
    }
}