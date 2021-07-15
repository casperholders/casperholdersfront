import {DeployResult} from "@/services/results/deployResult";

export class WithdrawBidResult extends DeployResult {
    constructor(hash) {
        super(hash, WithdrawBidResult.getName())
    }

    static getName() {
        return 'Withdraw bid Operation'
    }
}