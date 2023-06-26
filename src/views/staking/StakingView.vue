<template>
  <v-card>
    <v-card-title>
      <v-avatar
        class="mr-4"
        color="primary"
        size="52"
      >
        <v-icon size="24">
          {{ mdiSafe }}
        </v-icon>
      </v-avatar>
      Staking Operations
    </v-card-title>
    <v-tabs
      v-model="tab"
      grow
      background-color="transparent"
      color="white"
    >
      <v-tab data-cy="manageStake">
        <v-icon left>
          {{ mdiSafe }}
        </v-icon>
        Stake
      </v-tab>
      <v-tab data-cy="manageUnstake">
        <v-icon left>
          {{ mdiLockOpen }}
        </v-icon>
        Unstake
      </v-tab>
    </v-tabs>

    <v-tabs-items v-model="tab">
      <v-tab-item>
        <DelegateView />
      </v-tab-item>
      <v-tab-item>
        <UndelegateView />
      </v-tab-item>
    </v-tabs-items>
  </v-card>
</template>
<script>
import DelegateView from '@/views/staking/DelegateView.vue';
import UndelegateView from '@/views/staking/UndelegateView.vue';
import { mdiLockOpen, mdiSafe } from '@mdi/js';

/**
 * Delegate view
 * Contains one fields
 * - Amount to delegate to the node set in the .env file
 */
export default {
  name: 'StakingView',
  components: { UndelegateView, DelegateView },
  data() {
    return {
      mdiSafe,
      mdiLockOpen,
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
      if (this.$route.path.includes('unstake')) {
        this.tab = 1;
      } else {
        this.tab = 0;
      }
    },
  },
};
</script>
