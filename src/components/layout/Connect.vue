<template>
  <v-dialog
    v-model="dialog"
    width="500"
  >
    <template #activator="{ on, attrs }">
      <template v-if="$vuetify.breakpoint.mobile">
        <v-btn
          fab
          small
          color="primary"
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

    <v-card width="100%">
      <v-card-title class="flex-nowrap">
        <v-icon left>
          mdi-wallet
        </v-icon>
        Connect to a wallet
        <v-btn
          icon
          class="ml-auto"
          @click="dialog=false"
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
            v-if="!loading && !connected && !timeout"
            key="wallets"
          >
            <v-card
              outlined
              elevation="3"
              link
              class="mb-4"
              @click="signerConnect"
            >
              <v-card-text class="d-flex align-center">
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
              <v-card-text class="d-flex align-center">
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
            v-if="connected && !loading"
            key="confirmation"
            class="text-center"
          >
            <v-card
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
import { ledgerOptions } from '@/store';
import TransportWebUSB from '@ledgerhq/hw-transport-webusb';
import CasperApp from '@zondax/ledger-casper';
import { Signer } from 'casper-js-sdk';
import { mapState } from 'vuex';

export default {
  name: 'Connect',
  data: () => ({
    dialog: false,
    loading: false,
    connected: false,
    timeout: false,
    casper,
    ledger,
  }),
  computed: {
    ...mapState(['signer']),
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
        const resp = await app.getAddressAndPubKey('m/44\'/506\'/0\'/0/0');
        await this.$store.dispatch('updateFromLedgerEvent', resp.publicKey.toString('hex'));
        ledgerOptions.casperApp = app;
      } catch (e) {
        clearTimeout(inactivity);
        this.timeout = true;
        this.loading = false;
      }
    },
  },
};
</script>
