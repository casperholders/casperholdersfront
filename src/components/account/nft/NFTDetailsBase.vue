<template>
  <v-row no-gutters>
    <v-col
      cols="12"
      md="6"
    >
      <v-img
        v-if="!getAnimation"
        cover
        :src="getImage"
      />
      <div
        v-if="getAnimation"
        class="fill-height"
      >
        <video
          v-if="getAnimation"
          controls
          style="height: 100%; width: 100%; margin-bottom: -7px;"
        >
          <source
            :src="getAnimation"
          >
        </video>
      </div>
    </v-col>
    <v-col
      cols="12"
      md="6"
    >
      <v-row
        class="mt-1"
        no-gutters
      >
        <v-col
          cols="auto"
          class="mr-auto"
          style="max-width: 74%"
        >
          <v-card-title class="text-wrap">
            {{ getName }}
          </v-card-title>
          <v-card-subtitle class="text-wrap">
            {{ getDescription }}
          </v-card-subtitle>
        </v-col>
        <v-col
          cols="auto"
          class="d-flex mr-4 my-auto"
        >
          <v-btn
            title="Close NFT"
            text
            icon
            color="background"
            @click="$emit('closeDetailsBase')"
          >
            <v-icon>
              {{ mdiClose }}
            </v-icon>
          </v-btn>
        </v-col>
      </v-row>
      <slot />
    </v-col>
  </v-row>
</template>

<script>
import { mdiClose } from '@mdi/js';

export default {
  name: 'NFTDetailsBase',
  props: {
    nftData: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      mdiClose,
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
