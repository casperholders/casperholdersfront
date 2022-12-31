<template>
  <operation-card
    :loading-sign-and-deploy="loadingSignAndDeploy"
    :send-deploy="sendDeploy"
    :type="operationType"
    :balance="balance"
    :fee="transferFee"
    :amount="0"
    :cancel="true"
    icon="mdi-send"
    submit-title="Send NFT"
    title="Transfer NFT"
    @cancelOperationCard="$emit('closeTransfer')"
  >
    <n-f-t-details-transfer :nft-data="nft"/>
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
    <operation-summary
      :balance-loading="loadingBalance"
      :balance="balance"
      :fee="transferFee"
      :amount="0"
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
import NFTDetailsBase from '@/components/account/nft/NFTDetailsBase.vue';
import NFTDetailsTransfer from '@/components/account/nft/NFTDetailsTransfer.vue';
import OperationSummary from '@/components/operations/OperationSummary.vue';
import balanceService from '@/helpers/balanceService';
import genericSendDeploy from '@/helpers/genericSendDeploy';
import findTokenGroup from '@/services/tokens/findTokenGroup';
import nativeToken from '@/services/tokens/nativeToken';
import tokensGroups from '@/services/tokens/tokensGroups';
import { InsufficientFunds, NoActiveKeyError } from '@casperholders/core';
import { CLPublicKey } from 'casper-js-sdk';
import { mapGetters, mapState } from 'vuex';

export default {
  name: 'NFTTransfer',
  components: { NFTDetailsTransfer, OperationSummary, NFTDetailsBase },
  props: {
    nftData: {
      type: Object,
      required: true,
    },
    token: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      nft: this.nftData,
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
      errorBalance: null,
      balance: '0',
      tokenBalance: '0',
      address: '',
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
    tokenGroup() {
      return findTokenGroup(this.token.groupId);
    },
    operationType() {
      return this.tokenGroup.features.transfer.transferResult.getName();
    },
    transferFee() {
      return tokensGroups[this.token.groupId].features.transfer.transferFee;
    },
    minimumFundsNeeded() {
      return this.transferFee;
    },
    isInstanceOfNoActiveKeyError() {
      return this.errorBalance instanceof NoActiveKeyError;
    },
  },
  watch: {
    nftData: {
      handler: 'refreshData',
      deep: true,
      immediate: true,
    },
    token: 'fetchBalances',
    internet: 'fetchBalances',
    'signer.activeKey': 'fetchBalances',
  },
  async mounted() {
    this.nft = this.nftData;
    await this.fetchBalances();
    this.$root.$on('operationOnGoing', () => {
      this.errorDeploy = null;
    });
  },
  methods: {
    async fetchBalances() {
      if (this.internet) {
        await this.getBalance();
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
        false,
        this.token,
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
    refreshData(val) {
      this.nft = val;
    },
  },
};
</script>
