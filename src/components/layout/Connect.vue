<template>
  <v-dialog
    v-model="connectDialog"
    width="500"
  >
    <template #activator="{ on, attrs }">
      <template v-if="$vuetify.breakpoint.mobile">
        <v-btn
          id="connect"
          fab
          small
          color="primary"
          aria-label="Connection"
          v-bind="attrs"
          v-on="on"
        >
          <v-icon dark>
            mdi-lightning-bolt
          </v-icon>
        </v-btn>
      </template>
      <template v-else>
        <v-btn
          id="connect"
          rounded
          color="primary"
          v-bind="attrs"
          v-on="on"
        >
          <v-icon
            dark
            left
          >
            mdi-lightning-bolt
          </v-icon>
          Connect
        </v-btn>
      </template>
    </template>

    <v-card
      id="connectDialog"
      width="100%"
    >
      <v-card-title class="flex-nowrap">
        <v-icon left>
          mdi-wallet
        </v-icon>
        Connect to a wallet
        <v-btn
          icon
          class="ml-auto"
          @click="closeDialog"
        >
          <v-icon>
            mdi-close
          </v-icon>
        </v-btn>
      </v-card-title>
      <v-card-text>
        <v-slide-x-transition
          tag="div"
          leave-absolute
          mode="out-in"
          group
        >
          <div
            v-if="!loading && !connected && !timeout && !chooseLedgerKey"
            key="wallets"
          >
            <v-card
              outlined
              elevation="3"
              link
              class="mb-4"
              @click="signerConnect"
            >
              <v-card-text
                id="connectCasperSigner"
                class="d-flex align-center"
              >
                <img
                  :src="casper"
                  width="32"
                  alt="Casper Logo"
                  class="mr-3"
                >
                <div>
                  <span class="text-body-1">Casper Signer</span>
                  <div>Native wallet for the Casper Network</div>
                </div>
                <v-icon class="ml-auto">
                  mdi-chevron-right
                </v-icon>
              </v-card-text>
            </v-card>
            <v-card
              outlined
              elevation="3"
              link
              @click="ledgerConnect"
            >
              <v-card-text
                id="connectLedger"
                class="d-flex align-center"
              >
                <img
                  :src="ledger"
                  width="32"
                  alt="Ledger Logo"
                  class="mr-3"
                >
                <div>
                  <span class="text-body-1">Ledger</span>
                  <div>Unlock your ledger and open the Casper app first.</div>
                </div>
                <v-icon class="ml-auto">
                  mdi-chevron-right
                </v-icon>
              </v-card-text>
            </v-card>
          </div>
          <div
            v-if="loading"
            key="loader"
            class="text-center"
          >
            <v-card
              outlined
              elevation="3"
            >
              <v-card-text>
                <div class="text-body-1 text-center">
                  Waiting for connection...
                </div>
                <v-progress-circular
                  class="mx-auto mt-3"
                  indeterminate
                  color="white"
                />
              </v-card-text>
            </v-card>
          </div>
          <div
            v-if="!connected && !loading && chooseLedgerKey"
            key="loader"
            class="text-center"
          >
            <v-card
              outlined
              elevation="3"
            >
              <v-card-text>
                <div class="text-body-1 text-center mb-4">
                  Choose your Ledger Key
                </div>
                <v-expansion-panels
                  v-model="panels"
                  :v-show="!initKeys"
                  accordion
                  flat
                  tile
                >
                  <v-expansion-panel
                    v-model="panels"
                    expand
                    class="secondary"
                  >
                    <v-expansion-panel-header class="reward-calculator-panel-header">
                      <div class="d-flex align-center text-overline">
                        <v-icon
                          left
                        >
                          mdi-currency-usd
                        </v-icon>
                        Keys with funds ({{ ledgerKeys.funds.length }})
                      </div>
                    </v-expansion-panel-header>
                    <v-expansion-panel-content>
                      <template v-for="(ledgerKey, index) in ledgerKeys.funds">
                        <v-card
                          :key="index"
                          outlined
                          elevation="3"
                          link
                          class="mb-4"
                          @click="setLedgerKey(ledgerKey, ledgerKey.keyPath)"
                        >
                          <v-card-text
                            id="connectCasperSigner"
                            class="d-flex align-start"
                          >
                            <div>
                              <span class="text-body-1">
                                <v-icon>
                                  mdi-account
                                </v-icon>
                                {{ truncateText(ledgerKey.key) }}
                              </span>
                              <div class="text-left">
                                <v-icon>
                                  mdi-currency-usd
                                </v-icon>
                                {{ ledgerKey.balance }} CSPR
                              </div>
                            </div>
                            <v-icon class="ml-auto">
                              mdi-chevron-right
                            </v-icon>
                          </v-card-text>
                        </v-card>
                      </template>
                    </v-expansion-panel-content>
                  </v-expansion-panel>
                  <v-expansion-panel
                    v-model="panels"
                    expand
                    class="secondary"
                  >
                    <v-expansion-panel-header class="reward-calculator-panel-header">
                      <div class="d-flex align-center text-overline">
                        <v-icon
                          left
                        >
                          mdi-currency-usd-off
                        </v-icon>
                        Keys without funds ({{ ledgerKeys.noFunds.length }})
                      </div>
                    </v-expansion-panel-header>
                    <v-expansion-panel-content>
                      <template v-for="(ledgerKey, index) in ledgerKeys.noFunds">
                        <v-card
                          :key="index"
                          outlined
                          elevation="3"
                          link
                          class="mb-4"
                          @click="setLedgerKey(ledgerKey, ledgerKey.keyPath)"
                        >
                          <v-card-text
                            id="connectCasperSigner"
                            class="d-flex align-start"
                          >
                            <div>
                              <span class="text-body-1">
                                <v-icon>
                                  mdi-account
                                </v-icon>
                                {{ truncateText(ledgerKey.key) }}
                              </span>
                              <div class="text-left">
                                <v-icon>
                                  mdi-currency-usd
                                </v-icon>
                                {{ ledgerKey.balance }} CSPR
                              </div>
                            </div>
                            <v-icon class="ml-auto">
                              mdi-chevron-right
                            </v-icon>
                          </v-card-text>
                        </v-card>
                      </template>
                    </v-expansion-panel-content>
                  </v-expansion-panel>
                </v-expansion-panels>
                <v-btn
                  color="primary"
                  rounded
                  :loading="loadingKeys"
                  @click="loadMoreLedgerKeys"
                >
                  Load more keys
                </v-btn>
              </v-card-text>
            </v-card>
          </div>
          <div
            v-if="connected && !loading"
            key="confirmation"
            class="text-center"
          >
            <v-card
              id="connected"
              outlined
              elevation="3"
            >
              <v-card-text>
                <div class="text-body-1 text-center">
                  Connected!
                </div>
                <v-icon
                  color="green"
                  size="32"
                  class="mx-auto mt-3"
                >
                  mdi-check-circle
                </v-icon>
              </v-card-text>
            </v-card>
          </div>
          <div
            v-if="timeout"
            key="confirmation"
            class="text-center"
          >
            <v-card
              outlined
              elevation="3"
            >
              <v-card-text>
                <div class="text-body-1 text-center">
                  Oops... We couldn't connect you.<br>
                  If you're using Ledger make sure to unlock and open the Casper app first.
                </div>
                <v-icon
                  color="red"
                  size="32"
                  class="mx-auto mt-3"
                >
                  mdi-alert-circle
                </v-icon>
                <div class="mt-3">
                  <v-btn
                    id="retryButton"
                    color="tertiary"
                    @click="timeout = false"
                  >
                    Retry
                  </v-btn>
                </div>
              </v-card-text>
            </v-card>
          </div>
        </v-slide-x-transition>
      </v-card-text>
      <v-card-actions class="d-block text-center">
        <p>
          New to casper?
        </p>
        <a href="#">Create a new wallet with Casper Signer</a>
        <br>
        <a href="#">Create a new wallet with Ledger</a>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import casper from '@/assets/images/casper_logo.svg';
