import {AbstractSmartContractStoredByHashDeployParameters} from "@/services/deploys/abstractSmartContractStoredByHashDeployParameters";
import {CLPublicKey, DeployUtil} from "casper-js-sdk";

export class AuctionDeployParameters extends AbstractSmartContractStoredByHashDeployParameters {
    constructor(activeKey, network, hash, entrypoint, args, fee) {
        super(activeKey, network, hash, entrypoint, args, fee);
    }
    get deployParams() {
        return new DeployUtil.DeployParams(
            CLPublicKey.fromHex(this.activeKey),
            this.network
        );
    }
    get deployResult() {
        throw "You must implement this method"
    }
}