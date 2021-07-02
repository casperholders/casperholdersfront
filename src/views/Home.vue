<template>
  <v-container
    fill-height
    class="container__small"
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
      large
      color="tertiary"
      rounded
      class="mb-3 mt-10 mx-auto"
      href="https://github.com/KillianH/casperholdersfront"
      target="_blank"
    >
      <v-icon
        left
        large
        class="mr-3"
      >mdi-github
      </v-icon>
      Technical information
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
}
</script>
