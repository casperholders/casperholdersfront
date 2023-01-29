<template>
  <operation-card
    :loading-sign-and-deploy="loadingSignAndDeploy"
    :send-deploy="sendDeploy"
    :type="operationType"
    :balance="balance"
    :fee="auctionFee"
    :amount="0"
    :cancel="true"
    :icon="mdiSend"
    submit-title="Start auction"
    title="Sell NFT through an auction"
    @cancelOperationCard="$emit('closeSell')"
  >
    <n-f-t-details-operation :nft-data="nft" />
    <v-text-field
      v-model="address"
      data-cy="address"
      :rules="addressRules"
      :value="address"
      color="white"
      label="Beneficiary account"
      :prepend-icon="mdiAccount"
      required
    />
    <v-card
      v-if="format === 0"
      class="mb-6"
      outlined
    >
      <v-card-title>
        <a
          href="https://en.wikipedia.org/wiki/English_auction"
          target="_blank"
          rel="noopener"
        >
          English Auction
        </a>
      </v-card-title>
      <v-card-text>
        An English auction is an open-outcry ascending dynamic auction. It proceeds as follows.<br>

        <ul>
          <li>
            The auction opens with a reserve price for the item on sale.
          </li>
          <li>
            The auction accept bids that are higher than the highest bid or the reserve price if
            there's no bids yet.
          </li>
          <li>
            A minimum bid step can be set and the next bid will need to be higher than the last bid
            + the minimum step.
          </li>
          <li>
            The highest bidder at any given moment is considered to have the standing bid, which can
            only be displaced by a higher bid from a competing buyer.
          </li>
          <li>
            If no competing bidder challenges the standing bid within the time allowed by the
            auction, the standing bid becomes the winner, and the item is sold to the highest
            bidder at a price equal to their bid.
          </li>
          <li>
            If no bidder accepts the reserve price the item won't be sold and will be returned to
            the owner.
          </li>
          <li>
            The auction needs to be finalized by the seller.
          </li>
        </ul>
      </v-card-text>
    </v-card>
    <v-card
      v-if="format === 1"
      class="mb-3"
      outlined
    >
      <v-card-title>
        <a
          href="https://en.wikipedia.org/wiki/Dutch_auction"
          target="_blank"
          rel="noopener"
        >
          Dutch Auction
        </a>
      </v-card-title>
      <v-card-text>
        A Dutch auction is one of several similar types of auctions for buying or selling goods.<br>

        <ul>
          <li>
            The auction opens with a high starting price for the item on sale.
          </li>
          <li>
            The price lowers itself until some participant accepts the price, or it reaches a
            predetermined reserve price.
          </li>
          <li>
            The item will be sold to the first bidder and the auction will finalize itself.
          </li>
          <li>
            If no bidder accepts the reserve price the item won't be sold and will be returned to
            the owner.
          </li>
        </ul>
      </v-card-text>
    </v-card>
    <v-text-field
      v-if="format === 1"
      v-model="startingPrice"
      data-cy="startingPrice"
      :rules="startingPriceRules"
      :value="startingPrice"
      color="white"
      label="Starting price"
      :prepend-icon="mdiCurrencyUsd"
      class="mb-3"
      hint="In CSPR"
      required
    />
    <v-text-field
      v-model="reservePrice"
      data-cy="reservePrice"
      :rules="reservePriceRules"
      :value="reservePrice"
      color="white"
      label="Reserve price"
      :prepend-icon="mdiCurrencyUsd"
      class="mb-3"
      hint="In CSPR"
      required
    />
    <DateTimePicker
      name="Auction start time UTC"
      @value="startTime = $event"
    />
    <DateTimePicker
      name="Auction cancellation time UTC"
      :min="startTime"
      @value="cancellationTime = $event"
    />
    <DateTimePicker
      name="Auction end time UTC"
      :min="cancellationTime"
      @value="endTime = $event"
    />
    <v-text-field
      v-if="format === 0"
      v-model="auctionTimerExtension"
      data-cy="auctionTimerExtension"
      :rules="auctionTimerExtensionRules"
      :value="auctionTimerExtension"
      color="white"
      label="Auction timer extension (Optional)"
      :prepend-icon="mdiClockPlus"
      class="mb-3"
      hint="Will extend the cancellation & end time. In seconds."
    />
    <v-text-field
      v-if="format === 0"
      v-model="minimumBidStep"
      data-cy="minimumBidStep"
      :rules="minimumBidStepRules"
      :value="minimumBidStep"
      color="white"
      label="Minimum bid step (Optional)"
      :prepend-icon="mdiCurrencyUsd"
      class="mb-3"
      hint="In CSPR."
    />
    <operation-summary
      :balance-loading="loadingBalance"
      :balance="balance"
      :fee="auctionFee"
      :amount="0"
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
import AuctionInstaller from '@/assets/smartcontracts/auction.wasm?url';
import NFTDetailsOperation from '@/components/account/nft/NFTDetailsOperation.vue';
import DateTimePicker from '@/components/forms/inputs/DateTimePicker.vue';
import OperationSummary from '@/components/operations/OperationSummary.vue';
import balanceService from '@/helpers/balanceService';
import { NETWORK } from '@/helpers/env';
import genericSendDeploy from '@/helpers/genericSendDeploy';
import findTokenGroup from '@/services/tokens/findTokenGroup';
import { InsufficientFunds, NftSell, NftSellResult, NoActiveKeyError } from '@casperholders/core';
import { mdiAccount, mdiAccountCircle, mdiClockPlus, mdiCurrencyUsd, mdiSend } from '@mdi/js';
import { CLPublicKey } from 'casper-js-sdk';
import { mapGetters, mapState } from 'vuex';

