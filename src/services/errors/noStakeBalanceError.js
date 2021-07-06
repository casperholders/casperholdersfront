import { ExtendableError } from "./extendableError";

export class NoStakeBalanceError extends ExtendableError {
    constructor() {
        super("Cannot found stake balance.");
    }
}