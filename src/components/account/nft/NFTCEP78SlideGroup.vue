<template>
  <div>
    <v-alert
      v-if="identifierMode === undefined"
      type="info"
    >
      Loading NFT Collection ...
    </v-alert>
    <v-alert
      v-if="identifierMode !== undefined && identifierMode === 1"
      type="warning"
    >
      CEP78 NFTs Collections that use the Hash Identifier Mode aren't supported yet.
    </v-alert>
    <div v-if="identifierMode !== undefined && identifierMode !== 1">
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
        <v-card-text>
          <div class="d-flex  justify-space-around flex-wrap">
            <template v-if="loading === true">
              <v-card
                v-for="i in (page*itemsPerPage > totalNFTs ?
                  (totalNFTs%itemsPerPage) : itemsPerPage)"
                :key="i"
                :loading="true"
                color="background"
                class="mt-5 fill-height"
                min-width="200"
                max-width="200"
                min-height="200"
                max-height="200"
              />
            </template>
            <template v-if="loading === false">
              <template
                v-for="nft in getCurrentNFTS"
              >
                <n-f-t-item
                  :key="nft.token_id"
                  :nft-data="nft"
                />
              </template>
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
  </div>
</template>

<script>
import NFTItem from '@/components/account/nft/NFTItem';
import PaginationComponent from '@/components/account/nft/PaginationComponent';
import retrieveNft from '@/helpers/nft/retrieveNft';
import { getDictionaryItemByURef, getItem, getStateRootHash } from '@/helpers/rpc.js';
import { CLPublicKey } from 'casper-js-sdk';
import debounce from 'lodash.debounce';
import { mapState } from 'vuex';

export default {
  name: 'NFTCEP78SlideGroup',
  components: { PaginationComponent, NFTItem },
  props: {
    name: {
      type: String,
      required: true,
    },
    contractHash: {
      type: Array,
      required: true,
    },
    namedKeys: {
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
    currentNFTS: [],
    ownedTokens: [],
    emptyResults: false,
    identifierMode: undefined,
    loading: true,
  }),
  computed: {
    totalPages() {
      return Math.ceil(this.totalNFTs / this.itemsPerPage);
    },
    getCurrentNFTS() {
      const offset = (this.page - 1) * this.itemsPerPage;
      return this.nfts.slice(offset, offset + this.itemsPerPage);
    },
    ...mapState([
      'signer',
    ]),
  },
  watch: {
    page() {
      this.loading = true;
      this.debounceFetchNFTs();
    },
    /**
     * Watch the state of the active key. In case of an update, re-fetch the data.
     */
    'signer.activeKey': {
      handler: 'fetchNewNfts',
    },
  },
  created() {
    this.debounceFetchNFTs = debounce(this.fetchNFTs, 250);
  },
  async mounted() {
    this.identifierMode = await this.getInitialValue('identifier_mode');
    if (this.identifierMode !== 1) {
      await this.fetchNFTs();
    }
  },
  methods: {
    async getInitialValue(namedKey, force = false) {
      const name = this.namedKeys?.filter((n) => n.name === namedKey);
      if (name[0] && name[0].initial_value && !force) {
        return name[0].initial_value;
      }
      return (await getItem(name[0].uref, await getStateRootHash()))
        .result?.stored_value?.CLValue?.parsed;
    },
    async fetchNewNfts() {
      this.nfts = [];
      this.totalNFTs = 0;
      await this.fetchNFTs();
    },
    async getOwnedTokens() {
      const ownedTokensDict = this.namedKeys?.filter((n) => n.name === 'owned_tokens')[0]?.uref;
      if (ownedTokensDict) {
        const uref = CLPublicKey.fromHex(this.signer.activeKey).toAccountHashStr().slice(13);
        const str = await getStateRootHash();
        const ownedTokens = await getDictionaryItemByURef(str, uref, ownedTokensDict);
        if (ownedTokens.result?.stored_value?.CLValue?.parsed) {
          return ownedTokens.result?.stored_value?.CLValue?.parsed;
        }
      }
      return [];
    },
    async fetchNFTs() {
      this.emptyResults = false;
      if (this.totalNFTs === 0 && this.emptyResults === false) {
        this.ownedTokens = await this.getOwnedTokens();
        this.totalNFTs = this.ownedTokens.length || 0;
      }
      if (this.totalNFTs === 0) {
        this.emptyResults = true;
      }
      await this.fetchNFTsData();
    },
    async fetchNFTsData() {
      const offset = (this.page - 1) * this.itemsPerPage;
      if (this.nfts.length >= this.totalNFTs || this.nfts.length >= (offset + this.itemsPerPage)) {
        this.loading = false;
        return;
      }
      this.loading = true;
      try {
        const srh = await getStateRootHash();
        const promises = [];
        const upperLimit = offset + this.itemsPerPage;
        const limit = upperLimit > this.totalNFTs ? this.totalNFTs : upperLimit;
        for (let i = offset; i < limit; i++) {
          promises.push(
            retrieveNft(srh, `${this.ownedTokens[i]}`, this.metadataUref),
          );
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
