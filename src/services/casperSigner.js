import {DeployUtil, Signer} from "casper-js-sdk";
import {SignError} from "@/services/errors/signError";
import {AbstractSigner} from "@/services/abstractSigner";
import {CasperKeyManager} from "@/services/casperKeyManager";

/**
 * @typedef {DeployUtil.Deploy} Deploy
 */

export class CasperSigner extends AbstractSigner {
    #to

    constructor(to) {
        super();
        this.#to = to;
    }

    set to(to){
        this.#to = to;
    }

    /**
     *
     * @param deploy {Deploy}
     * @returns {Promise<Deploy>}
     */
    async sign(deploy){
        try {
            const signedJsonDeploy = await Signer.sign(deploy, CasperKeyManager.activeKey, this.#to);
            const signedDeploy = await DeployUtil.deployFromJson(signedJsonDeploy);
            if(signedDeploy.ok){
                return signedDeploy.val;
            } else {
                throw signedDeploy.val;
            }
        } catch (e) {
            console.log(e);
            throw new SignError();
        }
    }
}