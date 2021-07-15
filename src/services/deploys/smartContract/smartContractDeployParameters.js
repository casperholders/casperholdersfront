import {AbstractSmartContractDeployParameters} from "@/services/deploys/abstractSmartContractDeployParameters";
import {CLPublicKey, DeployUtil, RuntimeArgs} from "casper-js-sdk";
import {SmartContractResult} from "@/services/results/smartContractResult";
import {CurrencyUtils} from "@/services/helpers/currencyUtils";

export class SmartContractDeployParameters extends AbstractSmartContractDeployParameters {
    activeKey;
    network;
    smartContractBuffer;
    fee;

    constructor(activeKey, network, smartContractBuffer, fee) {
        super()
        this.activeKey = activeKey;
        this.network = network;
        this.smartContractBuffer = smartContractBuffer;
        this.fee = fee;
    }

    get deployParams() {
        return new DeployUtil.DeployParams(
            CLPublicKey.fromHex(this.activeKey),
            this.network
        );
    }

    get session() {
        return DeployUtil.ExecutableDeployItem.newModuleBytes(new Uint8Array(this.smartContractBuffer), RuntimeArgs.fromMap({}));
    }

    get payment() {
        return DeployUtil.standardPayment(CurrencyUtils.convertCasperToMotes(this.fee));
    }

    get deployResult() {
        return SmartContractResult
    }
}