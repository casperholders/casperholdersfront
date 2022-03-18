<template>
  <operation
    :amount="amount"
    :fee="keyManagementFee"
    :loading-sign-and-deploy="loadingSignAndDeploy"
    :remaining-balance="remainingBalance"
    :send-deploy="sendDeploy"
    :type="type"
    icon="mdi-key"
    submit-title="Set security settings"
    title="Security"
  >
    <v-alert
      type="warning"
      dense
      border="left"
    >
      Warning : don't change your security settings without knowing what you do. You could
      <span class="font-weight-bold">PERMANENTLY</span> loose access to your account!
    </v-alert>
    <v-card
      outlined
      elevation="3"
      class="mb-4"
    >
      <v-card-title>
        <v-icon left>
          mdi-shield-key
        </v-icon>
        Threshold settings
      </v-card-title>
      <v-card-text
        class="d-flex align-center"
      >
        <v-row>
          <v-col
            cols="12"
            md="6"
          >
            <v-text-field
              v-model="keyManagementThreshold"
              :value="keyManagementThreshold"
              color="white"
              label="Key management threshold"
              type="number"
              min="1"
              :rules="thresholdRules"
              :disabled="loadingKeyInfo || !connected"
              required
            >
              <template #prepend>
                <v-tooltip
                  bottom
                >
                  <template #activator="{ on }">
                    <v-icon v-on="on">
                      mdi-help-circle-outline
                    </v-icon>
                  </template>
                  Minimum weight needed to make key management operations
                </v-tooltip>
              </template>
            </v-text-field>
          </v-col>
          <v-col
            cols="12"
            md="6"
          >
            <v-text-field
              v-model="deployThreshold"
              :value="deployThreshold"
              color="white"
              label="Deploy threshold"
              type="number"
              min="1"
              :rules="thresholdRules"
              :disabled="loadingKeyInfo || !connected"
              required
            >
              <template #prepend>
                <v-tooltip
                  bottom
                >
                  <template #activator="{ on }">
                    <v-icon v-on="on">
                      mdi-help-circle-outline
                    </v-icon>
                  </template>
                  Minimum weight needed to perform deployments
                </v-tooltip>
              </template>
            </v-text-field>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
    <v-card
      outlined
      elevation="3"
      class="mb-4"
    >
      <v-card-title>
        <v-icon left>
          mdi-key-chain
        </v-icon>
        Authorized keys
      </v-card-title>
      <v-list>
        <template v-if="loadingKeyInfo">
          Loading key info ...
          <v-progress-circular
            class="ml-3"
            color="white"
            indeterminate
            size="14"
          />
        </template>
        <v-list-item
          v-for="(authorizedInput, index) in authorizedInputs"
          :key="index"
        >
          <authorized-key-input
            :data="authorizedInput"
            @update="onUpdate(index, $event)"
            @delete="onDelete(index)"
          />
        </v-list-item>
      </v-list>
      <v-card-actions>
        <v-btn
          class="rounded-xl"
          color="primary"
          dark
          large
          :disabled="loadingKeyInfo || !connected"
          @click="onAdd"
        >
          <v-icon left>
            mdi-plus
          </v-icon>
          Add key
        </v-btn>
        <v-btn
          class="rounded-xl"
          color="primary"
          dark
          large
          :disabled="loadingKeyInfo || !connected"
          @click="resetKeyInfos"
        >
          <v-icon left>
            mdi-refresh
          </v-icon>
          Reset
        </v-btn>
      </v-card-actions>
    </v-card>
    <v-card
      outlined
      elevation="3"
      class="mb-4"
    >
      <v-card-title>
        <v-icon left>
          mdi-clipboard-list
        </v-icon>
        Summary
      </v-card-title>
      <v-card-text v-if="!keyInfo">
        You need to connect first to see the summary.
      </v-card-text>
      <v-card-text v-if="keyInfo">
        <p
          v-if="!isThresholdChanged"
          class="text-body-1 font-weight-bold"
        >
          No changes will be made to your thresholds
        </p>
        <p
          v-if="isKeyManagementThresholdChanged"
          class="text-body-1 font-weight-bold"
        >
          Your key management threshold will change from a weight of
          {{ keyInfo.Account.actionThresholds.keyManagement }} to {{ keyManagementThreshold }}
        </p>
        <p
          v-if="isDeployThresholdChanged"
          class="text-body-1 font-weight-bold"
        >
          Your deployment threshold will change from a weight of
          {{ keyInfo.Account.actionThresholds.deployment }} to {{ deployThreshold }}
        </p>
        <v-slide-y-transition leave-absolute>
          <div v-if="isKeysChanged || isThresholdChanged">
            <p class="text-body-1 font-weight-bold">
              To make changes to the authorized keys or the thresholds you will need
              to sign the future deploys with a weight of : {{ keyManagementThreshold }}
            </p>
            <ul>
              <li
                v-for="(authorizedInput, index) in authorizedInputs"
                :key="index+'-keyManagementThresholdValidation'"
              >
                The account hash
                <span
                  :class="{
                    'keyError': (authorizedInput.weight < keyManagementThreshold),
                    'keyValid':(authorizedInput.weight >= keyManagementThreshold)
                  }"
                >
                  {{ authorizedInput.accountHash }}
                </span>
                {{ authorizedInput.weight >= keyManagementThreshold ? 'will be' : 'won\'t be' }}
                able to make changes to the authorized keys or the thresholds.
              </li>
              <li>
                The sum of the weight of the keys is equal
                or higher than the key management threshold :
                <span
                  :class="{
                    'keyError': (sumWeight() < keyManagementThreshold),
                    'keyValid':(sumWeight() >= keyManagementThreshold)
                  }"
                >
                  {{ sumWeight() >= keyManagementThreshold ? 'Yes' : 'No' }}
                </span>
              </li>
            </ul>
            <p class="text-body-1 font-weight-bold mt-4">
              To make deploys you will need
              to sign future deploys with a weight of : {{ deployThreshold }}
            </p>
            <ul>
              <li
                v-for="(authorizedInput, index) in authorizedInputs"
                :key="index+'-deployThresholdValidation'"
              >
                The account hash
                <span
                  :class="{
                    'keyError': (authorizedInput.weight < deployThreshold),
                    'keyValid':(authorizedInput.weight >= deployThreshold)
                  }"
                >
                  {{ authorizedInput.accountHash }}
                </span>
                {{ authorizedInput.weight >= deployThreshold ? 'will be' : 'won\'t be' }}
                able to make deploys.
              </li>
              <li>
                The sum of the weight of the keys is equal
                or higher than the deploy threshold :
                <span
                  :class="{
                    'keyError': (sumWeight() < deployThreshold),
                    'keyValid':(sumWeight() >= deployThreshold)
                  }"
                >
                  {{ sumWeight() >= deployThreshold ? 'Yes' : 'No' }}
                </span>
              </li>
            </ul>
            <template v-if="keysChanged.length > 0">
              <p class="text-body-1 font-weight-bold mt-4">
                List of key weight changes :
              </p>
              <ul>
                <li
                  v-for="(keyChanged, index) in keysChanged"
                  :key="index+'-keyChanged'"
                >
                  The account hash
                  <span
                    style="font-weight: bold"
                  >
                    {{ keyChanged.accountHash }}
                  </span>
                  <template v-if="Number(keyChanged.weight) === 0">
                    <span class="keyError">
                      will be deleted!
                    </span>
                  </template>
                  <template v-else>
                    weight will be changed from
                    <span class="font-weight-bold">{{ keyChanged.oldWeight }}</span> to
                    <span class="font-weight-bold">{{ keyChanged.weight }}</span>.
                  </template>
                </li>
              </ul>
            </template>
            <template v-if="keysAdded.length > 0">
              <p class="text-body-1 font-weight-bold mt-4">
                List of new keys :
              </p>
              <ul>
                <li
                  v-for="(keyAdded, index) in keysAdded"
                  :key="index+'-keyAdded'"
                >
                  The account hash
                  <span
                    style="font-weight: bold"
                  >
                    {{ keyAdded.accountHash }}
                  </span>
                  weight will be added with a weight of
                  <span class="font-weight-bold">{{ keyAdded.weight }}</span>.
                </li>
              </ul>
            </template>
          </div>
        </v-slide-y-transition>
        <v-slide-y-transition leave-absolute>
          <div v-if="!isKeysChanged && !isThresholdChanged">
            <p class="text-body-1 font-weight-bold">
              No change will be made to your keys.
            </p>
          </div>
        </v-slide-y-transition>
      </v-card-text>
    </v-card>
    <v-card>
      <v-card-text>
        <div class="mx-n1">
          <v-row
            class="white-bottom-border"
          >
            <v-col>Key management fee</v-col>
            <v-col class="text-right cspr">
              {{ keyManagementFee }} CSPR
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
          v-if="errorBalance && errorKey === null"
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
          v-if="errorKey"
          class="mt-5"
          dense
          prominent
          type="error"
        >
          <v-row align="center">
            <v-col class="grow">
              {{
                errorKey.message.includes('ValueNotFound')
                  ? 'Error: Account not found.' : errorKey.message
              }}
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
      </v-card-text>
    </v-card>
  </operation>
