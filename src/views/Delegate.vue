<template>
  <v-container
    fluid
    fill-height
    class="px-0"
  >
    <v-layout>
      <v-flex
        xs12
        sm6
        offset-sm3
      >
        <v-card
          class="rounded-xl mt-9 secondary"
        >
          <v-card-title class="align-center">
            <v-avatar
              color="primary"
              size="52"
            >
              <v-icon>mdi-safe</v-icon>
            </v-avatar>
            <v-card-title class="pl-4">Staking</v-card-title>
          </v-card-title>
          <v-stepper
            v-model="delegationProcess"
            vertical
            class="rounded-xl secondary"
          >
            <v-stepper-step
              :complete="delegationProcess > 1"
              step="1"
            >
              Your validator node
              <small>Details about the validator you're going to delegate (stake).</small>
            </v-stepper-step>

            <v-stepper-content step="1">
              <p class="text-body-1 py-5">
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
              <div>
                <p class="text-subtitle-1">
                  Connect to Casper Signer and verify your account funds.<br />
                  <v-btn
                    class="rounded-pill mt-3"
                    @click="getBalance"
                    :loading="loadingBalance"
                  >
                    Refresh
                  </v-btn>
                </p>
                <p v-if="!signerConnected">
                  Connect to Casper Signer first. Hit the refresh button to open the connection popup.<br />
                  Once connected it refresh again to retrieved your current balance.
                </p>

                <p v-if="balance!=null">
                  <span class="text-h6">Current Balance : {{ balance }} CSPR<br /></span>
                  <span v-if="balance != null && balance < minimumCSPRNeeded">
                    <v-icon color="red">mdi-alert-circle</v-icon>
                    <b>You don't have enough funds. Please fund your account with at least {{
                        minimumCSPRNeeded
                      }} CSPR.</b><br />
                    {{ delegationFee }} CSPR are needed to pay for the delegation fee. (Those fees are defined by the Casper
                    Network)<br />
                    You need to delegate at least {{ minimumCSPRStake }} CSPR<br />
                  </span>
                  <span v-if="balance != null && balance >= minimumCSPRNeeded">
                  <v-icon color="green">mdi-checkbox-marked-circle</v-icon> Everything is good ! You will be able to stake {{
                      maxStake
                    }} CSPR maximum.
                </span>
                </p>
              </div>
              <v-btn
                class="rounded-pill"
                @click="balance=null; delegationProcess = 1"
              >
                Cancel
              </v-btn>
              <v-btn
                class="rounded-pill ml-5"
                color="primary"
                @click="delegationProcess = 3"
                :disabled="sufficientsFunds"
              >
                Continue
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
              <div>
                <v-text-field
                  color="white"
                  v-model.number="CSPRToStake"
                  :value="CSPRToStake"
                  type="number"
                  :min="minimumCSPRStake"
                  :max="maxStake"
                  label="Number of CSPR to stake"
                  required
                  append-outer-icon="mdi-plus"
                  @click:append-outer="increment"
                  prepend-icon="mdi-minus"
                  @click:prepend="decrement"
                ></v-text-field>
                <p class="text-body-1">
                  Staking : {{ CSPRToStake }} CSPR<br />
                  Delegation fee : {{ delegationFee }} CSPR<br />
                  Total transaction : {{ CSPRToStake + delegationFee }} CSPR<br />
                  Remaining Balance after staking : {{ balance - CSPRToStake - delegationFee }} CSPR<br />
                </p>
                <p v-if="CSPRToStake<minimumCSPRStake">
                  <v-icon color="red">mdi-alert-circle</v-icon>
                  <b>You must stake at least {{ minimumCSPRStake }} CSPR.</b><br />
                </p>
                <p v-if="CSPRToStake>maxStake">
                  <v-icon color="red">mdi-alert-circle</v-icon>
                  <b>You can stake {{ maxStake }} CSPR maximum.</b><br />
                </p>
                <p v-if="CSPRToStake>=minimumCSPRStake && CSPRToStake<=maxStake">
                  <v-icon color="green">mdi-checkbox-marked-circle</v-icon>
                  <b>Everything is good ! You will stake {{ Math.trunc(CSPRToStake) }} CSPR.</b>
                </p>
              </div>
              <v-btn
                class="rounded-pill"
                @click="balance=null; delegationProcess = 2"
              >
                Cancel
              </v-btn>
              <v-btn
                class="rounded-pill ml-5"
                color="primary"
                @click="delegationProcess = 4"
                :disabled="correctStake"
              >
                Continue
              </v-btn>
            </v-stepper-content>

            <v-stepper-step
              step="4"
              :complete="delegationProcess > 4"
            >
              Review staking operation
              <small>Review the transaction</small>
            </v-stepper-step>

            <v-stepper-content
              step="4"
            >
              <div class="text-body-1">
                <p>
                  You will stake : {{ CSPRToStake }} CSPR<br />
                  Delegation fee : {{ delegationFee }} CSPR<br />
                  Total transaction : {{ CSPRToStake + delegationFee }} CSPR<br />
                  Remaining Balance after staking : {{ balance - CSPRToStake - delegationFee }} CSPR<br />
                </p>
                <p class="text-h6">
                  Confirm the transaction ?
                </p>
                <p v-if="delegationError">
                  <v-icon color="red">mdi-alert-circle</v-icon>
                  <b>An error as occured ! Check the message error : <br />
                    {{ delegationErrorMessage }}<br /></b>
                </p>
              </div>
              <v-btn
                class="rounded-pill"
                @click="delegationProcess = 3"
              >
                Cancel
              </v-btn>
              <v-btn
                class="rounded-pill ml-5"
                color="primary"
                @click="delegate"
                :disabled="correctStake"
                :loading="loadDelegateButton"
              >
                Sign & Continue
              </v-btn>
            </v-stepper-content>
            <v-stepper-step
              step="5"
              :complete="delegationProcess > 4"
            >
              Staking Result
              <small>See the result of the staking operation</small>
            </v-stepper-step>

            <v-stepper-content
              step="5"
            >
              <div class="text-body-1">
                <p v-if="deployHash==null && delegationError===false">
                  Waiting for the deploy hash...
                  <v-progress-circular
                    indeterminate
                    color="blue"
                  ></v-progress-circular>
                </p>
                <p v-if="deployHash!=null">
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
                  Status of the staking operation :<br />
                </span>
                  <span v-if="deployResult!=null && deployResult">
                  <v-icon color="green">mdi-checkbox-marked-circle</v-icon> Congrats ! You've staked : {{ CSPRToStake }} CSPR with {{
                      deployCost
                    }} CSPR transaction fee.
                </span>
                  <span v-if="deployResult!=null && !deployResult">
                  <v-icon color="red">mdi-alert-circle</v-icon> Oops... A problem as occured. Check the error message here (or on the cspr.live website) :<br />
                  {{ deployResultErrorMessage }}.<br />
                  Transaction fee total cost : {{ deployCost }} CSPR.
                </span>
                </p>
              </div>
              <v-btn
                class="rounded-pill"
                v-if="delegationError"
                color="primary"
                @click="balance = null; delegationProcess = 2"
              >
                Retry
              </v-btn>
              <v-btn
                class="rounded-pill"
                v-if="deployResult != null && !delegationError"
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
    name: "Delegate",
    data() {
        return {
            signerConnected: false,
            dialog: false,
            publicKeyHex: "",
            balance: null,
            loadingBalance: false,
            errorMessagesBalance: [],
            errorBalance: false,
            delegationProcess: 1,
            delegationFee: 3,
            CSPRToStake: 1,
            minimumCSPRStake: 1,
            deployHash: null,
            deployResult: null,
            tries: 0,
            delegationError: false,
            delegationErrorMessage: "",
            deployResultErrorMessage: "",
            deployCost: "",
            loadDelegateButton: false,
        }
    },
    async mounted() {
        this.signerConnected = await Signer.isConnected()
        this.publicKeyHex = await Signer.getActivePublicKey()
        await this.getBalance()
    },
    methods: {
        async getBalance() {
            try {
                if (this.signerConnected) {
                    this.loadingBalance = true;
                    this.publicKeyHex = await Signer.getActivePublicKey()
                    this.errorBalance = false;
                    this.errorMessagesBalance = [];
                    this.balance = null;
                    try {
                        const balanceData = await (await fetch(this.getApi()+"/balance/" + this.publicKeyHex)).json()
                        this.balance = balanceData.balance / 1000000000
                        this.loadingBalance = false
                    } catch (e) {
                        console.log(e)
                        this.errorMessagesBalance = ["Unknown. Please check your public key hex."]
                        this.loadingBalance = false
                    }
                } else {
                    Signer.sendConnectionRequest();
                    this.balance = null;
                }
            } catch (e) {
                console.log(e)
            }
            this.signerConnected = await Signer.isConnected()
        },
        increment() {
            if (this.CSPRToStake < this.maxStake) {
                this.CSPRToStake = parseInt(this.CSPRToStake) + 1
            }
        },
        decrement() {
            if (this.CSPRToStake > this.minimumCSPRStake) {
                this.CSPRToStake = parseInt(this.CSPRToStake) - 1
            }
        },
        async delegate() {
            this.loadDelegateButton = true;
            this.delegationError = false;
            this.delegationErrorMessage = "";
            try {
                const delegatePrepareData = await (await fetch(this.getApi()+"/delegate/prepare", {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        amount: this.CSPRToStake,
                        from: this.publicKeyHex
                    })
                })).json()

                let parsedDeploy = DeployUtil.deployToJson(DeployUtil.deployFromJson(delegatePrepareData))

                try {
                    const signedDeploy = await Signer.sign(parsedDeploy, this.publicKeyHex)


                    try {
                        const delegateData = await (await fetch(this.getApi()+"/delegate/", {
                            method: 'POST',
                            headers: {
                                'Accept': 'application/json',
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                deploy: signedDeploy
                            })
                        })).json()
                        this.delegationProcess = 5
                        this.loadDelegateButton = false;
                        this.deployHash = delegateData.deploy_hash
                        await this.getDeployResult()
                    } catch (e) {
                        console.log(e)
                        this.loadDelegateButton = false;
                        this.delegationError = true;
                        this.delegationErrorMessage = "Failed to fetch internal api to send deploy.";
                    }
                } catch (e) {
                    console.log(e)
                    this.loadDelegateButton = false;
                    this.delegationError = true;
                    this.delegationErrorMessage = "Failed to sign the contract. Please retry if you canceled the operation.";
                }
            } catch (e) {
                console.log(e);
                this.loadDelegateButton = false;
                this.delegationError = true;
                this.delegationErrorMessage = "Failed to fetch internal api to prepare contract";
            }
        },
        async getDeployResult() {
            try {
                const delegateResultData = await (await fetch(this.getApi()+"/delegate/result/" + this.deployHash)).json()
                if (delegateResultData.status !== "Unknown") {
                    this.deployCost = delegateResultData.cost / 1000000000
                    this.deployResultErrorMessage = delegateResultData.message
                    this.deployResult = delegateResultData.status
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
                this.deployResultErrorMessage = "No deploy result from the network. Please check on cspr.live or reach someone on the discord with the deploy hash."
            }
        },
    },
    computed: {
        sufficientsFunds: function () {
            if (this.balance != null && this.balance >= this.minimumCSPRNeeded) {
                return
            }
            return "disabled"
        },
        minimumCSPRNeeded: function () {
            return this.delegationFee + this.minimumCSPRStake;
        },
        maxStake: function () {
            return Math.trunc(this.balance - this.delegationFee)
        },
        correctStake: function () {
            if (this.CSPRToStake >= this.minimumCSPRStake && this.CSPRToStake <= this.maxStake) {
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
        validatorUrl: function () {
            return this.getValidatorUrl();
        }
    }
}
</script>

<style scoped>

</style>
