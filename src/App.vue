<template>
  <v-app>
    <NavigationDrawer :links="links" />
    <AppBar :links="links" />
    <v-main>
      <div id="wave">
        <img
          :src="wavesSvg"
          alt=""
        >
      </div>
      <v-container class="app__wrapper container__small">
        <router-view />
      </v-container>
    </v-main>
    <v-footer
      color="secondary"
      inset
      absolute
      app
    >
      <div class="mx-auto">
        <p class="mb-0 text-center">
          <a
            class="text-decoration-none"
            href="/"
          >
            <strong>
              CasperHolders
            </strong>
          </a>
          /
          <a
            class="text-decoration-none"
            href="https://www.devxdao.com/"
            target="_blank"
            rel="noopener"
          >
            <strong>
              Made with the help of DEVxDAO &#128150;
            </strong>
          </a>
        </p>
        <p class="mb-0 text-center text-caption">
          Hosted by OVH - 2 rue Kellermann - 59100 Roubaix - France - 1077 (+33 9
          72 10 10 07) - Powered by CoinGecko - <a href="/privacy">Privacy</a>
        </p>
      </div>
    </v-footer>
  </v-app>
</template>

<script>
import wavesSvg from '@/assets/images/waves.svg';
import AppBar from '@/components/layout/AppBar';
import NavigationDrawer from '@/components/layout/NavigationDrawer';
import { LEDGER_SIGNER } from '@/helpers/signers';
import { mapState } from 'vuex';

/**
 * App component
 * That's the base component of the application
 * It holds the router view / footer / appbar / navigation drawer and the background
 * The router view display the current view
 */
export default {
  name: 'App',
  components: { AppBar, NavigationDrawer },
  data: () => ({
    wavesSvg,
    /**
     * Links with their associated text & icons to be displayed in the appbar and navigation drawer
     */
  }),
  computed: {
    ...mapState(['signerType']),
    /**
     * Return the links available. Dynamically adjusted until ledger support any operations.
     */
    links() {
      return {
        Account: [
          {
            title: 'Balance',
            icon: 'mdi-wallet',
            route: 'balance',
            disabled: false,
            subtitle: null,
          },
          {
            title: 'Transfer',
            icon: 'mdi-send',
            route: 'transfer',
            disabled: false,
            subtitle: null,
          },
          {
            title: 'Account info',
            icon: 'mdi-account',
            route: 'account',
            disabled: this.signerType === LEDGER_SIGNER,
            subtitle: this.signerType === LEDGER_SIGNER ? 'Currently not supported on Ledger' : null,
          },
        ],
        Staking: [
          { title: 'Stake', icon: 'mdi-safe', route: 'stake', disabled: false, subtitle: null },
          {
            title: 'Unstake',
            icon: 'mdi-lock-open',
            route: 'unstake',
            disabled: false,
            subtitle: null,
          },
        ],
        Validators: [
          {
            title: 'Add Bid',
            icon: 'mdi-gavel',
            route: 'addbid',
            disabled: this.signerType === LEDGER_SIGNER,
            subtitle: this.signerType === LEDGER_SIGNER ? 'Currently not supported on Ledger' : null,
          },
          {
            title: 'Withdraw Bid',
            icon: 'mdi-connection',
            route: 'withdrawbid',
            disabled: this.signerType === LEDGER_SIGNER,
            subtitle: this.signerType === LEDGER_SIGNER ? 'Currently not supported on Ledger' : null,
          },
        ],
        Developers: [
          {
            title: 'Send smart contract',
            icon: 'mdi-file-document-edit',
            route: 'smartcontract',
            disabled: this.signerType === LEDGER_SIGNER,
            subtitle: this.signerType === LEDGER_SIGNER ? 'Currently not supported on Ledger' : null,
          },
        ],
        Others: [
          { title: 'FAQ', icon: 'mdi-help', route: 'faq', disabled: false, subtitle: null },
          { title: 'Contact', icon: 'mdi-mail', route: 'contact', disabled: false, subtitle: null },
        ],
      };
    },
  },
  /**
   * When the component is mounted we listen to the signer events and update
   * the VueX store accordingly to the data received from the Casper Signer extension.
   */
  mounted() {
    this.$nextTick(() => {
      this.$store.dispatch('initSignerStatus');
      this.$store.dispatch('initConnectivityStatus');
      window.addEventListener('signer:initialState', (msg) => this.$store.dispatch('updateFromSignerEvent', msg.detail));
      window.addEventListener('signer:connected', (msg) => this.$store.dispatch('updateFromSignerEvent', msg.detail));
      window.addEventListener('signer:disconnected', (msg) => this.$store.dispatch('updateFromSignerEvent', msg.detail));
      window.addEventListener('signer:tabUpdated', (msg) => this.$store.dispatch('updateFromSignerEvent', msg.detail));
      window.addEventListener('signer:activeKeyChanged', (msg) => this.$store.dispatch('updateFromSignerEvent', msg.detail));
      window.addEventListener('signer:locked', (msg) => this.$store.dispatch('updateFromSignerEvent', msg.detail));
      window.addEventListener('signer:unlocked', (msg) => this.$store.dispatch('updateFromSignerEvent', msg.detail));
      window.addEventListener('online', () => this.$store.dispatch('onlineEvent'));
      window.addEventListener('offline', () => this.$store.dispatch('offlineEvent'));
    });
    if (!localStorage.sendDeployDisconnected) localStorage.sendDeployDisconnected = false;
  },
};
</script>

<style lang="scss">
  @font-face {
    font-family: "RobotoCondensed";
    src: url("assets/fonts/RobotoCondensed/RobotoCondensed-Regular.ttf");
    font-weight: normal;
    font-style: normal;
  }

  @font-face {
    font-family: "EczarBold";
    src: url("assets/fonts/Eczar/Eczar-Bold.ttf");
    font-weight: bold;
    font-style: normal;
  }

  .cspr {
    font-family: "EczarBold", "RobotoCondensed", Helvetica, Arial, sans-serif;
  }

  #app {
    font-family: "RobotoCondensed", Helvetica, Arial, sans-serif;

    &::before {
      content: " ";
      position: fixed;
      width: 100%;
      height: 100%;
      top: 0;
      left: 0;
      background-color: #00126b;
      background-image: url("~@/assets/images/background.svg");
      background-size: cover;
      will-change: transform;
    }

    .app__wrapper {
      position: relative;
      z-index: 1;
    }
  }

  #wave {
    position: fixed;
    z-index: 0;
    height: 100%;
    left: 0;
    right: 0;
    top: 0;
    transition: 0.2s cubic-bezier(0.4, 0, 0.2, 1) left;
  }

  a {
    color: #e5e9ec !important;
    caret-color: #f4f4f4 !important;
  }

  .v-tooltip__content {
    border-radius: 24px !important;
  }

  .container__small {
    max-width: 1200px !important;
  }

  .white-bottom-border {
    border-bottom: 1px solid rgba(255, 255, 255, 0.5)
  }

  .white-top-border {
    border-top: 1px solid rgba(255, 255, 255, 0.5)
  }

  .theme--dark.v-list-item.v-list-item--active {
    color: white !important;
  }
</style>
