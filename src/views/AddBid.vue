<template>
  <operation
    icon="mdi-send"
    title="Add bid"
    submit-title="Add bid"
    :send-deploy="sendDeploy"
    :loading-sign-and-deploy="loadingSignAndDeploy"
    :error-deploy="errorDeploy"
    :error-deploy-message="errorDeployMessage"
    :signed="signed"
    :deploy-hash="deployHash"
    :error-balance="errorBalance"
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
      <template v-if="errorBalance">
        <v-icon color="red">mdi-alert-circle</v-icon>
        {{ errorMessagesBalance[0] }}
        <v-btn
          v-if="!this.signer.connected || this.signer.activeKey === null"
          rounded
          class="ml-2"
          color="primary"
          @click="connectionRequest"
        >Connect
        </v-btn>
      </template>
    </p>
  </operation>
</template>

<script>
import Operation from "@/components/operations/Operation";
import Amount from "@/components/operations/Amount";
import {Signer} from "casper-js-sdk";
import {mapState} from "vuex";
import {Backend} from "@/services/backend";

export default {
    name: "DelegateNew",
    components: {Amount, Operation},
    data() {
        return {
            minBid: 1,
            bidFee: 3,
            amount: 1,
            errorBalance: false,
            errorMessagesBalance: [],
            balance: 0,
            validatorBalance: 0,
            commission: 0,
            loadingSignAndDeploy: false,
            errorDeploy: false,
            errorDeployMessage: "",
            deployHash: "",
            signed: false,
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
    },
    watch: {
        async 'signer.activeKey'() {
            await this.getBalance()
        }
    },
    async mounted() {
        await this.getBalance();
    },
    methods: {
        async getBalance() {
            this.loadingBalance = true;
            this.errorBalance = false;
            this.errorMessagesBalance = [];
            this.balance = 0;
            this.validatorBalance = 0;
            this.commission = 0;
            try {
                this.balance = await Backend.getBalance();
                const validatorInfo = await Backend.getValidatorBalance();
                this.validatorBalance = validatorInfo.balance;
                this.commission = validatorInfo.commission;
                this.loadingBalance = false;
                if (this.balance <= this.minimumFundsNeeded) {
                    this.errorBalance = true;
                    this.errorMessagesBalance = ["Insufficient funds. You must have more than " + this.minimumFundsNeeded + " CSPR on your wallet."]
                }
            } catch (e) {
                this.loadingBalance = false;
                this.errorMessagesBalance = [e]
                this.errorBalance = true;
            }
        },
        async sendDeploy() {
            this.signed = false;
            this.errorDeploy = false;
            this.errorDeployMessage = "";
            this.loadingSignAndDeploy = true;
            try {
                this.deployHash = await Backend.sendAddBid(this.amount)
                this.loadingSignAndDeploy = false;
                this.$root.$emit('closeOperationDialog');
                this.signed = true;
            } catch (e) {
                this.errorDeploy = true;
                this.loadingSignAndDeploy = false;
                this.errorDeployMessage = e;
            }
        },
        connectionRequest() {
            Signer.sendConnectionRequest();
        },
    }
}
</script>

<style scoped>

</style>