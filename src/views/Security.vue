<template>
  <v-card
    class="align-center rounded-xl secondary"
    width="100%"
  >
    <v-card-title class="align-center">
      <v-avatar
        color="primary"
        size="52"
      >
        <v-icon>mdi-key</v-icon>
      </v-avatar>
      <v-card-title
        class="pl-4"
        style="word-break: break-word"
      >
        Security
      </v-card-title>
    </v-card-title>
    <v-card-text>
      <v-alert
        class="mt-5"
        type="warning"
        dense
        border="left"
      >
        Warning : don't change your security settings without knowing what you do. You could
        permanently loose access to your account!
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
        <v-card-text>
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
        </v-card-text>
      </v-card>
    </v-card-text>
  </v-card>
</template>

<script>

import balanceService from '@/helpers/balanceService';
import clientCasper from '@/helpers/clientCasper';
import { InsufficientFunds } from '@casperholders/core/dist/services/errors/insufficientFunds';
import Big from 'big.js';
import { CLPublicKey } from 'casper-js-sdk';
import { mapState } from 'vuex';
import AuthorizedKeyInput from '@/components/operations/AuthorizedKeyInput';

/**
 * Security view
 */
export default {
  name: 'Security',
  components: { AuthorizedKeyInput },
  data() {
    return {
      keyManagementThreshold: '',
      deployThreshold: '',
      loadingKeyInfo: false,
      connected: false,
      errorKey: null,
      keyInfo: null,
      loadingBalance: false,
      errorBalance: null,
      balance: '0',
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
    ...mapState(['signer']),
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
  },
  async mounted() {
    this.connected = this.signer.activeKey !== null;
    await this.getKeyInfos();
    await this.getBalance();
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
      if (this.signer.activeKey) {
        this.loadingKeyInfo = true;
        try {
          const latestBlock = await clientCasper.casperRPC.getLatestBlockInfo();
          const stateRootHash = await clientCasper.casperRPC.getStateRootHash(
            latestBlock.block.hash,
          );
          this.keyInfo = await clientCasper.casperRPC.getBlockState(
            stateRootHash,
            CLPublicKey.fromHex(this.signer.activeKey).toAccountHashStr(),
            [],
          );
          for (let i = 0; i < this.keyInfo.Account.associatedKeys.length; i++) {
            this.authorizedInputs.push({
              accountHash: this.keyInfo.Account.associatedKeys[i].accountHash.replace('account-hash-', ''),
              weight: this.keyInfo.Account.associatedKeys[i].weight,
            });
          }
          this.keyManagementThreshold = this.keyInfo.Account.actionThresholds.keyManagement;
          this.deployThreshold = this.keyInfo.Account.actionThresholds.deployment;
          this.loadingKeyInfo = false;
        } catch (e) {
          this.errorKey = e;
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
    onAdd() {
      this.authorizedInputs.push({
        accountHash: '',
        weight: 1,
      });
    },
    onUpdate(index, data) {
      Object.keys(data).forEach((key) => {
        this.authorizedInputs[index][key] = data[key];
      });
    },
    onDelete(index) {
      this.authorizedInputs.splice(index, 1);
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
