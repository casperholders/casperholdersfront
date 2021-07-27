<template>
  <operation
    :amount="amount"
    :fee="bidFee"
    :loading-sign-and-deploy="loadingSignAndDeploy"
    :remaining-balance="remainingBalance"
    :send-deploy="sendDeploy"
    :type="type"
    icon="mdi-gavel"
    submit-title="Add bid"
    title="Add bid"
  >
    <p class="text-body-1">
      Here's your validator : <a
      :href=validatorUrl
    >{{ signer.activeKey }}
      <v-icon x-small>mdi-open-in-new</v-icon>
    </a><br />
      <br />
      Actually there's a commission rate of {{ commission }}%. (Applies on the staking rewards only.)<br />
      Example : if your delegators receive 100 CSPR rewards from staking, you will received {{ commission }} CSPR and
      they will
      get {{ 100 - commission }} CSPR.
    </p>
    <Amount
      :balance="balance"
      :fee="bidFee"
      :min="minBid"
      :value="amount"
      class="mb-14"
      @input="amount = $event"
    />
    <v-slider
      v-model="commission"
      color="white"
      label="Commission rate"
      thumb-color="quaternary"
      thumb-label="always"
      track-color="white"
      track-fill-color="white"
    ></v-slider>
    <p>
      Add bid operation fee : {{ bidFee }} CSPR<br />
      Balance : {{ balance }} CSPR<br />
      Validator bid : {{ validatorBalance }} CSPR
      <template v-if="loadingBalance">
        Loading balance ...
        <v-progress-circular
          class="ml-3"
          color="white"
          indeterminate
        ></v-progress-circular>
      </template>
      <br />
      Remaining funds after operation : {{ remainingBalance }} CSPR<br />
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
import {AddBid, AddBidResult, InsufficientFunds, NoActiveKeyError} from "casperholderslib";

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
            loadingBalance: false,
            type: AddBidResult.getName()
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
            return this.$getCsprLiveUrl() + "validator/" + this.signer.activeKey;
        },
        minimumFundsNeeded() {
            return this.minBid + this.bidFee;
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
            this.validatorBalance = 0;
            this.commission = 0;
            try {
                this.balance = await this.$getBalanceService().fetchBalance();
                const validatorInfos = await this.$getBalanceService().fetchValidatorBalance();
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
            this.errorDeploy = null;
            this.loadingSignAndDeploy = true;
            try {
                const deployResult = await this.$getDeployManager().prepareSignAndSendDeploy(
                    new AddBid(this.amount, this.signer.activeKey, this.commission, this.$getNetwork(), this.$getAuctionHash()),
                    this.$getSigner(),
                    {
                        activeKey: this.signer.activeKey,
                        to: this.signer.activeKey
                    }
                );
                await this.$store.dispatch("addDeployResult", deployResult)
            } catch (e) {
                this.errorDeploy = e;
            }
            this.loadingSignAndDeploy = false;
            this.$root.$emit('closeOperationDialog');
            this.$root.$emit('operationFinished');
        },
        connectionRequest() {
            Signer.sendConnectionRequest();
        },
    }
}
</script>

<style scoped>

</style>