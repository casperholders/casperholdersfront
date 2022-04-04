<template>
  <operation
    :amount="amount"
    :fee="transferFee"
    :loading-sign-and-deploy="loadingSignAndDeploy"
    :remaining-balance="remainingBalance"
    :send-deploy="sendDeploy"
    :type="type"
    icon="mdi-send"
    submit-title="Send Transaction"
    title="Transfer"
  >
    <v-text-field
      id="address"
      v-model="address"
      :rules="addressRules"
      :value="address"
      color="white"
      label="Send to address"
      prepend-icon="mdi-account"
      required
    />
    <v-text-field
      id="transferID"
      v-model="transferID"
      :rules="transferIDRules"
      :value="transferID"
      color="white"
      hint="Set to 0 if not known"
      label="Transfer ID"
      prepend-icon="mdi-music-accidental-sharp"
      required
    />
    <Amount
      :balance="balance"
      :fee="transferFee"
      :min="minimumCSPRTransfer"
      :value="amount"
      class="mb-4"
      @input="amount = $event"
    />
    <div class="mx-n1">
      <v-row
        class="white-bottom-border"
      >
        <v-col>Transfer Fee</v-col>
        <v-col class="text-right cspr">
          {{ transferFee }} CSPR
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
    <v-alert
      v-if="exchange"
      class="mt-5"
      type="warning"
      prominent
      border="left"
    >
      You're going to transfer some funds to <strong>{{ getExchange }}</strong> (presumably)! <br>
      Verify your <strong>transfer ID</strong>
      and make sure it's correct <strong>BEFORE</strong> signing the deploy.
    </v-alert>
  </operation>
</template>

<script>
import Amount from '@/components/operations/Amount';
import Operation from '@/components/operations/Operation';
import balanceService from '@/helpers/balanceService';
import { NETWORK } from '@/helpers/env';
import exchanges from '@/helpers/exchanges';
import genericSendDeploy from '@/helpers/genericSendDeploy';
import {
  TransferDeployParameters,
  InsufficientFunds,
  NoActiveKeyError,
  TransferResult,
} from '@casperholders/core';
import { CLPublicKey } from 'casper-js-sdk';
import { mapGetters, mapState } from 'vuex';

/**
 * Transfer view
 * Contains three fields
 * - Receiver Address
 * - Transfer id
 * - Amount to transfer
 */
export default {
  name: 'Transfer',
  components: { Amount, Operation },
  data() {
    return {
      addressRules: [
        (a) => !!a || 'Address is required',
        (a) => a.length >= 2 || 'Address is too short',
        (a) => {
          try {
            CLPublicKey.fromHex(a);
            return true;
          } catch (e) {
            return e.toString();
          }
        },
      ],
      transferIDRules: [
        (a) => !!a || 'Transfer ID is required',
        (a) => /^[0-9]+$/.test(a) || 'Transfer ID must be a number',
      ],
      address: '',
      transferID: '0',
      minimumCSPRTransfer: 2.5,
      transferFee: 0.1,
      amount: '2.5',
      errorBalance: null,
      balance: '0',
      loadingSignAndDeploy: false,
      errorDeploy: null,
      loadingBalance: false,
      type: TransferResult.getName(),
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
      const result = this.balance - this.amount - this.transferFee;
      return Math.trunc(result) >= 0 ? Number(result.toFixed(5)) : 0;
    },
    minimumFundsNeeded() {
      return this.minimumCSPRTransfer + this.transferFee;
    },
    isInstanceOfNoActiveKeyError() {
      return this.errorBalance instanceof NoActiveKeyError;
    },
    exchange() {
      let result = false;
      exchanges.forEach((value, index) => {
        if (index.toLowerCase() === this.address.toLowerCase()) {
          result = true;
        }
      });
      return result;
    },
    getExchange() {
      let result = '';
      exchanges.forEach((value, index) => {
        if (index.toLowerCase() === this.address.toLowerCase()) {
          result = value;
        }
      });
      return result;
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
      const deployParameter = new TransferDeployParameters(
        this.activeKey, NETWORK, this.amount, this.address, this.transferID,
      );
      const options = this.signerOptionsFactory.getOptionsForTransfer(this.address);
      this.errorDeploy = null;
      this.loadingSignAndDeploy = true;
      const result = await genericSendDeploy(
        this.internet,
        this.activeKey,
        this.signer.activeKey,
        this.signerObject,
        deployParameter,
        options,
        this.transferFee,
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
