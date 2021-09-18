<template>
  <v-row class="mt-10">
    <v-col
      cols="12"
      md="4"
    >
      <Metric
        name="Transfer"
        :value="transfer"
      />
    </v-col>
    <v-col
      cols="12"
      md="4"
    >
      <Metric
        name="Staking"
        :value="staking"
      />
    </v-col>
    <v-col
      cols="12"
      md="4"
    >
      <Metric
        name="Unstake"
        :value="unstake"
      />
    </v-col>
    <v-col
      cols="12"
      md="4"
    >
      <Metric
        name="Add bid"
        :value="addBid"
      />
    </v-col>
    <v-col
      cols="12"
      md="4"
    >
      <Metric
        name="Withdraw bid"
        :value="withdrawBid"
      />
    </v-col>
    <v-col
      cols="12"
      md="4"
    >
      <Metric
        name="Smart-contract"
        :value="smartContract"
      />
    </v-col>
  </v-row>
</template>

<script>
import Metric from '@/components/home/Metric';

/**
 * Metric component displayed on the homepage, fetch the metrics from the
 * api and parse them to be displayed in the sparklines
 */
export default {
  name: 'Metrics',
  components: { Metric },
  data() {
    return {
      width: 2,
      radius: 10,
      padding: 8,
      lineCap: 'round',
      gradient: ['#af023f', '#00126b'],
      gradientDirection: 'top',
      fill: false,
      type: 'trend',
      autoLineWidth: false,
      transfer: [0, 0],
      staking: [0, 0],
      unstake: [0, 0],
      addBid: [0, 0],
      withdrawBid: [0, 0],
      smartContract: [0, 0],
    };
  },
  async mounted() {
    await this.value();
  },
  methods: {
    async value() {
      let values = (await (await fetch(`${this.$getApi()}/operations/metrics`)).json()).data.result;
      if (values.length > 0) {
        if (this.$getNetwork().toLowerCase().includes('test')) {
          values = values.filter((value) => value.metric.namespace.includes('testnet'));
        } else {
          values = values.filter((value) => !value.metric.namespace.includes('testnet'));
        }

        values.forEach((value) => {
          const metric = value.values.map((number) => {
            number.shift();
            // eslint-disable-next-line radix,no-param-reassign
            number[0] = parseInt(number[0]);
            return number;
          });
          if (value.metric.type === 'transfer') {
            this.transfer = metric.flat().length > 0 ? metric.flat() : [0];
          }
          if (value.metric.type === 'delegate') {
            this.staking = metric.flat().length > 0 ? metric.flat() : [0];
          }
          if (value.metric.type === 'undelegate') {
            this.unstake = metric.flat().length > 0 ? metric.flat() : [0];
          }
          if (value.metric.type === 'add_bid') {
            this.addBid = metric.flat().length > 0 ? metric.flat() : [0];
          }
          if (value.metric.type === 'withdraw_bid') {
            this.withdrawBid = metric.flat().length > 0 ? metric.flat() : [0];
          }
          if (value.metric.type === 'smart_contract') {
            this.smartContract = metric.flat().length > 0 ? metric.flat() : [0];
          }
        });
      }
    },
  },
};
</script>

<style scoped>

</style>
