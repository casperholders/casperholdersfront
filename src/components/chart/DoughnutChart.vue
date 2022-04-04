<template>
  <abstract-chart
    chart-type="doughnut"
    v-bind="$attrs"
  />
</template>

<script>
import AbstractChart from '@/components/chart/AbstractChart';
import { ArcElement, Chart, DoughnutController } from 'chart.js';

Chart.register(ArcElement, DoughnutController);

/**
 * Donut chart component from the chart.js library
 */
export default {
  name: 'DoughnutChart',
  components: { AbstractChart },
  inheritAttrs: false,
};
</script>
