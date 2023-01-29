<template>
  <v-card data-cy="nft-auctions">
    <card-section-title
      v-if="!showSomething"
      :icon="mdiImage"
      :title="`Auctions -
      ${page*10 > auctionTotal ? auctionTotal : page*10} out of ${auctionTotal} auctions loaded`"
    >
      <template
        #action
      >
        <v-btn
          data-cy="load-more-auctions"
          title="Load more auctions"
          class="ml-auto rounded-xl"
          color="white"
          outlined
          small
          @click="fetchNFTs"
        >
          <v-icon left>
            {{ mdiReload }}
          </v-icon>
          Load more auctions
        </v-btn>
      </template>
    </card-section-title>
    <template v-if="!emptyResults && !showSomething">
      <v-slide-y-transition leave-absolute>
        <v-card-text>
          <div class="d-flex justify-space-around flex-wrap">
            <template
              v-for="(nft) in nfts.filter(n => !n.finalized)"
            >
              <n-f-t-item
                :key="auctionsData[nft.auctionIndex].hash"
                :data-cy="`collection-${nft.token_hash}-nft-${nft.token_id}`"
                :nft-data="nft"
                :can-be-bid="true"
                @showAuction="showAuction = true;
                              showAuctionNft = nft;
                              showAuctionData = auctionsData[nft.auctionIndex];"
              />
            </template>
          </div>
          <v-expansion-panels>
            <v-expansion-panel>
              <v-expansion-panel-header data-cy="pastAuctions">
                Past auctions ({{ nfts.filter(n => n.finalized).length }})
              </v-expansion-panel-header>
              <v-expansion-panel-content>
                <div class="d-flex justify-space-around flex-wrap">
                  <template
                    v-for="(nft, index) in nfts.filter(n => n.finalized)"
                  >
                    <n-f-t-item
                      :key="auctionsData[nft.auctionIndex].hash"
                      :data-cy="`ended-collection-${nft.token_hash}-nft-${nft.token_id}-${index}`"
                      :nft-data="nft"
                      :can-be-bid="true"
                      @showAuction="showAuction = true;
                                    showAuctionNft = nft;
                                    showAuctionData = auctionsData[nft.auctionIndex];"
                    />
                  </template>
                </div>
              </v-expansion-panel-content>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-card-text>
      </v-slide-y-transition>
    </template>
    <v-alert
      v-else-if="emptyResults"
      data-cy="noNft"
      type="info"
    >
      No live auction at the moment. Check back later !
    </v-alert>
    <v-slide-y-transition hide-on-leave>
      <n-f-t-auction
        v-if="showAuction"
        :nft-data="showAuctionNft"
        :auction-data="showAuctionData"
        @closeBid="showAuction = false; showAuctionNft = null; showAuctionData = null;"
      />
    </v-slide-y-transition>
  </v-card>
</template>

<script>
import CardSectionTitle from '@/components/account/CardSectionTitle.vue';
import NFTAuction from '@/components/account/nft/auctions/NFTAuction.vue';
import NFTItem from '@/components/account/nft/NFTItem.vue';
import { DATA_API } from '@/helpers/env';
import { retrieveNft } from '@/helpers/nft/retrieveNft';
import parseContentRange from '@/helpers/parseContentRange';
import { getItem, getStateRootHash } from '@/helpers/rpc';
import { mdiImage, mdiReload } from '@mdi/js';
import debounce from 'lodash.debounce';

/**
 * Component to display NFTs.
 */
export default {
  name: 'NFTAuctions',
  components: {
    NFTAuction,
    CardSectionTitle,
    NFTItem,
  },
  data: () => ({
    mdiImage,
    mdiReload,
    nfts: [],
    auctionsData: [],
    auctionTotal: 0,
    page: 0,
    emptyResults: false,
    loading: true,
    showAuction: false,
    showAuctionNft: null,
    showAuctionData: null,
  }),
  computed: {
    showSomething() {
      return this.showAuction;
    },
  },
  created() {
    this.debounceFetchNFTs = debounce(this.fetchNFTs, 250);
  },
  async mounted() {
    await this.fetchNFTs();
  },
  methods: {
    async getAuctions() {
      if (this.auctionTotal !== 0 && this.page * 10 > this.auctionTotal) {
        return {
          total: this.auctionTotal,
          data: [],
        };
      }
      const response = await fetch(`${DATA_API}/auctions_list?type=eq.casperprivateauction&limit=10&select=*,named_keys(*)&order=timestamp.desc&offset=${this.page * 10}`, {
        headers: new Headers({
          Prefer: 'count=exact',
          'Range-Unit': 'items',
        }),
      });

      const total = parseContentRange(response.headers.get('Content-Range')).size;
      const data = await response.json();
      return {
        total,
        data,
      };
    },
    async fetchNFTs() {
      if (this.emptyResults === false) {
        const auctions = await this.getAuctions();
        this.auctionsData.push(...auctions.data);
        this.auctionTotal = auctions.total;
        this.page++;
        if (this.auctionTotal === 0) {
          this.emptyResults = true;
        }
      }
      await this.fetchNFTsData();
    },
    async getInitialValue(auction, namedKey, force = false) {
      const name = auction.named_keys?.filter((n) => n.name === namedKey);
      if (name[0] && name[0].initial_value && !force) {
        return name[0].initial_value;
      }
      return name[0]
        ? (await getItem(name[0].uref, await getStateRootHash()))
          .result?.stored_value?.CLValue?.parsed
        : undefined;
    },
    async fetchNFTsData() {
      this.loading = true;
      try {
        const srh = await getStateRootHash();
        const promises = [];
        for (let i = this.nfts.length; i < this.auctionsData.length; i++) {
          let contract = this.auctionsData[i].named_keys.filter((n) => n.name === 'token_contract_hash')[0]?.initial_value;
          if (contract) {
            if (typeof contract === 'object') {
              contract = contract.Hash;
            }
            contract = contract.replace('hash-', '');

            // eslint-disable-next-line no-await-in-loop
            const latestVersion = (await (await fetch(`${DATA_API}/contracts_list?package=eq.${contract.replace('hash-', '')}&limit=1&select=hash&order=timestamp.desc`)).json())[0].hash;
            const tokenId = this.auctionsData[i].named_keys.filter((n) => n.name === 'token_id')[0].initial_value;
            promises.push(
              retrieveNft(
                srh,
                latestVersion,
                `${tokenId}`,
                'metadata',
                false,
              ).then(async (nft) => {
                if (nft) {
                  // eslint-disable-next-line no-param-reassign
                  nft.finalized = await this.getInitialValue(this.auctionsData[i], 'finalized', true);
                  // eslint-disable-next-line no-param-reassign
                  nft.auctionIndex = i;
                  // eslint-disable-next-line no-param-reassign
                  nft.token_hash = contract;
                  // eslint-disable-next-line no-param-reassign
                  nft.token_id = tokenId;
                  return nft;
                }
                return undefined;
              }),
            );
          }
        }
        this.nfts.push(...((await Promise.all(promises)).filter((n) => n)));
      } catch {
        // Ignore error
      }
      this.loading = false;
    },
  },
};
</script>
