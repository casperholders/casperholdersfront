<template>
  <v-container
    class="container__small"
    fill-height
  >
    <div
      class="mx-auto text-h3 mt-12 mb-6 text-center text--white pb-4"
      style="z-index: 1"
    >
      Welcome to Casper Holders
    </div>
    <div
      class="mx-auto text-h5 mb-8 text-center text--white pb-6"
      style="z-index: 1"
    >
      <p>
        The first third party UI to interact with the Casper Blockchain.
      </p>
    </div>
    <Features />
    <Roadmap />
    <Metrics />
    <v-btn
      class="mb-3 mt-10 mx-auto"
      color="tertiary"
      href="https://github.com/casperholders/casperholdersfront"
      large
      rounded
      target="_blank"
    >
      <v-icon
        class="mr-3"
        large
        left
      >mdi-github
      </v-icon>
      Technical information
    </v-btn>
    <v-btn
      class="mb-3 mt-10 mx-auto"
      color="secondary"
      :href="swapCasperHoldersUrl"
      large
      rounded
    >
      <v-icon
        class="mr-3"
        large
        left
      >mdi-swap-horizontal-bold
      </v-icon>
      Switch to {{ swapNetworkName }}
    </v-btn>
  </v-container>
</template>

<script>

import Metrics from "@/components/home/Metrics";
import Roadmap from "@/components/home/Roadmap";
import Features from "@/components/home/Features";

export default {
    name: 'Home',
    components: {Metrics, Roadmap, Features},
    computed: {
        swapNetworkName() {
            return this.$getNetwork() === "casper" ? "TestNet" : "MainNet"
        },
        swapCasperHoldersUrl() {
            return this.$getNetwork() === "casper" ? "https://testnet.casperholders.io" : "https://casperholders.io"
        }
    }
}
</script>
