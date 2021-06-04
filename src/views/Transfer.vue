<template>
  <v-container fill-height class="px-0">
    <v-row justify="center">
      <v-card
          style="background: #00012a; width: 50vw;" class="align-center rounded-xl">
        <v-card-title class="align-start" style="width: 100%">
          <v-sheet rounded class="mt-n9" color="">
            <div class="pa-7">
              <v-icon>mdi-send</v-icon>
            </div>
          </v-sheet>
          <v-card-title class="pl-4">Transfer</v-card-title>
        </v-card-title>
        <v-card-text class="text-body-1">
          <form>
            <v-text-field color="white" v-model="address" :value="address" label="Send to address :" required prepend-icon="mdi-account"></v-text-field>
            <v-text-field color="white" v-model.number="amount" :value="amount" type="number" :min="minimumCSPRTransfer"
                          :max="maxCSPRTransfer" label="Number of CSPR to stake" required
                          append-outer-icon="mdi-plus" @click:append-outer="increment" prepend-icon="mdi-minus"
                          @click:prepend="decrement"></v-text-field>
            <v-slider
                v-model="amount"
                hint="Percentage"
                :label="labelPercentage"
                :max="maxCSPRTransfer"
                :min="minimumCSPRTransfer"
                color="white"
            ></v-slider>
            <v-row>
              <v-col cols="3">
                <v-btn outlined color="white" width="100%" class="rounded-xl" @click="amount=minimumCSPRTransfer">Min</v-btn>
              </v-col>
              <v-col cols="3">
                <v-btn outlined color="white" width="100%" class="rounded-xl" @click="amount=Math.trunc(balance*0.25)">25%</v-btn>
              </v-col>
              <v-col cols="3">
                <v-btn outlined color="white" width="100%" class="rounded-xl" @click="amount=Math.trunc(balance*0.5)">50%</v-btn>
              </v-col>
              <v-col cols="3">
                <v-btn outlined color="white" width="100%" class="rounded-xl" @click="amount=maxCSPRTransfer">Max</v-btn>
              </v-col>
              <v-col cols="12">
                <v-text-field color="white" :value="transferID" label="Transfer ID :" required prepend-icon="mdi-music-accidental-sharp" hint="Set to 0 if not known"></v-text-field>
              </v-col>
              <v-col cols="12">
                Transfer Fee : {{transferFee}} CSPR<br/>
                Minimum CSPR need to do a transfer : {{minimumCSPRTransfer}}
              </v-col>
              <v-col cols="12">
                Balance : {{balance}} CSPR<br/>
                Remaining funds after transfer : {{remainingBalance}} CSPR
              </v-col>
            </v-row>
          </form>
        </v-card-text>
        <v-card-actions>
          <v-dialog
              v-model="confirmDialog"
              persistent
              max-width="500"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-spacer></v-spacer>
              <v-btn
                  color="white"
                  outlined
                  dark
                  v-bind="attrs"
                  v-on="on"
                  large
                  class="mb-3 rounded-xl"
              >
                Next
              </v-btn>
            </template>
            <v-card class="rounded-xl" style="background: #00126b;">
              <v-card-title class="text-h5">
                Transfer Confirmation
              </v-card-title>
              <v-card-subtitle>
                Please confirm the following information before signing and sending the transfer.
              </v-card-subtitle>
              <v-card-text class="text-body-1">
                Amount : {{amount}} CSPR<br/>
                Transfer fee : {{transferFee}} CSPR<br/>
                Remaining funds after transfer : {{remainingBalance}} CSPR<br/>
              </v-card-text>
              <v-card-text v-if="signError">
                <v-icon color="red">mdi-alert-circle</v-icon>
                Oops... A problem as occured. Please retry to sign or check the transfer values.
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                    color="white"
                    outlined
                    class="rounded-xl"
                    @click="confirmDialog = false"
                >
                  Disagree
                </v-btn>
                <v-btn
                    color="quaternary"
                    class="rounded-xl"
                    @click="sendDeploy"
                    :loading="loadingSignAndDeploy"
                >
                  Agree & Sign
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-card-actions>
      </v-card>
    </v-row>
    <v-row justify="center" v-if="signed">
      <v-card style="background: #00012a; width: 50vw;" class="align-center rounded-xl">
        <v-card-title>
          Transfer result
        </v-card-title>
        <v-card-text class="text-body-1" v-if="deployHash==null">
          Waiting for the deploy hash...
          <v-progress-circular
              indeterminate
              color="blue"
          ></v-progress-circular>
        </v-card-text>
        <v-card-text class="text-body-1" v-if="deployHash!=null">
          Here's your deploy hash : <a :href="deployHashUrl">{{ deployHash }}<v-icon x-small>mdi-open-in-new</v-icon></a><br/>
          <span v-if="deployResult==null">
                  Waiting for the deploy result ...<br/>
                  Re-trying every 30s.<br/>
                  Number of tries : {{ tries }}<br/>
                  <v-progress-circular indeterminate color="blue"></v-progress-circular>
                </span>
          <span v-if="deployResult!=null">
                  Status of the transfer operation :<br/>
                </span>
          <span v-if="deployResult!=null && deployResult">
                  <v-icon color="green">mdi-checkbox-marked-circle</v-icon> Congrats ! You've transferred : {{ amount }} CSPR with {{
              deployCost
            }} CSPR transaction fee.
                </span>
          <span v-if="deployResult!=null && !deployResult">
                  <v-icon color="red">mdi-alert-circle</v-icon> Oops... A problem as occured. Check the error message here (or on the cspr.live website) :<br/>
                  {{ deployResultErrorMessage }}.<br/>
                  Transaction fee total cost : {{ deployCost }} CSPR.
                </span>
        </v-card-text>
      </v-card>
    </v-row>
  </v-container>
