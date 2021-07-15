import {DeployUtil} from "casper-js-sdk";
import {SignError} from "@/services/errors/signError";
import {AbstractSigner} from "@/services/signers/abstractSigner";

export class LocalSigner extends AbstractSigner {
    /**
     *
     * @param deploy
     * @param options {Object}
     * @returns {Promise<String>}
     */
    static async sign(deploy, options = {}) {
        try {
            return await DeployUtil.signDeploy(deploy, options.key)
        } catch (e) {
            console.log(e);
            throw new SignError();
        }
    }
}