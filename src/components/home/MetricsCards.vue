<template>
  <v-row class="mt-10">
    <v-col cols="12">
      <v-card class="fill-height rounded-xl secondary">
        <v-card-title>
          <v-avatar
            class="mr-4"
            color="primary"
            size="52"
          >
            <v-icon>mdi-chart-areaspline</v-icon>
          </v-avatar>
          Metrics
        </v-card-title>
        <v-card-text>
          <v-fade-transition
            tag="div"
            leave-absolute
            group
          >
            <v-layout
              v-if="loading"
              key="no-chart"
              style="height: 500px;"
              align-center
              justify-center
            >
              <v-progress-circular
                v-if="loading"
                data-cy="metrics-loading"
                color="primary"
                size="128"
                width="10"
                indeterminate
              />
            </v-layout>
            <line-chart
              v-else-if="chartData"
              data-cy="metrics-chart"
              key="chart"
              :chart-data="chartData"
              :chart-options="chartOptions"
              style="width: 100%;height: 500px;"
            />
            <div
              v-else
              id="metrics-no-data"
              key="nodata"
              class="text-overline d-flex align-center justify-center"
              style="height: 500px;"
            >
              No data available
            </div>
          </v-fade-transition>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
import LineChart from '@/components/chart/LineChart';
import { DATA_API } from '@/helpers/env';
import colors from 'vuetify/lib/util/colors';

/**
 * Metric component displayed on the homepage, fetch the metrics from the
 * api and parse them to be displayed in the chart
 */
export default {
  name: 'MetricsCards',
  components: { LineChart },
  data() {
    return {
      loading: true,
      chartData: {},
    };
  },
  computed: {
    chartOptions() {
      return {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { intersect: false, mode: 'index' },
        scales: {
          y: { beginAtZero: 0 },
        },
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
              label: (t) => `${t.dataset.label}: ${t.dataset.rawData[t.dataIndex]}`,
            },
          },
        },
      };
    },
  },
  async mounted() {
    this.chartData = await this.value();
    this.loading = false;
  },
  methods: {
    getRandomColor(index) {
      const { tertiary, quaternary, quinary, senary } = this.$vuetify.theme.currentTheme;
      const availableColors = [
        tertiary,
        quaternary,
        quinary,
        senary,
        colors.purple.base,
        colors.lime.base,
        colors.red.base,
        colors.yellow.base,
        colors.green.base,
        colors.deepOrange.base,
      ];

      return availableColors[index % availableColors.length];
    },
    humanReadableLabel(label) {
      if (label === 'ERC20') {
        return label;
      }
      return label.charAt(0).toUpperCase() + label.split(/(?=[A-Z])/).join(' ').slice(1);
    },
    async value() {
      try {
        const values = await (await fetch(`${DATA_API}/full_stats`)).json();
        if (values.length > 0) {
          const dates = [...new Set(values.map((v) => v.day.replace('T00:00:00+00:00', '')))];
          dates.sort();
          const types = [...new Set(values.map((v) => v.type))];

          const datasets = [];

          const computeDataset = (label, color) => {
            const rawData = values.filter((v) => v.type === label);
            const data = [];
            Object.keys(dates).forEach((date) => {
              const currentDay = rawData.filter((v) => v.day.replace('T00:00:00+00:00', '') === dates[date]);
              data.push(currentDay.length > 0 ? currentDay[0].count : 0);
            });

            return {
              label: this.humanReadableLabel(label),
              rawData: data,
              data,
              borderColor: color,
              backgroundColor: color,
            };
          };

          for (let i = 0; i < types.length; i++) {
            datasets.push(computeDataset(types[i], this.getRandomColor(i)));
          }

          const dataTotal = [];
          Object.keys(dates).forEach((date) => {
            const currentDay = values.filter((v) => v.day.replace('T00:00:00+00:00', '') === dates[date]);
            dataTotal.push(currentDay.reduce((a, b) => ({ count: a.count + b.count })).count);
          });

          const total = {
            label: 'Total',
            rawData: dataTotal,
            data: dataTotal,
            borderColor: 'white',
            backgroundColor: 'white',
          };
          datasets.push(total);
          return {
            labels: dates,
            datasets,
          };
        }
        return null;
      } catch (e) {
        return null;
      }
    },
  },
};
</script>
