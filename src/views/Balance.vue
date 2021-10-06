<template>
  <v-card
    class="align-center rounded-xl secondary"
    width="100%"
  >
    <v-card-title class="align-center">
      <v-avatar
        class="mr-4"
        color="primary"
        size="52"
      >
        <v-icon>mdi-wallet</v-icon>
      </v-avatar>
      Balance
    </v-card-title>
    <v-card-text class="text-body-1">
      <v-fade-transition
        leave-absolute
        group
      >
        <v-layout
          v-if="loading"
          key="loader"
          align-center
          justify-center
          style="height: 400px"
        >
          <v-progress-circular
            color="primary"
            size="128"
            width="10"
            indeterminate
          />
        </v-layout>
        <v-layout
          v-else-if="errored"
          key="error"
          align-center
          justify-center
          style="height: 400px"
        >
          <v-alert
            type="error"
            prominent
          >
            Not connected on Signer.
            <v-btn
              color="secondary"
              class="ml-2"
              @click="onConnectionRequest"
            >
              <v-icon left>
                mdi-account-circle
              </v-icon>
              {{ signer.lock ? 'Unlock' : 'Connect' }}
            </v-btn>
          </v-alert>
        </v-layout>
        <doughnut-chart
          v-else
          key="chart"
          :chart-data="chartData"
          :chart-options="chartOptions"
          style="max-width: 100%;max-height: 400px;"
        />
      </v-fade-transition>
    </v-card-text>
    <v-divider />
    <v-card-actions class="pa-5">
      <v-row>
        <v-col
          cols="12"
          md="4"
        >
          <v-sheet
            color="white"
            large
            outlined
            rounded
            style="background-color: transparent!important;"
          >
            <v-list-item to="/transfer">
              <v-list-item-icon>
                <v-icon>
                  mdi-send
                </v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>
                  Transfer
                </v-list-item-title>
                <v-list-item-subtitle>
                  Transfer funds
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-sheet>
        </v-col>
        <v-col
          cols="12"
          md="4"
        >
          <v-sheet
            color="white"
            large
            outlined
            rounded
            style="background-color: transparent!important;"
          >
            <v-list-item to="stake">
              <v-list-item-icon>
                <v-icon>
                  mdi-safe
                </v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>
                  Stake
                </v-list-item-title>
                <v-list-item-subtitle>
                  Stake your tokens
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-sheet>
        </v-col>
        <v-col
          cols="12"
          md="4"
        >
          <v-sheet
            color="white"
            large
            outlined
            rounded
            style="background-color: transparent!important;"
          >
            <v-list-item to="unstake">
              <v-list-item-icon>
                <v-icon>
                  mdi-wallet
                </v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>
                  Unstake
                </v-list-item-title>
                <v-list-item-subtitle>
                  Unstake your tokens
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-sheet>
        </v-col>
      </v-row>
    </v-card-actions>
  </v-card>
</template>

<script>
import DoughnutChart from '@/components/chart/DoughnutChart';
import { Signer } from 'casper-js-sdk';
import { mapState } from 'vuex';

/**
 * Balance view
 * Display the current user balance and their staked tokens on the Casper Node
 * configured in the env file
 */
export default {
  name: 'Balance',
  components: { DoughnutChart },
  data() {
    return {
      loading: true,
      errored: false,
      chartData: undefined,
    };
  },
  computed: {
    ...mapState(['signer']),
    /**
     * Calculate the percentage of staked tokens over the tokens available
     */
    csprPercentage() {
      let total = this.chartData.datasets[0].data.reduce((a, b) => Number(a) + Number(b), 0);
      if (total === 0) {
        total = 1;
      }

      return (index) => {
        const value = this.chartData.datasets[0].data[index];
        return Number((value / total) * 100).toFixed(2);
      };
    },
    chartOptions() {
      return {
        cutout: '90%',
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: this.$vuetify.breakpoint.smAndDown ? 'bottom' : 'right',
            labels: {
              filter: (legendItem, { datasets }) => {
                if (this.errored) {
                  return true;
                }

                const rawValue = datasets[0].data[legendItem.index];
                // eslint-disable-next-line no-param-reassign
                legendItem.text = `${legendItem.text}: ${rawValue} CSPR (${this.csprPercentage(legendItem.index)}%)`;

                return true;
              },
            },
          },
          tooltip: {
            callbacks: {
              title: ([{ label }]) => (this.errored ? undefined : label),
              label: ({ label, raw, dataIndex }) => (
                this.errored ? label : [`${raw} CSPR`, `${this.csprPercentage(dataIndex)}%`]
              ),
            },
          },
        },
      };
    },
  },
  watch: {
    /**
     * Watch the state of the active key. In case of an update, re-fetch the balance data
     */
    'signer.activeKey': {
      async handler() {
        await this.fetchBalances();
      },
      immediate: true,
    },
  },
  methods: {
    /**
     * Fetch the balances of the current user and update the Donut chart
     */
    async fetchBalances() {
      this.loading = true;
      this.errored = false;
      this.chartData = undefined;

      const { primary, tertiary, quaternary } = this.$vuetify.theme.currentTheme;
      const newChartData = {
        datasets: [{ backgroundColor: [primary, quaternary, tertiary], borderWidth: 0 }],
      };
      try {
        const balance = await this.$getBalanceService().fetchBalance();
        newChartData.labels = ['Available'];
        newChartData.datasets[0].data = [balance];
      } catch (error) {
        this.errored = true;
        this.loading = false;
        return;
      }

      try {
        const validators = await this.$getBalanceService().fetchAllStakeBalance();
        validators.forEach((validator) => {
          newChartData.labels.push(`Validator ${this.truncate(validator.validator)}`);
          newChartData.datasets[0].data.push(validator.stakedTokens);
        });
      } catch (error) {
        console.log(error);
      }

      this.chartData = newChartData;
      this.loading = false;
    },
    truncate(fullStr) {
      const strLen = 15;
      const separator = '...';

      if (fullStr.length <= strLen) return fullStr;

      const sepLen = separator.length;
      const charsToShow = strLen - sepLen;
      const frontChars = Math.ceil(charsToShow / 2);
      const backChars = Math.floor(charsToShow / 2);

      return fullStr.substr(0, frontChars) + separator + fullStr.substr(fullStr.length - backChars);
    },
    onConnectionRequest() {
      Signer.sendConnectionRequest();
    },
  },
};
</script>
