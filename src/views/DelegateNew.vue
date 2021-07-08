<template>
  <operation
    icon="mdi-safe"
    title="Stake"
    submit-title="Stake"
    :send-deploy="sendDeploy"
    :loading-sign-and-deploy="loadingSignAndDeploy"
    :deploy-hash="deployHash"
    :amount="amount"
    :fee="delegationFee"
    :remaining-balance="remainingBalance"
  >
    <p class="text-body-1 mb-10"><!-- TODO Do a proper margin -->
      Here's your validator : <a
        :href=validatorUrl
      >{{ getValidator() }}
        <v-icon x-small>mdi-open-in-new</v-icon>
      </a><br />
      <br />
      Actually there's a commission rate of 5%. (Applies on the staking rewards only.)<br />
      Exemple : if you receive 100 CSPR rewards from staking, CasperHolders will received 5 CSPR and you will
      get 95 CSPR.
    </p>
    <Amount
      :value="amount"
      @input="amount = $event"
      :fee="delegationFee"
      :min="minimumCSPRStake"
      :balance="balance"
    />
    <p>
      Staking operation fee : {{ delegationFee }} CSPR<br />
      Balance : {{ balance }} CSPR
      <template v-if="loadingBalance">
        Loading balance ...
        <v-progress-circular
          indeterminate
          color="white"
          class="ml-3"
        ></v-progress-circular>
      </template>
      <br />
      Remaining funds after staking : {{ remainingBalance }} CSPR<br />
    </p>
    <v-alert prominent dense class="mt-5" type="error" v-if="errorBalance">
      <v-row align="center">
        <v-col class="grow">
          {{ errorBalance.message }}
        </v-col>
        <v-col class="shrink">
          <v-btn v-if="isInstanceOfNoActiveKeyError" color="primary" @click="connectionRequest">Retry</v-btn>
        </v-col>
      </v-row>
    </v-alert>
    <v-alert dense class="mt-5" type="error" v-if="errorDeploy">
      {{ errorDeploy.message }}
    </v-alert>
  </operation>
</template>

<script>
import Operation from "@/components/operations/Operation";
import Amount from "@/components/operations/Amount";
import {Signer} from "casper-js-sdk";
import {mapState} from "vuex";
import {Balance} from "@/services/balance";
import {InsufficientFunds} from "@/services/errors/insufficientFunds";
import {NoActiveKeyError} from "@/services/errors/noActiveKeyError";
import {Staking} from "@/services/staking";

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
            deployHash: "",
            loadingBalance: false,
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
            return this.getValidatorUrl();
        },
        minimumFundsNeeded() {
            return this.minimumCSPRStake + this.delegationFee;
        },
        isInstanceOfNoActiveKeyError(){
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
                this.balance = await Balance.fetchBalance();
                if (this.balance <= this.minimumFundsNeeded) {
                    throw new InsufficientFunds(this.minimumFundsNeeded)
                }
            } catch (e) {
                this.errorBalance = e;
            }
            this.loadingBalance = false;
        },
        async sendDeploy() {
            this.deployHash = "";
            this.errorDeploy = null;
            this.loadingSignAndDeploy = true;
            try {
                this.deployHash = await Staking.sendDelegate(this.amount);
            } catch (e) {
                this.errorDeploy = e;
                this.$root.$emit('operationFinished');
            }
            this.loadingSignAndDeploy = false;
            this.$root.$emit('closeOperationDialog');
        },
        connectionRequest() {
            Signer.sendConnectionRequest();
        }
    }
}
</script>

<style scoped>

</style>