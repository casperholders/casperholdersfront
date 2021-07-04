<template>
  <p>
    <v-text-field
        color="white"
        v-model.number="amount"
        :value="amount"
        type="number"
        :min="minimumCSPR"
        :max="maxCSPR"
        label="Number of CSPR"
        :rules="amountRules"
        required
        append-outer-icon="mdi-plus"
        @click:append-outer="increment"
        prepend-icon="mdi-minus"
        @click:prepend="decrement"
        :hint="`Minimum CSPR needed : ${minimumCSPR} CSPR`"
        persistent-hint
    />
    <v-slider
        v-model="amount"
        :label="labelPercentage"
        :max="maxCSPR"
        :min="minimumCSPR"
        color="white"
        class="pt-5"
    />
    <v-row class="pb-5">
      <v-col cols="3">
        <v-btn
            small
            outlined
            color="white"
            width="100%"
            class="rounded-xl"
            @click="amount=minimumCSPR"
        >
          Min
        </v-btn>
      </v-col>
      <v-col cols="3">
        <v-btn
            small
            outlined
            color="white"
            width="100%"
            class="rounded-xl"
            @click="amount=Math.trunc(balance*0.25)"
        >25%
        </v-btn>
      </v-col>
      <v-col cols="3">
        <v-btn
            small
            outlined
            color="white"
            width="100%"
            class="rounded-xl"
            @click="amount=Math.trunc(balance*0.5)"
        >50%
        </v-btn>
      </v-col>
      <v-col cols="3">
        <v-btn
            small
            outlined
            color="white"
            width="100%"
            class="rounded-xl"
            @click="amount=maxCSPR"
        >
          Max
        </v-btn>
      </v-col>
    </v-row>
  </p>
</template>

<script>
export default {
  name: "Amount",
  props: ['value', 'minimumCSPR', 'fee', 'balance'],
  data() {
    return {
      amountRules: [
        a => !!a || 'Amount is required',
        a => /[0-9]+/.test(a) || 'Amount must be a number',
        a => a >= this.minimumCSPR || `Amount must be at least ${this.minimumCSPR}`,
        a => a <= this.maxCSPR || `Amount must equal or bellow ${this.maxCSPR}`,
      ],
    }
  },
  computed: {
    amount: {
      get() {
        return this.value;
      },
      set(val) {
        this.$emit('input', val);
      }
    },
    labelPercentage() {
      return this.balance != null ? Math.trunc(((this.amount + 1) / Math.trunc(this.balance)) * 100) + '%' : "0%"
    },
    maxCSPR() {
      return Math.trunc(this.balance - this.fee) > 0 ? Math.trunc(this.balance - this.fee) : this.minimumCSPR
    },
  },
  methods: {
    increment() {
      if (this.amount < this.maxCSPR) {
        this.amount = parseInt(this.amount) + 1
      }
    },
    decrement() {
      if (this.amount > this.minimumCSPR) {
        this.amount = parseInt(this.amount) - 1
      }
    },
  }
}
</script>

<style scoped>

</style>