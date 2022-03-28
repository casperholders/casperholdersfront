<template>
  <v-autocomplete
    id="validator"
    v-model="validator"
    :items="validators"
    filled
    chips
    color="white"
    label="Validator"
    item-text="name"
    item-value="publicKey"
    item-color="white"
    :rules="validatorRules"
    required
    return-object
    persistent-hint
    :filter="filterObject"
  >
    <template #selection="data">
      <v-chip
        v-bind="data.attrs"
        :input-value="data.selected"
        close
        @click="data.select"
        @click:close="remove()"
      >
        <v-avatar
          v-if="data.item.logo"
          left
          color="white"
          class="mr-3"
        >
          <img
            :src="data.item.logo"
            :alt="data.item.name+' Logo'"
          >
        </v-avatar>
        <v-avatar left>
          <template v-if="data.item.group === 'Inactive'">
            <v-icon color="red">
              mdi-alert
            </v-icon>
          </template>
          <template v-else>
            <v-icon color="green">
              mdi-checkbox-marked-circle
            </v-icon>
          </template>
        </v-avatar>
        {{ data.item.name }}
      </v-chip>
    </template>
    <template #item="data">
      <template v-if="typeof data.item !== 'object'">
        <v-list-item-content v-text="data.item" />
      </template>
      <template v-else>
        <v-list-item-avatar
          v-if="data.item.logo"
          color="white"
        >
          <img
            :src="data.item.logo"
            :alt="data.item.name+' Logo'"
          >
        </v-list-item-avatar>
        <v-list-item-avatar>
          <template v-if="data.item.group === 'Inactive'">
            <v-icon color="red">
              mdi-alert
            </v-icon>
          </template>
          <template v-else>
            <v-icon color="green">
              mdi-checkbox-marked-circle
            </v-icon>
          </template>
        </v-list-item-avatar>
        <v-list-item-content>
          <v-list-item-title>{{ data.item.name }}</v-list-item-title>
          <v-list-item-subtitle>
            {{ data.item.group }} - {{ data.item.delegation_rate }}% Fee -
            {{ data.item.staked_amount }} CSPR Staked
          </v-list-item-subtitle>
        </v-list-item-content>
      </template>
    </template>
  </v-autocomplete>
</template>

<script>
import balanceService from '@/helpers/balanceService';
import clientCasper from '@/helpers/clientCasper';
import { API } from '@/helpers/env';
import { NoActiveKeyError, CurrencyUtils, NoStakeBalanceError } from '@casperholders/core';
import Big from 'big.js';
import { CLPublicKey } from 'casper-js-sdk';
import { mapState } from 'vuex';

/**
 * Validator component display the list of validators
 */
