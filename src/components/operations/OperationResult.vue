<template>
  <v-card
    class="align-center rounded-xl secondary mt-5 operationResult"
    width="100%"
  >
    <v-card-title>
      Operation result
      <v-btn
        id="removeDeployResult"
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
      <v-stepper
        v-model="step"
        class="transparent"
        flat
      >
        <v-stepper-header class="elevation-0">
          <v-stepper-step
            step="1"
            :complete="step > 1"
          >
            Sending the deploy
          </v-stepper-step>

          <v-divider />

          <v-stepper-step
            step="2"
            :complete="step > 2"
          >
            Executing the deploy
          </v-stepper-step>

          <v-divider />

          <v-stepper-step
            step="3"
            :complete="step > 3"
          >
            Result
          </v-stepper-step>
        </v-stepper-header>
        <v-stepper-items>
          <v-stepper-content
            color="primary"
            step="1"
            class="text-center"
          >
            <v-card
              outlined
              elevation="3"
            >
              <v-card-text class="step1">
                <div class="text-body-1 text-center">
                  Connecting to the Casper Network...
                </div>
                <v-progress-circular
                  class="mx-auto mt-3"
                  indeterminate
                  color="white"
                />
              </v-card-text>
            </v-card>
          </v-stepper-content>
          <v-stepper-content
            step="2"
            class="text-center"
          >
            <v-card
              outlined
              elevation="3"
            >
              <v-card-text class="step2">
                <div class="text-body-1 text-center">
                  Creation of a new block...
                </div>
                <v-progress-circular
                  class="mx-auto mt-3"
                  indeterminate
                  color="white"
                />
              </v-card-text>
            </v-card>
          </v-stepper-content>
          <v-stepper-content
            step="3"
            class="text-center"
          >
            <v-card
              outlined
              elevation="3"
            >
              <v-card-text class="step3">
                <div class="text-body-1 text-center">
                  Fetching the result...
                </div>
                <v-progress-circular
                  class="mx-auto mt-3"
                  indeterminate
                  color="white"
                />
              </v-card-text>
            </v-card>
          </v-stepper-content>
          <v-stepper-content
            step="4"
            class="text-center"
          >
            <v-card
              outlined
              elevation="3"
            >
              <v-card-text>
                <div
                  v-if="deployResult.status === OK"
                  class="mx-n1"
                >
                  <div class="text-body-1 text-center mb-3">
                    Congrats, the operation succeeded ! Here's the deploy hash :<br>
                    <a
                      :href="deployHashUrl"
                      target="_blank"
                      rel="noopener"
                    >
                      {{ deployResult.hash }}
                      <v-icon x-small>mdi-open-in-new</v-icon>
                    </a>
                  </div>
                  <v-row
                    class="white-bottom-border"
                  >
                    <v-col class="text-left">
                      Status
                    </v-col>
                    <v-col class="text-right">
                      Success
                      <v-icon
                        color="green"
                        right
                      >
                        mdi-checkbox-marked-circle
                      </v-icon>
                    </v-col>
                  </v-row>
                  <v-row
                    class="white-bottom-border"
                  >
                    <v-col class="text-left">
                      Amount
                    </v-col>
                    <v-col class="text-right cspr">
                      {{ deployResult.amount }} CSPR
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col class="text-left">
                      Cost
                    </v-col>
                    <v-col class="text-right cspr">
                      {{ deployResult.cost }} CSPR
                    </v-col>
                  </v-row>
                </div>
                <div
                  v-if="deployResult.status === KO"
                  class="mx-n1"
                >
                  <div class="text-body-1 text-center mb-6">
                    Oops... A problem as occurred. <br>
                    Check the error message here (or on the cspr.live website) :
                    <strong> {{ deployResult.message }} </strong> <br><br>
                    Deploy hash : <br>
                    <a
                      :href="deployHashUrl"
                      target="_blank"
                      rel="noopener"
                    >
                      {{ deployResult.hash }}
                      <v-icon x-small>mdi-open-in-new</v-icon>
                    </a>
                  </div>
                  <v-row
                    class="white-bottom-border"
                  >
                    <v-col class="text-left">
                      Status
                    </v-col>
                    <v-col class="text-right">
                      Failure
                      <v-icon
                        color="red"
                        right
                      >
                        mdi-alert-circle
                      </v-icon>
                    </v-col>
                  </v-row>
                  <v-row
                    class="white-top-border"
                  >
                    <v-col class="text-left">
                      Cost
                    </v-col>
                    <v-col class="text-right cspr">
                      {{ deployResult.cost }} CSPR
                    </v-col>
                  </v-row>
                </div>
              </v-card-text>
            </v-card>
          </v-stepper-content>
        </v-stepper-items>
      </v-stepper>
    </v-card-text>
  </v-card>
</template>

<script>
import deployManager from '@/helpers/deployManager';
import { CSPR_LIVE_URL } from '@/helpers/env';
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
      step: 1,
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
    this.deployHashUrl = `${CSPR_LIVE_URL}deploy/${this.deployResult.hash}`;
    if (this.deployResult.status === STATUS_UNKNOWN) {
      this.eventWatcher.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if ('DeployProcessed' in data && data.DeployProcessed.deploy_hash.toLowerCase() === this.deployHash.toLowerCase()) {
          this.getDeployResult().then(() => this.eventWatcher.close());
        }
      };
      setTimeout(() => {
        if (this.step < 2) {
          this.step = 2;
        }
      }, 10000);
      setTimeout(() => {
        if (this.step < 3) {
          this.step = 3;
        }
      }, 20000);
      setTimeout(async () => {
        this.eventWatcher.close();
        await this.getDeployResult();
        if (this.deployResult.status === STATUS_UNKNOWN) {
          this.deployResult.status = STATUS_KO;
          this.deployResult.message = 'No deploy result from the network. Please check on cspr.live or reach someone on the discord with the deploy hash.';
          await this.$store.dispatch('updateDeployResult', this.deployResult);
        }
        this.step = 4;
      }, 180000);
    } else {
      this.step = 4;
    }
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
        const updatedDeployResult = await deployManager
          .getDeployResult(this.deployResult);
        if (updatedDeployResult.status !== STATUS_UNKNOWN) {
          this.deployResult = updatedDeployResult;
          await this.$store.dispatch('updateDeployResult', updatedDeployResult);
          this.step = 4;
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
