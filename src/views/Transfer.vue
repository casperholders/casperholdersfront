<template>
  <v-container
    fill-height
    class="flex-column px-0"
  >

    <v-card
      min-width="50vw"
      class="align-center rounded-xl secondary"
    >
      <v-card-title
        class="align-center"
      >
        <v-avatar
          class=""
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
          <v-text-field
            color="white"
            v-model.number="amount"
            :value="amount"
            type="number"
            :min="minimumCSPRTransfer"
            :max="maxCSPRTransfer"
            label="Number of CSPR to stake"
            :rules="amountRules"
            required
            append-outer-icon="mdi-plus"
            @click:append-outer="increment"
            prepend-icon="mdi-minus"
            @click:prepend="decrement"
            :hint="`Minimum CSPR need to do a transfer : ${minimumCSPRTransfer} CSPR`"
            persistent-hint
          />
          <v-slider
            v-model="amount"
            :label="labelPercentage"
            :max="maxCSPRTransfer"
            :min="minimumCSPRTransfer"
            color="white"
            class="pt-5"
          />
          <v-row class="pb-5">
            <v-col cols="3">
              <v-btn
                small
                outlined
                color="white"
                width="100%"
                class="rounded-xl"
                @click="amount=minimumCSPRTransfer"
              >
                Min
              </v-btn>
            </v-col>
            <v-col cols="3">
              <v-btn
                small
                outlined
                color="white"
                width="100%"
                class="rounded-xl"
                @click="amount=Math.trunc(balance*0.25)"
              >25%
              </v-btn>
            </v-col>
            <v-col cols="3">
              <v-btn
                small
                outlined
                color="white"
                width="100%"
                class="rounded-xl"
                @click="amount=Math.trunc(balance*0.5)"
              >50%
              </v-btn>
            </v-col>
            <v-col cols="3">
              <v-btn
                small
                outlined
                color="white"
                width="100%"
                class="rounded-xl"
                @click="amount=maxCSPRTransfer"
              >
                Max
              </v-btn>
            </v-col>
          </v-row>
          <p>
            Transfer Fee : {{ transferFee }} CSPR<br />
          </p>
          <p>
            Balance : {{ balance }} CSPR<br />
            Remaining funds after transfer : {{ remainingBalance }} CSPR
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
                :disabled="isTransactionOnGoing"
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
                Amount : {{ amount }} CSPR<br />
                Transfer fee : {{ transferFee }} CSPR<br />
                Remaining funds after transfer : {{ remainingBalance }} CSPR<br />
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

    <v-card
      v-if="signed"
      class="align-center rounded-xl secondary mt-5"
      min-width="50vw"
    >
      <v-card-title>
        Transfer result
      </v-card-title>
      <v-card-text
        class="text-body-1"
        v-if="deployHash==null"
      >
        Waiting for the deploy hash...
        <v-progress-circular
          indeterminate
          color="blue"
        ></v-progress-circular>
      </v-card-text>
      <v-card-text
        class="text-body-1"
        v-if="deployHash!=null"
      >
        Here's your deploy hash : <a :href="deployHashUrl">{{ deployHash }}
        <v-icon x-small>mdi-open-in-new</v-icon>
      </a><br />
        <span v-if="deployResult==null">
                  Waiting for the deploy result ...<br />
                  Re-trying every 30s.<br />
                  Number of tries : {{ tries }}<br />
                  <v-progress-circular
                    indeterminate
                    color="blue"
                  ></v-progress-circular>
                </span>
        <span v-if="deployResult!=null">
                  Status of the transfer operation :<br />
                </span>
        <span v-if="deployResult!=null && deployResult">
                  <v-icon color="green">mdi-checkbox-marked-circle</v-icon> Congrats ! You've transferred : {{ amount }} CSPR with {{
            deployCost
          }} CSPR transaction fee.
                </span>
        <span v-if="deployResult!=null && !deployResult">
                  <v-icon color="red">mdi-alert-circle</v-icon> Oops... A problem as occured. Check the error message here (or on the cspr.live website) :<br />
                  {{ deployResultErrorMessage }}.<br />
                  Transaction fee total cost : {{ deployCost }} CSPR.
                </span>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
import {DeployUtil, PublicKey, Signer} from "casper-client-sdk";