</template>

<script>
import {DeployUtil, PublicKey, Signer} from "casper-client-sdk";

export default {
  name: 'Transfer',
  data: () => ({
    confirmDialog: false,
    loadingSignAndDeploy: false,
    amount: 3,
    publicKeyHex: null,
    loadingBalance: false,
    errorBalance: false,
    errorMessagesBalance: [],
    balance: null,
    minimumCSPRTransfer: 3,
    transferFee: 10000/1000000000,
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
  }),
  mounted: function () {
    Signer.isConnected().then( connected => {
      this.signerConnected = connected
      if(this.signerConnected){
        this.loadingBalance = true;
        Signer.getActivePublicKey().then(res => {
          this.publicKeyHex = res
          this.errorBalance = false;
          this.errorMessagesBalance = [];
          this.balance = null;
          fetch("http://localhost:3000/balance/"+this.publicKeyHex).then(response => {
            response.json().then(data => {
              console.log(this.maxCSPRTransfer)
              this.balance = data.balance / 1000000000
              console.log(this.maxCSPRTransfer)
              this.loadingBalance = false
            })
          }).catch((err) => {
            console.log(err)
            this.errorMessagesBalance = ["Unknown. Please check your public key hex."]
            this.loadingBalance = false
          })
        });
      } else {
        Signer.sendConnectionRequest();
        this.balance = null;
      }
    }).catch(err => console.log(err));
  },
  computed: {
    remainingBalance: function (){
      let result = this.balance - this.amount - this.transferFee
      return Math.trunc(result) >= 0 ? result.toFixed(5) : 0
    },
    labelPercentage: function (){
      return this.balance != null ? Math.trunc(((this.amount+1)/Math.trunc(this.balance))*100)+'%' : "0%"
    },
    maxCSPRTransfer: function (){
      return Math.trunc(this.balance-this.transferFee) >0 ? Math.trunc(this.balance-this.transferFee) : this.minimumCSPRTransfer
    },
    deployHashUrl: function () {
      if (this.deployHash != null) {
        return this.getCsprLiveUrl() + "deploy/" + this.deployHash
      }
      return ""
    }
  },
  methods: {
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
    sendDeploy() {
      this.signed = false;
      this.signError=false;
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
          this.amount*1000000000,
          to,
          undefined,
          this.transferID
      );
      let payment = DeployUtil.standardPayment(paymentAmount);
      let deploy = DeployUtil.makeDeploy(deployParams, session, payment);
      let deployJson = DeployUtil.deployToJson(deploy)
      Signer.sign(deployJson, this.publicKeyHex).then((result) => {
        DeployUtil.validateDeploy(DeployUtil.deployFromJson(result))
        fetch('http://localhost:3000/transfer/', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            deploy: result
          })
        }).then((response) => {
          response.json().then(data =>{
            this.loadingSignAndDeploy = false;
            this.confirmDialog = false;
            this.deployHash = data.deploy_hash
            this.signed = true;
            this.getDeployResult()
          }).catch(err => {
            console.log(err);
            this.loadingSignAndDeploy = false;
            this.confirmDialog = false;
            this.transferError = true;
            this.transferErrorMessage = "Failed to parse internal api response for the deploy result. Please consult cspr.live to check if the deploy as been send or not.";
          })
        }).catch(err => {
          console.log(err)
          this.loadingSignAndDeploy = false;
          this.confirmDialog = false;
          this.transferError = true;
          this.transferErrorMessage = "Failed to fetch internal api to send deploy.";
        });
      }).catch(err => {
        console.log(err);
        this.signError=true;
        this.loadingSignAndDeploy = false;
      })
    },
    getDeployResult() {
      const self = this;
      fetch("http://localhost:3000/transfer/result/"+this.deployHash).then(response => {
        response.json().then(data => {
          if(data.status !== "Unknown"){
            this.deployCost = data.cost / 1000000000
            this.deployResultErrorMessage = data.message
            this.deployResult = data.status
          }
        })
      }).catch((err) => {
        console.log(err)
      })
      if (this.deployResult == null && this.tries < 30) {
        this.tries = this.tries + 1
        console.log("tries :" + this.tries)
        setTimeout(function () {
          self.getDeployResult();
        }, 30000);
      }
      if(this.tries >= 30){
        this.deployResultErrorMessage = "No deploy result from the network. Please check on cspr.live or reach someone on the discord with the deploy hash."
      }
    },
  }
}
</script>
