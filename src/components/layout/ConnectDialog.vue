<template>
  <v-dialog
    v-model="connectDialog"
    width="600"
  >
    <template #activator="{ on, attrs }">
      <template v-if="$vuetify.breakpoint.mobile">
        <v-btn
          data-cy="connect"
          fab
          small
          :color="isWindowTop ? 'secondary' : 'primary'"
          aria-label="Connection"
          v-bind="attrs"
          v-on="on"
        >
          <v-icon dark>
            {{ mdiLightningBolt }}
          </v-icon>
        </v-btn>
      </template>
      <template v-else>
        <v-btn
          data-cy="connect"
          rounded
          :color="isWindowTop ? 'secondary' : 'primary'"
          v-bind="attrs"
          v-on="on"
        >
          <v-icon
            dark
            left
          >
            {{ mdiLightningBolt }}
          </v-icon>
          Connect
        </v-btn>
      </template>
    </template>

    <v-card
      data-cy="connectDialog"
      width="100%"
    >
      <v-card-title class="flex-nowrap">
        <v-icon left>
          {{ mdiWallet }}
        </v-icon>
        Connect to a wallet
        <v-btn
          icon
          class="ml-auto"
          @click="closeDialog"
        >
          <v-icon>
            {{ mdiClose }}
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
            v-if="!loading &&
              !connected &&
              !timeout &&
              !chooseLedgerKey &&
              !chooseMetamaskKey &&
              !ledgerType"
            key="wallets"
          >
            <WalletCard
              v-for="(wallet, walletID) in SIGNERS_INFO"
              :key="walletID"
              :title="wallet.title"
              :icon="wallet.icon"
              :description="wallet.description"
              :wallet-id="wallet.walletId"
              :info="wallet.info"
              :info-link="wallet.infoLink"
              :disabled="wallet.disabled"
              :download="wallet.download"
              @connect="connectWallet(walletID)"
            />
          </div>
          <div
            v-if="ledgerType"
            key="loader"
          >
            <WalletCard
              v-for="(ledgerConType, ledgerId) in LEDGER_TYPES"
              :key="ledgerId"
              :title="ledgerConType.title"
              :icon="ledgerConType.icon"
              :description="ledgerConType.description"
              :wallet-id="ledgerConType.walletId"
              :info="ledgerConType.info"
              :info-link="ledgerConType.infoLink"
              :disabled="ledgerConType.disabled"
              :download="ledgerConType.download"
              @connect="connectWallet(ledgerId)"
            />
            <div class="d-flex justify-center">
              <v-btn
                class="primary"
                rounded
                @click="ledgerType = false"
              >
                Back
              </v-btn>
            </div>
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
            <MultipleKeysCard
              :set-key="setLedgerKey"
              :keys="ledgerKeys"
              :load-more-keys="loadMoreLedgerKeys"
              :loading-keys="loadingLedgerKeys"
              :init-keys="initLedgerKeys"
            />
          </div>
          <div
            v-if="!connected && !loading && chooseMetamaskKey"
            key="loader"
            class="text-center"
          >
            <MultipleKeysCard
              :set-key="setMetamaskKey"
              :keys="metamaskKeys"
              :load-more-keys="loadMoreMetamaskKeys"
              :loading-keys="loadingMetamaskKeys"
              :init-keys="initMetamaskKeys"
            />
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
                  {{ mdiCheckCircle }}
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
                  {{ mdiAlertCircle }}
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
        <a
          href="https://casper.network/docs/workflow/signer-guide"
          target="_blank"
          rel="noopener"
        >Create a new wallet with Casper Signer</a>
        <br>
        <a
          href="https://casper.network/docs/workflow/ledger-setup"
          target="_blank"
          rel="noopener"
        >Create a new wallet with Ledger</a>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import casper from '@/assets/images/casper_logo.svg';
