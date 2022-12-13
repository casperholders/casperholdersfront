<template>
  <div v-if="totalNFTs > 0">
    <v-card>
      <v-card-title>
        <v-avatar>
          <v-icon>mdi-image</v-icon>
        </v-avatar>
        NFT Collection
      </v-card-title>
      <v-card-text>
        <div class="d-flex justify-space-evenly flex-wrap">
          <template
            v-for="(nft, i) in nfts"
          >
            <n-f-t-item
              :key="i"
              :nft-data="nft"
            />
          </template>
        </div>
      </v-card-text>
    </v-card>
    <pagination-component
      v-if="pagination"
      v-model="page"
      :max="totalPages"
    />
  </div>
</template>

<script>
import NFTItem from '@/components/account/nft/NFTItem';
import PaginationComponent from '@/components/account/nft/PaginationComponent';
import { DATA_API } from '@/helpers/env';
import retrieveNft from '@/helpers/nft/retrieveNft';
import parseContentRange from '@/helpers/parseContentRange.js';
import { getStateRootHash } from '@/helpers/rpc';
import debounce from 'lodash.debounce';

export default {
  name: 'NFTSlideGroup',
  components: { PaginationComponent, NFTItem },
  props: {
    contractHash: {
      type: Array,
      required: true,
    },
    metadataUref: {
      type: String,
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
  }),
  computed: {
    totalPages() {
      return Math.ceil(this.totalNFTs / this.itemsPerPage);
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
