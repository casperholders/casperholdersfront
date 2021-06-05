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
              <v-icon>mdi-lock-open</v-icon>
            </v-avatar>
            <v-card-title class="pl-4">Unstack</v-card-title>
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
              <small>Details about the validator you're going to undelegate (unstack).</small>
            </v-stepper-step>

            <v-stepper-content step="1">

              <p class="text-body-1 py-5">
                Here's your validator : <a
                :href=validatorUrl
              >{{ getValidator() }}
                <v-icon x-small>mdi-open-in-new</v-icon>
              </a><br />
                <br />
                Actually there's a commission rate of 1%. (Applies on the staking rewards only.)<br />
                Exemple : if you receive 100 CSPR rewards from staking, CasperHolders will received 1 CSPR and you will
                get 99 CSPR.
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
                    class="rounded-pill"
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
                <p v-if="balance !=null && stakingBalance!=null">
                  <span class="text-h6">Current Balance : {{ balance }} CSPR<br /></span>
                  <span class="text-h6">Current Staking Balance : {{ stakingBalance }} CSPR<br /></span>
                  <span
                    v-if="balance != null && stakingBalance != null && (balance < undelegateFee || stakingBalance < minimumCSPRUnstack)"
                  >
                  <v-icon color="red">mdi-alert-circle</v-icon>
                  <b>You don't have enough stake or funds. Please stake at least {{
                      minimumCSPRUnstack
                    }} CSPR.</b><br />
                  {{ undelegateFee }} CSPR are needed to pay for the unstack operation. (Those fees are defined by the CasperNetwork)<br />
                  You need to unstack at least {{ minimumCSPRUnstack }} CSPR<br />
                </span>
                  <span
                    v-if="balance != null && stakingBalance != null && balance >= undelegateFee && stakingBalance >= minimumCSPRUnstack"
                  >
                  <v-icon color="green">mdi-checkbox-marked-circle</v-icon> Everything is good ! You will be able to unstack {{
                      Math.trunc(stakingBalance)
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
                  v-model.number="CSPRToUnstack"
                  :value="CSPRToUnstack"
                  type="number"
                  :min="minimumCSPRUnstack"
                  :max="Math.trunc(stakingBalance)"
                  label="Number of CSPR to stake"
                  required
                  append-outer-icon="mdi-plus"
                  @click:append-outer="increment"
                  prepend-icon="mdi-minus"
                  @click:prepend="decrement"
                ></v-text-field>
                <p class="text-body-1">
                  Unstack : {{ CSPRToUnstack }} CSPR<br />
                  Undelegation fee : {{ undelegateFee }} CSPR<br />
                  Total transaction cost : {{ undelegateFee }} CSPR<br />
                  Balance after unstack : {{ balance - undelegateFee + CSPRToUnstack }} CSPR<br />
                </p>
                <p v-if="CSPRToUnstack<minimumCSPRUnstack">
                  <v-icon color="red">mdi-alert-circle</v-icon>
                  <b>You must unstack at least {{ minimumCSPRUnstack }} CSPR.</b><br />
                </p>
                <p v-if="CSPRToUnstack>Math.trunc(stakingBalance)">
                  <v-icon color="red">mdi-alert-circle</v-icon>
                  <b>You can unstack {{ Math.trunc(stakingBalance) }} CSPR maximum.</b><br />
                </p>
                <p v-if="CSPRToUnstack>=minimumCSPRUnstack && CSPRToUnstack<=Math.trunc(stakingBalance)">
                  <v-icon color="green">mdi-checkbox-marked-circle</v-icon>
                  <b>Everything is good ! You will stake {{ CSPRToUnstack }} CSPR.</b>
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
                :disabled="correctUnstack"
              >
                Continue
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
              <div class="text-body-1">
                <p>
                  You will unstack : {{ CSPRToUnstack }} CSPR<br />
                  Undelegation fee : {{ undelegateFee }} CSPR<br />
                  Total transaction : {{ undelegateFee }} CSPR<br />
                  Balance after unstack : {{ balance - undelegateFee + CSPRToUnstack }} CSPR<br />
                </p>
                <p class="text-h6">
                  Confirm the transaction ?
                </p>
                <p v-if="undelegationError">
                  <v-icon color="red">mdi-alert-circle</v-icon>
                  <b>An error as occured ! Check the message error : <br />
                    {{ undelegationErrorMessage }}<br /></b>
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
                :disabled="correctUnstack"
                :loading="loadUndelegateButton"
              >
                Sign & Continue
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
              <div class="text-body-1">
                <p  v-if="deployHash==null && undelegationError===false">
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
                  Status of the unstacking operation :<br />
                </span>
                  <span v-if="deployResult!=null && deployResult">
                  <v-icon color="green">mdi-checkbox-marked-circle</v-icon> Congrats ! You've unstacking : {{
                      CSPRToUnstack
                    }} CSPR with {{
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
                        const balanceData = await (await fetch("http://localhost:3000/balance/" + this.publicKeyHex)).json()
                        this.balance = balanceData.balance / 1000000000
                        await this.getStakeBalance()
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
        async getStakeBalance() {
            try {
                const stakeData = await (await fetch("http://localhost:3000/balance/stake/" + this.publicKeyHex)).json()
                this.stakingBalance = stakeData.balance / 1000000000
                this.errorMessagesBalance = [stakeData.error]
            } catch (e) {
                console.log(e)
                this.errorMessagesBalance = ["Unknown. Please check your public key hex."]
            }
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
        async delegate() {
            this.loadUndelegateButton = true;
            this.undelegationError = false;
            this.undelegationErrorMessage = "";

            try {
                const undelegatePrepareData = await (await fetch('http://localhost:3000/undelegate/prepare', {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        amount: this.CSPRToUnstack,
                        from: this.publicKeyHex
                    })
                })).json()
                let parsedDeploy = DeployUtil.deployToJson(DeployUtil.deployFromJson(undelegatePrepareData))
                try {
                    const signedDeploy = await Signer.sign(parsedDeploy, this.publicKeyHex)
                    try {
                        const undelegateData = await (await fetch('http://localhost:3000/undelegate/', {
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
                        this.loadUndelegateButton = false;
                        this.deployHash = undelegateData.deploy_hash
                        await this.getDeployResult()
                    } catch (e) {
                        console.log(e)
                        this.loadUndelegateButton = false;
                        this.delegationError = true;
                        this.delegationErrorMessage = "Failed to fetch internal api to send deploy.";
                    }

                } catch (e) {
                    console.log(e)
                    this.loadUndelegateButton = false;
                    this.delegationError = true;
                    this.delegationErrorMessage = "Failed to sign the contract. Please retry if you canceled the operation.";
                }
            } catch (e) {
                console.log(e);
                this.loadUndelegateButton = false;
                this.delegationError = true;
                this.delegationErrorMessage = "Failed to fetch internal api to prepare contract";
            }
        },
        async getDeployResult() {
            try {
                const undelegateResultData = await (await fetch("http://localhost:3000/undelegate/result/" + this.deployHash))
                if (undelegateResultData.status !== "Unknown") {
                    this.deployCost = undelegateResultData.cost / 1000000000
                    this.deployResultErrorMessage = undelegateResultData.message
                    this.deployResult = undelegateResultData.status
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
        validatorUrl: function () {
            return this.getValidatorUrl()
        }
    }
}
</script>

<style scoped>

</style>
