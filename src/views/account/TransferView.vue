<template>
  <operation-card
    :loading-sign-and-deploy="loadingSignAndDeploy"
    :send-deploy="sendDeploy"
    :type="operationType"
    :balance="balance"
    :token-balance="tokenBalance"
    :token="token"
    :fee="transferFee"
    :amount="`-${amount}`"
    icon="mdi-send"
    submit-title="Send Transaction"
    title="Transfer"
  >
    <token-input
      v-model="token"
      data-cy="token-input"
      :only-groups="['native', 'erc20', 'uniswaperc20']"
      :initial-token="$route.params.token"
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
      :balance="token ? tokenBalance : balance"
      :fee="token ? 0 : transferFee"
      :min="tokenMinimumAmount"
      :value="amount"
      class="mb-4"
      @input="amount = $event"
    />
    <operation-summary
      :balance-loading="loadingBalance"
      :balance="balance"
      :token-balance="tokenBalance"
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
import AmountInput from '@/components/forms/inputs/AmountInput';
import OperationCard from '@/components/operations/OperationCard';
import OperationSummary from '@/components/operations/OperationSummary';
import TokenInput from '@/components/forms/inputs/TokenInput';
import balanceService from '@/helpers/balanceService';
import exchanges from '@/helpers/exchanges';
import genericSendDeploy from '@/helpers/genericSendDeploy';
import findTokenGroup from '@/services/tokens/findTokenGroup';
import nativeToken from '@/services/tokens/nativeToken';
import { InsufficientFunds, NoActiveKeyError } from '@casperholders/core';
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
      tokenBalance: '0',
      loadingSignAndDeploy: false,
      errorDeploy: null,
      loadingBalance: false,
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
      if (this.token !== nativeToken) {
        return this.transferFee;
      }

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
    operationType() {
      return this.tokenGroup.features.transfer.transferResult.getName();
    },
    tokenMinimumAmount() {
      return this.tokenGroup.features.transfer.minimumAmount(this.token);
    },
  },
  watch: {
    token: 'fetchBalances',
    internet: 'fetchBalances',
    'signer.activeKey': 'fetchBalances',
  },
  async mounted() {
    await this.fetchBalances();
    this.$root.$on('operationOnGoing', () => {
      this.errorDeploy = null;
    });
  },
  methods: {
    async fetchBalances() {
      if (this.internet) {
        await this.getBalance();
        if (this.token) {
          await this.getTokenBalance();
        }
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
     * Get the user specific token balance.
     *
     * @returns {Promise<void>}
     */
    async getTokenBalance() {
      this.loadingBalance = true;
      this.errorBalance = null;
      this.tokenBalance = '0';
      try {
        this.tokenBalance = await this.tokenGroup.features.balance.fetchBalance(this.token);
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
