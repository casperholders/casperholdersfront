import { ExtendableError } from "./extendableError";

export class SignError extends ExtendableError {
    constructor() {
        super("Failed to sign the contract. Please retry if you canceled the operation.");
    }
}