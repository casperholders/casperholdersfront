import {ExtendableError} from "@/services/errors/extendableError";

export class NoValidatorBalanceError extends ExtendableError {
    constructor() {
        super("Unable to retrieve your Validator balance. Make sure that you are correctly bonded to the network.");
    }
}