export default {
  name: 'Validators',
  props: {
    /**
     * Validator
     */
    value: {
      type: Object,
      default: undefined,
    },
    undelegate: {
      required: true,
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      /**
       * Rules for the amount text field
       */
      validatorRules: [
        (a) => !!a || 'You need to select a validator',
        (a) => {
          try {
            if (a) {
              CLPublicKey.fromHex(a.publicKey);
            }
            return true;
          } catch (e) {
            return e.toString();
          }
        },
      ],
      validators: [
        { header: 'Active - Loading' },
        { divider: true },
        { header: 'Inactive - Loading' },
      ],
    };
  },
  computed: {
    ...mapState([
      'signer',
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
    validator: {
      get() {
        return this.value;
      },
      set(val) {
        this.$emit('input', val);
      },
    },
  },
  watch: {
    'signer.activeKey': 'getValidators',
  },
  async mounted() {
    await this.getValidators();
  },
  methods: {
    // eslint-disable-next-line no-unused-vars
    filterObject(item, queryText, itemText) {
      if (item.name || item.publicKey) {
        return (
          item.name.toLocaleLowerCase().indexOf(queryText.toLocaleLowerCase()) > -1
          || item.publicKey.toLocaleLowerCase().indexOf(queryText.toLocaleLowerCase()) > -1
        );
      }
      return false;
    },
    /**
     * Remove the current validator selected
     */
    remove() {
      this.validator = undefined;
    },
    /**
     * Retrieve all validators with additional metadata
     * from MAKE Account info smart contract if possible
     * @returns {Promise<void>}
     */
    async getValidators() {
      let userStake;
      if (this.undelegate) {
        try {
          userStake = await balanceService.fetchAllStakeBalance();
        } catch (e) {
          this.validators = [
            { header: `Oops an error occurred : ${e}` },
          ];
          if (e instanceof NoActiveKeyError) {
            this.validators = [
              { header: 'Connect to a wallet to know your currents validators' },
            ];
          }
          if (e instanceof NoStakeBalanceError) {
            this.validators = [
              { header: 'You don\'t stake on any validators' },
            ];
          }
          return;
        }
      }
      let validatorsData = [];
      try {
        validatorsData = await (await fetch(`${API}/validators/accountinfos`)).json();
        if (this.undelegate && userStake) {
          validatorsData = validatorsData.filter(
            (validatorInfo) => userStake.some(
              (stake) => stake.validator.toLowerCase() === validatorInfo.publicKey.toLowerCase(),
            ),
          );
        }
      } catch (e) {
        console.log(e);
        const validatorsInfo = (await clientCasper.casperRPC.getValidatorsInfo())
          .auction_state
          .bids;
        const validators = (await clientCasper.casperRPC.getValidatorsInfo())
          .auction_state.era_validators;
        const currentEra = validators[0].validator_weights.map((v) => v.public_key);
        const nextEra = validators[1].validator_weights.map((v) => v.public_key);
        for (let i = 0; i < validatorsInfo.length; i++) {
          const validatorInfo = validatorsInfo[i];
          let totalStake = '0';
          if (validatorInfo.bid.delegators.length > 0) {
            totalStake = validatorInfo.bid.delegators.reduce(
              (prev, next) => ({
                staked_amount: Big(prev.staked_amount).plus(next.staked_amount).toString(),
              }),
            ).staked_amount;
          }
          totalStake = Big(totalStake).plus(validatorInfo.bid.staked_amount).toString();
          const stakedAmount = CurrencyUtils.convertMotesToCasper(totalStake);
          if (
            (this.undelegate
              && userStake.some(
                (stake) => stake.validator.toLowerCase() === validatorInfo.public_key.toLowerCase(),
              ))
            || !this.undelegate
          ) {
            validatorsData.push({
              name: validatorInfo.public_key,
              publicKey: validatorInfo.public_key,
              group: validatorInfo.bid.inactive ? 'Inactive' : 'Active',
              delegation_rate: validatorInfo.bid.delegation_rate,
              staked_amount: Big(stakedAmount).toFixed(2),
              currentEra: currentEra.includes(validatorInfo.public_key),
              nextEra: nextEra.includes(validatorInfo.public_key),
            });
          }
        }
      }

      if (validatorsData.filter((validator) => validator.group === 'Active').length > 0 || validatorsData.filter((validator) => validator.group === 'Inactive').length > 0) {
        this.validators = [
          { header: 'Current & next era validators' },
          ...validatorsData.filter((validator) => validator.group === 'Active' && validator.currentEra && validator.nextEra),
          { divider: true },
          { header: 'Next era validators that will be included in the top 100' },
          ...validatorsData.filter((validator) => validator.group === 'Active' && !validator.currentEra && validator.nextEra),
          { divider: true },
          { header: 'Next era validators under top 100' },
          ...validatorsData.filter((validator) => validator.group === 'Active' && validator.currentEra && !validator.nextEra),
          { divider: true },
          { header: 'Active validators under top 100' },
          ...validatorsData.filter((validator) => validator.group === 'Active' && !validator.currentEra && !validator.nextEra),
          { divider: true },
          { header: 'Inactive' },
          ...validatorsData.filter((validator) => validator.group === 'Inactive'),
        ];
      } else {
        this.validators = [
          { header: 'You don\'t stake on any validators' },
        ];
      }
    },
  },
};
</script>

<style scoped>
    .v-list {
        background-color: #00126b !important;
    }
</style>
