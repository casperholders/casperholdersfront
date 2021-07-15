import {DeployResult} from "@/services/results/deployResult";

export class UndelegateResult extends DeployResult{
    constructor(hash) {
        super(hash, UndelegateResult.getName())
    }

    static getName() {
        return 'Unstake Operation'
    }
}