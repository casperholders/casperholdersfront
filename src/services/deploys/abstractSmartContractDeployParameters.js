import {DeployUtil} from "casper-js-sdk";

export class AbstractSmartContractDeployParameters {
    get deployParams() {
        throw "You must implement this method"
    }

    get session() {
        throw "You must implement this method"
    }

    get payment() {
        throw "You must implement this method"
    }

    get deployResult() {
        throw "You must implement this method"
    }

    get makeDeploy() {
        return DeployUtil.makeDeploy(this.deployParams, this.session, this.payment)
    }
}