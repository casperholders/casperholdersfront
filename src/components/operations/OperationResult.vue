<template>
  <v-card
    class="align-center rounded-xl secondary mt-5 operationResult"
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
      />
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
      <br>
      <span v-if="deployResult.status === UNKNOWN">
        Waiting for the deploy result ...
        <v-progress-circular
          class="ml-3"
          color="white"
          indeterminate
        />
        <br>
        This can take a few minutes. <br>
        You can always verify the status of the operations with the link above.
      </span>
      <span v-if="deployResult.status !== UNKNOWN">
        Status of the operation :<br>
      </span>
      <span v-if="deployResult.status === OK">
        <v-icon color="green">mdi-checkbox-marked-circle</v-icon>
        Congrats ! The operation succeeded with this amount :
        {{ deployResult.amount }} CSPR and {{ deployResult.cost }} CSPR operation fee.
      </span>
      <span v-if="deployResult.status === KO">
        <v-icon color="red">mdi-alert-circle</v-icon>
        Oops... A problem as occurred.
        Check the error message here (or on the cspr.live website) :<br>
        {{ deployResult.message }}.<br>
        Operation fee total cost : {{ deployResult.cost }} CSPR.
      </span>
    </v-card-text>
  </v-card>
</template>

<script>
import {
  STATUS_KO,
  STATUS_OK,
  STATUS_UNKNOWN,
} from '@casperholders/core/dist/services/results/deployResult';
import { mapGetters } from 'vuex';

/**
 * Generic component to display the result of a deploy
 */
export default {
  name: 'OperationResult',
  props: {
    /**
     * DeployHash of a deployment
     */
    deployHash: {
      required: true,
      type: String,
      default: '',
    },
  },
  data() {
    return {
      deployResult: null,
      deployHashUrl: '',
      UNKNOWN: STATUS_UNKNOWN,
      OK: STATUS_OK,
      KO: STATUS_KO,
      eventWatcher: new EventSource(`${process.env.VUE_APP_RPC}/events/?start_from=0`),
    };
  },
  computed: {
    ...mapGetters(['getOperation']),
  },
  /**
   * When the component is created we retrieve the corresponding DeployResult
   * object in the VueX Store
   * Then we set the cspr.live url
   * If the deployResult has an unknown status we start an eventWatcher
   * to read incoming Deploy from the blockchain
   * If the eventWatcher find the corresponding deploy_hash in the event list
   * we fetch the Deploy result from the blockchain and we close the eventStream
   * If the eventStream doesn't receive the deploy hash in 10 min we close
   * the eventStream and tell the user to check on cspr.live directly
   */
  created() {
    this.deployResult = { ...this.getOperation(this.deployHash) };
    this.deployHashUrl = `${this.$getCsprLiveUrl()}deploy/${this.deployResult.hash}`;
    if (this.deployResult.status === STATUS_UNKNOWN) {
      this.eventWatcher.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if ('DeployProcessed' in data && data.DeployProcessed.deploy_hash === this.deployHash) {
          this.getDeployResult().then(() => this.eventWatcher.close());
        }
      };
    }
    setTimeout(async () => {
      this.eventWatcher.close();
      await this.getDeployResult();
      if (this.deployResult.status === STATUS_UNKNOWN) {
        this.deployResult.status = STATUS_KO;
        this.deployResult.message = 'No deploy result from the network. Please check on cspr.live or reach someone on the discord with the deploy hash.';
        await this.$store.dispatch('updateDeployResult', this.deployResult);
      }
    }, 600000);
  },
  methods: {
    /**
     * Get deploy result from the blockchain with the DeployManager from the core library
     * If the returned deployResult object doesn't have an Unknown status
     * we update the VueX store to update the Notification tray
     * and we send a get request to the api to register the deploy in the metrics
     */
    async getDeployResult() {
      if (this.deployResult.status !== STATUS_UNKNOWN) {
        return;
      }

      try {
        const updatedDeployResult = await this.$getDeployManager()
          .getDeployResult(this.deployResult);
        if (updatedDeployResult.status !== STATUS_UNKNOWN) {
          this.deployResult = updatedDeployResult;
          await this.$store.dispatch('updateDeployResult', updatedDeployResult);
          await fetch(`${this.$getApi()}/deploy/result/${this.deployResult.hash}`);
        }
      } catch (e) {
        console.log(e);
      }
    },
    /**
     * Used when the user click on the cross on the component to remove
     * the deployResult from the store and close the eventStream
     */
    removeDeployResult() {
      this.$store.dispatch('removeDeployResult', this.deployResult);
      this.eventWatcher.close();
    },
  },
};
</script>

<style scoped>

</style>
