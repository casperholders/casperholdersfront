<template>
  <v-card
    class="align-center rounded-xl secondary mt-5 operationResult"
    width="100%"
  >
    <v-card-title>
      Deploys missing weight
    </v-card-title>
    <v-card-subtitle>
      Some deploys needs more weight before being sent.
    </v-card-subtitle>
    <v-card-text
      class="text-body-1"
    >
      <v-expansion-panels accordion>
        <v-expansion-panel
          v-for="(weightedDeploy,i) in weightedDeploys"
          :key="i"
        >
          <v-expansion-panel-header v-if="!weightedDeploy.error">
            {{ weightedDeploy.deployResult.name }} - {{
              truncate(weightedDeploy.deployResult.hash)
            }}
          </v-expansion-panel-header>
          <v-expansion-panel-header
            v-if="weightedDeploy.error"
            disable-icon-rotate
          >
            {{ weightedDeploy.deployResult.name }} - {{
              truncate(weightedDeploy.deployResult.hash)
            }}
            <template #actions>
              <v-icon color="error">
                mdi-alert-circle
              </v-icon>
            </template>
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            <div class="mx-n1 text-body-1 text-center mb-6">
              <p v-if="weightedDeploy.error">
                <v-icon
                  color="red"
                  left
                >
                  mdi-alert-circle
                </v-icon>
                Oops... A problem as occurred. <br>
                Check the error message here (or on the cspr.live website) : <br>
                <strong> {{ weightedDeploy.error.toString() }} </strong> <br>
              </p>
              <v-btn
                class="rounded-xl mt-3 mr-3"
                color="primary"
                @click="createLink(i)"
              >
                <v-icon
                  color="white"
                  left
                >
                  mdi-content-copy
                </v-icon>
                Create sharable link
              </v-btn>
              <v-btn
                class="rounded-xl mt-3 mr-3"
                color="primary"
                @click="copyDeploy(i)"
              >
                <v-icon
                  color="white"
                  left
                >
                  mdi-content-copy
                </v-icon>
                Copy JSON Deploy
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
                  mdi-cancel
                </v-icon>
                Cancel
              </v-btn>
            </div>
            <div
              v-if="urls[weightedDeploy.deployResult.hash]"
              class="mx-n1 text-body-1 text-center mb-6"
            >
              Url : <a :href="urls[weightedDeploy.deployResult.hash]">link</a>
            </div>
            Details :
            <vue-json-pretty
              class="overflow-auto"
              style="height: 500px; background-color: black;"
              :data="deployJson(weightedDeploy.deploy)"
              :show-line="true"
            />
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-card-text>
  </v-card>
</template>

<script>
import { API } from '@/helpers/env';
import { DeployUtil } from 'casper-js-sdk';
import VueJsonPretty from 'vue-json-pretty';
import 'vue-json-pretty/lib/styles.css';
import { mapState } from 'vuex';

/**
 * Generic component to display the result of a weighted deployment
 */
export default {
  name: 'OperationPendingWeight',
  components: {
    VueJsonPretty,
  },
  data() {
    return {
      urls: {},
    };
  },
  computed: {
    ...mapState([
      'weightedDeploys',
      'internet',
    ]),
  },
  methods: {
    deployJson(deploy) {
      return DeployUtil.deployToJson(deploy);
    },
    truncate(fullStr) {
      const strLen = 15;
      const separator = '...';

      if (fullStr.length <= strLen) return fullStr;

      const sepLen = separator.length;
      const charsToShow = strLen - sepLen;
      const frontChars = Math.ceil(charsToShow / 2);
      const backChars = Math.floor(charsToShow / 2);

      return fullStr.substr(0, frontChars) + separator + fullStr.substr(fullStr.length - backChars);
    },
    async copyDeploy(index) {
      await navigator.clipboard.writeText(
        JSON.stringify(this.deployJson(this.weightedDeploys[index].deploy)),
      );
    },
    async createLink(index) {
      const res = await fetch(`${API}/deploys/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...this.deployJson(this.weightedDeploys[index].deploy),
          deployResult: this.weightedDeploys[index].deployResult,
        }),
      });
      if (!res.ok) {
        const text = await res.text();
        if (text.includes('Deploy already exist')) {
          this.$set(this.urls, this.deployJson(this.weightedDeploys[index].deploy).deploy.hash, `${API}/deploys/${this.deployJson(this.weightedDeploys[index].deploy).deploy.hash}`);
        }
        this.$set(this.urls, this.deployJson(this.weightedDeploys[index].deploy).deploy.hash, 'Unknown error');
      }
      this.$set(this.urls, this.deployJson(this.weightedDeploys[index].deploy).deploy.hash, `${API}/deploys/${this.deployJson(this.weightedDeploys[index].deploy).deploy.hash}`);
    },
    cancelSendingDeploy(index) {
      this.$store.dispatch('removeWeightDeploy', index);
    },
  },
};
</script>

<style>
    .vjs-tree__node.is-highlight, .vjs-tree__node:hover {
        background-color: #575757;
    }
</style>
