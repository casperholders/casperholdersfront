import {DeployResult} from "@/services/results/deployResult";

export class AddBidResult extends DeployResult {
    constructor(hash) {
        super(hash, AddBidResult.getName())
    }

    static getName() {
        return 'Add bid Operation'
    }
}