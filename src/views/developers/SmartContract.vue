<template>
  <operation
    :amount="amount"
    :fee="0"
    :loading-sign-and-deploy="loadingSignAndDeploy"
    :remaining-balance="remainingBalance"
    :send-deploy="sendDeploy"
    :type="type"
    icon="mdi-file-document-edit"
    submit-title="Deploy"
    title="Send smart contract"
  >
    <v-file-input
      id="smartContractFile"
      v-model="contract"
      :show-size="1000"
      accept=".wasm"
      color="white"
      counter
      label="Smart Contracts"
      outlined
      placeholder="Select your contracts"
      prepend-icon="mdi-paperclip"
    >
      <template #selection="{ text }">
        {{ text }}
      </template>
    </v-file-input>
    <Amount
      :balance="balance"
      :fee="Number(0)"
      :min="minPayment"
      :value="amount"
      class="mb-4"
      @input="amount = $event"
    />
    <div class="mx-n1">
      <v-row
        class="white-bottom-border"
      >
        <v-col>Payment amount for the smart contract</v-col>
        <v-col class="text-right cspr">
          {{ amount }} CSPR
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
        <v-col>Total cost</v-col>
        <v-col class="text-right cspr">
          {{ amount }} CSPR
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
import { NETWORK } from '@/helpers/env';
import {
  SmartContractDeployParameters,
  InsufficientFunds,
  NoActiveKeyError,
  SmartContractResult,
} from '@casperholders/core';
import { DeployUtil } from 'casper-js-sdk';
import { mapGetters, mapState } from 'vuex';

/**
 * SmartContract view
 * Contains two fields
 * - Amount of fee to deploy the smartcontract
 * - File input for the wasm smart contract
 */
export default {
  name: 'SmartContract',
  components: { Amount, Operation },
  data() {
    return {
      minPayment: 1,
      contract: [],
      amount: '1',
      balance: '0',
      errorBalance: null,
      loadingSignAndDeploy: false,
      errorDeploy: null,
      loadingBalance: false,
      type: SmartContractResult.getName(),
      buffer: null,
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
      const result = this.balance - this.amount;
      return Math.trunc(result) >= 0 ? Number(result.toFixed(5)) : 0;
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
    /**
     * Read the file selected by the user
     */
    contract() {
      const reader = new FileReader();

      reader.onload = (evt) => {
        this.buffer = evt.target.result;
      };

      reader.onerror = (evt) => {
        console.error('An error ocurred reading the file', evt);
      };

      reader.readAsArrayBuffer(this.contract, 'UTF-8');
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
     * Get the user balance
     */
    async getBalance() {
      this.loadingBalance = true;
      this.errorBalance = null;
      this.balance = '0';
      try {
        this.balance = await balanceService.fetchBalance();
        if (this.balance <= this.minPayment && this.internet) {
          throw new InsufficientFunds(this.minPayment);
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
      const deployParameter = new SmartContractDeployParameters(
        this.activeKey,
        NETWORK,
        this.buffer,
        this.amount,
      );
      const options = this.signerOptionsFactory.getOptionsForOperations();
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
