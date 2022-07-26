<template>
  <v-autocomplete
    v-model="lazyValue"
    :loading="loading"
    :items="tokens"
    :clearable="clearable"
    prepend-icon="mdi-circle-multiple-outline"
    label="Token"
    item-value="id"
    color="white"
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
  </v-autocomplete>
</template>

<script>
import fetchTokens from '@/services/tokens/fetchTokens';
import nativeToken from '@/services/tokens/nativeToken';
import tokensGroups from '@/services/tokens/tokensGroups';

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
  data: () => ({
    /**
     * Loading state for tokens fetching.
     */
    loading: true,
    /**
     * Internal value for the component state (ID of a token, defaults to native CSPR).
     */
    lazyValue: undefined,
    /**
     * The available tokens to select.
     */
    tokens: [nativeToken, { header: 'Fetching other tokens...' }],
  }),
  computed: {
    /**
     * Tells if the input can be cleared (only when using a non-native CSPR token).
     *
     * @returns {boolean}
     */
    clearable() {
      return !!this.lazyValue;
    },
  },
  watch: {
    lazyValue: 'onLazyValue',
    value: {
      handler: 'onValue',
      immediate: true,
    },
  },
  mounted() {
    this.fetchTokens();
  },
  methods: {
    /**
     * Fetch the tokens and add them to the select inside groups.
     *
     * @returns {Promise<void>}
     */
    async fetchTokens() {
      this.loading = true;

      try {
        const tokens = await fetchTokens();

        this.tokens = [nativeToken];

        Object.values(tokensGroups).forEach((group) => {
          const groupTokens = tokens.filter(({ groupId }) => groupId === group.id);
          if (groupTokens.length) {
            this.tokens.push(
              { divider: true },
              { header: group.name },
              ...groupTokens,
            );
          }
        });
      } catch (error) {
        this.tokens = [nativeToken, { header: `Fetching tokens failed: ${error.message}` }];
      } finally {
        this.loading = false;
      }
    },
    /**
     * Emit an update to parent when internal value changes.
     *
     * @param {string|Object} lazyValue
     */
    onLazyValue(lazyValue) {
      this.$emit('input', lazyValue || undefined);
    },
    /**
     * Update the internal value when the value is changed by parent component.
     *
     * @param {string|Object} value
     */
    onValue(value) {
      this.lazyValue = value || null;
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
