<template>
  <v-card
    outlined
    elevation="3"
    class="mb-4"
  >
    <v-card-text
      :id="walletId"
      :data-cy="walletId"
      style="cursor: pointer"
      class="d-flex align-center"
      @click="!disabled() && $emit('connect')"
    >
      <img
        :src="icon"
        width="32"
        :alt="`${title} Logo`"
        class="mr-3"
      >
      <div>
        <span class="text-body-1">
          {{ title }}
        </span>
        <div>{{ description }}</div>
      </div>
      <v-icon
        v-if="!disabled()"
        class="ml-auto"
      >
        {{ mdiChevronRight }}
      </v-icon>
    </v-card-text>
    <div
      v-if="disabled()"
      class="pb-3 px-3 d-flex align-center text-small"
    >
      <v-icon
        left
        color="red"
      >
        {{ mdiAlertCircle }}
      </v-icon>
      {{ title }} isn't installed.
      <v-spacer />
      <a
        :href="download"
        target="_blank"
        rel="noopener"
      >
        Download {{ title }}
      </a>
    </div>
    <div
      v-if="info"
      class="pb-3 px-3 d-flex align-center"
    >
      <v-icon left>
        {{ mdiInformation }}
      </v-icon>
      {{ info }}
      <v-spacer />
      <a
        v-if="infoLink"
        :href="infoLink"
        target="_blank"
        rel="noopener"
      >
        Learn more
      </a>
    </div>
  </v-card>
</template>
<script>

import { mdiAlertCircle, mdiChevronRight, mdiInformation } from '@mdi/js';

export default {
  name: 'WalletCard',
  props: {
    walletId: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      required: true,
    },
    info: {
      type: String,
      required: false,
      default: '',
    },
    infoLink: {
      type: String,
      required: false,
      default: '',
    },
    disabled: {
      type: Function,
      required: false,
      default: () => false,
    },
    download: {
      type: String,
      required: false,
      default: '',
    },
  },
  data: () => ({
    mdiInformation,
    mdiChevronRight,
    mdiAlertCircle,
  }),
};
</script>
