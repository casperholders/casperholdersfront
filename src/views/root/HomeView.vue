<template>
  <div class="d-flex flex-column justify-center">
    <div class="mx-auto">
      <img
        width="120px"
        :src="logoSvg"
        alt="Div3 Logo"
      >
    </div>
    <div class="d-flex align-center mx-auto text-h3 font-weight-bold text-center text--white">
      Div3
    </div>
    <div class="mx-auto text-h5 text-center text--white pb-6">
      <p>
        The first third party UI to interact with the Casper Blockchain.
      </p>
    </div>
    <FeaturesCards />
  </div>
</template>

<script>

import logoSvg from '@/assets/images/logo.svg';
import FeaturesCards from '@/components/home/FeatureCard.vue';
import {
  mdiAccountCircle,
  mdiAlertCircle,
  mdiCheckboxMarkedCircle,
  mdiContentCopy,
  mdiDownload,
  mdiGithub,
  mdiMinus,
  mdiSwapHorizontalBold,
} from '@mdi/js';
import { mapState } from 'vuex';

/**
 * Home view
 * Holds a small tutorial to create an account on the Casper Signer extension
 * & The Metrics / Roadmap / Features components
 */
export default {
  name: 'HomeView',
  components: { FeaturesCards },
  data: () => ({
    mdiAccountCircle,
    mdiAlertCircle,
    mdiCheckboxMarkedCircle,
    mdiContentCopy,
    mdiDownload,
    mdiGithub,
    mdiMinus,
    mdiSwapHorizontalBold,
    logoSvg,
    carousel: 0,
    dialog: false,
    copied: false,
  }),
  computed: {
    ...mapState(['signer']),
    publicKey() {
      return this.signer.activeKey;
    },
  },
  methods: {
    async connectionRequest() {
      await this.$store.dispatch('openConnectDialog');
    },
    copyPublicKey() {
      navigator.clipboard.writeText(this.signer.activeKey);
      this.copied = true;
      setTimeout(() => {
        this.copied = false;
      }, 2000);
    },
  },
};
</script>
