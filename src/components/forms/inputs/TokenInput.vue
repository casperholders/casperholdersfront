<template>
  <v-autocomplete
    ref="tokenInput"
    :value="multiple ? lazyValue : lazyValue[0]"
    :search-input.sync="search"
    :loading="loading"
    :items="tokens"
    :clearable="!isOnlyNativeToken"
    :filter="filter"
    :multiple="multiple"
    :prepend-icon="mdiCircleMultipleOutline"
    label="Token"
    color="white"
    item-value="id"
    return-object
    filled
    chips
    v-bind="$attrs"
    @input="onInputValue"
    @change="onClearSearch"
  >
    <template #selection="{ item, select }">
      <v-chip
        color="primary"
        @click="select"
      >
        <v-list-item-avatar
          v-if="item.logo"
          color="white"
          left
        >
          <v-img :src="item.logo" />
        </v-list-item-avatar>
        {{ item.name || item.id }}
      </v-chip>
    </template>
    <template #item="{ parent, item }">
      <v-list-item-action v-if="parent.action && !parent.hideSelected && parent.items.length > 0">
        <v-simple-checkbox
          :color="parent.color"
          :value="parent.hasItem(item)"
          :ripple="false"
          @input="parent.$emit('select', item)"
        />
      </v-list-item-action>
      <v-list-item-avatar
        v-if="item.logo"
        color="white"
        size="32"
      >
        <v-img :src="item.logo" />
      </v-list-item-avatar>
      <v-list-item-content>
        <v-list-item-title
          :data-cy="`token-contract-${item.id}`"
        >
          {{ item.name || item.id }}
        </v-list-item-title>
        <v-list-item-subtitle v-if="item.shortName">
          <span
            class="cspr"
            v-text="item.shortName"
          />
        </v-list-item-subtitle>
      </v-list-item-content>
    </template>
    <template #no-data>
      <v-list-item>
        <v-list-item-content class="text-body-2">
          <v-list-item-title v-if="loading">
            Loading tokens...
          </v-list-item-title>
          <v-list-item-title v-else>
            No matching token no data.
          </v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </template>
    <template
      v-if="search && !loading && tokensSize"
      #prepend-item
    >
      <v-list-item>
        <v-list-item-content>
          <v-list-item-title class="text-body-2">
            Displaying {{ tokensSize }} tokens of {{ tokensTotalSize }} matching.
          </v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </template>
  </v-autocomplete>
</template>

<script>
import { DATA_API } from '@/helpers/env';
import fetchTokens from '@/services/tokens/fetchTokens';
import nativeToken from '@/services/tokens/nativeToken';
import tokensGroups from '@/services/tokens/tokensGroups';
import { mdiCircleMultipleOutline } from '@mdi/js';
import { CLPublicKey } from 'casper-js-sdk';
import { debounce } from 'chart.js/helpers';
import { mapGetters } from 'vuex';

/**
 * Component to choose a token (native CSPR, ERC20 contracts, etc.)
 * for different deploys purpose (transfers, etc.).
 */
