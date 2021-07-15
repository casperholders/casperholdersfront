import {ExtendableError} from "@/services/errors/extendableError";

export class NoActiveKeyError extends ExtendableError {
    constructor() {
        super("Not connected on Signer.");
    }
}