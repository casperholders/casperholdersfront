import {Api} from "./api";
import {Signer} from "./signer";

export class Transfer {
    static async sendTransfer(address, amount, transferID) {
        const signedDeploy = await Signer.prepareAndSignTransferDeploy(address, amount, transferID);
        return (await Api.post('transfer/', {
            deploy: signedDeploy
        })).deploy_hash;
    }
}