<template>
  <v-app>
    <NavigationDrawer
      :links="links"
      :advanced="advanced"
    />
    <AppBar :links="links" />
    <svg
      id="waveSvg"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
      x="0px"
      y="0px"
      width="100%"
      height="100vh"
      viewBox="0 0 1600 900"
      preserveAspectRatio="xMidYMax slice"
    >
      <defs>
        <linearGradient id="bg">
          <stop
            offset="0%"
            style="stop-color:rgba(114, 222, 255, 0.06)"
          />
          <stop
            offset="50%"
            style="stop-color:rgba(114, 222, 255, 0.4)"
          />
          <stop
            offset="100%"
            style="stop-color:rgba(114, 222, 255, 0.2)"
          />
        </linearGradient>
        <path
          id="wave"
          fill="url(#bg)"
          d="M-363.852,502.589c0,0,236.988-41.997,505.475,0
  s371.981,38.998,575.971,0s293.985-39.278,505.474,5.859s493.475,
  48.368,716.963-4.995v560.106H-363.852V502.589z"
        />
      </defs>
      <g>
        <use
          xlink:href="#wave"
          opacity=".3"
        >
          <animateTransform
            attributeName="transform"
            attributeType="XML"
            type="translate"
            dur="20s"
            calcMode="spline"
            values="270 230; -334 180; 270 230"
            keyTimes="0; .5; 1"
            keySplines="0.42, 0, 0.58, 1.0;0.42, 0, 0.58, 1.0"
            repeatCount="indefinite"
          />
        </use>
        <use
          xlink:href="#wave"
          opacity=".6"
        >
          <animateTransform
            attributeName="transform"
            attributeType="XML"
            type="translate"
            dur="16s"
            calcMode="spline"
            values="-270 230;243 220;-270 230"
            keyTimes="0; .6; 1"
            keySplines="0.42, 0, 0.58, 1.0;0.42, 0, 0.58, 1.0"
            repeatCount="indefinite"
          />
        </use>
        <use
          xlink:href="#wave"
          opacty=".9"
        >
          <animateTransform
            attributeName="transform"
            attributeType="XML"
            type="translate"
            dur="12s"
            calcMode="spline"
            values="0 230;-140 200;0 230"
            keyTimes="0; .4; 1"
            keySplines="0.42, 0, 0.58, 1.0;0.42, 0, 0.58, 1.0"
            repeatCount="indefinite"
          />
        </use>
      </g>
    </svg>
    <v-main>
      <v-container class="app__wrapper container__small">
        <v-alert
          v-if="impersonatePublicKey"
          dense
          type="info"
          style="overflow-wrap: anywhere!important;"
        >
          You're impersonating this public key : {{ impersonatePublicKey }}
        </v-alert>
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
          72 10 10 07) - Powered by CoinGecko
        </p>
        <p class="mb-0 text-center text-caption">
          <router-link to="/privacy">
            Privacy
          </router-link>
          -
          <router-link to="/faq">
            FAQ
          </router-link>
          -
          <router-link to="/contact">
            Contact
          </router-link>
        </p>
      </div>
    </v-footer>
  </v-app>
</template>

<script>
import AppBar from '@/components/layout/AppBar';
import NavigationDrawer from '@/components/layout/NavigationDrawer';
import {
  mdiAccount,
  mdiConnection,
  mdiFileDocumentEdit,
  mdiFire,
  mdiGavel,
  mdiImageFrame,
  mdiKey,
  mdiLockOpen,
  mdiSafe,
  mdiSend,
  mdiShopping,
  mdiWallet,
} from '@mdi/js';
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
  computed: {
    ...mapState(['signerType', 'impersonatePublicKey']),
    advanced() {
      return [
        {
          title: 'Account info',
          icon: mdiAccount,
          route: '/account',
        },
        {
          title: 'Add Bid',
          icon: mdiGavel,
          route: '/addbid',
        },
        {
          title: 'Withdraw Bid',
          icon: mdiConnection,
          route: '/withdrawbid',
        },
        {
          title: 'Send smart contract',
          icon: mdiFileDocumentEdit,
          route: '/smartcontract',
        },
      ];
    },
    /**
     * Return the links available. Dynamically adjusted until ledger support any operations.
     */
    links() {
      return {
        Account: [
          {
            title: 'Balance',
            icon: mdiWallet,
            route: '/balance',
            disabled: false,
            subtitle: null,
          },
          {
            title: 'Transfer',
            icon: mdiSend,
            route: '/transfer',
            disabled: false,
            subtitle: null,
          },
          {
            title: 'Security',
            icon: mdiKey,
            route: '/security',
            chip: {
              icon: mdiFire,
              text: 'Beta',
            },
          },
          {
            title: 'NFTs',
            icon: mdiImageFrame,
            route: '/nft',
            disabled: false,
            subtitle: null,
            chip: {
              icon: mdiFire,
              text: 'Beta',
            },
          },
          {
            title: 'Marketplace',
            icon: mdiShopping,
            route: '/marketplace',
            disabled: false,
            subtitle: null,
            chip: {
              icon: mdiFire,
              text: 'Beta',
            },
          },
        ],
        Staking: [
          {
            title: 'Stake',
            icon: mdiSafe,
            route: '/stake',
            disabled: false,
            subtitle: null,
          },
          {
            title: 'Unstake',
            icon: mdiLockOpen,
            route: '/unstake',
            disabled: false,
            subtitle: null,
          },
        ],
      };
    },
  },
  /**
   * When the component is mounted we listen to the signer events and update
   * the VueX store accordingly to the data received from the Casper Signer extension.
   */
  mounted() {
    if (!window.CasperWalletInstance) {
      const CasperWalletInstance = window.CasperWalletProvider();
      if (CasperWalletInstance) {
        window.CasperWalletInstance = CasperWalletInstance;
      }
    }
    this.$nextTick(() => {
      this.$store.dispatch('initSignerStatus');
      this.$store.dispatch('initConnectivityStatus');
      if (window.CasperWalletEventTypes != null) {
        Object.values(window.CasperWalletEventTypes).forEach((e) => window.addEventListener(e, (msg) => this.$store.dispatch('updateFromCasperWalletEvent', JSON.parse(msg.detail))));
      }
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
  .v-avatar > .v-icon {
    border-radius: 0 !important;
  }

  .cspr {
    font-family: "Eczar", "Roboto", Helvetica, Arial, sans-serif;
    font-weight: bold;
    font-style: normal;
  }

  #app {
    font-family: "Roboto", Helvetica, Arial, sans-serif;

    background-color: #00126b;

    .app__wrapper {
      position: relative;
      z-index: 1;
    }
  }

  #waveSvg {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    box-sizing: border-box;
    display: block;
    background-color: #00126b;
  }

  a {
    color: #e5e9ec !important;
    caret-color: #f4f4f4 !important;
  }

  .v-tooltip__content {
    border-radius: 24px !important;
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
