<template>
  <operation-card
    :loading-sign-and-deploy="loadingSignAndDeploy"
    :send-deploy="sendDeploy"
    :type="type"
    :balance="balance"
    :fee="amount"
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
    <AmountInput
      :balance="balance"
      :fee="Number(0)"
      :min="minPayment"
      :value="amount"
      class="mb-4"
      @input="amount = $event"
    />
    <operation-summary
      :balance-loading="loadingBalance"
      :balance="balance"
      :fee="amount"
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
import { NETWORK } from '@/helpers/env';
import genericSendDeploy from '@/helpers/genericSendDeploy';
import {
  InsufficientFunds,
  NoActiveKeyError,
  SmartContractDeployParameters,
  SmartContractResult,
} from '@casperholders/core';
import { mapGetters, mapState } from 'vuex';

/**
 * SmartContract view
 * Contains two fields
 * - Amount of fee to deploy the smartcontract
 * - File input for the wasm smart contract
 */
export default {
  name: 'SmartContractView',
  components: { OperationSummary, AmountInput, OperationCard },
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
      this.errorDeploy = null;
      this.loadingSignAndDeploy = true;
      const result = await genericSendDeploy(
        this.internet,
        this.activeKey,
        this.signer.activeKey,
        this.signerObject,
        deployParameter,
        options,
        '0',
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
