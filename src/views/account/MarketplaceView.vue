<template>
  <v-card
    class="align-center rounded-xl secondary"
    width="100%"
  >
    <v-card-title class="align-center">
      <v-avatar
        class="mr-4"
        color="primary"
        size="52"
      >
        <v-icon size="24">
          {{ mdiShopping }}
        </v-icon>
      </v-avatar>
      Marketplace
    </v-card-title>
    <v-divider />
    <NFTAuctions />
  </v-card>
</template>

<script>
import NFTAuctions from '@/components/account/nft/auctions/NFTAuctions.vue';
import { mdiShopping } from '@mdi/js';

export default {
  name: 'MarketplaceView',
  components: { NFTAuctions },
  data() {
    return {
      mdiShopping,
    };
  },
};
</script>
