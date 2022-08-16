<template>
  <operation-card
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
    <token-input
      v-model="token"
      return-object
    />
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
    <v-slide-y-transition leave-absolute>
      <v-text-field
        v-if="tokenGroup.features.transfer.transferID"
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
    </v-slide-y-transition>
    <AmountInput
      :balance="balance"
      :fee="transferFee"
      :min="minimumCSPRTransfer"
      :value="amount"
      class="mb-4"
      @input="amount = $event"
    />
    <operation-summary
      :balance-loading="loadingBalance"
      :balance="balance"
      :token-balance="'0'"
      :token="token"
      :fee="transferFee"
      :amount="`-${amount}`"
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
  </operation-card>
</template>

<script>
import AmountInput from '@/components/operations/Amountinput';
import OperationCard from '@/components/operations/OperationCard';
import OperationSummary from '@/components/operations/OperationSummary';
import TokenInput from '@/components/operations/TokenInput';
import exchanges from '@/helpers/exchanges';
import genericSendDeploy from '@/helpers/genericSendDeploy';
import findTokenGroup from '@/services/tokens/findTokenGroup';
import nativeToken from '@/services/tokens/nativeToken';
import { InsufficientFunds, NoActiveKeyError, TransferResult } from '@casperholders/core';
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
  name: 'TransferView',
  components: { OperationSummary, TokenInput, AmountInput, OperationCard },
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
      token: nativeToken,
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
    tokenGroup() {
      return findTokenGroup(this.token.groupId);
    },
  },
  watch: {
    token: 'getBalance',
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
        this.balance = await this.tokenGroup.features.balance.fetchBalance(this.token);
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
      const deployParameter = this.tokenGroup.features.transfer.makeDeployParameters({
        token: this.token,
        activeKey: this.activeKey,
        amount: this.amount,
        address: this.address,
        transferID: this.transferID,
      });
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
