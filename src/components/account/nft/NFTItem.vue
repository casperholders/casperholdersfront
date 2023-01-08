<template>
  <v-hover
    v-slot="{ hover }"
    open-delay="200"
  >
    <v-card
      color="background"
      class="mt-5 fill-height position-relative"
      min-width="200"
      max-width="200"
      min-height="200"
      max-height="200"
      @focus="hover = true"
      @blur="hover = false"
    >
      <v-img
        v-if="!getAnimation"
        cover
        min-width="200"
        max-width="200"
        min-height="200"
        max-height="200"
        :src="getImage"
      />
      <video
        v-if="getAnimation"
        autoplay
        loop
        muted
        :src="getAnimation"
        style="min-height: 200px; min-width: 200px; max-height: 200px; max-width: 200px;"
      />

      <v-fade-transition>
        <v-overlay
          v-if="hover"
          absolute
        >
          <v-sheet
            min-width="200"
            max-width="200"
            min-height="200"
            max-height="200"
            color="rgb(0,0,0,0.8)"
          >
            <v-card-title class="text-white">
              {{ getName }}
            </v-card-title>
            <v-card-subtitle
              v-if="getDescription"
              class="text-wrap text-white"
              style="max-height: 40%"
            >
              {{ getDescription }}
            </v-card-subtitle>
            <v-spacer />
            <v-card-actions class="justify-center">
              <v-btn
                data-cy="openNFT"
                title="Open NFT"
                icon
                color="white"
                aria-label="expand"
                @click="$emit('showDetails')"
              >
                <v-icon>
                  {{ mdiArrowExpandAll }}
                </v-icon>
              </v-btn>
              <v-btn
                v-if="!nft.burn && canBeTransferred"
                data-cy="transferNFT"
                title="Transfer NFT"
                icon
                color="white"
                aria-label="transfer"
                @click="$emit('showTransfer')"
              >
                <v-icon>
                  {{ mdiSend }}
                </v-icon>
              </v-btn>
              <v-btn
                v-if="canBeBurned"
                data-cy="burnNFT"
                title="Burn NFT"
                :icon="!nft.burn"
                :text="nft.burn"
                :color="nft.burn ? 'red' : 'white'"
                aria-label="burn"
                :class="{'disable-events': nft.burn}"
                @click="$emit('showBurn')"
              >
                <v-icon>
                  {{ mdiFire }}
                </v-icon>
                {{ nft.burn ? 'Burned' : '' }}
              </v-btn>
            </v-card-actions>
            <v-spacer />
          </v-sheet>
        </v-overlay>
      </v-fade-transition>
    </v-card>
  </v-hover>
</template>

<script>
import { getAnimation, getDescription, getImage, getName } from '@/helpers/nft/retrieveNft';
import { mdiArrowExpandAll, mdiFire, mdiSend } from '@mdi/js';

export default {
  name: 'NFTItem',
  props: {
    nftData: {
      type: Object,
      required: true,
    },
    canBeBurned: {
      type: Boolean,
      required: true,
    },
    canBeTransferred: {
      type: Boolean,
      required: true,
    },
  },
  data() {
    return {
      mdiArrowExpandAll,
      mdiSend,
      mdiFire,
      nft: this.nftData,
    };
  },
  computed: {
    getImage() {
      return getImage(this.nft);
    },
    getAnimation() {
      return getAnimation(this.nft);
    },
    getName() {
      return getName(this.nft);
    },
    getDescription() {
      return getDescription(this.nft);
    },
  },
  watch: {
    nftData: {
      handler: 'refreshData',
      deep: true,
      immediate: true,
    },
  },
  mounted() {
    this.nft = this.nftData;
  },
  methods: {
    refreshData(val) {
      this.nft = val;
    },
  },
};
</script>

<style scoped>
    .disable-events {
        pointer-events: none;
    }
</style>
