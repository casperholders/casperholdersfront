<template>
  <v-container fluid fill-height class="px-0">
    <v-layout>
      <v-flex xs12 sm6 offset-sm3>
        <v-card
            class="rounded-xl mt-9"
            style="background: #00012a">
          <v-card-title class="align-start elevation-6" style="width: 100%">
            <v-sheet rounded class="mt-n9" color="">
              <div class="pa-7">
                <v-icon>mdi-lock-open</v-icon>
              </div>
            </v-sheet>
            <v-card-title class="pl-4">Unstack</v-card-title>
          </v-card-title>
          <v-stepper
              v-model="delegationProcess"
              vertical
              class="rounded-xl"
              style="background: #00012a"
          >
            <v-stepper-step
                :complete="delegationProcess > 1"
                step="1"
            >
              Your validator node
              <small>Details about the validator you're going to undelegate (unstack).</small>
            </v-stepper-step>

            <v-stepper-content step="1">
              <v-card class="mb-5" color="transparent">
                <v-card-title>Your validator node</v-card-title>
                <v-card-subtitle>
                  Here's your validator : <a
                    :href=validatorUrl>{{getValidator()}}
                  <v-icon x-small>mdi-open-in-new</v-icon>
                </a>
                </v-card-subtitle>
                <v-card-text>
                  Actually there's a commission rate of 1%. (Applies on the staking rewards only.)
                </v-card-text>
              </v-card>
              <v-btn
                  class="rounded-pill"
                  color="primary"
                  @click="delegationProcess = 2"
              >
                Continue & Accept
              </v-btn>
            </v-stepper-content>
            <v-stepper-step
                step="2"
                :complete="delegationProcess > 2"
            >
              Verify account funds
              <small>Verify your account funds</small>
            </v-stepper-step>

            <v-stepper-content
                step="2"
            >
              <v-card class="mb-2" color="transparent">
                <v-card-title>Verify account funds</v-card-title>
                <v-card-subtitle>
                  Connect to Casper Signer and verify your account funds.
                </v-card-subtitle>
                <v-card-text v-if="balance !=null && stakingBalance!=null">
                  <span class="text-h5">Current Balance : {{ balance }} CSPR<br/></span>
                  <span class="text-h5">Current Staking Balance : {{ stakingBalance }} CSPR<br/></span>
                  <span
                      v-if="balance != null && stakingBalance != null && (balance < undelegateFee || stakingBalance < minimumCSPRUnstack)">
                  <v-icon color="red">mdi-alert-circle</v-icon>
                  <b>You don't have enough stake or funds. Please stake at least {{ minimumCSPRUnstack }} CSPR.</b><br/>
                  {{ undelegateFee }} CSPR are needed to pay for the unstack operation. (Those fees are defined by the CasperNetwork)<br/>
                  You need to unstack at least {{ minimumCSPRUnstack }} CSPR<br/>
                </span>
                  <span
                      v-if="balance != null && stakingBalance != null && balance >= undelegateFee && stakingBalance >= minimumCSPRUnstack">
                  <v-icon color="green">mdi-checkbox-marked-circle</v-icon> Everything is good ! You will be able to unstack {{
                      Math.trunc(stakingBalance)
                    }} CSPR maximum.
                </span>
                </v-card-text>
                <v-card-text v-if="!signerConnected">
                  Connect to Casper Signer first. Hit the refresh button to open the connection popup.<br/>
                  Once connected it refresh again to retrieved your current balance.
                </v-card-text>
                <v-card-text>
                  <form>
                    <v-btn
                        class="rounded-pill"
                        @click="getBalance"
                        :loading="loadingBalance"
                    >
                      Refresh
                    </v-btn>
                  </form>
                </v-card-text>
              </v-card>
              <v-btn
                  class="rounded-pill"
                  color="primary"
                  @click="delegationProcess = 3"
                  :disabled="sufficientsFunds"
              >
                Continue
              </v-btn>
              <v-btn class="rounded-pill ml-3" @click="balance=null; delegationProcess = 1">
                Cancel
              </v-btn>
            </v-stepper-content>

            <v-stepper-step
                step="3"
                :complete="delegationProcess > 3"
            >
              Staking amount
              <small>Set the number of CSPR you want to stake</small>
            </v-stepper-step>

            <v-stepper-content
                step="3"
            >
              <v-card class="mb-2" color="transparent">
                <v-card-title>Unstack amount</v-card-title>
                <v-card-subtitle>
                  Set the number of CSPR you want to retrieve from stacking
                </v-card-subtitle>
                <v-card-text>
                  <v-text-field v-model.number="CSPRToUnstack" :value="CSPRToUnstack" type="number"
                                :min="minimumCSPRUnstack"
                                :max="Math.trunc(stakingBalance)" label="Number of CSPR to stake" required
                                append-outer-icon="mdi-plus" @click:append-outer="increment" prepend-icon="mdi-minus"
                                @click:prepend="decrement"></v-text-field>
                </v-card-text>
                <v-card-title>
                  Unstack : {{ CSPRToUnstack }} CSPR<br/>
                  Undelegation fee : {{ undelegateFee }} CSPR<br/>
                  Total transaction cost : {{ undelegateFee }} CSPR<br/>
                  Balance after unstack : {{ balance - undelegateFee + CSPRToUnstack }} CSPR<br/>
                </v-card-title>
                <v-card-text v-if="CSPRToUnstack<minimumCSPRUnstack">
                  <v-icon color="red">mdi-alert-circle</v-icon>
                  <b>You must unstack at least {{ minimumCSPRUnstack }} CSPR.</b><br/>
                </v-card-text>
                <v-card-text v-if="CSPRToUnstack>Math.trunc(stakingBalance)">
                  <v-icon color="red">mdi-alert-circle</v-icon>
                  <b>You can unstack {{ Math.trunc(stakingBalance) }} CSPR maximum.</b><br/>
                </v-card-text>
                <v-card-text v-if="CSPRToUnstack>=minimumCSPRUnstack && CSPRToUnstack<=Math.trunc(stakingBalance)">
                  <v-icon color="green">mdi-checkbox-marked-circle</v-icon>
                  <b>Everything is good ! You will stake {{ CSPRToUnstack }} CSPR.</b>
                </v-card-text>
              </v-card>
              <v-btn
                  class="rounded-pill"
                  color="primary"
                  @click="delegationProcess = 4"
                  :disabled="correctUnstack"
              >
                Continue
              </v-btn>
              <v-btn
                  class="rounded-pill ml-3" @click="balance=null; delegationProcess = 2">
                Cancel
              </v-btn>
            </v-stepper-content>

            <v-stepper-step
                step="4"
                :complete="delegationProcess > 4"
            >
              Review unstack operation
              <small>Review the transaction</small>
            </v-stepper-step>

            <v-stepper-content
                step="4"
            >
              <v-card class="mb-2" color="transparent">
                <v-card-title>Review unstack operation</v-card-title>
                <v-card-subtitle>
                  Review the transaction
                </v-card-subtitle>
                <v-card-text>
                  You will unstack : {{ CSPRToUnstack }} CSPR<br/>
                  Undelegation fee : {{ undelegateFee }} CSPR<br/>
                  Total transaction : {{ undelegateFee }} CSPR<br/>
                  Balance after unstack : {{ balance - undelegateFee + CSPRToUnstack }} CSPR<br/>
                </v-card-text>
                <v-card-title>
                  Confirm the transaction ?
                </v-card-title>
                <v-card-text v-if="undelegationError">
                  <v-icon color="red">mdi-alert-circle</v-icon>
                  <b>An error as occured ! Check the message error : <br/>
                    {{ undelegationErrorMessage }}<br/></b>
                </v-card-text>
              </v-card>
              <v-btn
                  class="rounded-pill"
                  color="primary"
                  @click="delegate"
                  :disabled="correctUnstack"
                  :loading="loadUndelegateButton"
              >
                Sign & Continue
              </v-btn>
              <v-btn
                  class="rounded-pill ml-3" @click="delegationProcess = 3">
                Cancel
              </v-btn>
            </v-stepper-content>
            <v-stepper-step
                step="5"
                :complete="delegationProcess > 5"
            >
              Unstack Result
              <small>See the result of the unstacking operation</small>
            </v-stepper-step>

            <v-stepper-content
                step="5"
            >
              <v-card class="mb-2" color="transparent">
                <v-card-title>Unstack Result</v-card-title>
                <v-card-subtitle>
                  See the result of the unstacking operation
                </v-card-subtitle>
                <v-card-text v-if="deployHash==null && undelegationError===false">
                  Waiting for the deploy hash...
                  <v-progress-circular
                      indeterminate
                      color="blue"
                  ></v-progress-circular>
                </v-card-text>
                <v-card-text v-if="deployHash!=null">
                  Here's your deploy hash : <a :href="deployHashUrl">{{ deployHash }}
                  <v-icon x-small>mdi-open-in-new</v-icon>
                </a><br/>
                  <span v-if="deployResult==null">
                  Waiting for the deploy result ...<br/>
                  Re-trying every 30s.<br/>
                  Number of tries : {{ tries }}<br/>
                  <v-progress-circular indeterminate color="blue"></v-progress-circular>
                </span>
                  <span v-if="deployResult!=null">
                  Status of the unstacking operation :<br/>
                </span>
                  <span v-if="deployResult!=null && deployResult">
                  <v-icon color="green">mdi-checkbox-marked-circle</v-icon> Congrats ! You've unstacking : {{ CSPRToUnstack }} CSPR with {{
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
              <v-btn
                  class="rounded-pill"
                  v-if="undelegationError"
                  color="primary"
                  @click="balance = null; delegationProcess = 2"
              >
                Retry
              </v-btn>
              <v-btn
                  class="rounded-pill"
                  v-if="deployResult != null && !undelegationError"
                  color="primary"
                  @click="balance = null; delegationProcess = 2"
              >
                Stake more
              </v-btn>
            </v-stepper-content>
          </v-stepper>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import {DeployUtil, Signer} from "casper-client-sdk";

