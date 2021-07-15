import {CasperClient, CasperServiceByJsonRPC} from "casper-js-sdk";

export class ClientCasper {

    casperClient
    casperRPC

    constructor(rpc) {
        this.casperClient = new CasperClient(rpc)
        this.casperRPC = new CasperServiceByJsonRPC(rpc)
    }
}