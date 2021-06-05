<template>
  <v-container
    fill-height
    class="flex-column px-0"
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
        >
          <v-progress-circular
            v-if="!loaded"
            indeterminate
            color="blue"
          ></v-progress-circular>
          <donut-chart
            v-if="loaded"
            :chartdata="datacollection"
          ></donut-chart>
          <div v-if="loaded">
                <span
                  v-bind:key="label"
                  v-for="(label, i) in datacollection.labels"
                  class="ml-5"
                ><v-icon
                  :color="datacollection.datasets[0].backgroundColor[i]"
                >mdi-square</v-icon>{{
                    label
                  }} {{
                    datacollection.datasets[0].data[i]
                  }} CSPR ({{
                    csprPercentage(i)
                  }}%)<br /></span>
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
              <v-list-item href="#">
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
                    Transfer funds to another account
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
              <v-list-item href="#">
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
              <v-list-item href="#">
                <v-list-item-icon>
                  <v-icon>
                    mdi-wallet
                  </v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title>
                    Unstack
                  </v-list-item-title>
                  <v-list-item-subtitle>
                    Unstack your tokens
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
import DonutChart from "@/components/DonutChart";
import {Signer} from "casper-client-sdk";

export default {
    name: 'Balance',
    components: {DonutChart},
    data: () => ({
        loaded: false,
        datacollection: {
            labels: ['Loading'],
            datasets: [
                {
                    label: 'Data One',
                    backgroundColor: ['#00126b', '#af023f', '#ff473e'],
                    data: [0],
                    borderWidth: 0,
                }
            ]
        }
    }),
    computed: {
        csprPercentage() {
            let total = this.datacollection.datasets[0].data.reduce((a, b) => parseFloat(a) + parseFloat(b), 0);
            if(total === 0){
                total = 1
            }
            return (index) => {
                const value = parseFloat(this.datacollection.datasets[0].data[index]);
                return Number(value / total * 100).toFixed(2)
            }
        }
    },
    async mounted() {
        try {
            if(!await Signer.isConnected()){
                throw new Error("Casper Signer is not connected")
            }
            const publicKeyHex = await Signer.getActivePublicKey()
            try {
                let balanceData = await (await fetch("http://localhost:3000/balance/" + publicKeyHex)).json()
                if(balanceData.balance === undefined){
                    throw new Error("Can't retrieve balance. Please check your public key")
                }
                this.datacollection.labels = ['Available']
                this.datacollection.datasets[0].data = [Number(balanceData.balance / 1000000000).toFixed(2)]
                try {
                    let stakeData = await (await fetch("http://localhost:3000/balance/stake/" + publicKeyHex)).json()
                    let stake = Number(stakeData.balance / 1000000000).toFixed(2)
                    this.datacollection.datasets[0].data.push(stake)
                    if (stakeData.error !== undefined && stakeData.error !== "") {
                        this.datacollection.labels.push(stakeData.error)
                    } else {
                        this.datacollection.labels.push("Staked")
                    }
                    if (this.datacollection.datasets[0].data[0] === "0.00" && this.datacollection.datasets[0].data[1] === "0.00") {
                        this.datacollection.datasets[0].data = ["0", "0", "1"]
                    }
                }catch (e) {
                    console.log(e)
                    this.datacollection.datasets[0].data.push("0");
                    this.datacollection.labels.push("Unable to retrieve staked balance.")
                }
            } catch (e) {
                console.log(e);
                this.datacollection.datasets[0].data = ["0", "0", "1"]
                this.datacollection.labels = ["Unable to retrieve current balance."]
            }
        } catch (e) {
            Signer.sendConnectionRequest();
            console.log(e);
            this.datacollection.labels = ["Please connect to Casper Signer first then it refresh."];
            this.datacollection.datasets[0].data = ["0", "0", "1"];
        }
        this.loaded = true;
    }
}
</script>
