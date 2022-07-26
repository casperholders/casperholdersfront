<template>
  <v-dialog
    v-model="accountDialog"
    width="600"
  >
    <template #activator="{ on, attrs }">
      <v-btn
        id="account"
        v-bind="attrs"
        icon
        aria-label="Account"
        v-on="on"
      >
        <v-icon dark>
          mdi-account
        </v-icon>
      </v-btn>
    </template>
    <v-card
      id="accountDialog"
      width="100%"
    >
      <v-card-title class="flex-nowrap">
        <v-icon left>
          mdi-key
        </v-icon>
        Account info
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
      <v-card-text class="text-center">
        <qrcode-vue
          style="border: 10px solid white; width: 320px; height: 320px; margin: auto"
          :value="signer.activeKey"
          :size="300"
          render-as="svg"
          level="H"
        />
        <br>
        <p class="text-h6">
          Your public key
        </p>
        <v-chip
          color="primary"
        >
          {{ signer.activeKey }}
        </v-chip>
        <br>
        <v-btn
          id="copyKey"
          :color="copied ? 'success' : 'primary'"
          class="mt-2"
          @click="copyPublicKey"
        >
          <v-icon
            v-if="!copied"
            left
          >
            mdi-content-copy
          </v-icon>
          <v-icon
            v-if="copied"
            left
          >
            mdi-checkbox-marked-circle
          </v-icon>
          <template v-if="!copied">
            Copy to clipboard
          </template>
          <template v-if="copied">
            Copied to clipboard
          </template>
        </v-btn>
        <br>
        <p class="text-body-2 mt-2">
          Connected with : {{ humanReadableSigner }}
        </p>
      </v-card-text>
      <v-card-actions class="d-block text-center">
        <v-btn
          id="logout"
          color="primary"
          @click="logout"
        >
          <v-icon left>
            mdi-close
          </v-icon>
          Logout
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { CASPER_SIGNER, LEDGER_SIGNER, LOCAL_SIGNER, TORUS_SIGNER } from '@/helpers/signers';
import { torusOptions } from '@/store';
import QrcodeVue from 'qrcode.vue';
import { mapState } from 'vuex';

/**
 * Connect Component used to help the user connect to CasperSigner or Ledger
 */
export default {
  name: 'AccountPopup',
  components: {
    QrcodeVue,
  },
  data: () => ({
    accountDialog: false,
    copied: false,
  }),
  computed: {
    ...mapState(['signer', 'signerType']),
    humanReadableSigner() {
      if (this.signerType === CASPER_SIGNER) {
        return 'Casper Signer';
      }
      if (this.signerType === LEDGER_SIGNER) {
        return 'Ledger';
      }
      if (this.signerType === LOCAL_SIGNER) {
        return 'Local';
      }
      if (this.signerType === TORUS_SIGNER) {
        return 'Torus';
      }
      return 'None';
    },
  },
  methods: {
    async closeDialog() {
      this.accountDialog = false;
    },
    copyPublicKey() {
      navigator.clipboard.writeText(this.signer.activeKey);
      this.copied = true;
      setTimeout(() => {
        this.copied = false;
      }, 2000);
    },
    async logout() {
      this.accountDialog = false;
      if (this.signerType === TORUS_SIGNER) {
        await torusOptions.torusInstance.logout();
      }
      await this.$store.dispatch('logout');
    },
  },
};
</script>
