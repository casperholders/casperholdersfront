import { Api } from "./api";
import { NoStakeBalanceError } from "./errors/noStakeBalanceError";
import { Signer } from "./signer";

function convertMotesToCasper(motesAmount) {
    return motesAmount / 1000000000;
}

export class Balance {
    static async fetchBalance() {
        return convertMotesToCasper(
            (await Api.fetch(`balance/${Signer.activeKey}`)).balance,
        );
    }

    static async fetchStakeBalance() {
        const stakeData = await Api.fetch(`balance/stake/${Signer.activeKey}`);

        if (stakeData.balance === 0) {
            throw new NoStakeBalanceError();
        }

        return convertMotesToCasper(stakeData.balance);
    }

    static async fetchValidatorBalance() {
        const validatorData = await Api.fetch(`balance/validator/${Signer.activeKey}`);

        return {
            balance: convertMotesToCasper(validatorData.balance),
            commission: validatorData.commission,
        };
    }
}