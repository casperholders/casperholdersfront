<template>
  <v-autocomplete
    v-model="lazyValue"
    :search-input.sync="search"
    :loading="loading"
    :items="tokens"
    :clearable="!isNativeToken"
    :filter="filter"
    prepend-icon="mdi-circle-multiple-outline"
    label="Token"
    color="white"
    item-value="id"
    filled
    chips
    v-bind="$attrs"
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
    <template #item="{ item }">
      <v-list-item-avatar
        v-if="item.logo"
        color="white"
        size="32"
      >
        <v-img :src="item.logo" />
      </v-list-item-avatar>
      <v-list-item-content>
        <v-list-item-title v-text="item.name || item.id" />
        <v-list-item-subtitle v-if="item.shortName">
          <span
            class="cspr"
            v-text="item.shortName"
          />
        </v-list-item-subtitle>
      </v-list-item-content>
    </template>
    <template
      v-if="search && !loading"
      #prepend-item
    >
      <v-list-item>
        <v-list-item-content>
          <v-list-item-title class="text-body-2">
            <template v-if="tokensSize">
              Displaying {{ tokensSize }} tokens of {{ tokensTotalSize }} matching.
            </template>
            <template v-else>
              No matching token.
            </template>
          </v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </template>
  </v-autocomplete>
</template>

<script>
import fetchTokens from '@/services/tokens/fetchTokens';
import nativeToken from '@/services/tokens/nativeToken';
import tokensGroups from '@/services/tokens/tokensGroups';
import { debounce } from 'chart.js/helpers';

/**
 * Component to choose a token (native CSPR, ERC20 contracts, etc.)
 * for different deploys purpose (transfers, etc.).
 */
export default {
  name: 'TokenInput',
  inheritAttrs: false,
  props: {
    /**
     * The token (smart contract) hash to use, defaults to native CSPR.
     */
    value: {
      type: [String, Object],
      default: undefined,
    },
  },
  data() {
    return {
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
      lazyValue: this.value || nativeToken,
      /**
       * The available tokens to select.
       */
      tokens: [nativeToken, { header: 'Fetching other tokens...' }],
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
    /**
     * Tells if the native token is selected.
     *
     * @returns {boolean}
     */
    isNativeToken() {
      return !this.lazyValue || this.lazyValue.id === nativeToken.id;
    },
  },
  watch: {
    search: 'onSearch',
    lazyValue: 'onLazyValue',
    value: 'onValue',
  },
  mounted() {
    this.debouncedFetchTokens();
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
     * Fetch the tokens and add them to the select inside groups.
     *
     * @returns {Promise<void>}
     */
    async fetchTokens() {
      this.loading = true;

      try {
        const { data, contentRange } = await fetchTokens({ search: this.search });

        this.tokens = [nativeToken];
        if (this.lazyValue && !this.isNativeToken) {
          this.tokens.push(this.lazyValue);
        }

        Object.values(tokensGroups).forEach((group) => {
          const groupTokens = data.filter(({ groupId }) => groupId === group.id);
          if (groupTokens.length) {
            this.tokens.push(
              { divider: true },
              { header: group.name },
              ...groupTokens,
            );
          }
        });

        this.tokensTotalSize = contentRange.size;
        this.tokensSize = data.length;
      } catch (error) {
        this.tokens = [nativeToken, { header: `Fetching tokens failed: ${error.message}` }];
      } finally {
        this.loading = false;
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
     * @param {object} lazyValue
     */
    onLazyValue(lazyValue) {
      this.$emit('input', lazyValue || nativeToken);
    },
    /**
     * Update the internal value when the value is changed by parent component.
     *
     * @param {object} value
     */
    onValue(value) {
      this.lazyValue = value || nativeToken;
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