</template>

<script>

import Operation from '@/components/operations/Operation';
import balanceService from '@/helpers/balanceService';
import clientCasper from '@/helpers/clientCasper';
import { NETWORK } from '@/helpers/env';
import genericSendDeploy from '@/helpers/genericSendDeploy';
import {
  KeyManagement,
  InsufficientFunds,
  NoActiveKeyError,
  KeyManagementResult,
} from '@casperholders/core';
import Big from 'big.js';
import { CLPublicKey } from 'casper-js-sdk';
import { mapGetters, mapState } from 'vuex';
import AuthorizedKeyInput from '@/components/operations/AuthorizedKeyInput';
// eslint-disable-next-line import/no-webpack-loader-syntax
import KeyManagerWasm from '!!binary-loader!@/assets/smartcontracts/keys-manager.wasm';

/**
 * Security view
 */
export default {
  name: 'Security',
  components: { Operation, AuthorizedKeyInput },
  data() {
    return {
      keyManagementThreshold: '',
      deployThreshold: '',
      loadingKeyInfo: false,
      connected: false,
      errorKey: null,
      keyInfo: null,
      amount: '0',
      balance: '0',
      errorBalance: null,
      loadingSignAndDeploy: false,
      errorDeploy: null,
      loadingBalance: false,
      type: KeyManagementResult.getName(),
      authorizedInputs: [],
      /**
       * Rules for the threshold fields
       */
      thresholdRules: [
        (a) => !!a || 'Threshold required',
        (a) => a > 0 || 'Threshold must be at least 1',
      ],
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
      const result = this.balance - this.keyManagementFee;
      return Math.trunc(result) >= 0 ? Number(result.toFixed(5)) : 0;
    },
    minimumFundsNeeded() {
      return this.keyManagementFee;
    },
    isInstanceOfNoActiveKeyError() {
      return this.errorBalance instanceof NoActiveKeyError;
    },
    isThresholdChanged() {
      return this.isKeyManagementThresholdChanged || this.isDeployThresholdChanged;
    },
    isKeyManagementThresholdChanged() {
      if (this.keyInfo) {
        return Number(this.keyManagementThreshold)
          !== this.keyInfo.Account.actionThresholds.keyManagement;
      }
      return false;
    },
    isDeployThresholdChanged() {
      if (this.keyInfo) {
        return Number(this.deployThreshold) !== this.keyInfo.Account.actionThresholds.deployment;
      }
      return false;
    },
    isKeysChanged() {
      if (this.authorizedInputs.length !== this.keyInfo?.Account?.associatedKeys?.length) {
        return true;
      }
      for (let i = 0; i < this.keyInfo.Account.associatedKeys.length; i++) {
        if (this.keyInfo.Account.associatedKeys[i].accountHash.replace('account-hash-', '') !== this.authorizedInputs[i].accountHash) {
          return true;
        }
        if (this.keyInfo.Account.associatedKeys[i].weight
          !== Number(this.authorizedInputs[i].weight)
        ) {
          return true;
        }
      }
      return false;
    },
    keysChanged() {
      const keysChanged = [];
      if (this.keyInfo) {
        for (let i = 0; i < this.keyInfo.Account.associatedKeys.length; i++) {
          if (this.keyInfo.Account.associatedKeys[i].weight
            !== Number(this.authorizedInputs[i].weight)
          ) {
            const keyChange = this.authorizedInputs[i];
            keyChange.oldWeight = this.keyInfo.Account.associatedKeys[i].weight;
            keysChanged.push(keyChange);
          }
        }
      }
      return keysChanged;
    },
    keysAdded() {
      const currentKeys = [...this.authorizedInputs];
      if (this.keyInfo) {
        currentKeys.splice(0, this.keyInfo.Account.associatedKeys.length);
      }
      return currentKeys;
    },
    keyManagementFee() {
      let fee = Big(0);
      if (this.isKeyManagementThresholdChanged) {
        fee = fee.plus(Big(0.2));
      }
      if (this.isDeployThresholdChanged) {
        fee = fee.plus(Big(0.2));
      }
      fee = fee.plus(Big(this.keysChanged.length).times(Big(0.2)));
      fee = fee.plus(Big(this.keysAdded.length).times(Big(0.2)));
      return fee.toNumber();
    },
  },
  watch: {
    'signer.activeKey': {
      async handler(current, previous) {
        if (previous === null && current !== null) {
          this.connected = true;
        }
        if (previous !== null && current === null) {
          this.connected = false;
        }
        await this.getKeyInfos();
        await this.getBalance();
      },
    },
    async internet(val) {
      if (val) {
        await this.getKeyInfos();
        await this.getBalance();
      }
    },
  },
  async mounted() {
    this.connected = this.signer.activeKey !== null;
    await this.getKeyInfos();
    await this.getBalance();
    this.$root.$on('operationOnGoing', () => {
      this.errorDeploy = null;
    });
  },
  methods: {
    async resetKeyInfos() {
      this.authorizedInputs.length = 0;
      await this.getKeyInfos();
    },
    /**
     * Get Key infos
     */
    async getKeyInfos() {
      if (this.activeKey) {
        this.loadingKeyInfo = true;
        try {
          const latestBlock = await clientCasper.casperRPC.getLatestBlockInfo();
          const stateRootHash = await clientCasper.casperRPC.getStateRootHash(
            latestBlock.block.hash,
          );
          this.keyInfo = await clientCasper.casperRPC.getBlockState(
            stateRootHash,
            CLPublicKey.fromHex(this.activeKey).toAccountHashStr(),
            [],
          );
          this.authorizedInputs.length = 0;
          for (let i = 0; i < this.keyInfo.Account.associatedKeys.length; i++) {
            this.authorizedInputs.push({
              accountHash: this.keyInfo.Account.associatedKeys[i].accountHash.replace('account-hash-', ''),
              weight: this.keyInfo.Account.associatedKeys[i].weight,
              existingKey: true,
            });
          }
          this.keyManagementThreshold = this.keyInfo.Account.actionThresholds.keyManagement;
          this.deployThreshold = this.keyInfo.Account.actionThresholds.deployment;
          this.loadingKeyInfo = false;
        } catch (e) {
          console.log(e);
          this.errorKey = e;
          this.authorizedInputs.length = 0;
          this.keyManagementThreshold = 1;
          this.deployThreshold = 1;
          this.loadingKeyInfo = false;
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
     * Method used by the OperationDialog component when the user confirm the operation.
     * Use the prepareSignAndSendDeploy method from the core library
     * Update the store with a deploy result containing the deployhash of the deploy sent
     */
    async sendDeploy() {
      const keyManagementThresholdValue = (
        Number(this.keyManagementThreshold) === this.keyInfo.Account.actionThresholds.keyManagement
          ? undefined : Number(this.keyManagementThreshold)
      );
      const deployThresholdValue = (
        Number(this.deployThreshold) === this.keyInfo.Account.actionThresholds.deployment
          ? undefined : Number(this.deployThreshold)
      );
      let accounts;
      if (this.keysChanged.length > 0 || this.keysAdded.length > 0) {
        accounts = [...this.keysChanged, ...this.keysAdded].map((k) => ({ ...k }));
        for (let i = 0; i < accounts.length; i++) {
          accounts[i].accountHash = Uint8Array.from(Buffer.from(accounts[i].accountHash, 'hex'));
        }
      }
      const KeyManagerU8 = new Uint8Array(KeyManagerWasm.length).map(
        (v, i) => KeyManagerWasm.charCodeAt(i),
      );
      const deployParameter = new KeyManagement(
        deployThresholdValue,
        keyManagementThresholdValue,
        accounts,
        this.activeKey,
        NETWORK,
        KeyManagerU8.buffer,
      );
      const options = this.signerOptionsFactory.getOptionsForOperations();
      this.errorDeploy = null;
      this.loadingSignAndDeploy = true;
      this.errorDeploy = null;
      const result = await genericSendDeploy(
        this.internet,
        this.activeKey,
        this.signer.activeKey,
        this.signerObject,
        deployParameter,
        options,
        this.keyManagementFee,
        '0',
        true,
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
    onAdd() {
      this.authorizedInputs.push({
        accountHash: '',
        weight: 1,
        existingKey: false,
      });
    },
    onUpdate(index, data) {
      Object.keys(data).forEach((key) => {
        this.authorizedInputs[index][key] = data[key];
      });
    },
    onDelete(index) {
      if (this.authorizedInputs[index].existingKey) {
        this.authorizedInputs[index].weight = 0;
      } else {
        this.authorizedInputs.splice(index, 1);
      }
    },
    sumWeight() {
      let sum = Big(0);
      for (let i = 0; i < this.authorizedInputs.length; i++) {
        sum = Big(sum).plus(Big(this.authorizedInputs[i].weight));
      }
      return sum.toNumber();
    },
  },
};
</script>

<style scoped>
    .keyError {
        font-weight: bold;
        color: var(--v-error-base);
    }

    .keyValid {
        font-weight: bold;
        color: var(--v-success-base);;
    }
</style>
