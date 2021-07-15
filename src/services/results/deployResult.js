export const STATUS_UNKNOWN = "Unknown";
export const STATUS_OK = "Success";
export const STATUS_KO = "Failure";

export class DeployResult {
    hash;
    cost;
    status;
    message;
    amount;
    name;

    constructor(hash, name) {
        this.hash = hash;
        this.cost = 0;
        this.status = STATUS_UNKNOWN;
        this.message = "";
        this.amount = 0;
        this.name = name;
    }
}