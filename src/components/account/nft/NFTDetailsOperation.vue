<template>
  <v-row
    no-gutters
    class="mb-3"
    style="border: thin solid rgba(255, 255, 255, 0.12)"
  >
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
import { getAnimation, getDescription, getImage, getName } from '@/helpers/nft/retrieveNft';

export default {
  name: 'NFTDetailsOperation',
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