export default {
  name: 'TokenInput',
  inheritAttrs: false,
  props: {
    /**
     * The token ID to fetch and select automatically.
     */
    initialToken: {
      type: String,
      default: undefined,
    },
    /**
     * The token (smart contract) hash to use, defaults to native CSPR.
     */
    value: {
      type: [Object, Array],
      default: undefined,
    },
    /**
     * Filter displayed tokens by group ID.
     */
    onlyGroups: {
      type: Array,
      default: () => [],
    },
    /**
     * Hide those tokens (IDs) from the displayed tokens.
     */
    hideTokens: {
      type: Array,
      default: () => [],
    },
    /**
     * Tells the input to not default to native token when empty.
     */
    noDefault: {
      type: Boolean,
      default: false,
    },
    /**
     * Tells the input to handle multiple selection.
     */
    multiple: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      mdiCircleMultipleOutline,
      /**
       * Loading state for tokens fetching.
       */
      loading: true,
      /**
       * Textual search to filter tokens retrieved from data API.
       */
      search: '',
      /**
       * Internal value for the component state (ID of a token, always defaults to native CSPR).
       */
      lazyValue: this.wrapTokenInArray(this.tokenOrDefault(this.value)),
      /**
       * The available account tokens to select.
       */
      accountTokens: [],
      /**
       * The available tokens to select.
       */
      tokens: [],
      /**
       * The size of displayed tokens from search.
       */
      tokensSize: 0,
      /**
       * The size of total matching tokens from search.
       */
      tokensTotalSize: 0,
      /**
       * Debounced version of fetchTokens function.
       */
      debouncedFetchTokens: debounce(this.fetchTokens, 250),
    };
  },
  computed: {
    ...mapGetters([
      'activeKey',
    ]),
    /**
     * Tells if the native token is selected.
     *
     * @returns {boolean}
     */
    isOnlyNativeToken() {
      return this.lazyValue.length === 1 && this.lazyValue[0].id === nativeToken.id;
    },
  },
  watch: {
    initialToken: 'onInitialToken',
    search: 'onSearch',
    lazyValue: 'onLazyValue',
    value: 'onValue',
    activeKey: 'debouncedFetchTokens',
  },
  mounted() {
    this.debouncedFetchTokens();

    this.onInitialToken(this.initialToken);
  },
  methods: {
    /**
     * Filter item for VAutocomplete textual search.
     * Since items are already filtered when fetching from API, this function always returns true.
     *
     * @returns {boolean}
     */
    filter() {
      return true;
    },
    /**
     * Tells if the given group should be listed.
     *
     * @param {string} groupId
     *
     * @returns {boolean}
     */
    shouldDisplayGroup(groupId) {
      return this.onlyGroups.length === 0 || this.onlyGroups.indexOf(groupId) !== -1;
    },
    /**
     * Fetch the tokens and add them to the select inside groups.
     *
     * @returns {Promise<void>}
     */
    async fetchTokens() {
      this.loading = true;

      this.tokens = [];

      if (this.shouldDisplayGroup(nativeToken.groupId)) {
        this.tokens.push(nativeToken);
      }

      if (!this.search && (this.shouldDisplayGroup('erc20') || this.shouldDisplayGroup('uniswaperc20'))) {
        const erc20Account = (await (await fetch(`${DATA_API}/rpc/account_ercs20?publickey=${this.activeKey}&accounthash=${CLPublicKey.fromHex(this.activeKey).toAccountHashStr()}`)).json()).map((contractHash) => contractHash.contract_hash);
        const accountTokens = await fetchTokens({
          ids: erc20Account,
          notIds: this.hideTokens,
          tokenTypes: this.onlyGroups,
        });
        if (accountTokens.data.length > 0) {
          this.tokens.push(
            ...(
              [{ divider: true }, { header: 'Account tokens' }]
            ),
            ...accountTokens.data,
          );
        }
      }

      try {
        const { data, contentRange } = await fetchTokens({
          search: this.search,
          limit: 10,
          notIds: this.hideTokens,
          tokenTypes: this.onlyGroups,
        });

        if (this.lazyValue.length && !this.isOnlyNativeToken) {
          this.tokens.push(...this.lazyValue.filter((t) => t.id !== nativeToken.id));
        }

        Object.values(tokensGroups).forEach((group) => {
          if (this.shouldDisplayGroup(group.id)) {
            const groupTokens = data.filter(({ groupId }) => groupId === group.id);
            if (groupTokens.length) {
              this.tokens.push(
                ...(
                  this.tokens.length ? [{ divider: true }, { header: group.name }] : []
                ),
                ...groupTokens,
              );
            }
          }
        });

        this.tokensTotalSize = contentRange.size;
        this.tokensSize = data.length;
      } catch (error) {
        this.tokens.push({ header: `Fetching tokens failed: ${error.message}` });
      } finally {
        this.loading = false;
      }
    },
    /**
     * Get the token if defined or no default to native.
     *
     * @param {object|undefined} token
     *
     * @returns {object}
     */
    tokenOrDefault(token) {
      return token || this.noDefault ? token : nativeToken;
    },
    /**
     * Wrap a token into an array of token.
     *
     * @param {object[]|object|undefined} token
     *
     * @returns {object[]}
     */
    wrapTokenInArray(token) {
      if (Array.isArray(token)) {
        return token;
      }

      return token ? [token] : [];
    },
    /**
     * Select the token when it changes.
     *
     * @param {string} tokenId
     *
     * @returns Promise<void>
     */
    async onInitialToken(tokenId) {
      if (tokenId) {
        const { data } = await fetchTokens({ ids: [tokenId], limit: 1 });

        this.lazyValue = this.wrapTokenInArray(this.tokenOrDefault(data[0]));
      } else {
        this.lazyValue = this.wrapTokenInArray(this.tokenOrDefault(undefined));
      }
    },
    /**
     * Trigger a new tokens fetching on search each update (debounced).
     */
    onSearch() {
      this.loading = true;

      this.debouncedFetchTokens();
    },
    /**
     * Emit an update to parent when internal value changes.
     *
     * @param {object[]|object} value
     */
    onInputValue(value) {
      this.lazyValue = this.wrapTokenInArray(this.tokenOrDefault(value));
    },
    /**
     * Emit an update to parent when internal value changes.
     *
     * @param {object[]} lazyValue
     */
    onLazyValue(lazyValue) {
      const arrayValue = this.wrapTokenInArray(this.tokenOrDefault(lazyValue));

      this.$emit('input', this.multiple ? arrayValue : arrayValue[0]);
    },
    /**
     * Update the internal value when the value is changed by parent component.
     *
     * @param {object[]|object} value
     */
    onValue(value) {
      this.lazyValue = this.wrapTokenInArray(this.tokenOrDefault(value));
    },
    /**
     * Clear the autocomplete search on selection.
     */
    onClearSearch() {
      this.$refs.tokenInput.lazySearch = '';
    },
  },
};
</script>

<style
  lang="scss"
  scoped
>
  .v-select-list.v-list {
    background-color: var(--v-primary-base) !important;
  }
</style>
