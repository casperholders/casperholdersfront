import {DeployUtil} from "casper-js-sdk";
import {SignError} from "@/services/errors/signError";
import {AbstractSigner} from "@/services/abstractSigner";

export class LocalSigner extends AbstractSigner {
    #key

    /**
     *
     * @param key {import("casper-js-sdk").Keys.AsymmetricKey}
     */
    constructor(key) {
        super();
        this.#key = key;
    }

    async sign(deploy){
        try {
            return await DeployUtil.signDeploy(deploy, this.#key)
        } catch (e) {
            console.log(e);
            throw new SignError();
        }
    }
}