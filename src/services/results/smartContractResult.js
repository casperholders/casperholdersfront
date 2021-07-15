import {DeployResult} from "@/services/results/deployResult";

export class SmartContractResult extends DeployResult{
    constructor(hash) {
        super(hash, SmartContractResult.getName())
    }

    static getName() {
        return 'Smart Contract Operation'
    }
}