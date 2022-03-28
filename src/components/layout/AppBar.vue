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
      class="mr-auto"
      style="cursor: pointer"
      @click="$router.push('/')"
    >
      Casper Holders {{ titleNetwork }}
    </v-toolbar-title>
    <connect v-if="displayConnect" />
    <v-menu
      v-if="signer.activeKey"
      left
      offset-y
      :close-on-content-click="false"
    >
      <template #activator="{ on, attrs }">
        <v-btn
          id="account"
          v-bind="attrs"
          icon
          v-on="on"
        >
          <v-icon dark>
            mdi-account
          </v-icon>
        </v-btn>
      </template>
      <v-list
        color="primary"
        style="border-bottom: 5px solid #ff473e !important;"
      >
        <v-list-item>
          <v-list-item-icon>
            <v-icon color="white">
              mdi-key
            </v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>
              {{ truncateText(signer.activeKey) }}
            </v-list-item-title>
            <v-list-item-subtitle>
              Connected with : {{ humanReadableSigner }}
            </v-list-item-subtitle>
          </v-list-item-content>
          <v-list-item-action-text>
            <v-tooltip
              bottom
            >
              <template #activator="{ on, attrs }">
                <v-btn
                  fab
                  x-small
                  icon
                  v-bind="attrs"
                  class="mr-3"
                  @click="copyPublicKey"
                  v-on="on"
                >
                  <v-icon>mdi-content-copy</v-icon>
                </v-btn>
              </template>

              <span>{{ copied ? 'Copied !' : 'Not copied' }}</span>
            </v-tooltip>
            <v-btn
              id="logout"
              color="secondary"
              @click="logout"
            >
              <v-icon left>
                mdi-close
              </v-icon>
              Logout
            </v-btn>
          </v-list-item-action-text>
        </v-list-item>
      </v-list>
    </v-menu>
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
              mdi-bell
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
                  mdi-open-in-new
                </v-icon>
              </v-btn>
              <v-btn
                color="tertiary"
                fab
                x-small
                @click="removeDeployResult(operation)"
              >
                <v-icon x-small>
                  mdi-close
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
              mdi-clock
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
                  mdi-open-in-new
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
import Connect from '@/components/layout/Connect';
import { CSPR_LIVE_URL, HUMAN_READABLE_NETWORK, NETWORK } from '@/helpers/env';
import { CASPER_SIGNER, LEDGER_SIGNER, LOCAL_SIGNER, TORUS_SIGNER } from '@/helpers/signers';
import { torusOptions } from '@/store';
import { DeployResult } from '@casperholders/core';
import { mapGetters, mapState } from 'vuex';

/**
 * AppBar Component
 * Contains a lot of utilities methods to display correctly some data or to
 * update the notification tray with the VueX store data
 */
export default {
  name: 'AppBar',
  components: { Connect },
  props: {
    links: {
      type: Object,
      required: true,
    },
  },
  data: () => ({
    isWindowTop: true,
    displayConnect: false,
    copied: false,
  }),
  computed: {
    ...mapState(['operations', 'signer', 'signerType', 'offlineDeploys']),
    ...mapGetters([
      'signerObject',
      'signerOptionsFactory',
    ]),
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
    disabledNotifications() {
      return this.operations.length === 0 && this.offlineDeploys.length === 0;
    },
    titleNetwork() {
      return NETWORK !== 'casper' ? HUMAN_READABLE_NETWORK : '';
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
          setTimeout(() => {
            this.displayConnect = false;
          }, 2000);
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
    toggleDrawer() {
      this.$root.$emit('toggleDrawer');
    },
    onScroll() {
      this.isWindowTop = document.documentElement.scrollTop === 0;
    },
    operationIcon(operation) {
      if (operation.status === DeployResult.STATUS_UNKNOWN) {
        return 'mdi-help-circle';
      }
      return operation.status === DeployResult.STATUS_OK ? 'mdi-checkbox-marked-circle' : 'mdi-alert-circle';
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
      return `${str.substring(0, 6)}...${str.substring(str.length - 6)}`;
    },
    removeDeployResult(operation) {
      this.$store.dispatch('removeDeployResult', operation);
    },
    async logout() {
      if (this.signerType === TORUS_SIGNER) {
        await torusOptions.torusInstance.logout();
      }
      await this.$store.dispatch('logout');
    },
    copyPublicKey() {
      navigator.clipboard.writeText(this.signer.activeKey);
      this.copied = true;
      setTimeout(() => {
        this.copied = false;
      }, 2000);
    },
  },
};
</script>

<style scoped>
    .appbar__top {
        background: transparent !important;
    }

    .appbar {
        background: linear-gradient(90deg, #00012A, #00126b, #ff473e)
    }

    .notification-badge ::v-deep .v-badge__badge .v-icon {
        color: inherit;
        font-size: 12px !important;
        height: 12px !important;
        width: 12px !important;
    }
</style>
