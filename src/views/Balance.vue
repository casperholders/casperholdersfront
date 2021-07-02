<template>
  <v-container
    fill-height
    class="flex-column"
  >
    <v-card
      class="align-center rounded-xl secondary"
      min-width="50vw"
    >
      <v-card-title class="align-center">
        <v-avatar
          color="primary"
          size="52"
        >
          <v-icon>mdi-wallet</v-icon>
        </v-avatar>
        <v-card-title class="pl-4">Balance</v-card-title>
      </v-card-title>
      <v-card-text class="text-body-1">
        <v-layout
          fill-height
          align-center
          justify-center
          :column="$vuetify.breakpoint.mobile"
        >
          <v-progress-circular
            v-if="!loaded"
            indeterminate
            color="blue"
          ></v-progress-circular>
          <donut-chart
            style="max-width: 100%"
            :chart-data="datacollection"
          ></donut-chart>
          <div
            v-if="loaded"
            :class="{'mt-2': $vuetify.breakpoint.mobile, 'mt-0': !$vuetify.breakpoint.mobile}"
          >
                <span
                  v-bind:key="label"
                  v-for="(label, i) in datacollection.labels"
                  class="ml-5"
                ><v-icon
                  :color="datacollection.datasets[0].backgroundColor[i]"
                >mdi-square</v-icon>
                  {{label}} <span class="cspr">{{datacollection.datasets[0].data[i]}} CSPR</span> ({{csprPercentage(i)}}%)<br /></span>
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
              style="background-color: transparent!important;"
              outlined
              large
              rounded
              color="white"
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
              style="background-color: transparent!important;"
              outlined
              large
              rounded
              color="white"
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
              style="background-color: transparent!important;"
              outlined
              large
              rounded
              color="white"
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

export default {
    name: 'Balance',
    components: {DonutChart},
    data: () => ({
        loaded: false,
        datacollection: {
            labels: ['Loading'],
            datasets: [
                {
                    backgroundColor: ['#00126b', '#af023f', '#ff473e'],
                    data: [0],
                    borderWidth: 0,
                }
            ]
        },
    }),
    computed: {
        csprPercentage() {
            let total = this.datacollection.datasets[0].data.reduce((a, b) => parseFloat(a) + parseFloat(b), 0);
            if (total === 0) {
                total = 1
            }
            return (index) => {
                const value = parseFloat(this.datacollection.datasets[0].data[index]);
                return Number(value / total * 100).toFixed(2)
            }
        },
        activeKey() {
            return this.$store.getters.signer.activeKey
        },
    },
    watch: {
        async activeKey() {
            await this.getCurrentBalance()
        }
    },
    async mounted() {
        await this.getCurrentBalance();
        this.loaded = true;
    },
    methods: {
        async getCurrentBalance(){
            let baseDatacollection = {
                labels: ['Loading'],
                datasets: [
                    {
                        backgroundColor: ['#00126b', '#af023f', '#ff473e'],
                        data: [0,0,1],
                        borderWidth: 0,
                    }
                ]
            }

            if(this.$store.getters.signer.activeKey !== null) {
                let balanceData = null

                try {
                     balanceData = await (await fetch(this.getApi() + "/balance/" + this.$store.getters.signer.activeKey)).json()
                } catch (e) {
                    baseDatacollection.datasets[0].data = ["0", "0", "1"]
                    baseDatacollection.labels = ["Can't retrieve balance. Please check your public key"]
                    this.datacollection = baseDatacollection
                    return
                }

                if (balanceData.balance === undefined) {
                    baseDatacollection.datasets[0].data = ["0", "0", "1"]
                    baseDatacollection.labels = ["Can't retrieve balance. Please check your public key"]
                    this.datacollection = baseDatacollection
                    return
                }

                baseDatacollection.labels = ['Available']
                baseDatacollection.datasets[0].data = [Number(balanceData.balance / 1000000000).toFixed(2)]
                try {
                    let stakeData = await (await fetch(this.getApi() + "/balance/stake/" + this.$store.getters.signer.activeKey)).json()
                    let stake = Number(stakeData.balance / 1000000000).toFixed(2)
                    baseDatacollection.datasets[0].data.push(stake)
                    if (stakeData.error !== undefined && stakeData.error !== "") {
                        baseDatacollection.labels.push(stakeData.error)
                    } else {
                        baseDatacollection.labels.push("Staked")
                    }
                    if (baseDatacollection.datasets[0].data[0] === "0.00" && baseDatacollection.datasets[0].data[1] === "0.00") {
                        baseDatacollection.datasets[0].data = ["0", "0", "1"]
                    }
                    this.datacollection = baseDatacollection
                } catch (e) {
                    console.log(e)
                    baseDatacollection.datasets[0].data.push("0");
                    baseDatacollection.labels.push("Unable to retrieve staked balance.")
                    this.datacollection = baseDatacollection
                }
            } else {
                baseDatacollection.datasets[0].data = ["0", "0", "1"]
                baseDatacollection.labels = ["Unable to retrieve current balance. Unlock and/or connect to Casper Signer first."]
                this.datacollection = baseDatacollection
            }
        }
    }
}
</script>
