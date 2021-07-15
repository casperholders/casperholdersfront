import {ExtendableError} from "@/services/errors/extendableError";

export class NoStakeBalanceError extends ExtendableError {
    constructor() {
        super("No staking funds.");
    }
}