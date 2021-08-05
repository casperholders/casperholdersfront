<template>
  <div>
    <v-text-field
      v-model.number="amount"
      :hint="`Minimum CSPR needed : ${min} CSPR`"
      :max="max"
      :min="min"
      :rules="amountRules"
      :value="amount"
      append-outer-icon="mdi-plus"
      color="white"
      label="Number of CSPR"
      persistent-hint
      prepend-icon="mdi-minus"
      required
      type="number"
      @click:append-outer="increment"
      @click:prepend="decrement"
    />
    <v-row class="pt-2">
      <v-col cols="3">
        <v-btn
          class="rounded-xl"
          color="white"
          outlined
          small
          width="100%"
          @click="amount=min"
        >
          Min
        </v-btn>
      </v-col>
      <v-col cols="3">
        <v-btn
          class="rounded-xl"
          color="white"
          outlined
          small
          width="100%"
          @click="amount=Math.trunc(balance*0.25)"
        >25%
        </v-btn>
      </v-col>
      <v-col cols="3">
        <v-btn
          class="rounded-xl"
          color="white"
          outlined
          small
          width="100%"
          @click="amount=Math.trunc(balance*0.5)"
        >50%
        </v-btn>
      </v-col>
      <v-col cols="3">
        <v-btn
          class="rounded-xl"
          color="white"
          outlined
          small
          width="100%"
          @click="amount=max"
        >
          Max
        </v-btn>
      </v-col>
    </v-row>
  </div>
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
                a => a <= this.balance - this.fee || `Not enough funds`,
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
                if (this.amount + 1 < this.max) {
                    this.amount = this.amount + 1
                } else {
                    this.amount = this.max
                }
            }
        },
        decrement() {
            if (this.amount > this.min) {
                if (this.amount - 1 > this.min) {
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