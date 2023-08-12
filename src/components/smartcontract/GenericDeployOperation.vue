<template>
  <operation
    :amount="0"
    :fee="amount"
    :loading-sign-and-deploy="loadingSignAndDeploy"
    :loading-simulate="loadingSimulate"
    :simulate-deploy="simulateFees"
    :remaining-balance="remainingBalance"
    :send-deploy="sendDeploy"
    :type="type"
    :balance="balance"
    :icon="mdiFileDocumentEdit"
    submit-title="Deploy"
    title="Send smart contract"
  >
    <v-text-field
      color="white"
      label="Contract Package Hash"
      type="text"
      :value="contractPackageHash"
      :readonly="true"
      data-cy="contractPackageHash"
      required
    />
    <v-text-field
      color="white"
      label="Contract Hash"
      type="text"
      :value="contractHash"
      :readonly="true"
      data-cy="contractHash"
      required
    />
    <v-text-field
      color="white"
      label="Entrypoint"
      type="text"
      :value="entrypoint"
      :readonly="true"
      data-cy="entrypoint"
      required
    />
    <v-expansion-panels>
      <v-expansion-panel
        v-for="(item,i) in deployArgs"
        :key="item.lid"
        class="mt-2"
        style="border: thin solid rgba(255, 255, 255, 0.12)"
        :data-cy="`arg-panel-${item.name || i + 1}`"
      >
        <v-expansion-panel-header>Argument {{ item.name || i + 1 }}</v-expansion-panel-header>
        <v-expansion-panel-content>
          <Argument
            :arg-name="item.name"
            :cl-type="checkClType(item.cl_type)"
            :data-cy="`arg-panel-content-${item.name || i + 1}`"
            @value="item.value = $event"
            @name="item.name = $event"
          />
          <v-btn
            :data-cy="`arg-delete-${item.name || i + 1}`"
            color="error"
            rounded
            @click="deployArgs.splice(i, 1);"
          >
            Delete argument
          </v-btn>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
    <div class="text-center">
      <v-btn
        color="primary"
        class="mt-5"
        rounded
        @click="onAddArgument"
      >
        Add argument
      </v-btn>
    </div>
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
      <v-row
        class="white-bottom-border"
      >
        <v-col>Balance after operation</v-col>
        <v-col class="text-right cspr">
          {{ remainingBalance }} CSPR
        </v-col>
      </v-row>
      <v-row
        class="white-bottom-border"
      >
        <v-col>Simulated Result</v-col>
        <v-col class="text-right cspr">
          {{ simulatedResult }}
        </v-col>
      </v-row>
      <v-row>
        <v-col>Estimated deploy fee</v-col>
        <v-col class="text-right cspr">
          {{ specExecFee }}
          <v-btn
            v-if="specExecFee !== 'N/A'"
            small
            class="primary default-font font-weight-bold"
            @click="amount = specExecFee"
          >
            <v-icon left>
              {{ mdiDownloadOutline }}
            </v-icon>
            Apply
          </v-btn>
        </v-col>
      </v-row>
    </div>
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
  </operation>
</template>

<script>
import Amount from '@/components/forms/inputs/AmountInput';
import Argument from '@/components/forms/inputs/ArgumentInput';
import Operation from '@/components/operations/OperationCard';
import balanceService from '@/helpers/balanceService';
import { NETWORK } from '@/helpers/env';
import generateLid from '@/helpers/generateLid';
import genericSendDeploy from '@/helpers/genericSendDeploy';
import specExec from '@/helpers/specExec';
import {
  GenericContractDeployParameters,
  InsufficientFunds,
  NoActiveKeyError,
  SmartContractResult,
} from '@casperholders/core';
import CurrencyUtils from '@casperholders/core/src/services/helpers/currencyUtils';
import { mdiAccountCircle, mdiDownloadOutline, mdiFileDocumentEdit } from '@mdi/js';
import { mapGetters, mapState } from 'vuex';

/**
 * GenericDeployOperation
 * Contains fields :
 * - SmartContract Hash
 * - Entrypoint
 * - Args
 * - Amount of fee to deploy the smartcontract operation
 */
export default {
  name: 'GenericDeployOperation',
  components: { Argument, Amount, Operation },
  props: {
    contractPackageHash: {
      type: String,
      required: true,
    },
    contractHash: {
      type: String,
      required: true,
    },
    entrypoint: {
      type: String,
      required: true,
    },
    args: {
      type: Array,
      default: () => ([]),
    },
  },
  data() {
    return {
      mdiFileDocumentEdit,
      mdiAccountCircle,
      mdiDownloadOutline,
      minPayment: 0,
      contract: [],
      amount: '1',
      balance: '0',
      errorBalance: null,
      loadingSignAndDeploy: false,
      loadingSimulate: false,
      errorDeploy: null,
      loadingBalance: true,
      type: SmartContractResult.getName(),
      buffer: null,
      deployArgs: this.args,
      specExecFee: 'N/A',
      simulatedResult: 'N/A',
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
    args() {
      this.deployArgs = this.args;
    },
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
     * Add a new arg to the list.
     */
    onAddArgument() {
      this.deployArgs.push({
        lid: generateLid(this.deployArgs.map(({ lid }) => lid)),
      });
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
        if (this.balance <= this.minPayment && this.internet) {
          throw new InsufficientFunds(this.minPayment);
        }
      } catch (e) {
        this.errorBalance = e;
      }
      this.loadingBalance = false;
    },
    /**
     * Method used by the OperationSimulateDialog component when the user confirm the operation.
     * Simulate the deploy against the network.
     */
    async simulateFees() {
      this.loadingSimulate = true;
      this.simulatedResult = 'N/A';
      this.specExecFee = 'N/A';
      try {
        const args = {};
        this.deployArgs.forEach((a) => {
          args[a.name] = a.value;
        });
        const deployParameter = new GenericContractDeployParameters(
          this.activeKey,
          NETWORK,
          this.contractHash,
          this.entrypoint,
          this.balance,
          args,
        );
        const signedDeploy = await this.signerObject
          .sign(deployParameter.makeDeploy, this.signerOptionsFactory.getOptionsForOperations());
        const result = await specExec.casperClient.speculativeDeploy(signedDeploy);
        console.log(result);
        const error = result.execution_result.Failure?.error_message;
        let cost = result.execution_result.Success?.cost;
        if (!cost) {
          cost = result.execution_result.Failure.cost;
        }
        this.specExecFee = CurrencyUtils.convertMotesToCasper(cost);
        this.simulatedResult = error || 'Deploy executed successfully';
      } catch (e) {
        console.log(e);
        this.simulatedResult = 'This deploy is invalid.';
      } finally {
        this.$root.$emit('closeSimulateDialog');
        this.loadingSimulate = false;
      }
    },
    /**
     * Method used by the OperationDialog component when the user confirm the operation.
     * Use the prepareSignAndSendDeploy method from the core library
     * Update the store with a deploy result containing the deployhash of the deploy sent
     */
    async sendDeploy() {
      const args = {};
      this.deployArgs.forEach((a) => {
        args[a.name] = a.value;
      });
      const deployParameter = new GenericContractDeployParameters(
        this.activeKey,
        NETWORK,
        this.contractHash,
        this.entrypoint,
        this.amount,
        args,
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
    checkClType(type) {
      if (typeof type === 'object') {
        return Object.keys(type)[0];
      }
      return type;
    },
  },
};
</script>
