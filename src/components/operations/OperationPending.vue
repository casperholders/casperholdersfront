<template>
  <v-card
    data-cy="operationPending"
    class="align-center rounded-xl secondary mt-5"
    width="100%"
  >
    <v-card-title>
      Pending operations
    </v-card-title>
    <v-card-subtitle>
      <template v-if="internet">
        Waiting to send pending deploys...
      </template>
      <template v-else>
        Waiting for internet connection...
      </template>
    </v-card-subtitle>
    <v-card-text
      class="text-body-1"
    >
      <v-expansion-panels accordion>
        <v-expansion-panel
          v-for="(pendingDeploy,i) in offlineDeploys"
          :key="i"
        >
          <v-expansion-panel-header v-if="!pendingDeploy.error">
            {{ pendingDeploy.deployResult.name }} - {{ truncate(pendingDeploy.deployResult.hash) }}
          </v-expansion-panel-header>
          <v-expansion-panel-header
            v-if="pendingDeploy.error"
            disable-icon-rotate
          >
            {{ pendingDeploy.deployResult.name }} - {{ truncate(pendingDeploy.deployResult.hash) }}
            <template #actions>
              <v-icon color="error">
                {{ mdiAlertCircle }}
              </v-icon>
            </template>
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            <div class="mx-n1 text-body-1 text-center mb-6">
              <p v-if="pendingDeploy.error">
                <v-icon
                  color="red"
                  left
                >
                  {{ mdiAlertCircle }}
                </v-icon>
                Oops... A problem as occurred. <br>
                Check the error message here (or on the cspr.live website) : <br>
                <strong> {{ pendingDeploy.error.toString() }} </strong> <br>
              </p>
              <v-btn
                v-if="pendingDeploy.error"
                :disabled="!internet || retryDeploy"
                :loading="retryDeploy"
                class="rounded-xl mt-3 mr-3"
                color="primary"
                @click="retrySendingDeploy(i)"
              >
                <v-icon
                  color="white"
                  left
                >
                  {{ mdiReload }}
                </v-icon>
                Retry
              </v-btn>
              <v-btn
                v-if="internet && !pendingDeploy.error"
                :disabled="retryDeploy"
                :loading="retryDeploy"
                class="rounded-xl mt-3 mr-3"
                color="primary"
                @click="retrySendingDeploy(i)"
              >
                <v-icon
                  color="white"
                  left
                >
                  {{ mdiSend }}
                </v-icon>
                Force send
              </v-btn>
              <v-btn
                class="rounded-xl mt-3"
                color="red"
                @click="cancelSendingDeploy(i)"
              >
                <v-icon
                  color="white"
                  left
                >
                  {{ mdiCancel }}
                </v-icon>
                Cancel
              </v-btn>
            </div>
            Details :
            <vue-json-pretty
              class="overflow-auto"
              style="height: 500px; background-color: black;"
              :data="deployJson(pendingDeploy.deploy)"
              :show-line="true"
            />
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-card-text>
  </v-card>
</template>

<script>
import truncate from '@/helpers/strings/truncate';
import { mdiAlertCircle, mdiCancel, mdiReload, mdiSend } from '@mdi/js';
import { DeployUtil } from 'casper-js-sdk';
import VueJsonPretty from 'vue-json-pretty';
import 'vue-json-pretty/lib/styles.css';
import { mapState } from 'vuex';

/**
 * Generic component to display the result of a deploy
 */
export default {
  name: 'OperationPending',
  components: {
    VueJsonPretty,
  },
  data() {
    return {
      mdiAlertCircle,
      mdiSend,
      mdiCancel,
      mdiReload,
      retryDeploy: false,
    };
  },
  computed: {
    ...mapState([
      'offlineDeploys',
      'internet',
    ]),
  },
  methods: {
    deployJson(deploy) {
      return DeployUtil.deployToJson(deploy);
    },
    truncate(fullStr) {
      return truncate(fullStr, { size: 15 });
    },
    async retrySendingDeploy(index) {
      this.retryDeploy = true;
      await new Promise((resolve) => {
        setTimeout(resolve, 2000);
      });
      await this.$store.dispatch('retrySendingDeploy', index);
      this.retryDeploy = false;
    },
    cancelSendingDeploy(index) {
      this.$store.dispatch('removeOfflineDeploy', index);
    },
  },
};
</script>

<style>
    .vjs-tree__node.is-highlight, .vjs-tree__node:hover {
        background-color: #575757;
    }
</style>
