<template>
  <operation-card
    :loading-sign-and-deploy="loadingSignAndDeploy"
    :send-deploy="sendDeploy"
    :type="type"
    :balance="balance"
    :fee="delegationFee"
    :amount="`-${amount}`"
    :icon="mdiSafe"
    submit-title="Stake"
    title="Stake"
    :disable-title="true"
  >
    <ValidatorInput
      v-model="validator"
      :undelegate="false"
      :initial-validator="validatorParam"
    />
    <AmountInput
      :balance="balance"
      :fee="delegationFee"
      :min="minimumCSPRStake"
      :value="amount"
      class="mb-4"
      @input="amount = $event"
    />
    <operation-summary
      :balance-loading="loadingBalance"
      :balance="balance"
      :fee="delegationFee"
      :amount="`-${amount}`"
      class="mx-n1"
    />
    <reward-calculator-panel
      :validator="validator"
      :amount="amount"
    />
    <v-alert
      v-if="errorBalance"
      data-cy="errorBalance"
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
              {{ mdiAccountCircle }}
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
import RewardCalculatorPanel from '@/components/chart/RewardCalculatorPanel';
import AmountInput from '@/components/forms/inputs/AmountInput';
import OperationCard from '@/components/operations/OperationCard';
import OperationSummary from '@/components/operations/OperationSummary';
import ValidatorInput from '@/components/forms/inputs/ValidatorInput';
import balanceService from '@/helpers/balanceService';
import { AUCTION_MANAGER_HASH, NETWORK } from '@/helpers/env';
import genericSendDeploy from '@/helpers/genericSendDeploy';
import { Delegate, DelegateResult, InsufficientFunds, NoActiveKeyError } from '@casperholders/core';
import { mdiAccountCircle, mdiSafe } from '@mdi/js';
import { mapGetters, mapState } from 'vuex';

/**
 * Delegate view
 * Contains one fields
 * - Amount to delegate to the node set in the .env file
 */
export default {
  name: 'DelegateView',
  components: {
    OperationSummary,
    RewardCalculatorPanel,
    ValidatorInput,
    AmountInput,
    OperationCard,
  },
  data() {
    return {
      mdiSafe,
      mdiAccountCircle,
      minimumCSPRStake: 500,
      delegationFee: 2.5,
      amount: '500',
      errorBalance: null,
      balance: '0',
      loadingSignAndDeploy: false,
      errorDeploy: null,
      loadingBalance: true,
      type: DelegateResult.getName(),
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
    minimumFundsNeeded() {
      return this.minimumCSPRStake + this.delegationFee;
    },
    isInstanceOfNoActiveKeyError() {
      return this.errorBalance instanceof NoActiveKeyError;
    },
    validatorParam() {
      return this.$route.params.validator;
    },
  },
  watch: {
    'signer.activeKey': 'getBalance',
    async internet(val) {
      if (val) {
        await this.getBalance();
      }
    },
    validator: 'setMinStake',
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
    async setMinStake() {
      try {
        const userStake = await balanceService.fetchAllStakeBalance();
        const alreadyStake = userStake.some(
          (stake) => stake.validator.toLowerCase() === this.validator.publicKey.toLowerCase(),
        );
        this.minimumCSPRStake = alreadyStake ? 1 : 500;
      } catch (e) {
        this.minimumCSPRStake = 500;
      }
    },
    /**
     * Get the user balance
     */
    async getBalance() {
      this.loadingBalance = true;
      this.errorBalance = null;
      this.balance = '0';
      try {
        this.balance = await balanceService.fetchBalance();
        if (this.balance <= this.minimumFundsNeeded && this.internet) {
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
      const deployParameter = new Delegate(
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
        this.delegationFee,
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
