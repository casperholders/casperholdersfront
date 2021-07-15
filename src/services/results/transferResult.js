import {DeployResult} from "@/services/results/deployResult";

export class TransferResult extends DeployResult {
    constructor(hash) {
        super(hash, TransferResult.getName())
    }

    static getName() {
        return 'Transfer Operation'
    }
}