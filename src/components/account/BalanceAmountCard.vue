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
        class="white--text amount"
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
        <v-avatar
          v-else
          color="secondary"
          size="32"
          class="my-1 mr-3"
        >
          <v-icon dark>
            mdi-help
          </v-icon>
        </v-avatar>
        <span class="text-truncate">
          <template v-if="csprLivePathUrl !== ''">
            <a
              :href="csprLiveUrl(csprLivePathUrl)"
              target="_blank"
              rel="noopener"
            >
              {{ title }}
              <v-icon x-small>mdi-open-in-new</v-icon>
            </a>
          </template>
          <template v-else>
            {{ title }}
          </template>
        </span>
      </div>
    </v-card-text>
    <slot name="actions" />
  </v-card>
</template>

<script>
import { CSPR_LIVE_URL } from '@/helpers/env';
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
    csprLivePathUrl: {
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
  methods: {
    csprLiveUrl(csprLivePathUrl) {
      return `${CSPR_LIVE_URL}${csprLivePathUrl}`;
    },
  },
};
</script>
