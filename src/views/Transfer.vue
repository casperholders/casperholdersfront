<template>
  <div>
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
      <p>
        Transfer Fee : {{ transferFee }} CSPR<br>
        Balance : {{ balance }} CSPR
        <template v-if="loadingBalance">
          Loading balance ...
          <v-progress-circular
            class="ml-3"
            color="white"
            indeterminate
          />
        </template>
        <br>
        Remaining funds after transfer : {{ remainingBalance }} CSPR<br>
      </p>
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
  </div>
</template>

<script>
import Amount from '@/components/operations/Amount';
import Operation from '@/components/operations/Operation';
import { TransferDeployParameters } from '@casperholders/core/dist/services/deploys/transfer/TransferDeployParameters';
import { InsufficientFunds } from '@casperholders/core/dist/services/errors/insufficientFunds';
import { NoActiveKeyError } from '@casperholders/core/dist/services/errors/noActiveKeyError';
import { TransferResult } from '@casperholders/core/dist/services/results/transferResult';
import { CLPublicKey, Signer } from 'casper-js-sdk';
import { mapState } from 'vuex';

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
      transferFee: 0.00001,
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
  },
  watch: {
    'signer.activeKey': 'getBalance',
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
        this.balance = await this.$getBalanceService().fetchBalance();
        if (this.balance <= this.minimumFundsNeeded) {
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
      this.errorDeploy = null;
      this.loadingSignAndDeploy = true;
      try {
        const deployResult = await this.$getDeployManager().prepareSignAndSendDeploy(
          new TransferDeployParameters(
            this.signer.activeKey, this.$getNetwork(), this.amount, this.address, this.transferID,
          ),
          this.$getSigner(),
          this.$getOptionsTo(this.address),
        );
        await this.$store.dispatch('addDeployResult', deployResult);
      } catch (e) {
        console.log(e);
        this.errorDeploy = e;
      }
      this.loadingSignAndDeploy = false;
      this.$root.$emit('closeOperationDialog');
      this.$root.$emit('operationFinished');
    },
    connectionRequest() {
      Signer.sendConnectionRequest();
    },
  },
};
</script>

<style scoped>

</style>
