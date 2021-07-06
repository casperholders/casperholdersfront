<template>
  <p>
    <v-text-field
      color="white"
      v-model.number="amount"
      :value="amount"
      type="number"
      :min="min"
      :max="max"
      label="Number of CSPR"
      :rules="amountRules"
      required
      append-outer-icon="mdi-plus"
      @click:append-outer="increment"
      prepend-icon="mdi-minus"
      @click:prepend="decrement"
      :hint="`Minimum CSPR needed : ${min} CSPR`"
      persistent-hint
    />
    <v-row class="pb-5">
      <v-col cols="3">
        <v-btn
          small
          outlined
          color="white"
          width="100%"
          class="rounded-xl"
          @click="amount=min"
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
          @click="amount=max"
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
    props: {
        value: {
            required: true,
            type: [Number, String],
            default: 0
        },
        min: {
            required: true,
            type: Number,
            default: 0
        },
        fee: {
            required: true,
            type: Number,
            default: 0
        },
        balance: {
            required: true,
            type: Number,
            default: 0
        }
    },
    data() {
        return {
            amountRules: [
                a => !!a || 'Amount is required',
                a => /[0-9]+/.test(a) || 'Amount must be a number',
                a => a >= this.min || `Amount must be at least ${this.min}`,
                a => a <= this.max || `Amount must equal or bellow ${this.max}`,
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
            return this.balance !== 0 ? Math.trunc(((this.amount + 1) / Math.trunc(this.balance)) * 100) + '%' : "0%"
        },
        max() {
            return this.balance - this.fee > 0 ? this.balance - this.fee : this.min
        },
    },
    methods: {
        increment() {
            if (this.amount < this.max) {
                if(this.amount+1 < this.max) {
                    this.amount = this.amount + 1
                } else {
                    this.amount = this.max
                }
            }
        },
        decrement() {
            if (this.amount > this.min) {
                if(this.amount-1 > this.min){
                    this.amount = this.amount - 1
                } else {
                    this.amount = this.min
                }
            }
        },
    }
}
</script>

<style scoped>

</style>