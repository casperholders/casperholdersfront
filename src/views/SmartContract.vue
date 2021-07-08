<template>
  <operation
    icon="mdi-file-document-edit"
    title="Send smart contract"
    submit-title="Deploy"
    :send-deploy="sendDeploy"
    :loading-sign-and-deploy="loadingSignAndDeploy"
    :deploy-hash="deployHash"
    :amount="amount*contracts.length"
    :fee="0"
    :remaining-balance="remainingBalance"
  >
    <v-file-input
      v-model="contracts"
      counter
      color="white"
      label="Smart Contracts"
      multiple
      placeholder="Select your contracts"
      prepend-icon="mdi-paperclip"
      outlined
      accept=".wasm"
      :show-size="1000"
    >
      <template v-slot:selection="{ index, text }">
        <v-chip
          v-if="index < 2"
          dark
          label
          small
        >
          {{ text }}
        </v-chip>

        <span
          v-else-if="index === 2"
          class="text-overline grey--text text--darken-3 mx-2"
        >
        +{{ contracts.length - 2 }} File(s)
      </span>
      </template>
    </v-file-input>
    <Amount
      :value="amount"
      @input="amount = $event"
      :fee="Number(0)"
      :min="minPayment"
      :balance="balance/(contracts.length>0?contracts.length:1)"
    />
    <p>
      Payment amount for each smart contracts : {{ amount }} CSPR<br />
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
      Total cost : {{ amount * contracts.length }} CSPR<br />
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
import {SmartContract} from "@/services/smartContract";

export default {
    name: "DelegateNew",
    components: {Amount, Operation},
    data() {
        return {
            minPayment: 1,
            contracts: [],
            amount: 1,
            balance: 0,
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
            let result = this.balance - (this.amount * this.contracts.length)
            return Math.trunc(result) >= 0 ? Number(result.toFixed(5)) : 0
        },
        validatorUrl() {
            return this.getCsprLiveUrl() + "validator/" + this.signer.activeKey;
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
                if (this.balance <= this.minPayment) {
                    throw new InsufficientFunds(this.minPayment)
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
                this.deployHash = await SmartContract.deploy(this.contracts, this.amount);
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