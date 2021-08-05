<template>
  <v-container
    class="container__small"
    fill-height
  >
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
        <v-layout
          :column="$vuetify.breakpoint.mobile"
          align-center
          fill-height
          justify-start
        >
          <donut-chart
            :chart-data="chartData"
            style="max-width: 100%"
          />

          <div class="mt-3 mt-lg-0 ml-0 ml-lg-3">
            <v-layout
              v-for="(label, i) in chartData.labels"
              :key="label"
              :class="{ 'mt-2': i === 1 }"
            >
              <v-avatar
                :color="chartData.datasets[0].backgroundColor[i]"
                class="mr-2"
                size="24"
              />
              {{ label }}
              &nbsp;
              <span class="cspr">
                {{ chartData.datasets[0].data[i].toFixed(2) }} CSPR
              </span>
              &nbsp;
              ({{ csprPercentage(i) }}%)
            </v-layout>
          </div>
        </v-layout>
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
  </v-container>
</template>

<script>
import DonutChart from "@/components/chart/DonutChart";
import {mapState} from "vuex";

export default {
    name: "Balance",
    components: {DonutChart},
    data() {
        return {
            chartData: this.createLoadingChartData(),
        };
    },
    computed: {
        ...mapState(["signer"]),
        csprPercentage() {
            let total = this.chartData.datasets[0].data.reduce((a, b) => a + b, 0);
            if (total === 0) {
                total = 1;
            }

            return (index) => {
                const value = this.chartData.datasets[0].data[index];
                return Number(value / total * 100).toFixed(2);
            };
        },
    },
    watch: {
        "signer.activeKey": {
            async handler() {
                await this.fetchBalances();
            },
            immediate: true,
        },
    },
    methods: {
        createLoadingChartData() {
            const {primary, tertiary, quaternary} = this.$vuetify.theme.currentTheme;

            return {
                labels: ["Loading"],
                datasets: [
                    {
                        backgroundColor: [primary, quaternary, tertiary],
                        data: [0, 0, 1],
                        borderWidth: 0,
                    },
                ],
            };
        },
        async fetchBalances() {
            const newChartData = this.createLoadingChartData();
            try {
                const balance = await this.$getBalanceService().fetchBalance();
                newChartData.labels = ["Available"];
                newChartData.datasets[0].data = [balance, 0, 0];
            } catch (error) {
                newChartData.labels = [error.message];
                this.chartData = newChartData;
                return;
            }

            try {
                const stakedBalance = await this.$getBalanceService().fetchStakeBalance();
                newChartData.labels.push("Stacked");
                newChartData.datasets[0].data[1] = stakedBalance;
            } catch (error) {
                console.log(error)
            } finally {
                this.chartData = newChartData;
            }
        },
    },
};
</script>
