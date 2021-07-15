import {AbstractSmartContractDeployParameters} from "@/services/deploys/abstractSmartContractDeployParameters";
import {CLPublicKey, DeployUtil} from "casper-js-sdk";
import {CurrencyUtils} from "@/services/helpers/currencyUtils";
import {TransferResult} from "@/services/results/transferResult";

const fee = 10000

export class TransferDeployParameters extends AbstractSmartContractDeployParameters {
    activeKey;
    network;
    amount;
    target;
    transferID;

    constructor(activeKey, network, amount, target, transferID) {
        super()
        this.activeKey = activeKey;
        this.network = network;
        this.amount = amount;
        this.target = target;
        this.transferID = transferID;
    }

    get deployParams() {
        return new DeployUtil.DeployParams(
            CLPublicKey.fromHex(this.activeKey),
            this.network
        );
    }

    get session() {
        return DeployUtil.ExecutableDeployItem.newTransfer(
            CurrencyUtils.convertCasperToMotes(this.amount),
            CLPublicKey.fromHex(this.target),
            undefined,
            this.transferID
        );
    }

    get payment() {
        return DeployUtil.standardPayment(fee);
    }

    get deployResult() {
        return TransferResult
    }
}