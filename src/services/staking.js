import {Api} from "./api";
import {Signer} from "./signer";

export class Staking {
    static async sendDelegate(amount){
        const signedDeploy = await Signer.prepareAndSignDelegateDeploy(amount);
        return (await Api.post('delegate/', {
            deploy: signedDeploy
        })).deploy_hash;
    }
    static async sendUndelegate(amount){
        const signedDeploy = await Signer.prepareAndSignUndelegateDeploy(amount);
        return (await Api.post('undelegate/', {
            deploy: signedDeploy
        })).deploy_hash;
    }
}