<template>
  <v-card
    class="align-center rounded-xl secondary mt-5"
    width="100%"
    :loading="deployResult.status === UNKNOWN"
  >
    <template slot="progress">
      <v-progress-linear
        color="white"
        rounded
        buffer-value="0"
        stream
        reverse
      ></v-progress-linear>
    </template>
    <v-card-title>
      Operation result
      <v-btn
        class="ml-auto"
        fab
        small
        @click="removeDeployResult"
      >
        <v-icon>
          mdi-close
        </v-icon>
      </v-btn>
    </v-card-title>
    <v-card-text
      class="text-body-1"
    >
      Here's your deploy hash :
      <a
        :href="deployHashUrl"
        target="_blank"
      >
        {{ deployResult.hash }}
        <v-icon x-small>mdi-open-in-new</v-icon>
      </a>
      <br />
      <span v-if="deployResult.status === UNKNOWN">
        Waiting for the deploy result ...
        <v-progress-circular
          class="ml-3"
          color="white"
          indeterminate
        ></v-progress-circular> <br/>
        This can take a few minutes. <br/>
        You can always verify the status of the operations with the link above.
      </span>
      <span v-if="deployResult.status !== UNKNOWN">
                  Status of the operation :<br />
                </span>
      <span v-if="deployResult.status === OK">
        <v-icon color="green">mdi-checkbox-marked-circle</v-icon>
        Congrats ! The operation succeeded with this amount : {{ deployResult.amount }} CSPR and {{ deployResult.cost }} CSPR operation fee.
      </span>
      <span v-if="deployResult.status === KO">
        <v-icon color="red">mdi-alert-circle</v-icon>
        Oops... A problem as occured. Check the error message here (or on the cspr.live website) :<br />
        {{ deployResult.message }}.<br />
        Operation fee total cost : {{ deployResult.cost }} CSPR.
      </span>
    </v-card-text>
  </v-card>
</template>

<script>
import {mapGetters} from "vuex";
import {STATUS_KO, STATUS_OK, STATUS_UNKNOWN} from "@casperholders/core";
import {DeployWatcher} from "casper-js-sdk";
const deployWatcher = new DeployWatcher(process.env.VUE_APP_RPC+"/events/");
export default {
    name: "OperationResult",
    props: {
        deployHash: {
            required: true,
            type: String,
            default: ""
        }
    },
    data() {
        return {
            deployResult: null,
            deployHashUrl: "",
            UNKNOWN: STATUS_UNKNOWN,
            OK: STATUS_OK,
            KO: STATUS_KO,
        }
    },
    computed: {
        ...mapGetters(['getOperation']),
    },
    created() {
        this.deployResult = Object.assign({}, this.getOperation(this.deployHash))
        this.deployHashUrl = this.$getCsprLiveUrl() + "deploy/" + this.deployResult.hash
        deployWatcher.subscribe([{
            deployHash: this.deployHash,
            eventHandlerFn: async () => await this.getDeployResult()
        }]);
        deployWatcher.start();
        setTimeout(async () => {
            deployWatcher.stop();
            this.deployResult.status = STATUS_KO
            this.deployResult.message = "No deploy result from the network. Please check on cspr.live or reach someone on the discord with the deploy hash."
            await this.$store.dispatch("updateDeployResult", this.deployResult)
        }, 600000);
    },
    destroyed() {
        deployWatcher.stop()
    },
    methods: {
        async getDeployResult() {
            if (this.deployResult.status !== STATUS_UNKNOWN) {
                return
            }

            try {
                const updatedDeployResult = await this.$getDeployManager().getDeployResult(this.deployResult);
                if (updatedDeployResult.status !== STATUS_UNKNOWN) {
                    this.deployResult = updatedDeployResult
                    await this.$store.dispatch("updateDeployResult", updatedDeployResult)
                    await fetch(this.$getApi()+'/deploy/result/'+this.deployResult.hash)
                }
            } catch (e) {
                console.log(e)
            }
        },
        removeDeployResult() {
            this.$store.dispatch("removeDeployResult", this.deployResult);
            deployWatcher.stop();
        }
    }
}
</script>

<style scoped>

</style>