import casperWalletSvg from '@/assets/images/casperWallet.svg';
import ledger from '@/assets/images/ledger_logo.png';
import metaMask from '@/assets/images/metaMask.svg';
import torus from '@/assets/images/torus.svg';
import MultipleKeysCard from '@/components/account/MultipleKeysCard.vue';
import WalletCard from '@/components/layout/WalletCard.vue';
import balanceService from '@/helpers/balanceService';
import getTorusNetwork from '@/helpers/getTorusNetwork';
import {
  CASPER_SIGNER,
  CASPER_WALLET_SIGNER,
  LEDGER_SIGNER,
  LEDGER_TYPES,
  METAMASK_SIGNER,
  SIGNERS_INFO,
  TORUS_SIGNER,
} from '@/helpers/signers';
import { ledgerOptions, torusOptions } from '@/store';
import TransportWebBLE from '@ledgerhq/hw-transport-web-ble';
import TransportWebUSB from '@ledgerhq/hw-transport-webusb';
import {
  mdiAccount,
  mdiAlertCircle,
  mdiCheckCircle,
  mdiChevronRight,
  mdiClose,
  mdiCurrencyUsd,
  mdiCurrencyUsdOff,
  mdiInformation,
  mdiLightningBolt,
  mdiWallet,
} from '@mdi/js';
import Torus from '@toruslabs/casper-embed';
import CasperApp from '@zondax/ledger-casper';
import Big from 'big.js';
import { Signer } from 'casper-js-sdk';
import { getAccount, getSnap, installSnap } from 'casper-manager-helper';
import { mapState } from 'vuex';

/**
 * Connect Component used to help the user connect to CasperSigner or Ledger
 */
