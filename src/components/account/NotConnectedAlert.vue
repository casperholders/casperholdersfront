<template>
  <v-alert type="error">
    <div class="d-flex flex-wrap flex-sm-nowrap">
      <span class="mr-sm-2">
        Not connected.
      </span>
      <v-btn
        color="secondary"
        class="ml-auto mt-2 mt-sm-0"
        small
        @click="onConnectionRequest"
      >
        <v-icon left>
          mdi-account-circle
        </v-icon>
        {{ signer.lock ? 'Unlock' : 'Connect' }}
      </v-btn>
    </div>
  </v-alert>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'NotConnectedAlert',
  computed: {
    ...mapState(['signer']),
  },
  methods: {
    async onConnectionRequest() {
      await this.$store.dispatch('openConnectDialog');
    },
  },
};
</script>
