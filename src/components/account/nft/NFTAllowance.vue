<template>
  <n-f-t-details-base
    :nft-data="nft"
    @closeDetailsBase="$emit('closeAllowance')"
  >
    Allowance
  </n-f-t-details-base>
</template>

<script>
import NFTDetailsBase from '@/components/account/nft/NFTDetailsBase.vue';

export default {
  name: 'NFTAllowance',
  components: { NFTDetailsBase },
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
