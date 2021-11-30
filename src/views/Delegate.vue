<template>
  <operation
    :amount="amount"
    :fee="delegationFee"
    :loading-sign-and-deploy="loadingSignAndDeploy"
    :remaining-balance="remainingBalance"
    :send-deploy="sendDeploy"
    :type="type"
    icon="mdi-safe"
    submit-title="Stake"
    title="Stake"
  >
    <Validators
      v-model="validator"
      :undelegate="false"
    />
    <Amount
      :balance="balance"
      :fee="delegationFee"
      :min="minimumCSPRStake"
      :value="amount"
      class="mb-4"
      @input="amount = $event"
    />
    <div class="mx-n1">
      <v-row
        class="white-bottom-border"
      >
        <v-col>Staking operation fee</v-col>
        <v-col class="text-right cspr">
          {{ delegationFee }} CSPR
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
      <v-row class="white-bottom-border">
        <v-col>Remaining funds after staking</v-col>
        <v-col class="text-right cspr">
          {{ remainingBalance }} CSPR
        </v-col>
      </v-row>
      <v-row>
        <v-col class="py-0">
          <reward-calculator-panel
            :validator="validator"
            :amount="amount"
          />
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
import RewardCalculatorPanel from '@/components/chart/RewardCalculatorPanel';
import Amount from '@/components/operations/Amount';
import Operation from '@/components/operations/Operation';
import Validators from '@/components/operations/Validators';
import balanceService from '@/helpers/balanceService';
import deployManager from '@/helpers/deployManager';
import { AUCTION_MANAGER_HASH, NETWORK } from '@/helpers/env';
import { Delegate } from '@casperholders/core/dist/services/deploys/auction/actions/delegate';
import { InsufficientFunds } from '@casperholders/core/dist/services/errors/insufficientFunds';
import { NoActiveKeyError } from '@casperholders/core/dist/services/errors/noActiveKeyError';
import { DelegateResult } from '@casperholders/core/dist/services/results/delegateResult';
import { mapGetters, mapState } from 'vuex';

/**
 * Delegate view
 * Contains one fields
 * - Amount to delegate to the node set in the .env file
 */
export default {
  name: 'Delegate',
  components: { RewardCalculatorPanel, Validators, Amount, Operation },
  data() {
    return {
      minimumCSPRStake: 1,
      delegationFee: 5.0,
      amount: '1',
      errorBalance: null,
      balance: '0',
      loadingSignAndDeploy: false,
      errorDeploy: null,
      loadingBalance: false,
      type: DelegateResult.getName(),
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
      const result = this.balance - this.amount - this.delegationFee;
      return Math.trunc(result) >= 0 ? Number(result.toFixed(5)) : 0;
    },
    minimumFundsNeeded() {
      return this.minimumCSPRStake + this.delegationFee;
    },
    isInstanceOfNoActiveKeyError() {
      return this.errorBalance instanceof NoActiveKeyError;
    },
  },
  watch: {
    'signer.activeKey': 'getBalance',
  },
  async mounted() {
    await this.getBalance();
    this.$root.$on('operationOnGoing', () => {
      this.errorDeploy = null;
    });
  },
  methods: {
    /**
     * Get the user balance
     */
    async getBalance() {
      this.loadingBalance = true;
      this.errorBalance = null;
      this.balance = '0';
      try {
        this.balance = await balanceService.fetchBalance();
        if (this.balance <= this.minimumFundsNeeded) {
          throw new InsufficientFunds(this.minimumFundsNeeded);
        }
      } catch (e) {
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
          new Delegate(
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
        console.log(e);
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

<style
  lang="scss"
  scoped
>
  ::v-deep .reward-calculator-panel {
    .v-expansion-panel-header, .v-expansion-panel-content__wrap {
      padding-left: 0 !important;
      padding-right: 0 !important;
    }
  }
</style>
