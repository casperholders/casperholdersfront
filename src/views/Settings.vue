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
        <v-icon>mdi-cog</v-icon>
      </v-avatar>
      <v-card-title
        class="pl-4"
        style="word-break: break-word"
      >
        Settings
      </v-card-title>
    </v-card-title>
    <v-card-text>
      <v-card
        outlined
        elevation="3"
        class="mb-4"
      >
        <v-card-title>
          <v-icon left>
            mdi-wifi
          </v-icon>
          Internet settings
        </v-card-title>
        <v-card-text
          id="internetSettings"
          class="d-flex align-center"
        >
          <v-radio-group v-model="sendDeployDisconnected">
            <template
              #label
            >
              <div class="text-body-1">
                What behavior do you want to apply to deploys when you are offline ?
              </div>
            </template>
            <v-radio
              color="white"
              label="Disabled when disconnected"
              :value="false"
            />
            <v-radio
              color="white"
              label="Send directly when back online"
              :value="true"
            />
          </v-radio-group>
        </v-card-text>
      </v-card>
      <v-card
        outlined
        elevation="3"
        class="mb-4"
      >
        <v-card-title>
          <v-icon left>
            mdi-account
          </v-icon>
          Multi-sig - Impersonate key
        </v-card-title>
        <v-card-text
          id="multiSigSettings"
          class="d-flex align-center"
        >
          <v-row>
            <v-col
              cols="12"
            >
              <span class="text-body-1">
                What public key do you want to impersonate ?
              </span>
              <v-text-field
                v-model="publicKeyImpersonation"
                color="white"
                label="Public key"
                type="text"
                :value="publicKeyImpersonation"
                required
              />
              <v-text-field
                color="white"
                label="Account hash"
                type="text"
                :value="accountHashImpersonation"
                disabled
              />
              {{ validated ? 'Account authorized' : 'Account not authorized' }}
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
      <div class="text-center font-weight-bold text-body-2">
        Settings are saved automatically
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
import clientCasper from '@/helpers/clientCasper';

/**
 * Settings View
 */
import { CLPublicKey } from 'casper-js-sdk';
import { mapState } from 'vuex';

export default {
  name: 'Settings',
  data: () => ({
    keyManagementThreshold: '',
    deployThreshold: '',
    loadingKeyInfo: false,
    connected: false,
    errorKey: null,
    keyInfo: null,
    validated: false,
    sendDeployDisconnected: false,
    publicKeyImpersonation: '',
  }),
  computed: {
    ...mapState([
      'signer',
    ]),
    accountHashImpersonation() {
      try {
        return CLPublicKey.fromHex(this.publicKeyImpersonation).toAccountHashStr().replace('account-hash-', '');
      } catch (e) {
        return '';
      }
    },
  },
  watch: {
    sendDeployDisconnected(sendDeployDisconnected) {
      localStorage.sendDeployDisconnected = sendDeployDisconnected;
    },
    accountHashImpersonation: 'onAccountHashImpersonationChange',
  },
  mounted() {
    if (localStorage.sendDeployDisconnected) {
      this.sendDeployDisconnected = localStorage.sendDeployDisconnected === 'true';
    }
    localStorage.sendDeployDisconnected = this.sendDeployDisconnected;
  },
  methods: {
    async onAccountHashImpersonationChange(accountHashImpersonation) {
      if (accountHashImpersonation !== '') {
        this.loadingKeyInfo = true;
        try {
          const latestBlock = await clientCasper.casperRPC.getLatestBlockInfo();
          const stateRootHash = await clientCasper.casperRPC.getStateRootHash(
            latestBlock.block.hash,
          );
          this.keyInfo = await clientCasper.casperRPC.getBlockState(
            stateRootHash,
            `account-hash-${accountHashImpersonation}`,
            [],
          );
          this.validated = this.keyInfo.Account.associatedKeys.some(
            (v) => v.accountHash === CLPublicKey.fromHex(this.signer.activeKey).toAccountHashStr(),
          );
          this.keyManagementThreshold = this.keyInfo.Account.actionThresholds.keyManagement;
          this.deployThreshold = this.keyInfo.Account.actionThresholds.deployment;
          this.loadingKeyInfo = false;
        } catch (e) {
          this.errorKey = e;
          this.loadingKeyInfo = false;
        }
      }
    },
  },
};
</script>
