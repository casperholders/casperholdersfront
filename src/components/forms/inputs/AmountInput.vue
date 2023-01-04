<template>
  <div>
    <v-text-field
      data-cy="amount"
      v-model.number="amount"
      :hint="`Minimum amount: ${min}`"
      :max="max"
      :min="min"
      :rules="amountRules"
      :value="amount"
      maxlength="10"
      append-outer-icon="mdi-plus"
      color="white"
      label="Amount"
      persistent-hint
      prepend-icon="mdi-minus"
      required
      @click:append-outer="increment"
      @click:prepend="decrement"
    />
    <v-row class="pt-2">
      <v-col cols="3">
        <v-btn
          data-cy="min"
          class="rounded-xl"
          color="white"
          outlined
          small
          width="100%"
          @click="onMin"
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
          @click="onPercent(0.25)"
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
          @click="onPercent(0.50)"
        >
          50%
        </v-btn>
      </v-col>
      <v-col cols="3">
        <v-btn
          data-cy="max"
          class="rounded-xl"
          color="white"
          outlined
          small
          width="100%"
          @click="onMax"
        >
          Max
        </v-btn>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import Big from 'big.js';
import { mapState } from 'vuex';

/**
 * Generic amount component to allow the user to choose an "amount"
 */
export default {
  name: 'AmountInput',
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
        ? Big(this.balance).minus(this.fee)
        : Big(this.min);
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
        return Big(val).lte(this.max) ? true : `Amount must equal or bellow ${this.max.toNumber()}`;
      } catch (e) {
        console.log(e);
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
    onMin() {
      this.amount = this.min;
    },
    onPercent(percent) {
      this.amount = Big(percent).times(this.balance).toString();
    },
    onMax() {
      this.amount = this.max.toString();
    },
  },
};
</script>
