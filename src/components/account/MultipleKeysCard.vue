<template>
  <v-card
    outlined
    elevation="3"
  >
    <v-card-text>
      <div class="text-body-1 text-center mb-4">
        Choose your key
      </div>
      <v-expansion-panels
        v-model="panels"
        :v-show="!initKeys"
        accordion
        flat
        tile
      >
        <v-expansion-panel
          v-model="panels"
          expand
          class="secondary"
        >
          <v-expansion-panel-header>
            <div class="d-flex align-center text-overline">
              <v-icon
                left
              >
                {{ mdiCurrencyUsd }}
              </v-icon>
              Keys with funds ({{ keys.funds.length }})
            </div>
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            <template v-for="(key, index) in keys.funds">
              <v-card
                :key="index"
                outlined
                elevation="3"
                link
                class="mb-4"
                @click="setKey(key)"
              >
                <v-card-text
                  class="d-flex align-start"
                >
                  <div>
                    <span class="text-body-1">
                      <v-icon>
                        {{ mdiAccount }}
                      </v-icon>
                      {{ truncateText(key.key) }}
                    </span>
                    <div class="text-left">
                      <v-icon>
                        {{ mdiCurrencyUsd }}
                      </v-icon>
                      {{ key.balance }} CSPR
                    </div>
                  </div>
                  <v-icon class="ml-auto">
                    {{ mdiChevronRight }}
                  </v-icon>
                </v-card-text>
              </v-card>
            </template>
          </v-expansion-panel-content>
        </v-expansion-panel>
        <v-expansion-panel
          v-model="panels"
          expand
          class="secondary"
        >
          <v-expansion-panel-header>
            <div class="d-flex align-center text-overline">
              <v-icon
                left
              >
                {{ mdiCurrencyUsdOff }}
              </v-icon>
              Keys without funds ({{ keys.noFunds.length }})
            </div>
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            <template v-for="(key, index) in keys.noFunds">
              <v-card
                :key="index"
                outlined
                elevation="3"
                link
                class="mb-4"
                @click="setKey(key)"
              >
                <v-card-text
                  id="connectCasperSigner"
                  class="d-flex align-start"
                >
                  <div>
                    <span class="text-body-1">
                      <v-icon>
                        {{ mdiAccount }}
                      </v-icon>
                      {{ truncateText(key.key) }}
                    </span>
                    <div class="text-left">
                      <v-icon>
                        {{ mdiCurrencyUsd }}
                      </v-icon>
                      {{ key.balance }} CSPR
                    </div>
                  </div>
                  <v-icon class="ml-auto">
                    {{ mdiChevronRight }}
                  </v-icon>
                </v-card-text>
              </v-card>
            </template>
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-expansion-panels>
      <v-btn
        color="primary"
        rounded
        :loading="loadingKeys"
        @click="loadMoreKeys"
      >
        Load more keys
      </v-btn>
    </v-card-text>
  </v-card>
</template>

<script>
import truncate from '@/helpers/strings/truncate';
import { mdiAccount, mdiChevronRight, mdiCurrencyUsd, mdiCurrencyUsdOff } from '@mdi/js';

export default {
  name: 'MultipleKeysCard',
  props: {
    initKeys: {
      required: true,
      default: true,
      type: Boolean,
    },
    loadingKeys: {
      required: true,
      default: false,
      type: Boolean,
    },
    loadMoreKeys: {
      required: true,
      type: Function,
    },
    keys: {
      required: true,
      default: () => ({
        funds: [],
        noFunds: [],
      }),
      type: Object,
    },
    setKey: {
      required: true,
      type: Function,
    },
  },
  data: () => ({
    mdiCurrencyUsdOff,
    mdiAccount,
    mdiCurrencyUsd,
    mdiChevronRight,
    panels: undefined,
  }),
  mounted() {
    if (this.keys.funds.length > 0) {
      this.panels = 0;
    } else {
      this.panels = 1;
    }
  },
  methods: {
    truncateText(str) {
      return truncate(str, { size: 23 });
    },
  },
};
</script>

<style scoped>

</style>
