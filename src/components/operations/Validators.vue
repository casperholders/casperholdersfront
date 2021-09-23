<template>
  <v-autocomplete
    v-model="validator"
    :items="validators"
    filled
    chips
    color="white"
    label="Validator"
    item-text="name"
    item-value="publicKey"
    item-color="white"
  >
    <template #selection="data">
      <v-chip
        v-bind="data.attrs"
        :input-value="data.selected"
        close
        @click="data.select"
        @click:close="remove()"
      >
        <v-avatar left>
          <v-icon>mdi-alert</v-icon>
        </v-avatar>
        {{ data.item.name }}
      </v-chip>
    </template>
    <template #item="data">
      <template v-if="typeof data.item !== 'object'">
        <v-list-item-content v-text="data.item" />
      </template>
      <template v-else>
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
import { NoActiveKeyError } from '@casperholders/core/dist/services/errors/noActiveKeyError';
import { NoStakeBalanceError } from '@casperholders/core/dist/services/errors/noStakeBalanceError';
import { CurrencyUtils } from '@casperholders/core/dist/services/helpers/currencyUtils';
import { Validators } from '@casperholders/core/dist/services/validators/validators';
import Big from 'big.js';
import { mapState } from 'vuex';
import { ClientCasper } from '@casperholders/core/dist/services/clients/clientCasper';

export default {
  name: 'Validators',
  props: {
    /**
     * Validator
     */
    value: {
      required: true,
      type: String,
      default: '',
    },
    undelegate: {
      required: true,
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
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
        this.$emit('input', val.toString());
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
    remove() {
      this.validator = '';
    },
    async getValidators() {
      let userStake;
      if (this.undelegate) {
        try {
          userStake = await this.$getBalanceService().fetchAllStakeBalance();
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
      const validatorsInfo = (await this.$getClientCasper().casperRPC.getValidatorsInfo())
        .auction_state
        .bids;
      const validatorsData = [];
      for (let i = 0; i < validatorsInfo.length; i++) {
        const validatorInfo = validatorsInfo[i];
        const stakedAmount = CurrencyUtils.convertMotesToCasper(validatorInfo.bid.staked_amount);
        if (
          (this.undelegate
            && userStake.some((stake) => stake.validator === validatorInfo.public_key))
          || !this.undelegate
        ) {
          let name = validatorInfo.public_key;

          const validatorsService = new Validators(new ClientCasper(process.env.VUE_APP_RPC));
          try {
            // eslint-disable-next-line no-await-in-loop
            name = (await validatorsService.getValidatorInfo(
              name,
              this.$getAccountInfoHash(), this.$getNetwork(),
            )).owner.name;
            console.log(`url set for ${name}`);
          } catch (e) {
            console.log(e);
            console.log(`url not set for ${name}`);
          }
          validatorsData.push({
            name,
            publicKey: validatorInfo.public_key,
            group: validatorInfo.bid.inactive ? 'Inactive' : 'Active',
            delegation_rate: validatorInfo.bid.delegation_rate,
            staked_amount: new Big(stakedAmount).toFixed(2),
          });
        }
      }
      if (validatorsData.filter((validator) => validator.group === 'Active').length > 0 || validatorsData.filter((validator) => validator.group === 'Inactive').length > 0) {
        if (validatorsData.filter((validator) => validator.group === 'Active').length > 0 && validatorsData.filter((validator) => validator.group === 'Inactive').length === 0) {
          this.validators = [
            { header: 'Active' },
            ...validatorsData.filter((validator) => validator.group === 'Active'),
          ];
        } else if (validatorsData.filter((validator) => validator.group === 'Active').length === 0 && validatorsData.filter((validator) => validator.group === 'Inactive').length > 0) {
          this.validators = [
            { header: 'Inactive' },
            ...validatorsData.filter((validator) => validator.group === 'Inactive'),
          ];
        } else {
          this.validators = [
            { header: 'Active' },
            ...validatorsData.filter((validator) => validator.group === 'Active'),
            { divider: true },
            { header: 'Inactive' },
            ...validatorsData.filter((validator) => validator.group === 'Inactive'),
          ];
        }
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
