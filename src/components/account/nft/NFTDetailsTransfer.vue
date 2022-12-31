<template>
  <v-row no-gutters
         style="border: thin solid rgba(255, 255, 255, 0.12)">
    <v-col
      cols="12"
      md="3"
      class="d-flex d-md-block justify-space-around"
    >
      <v-img
        v-if="!getAnimation"
        cover
        :src="getImage"
        max-height="200px"
        max-width="200px"
        class="text-center align-center align-content-center"
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
      md="9"
      class="d-flex flex-column d-md-block"
    >
      <v-card-title class="text-wrap d-flex d-md-block justify-space-around">
        {{ getName }}
      </v-card-title>
      <v-card-subtitle class="text-wrap d-flex d-md-block  justify-space-around">
        test {{ getDescription }}
      </v-card-subtitle>
    </v-col>
  </v-row>
</template>

<script>
export default {
  name: 'NFTDetailsTransfer',
  props: {
    nftData: {
      type: Object,
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
