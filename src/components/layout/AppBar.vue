<template>
  <v-app-bar
    v-scroll="onScroll"
    :class="{'appbar__top': isWindowTop}"
    class="appbar"
    color="transparent"
    app
    elevate-on-scroll
  >
    <v-app-bar-nav-icon
      v-show="$vuetify.breakpoint.mobile"
      id="toggleDrawer"
      aria-label="Toggle Drawer"
      @click.stop="toggleDrawer"
    />

    <v-toolbar-title
      class="mr-auto align-center d-flex pl-0"
    >
      <router-link
        class="text-decoration-none"
        to="/"
      >
        Casper Holders
      </router-link>
      <template v-if="!$vuetify.breakpoint.xs">
        <v-chip
          small
          class="ml-2"
          label
          color="info"
          data-cy="humanReadableNetwork"
          :href="swapCasperHoldersUrl"
        >
          {{ HUMAN_READABLE_NETWORK }}
          <v-icon right>
            {{ mdiSwapHorizontal }}
          </v-icon>
        </v-chip>
      </template>
    </v-toolbar-title>
    <v-menu
      v-if="e2e"
      open-on-hover
      left
      offset-y
    >
      <template #activator="{ on, attrs }">
        <v-btn
          color="primary"
          dark
          v-bind="attrs"
          v-on="on"
        >
          Select e2e key
        </v-btn>
      </template>

      <v-list>
        <v-list-item @click="dispatchE2Econnection(0)">
          <v-list-item-title>Test Key 1</v-list-item-title>
        </v-list-item>
        <v-list-item @click="dispatchE2Econnection(1)">
          <v-list-item-title>MultiSig Key 1</v-list-item-title>
        </v-list-item>
        <v-list-item @click="dispatchE2Econnection(2)">
          <v-list-item-title>MultiSig Key 2</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
    <connect-dialog v-if="displayConnect" />
    <AccountPopup v-if="signer.activeKey" />
    <v-menu
      left
      offset-y
      :close-on-content-click="false"
    >
      <template #activator="{ on, attrs }">
        <v-btn
          v-bind="attrs"
          :disabled="disabledNotifications"
          :ripple="false"
          icon
          aria-label="Notifications"
          v-on="on"
        >
          <v-badge
            :color="badgeColor"
            :content="badgeContent"
            :value="badgeContent"
            class="notification-badge"
            overlap
          >
            <v-icon dark>
              {{ mdiBell }}
            </v-icon>
          </v-badge>
        </v-btn>
      </template>
      <v-list
        color="primary"
        style="border-bottom: 5px solid #ff473e !important;"
      >
        <template v-for="(operation, index) in operations">
          <v-divider
            v-if="index > 0"
            :key="'app_bar_divider'+operation.hash"
          />
          <v-list-item :key="'app_bar'+operation.hash">
            <v-list-item-icon>
              <v-icon :color="operationIconColor(operation)">
                {{ operationIcon(operation) }}
              </v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>{{ operation.name }}</v-list-item-title>
              <v-list-item-subtitle>{{ truncateText(operation.hash) }}</v-list-item-subtitle>
            </v-list-item-content>
            <v-list-item-action-text>
              <v-btn
                :href="getOperationUrl(operation)"
                class="mr-3"
                color="secondary"
                fab
                target="_blank"
                rel="noopener"
                x-small
              >
                <v-icon x-small>
                  {{ mdiOpenInNew }}
                </v-icon>
              </v-btn>
              <v-btn
                color="tertiary"
                fab
                x-small
                @click="removeDeployResult(operation)"
              >
                <v-icon x-small>
                  {{ mdiClose }}
                </v-icon>
              </v-btn>
            </v-list-item-action-text>
          </v-list-item>
        </template>
        <v-divider
          v-if="operations.length > 0 && offlineDeploys.length > 0"
        />
        <v-list-item v-if="offlineDeploys.length > 0">
          <v-list-item-icon>
            <v-icon color="white">
              {{ mdiClock }}
            </v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>Pending Operations</v-list-item-title>
            <v-list-item-subtitle>
              Those operations will be send when you will be back online.
            </v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
        <template v-for="(operation) in offlineDeploys">
          <v-divider
            :key="'app_bar_divider'+operation.deployResult.hash"
          />
          <v-list-item :key="'app_bar'+operation.deployResult.hash">
            <v-list-item-icon>
              <v-icon :color="operationIconColor(operation.deployResult)">
                {{ operationIcon(operation.deployResult) }}
              </v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>{{ operation.deployResult.name }}</v-list-item-title>
              <v-list-item-subtitle>
                {{
                  truncateText(operation.deployResult.hash)
                }}
              </v-list-item-subtitle>
            </v-list-item-content>
            <v-list-item-action-text>
              <v-btn
                :href="getOperationUrl(operation.deployResult)"
                class="mr-3"
                color="secondary"
                fab
                target="_blank"
                rel="noopener"
                x-small
              >
                <v-icon x-small>
                  {{ mdiOpenInNew }}
                </v-icon>
              </v-btn>
            </v-list-item-action-text>
          </v-list-item>
        </template>
      </v-list>
    </v-menu>
  </v-app-bar>
</template>

