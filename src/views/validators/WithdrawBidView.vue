<template>
  <operation-card
    :loading-sign-and-deploy="loadingSignAndDeploy"
    :send-deploy="sendDeploy"
    :type="type"
    :prepend-values="[{
      name: 'Validator bid',
      value: validatorBalance,
      loading: loadingBalance,
    }]"
    :balance-loading="loadingBalance"
    :balance="balance"
    :fee="bidFee"
    :amount="amount"
    icon="mdi-connection"
    submit-title="Withdraw bid"
    title="Withdraw bid"
  >
    <p class="text-body-1">
      Here's your validator :
      <a
        :href="validatorUrl"
        target="_blank"
        rel="noopener"
      >
        {{ signer.activeKey }}
        <v-icon x-small>mdi-open-in-new</v-icon>
      </a>
      <br>
      <br>
      Actually there's a commission rate of {{ commission }}%.
      (Applies on the staking rewards only.)<br>
      Example : if your delegators receive 100 CSPR rewards from staking,
      you will received {{ commission }} CSPR and they will get
      {{ 100 - commission }} CSPR.
    </p>
    <AmountInput
      :balance="validatorBalance"
      :fee="bidFee"
      :min="minBid"
      :value="amount"
      class="mb-4"
      @input="amount = $event"
    />
    <operation-summary
      :prepend-values="[{
        name: 'Validator bid',
        value: validatorBalance,
        loading: loadingBalance,
      }]"
      :balance-loading="loadingBalance"
      :balance="balance"
      :fee="bidFee"
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
import balanceService from '@/helpers/balanceService';
import { AUCTION_MANAGER_HASH, CSPR_LIVE_URL, NETWORK } from '@/helpers/env';
import genericSendDeploy from '@/helpers/genericSendDeploy';
import {
  InsufficientFunds,
  NoActiveKeyError,
  WithdrawBid,
  WithdrawBidResult,
} from '@casperholders/core';
import { mapGetters, mapState } from 'vuex';

/**
 * WithdrawBid view
 * Contains one fields
 * - Amount to withdraw to the bid of the validator
 */
export default {
  name: 'WithdrawBidView',
  components: { OperationSummary, AmountInput, OperationCard },
  data() {
    return {
      minBid: 1,
      bidFee: 0.00001,
      amount: '1',
      balance: '0',
      validatorBalance: '0',
      commission: 0,
      errorBalance: null,
      loadingSignAndDeploy: false,
      errorDeploy: null,
      loadingBalance: false,
      type: WithdrawBidResult.getName(),
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
    validatorUrl() {
      return `${CSPR_LIVE_URL}validator/${this.activeKey}`;
    },
    minimumFundsNeeded() {
      return this.bidFee;
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
  },
  async mounted() {
    await this.getBalance();
    this.$root.$on('operationOnGoing', () => {
      this.errorDeploy = null;
    });
  },
  methods: {
    /**
     * Get the user balance and the validator balance
     */
    async getBalance() {
      this.loadingBalance = true;
      this.errorBalance = null;
      this.balance = '0';
      this.validatorBalance = '0';
      this.commission = 0;
      try {
        this.balance = await balanceService.fetchBalance();
        const validatorInfos = await balanceService.fetchValidatorBalance();
        this.validatorBalance = validatorInfos.balance;
        this.commission = validatorInfos.commission;
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
      const deployParameter = new WithdrawBid(
        this.amount,
        this.activeKey,
        NETWORK,
        AUCTION_MANAGER_HASH,
      );
      const options = this.signerOptionsFactory.getOptionsForValidatorOperations();
      this.errorDeploy = null;
      this.loadingSignAndDeploy = true;
      const result = await genericSendDeploy(
        this.internet,
        this.activeKey,
        this.signer.activeKey,
        this.signerObject,
        deployParameter,
        options,
        this.bidFee,
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
