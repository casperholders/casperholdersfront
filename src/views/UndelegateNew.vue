<template>
  <operation
    icon="mdi-send"
    title="Unstake"
    submit-title="Unstake"
    :send-deploy="sendDeploy"
    :loading-sign-and-deploy="loadingSignAndDeploy"
    :error-deploy="errorDeploy"
    :error-deploy-message="errorDeployMessage"
    :signed="signed"
    :deploy-hash="deployHash"
    :error-balance="errorBalance"
    :amount="amount"
    :fee="undelegateFee"
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
      :fee="Number(0)"
      :min="minimumCSPRUnstake"
      :balance="stakingBalance"
    />
    <p>
      Undelegation fee : {{ undelegateFee }} CSPR<br />
      Staking balance : {{ stakingBalance }} CSPR<br />
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
      Balance after unstake : {{ balance - undelegateFee + amount }} CSPR<br />
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
            minimumCSPRUnstake: 1,
            undelegateFee: 1,
            amount: 1,
            errorBalance: false,
            errorMessagesBalance: [],
            balance: 0,
            stakingBalance: 0,
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
            let result = this.balance - this.undelegateFee + this.amount
            return Math.trunc(result) >= 0 ? Number(result.toFixed(5)) : 0
        },
        validatorUrl() {
            return this.getValidatorUrl();
        },
        minimumFundsNeeded() {
            return this.undelegateFee;
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
            this.stakingBalance = 0;
            try {
                this.balance = await Backend.getBalance();
                this.stakingBalance = await Backend.getStakeBalance();
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
                this.deployHash = await Backend.sendUndelegate(this.amount)
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
        }
    }
}
</script>

<style scoped>

</style>