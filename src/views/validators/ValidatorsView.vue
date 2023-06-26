<template>
  <v-card>
    <v-card-title>
      <v-avatar
        class="mr-4"
        color="primary"
        size="52"
      >
        <v-icon size="24">
          {{ mdiGavel }}
        </v-icon>
      </v-avatar>
      Validator Operations
    </v-card-title>
    <v-tabs
      v-model="tab"
      grow
      background-color="transparent"
      color="white"
    >
      <v-tab data-cy="manageAddBid">
        <v-icon left>
          {{ mdiGavel }}
        </v-icon>
        Add bid
      </v-tab>
      <v-tab data-cy="manageWithdrawBid">
        <v-icon left>
          {{ mdiConnection }}
        </v-icon>
        Withdraw Bid
      </v-tab>
    </v-tabs>

    <v-tabs-items v-model="tab">
      <v-tab-item>
        <AddBidView />
      </v-tab-item>
      <v-tab-item>
        <WithdrawBidView />
      </v-tab-item>
    </v-tabs-items>
  </v-card>
</template>
<script>
import AddBidView from '@/views/validators/AddBidView.vue';
import WithdrawBidView from '@/views/validators/WithdrawBidView.vue';
import { mdiConnection, mdiGavel } from '@mdi/js';

/**
 * Delegate view
 * Contains one fields
 * - Amount to delegate to the node set in the .env file
 */
export default {
  name: 'ValidatorsView',
  components: { WithdrawBidView, AddBidView },
  data() {
    return {
      mdiGavel,
      mdiConnection,
      tab: 0,
    };
  },
  computed: {},
  watch: {
    '$route.path': 'changeTabBasedOnRoute',
  },
  mounted() {
    this.changeTabBasedOnRoute();
  },
  methods: {
    changeTabBasedOnRoute() {
      if (this.$route.path.includes('withdrawbid')) {
        this.tab = 1;
      } else {
        this.tab = 0;
      }
    },
  },
};
</script>
