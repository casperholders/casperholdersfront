<template>
  <operation
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
    <Validators
      v-model="validator"
      :undelegate="true"
    />
    <Amount
      :balance="stakingBalance"
      :fee="Number(0)"
      :min="minimumCSPRUnstake"
      :value="amount"
      class="mb-4"
      @input="amount = $event"
    />
    <div class="mx-n1">
      <v-row
        class="white-bottom-border"
      >
        <v-col>Undelegation fee</v-col>
        <v-col class="text-right cspr">
          {{ undelegateFee }} CSPR
        </v-col>
      </v-row>
      <v-row
        class="white-bottom-border"
      >
        <v-col>Staking balance</v-col>
        <v-col class="text-right cspr">
          {{ stakingBalance }} CSPR
        </v-col>
      </v-row>
      <v-row
        class="white-bottom-border"
      >
        <v-col>Balance</v-col>
        <v-col class="text-right cspr">
          <template v-if="loadingBalance">
            Loading balance ...
            <v-progress-circular
              class="ml-3"
              color="white"
              indeterminate
              size="14"
            />
          </template>
          <template v-else>
            {{ balance }} CSPR
          </template>
        </v-col>
      </v-row>
      <v-row>
        <v-col>Balance after unstake</v-col>
        <v-col class="text-right cspr">
          {{ remainingBalance }} CSPR
        </v-col>
      </v-row>
    </div>
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
  </operation>
</template>

<script>
import Amount from '@/components/operations/Amount';
import Operation from '@/components/operations/Operation';
import Validators from '@/components/operations/Validators';
import balanceService from '@/helpers/balanceService';
import deployManager from '@/helpers/deployManager';
import { AUCTION_MANAGER_HASH, NETWORK } from '@/helpers/env';
import { Undelegate } from '@casperholders/core/dist/services/deploys/auction/actions/undelegate';
import { InsufficientFunds } from '@casperholders/core/dist/services/errors/insufficientFunds';
import { NoActiveKeyError } from '@casperholders/core/dist/services/errors/noActiveKeyError';
import { UndelegateResult } from '@casperholders/core/dist/services/results/undelegateResult';
import Big from 'big.js';
import { mapGetters, mapState } from 'vuex';

/**
 * Undelegate view
 * Contains one fields
 * - Amount to undelegate to the node set in the .env file
 */
export default {
  name: 'Undelegate',
  components: { Validators, Amount, Operation },
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
    ]),
    ...mapGetters([
      'signerObject',
      'signerOptionsFactory',
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
        if (this.balance <= this.minimumFundsNeeded) {
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
      this.errorDeploy = null;
      this.loadingSignAndDeploy = true;
      try {
        const deployResult = await deployManager.prepareSignAndSendDeploy(
          new Undelegate(
            this.amount,
            this.signer.activeKey,
            this.validator.publicKey,
            NETWORK,
            AUCTION_MANAGER_HASH,
          ),
          this.signerObject,
          this.signerOptionsFactory.getOptionsForOperations(),
        );
        await this.$store.dispatch('addDeployResult', deployResult);
      } catch (e) {
        this.errorDeploy = e;
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
