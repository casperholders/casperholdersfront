<template>
  <n-f-t-details-operation :nft-data="nft">
    <template #additionalDetails>
      <div class="d-flex justify-end mb-4">
        <v-btn
          text
          data-cy="backToAuctionList"
          aria-label="Back to auction list"
          @click="$emit('closeBid')"
        >
          <v-icon left>
            {{ mdiArrowLeftCircle }}
          </v-icon>
          Return to auction list
        </v-btn>
      </div>
      <v-card
        class="balance-amount-card"
        color="primary"
      >
        <v-card-text>
          <span class="title mr-3">
            Current price
          </span>
          <token-amount
            data-cy="currentPrice"
            :amount="{isAmount: true, value: auctionInfos?.winning_bid}"
            class="white--text amount"
            style="font-size: 1.10rem"
          />
          <br>
          <span class="title mr-3">
            Minimum bid
          </span>
          <token-amount
            data-cy="minBid"
            :amount="{isAmount: true, value: formatCasper(minBid)}"
            class="white--text amount"
            style="font-size: 1.10rem"
          />
          <div class="d-flex align-center text-overline">
            <v-avatar
              color="secondary"
              size="32"
              class="my-1 mr-3"
            >
              <v-icon
                size="24"
                dark
              >
                {{ mdiClock }}
              </v-icon>
            </v-avatar>
            <span
              class="text-truncate"
              data-cy="timeLeft"
            >
              {{ countdown ?? 'Checking end time...' }}
            </span>
          </div>
          <div class="d-flex align-center text-overline">
            <v-avatar
              color="secondary"
              size="32"
              class="my-1 mr-3"
            >
              <v-icon
                size="24"
                dark
              >
                {{ mdiAccountCircle }}
              </v-icon>
            </v-avatar>
            <span
              class="text-truncate"
              data-cy="nbBidders"
            >
              {{ currentBids }} bidder(s) so far
            </span>
          </div>
          <div
            v-if="isCurrentUserWinner"
            class="d-flex align-center text-overline"
          >
            <v-avatar
              color="secondary"
              size="32"
              class="my-1 mr-3"
            >
              <v-icon
                size="24"
                color="yellow"
              >
                {{ mdiCrown }}
              </v-icon>
            </v-avatar>
            <span
              class="text-truncate"
              data-cy="winner"
            >
              You're the current winner !
            </span>
          </div>
        </v-card-text>
      </v-card>
    </template>
    <v-divider />
    <div
      v-if="loadingAuctionInfos === false
        && (
          currentAuctionStatus < auctionStatuses.ended
          || (currentAuctionStatus === auctionStatuses.ended && isOwner)
        )"
      data-cy="operationTabs"
    >
      <v-tabs
        v-model="tab"
        background-color="transparent"
        color="basil"
        grow
      >
        <v-tooltip
          :disabled="currentAuctionStatus < auctionStatuses.ended &&
            currentAuctionStatus > auctionStatuses.notStarted"
          bottom
        >
          <template #activator="{ on }">
            <div
              class="d-flex flex-grow-1"
              v-on="on"
            >
              <v-tab
                data-cy="bidTabButton"
                :disabled="currentAuctionStatus === auctionStatuses.ended ||
                  currentAuctionStatus === auctionStatuses.notStarted"
              >
                Bid
              </v-tab>
            </div>
          </template>
          Auction {{ currentAuctionStatus === auctionStatuses.ended ? 'ended' : 'not started yet' }}
        </v-tooltip>
        <v-tooltip
          :disabled="haveBid && currentAuctionStatus === auctionStatuses.live"
          bottom
        >
          <template #activator="{ on }">
            <div
              class="d-flex flex-grow-1"
              v-on="on"
            >
              <v-tab
                data-cy="cancelBidTabButton"
                :disabled="!haveBid || currentAuctionStatus !== auctionStatuses.live"
              >
                Cancel Bid
              </v-tab>
            </div>
          </template>
          {{ !haveBid ? 'You don\'t have a bid' : cancelTab }}
        </v-tooltip>
        <v-tooltip
          v-if="isOwner"
          :disabled="currentAuctionStatus === auctionStatuses.live && isOwner"
          bottom
        >
          <template #activator="{ on }">
            <div
              class="d-flex flex-grow-1"
              v-on="on"
            >
              <v-tab
                data-cy="cancelAuctionTabButton"
                :disabled="currentAuctionStatus !== auctionStatuses.live && isOwner"
              >
                Cancel Auction
              </v-tab>
            </div>
          </template>
          {{ cancelTab }}
        </v-tooltip>
        <v-tooltip
          v-if="isOwner"
          :disabled="auctionInfos.format === 'English' &&
            currentAuctionStatus === auctionStatuses.ended &&
            isOwner"
          bottom
        >
          <template #activator="{ on }">
            <div
              class="d-flex flex-grow-1"
              role="tab"
              style="tab-size: 4"
              v-on="on"
            >
              <v-tab
                data-cy="finalizeAuctionTabButton"
                :disabled="currentAuctionStatus !== auctionStatuses.ended && isOwner"
              >
                Finalize auction
              </v-tab>
            </div>
          </template>
          {{ finalizeTab }}
        </v-tooltip>
      </v-tabs>
      <v-tabs-items v-model="tab">
        <v-tab-item>
          <n-f-t-bid
            v-if="currentAuctionStatus < auctionStatuses.ended &&
              currentAuctionStatus > auctionStatuses.notStarted"
            :min-bid="minBid"
            :auction-data="auction"
            :nft-data="nft"
            data-cy="bidTab"
          />
        </v-tab-item>
        <v-tab-item>
          <n-f-t-cancel-bid
            v-if="haveBid && currentAuctionStatus === auctionStatuses.live"
            :auction-data="auction"
            :nft-data="nft"
            data-cy="cancelBidTab"
          />
        </v-tab-item>
        <v-tab-item v-if="isOwner">
          <n-f-t-cancel-auction
            v-if="currentAuctionStatus === auctionStatuses.live && isOwner"
            :auction-data="auction"
            :nft-data="nft"
            data-cy="cancelAuctionTab"
          />
        </v-tab-item>
        <v-tab-item v-if="isOwner">
          <n-f-t-finalize-auction
            v-if="
              auctionInfos.format === 'English' &&
                currentAuctionStatus === auctionStatuses.ended &&
                isOwner"
            :auction-data="auction"
            :nft-data="nft"
            data-cy="finalizeAuctionTab"
          />
        </v-tab-item>
      </v-tabs-items>
    </div>
    <v-card>
      <v-card-title>
        Auction details
        <v-chip
          color="primary"
          class="ml-3"
          data-cy="livenessIndicator"
        >
          <status-indicator
            :status="auctionStatusColor"
            :pulse="auctionStatus !== 'Finalized'"
            class="mr-3"
          />
          {{ auctionStatus }}
        </v-chip>
      </v-card-title>
      <v-simple-table>
        <tbody color="primary">
          <tr>
            <th scope="col">
              Characteristics
            </th>
            <th scope="col">
              Value
            </th>
          </tr>
          <template v-if="loadingAuctionInfos === false">
            <template v-for="[k, v] in Object.entries(auctionInfos)">
              <tr :key="k">
                <td>
                  {{ capitalizeFirstLetter(k) }}
                </td>
                <td>
                  {{ v }}
                </td>
              </tr>
            </template>
          </template>
          <template v-else>
            <tr>
              <td colspan="2">
                Loading auction infos ...
              </td>
            </tr>
          </template>
        </tbody>
      </v-simple-table>

      <v-card-title>
        Auction Events
      </v-card-title>
      <v-expansion-panels
        accordion
        flat
        tile
      >
        <v-expansion-panel
          v-for="(event, index) in events"
          :key="'event-'+index"
        >
          <v-expansion-panel-header>
            Event {{ events.length - index }} - {{ event.find(e => e.key === 'event_type').value }}
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            <v-simple-table>
              <tbody color="primary">
                <template v-for="entry in event">
                  <tr :key="'event-entry-'+entry.key">
                    <td>
                      {{ capitalizeFirstLetter(entry.key) }}
                    </td>
                    <td>
                      <template v-if="entry.key === 'bid'">
                        {{ formatCasper(entry.value) }}
                      </template>
                      <template v-else>
                        {{ entry.value }}
                      </template>
                    </td>
                  </tr>
                </template>
              </tbody>
            </v-simple-table>
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-card>
  </n-f-t-details-operation>
