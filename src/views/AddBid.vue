<template>
  <operation
    :amount="amount"
    :fee="bidFee"
    :loading-sign-and-deploy="loadingSignAndDeploy"
    :remaining-balance="remainingBalance"
    :send-deploy="sendDeploy"
    :type="type"
    icon="mdi-gavel"
    submit-title="Add bid"
    title="Add bid"
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
      (Applies on the staking rewards only.)
      <br>
      Example : if your delegators receive 100 CSPR rewards from staking,
      you will received {{ commission }} CSPR and they will
      get {{ 100 - commission }} CSPR.
    </p>
    <Amount
      :balance="balance"
      :fee="bidFee"
      :min="minBid"
      :value="amount"
      class="mb-14"
      @input="amount = $event"
    />
    <v-slider
      v-model="commission"
      color="white"
      label="Commission rate"
      thumb-color="quaternary"
      thumb-label="always"
      track-color="white"
      track-fill-color="white"
    />
    <div class="mx-n1">
      <v-row
        class="white-bottom-border"
      >
        <v-col>Add bid operation fee</v-col>
        <v-col class="text-right cspr">
          {{ bidFee }} CSPR
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
      <v-row
        class="white-bottom-border"
      >
        <v-col>Validator bid</v-col>
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
            {{ validatorBalance }} CSPR
          </template>
        </v-col>
      </v-row>
      <v-row>
        <v-col>Balance after operation</v-col>
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
import balanceService from '@/helpers/balanceService';
import deployManager from '@/helpers/deployManager';
import { AUCTION_MANAGER_HASH, CSPR_LIVE_URL, NETWORK } from '@/helpers/env';
import { AddBid } from '@casperholders/core/dist/services/deploys/auction/actions/addBid';
import { InsufficientFunds } from '@casperholders/core/dist/services/errors/insufficientFunds';
import { NoActiveKeyError } from '@casperholders/core/dist/services/errors/noActiveKeyError';
import { AddBidResult } from '@casperholders/core/dist/services/results/addBidResult';
import { DeployUtil } from 'casper-js-sdk';
import { mapGetters, mapState } from 'vuex';

/**
 * AddBid view
 * Contains two fields
 * - Amount to add to the bid of the validator
 * - Slider to adjust the commission rate of the validator
 */
export default {
  name: 'AddBid',
  components: { Amount, Operation },
  data() {
    return {
      minBid: 1,
      bidFee: 2.50001,
      amount: '1',
      balance: '0',
      validatorBalance: '0',
      commission: 0,
      errorBalance: null,
      loadingSignAndDeploy: false,
      errorDeploy: null,
      loadingBalance: false,
      type: AddBidResult.getName(),
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
    ]),
    remainingBalance() {
      const result = this.balance - this.amount - this.bidFee;
      return Math.trunc(result) >= 0 ? Number(result.toFixed(5)) : 0;
    },
    validatorUrl() {
      return `${CSPR_LIVE_URL}validator/${this.signer.activeKey}`;
    },
    minimumFundsNeeded() {
      return this.minBid + this.bidFee;
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
      const deployParameter = new AddBid(
        this.amount,
        this.signer.activeKey,
        this.commission,
        NETWORK,
        AUCTION_MANAGER_HASH,
      );
      const options = this.signerOptionsFactory.getOptionsForValidatorOperations();

      await this.genericSendDeploy(deployParameter, options);
    },
    async genericSendDeploy(deployParameter, options) {
      this.errorDeploy = null;
      this.loadingSignAndDeploy = true;
      try {
        if (this.internet) {
          const deployResult = await deployManager.prepareSignAndSendDeploy(
            deployParameter,
            this.signerObject,
            options,
          );
          await this.$store.dispatch('addDeployResult', deployResult);
        } else {
          const signedDeploy = await this.signerObject.sign(deployParameter.makeDeploy, options);
          const { deployResult } = deployParameter;
          const pendingDeploy = {
            deploy: signedDeploy,
            // eslint-disable-next-line new-cap
            deployResult: new deployResult(DeployUtil.deployToJson(signedDeploy).deploy.hash),
            deployResultType: deployResult,
          };
          await this.$store.dispatch('addOfflineDeploy', pendingDeploy);
        }
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
