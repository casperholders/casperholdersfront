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
                title="Open NFT"
                icon
                color="white"
                aria-label="expand"
                @click="$emit('showDetails')"
              >
                <v-icon>
                  mdi-arrow-expand-all
                </v-icon>
              </v-btn>
              <v-btn
                v-if="!nft.burn && canBeTransferred"
                title="Transfer NFT"
                icon
                color="white"
                aria-label="transfer"
                @click="$emit('showTransfer')"
              >
                <v-icon>
                  mdi-send
                </v-icon>
              </v-btn>
              <v-btn
                v-if="canBeBurned"
                title="Burn NFT"
                :icon="!nft.burn"
                :text="nft.burn"
                :color="nft.burn ? 'red' : 'white'"
                aria-label="burn"
                :class="{'disable-events': nft.burn}"
                @click="$emit('showBurn')"
              >
                <v-icon>
                  mdi-fire
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
      nft: this.nftData,
    };
  },
  computed: {
    getImage() {
      if (this.nft.loading === false) {
        if (this.nft.metadata?.get('image')) {
          const image = this.nft.metadata.get('image').replace('ipfs://', 'https://gateway.ipfs.io/ipfs/');
          return image.match(/^http(s)*:\/\//) ? image : `https://gateway.ipfs.io/ipfs/${image}`;
        }
        if (this.nft.metadata?.get('ipfs_url')) {
          return this.nft.metadata.get('ipfs_url').replace('ipfs://', 'https://gateway.ipfs.io/ipfs/');
        }
        if (this.nft.metadata?.get('pictureIpfs')) {
          return `https://gateway.ipfs.io/ipfs/${this.nft.metadata.get('pictureIpfs').replace('ipfs://', '')}`;
        }
        if (this.nft.metadata?.get('asset') && !this.nft.metadata?.get('asset').match(/\.json$/)) {
          return this.nft.metadata.get('asset').replace('ipfs://', 'https://gateway.ipfs.io/ipfs/');
        }
        if (this.getAnimation) {
          return '/movie-open.svg';
        }
      }
      return '/image-off.svg';
    },
    getAnimation() {
      if (this.nft) {
        if (this.nft.metadata?.get('animation_url')) {
          return this.nft.metadata.get('animation_url').replace('ipfs://', 'https://gateway.ipfs.io/ipfs/');
        }
      }
      return null;
    },
    getName() {
      if (this.nft.metadata?.get('name')) {
        return this.nft.metadata.get('name');
      }
      return this.nft.token_id;
    },
    getDescription() {
      if (this.nft.metadata?.get('description')) {
        return this.nft.metadata.get('description');
      }
      if (this.nft.metadata?.get('name')) {
        return this.nft.token_id;
      }
      return this.nft.metadata?.get('name');
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
