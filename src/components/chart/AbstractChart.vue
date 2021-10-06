<template>
  <canvas ref="chartContainer" />
</template>

<script>
import { Chart } from 'chart.js';

Chart.defaults.font.family = 'Roboto, sans-serif';

export default {
  name: 'AbstractChart',
  props: {
    chartType: {
      required: true,
      type: String,
    },
    chartData: {
      type: Object,
      default: () => ({}),
    },
    chartOptions: {
      type: Object,
      default: () => ({}),
    },
  },
  data: () => ({
    chart: undefined,
  }),
  computed: {
    mergedOptions() {
      return {
        ...this.chartOptions,
        plugins: {
          ...(this.chartOptions.plugins || {}),
          legend: {
            ...(this.chartOptions.plugins?.legend || {}),
            labels: {
              padding: 20,
              font: { size: 14 },
              color: 'rgba(255, 255, 255, 0.9)',
              usePointStyle: true,
              ...(this.chartOptions.plugins?.legend?.labels || {}),
            },
          },
          tooltip: {
            position: 'average',
            titleFontSize: 15,
            bodyFontSize: 14,
            bodySpacing: 6,
            displayColors: false,
            backgroundColor: '#616161',
            xPadding: 16,
            yPadding: 8,
            caretPadding: 10,
            caretSize: 0,
            ...(this.chartOptions.plugins?.tooltip || {}),
          },
        },
      };
    },
  },
  watch: {
    chartData: {
      handler: 'updateChart',
      deep: true,
    },
    mergedOptions: {
      handler: 'updateChart',
      deep: true,
    },
  },
  mounted() {
    this.mountChart();
  },
  destroyed() {
    this.destroyChart();
  },
  methods: {
    mountChart() {
      this.chart = new Chart(this.$refs.chartContainer, {
        type: this.chartType,
        data: this.chartData,
        options: this.mergedOptions,
      });
    },
    updateChart() {
      this.chart.data = this.chartData;
      this.chart.options = this.mergedOptions;

      this.chart.update('none');
    },
    destroyChart() {
      if (this.chart) {
        this.chart.destroy();
        this.chart = undefined;
      }
    },
  },
};
</script>
