<template>
  <v-card>
    <card-section-title
      icon="mdi-image"
      :title="name"
    >
      <template #action>
        <v-btn
          data-cy="nft-remove-collection"
          title="Untrack NFT collection"
          class="ml-auto"
          icon
          @click="$emit('delete', contractHash)"
        >
          <v-icon>
            mdi-delete
          </v-icon>
        </v-btn>
      </template>
    </card-section-title>
    <template v-if="totalNFTs > 0 && !showSomething">
      <v-slide-y-transition leave-absolute>
        <v-card-text>
          <div class="d-flex justify-space-evenly flex-wrap">
            <template
              v-for="(nft, i) in nfts"
            >
              <n-f-t-item
                :key="i"
                :nft-data="nft"
                @showDetails="showDetails = true; showDetailsNft = nft;"
                @showTransfer="showTransfer = true; showTransferNft = nft;"
                @showBurn="showBurn = true; showBurnNft = nft;"
                @showAllowance="showAllowance = true; showAllowanceNft = nft;"
              />
            </template>
          </div>
          <pagination-component
            v-if="pagination"
            v-model="page"
            :max="totalPages"
          />
        </v-card-text>
      </v-slide-y-transition>
    </template>
    <v-alert
      v-else-if="totalNFTs === 0"
      type="info"
    >
      You don't own any nft's in this collection.
    </v-alert>
    <v-slide-y-transition hide-on-leave>
      <n-f-t-details
        v-if="showDetails"
        :nft-data="showDetailsNft"
        @closeDetails="showDetails = false; showDetailsNft = null;"
      />
    </v-slide-y-transition>
    <v-slide-y-transition hide-on-leave>
      <n-f-t-transfer
        v-if="showTransfer"
        :nft-data="showTransferNft"
        :token="token"
        @closeTransfer="showTransfer = false; showTransferNft = null;"
      />
    </v-slide-y-transition>
    <v-slide-y-transition hide-on-leave>
      <n-f-t-burn
        v-if="showBurn"
        :nft-data="showBurnNft"
        @closeBurn="showBurn = false; showBurnNft = null;"
      />
    </v-slide-y-transition>
    <v-slide-y-transition hide-on-leave>
      <n-f-t-allowance
        v-if="showAllowance"
        :nft-data="showAllowanceNft"
        @closeAllowance="showAllowance = false; showAllowanceNft = null;"
      />
    </v-slide-y-transition>
  </v-card>
</template>

<script>
import NFTAllowance from '@/components/account/nft/NFTAllowance.vue';
import NFTBurn from '@/components/account/nft/NFTBurn.vue';
import NFTDetails from '@/components/account/nft/NFTDetails.vue';
import NFTItem from '@/components/account/nft/NFTItem';
import NFTTransfer from '@/components/account/nft/NFTTransfer.vue';
import PaginationComponent from '@/components/account/nft/PaginationComponent';
import { DATA_API } from '@/helpers/env';
import retrieveNft from '@/helpers/nft/retrieveNft';
import parseContentRange from '@/helpers/parseContentRange.js';
import { getStateRootHash } from '@/helpers/rpc';
import debounce from 'lodash.debounce';

export default {
  name: 'NFTSlideGroup',
  components: { NFTAllowance, NFTBurn, NFTTransfer, NFTDetails, PaginationComponent, NFTItem },
  props: {
    token: {
      type: Object,
      required: true,
    },
    pagination: {
      type: Boolean,
      default: true,
    },
  },
  data: () => ({
    dialogs: {},
    totalNFTs: 0,
    itemsPerPage: 10,
    page: 1,
    nfts: [],
    emptyResults: false,
    showDetails: false,
    showDetailsNft: null,
    showTransfer: false,
    showTransferNft: null,
    showBurn: false,
    showBurnNft: null,
    showAllowance: false,
    showAllowanceNft: null,
  }),
  computed: {
    totalPages() {
      return Math.ceil(this.totalNFTs / this.itemsPerPage);
    },
    showSomething() {
      return this.showDetails || this.showTransfer || this.showBurn || this.showAllowance;
    },
    metadataUref() {
      return this.token.metadata;
    },
    contractHash() {
      return [this.token.id];
    },
    name() {
      return `${this.token.shortName} - ${this.token.name}`;
    },
  },
  watch: {
    page() {
      this.debounceFetchNFTs();
    },
  },
  created() {
    this.debounceFetchNFTs = debounce(this.fetchNFTs, 250);
  },
  async mounted() {
    await this.fetchNFTs();
  },
  methods: {
    async fetchNFTs() {
      this.emptyResults = false;
      const offset = (this.page - 1) * this.itemsPerPage;
      const events = await fetch(`${DATA_API}/deploys?limit=${this.itemsPerPage}&offset=${offset}&contract_hash=in.(${this.contractHash.join(',')})&or=(metadata_type.eq.mint,metadata_type.eq.mint_copies)&events=neq.null&result=eq.true&order=timestamp.desc`, {
        method: 'GET',
        headers: new Headers({
          'Range-Unit': 'items',
          Prefer: 'count=exact',
        }),
      });

      this.totalNFTs = parseContentRange(events.headers.get('content-range')).size;
      const nfts = (await events.json()).map((e) => e.events).flat();
      if (this.nfts.length === 0) {
        this.emptyResults = true;
      }
      await this.fetchNFTsData(nfts);
    },
    async fetchNFTsData(nfts) {
      const srh = await getStateRootHash();
      const fetchedNfts = await Promise.all(nfts.map(async (nft) => {
        const nftData = await retrieveNft(srh, nft.token_id, this.metadataUref);
        if (nftData) {
          nftData.token_id = nftData.token_id || nft.token_id;
          return nftData;
        }
        return undefined;
      }));
      this.nfts = fetchedNfts.filter((nft) => nft);
    },
  },
};
</script>