export default {
  name: 'NFTSell',
  components: { DateTimePicker, NFTDetailsOperation, OperationSummary },
  props: {
    nftData: {
      type: Object,
      required: true,
    },
    token: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      mdiAccountCircle,
      mdiAccount,
      mdiSend,
      mdiCurrencyUsd,
      mdiClockPlus,
      nft: this.nftData,
      addressRules: [
        (a) => !!a || 'Address is required',
        (a) => a.length >= 2 || 'Address is too short',
        (a) => {
          try {
            CLPublicKey.fromHex(a);
            return true;
          } catch (e) {
            return e.toString();
          }
        },
      ],
      errorBalance: null,
      balance: '0',
      tokenBalance: '0',
      address: '',
      loadingSignAndDeploy: false,
      errorDeploy: null,
      loadingBalance: true,
      auctionFee: 200,
      format: 0,
      reservePrice: '',
      reservePriceRules: [
        (a) => !!a || 'Reserve price is required',
        (a) => /^\d+$/.test(a) || 'Must be a number',
      ],
      minimumBidStep: '',
      minimumBidStepRules: [
        (a) => a.length === 0 || /^\d+$/.test(a) || 'Must be a number or empty',
      ],
      startingPrice: '',
      startingPriceRules: [
        (a) => (a.length === 0 && this.format === 0) || (/^\d+$/.test(a) && this.format === 1) || 'Must be a number',
      ],
      bidderCountCap: '1',
      auctionTimerExtension: '',
      auctionTimerExtensionRules: [
        (a) => a.length === 0 || /^\d+$/.test(a) || 'Must be a number or empty',
      ],
      startTime: undefined,
      cancellationTime: undefined,
      endTime: undefined,
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
    tokenGroup() {
      return findTokenGroup(this.token.groupId);
    },
    operationType() {
      return NftSellResult.getName();
    },
    minimumFundsNeeded() {
      return this.auctionFee;
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
    token: 'fetchBalances',
    internet: 'fetchBalances',
    'signer.activeKey': 'fetchBalances',
    activeKey: {
      handler: 'setAddress',
      immediate: true,
    },
  },
  async mounted() {
    this.nft = this.nftData;
    await this.fetchBalances();
    this.$root.$on('operationOnGoing', () => {
      this.errorDeploy = null;
    });
  },
  methods: {
    setAddress() {
      this.address = this.activeKey;
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
      const auction = new Uint8Array((await (await fetch(AuctionInstaller)).arrayBuffer()));
      const deployParameter = new NftSell(
        this.activeKey,
        this.activeKey,
        this.token.package,
        this.reservePrice,
        this.nft.token_id,
        this.startTime,
        this.cancellationTime,
        this.endTime,
        this.bidderCountCap,
        this.auctionTimerExtension,
        this.minimumBidStep,
        NETWORK,
        auction.buffer,
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
        this.auctionFee,
        '0',
        false,
        this.token,
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
  },
};
</script>
