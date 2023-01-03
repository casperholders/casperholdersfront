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
                  :can-be-burned="canBeBurned"
                  :can-be-transferred="canBeTransferred"
                  @showDetails="showDetails = true; showDetailsNft = nft;"
                  @showTransfer="showTransfer = true; showTransferNft = nft;"
                  @showBurn="showBurn = true; showBurnNft = nft;"
                />
              </template>
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
      v-if="identifierMode !== undefined && identifierMode === 1"
      type="warning"
    >
      CEP78 NFTs Collections that use the Hash Identifier Mode aren't supported yet.
    </v-alert>
    <v-alert
      v-else-if="emptyResults"
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
        :token="token"
        @closeBurn="showBurn = false; showBurnNft = null;"
      />
    </v-slide-y-transition>
  </v-card>
</template>

<script>
import NFTItem from '@/components/account/nft/NFTItem';
import PaginationComponent from '@/components/account/nft/PaginationComponent';
import retrieveNft from '@/helpers/nft/retrieveNft';
import { getDictionaryItemByURef, getItem, getStateRootHash } from '@/helpers/rpc.js';
import findTokenGroup from '@/services/tokens/findTokenGroup';
import tokensGroups from '@/services/tokens/tokensGroups';
import { concat } from '@ethersproject/bytes';
import blake from 'blakejs';
import { Buffer } from 'buffer';
import { CLPublicKey, CLValueBuilder, CLValueParsers } from 'casper-js-sdk';
import debounce from 'lodash.debounce';
import { mapState } from 'vuex';

export default {
  name: 'NFTSlideGroup',
  components: { PaginationComponent, NFTItem },
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
    currentNFTS: [],
    ownedTokens: [],
    emptyResults: false,
    identifierMode: undefined,
    loading: true,
    showDetails: false,
    showDetailsNft: null,
    showTransfer: false,
    showTransferNft: null,
    showBurn: false,
    showBurnNft: null,
  }),
  computed: {
    totalPages() {
      return Math.ceil(this.totalNFTs / this.itemsPerPage);
    },
    showSomething() {
      return this.showDetails || this.showTransfer || this.showBurn;
    },
    getCurrentNFTS() {
      const offset = (this.page - 1) * this.itemsPerPage;
      return this.nfts.slice(offset, offset + this.itemsPerPage);
    },
    metadataUref() {
      return this.token.metadata;
    },
    canBeBurned() {
      return this.token.canBeBurned;
    },
    canBeTransferred() {
      return this.token.canBeTransferred;
    },
    contractHash() {
      return [this.token.id];
    },
    name() {
      return `${this.token.shortName} - ${this.token.name}`;
    },
    tokenGroup() {
      return findTokenGroup(this.token.groupId);
    },
    namedKeys() {
      return this.token.namedKeys;
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
      return name[0]
        ? (await getItem(name[0].uref, await getStateRootHash()))
          .result?.stored_value?.CLValue?.parsed
        : undefined;
    },
    async fetchNewNfts() {
      this.nfts = [];
      this.totalNFTs = 0;
      await this.fetchNFTs();
    },
    async getOwnedTokens() {
      const uref = CLPublicKey.fromHex(this.signer.activeKey).toAccountHashStr().slice(13);
      const str = await getStateRootHash();
      const ownedTokens = await getDictionaryItemByURef(str, this.token.id, uref, this.tokenGroup === tokensGroups.nftcep47 ? 'balances' : 'owned_tokens');
      if (ownedTokens.result?.stored_value?.CLValue?.parsed) {
        if (typeof ownedTokens.result?.stored_value?.CLValue?.parsed === 'string') {
          return this.retrieveCep47TokenIDs(str, ownedTokens.result.stored_value.CLValue.parsed);
        }
        return ownedTokens.result?.stored_value?.CLValue?.parsed;
      }
      return [];
    },
    keyAndValueToHex(key, value) {
      const aBytes = CLValueParsers.toBytes(key).unwrap();
      const bBytes = CLValueParsers.toBytes(value).unwrap();

      const blaked = blake.blake2b(concat([aBytes, bBytes]), undefined, 32);
      const hex = Buffer.from(blaked).toString('hex');

      return hex;
    },
    async retrieveCep47TokenIDs(str, ownedTokens) {
      const indexes = Array.from(Array(Number(ownedTokens)).keys());

      for (let i = 0; i < indexes.length; i++) {
        const uref = this.keyAndValueToHex(
          CLValueBuilder.key(CLPublicKey.fromHex(this.signer.activeKey)),
          CLValueBuilder.u256(indexes[i]),
        );
        indexes[i] = getDictionaryItemByURef(str, this.token.id, uref, 'owned_tokens_by_index')
          .then((r) => r.result?.stored_value?.CLValue?.parsed);
      }
      return Promise.all(indexes);
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
            retrieveNft(
              srh,
              this.token.id,
              `${this.ownedTokens[i]}`,
              this.tokenGroup === tokensGroups.nftcep47 ? 'metadata' : this.metadataUref,
              this.tokenGroup !== tokensGroups.nftcep47,
            ).then((nft) => {
              if (nft) {
                // eslint-disable-next-line no-param-reassign
                nft.token_id = this.ownedTokens[i];
                return nft;
              }
              return undefined;
            }),
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
