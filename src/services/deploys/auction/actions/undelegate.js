import {CLPublicKey, CLU512, RuntimeArgs} from "casper-js-sdk";
import {CurrencyUtils} from "@/services/helpers/currencyUtils";
import {AuctionDeployParameters} from "@/services/deploys/auction/AuctionDeployParameters";
import {UndelegateResult} from "@/services/results/undelegateResult";

const entrypoint = 'undelegate'
const fee = 410000000

export class Undelegate extends AuctionDeployParameters {

    constructor(amount, activeKey, validator, network, hash) {
        const args = RuntimeArgs.fromMap({
            delegator: CLPublicKey.fromHex(activeKey),
            validator: CLPublicKey.fromHex(validator),
            amount: new CLU512(CurrencyUtils.convertCasperToMotes(amount))
        })
        super(activeKey, network, hash, entrypoint, args, fee);
    }

    get deployResult() {
        return UndelegateResult
    }
}