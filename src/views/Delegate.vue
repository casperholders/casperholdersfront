<template>
  <v-container
      fill-height
      class="container__small"
  >
    <v-card
        class="rounded-xl secondary"
        width="100%"
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
      <p class="text-body-1 pl-15 pr-10">
        Here's your validator : <a
          :href=validatorUrl
      >{{ getValidator() }}
        <v-icon x-small>mdi-open-in-new</v-icon>
      </a><br/>
        <br/>
        Actually there's a commission rate of 5%. (Applies on the staking rewards only.)<br/>
        Exemple : if you receive 100 CSPR rewards from staking, CasperHolders will received 5 CSPR and you will
        get 95 CSPR.
      </p>
      <v-stepper
          v-model="delegationProcess"
          vertical
          class="rounded-xl secondary"
      >
        <v-stepper-step
            step="1"
            :complete="delegationProcess > 1"
        >
          Staking amount
          <small>Set the number of CSPR you want to stake</small>
        </v-stepper-step>

        <v-stepper-content
            step="1"
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
              Current Balance : {{ balance }} CSPR <br/>
              Staking : {{ CSPRToStake }} CSPR<br/>
              Delegation fee : {{ delegationFee }} CSPR<br/>
              Total transaction : {{ CSPRToStake + delegationFee }} CSPR<br/>
              Remaining Balance after staking : {{ balance - CSPRToStake - delegationFee }} CSPR<br/>
            </p>
            <p v-if="CSPRToStake<minimumCSPRStake">
              <v-icon color="red">mdi-alert-circle</v-icon>
              <b>You must stake at least {{ minimumCSPRStake }} CSPR.</b><br/>
            </p>
            <p v-if="!signer.connected">
              <v-icon color="red" class="mr-2">mdi-alert-circle</v-icon>
              <b>Unlock and/or connect to Casper Signer first.
                <v-btn rounded class="ml-2" color="primary" @click="connectionRequest">Connect</v-btn>
              </b><br/>
            </p>
            <p v-if="signer.connected && !sufficientsFunds">
              <v-icon color="red">mdi-alert-circle</v-icon>
              <b>You don't have enough funds. Please fund your accound with at least
                {{ minimumCSPRStake + delegationFee }} CSPR.</b><br/>
            </p>
            <p v-if="balance > (minimumCSPRStake + delegationFee) && CSPRToStake>maxStake">
              <v-icon color="red">mdi-alert-circle</v-icon>
              <b>You can stake {{ maxStake }} CSPR maximum.</b><br/>
            </p>
            <p v-if="CSPRToStake>=minimumCSPRStake && CSPRToStake<=maxStake">
              <v-icon color="green">mdi-checkbox-marked-circle</v-icon>
              <b>Everything is good ! You will stake {{ Math.trunc(CSPRToStake) }} CSPR.</b>
            </p>
          </div>
          <v-btn
              rounded
              class=" ml-5"
              color="primary"
              @click="delegationProcess = 2"
              :disabled="correctStake"
          >
            Continue
          </v-btn>
        </v-stepper-content>

        <v-stepper-step
            step="2"
            :complete="delegationProcess > 2"
        >
          Review staking operation
          <small>Review the transaction</small>
        </v-stepper-step>

        <v-stepper-content
            step="2"
        >
          <div class="text-body-1">
            <p>
              You will stake : {{ CSPRToStake }} CSPR<br/>
              Delegation fee : {{ delegationFee }} CSPR<br/>
              Total transaction : {{ CSPRToStake + delegationFee }} CSPR<br/>
              Remaining Balance after staking : {{ balance - CSPRToStake - delegationFee }} CSPR<br/>
            </p>
            <p class="text-h6">
              Confirm the transaction ?
            </p>
            <p v-if="delegationError">
              <v-icon color="red">mdi-alert-circle</v-icon>
              <b>An error as occured ! Check the message error : <br/>
                {{ delegationErrorMessage }}<br/></b>
            </p>
          </div>
          <v-btn
              rounded
              @click="delegationProcess = 1"
          >
            Cancel
          </v-btn>
          <v-btn
              rounded
              class=" ml-5"
              color="primary"
              @click="delegate"
              :disabled="correctStake"
              :loading="loadDelegateButton"
          >
            Sign & Continue
          </v-btn>
        </v-stepper-content>
        <v-stepper-step
            step="3"
            :complete="deployResult!=null && deployResult"
        >
          Staking Result
          <small>See the result of the staking operation</small>
        </v-stepper-step>

        <v-stepper-content
            step="3"
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
            </a><br/>
              <span v-if="deployResult==null">
                  Waiting for the deploy result ...<br/>
                  Re-trying every 30s.<br/>
                  Number of tries : {{ tries }}
                  <v-progress-circular
                      class="ml-3"
                      indeterminate
                      color="blue"
                  ></v-progress-circular>
                </span>
              <span v-if="deployResult!=null">
                  Status of the staking operation :<br/>
                </span>
              <span v-if="deployResult!=null && deployResult">
                  <v-icon color="green">mdi-checkbox-marked-circle</v-icon> Congrats ! You've staked : {{ CSPRToStake }} CSPR with {{
                  deployCost
                }} CSPR transaction fee.
                </span>
              <span v-if="deployResult!=null && !deployResult">
                  <v-icon color="red">mdi-alert-circle</v-icon> Oops... A problem as occured. Check the error message here (or on the cspr.live website) :<br/>
                  {{ deployResultErrorMessage }}.<br/>
                  Transaction fee total cost : {{ deployCost }} CSPR.
                </span>
            </p>
          </div>
          <v-btn
              rounded
              v-if="delegationError"
              color="primary"
              @click="balance = null; delegationProcess = 1"
          >
            Retry
          </v-btn>
          <v-btn
              rounded
              v-if="deployResult != null && !delegationError"
              color="primary"
              @click="stakeMore"
          >
            Stake more
          </v-btn>
        </v-stepper-content>
      </v-stepper>
    </v-card>
  </v-container>
</template>

<script>
import {DeployUtil, Signer} from "casper-js-sdk";
import {mapState} from "vuex";

export default {
  name: "Delegate",
  data() {
    return {
      dialog: false,
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
    await this.getBalance()
  },
  watch: {
    async 'signer.activeKey'() {
      await this.getBalance()
    },
  },
  methods: {
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
        const delegatePrepareData = await (await fetch(this.getApi() + "/delegate/prepare", {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            amount: this.CSPRToStake,
            from: this.signer.activeKey
          })
        })).json()

        let parsedDeploy = DeployUtil.deployToJson(DeployUtil.deployFromJson(delegatePrepareData))

        try {
          const signedDeploy = await Signer.sign(parsedDeploy, this.signer.activeKey, "0106ca7c39cd272dbf21a86eeb3b36b7c26e2e9b94af64292419f7862936bca2ca")

          try {
            const delegateData = await (await fetch(this.getApi() + "/delegate/", {
              method: 'POST',
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                deploy: signedDeploy
              })
            })).json()
            this.delegationProcess = 3
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
        const delegateResultData = await (await fetch(this.getApi() + "/deploy/result/" + this.deployHash)).json()
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
    stakeMore() {
      this.getBalance().then(() => {
        this.deployResult = null;
        this.delegationProcess = 1;
      });
    },
    connectionRequest() {
      Signer.sendConnectionRequest();
    }
  },
  computed: {
    ...mapState([
      "signer",
    ]),
    sufficientsFunds: function () {
      return this.balance != null && this.balance >= this.minimumCSPRNeeded
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
