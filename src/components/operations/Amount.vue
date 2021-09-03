<template>
  <div>
    <v-text-field
      v-model.number="amount"
      :hint="`Minimum CSPR needed : ${min} CSPR`"
      :max="max"
      :min="min"
      :rules="amountRules"
      :value="amount"
      maxlength="10"
      append-outer-icon="mdi-plus"
      color="white"
      label="Number of CSPR"
      persistent-hint
      prepend-icon="mdi-minus"
      required
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
/**
 * Generic amount component to allow the user to choose an "amount"
 */
export default {
    name: "Amount",
    props: {
        /**
         * Amount
         */
        value: {
            required: true,
            type: String,
            default: "0"
        },
        /**
         * Min Amount
         */
        min: {
            required: true,
            type: Number,
            default: 0
        },
        /**
         * Fee of the operation. Used to calculate the min / max of the amount
         */
        fee: {
            required: true,
            type: Number,
            default: 0
        },
        /**
         * Balance of the user. Used to calculate the min / max of the amount
         */
        balance: {
            required: true,
            type: String,
            default: "0"
        }
    },
    data() {
        return {
          /**
           * Rules for the amount text field
           */
          amountRules: [
                a => !!a || 'Amount is required',
                a => /[0-9]+\.?[0-9]*/.test(a) || 'Amount must be a number',
                a => a >= this.min || `Amount must be at least ${this.min}`,
                a => a <= this.max || `Amount must equal or bellow ${this.max}`,
                a => a <= this.balance - this.fee || `Not enough funds`,
            ],
        }
    },
    computed: {
      /**
       * Trick to send the current amount to the parent component (View)
       * Because the prop value contain the amount, this computed property return the value of this.value when called.
       * When the amount property is set we emit an event and in the parent component (View) we bind this event to the prop value
       * Example :
       * :value="amount"
       * @input="amount = $event"
       */
      amount: {
            get() {
                return this.value;
            },
            set(val) {
                this.$emit('input', val.toString());
            }
        },
        /**
         * Computed property to calculate the maximum of the amount for the user.
         * @returns {number|Number}
         */
        max() {
            return this.balance - this.fee > 0 ? this.balance - this.fee : this.min
        },
    },
    methods: {
      /**
       * Increment the amount with safeguards
       */
      increment() {
            if (this.amount < this.max) {
                if (this.amount + 1 < this.max) {
                    this.amount = this.amount + 1
                } else {
                    this.amount = this.max
                }
            }
        },
        /**
         * Increment the amount with safeguards
         */
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