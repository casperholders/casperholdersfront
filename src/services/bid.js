import {Api} from "./api";
import {Signer} from "./signer";

export class Bid {
    static async sendAddBid(amount){
        const signedDeploy = await Signer.prepareAndSignAddBidDeploy(amount);
        return (await Api.post('addbid/', {
            deploy: signedDeploy
        })).deploy_hash;
    }

    static async sendWithdrawBid(amount){
        const signedDeploy = await Signer.prepareAndSignWithdrawDeploy(amount);
        return (await Api.post('withdrawbid/', {
            deploy: signedDeploy
        })).deploy_hash;
    }
}