<template>
  <operation
    :amount="amount"
    :fee="0"
    :loading-sign-and-deploy="loadingSignAndDeploy"
    :remaining-balance="remainingBalance"
    :send-deploy="sendDeploy"
    :type="type"
    icon="mdi-file-document-edit"
    submit-title="Deploy"
    title="Send smart contract"
  >
    <v-file-input
      id="smartContractFile"
      v-model="contract"
      :show-size="1000"
      accept=".wasm"
      color="white"
      counter
      label="Smart Contracts"
      outlined
      placeholder="Select your contracts"
      prepend-icon="mdi-paperclip"
    >
      <template v-slot:selection="{ text }">
        {{ text }}
      </template>
    </v-file-input>
    <Amount
      :balance="balance"
      :fee="Number(0)"
      :min="minPayment"
      :value="amount"
      class="mb-4"
      @input="amount = $event"
    />
    <p>
      Payment amount the smart contract : {{ amount }} CSPR<br />
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
      Total cost : {{ amount }} CSPR<br />
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
import {SmartContractResult} from "@casperholders/core/dist/services/results/smartContractResult";
import {NoActiveKeyError} from "@casperholders/core/dist/services/errors/noActiveKeyError";
import {InsufficientFunds} from "@casperholders/core/dist/services/errors/insufficientFunds";
import {SmartContractDeployParameters} from "@casperholders/core/dist/services/deploys/smartContract/smartContractDeployParameters";
/**
 * SmartContract view
 * Contains two fields
 * - Amount of fee to deploy the smartcontract
 * - File input for the wasm smart contract
 */
export default {
    name: "SmartContract",
    components: {Amount, Operation},
    data() {
        return {
            minPayment: 1,
            contract: [],
            amount: "1",
            balance: "0",
            errorBalance: null,
            loadingSignAndDeploy: false,
            errorDeploy: null,
            loadingBalance: false,
            type: SmartContractResult.getName(),
            buffer: null,
        }
    },
    computed: {
        ...mapState([
            "signer",
        ]),
        remainingBalance() {
            let result = this.balance - this.amount
            return Math.trunc(result) >= 0 ? Number(result.toFixed(5)) : 0
        },
        validatorUrl() {
            return this.$getCsprLiveUrl() + "validator/" + this.signer.activeKey;
        },
        isInstanceOfNoActiveKeyError() {
            return this.errorBalance instanceof NoActiveKeyError
        }
    },
    watch: {
        async 'signer.activeKey'() {
            await this.getBalance()
        },
        /**
         * Read the file selected by the user
         */
        contract() {
            let reader = new FileReader();

            reader.onload = (evt) => {
                this.buffer = evt.target.result;
            };

            reader.onerror = function (evt) {
                console.error("An error ocurred reading the file", evt);
            };

            reader.readAsArrayBuffer(this.contract, "UTF-8");
        }
    },
    async mounted() {
        await this.getBalance();
        this.$root.$on("operationOnGoing", () => this.errorDeploy = null)
    },
    methods: {
        /**
         * Get the user balance
         */
        async getBalance() {
            this.loadingBalance = true;
            this.errorBalance = null;
            this.balance = "0";
            try {
                this.balance = await this.$getBalanceService().fetchBalance();
                if (this.balance <= this.minPayment) {
                    throw new InsufficientFunds(this.minPayment)
                }
            } catch (e) {
                this.errorBalance = e;
            }
            this.loadingBalance = false;
        },
        /**
         * Method used by the OperationDialog component when the user confirm the operation.
         * Use the prepareSignAndSendDeploy method from the core library
         * Update the store with a deploy result containing the deployhash of the deploy sent
         */
        async sendDeploy() {
            this.errorDeploy = null;
            this.loadingSignAndDeploy = true;
            try {
                const deployResult = await this.$getDeployManager().prepareSignAndSendDeploy(
                    new SmartContractDeployParameters(this.signer.activeKey, this.$getNetwork(), this.buffer, this.amount),
                    this.$getSigner(),
                    this.$getOptionsActiveKey()
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
        },
    }
}
</script>

<style scoped>

</style>