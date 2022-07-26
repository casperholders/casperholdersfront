<template>
  <div>
    <v-row
      v-for="({ name, value, loading, isAmount }, index) in items"
      :key="`rows-${index}`"
      :class="{ 'white-top-border': index !== 0 }"
    >
      <v-col>
        {{ name }}
      </v-col>
      <v-col class="text-right">
        <v-slide-y-transition
          mode="out-in"
          leave-absolute
          group
        >
          <span
            v-if="loading"
            key="loading"
            class="d-flex align-center justify-end summary__loading"
          >
            <v-progress-circular
              v-if="loading"
              class="mr-2"
              color="white"
              width="3"
              size="16"
              indeterminate
            />
            Loading...
          </span>
          <span
            v-else
            key="value"
            :class="{ 'cspr': isAmount }"
            v-text="value"
          />
        </v-slide-y-transition>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import nativeToken from '@/services/tokens/nativeToken';
import Big from 'big.js';

export default {
  name: 'OperationSummary',
  props: {
    balanceLoading: {
      type: Boolean,
      default: false,
    },
    balance: {
      type: [String, Number, Object],
      default: undefined,
    },
    tokenBalance: {
      type: [String, Number, Object],
      default: undefined,
    },
    token: {
      type: Object,
      default: () => nativeToken,
    },
    fee: {
      type: [String, Number, Object],
      default: undefined,
    },
    amount: {
      type: [String, Number, Object],
      default: undefined,
    },
    prependValues: {
      type: Array,
      default: () => [],
    },
    appendValues: {
      type: Array,
      default: () => [],
    },
  },
  computed: {
    isNativeToken() {
      return this.token.id === nativeToken.id;
    },
    balanceAfterOperation() {
      const balance = Big(this.balance).minus(this.fee);
      if (this.isNativeToken && this.amount !== undefined) {
        return balance.plus(this.amount);
      }

      return balance;
    },
    tokenBalanceAfterOperation() {
      return this.amount !== undefined
        ? Big(this.tokenBalance).plus(this.amount)
        : this.tokenBalance;
    },
    values() {
      const balanceValue = (token, name, value) => ({
        name: `${token ? `${token.shortName} ` : ''}${name}`,
        loading: this.balanceLoading,
        value,
        token,
      });

      const values = [
        balanceValue(this.isNativeToken ? undefined : nativeToken, 'Balance', this.balance),
        balanceValue(this.isNativeToken ? undefined : nativeToken, 'Balance after operation', this.balanceAfterOperation),
      ];

      if (!this.isNativeToken) {
        values.push(
          balanceValue(this.token, 'Balance', this.tokenBalance),
          balanceValue(this.token, 'Balance after operation', this.tokenBalanceAfterOperation),
        );
      }

      values.push({ name: 'Operation fee', value: this.fee });

      return values;
    },
    items() {
      return [
        ...this.prependValues,
        ...this.values,
        ...this.appendValues,
      ].map(({ value, token, ...other }) => ({
        ...this.computeAndFormatValue(value, token), ...other,
      }));
    },
  },
  methods: {
    computeAndFormatValue(value, token) {
      const data = this.computeValueData(value);
      if (data.isAmount) {
        const valueWithUnit = token
          ? `${data.value} ${token.shortName}`
          : `${data.value} ${nativeToken.shortName}`;

        return {
          value: valueWithUnit, isAmount: data.isAmount,
        };
      }

      return data;
    },
    computeValueData(value) {
      if (value === undefined || value === null || value === '') {
        return { value: '-', isAmount: false };
      }

      if (typeof value === 'object') {
        return { value: value.toFormat(5), isAmount: true };
      }

      if (typeof value === 'number') {
        return { value: value.toFixed(5), isAmount: true };
      }

      if (typeof value === 'string' && !Number.isNaN(Number(value))) {
        return { value: Big(value).toFormat(5), isAmount: true };
      }

      return { value, isAmount: false };
    },
  },
};
</script>

<style
  lang="scss"
  scoped
>
  .summary__loading {
    min-height: 25px;
  }
</style>
