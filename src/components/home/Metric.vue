<template>
  <v-card
    class="rounded-xl mx-auto"
    color="secondary"
  >
    <v-card-title class="align-center">
      <v-avatar
        color="primary"
        size="52"
      >
        <v-icon>mdi-heart-pulse</v-icon>
      </v-avatar>
      <v-card-title class="pl-4">
        {{ name }} Operations
      </v-card-title>
    </v-card-title>
    <p
      class="text-center"
      style="width: 100%"
    >
      {{ (value.reduce((a, b) => a + b, 0) / value.length).toFixed(2) || 0 }}
      Operations on average in the last 24h
    </p>
    <v-sheet color="transparent">
      <v-sparkline
        :auto-line-width="autoLineWidth"
        :fill="fill"
        :gradient="gradient"
        :gradient-direction="gradientDirection"
        :line-width="width"
        :padding="padding"
        :smooth="radius || false"
        :stroke-linecap="lineCap"
        :type="type"
        :value="value"
        auto-draw
      />
    </v-sheet>
  </v-card>
</template>

<script>
/**
 * Single Metric component
 */
export default {
  name: 'Metric',
  props: {
    name: {
      required: true,
      type: String,
      default: '',
    },
    value: {
      required: true,
      type: Array,
      default: () => [0, 0],
    },
  },
  data() {
    return {
      width: 2,
      radius: 10,
      padding: 8,
      lineCap: 'round',
      gradient: ['#af023f', '#00126b'],
      gradientDirection: 'top',
      fill: false,
      type: 'trend',
      autoLineWidth: false,
      transfer: [0, 0],
      staking: [0, 0],
      unstake: [0, 0],
      addBid: [0, 0],
      withdrawBid: [0, 0],
      smartContract: [0, 0],
    };
  },
};
</script>

<style scoped>

</style>
