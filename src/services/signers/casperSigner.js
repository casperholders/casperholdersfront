import {DeployUtil, Signer} from "casper-js-sdk";
import {SignError} from "@/services/errors/signError";
import {AbstractSigner} from "@/services/signers/abstractSigner";

/**
 * @typedef {DeployUtil.Deploy} Deploy
 */

export class CasperSigner extends AbstractSigner {
    /**
     *
     * @param deploy {Deploy}
     * @param options {Object}
     * @returns {Promise<Deploy>}
     */
    static async sign(deploy, options = {}){
        try {
            const signedJsonDeploy = await Signer.sign(DeployUtil.deployToJson(deploy), options.activeKey, options.to);
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