</template>

<script>
import NFTBid from '@/components/account/nft/auctions/NFTBid.vue';
import NFTCancelAuction from '@/components/account/nft/auctions/NFTCancelAuction.vue';
import NFTCancelBid from '@/components/account/nft/auctions/NFTCancelBid.vue';
import NFTFinalizeAuction from '@/components/account/nft/auctions/NFTFinalizeAuction.vue';
import NFTDetailsOperation from '@/components/account/nft/NFTDetailsOperation.vue';
import { DATA_API } from '@/helpers/env';
import { getDictionaryItemByURef, getItem, getStateRootHash } from '@/helpers/rpc';
import {
  mdiAccountCircle,
  mdiArrowLeftCircle,
  mdiClock,
  mdiCrown,
  mdiFileSign,
  mdiGavel,
} from '@mdi/js';
import Big from 'big.js';
import { CLPublicKey } from 'casper-js-sdk';
import { StatusIndicator } from 'vue-status-indicator';
import { mapGetters } from 'vuex';

export default {
  name: 'NFTAuction',
  components: {
    NFTCancelBid,
    NFTCancelAuction,
    NFTFinalizeAuction,
    NFTBid,
    NFTDetailsOperation,
    StatusIndicator,
  },
  props: {
    nftData: {
      type: Object,
      required: true,
    },
    auctionData: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      mdiCrown,
      mdiGavel,
      mdiAccountCircle,
      mdiFileSign,
      mdiClock,
      mdiArrowLeftCircle,
      nft: this.nftData,
      auction: this.auctionData,
      loadingAuctionInfos: true,
      auctionInfos: {},
      auctionStatus: '',
      auctionStatusColor: '',
      tab: null,
      countdown: null,
      minBid: '',
      cancelTab: null,
      finalizeTab: null,
      currentBids: 0,
      isOwner: false,
      haveBid: false,
      auctionStatuses: {
        notStarted: 0,
        live: 1,
        noCancel: 2,
        ended: 3,
        finalized: 4,
      },
      currentAuctionStatus: 0,
      events: [],
    };
  },
  computed: {
    ...mapGetters([
      'activeKey',
    ]),
    isCurrentUserWinner() {
      if (this.activeKey) {
        const accountHash = CLPublicKey.fromHex(this.activeKey).toAccountRawHashStr();
        return accountHash === this.auctionInfos.current_winner;
      }
      return false;
    },
  },
  watch: {
    nftData: {
      handler: 'refreshData',
      deep: true,
      immediate: true,
    },
    activeKey: {
      handler: 'refreshOwner',
      deep: true,
      immediate: true,
    },
    currentAuctionStatus: 'updateTab',
    auctionData: 'refreshAuction',
  },
  async mounted() {
    this.nft = this.nftData;
    this.auction = this.auctionData;
    await this.fetchAuctionInfos();
  },
  methods: {
    formatCasper(value = undefined) {
      return value ? `${Big(value).toFormat(5)} CSPR` : '- CSPR';
    },
    updateTab() {
      if (this.currentAuctionStatus === 0 || this.currentAuctionStatus === 4) {
        this.tab = null;
      } else if (this.currentAuctionStatus < 3) {
        this.tab = 0;
      } else {
        this.tab = 3;
      }
    },
    async refreshOwner() {
      const auctionOwner = (await (await fetch(`${DATA_API}/contracts?select=from&hash=eq.${this.auctionData.hash}`)).json())[0]?.from;

      this.isOwner = auctionOwner === this.activeKey;
      if (this.activeKey) {
        const str = await getStateRootHash();
        const userBid = await getDictionaryItemByURef(
          str,
          this.auctionData.hash,
          CLPublicKey.fromHex(this.activeKey).toAccountHashStr().slice(13),
          'bids_key',
        );
        this.haveBid = userBid.result?.stored_value?.CLValue?.parsed;
      }
    },
    async fetchAuctionInfos() {
      this.loadingAuctionInfos = true;
      console.log(await this.getInitialValue('english_format'));
      const format = (await this.getInitialValue('english_format')) ? 'English' : 'Dutch';
      const marketplace = `account-hash-${await this.getInitialValue('marketplace_account')}`;
      const marketplaceCommission = await this.getInitialValue('marketplace_commission');
      let minimumBidStep = await this.getInitialValue('minimum_bid_step');
      const startingPrice = await this.getInitialValue('starting_price');
      const reservePrice = await this.getInitialValue('reserve_price');
      const startTime = new Date(await this.getInitialValue('start_time'));
      const cancelTime = new Date(await this.getInitialValue('cancellation_time', true));
      const endTime = new Date(await this.getInitialValue('end_time', true));
      const auctionTimerExtension = await this.getInitialValue('auction_timer_extension');
      const tokenOwner = (await this.getInitialValue('token_owner')).Account;
      const beneficiaryAccount = (await this.getInitialValue('beneficiary_account')).Account;
      const currentWinner = await this.getInitialValue('current_winner', true);
      const bidderCountCap = await this.getInitialValue('bidder_count_cap');
      const winningBid = await this.getInitialValue('winning_bid', true);
      const finalized = await this.getInitialValue('finalized', true);
      const auctionEventsCount = await this.getInitialValue('auction_events_count', true);
      const str = await getStateRootHash();
      this.currentBids = (await getDictionaryItemByURef(str, this.auctionData.hash, 'len', 'bids_index')).result?.stored_value?.CLValue?.parsed || 0;
      const events = [];
      if (auctionEventsCount) {
        for (let i = auctionEventsCount - 1; i > -1; i--) {
          // eslint-disable-next-line no-await-in-loop
          events.push((await getDictionaryItemByURef(
            str,
            this.auctionData.hash,
            `${i}`,
            'auction_events',
          )).result?.stored_value?.CLValue?.parsed);
        }
      }
      this.events = events;
      this.auctionInfos = {
        format,
        marketplace,
        marketplace_commission: marketplaceCommission,
        reserve_price: this.formatCasper(reservePrice),
        start_time: `${startTime.toLocaleDateString()} ${startTime.toLocaleTimeString()}`,
        end_time: `${endTime.toLocaleDateString()} ${endTime.toLocaleTimeString()}`,
        token_owner: tokenOwner,
        beneficiary_account: beneficiaryAccount,
        current_winner: currentWinner || 'No current winner',
        winning_bid: winningBid ? this.formatCasper(winningBid) : 'No winning bid',
        auction_events_count: auctionEventsCount,
      };
      if (format !== 'English') {
        this.auctionInfos.starting_price = this.formatCasper(startingPrice);
      }
      if (!minimumBidStep) {
        minimumBidStep = 1;
      }
      this.auctionInfos.minimum_bid_step = this.formatCasper(minimumBidStep);
      if (auctionTimerExtension) {
        this.auctionInfos.auction_timer_extension = `${auctionTimerExtension}s`;
      }
      if (bidderCountCap) {
        this.auctionInfos.bidder_count_cap = bidderCountCap;
      }

      if (format !== 'English') {
        this.minBid = Big(startingPrice);
      } else {
        this.minBid = winningBid
          ? Big(winningBid).plus(Big(minimumBidStep)).toString()
          : Big(reservePrice).plus(Big(minimumBidStep)).toString();
      }

      const countdownID = setInterval(() => {
        // Find the distance between now and the count-down date
        const distance = endTime - Date.now();

        // Time calculations for days, hours, minutes and seconds
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        const daysString = days > 0 ? `${days}d ` : '';
        this.countdown = `${daysString}${hours}h ${
          minutes}m ${seconds}s remaining`;

        let cancelTimeText = '';
        if (Date.now() > cancelTime.getTime() || finalized) {
          this.cancelTab = `Cancellation time expired at ${cancelTime.toLocaleDateString()} ${cancelTime.toLocaleTimeString()}`;
          cancelTimeText = 'Not anymore';
        } else if (Date.now() < startTime.getTime()) {
          this.cancelTab = 'Auction not yet started';
          cancelTimeText = `Not until ${startTime.toLocaleDateString()} ${startTime.toLocaleTimeString()}`;
        } else {
          cancelTimeText = `Yes until ${cancelTime.toLocaleDateString()} ${cancelTime.toLocaleTimeString()}`;
        }

        let auctionStatus = 'Live';
        let auctionStatusColor = 'active';
        let currentAuctionStatus = this.auctionStatuses.live;
        if (Date.now() < startTime.getTime()) {
          auctionStatus = 'Not yet started';
          auctionStatusColor = '';
          currentAuctionStatus = this.auctionStatuses.notStarted;
        }
        if (Date.now() > cancelTime.getTime()) {
          auctionStatus = 'Live - Can\'t be cancelled anymore';
          auctionStatusColor = 'positive';
          currentAuctionStatus = this.auctionStatuses.noCancel;
        }
        if (Date.now() > endTime.getTime()) {
          auctionStatus = 'Ended. Waiting for finalization';
          auctionStatusColor = 'intermediary';
          currentAuctionStatus = this.auctionStatuses.ended;
        } else {
          this.finalizeTab = 'Auction isn\'t ended yet';
        }
        if (finalized) {
          auctionStatus = 'Finalized';
          auctionStatusColor = 'positive';
          this.finalizeTab = 'Auction is already finalized';
          this.cancelTab = 'Auction is already finalized';
          currentAuctionStatus = this.auctionStatuses.finalized;
        }
        this.auctionStatus = auctionStatus;
        this.auctionStatusColor = auctionStatusColor;
        this.auctionInfos.can_be_cancelled = cancelTimeText;
        this.currentAuctionStatus = currentAuctionStatus;

        if (distance < 0) {
          clearInterval(countdownID);
          this.countdown = 'Auction ended';
        }
      }, 1000);
      this.loadingAuctionInfos = false;
    },
    async getInitialValue(namedKey, force = false) {
      const name = this.auction.named_keys?.filter((n) => n.name === namedKey);
      if (name[0] && name[0].initial_value && !force) {
        return name[0].initial_value;
      }
      return name[0]
        ? (await getItem(name[0].uref, await getStateRootHash()))
          .result?.stored_value?.CLValue?.parsed
        : undefined;
    },
    capitalizeFirstLetter(string) {
      return string.charAt(0).toUpperCase() + string.slice(1).replaceAll('_', ' ');
    },
    refreshData(val) {
      this.nft = val;
    },
    refreshAuction(val) {
      this.auction = val;
    },
  },
};
</script>
