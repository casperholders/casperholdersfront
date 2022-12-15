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
        <v-icon>mdi-image-frame</v-icon>
      </v-avatar>
      NFTs
    </v-card-title>
    <v-divider />
    <NFTItems />
    <v-divider />
    <card-section-title
      icon="mdi-account"
      title="All NFTs"
    />
    <v-card-text class="text-center">
      <v-btn
        color="primary"
        class="rounded-xl"
      >
        Explore all NFTs on Dive !
      </v-btn>
    </v-card-text>
  </v-card>
</template>

<script>
import NFTItems from '@/components/account/nft/NFTItems';

export default {
  name: 'NFTView',
  components: { NFTItems },
};
</script>

<style scoped>
::v-deep .nft-cards {
  min-height: 200px;
  min-width: 200px;
  width: 200px;
}
</style>
