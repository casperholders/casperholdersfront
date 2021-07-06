<template>
  <v-container
    fill-height
    class="flex-column container__small"
  >
    <v-card
        width="100%"
        class="align-center rounded-xl secondary"
    >
      <v-card-title
          class="align-center"
      >
        <v-avatar

            color="primary"
            size="52"
        >
          <v-icon>mdi-send</v-icon>
        </v-avatar>
        <v-card-title class="pl-4">Transfer</v-card-title>
      </v-card-title>
      <v-form
          ref="form"
          lazy-validation
      >
        <v-card-text class="text-body-1">

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
          <Amount :value="amount" @input="amount = $event" :fee="transferFee" :minimum-c-s-p-r="minimumCSPRTransfer"
                  :balance="balance"/>
          <p>
            Transfer Fee : {{ transferFee }} CSPR<br/>
            Balance : {{ balance }} CSPR<br/>
            Remaining funds after transfer : {{ remainingBalance }} CSPR<br/>
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
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-dialog
              v-model="confirmDialog"
              persistent
              max-width="500"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                  color="primary"
                  dark
                  v-bind="attrs"
                  @click="openPopup(on,$event)"
                  large
                  class="rounded-xl"
                  :loading="transactionOnGoing"
                  :disabled="isTransactionOnGoing || errorBalance"
              >
                <v-icon left>
                  mdi-send
                </v-icon>
                Send Transaction
              </v-btn>
            </template>
            <v-card
                class="rounded-xl primary"
            >
              <v-card-title class="text-h5">
                Transfer Confirmation
              </v-card-title>
              <v-card-subtitle>
                Please confirm the following information before signing and sending the transfer.
              </v-card-subtitle>
              <v-card-text class="text-body-1">
                Amount : {{ amount }} CSPR<br/>
                Transfer fee : {{ transferFee }} CSPR<br/>
                Remaining funds after transfer : {{ remainingBalance }} CSPR<br/>
              </v-card-text>
              <v-card-text v-if="signError">
                <v-icon color="red">mdi-alert-circle</v-icon>
                Oops... A problem as occured. Please retry to sign or check the transfer values.
              </v-card-text>
              <v-card-actions class="pa-5">
                <v-btn
                    color="secondary"
                    class="rounded-xl"
                    @click="transactionOnGoing = false; confirmDialog = false"
                >
                  Disagree
                </v-btn>
                <v-btn
                    color="quaternary"
                    class="rounded-xl ml-5"
                    @click="sendDeploy"
                    :loading="loadingSignAndDeploy"
                >
                  Agree & Sign
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-card-actions>
      </v-form>
    </v-card>
    <OperationResult v-if="signed" :deploy-hash="deployHash" :amount="amount" @finishedOperation="finishedOperation"/>
  </v-container>
</template>

<script>
import {CLPublicKey, DeployUtil, Signer} from "casper-js-sdk";
import Amount from "@/components/operations/Amount";
import OperationResult from "@/components/operations/OperationResult";
import {mapState} from "vuex";

export default {
  name: 'Transfer',
  components: {OperationResult, Amount},
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
      confirmDialog: false,
      loadingSignAndDeploy: false,
      loadingBalance: false,
      errorBalance: false,
      errorMessagesBalance: [],
      amount: 3,
      balance: null,
      minimumCSPRTransfer: 3,
      transferFee: 10000 / 1000000000,
      transferID: '0',
      address: "",
      signError: false,
      transferError: false,
      transferErrorMessage: "",
      deployHash: null,
      signed: false,
      transactionOnGoing: false,
    }
  },
  async mounted() {
    await this.getBalance()
  },
  computed: {
    ...mapState([
      "signer",
    ]),
    isTransactionOnGoing() {
      if (!this.transactionOnGoing) {
        return
      }
      return "disabled"
    },
    remainingBalance() {
      let result = this.balance - this.amount - this.transferFee
      return Math.trunc(result) >= 0 ? result.toFixed(5) : 0
    },
  },
  watch: {
    async 'signer.activeKey'() {
      await this.getBalance()
    },
    balance() {
      if (this.signer.connected && this.signer.activeKey !== null) {
        if (this.balance == null || this.balance <= 3) {
          this.errorBalance = true;
          this.errorMessagesBalance = ["Insufficient funds. You must have more than " + this.minimumCSPRTransfer + " CSPR on your wallet."]
        } else {
          this.errorBalance = false;
          this.errorMessagesBalance = []
        }
      } else {
        this.errorBalance = true;
        this.errorMessagesBalance = ["Unknown. Unlock and/or connect to Casper Signer first."]
      }
    }
  },
  methods: {
    openPopup(on, event) {
      if (this.$refs.form.validate()) {
        on.click(event);
        this.transactionOnGoing = true;
      }
    },
    finishedOperation() {
      this.transactionOnGoing = false;
    },
    async getBalance() {
      if (this.signer.connected && this.signer.activeKey !== null) {
        this.loadingBalance = true;
        this.errorBalance = false;
        this.errorMessagesBalance = [];
        this.balance = null;
        try {
          const balanceData = await (await fetch(this.getApi() + "/balance/" + this.signer.activeKey)).json()
          this.balance = balanceData.balance / 1000000000
          this.loadingBalance = false
        } catch (e) {
          console.log(e)
          this.errorMessagesBalance = ["Unknown. Please check your public key hex."]
          this.loadingBalance = false
        }
      } else {
        this.errorMessagesBalance = ["Unknown. Unlock and/or connect to Casper Signer first."]
        this.balance = null;
      }
    },
    async sendDeploy() {
      this.transactionOnGoing = true;
      this.signed = false;
      this.signError = false;
      this.transferError = false;
      this.transferErrorMessage = "";
      this.loadingSignAndDeploy = true;
      const networkName = "casper-test";
      const paymentAmount = 10000;
      const from = CLPublicKey.fromHex(this.signer.activeKey);
      const to = CLPublicKey.fromHex(this.address);
      let deployParams = new DeployUtil.DeployParams(
          from,
          networkName
      );
      let session = DeployUtil.ExecutableDeployItem.newTransfer(
          this.amount * 1000000000,
          to,
          undefined,
          this.transferID
      );
      let payment = DeployUtil.standardPayment(paymentAmount);
      let deploy = DeployUtil.makeDeploy(deployParams, session, payment);
      let deployJson = DeployUtil.deployToJson(deploy)


      try {
        let deploySinged = await Signer.sign(deployJson, this.signer.activeKey, this.address)

        this.deployHash = null
        DeployUtil.validateDeploy(DeployUtil.deployFromJson(deploySinged))
        try {
          let transferData = await (await fetch(this.getApi() + "/transfer/", {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              deploy: deploySinged
            })
          })).json()
          this.loadingSignAndDeploy = false;
          this.confirmDialog = false;
          this.deployHash = transferData.deploy_hash
          this.signed = true;
        } catch (e) {
          console.log(e)
          this.loadingSignAndDeploy = false;
          this.confirmDialog = false;
          this.transferError = true;
          this.transferErrorMessage = "Failed to fetch internal api to send deploy.";
        }
      } catch (e) {
        console.log(e);
        this.signError = true;
        this.loadingSignAndDeploy = false;
      }
    },
    connectionRequest() {
      Signer.sendConnectionRequest();
    }
  }
}
</script>
