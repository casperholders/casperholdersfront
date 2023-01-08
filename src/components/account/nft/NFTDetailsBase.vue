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
            data-cy="closeNFTDetails"
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
import { getAnimation, getDescription, getImage, getName } from '@/helpers/nft/retrieveNft';
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