export default {
  name: 'Undelegate',
  data() {
    return {
      signerConnected: false,
      dialog: false,
      publicKeyHex: "",
      balance: null,
      stakingBalance: null,
      loadingBalance: false,
      errorMessagesBalance: [],
      errorBalance: false,
      delegationProcess: 1,
      undelegateFee: 1,
      CSPRToUnstack: 1,
      minimumCSPRUnstack: 1,
      deployHash: null,
      deployResult: null,
      tries: 0,
      undelegationError: false,
      undelegationErrorMessage: "",
      deployResultErrorMessage: "",
      deployCost: "",
      loadUndelegateButton: false,
    }
  },
  mounted() {
    Signer.isConnected().then(connected => {
      this.signerConnected = connected
      Signer.getActivePublicKey().then(res => {
        this.publicKeyHex = res
        this.getBalance()
      });
    });
  },
  methods: {
    getBalance() {
      Signer.isConnected().then(connected => {
        this.signerConnected = connected
        if (this.signerConnected) {
          this.loadingBalance = true;
          Signer.getActivePublicKey().then(res => {
            this.publicKeyHex = res
            this.errorBalance = false;
            this.errorMessagesBalance = [];
            this.balance = null;
            const self = this;
            fetch("http://localhost:3000/balance/" + this.publicKeyHex).then(response => {
              response.json().then(data => {
                self.balance = data.balance / 1000000000
              }).then(() => {
                fetch("http://localhost:3000/balance/stake/" + this.publicKeyHex).then(response => {
                  response.json().then(data => {
                    self.stakingBalance = data.balance / 1000000000
                    self.errorMessagesBalance = [data.error]
                    self.loadingBalance = false
                  })
                }).catch((err) => {
                  console.log(err)
                  self.errorMessagesBalance = ["Unknown. Please check your public key hex."]
                  self.loadingBalance = false
                })
              })
            }).catch((err) => {
              console.log(err)
              self.errorMessagesBalance = ["Unknown. Please check your public key hex."]
              self.loadingBalance = false
            })
          });
        } else {
          Signer.sendConnectionRequest();
          this.balance = null;
        }
      }).catch(err => console.log(err));
    },
    increment() {
      if (this.CSPRToUnstack < Math.trunc(this.stakingBalance)) {
        this.CSPRToUnstack = parseInt(this.CSPRToUnstack) + 1
      }
    },
    decrement() {
      if (this.CSPRToUnstack > this.minimumCSPRUnstack) {
        this.CSPRToUnstack = parseInt(this.CSPRToUnstack) - 1
      }
    },
    delegate() {
      this.loadUndelegateButton = true;
      this.undelegationError = false;
      this.undelegationErrorMessage = "";
      fetch('http://localhost:3000/undelegate/prepare', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: this.CSPRToUnstack,
          from: this.publicKeyHex
        })
      }).then((response) => {
        response.json().then((data) => {
          let parsedDeploy = DeployUtil.deployToJson(DeployUtil.deployFromJson(data))
          Signer.sign(parsedDeploy, this.publicKeyHex).then((result) => {
            fetch('http://localhost:3000/undelegate/', {
              method: 'POST',
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                deploy: result
              })
            }).then((response) => {
              response.json().then(data => {
                this.delegationProcess = 5
                this.loadUndelegateButton = false;
                this.deployHash = data.deploy_hash
                this.getDeployResult()
              }).catch(err => {
                console.log(err);
                this.loadUndelegateButton = false;
                this.delegationError = true;
                this.delegationErrorMessage = "Failed to parse internal api response for the deploy result. Please consult cspr.live to check if the deploy as been sent or not.";
              })
            }).catch(err => {
              console.log(err)
              this.loadUndelegateButton = false;
              this.delegationError = true;
              this.delegationErrorMessage = "Failed to fetch internal api to send deploy.";
            });
          }).catch((err) => {
            console.log(err)
            this.loadUndelegateButton = false;
            this.delegationError = true;
            this.delegationErrorMessage = "Failed to sign the contract. Please retry if you canceled the operation.";
          })
        }).catch(err => {
          console.log(err)
          this.loadUndelegateButton = false;
          this.delegationError = true;
          this.delegationErrorMessage = "Failed to parse internal api response to prepare contract";
        })
      }).catch(err => {
        console.log(err);
        this.loadUndelegateButton = false;
        this.delegationError = true;
        this.delegationErrorMessage = "Failed to fetch internal api to prepare contract";
      })

    },
    getDeployResult() {
      const self = this;
      fetch("http://localhost:3000/undelegate/result/" + this.deployHash).then(response => {
        response.json().then(data => {
          if (data.status !== "Unknown") {
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
      if (this.tries >= 30) {
        this.deployResultErrorMessage = "No deploy result from the network. Please check on cspr.live or reach someone on the discord with the deploy hash."
      }
    },
  },
  computed: {
    sufficientsFunds: function () {
      if (this.balance != null && this.balance >= this.undelegateFee) {
        return
      }
      return "disabled"
    },
    correctUnstack: function () {
      if (this.CSPRToUnstack >= this.minimumCSPRUnstack && this.CSPRToUnstack <= Math.trunc(this.stakingBalance)) {
        return
      }
      return "disabled"
    },
    deployHashUrl: function () {
      if (this.deployHash != null) {
        return this.getCsprLiveUrl() + "deploy/" + this.deployHash
      }
      return ""
    },
    validatorUrl: function (){
      return this.getValidatorUrl()
    }
  }
}
</script>

<style scoped>

</style>
