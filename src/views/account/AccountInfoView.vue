<template>
  <operation-card
    :amount="amount"
    :fee="accountInfoFee"
    :loading-sign-and-deploy="loadingSignAndDeploy"
    :remaining-balance="remainingBalance"
    :send-deploy="sendDeploy"
    :type="type"
    icon="mdi-account"
    submit-title="Set url"
    title="Account info"
  >
    <p class="text-body-1">
      Set url for the Account Info Smart Contract. See
      <a
        href="https://github.com/make-software/casper-account-info-standard#how-does-it-work"
        target="_blank"
        rel="noopener"
      >here</a> for more details.
    </p>
    <p>
      First deploy cost 10 CSPR, updates cost 0.5 CSPR. This is automatically calculated.
    </p>
    <v-text-field
      id="url"
      v-model="url"
      :rules="urlRules"
      :value="url"
      color="white"
      hint="Base domain name"
      label="URL"
      prepend-icon="mdi-link"
      required
    />
    <operation-summary
      :balance-loading="loadingBalance"
      :balance="balance"
      :fee="accountInfoFee"
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
import OperationCard from '@/components/operations/OperationCard';
import OperationSummary from '@/components/operations/OperationSummary';
import balanceService from '@/helpers/balanceService';
import clientCasper from '@/helpers/clientCasper';
import { ACCOUNT_INFO_HASH, NETWORK } from '@/helpers/env';
import genericSendDeploy from '@/helpers/genericSendDeploy';
import {
  AccountInfo,
  AccountInfoResult,
  InsufficientFunds,
  NoActiveKeyError,
  Validators,
} from '@casperholders/core';
import { mapGetters, mapState } from 'vuex';

/**
 * AccountInfo view
 * Contains one fields
 * - Url to set in the Account Info smart contract. See https://github.com/make-software/casper-account-info-standard#how-does-it-work
 */
export default {
  name: 'AccountInfoView',
  components: { OperationSummary, OperationCard },
  data() {
    return {
      url: '',
      urlRules: [
        (a) => !!a || 'URL is required',
        (a) => this.isUrl(a) || 'Non valid base domain : should be https://domain.name',
      ],
      accountInfoFee: 0.5,
      amount: '0',
      balance: '0',
      errorBalance: null,
      loadingSignAndDeploy: false,
      errorDeploy: null,
      loadingBalance: false,
      type: AccountInfoResult.getName(),
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
      const result = this.balance - this.accountInfoFee;
      return Math.trunc(result) >= 0 ? Number(result.toFixed(5)) : 0;
    },
    minimumFundsNeeded() {
      return this.accountInfoFee;
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
     * Method to verify url
     * @param {string} url
     */
    isUrl(url) {
      const regex = /^(http:\/\/|https:\/\/)([a-zA-Z0-9-_]+\.)*[a-zA-Z0-9][a-zA-Z0-9-_]+\.[a-zA-Z]{2,11}?$/g;
      return regex.test(url);
    },
    /**
     * Get the user balance and the validator balance
     */
    async getBalance() {
      const validatorService = new Validators(clientCasper);
      this.accountInfoFee = await validatorService.isUrlSet(
        this.activeKey,
        ACCOUNT_INFO_HASH,
      ) ? 0.5 : 10;
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
      const deployParameter = new AccountInfo(
        this.url,
        this.activeKey,
        NETWORK,
        ACCOUNT_INFO_HASH,
      );
      const options = this.signerOptionsFactory.getOptionsForOperations();

      await deployParameter.init(clientCasper);
      this.errorDeploy = null;
      this.loadingSignAndDeploy = true;
      const result = await genericSendDeploy(
        this.internet,
        this.activeKey,
        this.signer.activeKey,
        this.signerObject,
        deployParameter,
        options,
        this.accountInfoFee,
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
