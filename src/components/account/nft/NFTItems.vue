<template>
  <div data-cy="nft-balance">
    <card-section-title
      icon="mdi-account"
      title="My NFTs"
    >
      <template #action>
        <add-n-f-t-dialog @add="onAddNft">
          <template #activator="{ attrs, on }">
            <v-btn
              data-cy="nft-add-button"
              :disabled="loading"
              title="Track new NFT"
              class="ml-auto"
              icon
              v-bind="attrs"
              v-on="on"
            >
              <v-icon>
                mdi-plus
              </v-icon>
            </v-btn>
          </template>
        </add-n-f-t-dialog>
      </template>
    </card-section-title>
    <div class="px-6 pb-4">
      <add-n-f-t-dialog
        v-if="tokens.length === 0"
        @add="onAddNft"
      >
        <template #activator="{ attrs, on }">
          <v-card
            data-cy="nft-add-card"
            class="nft-cards d-flex align-center justify-center"
            color="primary"
            v-bind="attrs"
            v-on="on"
          >
            <v-btn
              color="secondary"
              class="rounded-xl"
            >
              <v-icon left>
                mdi-plus
              </v-icon>
              Add NFT
            </v-btn>
          </v-card>
        </template>
      </add-n-f-t-dialog>
      <template
        v-for="t in tokens.filter((t) => t.groupId === 'nftcep78')"
      >
        <n-f-t-c-e-p78-slide-group
          :key="t.id"
          :name="t.shortName + ' - ' + t.name"
          :contract-hash="[t.id]"
          style="width: 100%"
          :metadata-uref="t.metadata"
          :named-keys="t.namedKeys"
          @delete="onRemoveNft"
        />
      </template>
      <template
        v-for="t in tokens.filter((t) => t.groupId === 'nftcep47')"
      >
        <n-f-t-slide-group
          :key="t.id"
          :name="t.shortName + ' - ' + t.name"
          style="width: 100%"
          :metadata-uref="t.metadata"
          :contract-hash="[t.id]"
          @delete="onRemoveNft"
        />
        <!--
          todo
          get
          all
          contract
          hashes
          -->
      </template>
    </div>
  </div>
</template>

<script>
import CardSectionTitle from '@/components/account/CardSectionTitle';
import AddNFTDialog from '@/components/account/nft/AddNFTDialog';
import NFTCEP78SlideGroup from '@/components/account/nft/NFTCEP78SlideGroup';
import NFTSlideGroup from '@/components/account/nft/NFTSlideGroup';
import fetchTokens from '@/services/tokens/fetchTokens';
import useNftTrackedTokens from '@/services/tokens/useNftTrackedTokens';
import { mapState } from 'vuex';

/**
 * Component to display NFTs.
 */
export default {
  name: 'NFTItems',
  components: {
    NFTSlideGroup,
    NFTCEP78SlideGroup,
    AddNFTDialog,
    CardSectionTitle,
  },
  data: () => ({
    loading: false,
    /**
     * The currently tracked tokens.
     */
    tokens: [],
  }),
  computed: {
    ...mapState([
      'signer',
    ]),
  },
  watch: {
    /**
     * Watch the state of the active key. In case of an update, re-fetch the data.
     */
    'signer.activeKey': {
      handler: 'onActiveKeyChange',
      immediate: true,
    },
  },
  methods: {
    /**
     * On active key init or change.
     */
    onActiveKeyChange() {
      this.tokens = [];

      this.fetchTokensFromStore();
    },
    /**
     * Fetch already tracked tokens from the local storage.
     *
     * @returns {Promise<void>}
     */
    async fetchTokensFromStore() {
      const tokensIds = useNftTrackedTokens(this.signer.activeKey).get() || [];
      if (tokensIds.length) {
        this.loading = true;

        const { data } = await fetchTokens({ ids: tokensIds });

        this.tokens = data;

        this.loading = false;
      }
    },
    /**
     * Save the tokens state to store.
     */
    saveTokensToStore() {
      useNftTrackedTokens(this.signer.activeKey).set(this.tokens.map(({ id }) => id));
    },
    /**
     * Handle an addition of a token and fetch its balance.
     *
     * @param {object[]} tokens
     */
    onAddNft(tokens) {
      console.log(tokens);
      const filteredTokens = tokens.filter((t) => !this.tokens.some(({ id }) => id === t.id));
      if (filteredTokens.length) {
        this.tokens.push(...filteredTokens);

        this.saveTokensToStore();
      }
    },
    /**
     * Handle a removal of a token.
     *
     * @param {object} token
     */
    onRemoveNft(tokens) {
      tokens.forEach((t) => {
        const index = this.tokens.findIndex(({ id }) => id === t);
        if (index !== -1) {
          this.tokens.splice(index, 1);
        }
      });
      this.saveTokensToStore();
    },
  },
};
</script>
