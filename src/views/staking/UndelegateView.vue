<template>
  <operation-card
    :amount="amount"
    :fee="undelegateFee"
    :loading-sign-and-deploy="loadingSignAndDeploy"
    :remaining-balance="remainingBalance"
    :send-deploy="sendDeploy"
    :type="type"
    icon="mdi-lock-open"
    submit-title="Unstake"
    title="Unstake"
  >
    <ValidatorInput
      v-model="validator"
      :undelegate="true"
    />
    <AmountInput
      :balance="stakingBalance"
      :fee="Number(0)"
      :min="minimumCSPRUnstake"
      :value="amount"
      class="mb-4"
      @input="amount = $event"
    />
    <operation-summary
      :prepend-values="[{ name: 'Staking balance', value: stakingBalance }]"
      :balance-loading="loadingBalance"
      :balance="balance"
      :fee="undelegateFee"
      :amount="amount"
      class="mx-n1"
    />
    <v-alert
      v-if="errorBalance"
      class="mt-5"
      dense
      prominent
      type="error"
    >
      <v-row align="center">
        <v-col class="grow">
          {{ errorBalance.message }}
        </v-col>
        <v-col class="shrink">
          <v-btn
            v-if="isInstanceOfNoActiveKeyError"
            color="primary"
            @click="connectionRequest"
          >
            <v-icon left>
              mdi-account-circle
            </v-icon>
            Connect
          </v-btn>
        </v-col>
      </v-row>
    </v-alert>
    <v-alert
      v-if="errorDeploy"
      class="mt-5"
      dense
      type="error"
    >
      {{ errorDeploy.message }}
    </v-alert>
  </operation-card>
</template>

<script>
import AmountInput from '@/components/operations/Amountinput';
import OperationCard from '@/components/operations/OperationCard';
import OperationSummary from '@/components/operations/OperationSummary';
import ValidatorInput from '@/components/operations/ValidatorInput';
import balanceService from '@/helpers/balanceService';
import { AUCTION_MANAGER_HASH, NETWORK } from '@/helpers/env';
import genericSendDeploy from '@/helpers/genericSendDeploy';
import {
  InsufficientFunds,
  NoActiveKeyError,
  Undelegate,
  UndelegateResult,
} from '@casperholders/core';
import Big from 'big.js';
import { mapGetters, mapState } from 'vuex';

/**
 * Undelegate view
 * Contains one fields
 * - Amount to undelegate to the node set in the .env file
 */
export default {
  name: 'UndelegateView',
  components: { OperationSummary, ValidatorInput, AmountInput, OperationCard },
  data() {
    return {
      minimumCSPRUnstake: 1,
      undelegateFee: 0.00001,
      amount: '1',
      errorBalance: null,
      balance: '0',
      stakingBalance: '0',
      loadingSignAndDeploy: false,
      errorDeploy: null,
      loadingBalance: false,
      type: UndelegateResult.getName(),
      validator: undefined,
    };
  },
  computed: {
    ...mapState([
      'signer',
      'internet',
    ]),
    ...mapGetters([
      'signerObject',
      'signerOptionsFactory',
      'activeKey',
    ]),
    remainingBalance() {
      const result = Big(this.balance).plus(this.amount).minus(this.undelegateFee);
      return result.gte(0) ? Big(result.toFixed(5)).toNumber() : 0;
    },
    minimumFundsNeeded() {
      return this.undelegateFee;
    },
    isInstanceOfNoActiveKeyError() {
      return this.errorBalance instanceof NoActiveKeyError;
    },
  },
  watch: {
    'signer.activeKey': 'getBalance',
    async internet(val) {
      if (val) {
        await this.getBalance();
      }
    },
    validator: 'getBalance',
  },
  async mounted() {
    await this.getBalance();
    this.$root.$on('operationOnGoing', () => {
      this.errorDeploy = null;
    });
  },
  methods: {
    /**
     * Get the user balance and staking balance
     */
    async getBalance() {
      this.loadingBalance = true;
      this.errorBalance = null;
      this.balance = '0';
      this.stakingBalance = '0';
      try {
        this.balance = await balanceService.fetchBalance();
        if (this.validator) {
          this.stakingBalance = await balanceService
            .fetchStakeBalance(this.validator.publicKey);
        }
        if (this.balance <= this.minimumFundsNeeded && this.internet) {
          throw new InsufficientFunds(this.minimumFundsNeeded);
        }
      } catch (e) {
        console.log(e);
        this.errorBalance = e;
      }
      this.loadingBalance = false;
    },
    /**
     * Method used by the OperationDialog component when the user confirm the operation.
     * Use the prepareSignAndSendDeploy method from the core library
     * Update the store with a deploy result containing the deployhash of the deploy sent
     */
    async sendDeploy() {
      const deployParameter = new Undelegate(
        this.amount,
        this.activeKey,
        this.validator.publicKey,
        NETWORK,
        AUCTION_MANAGER_HASH,
      );
      const options = this.signerOptionsFactory.getOptionsForOperations();
      this.errorDeploy = null;
      this.loadingSignAndDeploy = true;
      const result = await genericSendDeploy(
        this.internet,
        this.activeKey,
        this.signer.activeKey,
        this.signerObject,
        deployParameter,
        options,
        this.undelegateFee,
        this.amount,
      );
      if (result.error) {
        console.log(result.error);
        this.errorDeploy = result.error;
      } else {
        await this.$store.dispatch(result.event, result.data);
      }
      this.loadingSignAndDeploy = false;
      this.$root.$emit('closeOperationDialog');
      this.$root.$emit('operationFinished');
    },
    async connectionRequest() {
      await this.$store.dispatch('openConnectDialog');
    },
  },
};
</script>