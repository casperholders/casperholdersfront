import { ExtendableError } from "./extendableError";

export class NoActiveKeyError extends ExtendableError {
    constructor() {
        super("Not connected on Signer.");
    }
}