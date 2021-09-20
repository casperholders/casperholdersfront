<template>
  <v-app-bar
    v-scroll="onScroll"
    :class="{'appbar__top': isWindowTop}"
    class="appbar"
    color="transparent"
    app
    elevate-on-scroll
  >
    <v-container class="d-flex align-center container__small">
      <v-app-bar-nav-icon
        v-show="$vuetify.breakpoint.mobile"
        class="mr-1"
        @click.stop="toggleDrawer"
      />

      <v-toolbar-title
        class="mr-auto"
        style="cursor: pointer"
        @click="$router.push('/')"
      >
        Casper Holders {{ $getNetwork() !== 'casper' ? $getHumanReadableNetwork() : '' }}
      </v-toolbar-title>

      <v-menu
        left
        offset-y
      >
        <template #activator="{ on, attrs }">
          <v-btn
            v-bind="attrs"
            :disabled="disabledNotifications"
            :ripple="false"
            icon
            v-on="on"
          >
            <v-badge
              :color="badgeColor"
              :content="badgeContent"
              :value="badgeContent"
              :icon="badgeIcon"
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
          <v-list-item v-if="!signer.connected || signer.lock || signer.activeKey === null">
            <v-list-item-icon>
              <v-icon color="tertiary">
                mdi-lock
              </v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>
                Casper Signer {{ signer.lock ? 'locked' : 'disconnected' }}
              </v-list-item-title>
              <v-list-item-subtitle>
                Please {{ signer.lock ? 'unlock' : 're-connect' }}
              </v-list-item-subtitle>
            </v-list-item-content>
            <v-list-item-action>
              <v-btn

                color="secondary"
                @click="connectionRequest"
              >
                <v-icon left>
                  mdi-account-circle
                </v-icon>
                {{ signer.lock ? 'Unlock' : 'Connect' }}
              </v-btn>
            </v-list-item-action>
          </v-list-item>
          <template v-for="(operation, index) in operations">
            <v-divider
              v-if="index > 0 || (!signer.connected || signer.lock || signer.activeKey === null)"
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
        </v-list>
      </v-menu>
    </v-container>
  </v-app-bar>
</template>

<script>
import { STATUS_OK, STATUS_UNKNOWN } from '@casperholders/core/dist/services/results/deployResult';
import { Signer } from 'casper-js-sdk';
import { mapState } from 'vuex';

/**
 * AppBar Component. Only displayed on non mobile screen
 * Contains a lot of utilities methods to display correctly some data or to
 * update the notification tray with the VueX store data
 */
export default {
  name: 'AppBar',
  props: {
    links: {
      type: Object,
      required: true,
    },
  },
  data: () => ({
    isWindowTop: true,
  }),
  computed: {
    ...mapState(['operations', 'signer']),
    disabledNotifications() {
      return this.operations.length === 0
        && this.signer.connected
        && !this.signer.lock
        && this.signer.activeKey !== null;
    },
    badgeColor() {
      if (!this.signer.connected || this.signer.lock || this.signer.activeKey === null) {
        return 'tertiary';
      }

      if (this.operations.filter((operation) => operation.status === STATUS_UNKNOWN).length > 0) {
        return 'primary';
      }

      if (this.operations.filter((operation) => operation.status === false).length > 0) {
        return 'tertiary';
      }

      return 'green';
    },
    badgeContent() {
      if (!this.signer.connected || this.signer.lock || this.signer.activeKey === null) {
        return undefined;
      }

      if (this.operations.filter((operation) => operation.status === STATUS_UNKNOWN).length > 0) {
        return this.operations.filter((operation) => operation.status === STATUS_UNKNOWN).length;
      }

      if (this.operations.filter((operation) => operation.status === false).length > 0) {
        return this.operations.filter((operation) => operation.status === false).length;
      }

      return this.operations.length;
    },
    badgeIcon() {
      if (this.signer.connected && !this.signer.lock && this.signer.activeKey) {
        return undefined;
      }

      return 'mdi-lock';
    },
  },
  methods: {
    toggleDrawer() {
      this.$root.$emit('toggleDrawer');
    },
    onScroll() {
      this.isWindowTop = document.documentElement.scrollTop === 0;
    },
    operationIcon(operation) {
      if (operation.status === STATUS_UNKNOWN) {
        return 'mdi-help-circle';
      }
      return operation.status === STATUS_OK ? 'mdi-checkbox-marked-circle' : 'mdi-alert-circle';
    },
    operationIconColor(operation) {
      if (operation.status === STATUS_UNKNOWN) {
        return 'white';
      }
      return operation.status === STATUS_OK ? 'green' : 'tertiary';
    },
    getOperationUrl(operation) {
      return `${this.$getCsprLiveUrl()}deploy/${operation.hash}`;
    },
    truncateText(str) {
      return `${str.substring(0, 6)}...${str.substring(str.length - 6)}`;
    },
    removeDeployResult(operation) {
      this.$store.dispatch('removeDeployResult', operation);
    },
    connectionRequest() {
      Signer.sendConnectionRequest();
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
