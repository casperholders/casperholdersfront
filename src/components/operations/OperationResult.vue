<template>
  <v-card
      class="align-center rounded-xl secondary mt-5"
      width="100%"
  >
    <v-card-title>
      Operation result
    </v-card-title>
    <v-card-text
        class="text-body-1"
    >
      Here's your deploy hash : <a :href="deployHashUrl" target="_blank">{{ deployHash }}
      <v-icon x-small>mdi-open-in-new</v-icon>
    </a><br/>
      <span v-if="deployResult==null">
                  Waiting for the deploy result ...<br/>
                  Re-trying every 30s.<br/>
                  Number of tries : {{ tries }}
                  <v-progress-circular
                      indeterminate
                      color="white"
                      class="ml-3"
                  ></v-progress-circular>
                </span>
      <span v-if="deployResult!==null">
                  Status of the operation :<br/>
                </span>
      <span v-if="deployResult!==null && deployResult">
                  <v-icon color="green">mdi-checkbox-marked-circle</v-icon> Congrats ! The operation succeeded with this amount : {{ amount }} CSPR and {{
          deployCost
        }} CSPR operation fee.
                </span>
      <span v-if="deployResult!==null && !deployResult">
                  <v-icon color="red">mdi-alert-circle</v-icon> Oops... A problem as occured. Check the error message here (or on the cspr.live website) :<br/>
                  {{ deployResultErrorMessage }}.<br/>
                  Operation fee total cost : {{ deployCost }} CSPR.
                </span>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  name: "OperationResult",
  props: {
      deployHash: {
          required: true,
          type: String,
          default: ""
      },
      amount: {
          required: true,
          type: Number,
          default: 0
      }
  },
  data() {
    return {
      deployResult: null,
      tries: 0,
      deployResultErrorMessage: "",
      deployCost: "",
    }
  },
  computed: {
    deployHashUrl() {
      if (this.deployHash !== "") {
        return this.getCsprLiveUrl() + "deploy/" + this.deployHash
      }
      return ""
    },
  },
  async mounted() {
    this.deployResult = null;
    this.tries = 0;
    this.deployResultErrorMessage = "";
    this.deployCost = "";
    await this.getDeployResult()
  },
  methods: {
    async getDeployResult() {
      try {
        let resultData = await (await fetch(this.getApi() + "/deploy/result/" + this.deployHash)).json();
        if (resultData.status !== "Unknown") {
          this.deployCost = resultData.cost / 1000000000
          this.deployResultErrorMessage = resultData.message
          this.deployResult = resultData.status
          this.$emit('finishedOperation');
        }
      } catch (e) {
        console.log(e)
      }

      if (this.deployResult == null && this.tries < 30) {
        this.tries = this.tries + 1
        setTimeout(() => {
          this.getDeployResult();
        }, 30000);
      }
      if (this.tries >= 30) {
        this.$emit('finishedOperation');
        this.deployResultErrorMessage = "No deploy result from the network. Please check on cspr.live or reach someone on the discord with the deploy hash."
      }
    },
  }
}
</script>

<style scoped>

</style>