<script>
import AccountPopup from '@/components/layout/AccountPopup';
import ConnectDialog from '@/components/layout/ConnectDialog';
import { CSPR_LIVE_URL, HUMAN_READABLE_NETWORK, NETWORK } from '@/helpers/env';
import generateAsymmetricKey from '@/helpers/generateAsymmetricKey';
import truncate from '@/helpers/strings/truncate';
import { DeployResult } from '@casperholders/core';
import {
  mdiAlertCircle,
  mdiBell,
  mdiCheckboxMarkedCircle,
  mdiClock,
  mdiClose,
  mdiHelpCircle,
  mdiOpenInNew,
  mdiSwapHorizontal,
} from '@mdi/js';
import { mapGetters, mapState } from 'vuex';

/**
 * AppBar Component
 * Contains a lot of utilities methods to display correctly some data or to
 * update the notification tray with the VueX store data
 */
export default {
  name: 'AppBar',
  components: { AccountPopup, ConnectDialog },
  props: {
    links: {
      type: Object,
      required: true,
    },
  },
  data: () => ({
    e2e: import.meta.env.VITE_APP_E2E,
    mdiSwapHorizontal,
    mdiBell,
    mdiOpenInNew,
    mdiClose,
    mdiClock,
    isWindowTop: true,
    displayConnect: false,
    copied: false,
    HUMAN_READABLE_NETWORK,
  }),
  computed: {
    ...mapState(['operations', 'signer', 'signerType', 'offlineDeploys']),
    ...mapGetters([
      'signerObject',
      'signerOptionsFactory',
    ]),
    swapCasperHoldersUrl() {
      return NETWORK === 'casper' ? 'https://testnet.casperholders.io' : 'https://casperholders.io';
    },
    disabledNotifications() {
      return this.operations.length === 0 && this.offlineDeploys.length === 0;
    },
    badgeColor() {
      if (
        this.operations.filter(
          (operation) => operation.status === DeployResult.STATUS_UNKNOWN,
        ).length > 0 || this.offlineDeploys.length > 0
      ) {
        return 'primary';
      }

      if (this.operations.filter((operation) => operation.status === false).length > 0) {
        return 'tertiary';
      }

      return 'green';
    },
    badgeContent() {
      if (this.offlineDeploys.length > 0) {
        return this.offlineDeploys.length;
      }

      if (
        this.operations.filter(
          (operation) => operation.status === DeployResult.STATUS_UNKNOWN,
        ).length > 0
      ) {
        return this.operations.filter(
          (operation) => operation.status === DeployResult.STATUS_UNKNOWN,
        ).length;
      }

      if (this.operations.filter((operation) => operation.status === false).length > 0) {
        return this.operations.filter((operation) => operation.status === false).length;
      }

      return this.operations.length;
    },
  },
  watch: {
    'signer.activeKey': {
      handler(current, previous) {
        if (previous === null && current !== null) {
          this.displayConnect = false;
        }
        if (previous !== null && current === null) {
          this.displayConnect = true;
        }
      },
    },
  },
  mounted() {
    this.displayConnect = this.signer.activeKey === null;
  },
  methods: {
    dispatchE2Econnection(index) {
      const e2eKeys = [
        generateAsymmetricKey(import.meta.env.VITE_APP_FAKE_KEY),
        generateAsymmetricKey(import.meta.env.VITE_APP_FAKE_MULTISIG_KEY),
        generateAsymmetricKey(import.meta.env.VITE_APP_FAKE_SECOND_MULTISIG_KEY),
      ];
      const msg = {
        detail: {
          isUnlocked: true,
          isConnected: true,
          activeKey: e2eKeys[index].publicKey.toHex().toLowerCase(),
        },
      };
      if (index > 0) {
        msg.detail.isMultisig = index === 1 ? 'firstKey' : 'secondKey';
      }
      window.dispatchEvent(new CustomEvent('signer:connected', msg));
    },
    toggleDrawer() {
      this.$root.$emit('toggleDrawer');
    },
    onScroll() {
      this.isWindowTop = document.documentElement.scrollTop === 0;
    },
    operationIcon(operation) {
      if (operation.status === DeployResult.STATUS_UNKNOWN) {
        return mdiHelpCircle;
      }
      return operation.status === DeployResult.STATUS_OK ? mdiCheckboxMarkedCircle : mdiAlertCircle;
    },
    operationIconColor(operation) {
      if (operation.status === DeployResult.STATUS_UNKNOWN) {
        return 'white';
      }
      return operation.status === DeployResult.STATUS_OK ? 'green' : 'tertiary';
    },
    getOperationUrl(operation) {
      return `${CSPR_LIVE_URL}deploy/${operation.hash}`;
    },
    truncateText(str) {
      return truncate(str, { size: 15 });
    },
    removeDeployResult(operation) {
      this.$store.dispatch('removeDeployResult', operation);
    },
  },
};
</script>

<style scoped>
    .appbar__top {
        background: transparent !important;
    }

    .appbar {
        background: linear-gradient(90deg, #00012a, #00126b, #ff473e)
    }

    .notification-badge ::v-deep .v-badge__badge .v-icon {
        color: inherit;
        font-size: 12px !important;
        height: 12px !important;
        width: 12px !important;
    }
</style>
