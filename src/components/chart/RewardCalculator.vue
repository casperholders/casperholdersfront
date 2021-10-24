<template>
  <div class="reward-calculator">
    <div class="d-flex align-center justify-center flex-wrap body-2 mb-3">
      <v-tooltip bottom>
        <template #activator="{ attrs, on }">
          <div
            class="d-flex align-center"
            v-bind="attrs"
            v-on="on"
          >
            <v-icon
              v-if="apyWorstCase"
              small
              left
            >
              mdi-alert
            </v-icon>
            <strong>APY</strong>: {{ formatPercentage(apy) }}
          </div>
        </template>
        <span>
          {{ apyWorstCase ? 'Worst case scenario' : 'Calculated from last era' }}
        </span>
      </v-tooltip>
      <span
        role="presentation"
        class="mx-2"
      >ꞏ</span>
      <div>
        <strong>Validator fee</strong>: {{ formatPercentage(validatorFee) }}
      </div>
      <span
        role="presentation"
        class="mx-2"
      >ꞏ</span>
      <div>
        <strong>Final APY</strong>: {{ formatPercentage(actualApy) }}
      </div>
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
        {{ cspr }}
      </v-col>
      <v-col
        cols="6"
        sm="3"
        class="cspr text-right"
      >
        {{ dollars }}
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
import toFormat from 'toformat';

toFormat(Big);

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
    casperUsdFactor: undefined,
    apy: undefined,
    apyWorstCase: false,
    validatorFee: undefined,
    actualApy: undefined,
  }),
  computed: {
    hasData() {
      return this.bigAmount && this.actualApy !== undefined;
    },
    bigAmount() {
      if (!this.amount) {
        return undefined;
      }

      try {
        return Big(this.amount);
      } catch (_) {
        return undefined;
      }
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

      const computeDataset = (label, apy, color) => {
        const rawData = months.map((_, i) => (
          this.bigAmount.plus(this.bigAmount.times(apy).div(12).times(i))
        ));

        return {
          label,
          rawData,
          data: rawData.map((v) => v.toString()),
          borderColor: color,
          backgroundColor: color,
        };
      };

      return {
        labels: months,
        datasets: [
          computeDataset('20% APY (max)', 0.20, this.$vuetify.theme.currentTheme.quinary),
          computeDataset('Actual APY', this.actualApy, this.$vuetify.theme.currentTheme.tertiary),
          computeDataset('8% APY (max)', 0.08, this.$vuetify.theme.currentTheme.senary),
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
              label: (t) => `${t.dataset.label}: ${this.formatCasper(t.dataset.rawData[t.dataIndex])}`,
            },
          },
        },
      };
    },
  },
  watch: {
    validator: 'onValidatorChange',
  },
  async mounted() {
    this.casperUsdFactor = await this.getCasperUsdFactor();

    this.apy = await this.getCasperApy();
    if (this.apy === undefined) {
      this.apy = 0.08;
      this.apyWorstCase = true;
    }

    this.onValidatorChange(this.validator);
  },
  methods: {
    formatCasper(value = undefined) {
      return value !== undefined ? `${value.toFormat(5)} CSPR` : '- CSPR';
    },
    formatDollars(value = undefined) {
      return value !== undefined ? `$ ${value.toFormat(2)}` : '$ -';
    },
    formatPercentage(value = undefined) {
      return value !== undefined ? `${(value * 100).toFixed(2)}%` : '- %';
    },
    computeTableData(label, operation) {
      if (!this.hasData) {
        return { label, cspr: this.formatCasper(), dollars: this.formatDollars() };
      }

      const cspr = operation(this.bigAmount, this.actualApy);

      return {
        label,
        cspr: this.formatCasper(cspr),
        dollars: this.formatDollars(cspr.times(this.casperUsdFactor)),
      };
    },
    async getCasperUsdFactor() {
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=casper-network&vs_currencies=usd');
      const data = await response.json();

      return data['casper-network'].usd;
    },
    async getCasperApy() {
      try {
        const response = await fetch(`${this.$getApi()}/apy/current`);
        return await response.json() / 100;
      } catch (_) {
        return undefined;
      }
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
