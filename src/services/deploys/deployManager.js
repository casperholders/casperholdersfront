import {CurrencyUtils} from "@/services/helpers/currencyUtils";

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
        if(deploy.session.getArgByName("amount")){
            deployResult.amount = CurrencyUtils.convertMotesToCasper(deploy.session.getArgByName("amount").value().toString())
        }
        if ("Success" in execResult) {
            deployResult.cost = CurrencyUtils.convertMotesToCasper(execResult.Success.cost)
            deployResult.status = true
            return deployResult
        }
        if ("Failure" in execResult) {
            deployResult.cost = CurrencyUtils.convertMotesToCasper(execResult.Failure.cost)
            deployResult.status = false
            deployResult.message = execResult.Failure.error_message
        }
        return deployResult;
    }

}