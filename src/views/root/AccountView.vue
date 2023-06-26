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
        <v-icon size="24">
          {{ mdiAccount }}
        </v-icon>
      </v-avatar>
      <v-card-title
        class="pl-4"
        style="word-break: break-word"
      >
        Account
      </v-card-title>
    </v-card-title>
    <v-card-text>
      <AccountDetailsCard v-if="signer.activeKey" />
      <v-card
        outlined
        elevation="3"
        class="mb-4"
      >
        <v-card-title>
          <v-icon left>
            {{ mdiWifi }}
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
            {{ mdiAccount }}
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
                id="impersonateKeyTextField"
                v-model="publicKeyImpersonation"
                color="white"
                label="Public key"
                type="text"
                :value="publicKeyImpersonation"
                :rules="publicKeyRules"
                :disabled="signer.activeKey === null"
                clearable
                required
              />
              <v-text-field
                color="white"
                label="Account hash"
                type="text"
                :value="accountHashImpersonation"
                disabled
              />
              <v-alert
                v-if="signer.activeKey === null"
                class="mt-5"
                dense
                prominent
                type="error"
              >
                <v-row align="center">
                  <v-col class="grow">
                    You must connect first to impersonate another key.
                  </v-col>
                  <v-col class="shrink">
                    <v-btn
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
              <p
                v-if="accountHashImpersonation !== '' && loadingKeyInfo === true"
                data-cy="loadingKeyInfo"
              >
                <v-progress-circular
                  class="ml-3"
                  color="white"
                  indeterminate
                  size="14"
                />
                Loading key info...
              </p>
              <template v-if="accountHashImpersonation !== '' && loadingKeyInfo === false">
                <p id="accountAuthorization">
                  <template v-if="validated">
                    <v-icon
                      color="success"
                      left
                    >
                      {{ mdiCheckboxMarkedCircle }}
                    </v-icon>
                    Account authorized. Current weight : {{ currentWeight }}.
                  </template>
                  <template v-else>
                    <v-icon
                      color="error"
                      left
                    >
                      {{ mdiAlertCircle }}
                    </v-icon>
                    Account not authorized.
                  </template>
                </p>
                <p>
                  <template
                    v-if="validated && currentWeight >= deployThreshold"
                  >
                    <v-icon
                      color="success"
                      left
                    >
                      {{ mdiCheckboxMarkedCircle }}
                    </v-icon>
                    Account authorized to make deploy.
                  </template>
                  <template v-else>
                    <v-icon
                      color="error"
                      left
                    >
                      {{ mdiAlertCircle }}
                    </v-icon>
                    Account not authorized to make deploy.
                  </template>
                </p>
                <p>
                  <template
                    v-if="validated && currentWeight >= keyManagementThreshold"
                  >
                    <v-icon
                      color="success"
                      left
                    >
                      {{ mdiCheckboxMarkedCircle }}
                    </v-icon>
                    Account authorized to manage keys.
                  </template>
                  <template v-else>
                    <v-icon
                      color="error"
                      left
                    >
                      {{ mdiAlertCircle }}
                    </v-icon>
                    Account not authorized to manage keys.
                  </template>
                </p>
              </template>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
      <v-alert
        outlined
        dense
        type="info"
        text
      >
        Settings are saved automatically
      </v-alert>
      <v-card
        outlined
        elevation="3"
        class="mb-4"
      >
        <v-card-title>
          <v-icon left>
            {{ mdiAccount }}
          </v-icon>
          Set account informations
        </v-card-title>
        <AccountInfoView />
      </v-card>
    </v-card-text>
  </v-card>
</template>

<script>
import AccountDetailsCard from '@/components/account/AccountDetailsCard.vue';
import clientCasper from '@/helpers/clientCasper';
import AccountInfoView from '@/views/account/AccountInfoView.vue';
import {
  mdiAccount,
  mdiAccountCircle,
  mdiAlertCircle,
  mdiCheckboxMarkedCircle,
  mdiWifi,
} from '@mdi/js';

/**
 * Settings View
 */
import { CLPublicKey } from 'casper-js-sdk';
import { mapState } from 'vuex';

export default {
  name: 'AccountView',
  components: { AccountInfoView, AccountDetailsCard },
  data: () => ({
    mdiAlertCircle,
    mdiCheckboxMarkedCircle,
    mdiWifi,
    mdiAccount,
    mdiAccountCircle,
    keyManagementThreshold: '',
    deployThreshold: '',
    loadingKeyInfo: false,
    connected: false,
    errorKey: null,
    keyInfo: null,
    validated: false,
    currentWeight: 0,
    sendDeployDisconnected: false,
    publicKeyImpersonation: '',
    publicKeyRules: [
      (a) => a.length >= 2 || 'Public key is too short',
      (a) => {
        try {
          CLPublicKey.fromHex(a);
          return true;
        } catch (e) {
          return e.toString();
        }
      },
    ],
  }),
  computed: {
    ...mapState([
      'signer',
      'impersonatePublicKey',
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
    this.publicKeyImpersonation = this.impersonatePublicKey;
  },
  methods: {
    async onAccountHashImpersonationChange(accountHashImpersonation) {
      await this.$store.dispatch('impersonatePublicKey', '');
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
          const account = this.keyInfo.Account.associatedKeys.find(
            (v) => v.accountHash === CLPublicKey.fromHex(this.signer.activeKey).toAccountHashStr(),
          );
          this.validated = account !== undefined;
          this.currentWeight = account ? account.weight : 0;
          this.keyManagementThreshold = this.keyInfo.Account.actionThresholds.keyManagement;
          this.deployThreshold = this.keyInfo.Account.actionThresholds.deployment;
          await this.$store.dispatch('impersonatePublicKey', this.publicKeyImpersonation);
          this.loadingKeyInfo = false;
        } catch (e) {
          this.errorKey = e;
          this.loadingKeyInfo = false;
        }
      } else {
        this.validated = false;
        this.currentWeight = 0;
      }
    },
    async connectionRequest() {
      await this.$store.dispatch('openConnectDialog');
    },
  },
};
</script>
