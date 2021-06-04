<template>
  <v-container fill-height class="px-0">
    <v-row justify="center">
      <v-card
          style="background: #00012a; width: 50vw;" class="align-center rounded-xl">
        <v-card-title class="align-start" style="width: 100%">
          <v-sheet rounded class="mt-n9" color="">
            <div class="pa-7">
              <v-icon>mdi-wallet</v-icon>
            </div>
          </v-sheet>
          <v-card-title class="pl-4">Balance</v-card-title>
        </v-card-title>
        <v-card-text class="text-body-1">
          <v-container fill-height fluid class="px-0">
            <v-row justify="center" align="center">
              <v-progress-circular v-if="!loaded" indeterminate color="blue"></v-progress-circular>
              <donut-chart v-if="loaded" :chartdata="datacollection"></donut-chart>
              <div v-if="loaded">
                <span v-bind:key="label" v-for="(label, i) in datacollection.labels" class="ml-5"><v-icon
                    :color="datacollection.datasets[0].backgroundColor[i]">mdi-square</v-icon>{{
                    label
                  }} {{
                    datacollection.datasets[0].data[i]
                  }} CSPR ({{
                    Number((parseFloat(datacollection.datasets[0].data[i]) / datacollection.datasets[0].data.reduce((a, b) => parseFloat(a) + parseFloat(b), 0)) * 100).toFixed(2)
                  }}%)<br/></span>
              </div>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-row>
            <v-col cols="12" md="4">
              <v-sheet style="background-color: transparent!important;" outlined large rounded color="white">
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
            <v-col cols="12" md="4">
              <v-sheet style="background-color: transparent!important;" outlined large rounded color="white">
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
            <v-col cols="12" md="4">
              <v-sheet style="background-color: transparent!important;" outlined large rounded color="white">
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
    </v-row>
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
          backgroundColor: ['#00126b', '#af023f'],
          data: [0],
          borderWidth: 0,
        }
      ]
    }
  }),
  mounted: function () {
    Signer.isConnected().then(connected => {
      if (connected) {
        Signer.getActivePublicKey().then(publicKeyHex => {
          fetch("http://localhost:3000/balance/" + publicKeyHex).then(response => {
            response.json().then(data => {
              this.datacollection.labels = ['Available']
              this.datacollection.datasets[0].data = [Number(data.balance / 1000000000).toFixed(2)]
            }).then(() => {
              fetch("http://localhost:3000/balance/stake/" + publicKeyHex).then(response => {
                response.json().then(data => {
                  let stake = Number(data.balance / 1000000000).toFixed(2)
                  this.datacollection.datasets[0].data.push(stake)
                  if (data.error !== undefined && data.error !== "") {
                    this.datacollection.labels = [data.error]
                  } else {
                    this.datacollection.labels.push("Staked")
                  }
                  this.loaded = true;
                })
              }).catch((err) => {
                console.log(err)
                this.loaded = true;
                this.datacollection.labels = ["Error Unknown. Please check your public key hex."]
                this.datacollection.datasets[0].data = [0];
              })
            })
          }).catch((err) => {
            console.log(err)
            this.loaded = true;
            this.datacollection.labels = ["Error Unknown. Please check your public key hex."]
            this.datacollection.datasets[0].data = [0];
          })
        });
      } else {
        Signer.sendConnectionRequest();
        this.loaded = true;
        this.datacollection.labels = ["Please connect to Casper Signer first then it refresh."]
        this.datacollection.datasets[0].data = [0];
      }
    }).catch(err => {
      console.log(err)
      this.loaded = true;
      this.datacollection.labels = ["Please connect to Casper Signer first then it refresh."]
      this.datacollection.datasets[0].data = [0];
    });
  }
}
</script>
