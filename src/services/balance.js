import {NoStakeBalanceError} from "./errors/noStakeBalanceError";
import {CLPublicKey} from "casper-js-sdk";
import {NoValidatorBalanceError} from "@/services/errors/noValidatorBalanceError";
import {CurrencyUtils} from "@/services/helpers/currencyUtils";

export class Balance {

    #keyManager
    #client
    #validator

    /**
     *
     * @param keyManager {AbstractKeyManager}
     * @param client {ClientCasper}
     * @param validator {string}
     */
    constructor(keyManager, client, validator) {
        this.#keyManager = keyManager;
        this.#client = client;
        this.#validator = validator
    }

    async fetchBalance() {
        return CurrencyUtils.convertMotesToCasper(
            (await this.#client.casperClient.balanceOfByPublicKey(CLPublicKey.fromHex(this.#keyManager.activeKey))).toString()
        );
    }

    async fetchStakeBalance() {
        const validatorsInfo = await this.#client.casperRPC.getValidatorsInfo()
        let validator = validatorsInfo.auction_state.bids.filter(validator => {
            return validator.public_key === this.#validator
        })[0]

        let stakingBalance = validator.bid.delegators.filter(delegator => {
            return delegator.public_key === this.#keyManager.activeKey
        })
        if (stakingBalance.length > 0) {
            return CurrencyUtils.convertMotesToCasper(stakingBalance[0].staked_amount)
        }
        throw new NoStakeBalanceError();
    }

    async fetchValidatorBalance() {
        const validatorsInfo = await this.#client.casperRPC.getValidatorsInfo()
        let validator = validatorsInfo.auction_state.bids.filter(validator => {
            return validator.public_key === this.#keyManager.activeKey
        })[0]
        if (validator) {
            return {
                balance: CurrencyUtils.convertMotesToCasper(validator.bid.staked_amount),
                commission: validator.bid.delegation_rate,
            }
        }
        throw new NoValidatorBalanceError()
    }
}