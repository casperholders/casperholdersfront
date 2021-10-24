<template>
  <abstract-chart
    chart-type="line"
    :chart-options="mergedOptions"
    v-bind="$attrs"
  />
</template>

<script>
import AbstractChart from '@/components/chart/AbstractChart';
import {
  CategoryScale,
  Chart,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
} from 'chart.js';

Chart.register(CategoryScale, LinearScale, LineController, LineElement, PointElement);

/**
 * Line chart component from the chart.js library
 */
export default {
  name: 'LineChart',
  components: { AbstractChart },
  inheritAttrs: false,
  props: {
    chartOptions: {
      type: Object,
      default: () => ({}),
    },
  },
  computed: {
    mergedOptions() {
      const ticks = { color: 'rgba(255, 255, 255, 0.9)' };
      const grid = {
        drawBorder: false,
        color: 'rgba(255, 255, 255, 0.12)',
      };

      return {
        scales: {
          x: { grid, ticks },
          y: { grid, ticks },
        },
        ...this.chartOptions,
      };
    },
  },
};
</script>

<style>

</style>
