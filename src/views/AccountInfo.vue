<template>
  <operation
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
    <div class="mx-n1">
      <v-row
        class="white-bottom-border"
      >
        <v-col>Account info fee</v-col>
        <v-col class="text-right cspr">
          {{ accountInfoFee }} CSPR
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
import Operation from '@/components/operations/Operation';
import balanceService from '@/helpers/balanceService';
import clientCasper from '@/helpers/clientCasper';
import deployManager from '@/helpers/deployManager';
import { ACCOUNT_INFO_HASH, NETWORK } from '@/helpers/env';
import { AccountInfo } from '@casperholders/core/dist/services/deploys/account-info/AccountInfo';
import { InsufficientFunds } from '@casperholders/core/dist/services/errors/insufficientFunds';
import { NoActiveKeyError } from '@casperholders/core/dist/services/errors/noActiveKeyError';
import { AccountInfoResult } from '@casperholders/core/dist/services/results/accountInfoResult';
import { Validators } from '@casperholders/core/dist/services/validators/validators';
import { DeployUtil } from 'casper-js-sdk';
import { mapGetters, mapState } from 'vuex';

/**
 * AccountInfo view
 * Contains one fields
 * - Url to set in the Account Info smart contract. See https://github.com/make-software/casper-account-info-standard#how-does-it-work
 */
export default {
  name: 'AccountInfo',
  components: { Operation },
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
      const regex = new RegExp('^(http:\\/\\/|https:\\/\\/)([a-zA-Z0-9-_]+\\.)*[a-zA-Z0-9][a-zA-Z0-9-_]+\\.[a-zA-Z]{2,11}?$', 'g');
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
        NETWORK,
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
