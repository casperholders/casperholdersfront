import {AbstractSmartContractDeployParameters} from "@/services/deploys/abstractSmartContractDeployParameters";
import {CLPublicKey, DeployUtil} from "casper-js-sdk";

export class AbstractSmartContractStoredByHashDeployParameters extends AbstractSmartContractDeployParameters {
    activeKey;
    network;
    hash;
    entrypoint;
    args;
    fee;

    constructor(activeKey, network, hash, entrypoint, args, fee) {
        super()
        this.activeKey = activeKey;
        this.network = network;
        this.hash = hash;
        this.entrypoint = entrypoint;
        this.args = args;
        this.fee = fee;
    }

    get deployParams() {
        return new DeployUtil.DeployParams(
            CLPublicKey.fromHex(this.from),
            this.network
        );
    }

    get session() {
        return DeployUtil.ExecutableDeployItem.newStoredContractByHash(
            Uint8Array.from(Buffer.from(this.hash, "hex")),
            this.entrypoint,
            this.args
        );
    }

    get payment() {
        return DeployUtil.standardPayment(this.fee);
    }

    get deployResult() {
        throw "You must implement this method"
    }
}