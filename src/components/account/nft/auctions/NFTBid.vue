<template>
  <operation-card
    :loading-sign-and-deploy="loadingSignAndDeploy"
    :send-deploy="sendDeploy"
    :type="operationType"
    :balance="balance"
    :fee="bidFee"
    :amount="`-${bid}`"
    :cancel="true"
    :icon="mdiGavel"
    submit-title="Add bid"
    title="Auction Bid"
    @cancelOperationCard="$emit('closeBid')"
  >
    <v-text-field
      v-model="bid"
      data-cy="bid"
      :rules="bidRules"
      :value="bid"
      color="white"
      label="Bid"
      :prepend-icon="mdiCurrencyUsd"
      class="mb-3"
      hint="In CSPR"
      required
    />
    <v-alert
      v-if="isCurrentUserWinner"
      dense
      type="info"
      style="overflow-wrap: anywhere!important;"
    >
      You're the current winner, only the difference with
      your current bid will be deducted from your balance.
    </v-alert>
    <operation-summary
      :balance-loading="loadingBalance"
      :balance="balance"
      :fee="bidFee"
      :amount="`-${balanceAfterOperationForBid}`"
      class="mx-n1"
    />
    <v-alert
      v-if="errorBalance"
      class="mt-5"
      dense
      prominent
      type="error"
    >
      <v-row align="center">
        <v-col class="grow">
          {{ errorBalance.message }}
        </v-col>
        <v-col class="shrink">
          <v-btn
            v-if="isInstanceOfNoActiveKeyError"
            color="primary"
            @click="connectionRequest"
          >
            <v-icon left>
              {{ mdiAccountCircle }}
            </v-icon>
            Connect
          </v-btn>
        </v-col>
      </v-row>
    </v-alert>
    <v-alert
      v-if="errorDeploy"
      class="mt-5"
      dense
      type="error"
    >
      {{ errorDeploy.message }}
    </v-alert>
  </operation-card>
</template>

<script>
import Bid from '@/assets/smartcontracts/bid-purse.wasm?url';
import OperationCard from '@/components/operations/OperationCard.vue';
import OperationSummary from '@/components/operations/OperationSummary.vue';
import balanceService from '@/helpers/balanceService';
import { NETWORK } from '@/helpers/env';
import genericSendDeploy from '@/helpers/genericSendDeploy';
import { getItem, getStateRootHash } from '@/helpers/rpc';
import {
  InsufficientFunds, NftBid, NftBidResult,
  NoActiveKeyError,
} from '@casperholders/core';
import { mdiAccountCircle, mdiCurrencyUsd, mdiGavel } from '@mdi/js';
import Big from 'big.js';
import { mapGetters, mapState } from 'vuex';

export default {
  name: 'NFTBid',
  components: { OperationCard, OperationSummary },
  props: {
    nftData: {
      type: Object,
      required: true,
    },
    auctionData: {
      type: Object,
      required: true,
    },
    minBid: {
      type: String,
      required: true,
    },
    isCurrentUserWinner: {
      type: Boolean,
      required: false,
      default: false,
    },
    currentUserBid: {
      type: String,
      required: false,
      default: '0',
    },
  },
  data() {
    return {
      mdiCurrencyUsd,
      mdiGavel,
      mdiAccountCircle,
      nft: this.nftData,
      auction: this.auctionData,
      errorBalance: null,
      balance: '0',
      loadingSignAndDeploy: false,
      errorDeploy: null,
      operationType: NftBidResult.getName(),
      bidFee: 35,
      bid: this.minBid,
      bidRules: [],
      loadingBalance: true,
    };
  },
  computed: {
    ...mapState([
      'signer',
      'internet',
    ]),
    ...mapGetters([
      'signerObject',
      'signerOptionsFactory',
      'activeKey',
    ]),
    minimumFundsNeeded() {
      return this.bidFee;
    },
    balanceAfterOperationForBid() {
      return Big(this.bid).minus(this.currentUserBid).toString();
    },
    isInstanceOfNoActiveKeyError() {
      return this.errorBalance instanceof NoActiveKeyError;
    },
  },
  watch: {
    nftData: {
      handler: 'refreshData',
      deep: true,
      immediate: true,
    },
    auctionData: 'refreshAuction',
    minBid: 'refreshMinBid',
    internet: 'fetchBalances',
    'signer.activeKey': 'fetchBalances',
  },
  async mounted() {
    this.nft = this.nftData;
    this.auction = this.auctionData;
    await this.fetchBalances();
    this.$root.$on('operationOnGoing', () => {
      this.errorDeploy = null;
    });
  },
  methods: {
    formatCasper(value = undefined) {
      return value !== undefined ? `${value.toFormat(5)} CSPR` : '- CSPR';
    },
    async getInitialValue(namedKey, force = false) {
      const name = this.auction.named_keys?.filter((n) => n.name === namedKey);
      if (name[0]?.initial_value && !force) {
        return name[0].initial_value;
      }
      return name[0]
        ? (await getItem(name[0].uref, await getStateRootHash()))
          .result?.stored_value?.CLValue?.parsed
        : undefined;
    },
    async fetchBalances() {
      if (this.internet) {
        await this.getBalance();
      }
    },
    /**
     * Get the user balance
     */
    async getBalance() {
      this.loadingBalance = true;
      this.errorBalance = null;
      this.balance = '0';
      try {
        this.balance = await balanceService.fetchBalance();
        if (this.balance <= this.minimumFundsNeeded && this.internet) {
          throw new InsufficientFunds(this.minimumFundsNeeded);
        }
      } catch (e) {
        this.errorBalance = e;
      }
      this.loadingBalance = false;
    },
    /**
     * Method used by the OperationDialog component when the user confirm the operation.
     * Use the prepareSignAndSendDeploy method from the core library
     * Update the store with a deploy result containing the deployhash of the deploy sent
     */
    async sendDeploy() {
      const bid = new Uint8Array((await (await fetch(Bid)).arrayBuffer()));
      const deployParameter = new NftBid(
        this.activeKey,
        this.bid,
        NETWORK,
        this.auctionData.hash,
        bid.buffer,
      );
      const options = this.signerOptionsFactory.getOptionsForOperations();
      this.errorDeploy = null;
      this.loadingSignAndDeploy = true;
      const result = await genericSendDeploy(
        this.internet,
        this.activeKey,
        this.signer.activeKey,
        this.signerObject,
        deployParameter,
        options,
        this.bidFee,
      );
      if (result.error) {
        console.log(result.error);
        this.errorDeploy = result.error;
      } else {
        await this.$store.dispatch(result.event, result.data);
      }
      this.loadingSignAndDeploy = false;
      this.$root.$emit('closeOperationDialog');
      this.$root.$emit('operationFinished');
    },
    async connectionRequest() {
      await this.$store.dispatch('openConnectDialog');
    },
    refreshData(val) {
      this.nft = val;
    },
    refreshAuction(val) {
      this.auction = val;
    },
    refreshMinBid(val) {
      this.bid = val;
    },
  },
};
</script>
