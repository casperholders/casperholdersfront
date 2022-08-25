<template>
  <v-card
    class="balance-amount-card"
    color="primary"
  >
    <v-card-text v-if="loading">
      <v-skeleton-loader
        type="heading"
        class="mb-2"
      />
      <v-skeleton-loader type="text" />
    </v-card-text>
    <v-card-text v-else>
      <token-amount
        :amount="tokenAmount"
        class="white--text"
        style="font-size: 1.10rem"
      />
      <div class="d-flex align-center text-overline">
        <v-avatar
          v-if="logo"
          color="white"
          size="32"
          class="my-1 mr-3"
        >
          <v-img :src="logo" />
        </v-avatar>
        <span class="text-truncate">
          {{ title }}
        </span>
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
import TokenAmount from '@/components/account/TokenAmount';
import computeFormattedTokenValue from '@/services/tokens/computeFormattedTokenValue';
import nativeToken from '@/services/tokens/nativeToken';

export default {
  name: 'BalanceAmountCard',
  components: { TokenAmount },
  props: {
    logo: {
      type: String,
      default: undefined,
    },
    title: {
      type: String,
      default: '',
    },
    loading: {
      type: Boolean,
      default: false,
    },
    token: {
      type: Object,
      default: () => nativeToken,
    },
    amount: {
      type: [String, Number, Object],
      default: undefined,
    },
  },
  computed: {
    tokenAmount() {
      return computeFormattedTokenValue(this.amount, this.token);
    },
  },
};
</script>

<style
  lang="scss"
  scoped
>
  .balance-amount-card {
    min-width: 200px;
    width: 200px;
  }
</style>
