<template>
  <v-alert type="error">
    <div class="d-flex flex-wrap flex-sm-nowrap">
      <span
        data-cy="notConnected"
        class="mr-sm-2"
      >
        Not connected.
      </span>
      <v-btn
        color="secondary"
        class="ml-auto mt-2 mt-sm-0"
        small
        @click="onConnectionRequest"
      >
        <v-icon left>
          {{ mdiAccountCircle }}
        </v-icon>
        {{ signer.lock ? 'Unlock' : 'Connect' }}
      </v-btn>
    </div>
  </v-alert>
</template>

<script>
import { mdiAccountCircle } from '@mdi/js';
import { mapState } from 'vuex';

export default {
  name: 'NotConnectedAlert',
  data: () => ({
    mdiAccountCircle,
  }),
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
