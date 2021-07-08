<template>
  <operation
    icon="mdi-gavel"
    title="Add bid"
    submit-title="Add bid"
    :send-deploy="sendDeploy"
    :loading-sign-and-deploy="loadingSignAndDeploy"
    :deploy-hash="deployHash"
    :amount="amount"
    :fee="bidFee"
    :remaining-balance="remainingBalance"
  >
    <p class="text-body-1 mb-10"><!-- TODO Do a proper margin -->
      Here's your validator : <a
        :href=validatorUrl
      >{{ signer.activeKey }}
        <v-icon x-small>mdi-open-in-new</v-icon>
      </a><br />
      <br />
      Actually there's a commission rate of {{commission}}%. (Applies on the staking rewards only.)<br />
      Exemple : if your delegators receive 100 CSPR rewards from staking, you will received {{commission}} CSPR and they will
      get {{ 100-commission }} CSPR.
    </p>
    <Amount
      :value="amount"
      @input="amount = $event"
      :fee="bidFee"
      :min="minBid"
      :balance="balance"
    />
    <p>
      Add bid operation fee : {{ bidFee }} CSPR<br />
      Balance : {{ balance }} CSPR<br />
      Validator bid : {{ validatorBalance }} CSPR
      <template v-if="loadingBalance">
        Loading balance ...
        <v-progress-circular
          indeterminate
          color="white"
          class="ml-3"
        ></v-progress-circular>
      </template>
      <br />
      Remaining funds after operation : {{ remainingBalance }} CSPR<br />
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
import {Bid} from "@/services/bid";

export default {
    name: "DelegateNew",
    components: {Amount, Operation},
    data() {
        return {
            minBid: 1,
            bidFee: 3,
            amount: 1,
            balance: 0,
            validatorBalance: 0,
            commission: 0,
            errorBalance: null,
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
            let result = this.balance - this.amount - this.bidFee
            return Math.trunc(result) >= 0 ? Number(result.toFixed(5)) : 0
        },
        validatorUrl() {
            return this.getCsprLiveUrl() + "validator/" + this.signer.activeKey;
        },
        minimumFundsNeeded() {
            return this.minBid + this.bidFee;
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
            this.validatorBalance = 0;
            this.commission = 0;
            try {
                this.balance = await Balance.fetchBalance();
                const validatorInfos = await Balance.fetchValidatorBalance();
                this.validatorBalance = validatorInfos.balance;
                this.commission = validatorInfos.commission;
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
                this.deployHash = await Bid.sendAddBid(this.amount);
            } catch (e) {
                this.errorDeploy = e;
                this.$root.$emit('operationFinished');
            }
            this.loadingSignAndDeploy = false;
            this.$root.$emit('closeOperationDialog');
        },
        connectionRequest() {
            Signer.sendConnectionRequest();
        },
    }
}
</script>

<style scoped>

</style>