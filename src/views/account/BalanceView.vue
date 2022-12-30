<template>
  <div>
    <v-card
      class="align-center rounded-xl secondary"
      width="100%"
    >
      <v-card-title class="align-center">
        <v-avatar
          class="mr-4"
          color="primary"
          size="52"
        >
          <v-icon>mdi-wallet</v-icon>
        </v-avatar>
        Balance
      </v-card-title>
      <v-divider />
      <card-section-title
        icon="mdi-chart-arc"
        title="Balance"
      />
      <v-card-text v-if="errored">
        <not-connected-alert id="balance-not-connected" />
      </v-card-text>
      <template v-else>
        <div class="d-flex px-4 pb-2 flex-wrap">
          <balance-amount-card
            id="balance-total-staked"
            class="flex-grow-1 balance-cards mx-2 mb-2"
            style="flex-basis: 0;"
            :loading="totalStakedLoading"
            :amount="totalStaked"
            :logo="casperLogo"
            title="Total staked"
          />
          <balance-amount-card
            id="balance-total-available"
            class="flex-grow-1 balance-cards mx-2 mb-2"
            style="flex-basis: 0;"
            :loading="loading"
            :amount="totalAvailable"
            :logo="casperLogo"
            title="Total available"
          />
          <balance-amount-card
            id="balance-total"
            class="flex-grow-1 balance-cards mx-2 mb-2"
            style="flex-basis: 0;"
            :loading="loading || totalStakedLoading"
            :amount="total"
            :logo="casperLogo"
            title="Total"
          />
        </div>
        <v-divider />
        <validators-balance @total-state-change="onTotalStackedStateChange" />
        <v-divider />
        <erc20-tokens-balance :balance="totalAvailable" />
      </template>
      <v-divider />
      <card-section-title
        icon="mdi-swap-horizontal"
        title="Operations"
      />
      <operations-table />
      <v-divider />
      <v-card-actions class="pa-5">
        <v-row>
          <v-col
            cols="12"
            md="4"
          >
            <card-quick-link
              to="/transfer"
              icon="mdi-send"
              title="Transfer"
              subtitle="Transfer funds"
            />
          </v-col>
          <v-col
            cols="12"
            md="4"
          >
            <card-quick-link
              to="/stake"
              icon="mdi-safe"
              title="Stake"
              subtitle="Stake your tokens"
            />
          </v-col>
          <v-col
            cols="12"
            md="4"
          >
            <card-quick-link
              to="/unstake"
              icon="mdi-wallet"
              title="Unstake"
              subtitle="Unstake your tokens"
            />
          </v-col>
        </v-row>
      </v-card-actions>
    </v-card>
    <operation-result
      v-for="operation in [...filteredOperations].reverse()"
      :key="operation.hash"
      :deploy-hash="operation.hash"
      :token="operation.token"
    />
  </div>
</template>

<script>
import BalanceAmountCard from '@/components/account/BalanceAmountCard';
import CardQuickLink from '@/components/account/CardQuickLink';
import CardSectionTitle from '@/components/account/CardSectionTitle';
import Erc20TokensBalance from '@/components/account/erc20/Erc20TokensBalance';
import NotConnectedAlert from '@/components/account/NotConnectedAlert';
import ValidatorsBalance from '@/components/account/validators/ValidatorsBalance';
import OperationResult from '@/components/operations/OperationResult.vue';
import OperationsTable from '@/components/operations/OperationsTable';
import balanceService from '@/helpers/balanceService';
import nativeToken from '@/services/tokens/nativeToken';
import { Erc20ApproveResult } from '@casperholders/core';
import Big from 'big.js';
import { mapState } from 'vuex';

/**
 * Balance view
 * Display the current user balance and their staked tokens on the Casper Node
 * configured in the env file
 */
export default {
  name: 'BalanceView',
  components: {
    OperationResult,
    ValidatorsBalance,
    Erc20TokensBalance,
    NotConnectedAlert,
    BalanceAmountCard,
    CardSectionTitle,
    CardQuickLink,
    OperationsTable,
  },
  data() {
    return {
      casperLogo: nativeToken.logo,
      loading: true,
      errored: false,
      totalAvailable: '0',
      totalStaked: Big(0),
      totalStakedLoading: false,
      mergedValidator: undefined,
      validators: [],
    };
  },
  computed: {
    ...mapState(['signer']),
    /**
     * Retrieve all the DeployResult of the ERC20 allowance type
     * @returns {*}
     */
    filteredOperations() {
      return this.$store.getters.filterOperations(Erc20ApproveResult.getName())
        .map((object) => ({ ...object }));
    },
    total() {
      return this.totalStaked.plus(this.totalAvailable);
    },
  },
  watch: {
    /**
     * Watch the state of the active key. In case of an update, re-fetch the balance data
     */
    'signer.activeKey': {
      handler: 'onActiveKeyChange',
      immediate: true,
    },
  },
  methods: {
    /**
     * On active key init or change.
     */
    onActiveKeyChange() {
      this.fetchAvailableBalance();
    },
    onTotalStackedStateChange({ loading, totalStaked }) {
      this.totalStaked = totalStaked;
      this.totalStakedLoading = loading;
    },
    async fetchAvailableBalance() {
      this.loading = true;
      this.errored = false;
      this.totalAvailable = '0';

      try {
        this.totalAvailable = await balanceService.fetchBalance();
      } catch {
        this.errored = true;
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style
  lang="scss"
  scoped
>
  ::v-deep .validator-cards {
    min-height: 150px;
    min-width: 250px;
    width: 250px;
  }

  .balance-cards {
    min-width: 220px;
  }
</style>
