<template>
  <operation
    icon="mdi-send"
    title="Transfer"
    submit-title="Send Transaction"
    :send-deploy="sendDeploy"
    :loading-sign-and-deploy="loadingSignAndDeploy"
    :error-deploy="errorDeploy"
    :error-deploy-message="errorDeployMessage"
    :signed="signed"
    :deploy-hash="deployHash"
    :error-balance="errorBalance"
    :amount="amount"
    :fee="transferFee"
    :remaining-balance="remainingBalance"
  >
    <v-text-field
      color="white"
      v-model="address"
      :value="address"
      label="Send to address"
      :rules="addressRules"
      required
      prepend-icon="mdi-account"
    ></v-text-field>
    <v-text-field
      color="white"
      :value="transferID"
      label="Transfer ID"
      :rules="transferIDRules"
      required
      prepend-icon="mdi-music-accidental-sharp"
      hint="Set to 0 if not known"
    />
    <Amount
      :value="amount"
      @input="amount = $event"
      :fee="transferFee"
      :min="minimumCSPRTransfer"
      :balance="balance"
    />
    <p>
      Transfer Fee : {{ transferFee }} CSPR<br />
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
      Remaining funds after transfer : {{ remainingBalance }} CSPR<br />
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
import {CLPublicKey, Signer} from "casper-js-sdk";
import {mapState} from "vuex";
import {Backend} from "@/services/backend";

export default {
    name: "TransferNew",
    components: {Amount, Operation},
    data() {
        return {
            addressRules: [
                a => !!a || 'Address is required',
                a => a.length >= 2 || 'Address is too short',
                a => {
                    try {
                        CLPublicKey.fromHex(a)
                        return true;
                    } catch (e) {
                        return e.toString();
                    }
                },
            ],
            transferIDRules: [
                a => !!a || 'Transfer ID is required',
                a => /^[0-9]+$/.test(a) || 'Transfer ID must be a number',
            ],
            address: "",
            transferID: '0',
            minimumCSPRTransfer: 2.5,
            transferFee: 10000 / 1000000000,
            amount: 2.5,
            errorBalance: false,
            errorMessagesBalance: [],
            balance: 0,
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
            let result = this.balance - this.amount - this.transferFee
            return Math.trunc(result) >= 0 ? Number(result.toFixed(5)) : 0
        },
        minimumFundsNeeded() {
            return this.minimumCSPRTransfer + this.transferFee;
        },
    },
    watch: {
        async 'signer.activeKey'() {
            await this.getBalance()
        }
    },
    methods: {
        async getBalance() {
            this.loadingBalance = true;
            this.errorBalance = false;
            this.errorMessagesBalance = [];
            this.balance = 0;
            try {
                this.balance = await Backend.getBalance();
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
                this.deployHash = await Backend.sendTransfer(this.address, this.amount, this.transferID);
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