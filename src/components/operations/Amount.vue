<template>
  <div>
    <v-text-field
      id="amount"
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
          id="min"
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
        >
          25%
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
        >
          50%
        </v-btn>
      </v-col>
      <v-col cols="3">
        <v-btn
          id="max"
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

<script>/**
 * Generic amount component to allow the user to choose an "amount"
 */
import Big from 'big.js';
import { mapState } from 'vuex';

export default {
  name: 'Amount',
  props: {
    /**
     * Amount
     */
    value: {
      required: true,
      type: String,
      default: '0',
    },
    /**
     * Min Amount
     */
    min: {
      required: true,
      type: Number,
      default: 0,
    },
    /**
     * Fee of the operation. Used to calculate the min / max of the amount
     */
    fee: {
      required: true,
      type: Number,
      default: 0,
    },
    /**
     * Balance of the user. Used to calculate the min / max of the amount
     */
    balance: {
      required: true,
      type: String,
      default: '0',
    },
  },
  data() {
    return {
      /**
       * Rules for the amount text field
       */
      amountRules: [
        (a) => !!a || 'Amount is required',
        (a) => /[0-9]+\.?[0-9]*/.test(a) || 'Amount must be a number',
        (a) => this.mustBeAtLeast(a),
        (a) => this.mustBeBellow(a),
        (a) => this.enoughFunds(a),
      ],
    };
  },
  computed: {
    ...mapState([
      'internet',
    ]),
    /**
     * Trick to send the current amount to the parent component (View)
     * Because the prop value contain the amount, this computed property
     * return the value of this.value when called.
     * When the amount property is set we emit an event and in the
     * parent component (View) we bind this event to the prop value
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
      },
    },
    /**
     * Computed property to calculate the maximum of the amount for the user.
     * @returns {string}
     */
    max() {
      return Big(this.balance).minus(this.fee).gt(0)
        ? Big(this.balance).minus(this.fee).toString()
        : Big(this.min).toString();
    },
  },
  methods: {
    mustBeAtLeast(val) {
      if (!this.internet && Big(this.balance).eq(0)) {
        return true;
      }
      try {
        return Big(val).gte(this.min) ? true : `Amount must be at least ${this.min}`;
      } catch (e) {
        return 'Amount must be a number';
      }
    },
    mustBeBellow(val) {
      if (!this.internet && Big(this.balance).eq(0)) {
        return true;
      }
      try {
        return Big(val).lte(this.max) ? true : `Amount must equal or bellow ${this.max}`;
      } catch (e) {
        return 'Amount must be a number';
      }
    },
    enoughFunds(val) {
      if (!this.internet && Big(this.balance).eq(0)) {
        return true;
      }
      try {
        return Big(val).lte(Big(this.balance).minus(this.fee)) ? true : 'Not enough funds';
      } catch (e) {
        return 'Amount must be a number';
      }
    },
    /**
     * Increment the amount with safeguards
     */
    increment() {
      if (Big(this.amount).lt(this.max)) {
        if (Big(this.amount).plus(1).lt(this.max)) {
          this.amount = Big(this.amount).plus(1).toString();
        } else {
          this.amount = Big(this.max).toString();
        }
      }
    },
    /**
     * Increment the amount with safeguards
     */
    decrement() {
      if (Big(this.amount).gt(this.min)) {
        if (Big(this.amount).minus(1).gt(this.min)) {
          this.amount = Big(this.amount).minus(1).toString();
        } else {
          this.amount = Big(this.min).toString();
        }
      }
    },
  },
};
</script>
