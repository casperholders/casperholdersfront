import {CLPublicKey, CLU512, RuntimeArgs} from "casper-js-sdk";
import {CurrencyUtils} from "@/services/helpers/currencyUtils";
import {AuctionDeployParameters} from "@/services/deploys/auction/AuctionDeployParameters";
import {WithdrawBidResult} from "@/services/results/withdrawBidResult";

const entrypoint = 'withdraw_bid'
const fee = 220000000

export class WithdrawBid extends AuctionDeployParameters {

    constructor(amount, activeKey, network, hash) {
        const args = RuntimeArgs.fromMap({
            public_key: CLPublicKey.fromHex(activeKey),
            amount: new CLU512(CurrencyUtils.convertCasperToMotes(amount)),
        })
        super(activeKey, network, hash, entrypoint, args, fee);
    }

    get deployResult() {
        return WithdrawBidResult
    }
}