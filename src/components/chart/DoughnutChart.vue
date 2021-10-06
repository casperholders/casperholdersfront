<template>
  <abstract-chart
    chart-type="doughnut"
    v-bind="$attrs"
  />
</template>

<script>
import AbstractChart from '@/components/chart/AbstractChart';
import { ArcElement, Chart, DoughnutController, Legend, Tooltip } from 'chart.js';

Chart.register(ArcElement, DoughnutController, Legend, Tooltip);

/**
 * Donut chart component from the chart.js library
 */
export default {
  name: 'DoughnutChart',
  components: { AbstractChart },
  inheritAttrs: false,
};
</script>

<style>

</style>
