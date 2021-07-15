import {CLPublicKey, CLU512, CLU8, RuntimeArgs} from "casper-js-sdk";
import {CurrencyUtils} from "@/services/helpers/currencyUtils";
import {AuctionDeployParameters} from "@/services/deploys/auction/AuctionDeployParameters";
import {AddBidResult} from "@/services/results/addBidResult";

const entrypoint = 'add_bid'
const fee = 2800000000

export class AddBid extends AuctionDeployParameters {

    constructor(amount, activeKey, commission, network, hash) {
        const args = RuntimeArgs.fromMap({
            public_key: CLPublicKey.fromHex(activeKey),
            amount: new CLU512(CurrencyUtils.convertCasperToMotes(amount)),
            delegation_rate: new CLU8(commission)
        })
        super(activeKey, network, hash, entrypoint, args, fee);
    }

    get deployResult() {
        return AddBidResult
    }
}