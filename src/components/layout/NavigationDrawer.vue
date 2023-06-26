<template>
  <v-navigation-drawer
    id="drawer"
    v-model="drawer"
    :mini-variant="minified && !$vuetify.breakpoint.mobile"
    color="secondary"
    height="100%"
    app
  >
    <navigation-drawer-list>
      <navigation-drawer-list-item
        v-if="!$vuetify.breakpoint.mobile"
        :minified="minified"
        :tooltip="minified ? 'Expand' : 'Minimize'"
        @click="toggleMinified"
      >
        <v-list-item-icon>
          <v-icon>
            {{ minified ? mdiChevronRight : mdiChevronLeft }}
          </v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title>
            {{ minified ? 'Expand' : 'Minimize' }}
          </v-list-item-title>
        </v-list-item-content>
      </navigation-drawer-list-item>
      <navigation-drawer-list-item
        :minified="minified"
        tooltip="Home"
        to="/"
        link
        exact
      >
        <v-list-item-icon>
          <v-icon>{{ mdiHome }}</v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title>Home</v-list-item-title>
        </v-list-item-content>
      </navigation-drawer-list-item>
      <template v-if="$vuetify.breakpoint.xs">
        <navigation-drawer-list-item
          :minified="minified"
          :tooltip="`Switch to ${swapNetworkName}`"
          :href="swapCasperHoldersUrl"
          link
          exact
        >
          <v-list-item-icon>
            <v-icon>{{ mdiSwapHorizontal }}</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>Switch to {{ swapNetworkName }}</v-list-item-title>
          </v-list-item-content>
        </navigation-drawer-list-item>
      </template>
      <navigation-drawer-list-item
        :minified="minified"
        tooltip="Account"
        to="/account"
        link
        exact
      >
        <v-list-item-icon>
          <v-icon>{{ mdiAccount }}</v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title>Account</v-list-item-title>
        </v-list-item-content>
      </navigation-drawer-list-item>
      <template v-for="(item, index) in links">
        <navigation-drawer-list-item
          v-if="!item.hide"
          :id="`nav-group-items-${index}`"
          :key="`nav-group-items-${index}`"
          :minified="minified"
          :tooltip="item.title"
          :to="item.route"
          link
          exact
          :disabled="item.disabled"
        >
          <v-list-item-icon>
            <v-icon>
              {{ item.icon }}
            </v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>
              {{ item.title }}
            </v-list-item-title>
            <v-list-item-subtitle
              v-if="item.subtitle !== null"
            >
              {{ item.subtitle }}
            </v-list-item-subtitle>
          </v-list-item-content>
          <v-list-item-action
            v-if="item.chip"
          >
            <v-chip
              outlined
              small
            >
              <v-icon left>
                {{ item.chip.icon }}
              </v-icon>
              {{ item.chip.text }}
            </v-chip>
          </v-list-item-action>
        </navigation-drawer-list-item>
      </template>
    </navigation-drawer-list>
  </v-navigation-drawer>
</template>

<script>
import NavigationDrawerList from '@/components/layout/NavigationDrawerList';
import NavigationDrawerListItem from '@/components/layout/NavigationDrawerListItem';
import { HUMAN_READABLE_NETWORK, NETWORK } from '@/helpers/env';
import {
  mdiAccount,
  mdiChevronLeft,
  mdiChevronRight,
  mdiFire,
  mdiHammerWrench,
  mdiHome,
  mdiSwapHorizontal,
} from '@mdi/js';

/**
 * NavigationDrawer component
 */
export default {
  name: 'NavigationDrawer',
  components: { NavigationDrawerListItem, NavigationDrawerList },
  props: {
    links: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      mdiChevronRight,
      mdiChevronLeft,
      mdiHome,
      mdiSwapHorizontal,
      mdiAccount,
      mdiHammerWrench,
      mdiFire,
      minified: false,
      drawer: !this.$vuetify.breakpoint.mobile,
      HUMAN_READABLE_NETWORK,
    };
  },
  computed: {
    swapCasperHoldersUrl() {
      return NETWORK === 'casper' ? 'https://testnet.casperholders.io' : 'https://casperholders.io';
    },
    swapNetworkName() {
      return NETWORK === 'casper' ? 'Testnet' : 'Mainnet';
    },
  },
  mounted() {
    this.$root.$on('toggleDrawer', () => {
      this.drawer = !this.drawer;
    });
  },
  methods: {
    toggleMinified() {
      this.$nextTick(() => {
        this.minified = !this.minified;
      });
    },
  },
};
</script>

<style
  scoped
  lang="scss"
>
  ::v-deep .v-list-item__icon {
    margin: auto 12px auto 0 !important;
  }

  ::v-deep .v-list-item__title {
    font-weight: bold !important;
    font-size: 0.890rem !important;
    letter-spacing: 0.1rem;
  }
</style>
