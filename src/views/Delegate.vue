<template>
  <operation
    :amount="amount"
    :fee="delegationFee"
    :loading-sign-and-deploy="loadingSignAndDeploy"
    :remaining-balance="remainingBalance"
    :send-deploy="sendDeploy"
    :type="type"
    icon="mdi-safe"
    submit-title="Stake"
    title="Stake"
  >
    <p class="text-body-1">
      Here's your validator : <a
        :href=validatorUrl
      >{{ $getValidator() }}
        <v-icon x-small>mdi-open-in-new</v-icon>
      </a><br />
      <br />
      Actually there's a commission rate of 5%. (Applies on the staking rewards only.)<br />
      Example : if you receive 100 CSPR rewards from staking, CasperHolders will received 5 CSPR and you will
      get 95 CSPR.
    </p>
    <Amount
      class="mb-4"
      :balance="balance"
      :fee="delegationFee"
      :min="minimumCSPRStake"
      :value="amount"
      @input="amount = $event"
    />
    <p>
      Staking operation fee : {{ delegationFee }} CSPR<br />
      Balance : {{ balance }} CSPR
      <template v-if="loadingBalance">
        Loading balance ...
        <v-progress-circular
          class="ml-3"
          color="white"
          indeterminate
        ></v-progress-circular>
      </template>
      <br />
      Remaining funds after staking : {{ remainingBalance }} CSPR<br />
    </p>
    <v-alert
      v-if="errorBalance"
      class="mt-5"
      dense
      prominent
      type="error"
    >
      <v-row align="center">
        <v-col class="grow">
          {{ errorBalance.message }}
        </v-col>
        <v-col class="shrink">
          <v-btn
            v-if="isInstanceOfNoActiveKeyError"
            color="primary"
            @click="connectionRequest"
          >
            <v-icon left>mdi-account-circle</v-icon>
            Connect
          </v-btn>
        </v-col>
      </v-row>
    </v-alert>
    <v-alert
      v-if="errorDeploy"
      class="mt-5"
      dense
      type="error"
    >
      {{ errorDeploy.message }}
    </v-alert>
  </operation>
</template>

<script>
import Operation from "@/components/operations/Operation";
import Amount from "@/components/operations/Amount";
import {Signer} from "casper-js-sdk";
import {mapState} from "vuex";
import {InsufficientFunds} from "@/services/errors/insufficientFunds";
import {NoActiveKeyError} from "@/services/errors/noActiveKeyError";
import {DelegateResult} from "@/services/results/delegateResult";
import {Delegate} from "@/services/deploys/auction/actions/delegate";

export default {
    name: "DelegateNew",
    components: {Amount, Operation},
    data() {
        return {
            minimumCSPRStake: 1,
            delegationFee: 3,
            amount: 1,
            errorBalance: null,
            balance: 0,
            loadingSignAndDeploy: false,
            errorDeploy: null,
            loadingBalance: false,
            type: DelegateResult.getName(),
        }
    },
    computed: {
        ...mapState([
            "signer",
        ]),
        remainingBalance() {
            let result = this.balance - this.amount - this.delegationFee
            return Math.trunc(result) >= 0 ? Number(result.toFixed(5)) : 0
        },
        validatorUrl() {
            return this.$getValidatorUrl();
        },
        minimumFundsNeeded() {
            return this.minimumCSPRStake + this.delegationFee;
        },
        isInstanceOfNoActiveKeyError() {
            return this.errorBalance instanceof NoActiveKeyError
        }
    },
    watch: {
        async 'signer.activeKey'() {
            await this.getBalance()
        }
    },
    async mounted() {
        await this.getBalance();
        this.$root.$on("operationOnGoing", () => this.errorDeploy = null)
    },
    methods: {
        async getBalance() {
            this.loadingBalance = true;
            this.errorBalance = null;
            this.balance = 0;
            try {
                this.balance = await this.$getBalanceService().fetchBalance();
                if (this.balance <= this.minimumFundsNeeded) {
                    throw new InsufficientFunds(this.minimumFundsNeeded)
                }
            } catch (e) {
                this.errorBalance = e;
            }
            this.loadingBalance = false;
        },
        async sendDeploy() {
            this.errorDeploy = null;
            this.loadingSignAndDeploy = true;
            try {
                const deployResult = await this.$getDeployManager().prepareSignAndSendDeploy(
                    new Delegate(this.amount, this.signer.activeKey, this.$getValidator(), this.$getNetwork(), this.$getAuctionHash()),
                    this.$getSigner(),
                    {
                        activeKey: this.signer.activeKey,
                        to: this.$getValidator()
                    }
                );
                await this.$store.dispatch("addDeployResult", deployResult)
            } catch (e) {
                console.log(e)
                this.errorDeploy = e;
            }
            this.loadingSignAndDeploy = false;
            this.$root.$emit('closeOperationDialog');
            this.$root.$emit('operationFinished');
        },
        connectionRequest() {
            Signer.sendConnectionRequest();
        }
    }
}
</script>

<style scoped>

</style>