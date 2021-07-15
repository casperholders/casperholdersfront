import {CurrencyUtils} from "@/services/helpers/currencyUtils";
import {STATUS_KO, STATUS_OK} from "@/services/results/deployResult";

export class DeployManager {
    #client;

    constructor(client) {
        this.#client = client;
    }

    /***
     *
     * @param deploy
     * @param deployResult
     * @returns {Promise<*>}
     */
    async sendDeploy(deploy, deployResult) {
        const hash = await this.#client.casperClient.putDeploy(deploy)
        return new deployResult(hash)
    }

    async prepareSignAndSendDeploy(deployParameter, signer, options) {
        const signedDeploy = await signer.sign(deployParameter.makeDeploy, options);
        return await this.sendDeploy(signedDeploy, deployParameter.deployResult);
    }

    /**
     *
     * @param deployResult {DeployResult}
     * @returns {Promise<DeployResult>}
     */
    async getDeployResult(deployResult) {
        const result = await this.#client.casperClient.getDeploy(deployResult.hash)
        let deploy = result[0]
        let execResult = result[1].execution_results
        if (execResult.length > 0) {
            execResult = execResult[0].result;
        }
        if (deploy.session.getArgByName("amount")) {
            deployResult.amount = CurrencyUtils.convertMotesToCasper(deploy.session.getArgByName("amount").value().toString())
        }
        if (STATUS_OK in execResult) {
            deployResult.cost = CurrencyUtils.convertMotesToCasper(execResult[STATUS_OK].cost)
            deployResult.status = STATUS_OK
            return deployResult
        }
        if (STATUS_KO in execResult) {
            deployResult.cost = CurrencyUtils.convertMotesToCasper(execResult[STATUS_KO].cost)
            deployResult.status = STATUS_KO
            deployResult.message = execResult[STATUS_KO].error_message
        }
        return deployResult;
    }

}