import ledger from '@/assets/images/ledger_logo.png';
import balanceService from '@/helpers/balanceService';
import { ledgerOptions } from '@/store';
import TransportWebUSB from '@ledgerhq/hw-transport-webusb';
import CasperApp from '@zondax/ledger-casper';
import Big from 'big.js';
import { Signer } from 'casper-js-sdk';
import { mapState } from 'vuex';

/**
 * Connect Component used to help the user connect to CasperSigner or Ledger
 */
export default {
  name: 'Connect',
  data: () => ({
    loading: false,
    connected: false,
    timeout: false,
    chooseLedgerKey: false,
    casper,
    ledger,
    ledgerKeys: {
      funds: [],
      noFunds: [],
    },
    loadingKeys: false,
    initKeys: true,
    panels: undefined,
  }),
  computed: {
    ...mapState(['signer']),
    connectDialog: {
      get() {
        return this.$store.state.connectDialog;
      },
      async set(val) {
        if (val) {
          await this.$store.dispatch('openConnectDialog');
        } else {
          await this.$store.dispatch('closeConnectDialog');
        }
      },
    },
  },
  watch: {
    'signer.activeKey': {
      handler(current, previous) {
        if (previous === null && current !== null) {
          this.loading = false;
          this.connected = true;
        }
        if (previous !== null && current === null) {
          this.connected = false;
        }
      },
    },
  },
  methods: {
    async signerConnect() {
      setTimeout(() => {
        if (this.signer.activeKey === null) {
          this.timeout = true;
          this.loading = false;
        }
      }, 60000);
      this.loading = true;
      if (await Signer.isConnected()) {
        try {
          const pk = await Signer.getActivePublicKey();
          await this.$store.dispatch('updateFromSignerEvent', {
            activeKey: pk,
            isConnected: true,
            isUnlocked: true,
          });
        } catch (e) {
          Signer.sendConnectionRequest();
        }
      } else {
        Signer.sendConnectionRequest();
      }
    },
    async ledgerConnect() {
      const inactivity = setTimeout(() => {
        if (this.signer.activeKey === null) {
          this.timeout = true;
          this.loading = false;
        }
      }, 60000);
      try {
        this.loading = true;
        const transport = await TransportWebUSB.create();
        const app = new CasperApp(transport);
        const key = `02${(await app.getAddressAndPubKey('m/44\'/506\'/0\'/0/0')).publicKey.toString('hex')}`;
        const balance = await balanceService.fetchBalanceOfPublicKey(key);
        if (Big(balance).gt(0)) {
          this.ledgerKeys.funds.push({ key, balance, keyPath: 0 });
          this.panels = 0;
        } else {
          this.ledgerKeys.noFunds.push({ key, balance, keyPath: 0 });
          this.panels = 1;
        }
        ledgerOptions.casperApp = app;
        this.loading = false;
        this.chooseLedgerKey = true;
        clearTimeout(inactivity);
      } catch (e) {
        console.log(e);
        clearTimeout(inactivity);
        this.timeout = true;
        this.loading = false;
      }
    },
    async loadMoreLedgerKeys() {
      if (this.loadingKeys === false) {
        this.loadingKeys = true;
        const nextKeyPath = this.ledgerKeys.funds.length + this.ledgerKeys.noFunds.length;
        for (let i = nextKeyPath; i < nextKeyPath + 4; i++) {
          // eslint-disable-next-line no-await-in-loop
          const key = `02${(await ledgerOptions.casperApp.getAddressAndPubKey(`m/44'/506'/0'/0/${i}`)).publicKey.toString('hex')}`;
          // eslint-disable-next-line no-await-in-loop
          const balance = await balanceService.fetchBalanceOfPublicKey(key);
          if (Big(balance).gt(0)) {
            this.ledgerKeys.funds.push({ key, balance, keyPath: i });
          } else {
            this.ledgerKeys.noFunds.push({ key, balance, keyPath: i });
          }
        }
        this.initKeys = false;
        this.loadingKeys = false;
      }
    },
    async setLedgerKey(activeKey, keyPath) {
      await this.$store.dispatch('updateFromLedgerEvent', { activeKey, keyPath });
      this.chooseLedgerKey = true;
    },
    truncateText(str) {
      return `${str.substring(0, 10)}...${str.substring(str.length - 10)}`;
    },
    async closeDialog() {
      await this.$store.dispatch('closeConnectDialog');
    },
  },
};
</script>
