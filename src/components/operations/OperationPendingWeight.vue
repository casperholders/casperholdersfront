<template>
  <div>
    <v-card
      v-for="(weightedDeploy,i) in weightedDeploys"
      :id="`pendingWeightedDeploy-${i}`"
      :key="i"
      data-cy="operationPendingWeight"
      class="align-center rounded-xl secondary mt-5"
      width="100%"
    >
      <v-card-title>
        {{ weightedDeploy.deployResult.name }} - Deploy missing weight
      </v-card-title>
      <v-card-subtitle>
        {{ weightedDeploy.deployResult.hash }}
      </v-card-subtitle>
      <v-card-text
        class="text-body-1"
      >
        <p>
          The deploy needs to be signed by others parties.
        </p>
        <v-row>
          <v-col
            cols="12"
            md="4"
            class="py-0"
          >
            <v-btn
              :id="`copyLinkWeightedDeploy-${i}`"
              class="rounded-xl mt-3 mr-3"
              style="width: 100%"
              color="primary"
              @click="copyLink(i)"
            >
              <v-icon
                color="white"
                left
              >
                {{ mdiLink }}
              </v-icon>
              Copy link
            </v-btn>
          </v-col>
          <v-col
            cols="12"
            md="4"
            class="py-0"
          >
            <v-btn
              class="rounded-xl mt-3 mr-3"
              style="width: 100%"
              color="primary"
              @click="copyDeploy(i)"
            >
              <v-icon
                color="white"
                left
              >
                {{ mdiContentCopy }}
              </v-icon>
              Copy JSON Deploy
            </v-btn>
          </v-col>
          <v-col
            cols="12"
            md="4"
            class="pt-0"
          >
            <v-btn
              class="rounded-xl mt-3"
              style="width: 100%"
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
          </v-col>
        </v-row>
        <v-expansion-panels accordion>
          <v-expansion-panel>
            <v-expansion-panel-header>
              Details
            </v-expansion-panel-header>
            <v-expansion-panel-content>
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
  </div>
</template>

<script>
import { API } from '@/helpers/env';
import truncate from '@/helpers/strings/truncate';
import { mdiCancel, mdiContentCopy, mdiLink } from '@mdi/js';
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
      mdiLink,
      mdiCancel,
      mdiContentCopy,
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
      return truncate(fullStr, { size: 15 });
    },
    async copyDeploy(index) {
      await navigator.clipboard.writeText(
        JSON.stringify(this.deployJson(this.weightedDeploys[index].deploy)),
      );
    },
    async copyLink(index) {
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
          this.$set(this.urls, this.deployJson(this.weightedDeploys[index].deploy).deploy.hash, `/multisig/${this.deployJson(this.weightedDeploys[index].deploy).deploy.hash}`);
          await navigator.clipboard.writeText(
            `${window.location.origin}/multisig/${this.deployJson(this.weightedDeploys[index].deploy).deploy.hash}`,
          );
          return;
        }
        this.$set(this.urls, this.deployJson(this.weightedDeploys[index].deploy).deploy.hash, 'Unknown error');
        return;
      }
      this.$set(this.urls, this.deployJson(this.weightedDeploys[index].deploy).deploy.hash, `/multisig/${this.deployJson(this.weightedDeploys[index].deploy).deploy.hash}`);
      await navigator.clipboard.writeText(
        `${window.location.origin}/multisig/${this.deployJson(this.weightedDeploys[index].deploy).deploy.hash}`,
      );
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