export default {
  name: 'ConnectDialog',
  components: { MultipleKeysCard, WalletCard },
  props: {
    isWindowTop: {
      type: Boolean,
      required: false,
      default: true,
    },
  },
  data: () => ({
    mdiLightningBolt,
    mdiWallet,
    mdiClose,
    mdiChevronRight,
    mdiCurrencyUsd,
    mdiAccount,
    mdiCheckCircle,
    mdiInformation,
    mdiAlertCircle,
    mdiCurrencyUsdOff,
    loading: false,
    connected: false,
    timeout: false,
    ledgerType: false,
    chooseLedgerKey: false,
    chooseMetamaskKey: false,
    casperWalletVersion: '',
    metaMask,
    casperWalletSvg,
    casper,
    ledger,
    torus,
    ledgerKeys: {
      funds: [],
      noFunds: [],
    },
    metamaskKeys: {
      funds: [],
      noFunds: [],
    },
    loadingLedgerKeys: false,
    loadingMetamaskKeys: false,
    initLedgerKeys: true,
    initMetamaskKeys: true,
  }),
  computed: {
    LEDGER_TYPES() {
      return LEDGER_TYPES;
    },
    SIGNERS_INFO() {
      return SIGNERS_INFO;
    },
    ...mapState(['signer', 'internet']),
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
  async mounted() {
    this.casperWalletVersion = (await window.CasperWalletInstance?.getVersion()) ?? '';
  },
  methods: {
    connectWallet(walletID) {
      switch (walletID) {
        case METAMASK_SIGNER:
          this.metamaskConnect();
          break;
        case CASPER_WALLET_SIGNER:
          this.casperWalletConnect();
          break;
        case CASPER_SIGNER:
          this.signerConnect();
          break;
        case LEDGER_SIGNER:
          this.ledgerType = true;
          break;
        case 'LEDGER_BLE':
          this.ledgerConnect(false);
          break;
        case 'LEDGER_USB':
          this.ledgerConnect(true);
          break;
        case TORUS_SIGNER:
          this.torusConnect();
          break;
        default:
          console.log('Not supported wallet');
          break;
      }
    },
    async metamaskConnect() {
      this.metamaskKeys = {
        funds: [],
        noFunds: [],
      };
      const inactivity = setTimeout(() => {
        if (this.signer.activeKey === null) {
          this.timeout = true;
          this.loading = false;
        }
      }, 60000);
      this.loading = true;
      try {
        await installSnap();
        await getSnap();
        const key = (await getAccount()).toHex();
        const balance = await balanceService.fetchBalanceOfPublicKey(key);
        if (Big(balance).gt(0)) {
          this.metamaskKeys.funds.push({ key, balance, keyPath: 0 });
        } else {
          this.metamaskKeys.noFunds.push({ key, balance, keyPath: 0 });
        }
        this.chooseMetamaskKey = true;
        this.loading = false;
        clearTimeout(inactivity);
      } catch {
        this.timeout = true;
        this.loading = false;
      }
    },
    async setMetamaskKey(activeKey) {
      await this.$store.dispatch('updateFromMetamaskEvent', { activeKey });
    },
    async casperWalletConnect() {
      try {
        setTimeout(() => {
          if (this.signer.activeKey === null) {
            this.timeout = true;
            this.loading = false;
          }
        }, 60000);
        this.loading = true;
        const casperWallet = window.CasperWalletInstance;
        const isConnected = await casperWallet.isConnected();
        if (isConnected) {
          try {
            const pk = await casperWallet.getActivePublicKey();
            await this.$store.dispatch('updateFromCasperWalletEvent', {
              activeKey: pk,
              isConnected: true,
              isUnlocked: true,
            });
          } catch (e) {
            window.CasperWalletInstance.requestConnection();
          }
        } else {
          window.CasperWalletInstance.requestConnection();
        }
      } catch (e) {
        console.log(e);
      }
    },
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
    async ledgerConnect(usb) {
      this.ledgerType = false;
      const inactivity = setTimeout(() => {
        if (this.signer.activeKey === null) {
          this.timeout = true;
          this.loading = false;
        }
      }, 60000);
      try {
        this.loading = true;
        let transport;
        if (usb) {
          transport = await TransportWebUSB.create();
        } else {
          transport = await TransportWebBLE.create();
        }
        const app = new CasperApp(transport);
        const key = `02${(await app.getAddressAndPubKey('m/44\'/506\'/0\'/0/0')).publicKey.toString('hex')}`;
        const balance = await balanceService.fetchBalanceOfPublicKey(key);
        if (Big(balance).gt(0)) {
          this.ledgerKeys.funds.push({ key, balance, keyPath: 0 });
        } else {
          this.ledgerKeys.noFunds.push({ key, balance, keyPath: 0 });
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
      if (this.loadingLedgerKeys === false) {
        this.loadingLedgerKeys = true;
        const nextKeyPath = this.ledgerKeys.funds.length + this.ledgerKeys.noFunds.length;
        for (let i = nextKeyPath; i < nextKeyPath + 4; i++) {
          // eslint-disable-next-line no-await-in-loop
          const ledgerPubKey = await ledgerOptions.casperApp.getAddressAndPubKey(`m/44'/506'/0'/0/${i}`);
          const key = `02${ledgerPubKey.publicKey.toString('hex')}`;
          // eslint-disable-next-line no-await-in-loop
          const balance = await balanceService.fetchBalanceOfPublicKey(key);
          if (Big(balance).gt(0)) {
            this.ledgerKeys.funds.push({ key, balance, keyPath: i });
          } else {
            this.ledgerKeys.noFunds.push({ key, balance, keyPath: i });
          }
        }
        this.initLedgerKeys = false;
        this.loadingLedgerKeys = false;
      }
    },
    async loadMoreMetamaskKeys() {
      if (this.loadingMetamaskKeys === false) {
        this.loadingMetamaskKeys = true;
        const nextKeyPath = this.metamaskKeys.funds.length + this.metamaskKeys.noFunds.length;
        for (let i = nextKeyPath; i < nextKeyPath + 4; i++) {
          // eslint-disable-next-line no-await-in-loop
          const key = (await getAccount(i)).toHex();
          // eslint-disable-next-line no-await-in-loop
          const balance = await balanceService.fetchBalanceOfPublicKey(key);
          if (Big(balance).gt(0)) {
            this.metamaskKeys.funds.push({ key, balance, keyPath: i });
          } else {
            this.metamaskKeys.noFunds.push({ key, balance, keyPath: i });
          }
        }
        this.initMetamaskKeys = false;
        this.loadingMetamaskKeys = false;
      }
    },
    async setLedgerKey(activeKey) {
      await this.$store.dispatch('updateFromLedgerEvent', { activeKey });
      this.chooseLedgerKey = true;
    },
    async torusConnect() {
      this.loading = true;
      try {
        const torusInstance = new Torus();
        await torusInstance.init({
          showTorusButton: false,
          network: getTorusNetwork(),
        });
        const publicKey = (await torusInstance?.login())?.[0];
        await this.$store.dispatch('updateFromTorusEvent', publicKey);
        torusOptions.torusInstance = torusInstance;
      } catch (e) {
        console.log(e);
        this.timeout = true;
        this.loading = false;
      }
    },
    async closeDialog() {
      await this.$store.dispatch('closeConnectDialog');
    },
  },
};
</script>
