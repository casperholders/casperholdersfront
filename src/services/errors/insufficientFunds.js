import { ExtendableError } from "./extendableError";

export class InsufficientFunds extends ExtendableError {
    constructor(min) {
        super("Insufficient funds. You must have more than " + min + " CSPR on your wallet.");
    }
}