export const STATUS_UNKNOWN = "Unknown";
export const STATUS_OK = true;
export const STATUS_KO = false;

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
        this.status = "Unknown";
        this.message = "";
        this.amount = 0;
        this.name = name;
    }
}