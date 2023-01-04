<template>
  <div>
    <v-row
      v-for="({ name, loading, ...tokenAmount }, index) in items"
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
            data-cy="loadingBalance"
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
          <token-amount
            data-cy="loadedBalance"
            v-else
            key="value"
            :amount="tokenAmount"
          />
        </v-slide-y-transition>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import TokenAmount from '@/components/account/TokenAmount';
import computeFormattedTokenValue from '@/services/tokens/computeFormattedTokenValue';
import nativeToken from '@/services/tokens/nativeToken';
import Big from 'big.js';

export default {
  name: 'OperationSummary',
  components: { TokenAmount },
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
    isAmountDefined() {
      return this.amount !== undefined
        && this.amount !== ''
        && this.amount !== '-';
    },
    balanceAfterOperation() {
      const balance = Big(this.balance).minus(this.fee);
      if (this.isNativeToken && this.isAmountDefined) {
        return balance.plus(this.amount);
      }

      return balance;
    },
    tokenBalanceAfterOperation() {
      return this.isAmountDefined
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
        ...computeFormattedTokenValue(value, token), ...other,
      }));
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
