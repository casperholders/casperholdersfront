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
            {{ minified ? 'mdi-chevron-right' : 'mdi-chevron-left' }}
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
          <v-icon>mdi-home</v-icon>
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
            <v-icon>mdi-swap-horizontal</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>Switch to {{ swapNetworkName }}</v-list-item-title>
          </v-list-item-content>
        </navigation-drawer-list-item>
      </template>
      <navigation-drawer-list-item
        :minified="minified"
        tooltip="Settings"
        to="/settings"
        link
        exact
      >
        <v-list-item-icon>
          <v-icon>mdi-cog</v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title>Settings</v-list-item-title>
        </v-list-item-content>
      </navigation-drawer-list-item>
    </navigation-drawer-list>

    <template v-for="(items, name) in links">
      <v-divider
        :key="`nav-group-${name}-divider`"
        role="presentation"
      />
      <navigation-drawer-list-header
        :key="`nav-group-${name}-header`"
        :minified="minified"
      >
        {{ name }}
      </navigation-drawer-list-header>
      <navigation-drawer-list :key="`nav-group-${name}-items`">
        <navigation-drawer-list-item
          v-for="(item, index) in items"
          :id="`nav-group-${name}-items-${index}`"
          :key="`nav-group-${name}-items-${index}`"
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
      </navigation-drawer-list>
    </template>

    <v-divider role="presentation" />
    <navigation-drawer-list>
      <v-tooltip
        :disabled="!minified"
        right
      >
        <template #activator="{ attrs, on }">
          <v-list-group
            v-bind="attrs"
            prepend-icon="mdi-hammer-wrench"
            v-on="on"
          >
            <template #activator>
              <v-list-item-title>Advanced</v-list-item-title>
            </template>
            <navigation-drawer-list-item
              v-for="(item, index) in advanced"
              :id="`nav-group-advanced-items-${index}`"
              :key="`nav-group-advanced-items-${index}`"
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
                v-if="item.beta"
              >
                <v-chip
                  outlined
                  small
                >
                  <v-icon left>
                    mdi-fire
                  </v-icon>
                  Beta
                </v-chip>
              </v-list-item-action>
            </navigation-drawer-list-item>
          </v-list-group>
        </template>
        <span>Advanced</span>
      </v-tooltip>
    </navigation-drawer-list>
  </v-navigation-drawer>
</template>

<script>
import NavigationDrawerList from '@/components/layout/NavigationDrawerList';
import NavigationDrawerListHeader from '@/components/layout/NavigationDrawerListHeader';
import NavigationDrawerListItem from '@/components/layout/NavigationDrawerListItem';
import { HUMAN_READABLE_NETWORK, NETWORK } from '@/helpers/env';

/**
 * NavigationDrawer component
 */
export default {
  name: 'NavigationDrawer',
  components: { NavigationDrawerListHeader, NavigationDrawerListItem, NavigationDrawerList },
  props: {
    links: {
      type: Object,
      required: true,
    },
    advanced: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
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
