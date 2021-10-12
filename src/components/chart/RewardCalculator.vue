<template>
  <div>
    <div class="d-flex align-center justify-end body-2 mb-3">
      <span>
        <strong>APY</strong>: {{ formatPercentage(apy) }}
      </span>
      <span class="ml-3">
        <strong>Validator fee</strong>: {{ formatPercentage(validatorFee) }}
      </span>
      <span class="ml-3">
        <strong>Final APY</strong>: {{ formatPercentage(actualApy) }}
      </span>
    </div>
    <v-row
      v-for="({ label, cspr, dollars }, index) in tableData"
      :key="`table-rows-${index}`"
    >
      <v-col
        cols="12"
        sm="6"
      >
        {{ label }}
      </v-col>
      <v-col
        cols="6"
        sm="3"
        class="cspr text-sm-right"
      >
        {{ cspr }} CSPR
      </v-col>
      <v-col
        cols="6"
        sm="3"
        class="cspr text-right"
      >
        $ {{ dollars }}
      </v-col>
    </v-row>
    <v-fade-transition
      tag="div"
      leave-absolute
      group
    >
      <v-layout
        v-if="loading || !hasData"
        key="no-chart"
        style="height: 300px;"
        justify-center
        align-center
      >
        <v-progress-circular
          v-if="loading"
          color="primary"
          size="128"
          width="10"
          indeterminate
        />
        <span
          v-else
        >
          No data for chart
        </span>
      </v-layout>
      <line-chart
        v-else
        key="chart"
        :chart-data="chartData"
        :chart-options="chartOptions"
        style="width: 100%;height: 300px;"
      />
    </v-fade-transition>
  </div>
</template>

<script>
import LineChart from '@/components/chart/LineChart';
import Big from 'big.js';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June', 'July',
  'August', 'September', 'October', 'November', 'December',
];

export default {
  name: 'RewardCalculator',
  components: { LineChart },
  props: {
    validator: {
      type: Object,
      default: undefined,
    },
    amount: {
      type: String,
      default: undefined,
    },
  },
  data: () => ({
    loading: true,
    apy: undefined,
    validatorFee: undefined,
    actualApy: undefined,
  }),
  computed: {
    bigAmount() {
      return Big(this.amount);
    },
    hasData() {
      return this.amount && this.actualApy !== undefined;
    },
    tableData() {
      return [
        this.computeTableData('Stake amount', (a) => a),
        this.computeTableData('Daily earning', (a, apy) => a.times(apy).div(365)),
        this.computeTableData('Monthly earning', (a, apy) => a.times(apy).div(12)),
        this.computeTableData('Yearly earning', (a, apy) => a.times(apy)),
      ];
    },
    chartData() {
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth();

      const months = [
        ...MONTH_NAMES.slice(currentMonth, MONTH_NAMES.length)
          .map((m) => `${m}, ${currentYear}`),
        ...MONTH_NAMES.slice(0, currentMonth)
          .map((m) => `${m}, ${currentYear + 1}`),
      ];

      const computeDataset = (label, apy, color) => ({
        label,
        data: months.map((m, i) => (
          this.bigAmount.plus(this.bigAmount.times(apy).div(12).times(i)).toFixed(5)
        )),
        borderColor: color,
        backgroundColor: color,
      });

      return {
        labels: months,
        datasets: [
          computeDataset('20% APY', 0.20, this.$vuetify.theme.currentTheme.quinary),
          computeDataset('Actual APY', this.actualApy, this.$vuetify.theme.currentTheme.tertiary),
          computeDataset('8% APY', 0.08, this.$vuetify.theme.currentTheme.senary),
        ],
      };
    },
    chartOptions() {
      return {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { intersect: false, mode: 'index' },
        elements: {
          point: {
            radius: 4,
          },
          line: {
            tension: 0.1,
            borderWidth: 2,
          },
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: ({ dataset, raw }) => `${dataset.label}: ${raw} CSPR`,
            },
          },
        },
      };
    },
  },
  watch: {
    validator: 'onValidatorChange',
  },
  mounted() {
    // TODO Calculate APY.
    this.apy = 0.11400395388108088;

    this.onValidatorChange(this.validator);
  },
  methods: {
    formatPercentage(v) {
      return v !== undefined ? `${(v * 100).toFixed(2)}%` : '- %';
    },
    computeTableData(label, operation) {
      if (!this.hasData) {
        return { label, cspr: '-', dollars: '-' };
      }

      const cspr = operation(this.bigAmount, this.actualApy);

      // TODO Convert CSPR to $.
      return {
        label,
        cspr: cspr.toFixed(5),
        dollars: cspr.toFixed(2),
      };
    },
    onValidatorChange(validator) {
      this.loading = true;

      this.validatorFee = validator ? (validator.delegation_rate / 100) : 0;
      this.actualApy = this.apy - (this.apy * this.validatorFee);

      this.loading = false;
    },
  },
};
</script>
