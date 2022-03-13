<template>
  <v-card
    class="align-center rounded-xl secondary"
    width="100%"
  >
    <v-card-title class="align-center">
      <v-avatar
        color="primary"
        size="52"
      >
        <v-icon>mdi-key-chain</v-icon>
      </v-avatar>
      <v-card-title
        class="pl-4"
        style="word-break: break-word"
      >
        Sign a multisig deploy
      </v-card-title>
    </v-card-title>
    <v-card-text>
      test {{ $route.params.deployHash }}
    </v-card-text>
  </v-card>
</template>

<script>

import { API } from '@/helpers/env';

/**
 * Multi-sig View
 */
export default {
  name: 'MultiSig',
  data() {
    return {
      deploy: undefined,
      notFound: false,
    };
  },
  async mounted() {
    await this.getDeployInfo();
  },
  methods: {
    async getDeployInfo() {
      const res = await fetch(`${API}/deploys/${this.$route.params.deployHash}`);
      if (res.ok) {
        this.deploy = await res.json();
      } else {
        this.notFound = true;
      }
    },
  },
};
</script>
