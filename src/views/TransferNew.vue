<template>
  <div>
    <operation
      icon="mdi-send"
      title="Transfer"
      submit-title="Send Transaction"
      :send-deploy="sendDeploy"
      :loading-sign-and-deploy="loadingSignAndDeploy"
      :deploy-hash="deployHash"
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
  </div>
</template>

<script>
import Operation from "@/components/operations/Operation";
import Amount from "@/components/operations/Amount";
import {CLPublicKey, Signer} from "casper-js-sdk";
import {mapState} from "vuex";
import {Balance} from "@/services/balance";
import {InsufficientFunds} from "@/services/errors/insufficientFunds";
import {NoActiveKeyError} from "@/services/errors/noActiveKeyError";
import {Transfer} from "@/services/transfer";

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
            let result = this.balance - this.amount - this.transferFee
            return Math.trunc(result) >= 0 ? Number(result.toFixed(5)) : 0
        },
        minimumFundsNeeded() {
            return this.minimumCSPRTransfer + this.transferFee;
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
                this.deployHash = await Transfer.sendTransfer(this.address, this.amount, this.transferID);
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