export default {
    name: 'Transfer',
    data() {
        return {
            addressRules: [
                a => !!a || 'Address is required',
                a => a.length >= 2 || 'Address is too short',
                a => {
                    try {
                        PublicKey.fromHex(a)
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
            amountRules: [
                a => !!a || 'Amount is required',
                a => /[0-9]+/.test(a) || 'Amount must be a number',
                a => a >= this.minimumCSPRTransfer || `Amount must be at least ${this.minimumCSPRTransfer}`,
                a => a <= this.maxCSPRTransfer || `Amount must equal or bellow ${this.maxCSPRTransfer}`,
            ],
            confirmDialog: false,
            loadingSignAndDeploy: false,
            amount: 3,
            publicKeyHex: null,
            loadingBalance: false,
            errorBalance: false,
            errorMessagesBalance: [],
            balance: null,
            minimumCSPRTransfer: 3,
            transferFee: 10000 / 1000000000,
            transferID: '0',
            address: "",
            signError: false,
            transferError: false,
            transferErrorMessage: "",
            deployHash: null,
            deployResult: null,
            tries: 0,
            deployResultErrorMessage: "",
            deployCost: "",
            signed: false,
            transactionOnGoing: false,
        }
    },
    async mounted() {
        try{
            this.signerConnected = await Signer.isConnected();
            if (this.signerConnected) {
                this.loadingBalance = true;
                this.publicKeyHex = await Signer.getActivePublicKey();
                this.errorBalance = false;
                this.errorMessagesBalance = [];
                this.balance = null;
                try {
                    const balanceData = await(await fetch(this.getApi()+"/balance/" + this.publicKeyHex)).json()
                    console.log(this.maxCSPRTransfer)
                    this.balance = balanceData.balance / 1000000000
                    console.log(this.maxCSPRTransfer)
                    this.loadingBalance = false
                }catch (e) {
                    console.log(e)
                    this.errorMessagesBalance = ["Unknown. Please check your public key hex."]
                    this.loadingBalance = false
                }
            } else {
                Signer.sendConnectionRequest();
                this.balance = null;
            }
        }catch (e) {
            console.log(e)
        }
    },
    computed: {
        isTransactionOnGoing: function () {
            if (!this.transactionOnGoing) {
                return
            }
            return "disabled"
        },
        remainingBalance: function () {
            let result = this.balance - this.amount - this.transferFee
            return Math.trunc(result) >= 0 ? result.toFixed(5) : 0
        },
        labelPercentage: function () {
            return this.balance != null ? Math.trunc(((this.amount + 1) / Math.trunc(this.balance)) * 100) + '%' : "0%"
        },
        maxCSPRTransfer: function () {
            return Math.trunc(this.balance - this.transferFee) > 0 ? Math.trunc(this.balance - this.transferFee) : this.minimumCSPRTransfer
        },
        deployHashUrl: function () {
            if (this.deployHash != null) {
                return this.getCsprLiveUrl() + "deploy/" + this.deployHash
            }
            return ""
        }
    },
    methods: {
        openPopup(on, event) {
            if(this.$refs.form.validate()){
                on.click(event);
                this.transactionOnGoing = true;
            }
        },
        increment() {
            if (this.amount < this.maxCSPRTransfer) {
                this.amount = parseInt(this.amount) + 1
            }
        },
        decrement() {
            if (this.amount > this.minimumCSPRTransfer) {
                this.amount = parseInt(this.amount) - 1
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
            console.log(this.publicKeyHex);
            const from = PublicKey.fromHex(this.publicKeyHex);
            console.log(from);
            console.log(this.address);
            const to = PublicKey.fromHex(this.address);
            console.log(to);
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
                let deploySinged = await Signer.sign(deployJson, this.publicKeyHex, this.address)

                this.deployHash = null
                DeployUtil.validateDeploy(DeployUtil.deployFromJson(deploySinged))
                try {
                    let transferData = await (await fetch(this.getApi()+"/transfer/", {
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
                    await this.getDeployResult()
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
        async getDeployResult() {
            try {
                let resultData = await (await fetch(this.getApi()+"/transfer/result/" + this.deployHash)).json();
                if (resultData.status !== "Unknown") {
                    this.deployCost = resultData.cost / 1000000000
                    this.deployResultErrorMessage = resultData.message
                    this.deployResult = resultData.status
                    this.transactionOnGoing = false;
                }
            } catch (e) {
                console.log(e)
            }

            if (this.deployResult == null && this.tries < 30) {
                this.tries = this.tries + 1
                console.log("tries :" + this.tries)
                setTimeout(() => {
                    this.getDeployResult();
                }, 30000);
            }
            if (this.tries >= 30) {
                this.transactionOnGoing = false;
                this.deployResultErrorMessage = "No deploy result from the network. Please check on cspr.live or reach someone on the discord with the deploy hash."
            }
        },
    }
}
</script>
