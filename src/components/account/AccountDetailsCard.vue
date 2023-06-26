<template>
  <v-card
    outlined
    elevation="3"
    class="mb-4"
  >
    <v-card-title>
      <v-icon left>
        {{ mdiKey }}
      </v-icon>
      Profile
    </v-card-title>
    <v-card
      color="primary"
      class="d-flex flex-wrap justify-center justify-space-around"
    >
      <div class="ma-5">
        <v-avatar
          class="pa-5"
          width="100%"
          max-width="300"
          height="100%"
          max-height="300"
          color="secondary"
          rounded
        >
          <qrcode-vue
            v-if="showQrCode"
            style="padding: 25px;"
            :value="signer.activeKey"
            size="250"
            render-as="svg"
            level="H"
          />
          <v-img
            v-if="SIGNERS_INFO[signerType] && !showQrCode"
            :src="SIGNERS_INFO[signerType]?.icon"
            :alt="`${SIGNERS_INFO[signerType]?.title} Logo`"

            width="100%"
            max-width="300"
            height="100%"
            max-height="300"
            class="pa-5"
          />
          <v-icon
            v-else-if="!SIGNERS_INFO[signerType] && !showQrCode"
          >
            {{ mdiWallet }}
          </v-icon>
        </v-avatar>
      </div>
      <div>
        <v-card-title>
          {{ humanReadableSigner }}
        </v-card-title>
        <v-card-subtitle>
          Current wallet
        </v-card-subtitle>
        <v-card-text>
          <v-chip
            color="secondary"
            class="pr-0 my-4"
            style="border-radius: 5px; height: auto!important;"
            label
          >
            <span
              style="white-space: normal; word-break: break-all!important; "
              class="ellipsis"
            >
              {{ signer.activeKey }}
            </span>
            <div class="d-flex align-center pl-3">
              <v-btn
                title="Copy account public key"
                icon
                size="x-small"
                :color="copied ? 'success' : 'background'"
                text
                style="border-radius: 0 5px 5px 0!important;"
                @click="copyPublicKey"
              >
                <v-icon size="20">
                  {{ copied ? mdiCheckboxMarkedCircle : mdiContentCopy }}
                </v-icon>
              </v-btn>
            </div>
          </v-chip>
        </v-card-text>
        <v-card-actions class="d-block text-center">
          <v-btn
            color="secondary"
            @click="showQrCode = !showQrCode"
          >
            <v-icon left>
              {{ mdiLogoutVariant }}
            </v-icon>
            {{ showQrCode ? 'Hide' : 'Show' }} QRCode
          </v-btn>
          <v-btn
            data-cy="logout"
            color="error"
            @click="logout"
          >
            <v-icon left>
              {{ mdiLogoutVariant }}
            </v-icon>
            Logout
          </v-btn>
        </v-card-actions>
      </div>
    </v-card>
  </v-card>
</template>

<script>
import {
  CASPER_SIGNER,
  CASPER_WALLET_SIGNER,
  LEDGER_SIGNER,
  LOCAL_SIGNER,
  METAMASK_SIGNER,
  SIGNERS_INFO,
  TORUS_SIGNER,
} from '@/helpers/signers';
import { torusOptions } from '@/store';
import {
  mdiAccount,
  mdiCheckboxMarkedCircle,
  mdiContentCopy,
  mdiKey,
  mdiLogoutVariant,
  mdiWallet,
} from '@mdi/js';
import QrcodeVue from 'qrcode.vue';
import { mapState } from 'vuex';

/**
 * Connect Component used to help the user connect to CasperSigner or Ledger
 */
export default {
  name: 'AccountDetailsCard',
  components: {
    QrcodeVue,
  },
  data: () => ({
    mdiAccount,
    mdiKey,
    mdiLogoutVariant,
    mdiContentCopy,
    mdiCheckboxMarkedCircle,
    mdiWallet,
    copied: false,
    showQrCode: false,
  }),
  computed: {
    SIGNERS_INFO() {
      return SIGNERS_INFO;
    },
    ...mapState(['signer', 'signerType']),
    humanReadableSigner() {
      if (this.signerType === METAMASK_SIGNER) {
        return 'Metamask';
      }
      if (this.signerType === CASPER_WALLET_SIGNER) {
        return 'Casper Wallet';
      }
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
    copyPublicKey() {
      navigator.clipboard.writeText(this.signer.activeKey);
      this.copied = true;
      setTimeout(() => {
        this.copied = false;
      }, 2000);
    },
    async logout() {
      if (this.signerType === TORUS_SIGNER) {
        await torusOptions.torusInstance.logout();
      }
      await this.$store.dispatch('logout');
    },
  },
};
</script>
<style scoped>
    .ellipsis {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
</style>
