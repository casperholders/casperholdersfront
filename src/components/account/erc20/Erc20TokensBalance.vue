<template>
  <div data-cy="erc20-balance">
    <card-section-title
      icon="mdi-chart-arc"
      title="ERC 20"
    >
      <template #action>
        <add-erc20-token-dialog
          :tokens="tokens"
          @add="onAddErc20Token"
        >
          <template #activator="{ attrs, on }">
            <v-btn
              data-cy="erc20-add-button"
              :disabled="loading"
              title="Track new ERC20 token"
              class="ml-auto"
              icon
              v-bind="attrs"
              v-on="on"
            >
              <v-icon>
                mdi-plus
              </v-icon>
            </v-btn>
          </template>
        </add-erc20-token-dialog>
      </template>
    </card-section-title>
    <card-horizontal-list class="px-6 pb-4">
      <template v-if="loading">
        <balance-amount-card
          v-for="index in 3"
          :key="`skeletons-${index}`"
          class="validator-cards"
          loading
        />
      </template>
      <add-erc20-token-dialog
        v-else-if="tokens.length === 0"
        :tokens="tokens"
        @add="onAddErc20Token"
      >
        <template #activator="{ attrs, on }">
          <v-card
            data-cy="erc20-add-card"
            class="validator-cards d-flex align-center justify-center"
            color="primary"
            v-bind="attrs"
            v-on="on"
          >
            <v-btn
              color="secondary"
              class="rounded-xl"
            >
              <v-icon left>
                mdi-plus
              </v-icon>
              Add ERC20 token
            </v-btn>
          </v-card>
        </template>
      </add-erc20-token-dialog>
      <erc20-token-balance
        v-for="token in tokens"
        :key="`token-${token.id}`"
        :data-cy="`erc20-balance-${token.id}`"
        :balance="balance"
        :token="token"
        :amount="tokensBalances[token.id]"
        @remove="onRemoveErc20Token(token)"
      />
    </card-horizontal-list>
  </div>
</template>

<script>
import BalanceAmountCard from '@/components/account/BalanceAmountCard';
import CardHorizontalList from '@/components/account/CardHorizontalList';
import CardSectionTitle from '@/components/account/CardSectionTitle';
import AddErc20TokenDialog from '@/components/account/erc20/AddErc20TokenDialog';
import Erc20TokenBalance from '@/components/account/erc20/Erc20TokenBalance.vue';
import fetchTokens from '@/services/tokens/fetchTokens';
import findTokenGroup from '@/services/tokens/findTokenGroup';
import useErc20TrackedTokens from '@/services/tokens/useErc20TrackedTokens';
import Big from 'big.js';
import { mapState } from 'vuex';

/**
 * Component to display ERC20 balance per tokens.
 */
export default {
  name: 'Erc20TokensBalance',
  components: {
    Erc20TokenBalance,
    BalanceAmountCard,
    CardHorizontalList,
    AddErc20TokenDialog,
    CardSectionTitle,
  },
  props: {
    /**
     * The current account native token balance.
     */
    balance: {
      required: true,
      type: String,
    },
  },
  data: () => ({
    loading: false,
    /**
     * The currently tracked tokens.
     */
    tokens: [],
    /**
     * The balance fetching state of each tracked tokens.
     */
    tokensBalancesLoading: {},
    /**
     * The tracked tokens balances.
     */
    tokensBalances: {},
  }),
  computed: {
    ...mapState([
      'signer',
    ]),
  },
  watch: {
    /**
     * Watch the state of the active key. In case of an update, re-fetch the data.
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
      this.tokensBalancesLoading = {};
      this.tokensBalances = {};

      this.fetchTokensFromStore();
    },
    /**
     * Fetch already tracked tokens from the local storage.
     *
     * @returns {Promise<void>}
     */
    async fetchTokensFromStore() {
      const tokensIds = useErc20TrackedTokens(this.signer.activeKey).get() || [];
      if (tokensIds.length) {
        this.loading = true;

        const { data } = await fetchTokens({ ids: tokensIds });

        this.tokens = data;

        this.loading = false;

        await this.fetchTokensBalances();
      }
    },
    /**
     * Fetch all tokens balances when it is not already fetched/fetching.
     *
     * @returns {Promise<void>}
     */
    async fetchTokensBalances() {
      const promises = this.tokens.map(async (token) => {
        if (this.tokensBalancesLoading[token.id] === undefined) {
          this.$set(this.tokensBalancesLoading, token.id, true);

          this.$set(
            this.tokensBalances,
            token.id,
            await findTokenGroup(token.groupId).features.balance.fetchBalance(token),
          );

          this.$set(this.tokensBalancesLoading, token.id, false);
        }
      });

      await Promise.all(promises);

      this.tokens.sort(
        (t1, t2) => Big(this.tokensBalances[t2.id] || 0)
          .cmp(Big(this.tokensBalances[t1.id] || 0)),
      );
    },
    /**
     * Save the tokens state to store.
     */
    saveTokensToStore() {
      useErc20TrackedTokens(this.signer.activeKey).set(this.tokens.map(({ id }) => id));
    },
    /**
     * Handle an addition of a token and fetch its balance.
     *
     * @param {object[]} tokens
     */
    onAddErc20Token(tokens) {
      const filteredTokens = tokens.filter((t) => !this.tokens.some(({ id }) => id === t.id));
      if (filteredTokens.length) {
        this.tokens.push(...filteredTokens);

        this.saveTokensToStore();

        this.fetchTokensBalances();
      }
    },
    /**
     * Handle a removal of a token.
     *
     * @param {object} token
     */
    onRemoveErc20Token(token) {
      const index = this.tokens.findIndex(({ id }) => id === token.id);
      if (index !== -1) {
        this.tokens.splice(index, 1);

        this.saveTokensToStore();
      }
    },
  },
};
</script>
