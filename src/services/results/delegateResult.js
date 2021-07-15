import {DeployResult} from "@/services/results/deployResult";

export class DelegateResult extends DeployResult {
    constructor(hash) {
        super(hash, DelegateResult.getName())
    }

    static getName() {
        return 'Staking Operation'
    }
}