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
          <v-icon v-text="minified ? 'mdi-chevron-right' : 'mdi-chevron-left'" />
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title v-text="minified ? 'Expand' : 'Minimize'" />
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
    </navigation-drawer-list>

    <template v-for="(items, name) in links">
      <v-divider
        :key="`nav-group-${name}-divider`"
        role="presentation"
      />
      <navigation-drawer-list-header
        :key="`nav-group-${name}-header`"
        :minified="minified"
        v-text="name"
      />
      <navigation-drawer-list :key="`nav-group-${name}-items`">
        <navigation-drawer-list-item
          v-for="(item, index) in items"
          :key="`nav-group-${name}-items-${index}`"
          :minified="minified"
          :tooltip="item.title"
          :to="item.route"
          link
          exact
          :disabled="item.disabled"
        >
          <v-list-item-icon>
            <v-icon v-text="item.icon" />
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title v-text="item.title" />
            <v-list-item-subtitle
              v-if="item.subtitle !== null"
              v-text="item.subtitle"
            />
          </v-list-item-content>
        </navigation-drawer-list-item>
      </navigation-drawer-list>
    </template>

    <v-divider role="presentation" />
    <navigation-drawer-list-header :minified="minified">
      Statuses
    </navigation-drawer-list-header>
    <navigation-drawer-list>
      <navigation-drawer-list-item
        :minified="minified"
        :tooltip="`${signer.connected ? 'connected' : 'disconnected'}!`"
      >
        <v-list-item-icon>
          <v-avatar
            :color="signer.connected ? 'green' : 'red'"
            size="24"
          >
            <v-icon
              size="16"
              v-text="signer.connected ? 'mdi-puzzle-check' : 'mdi-puzzle-remove'"
            />
          </v-avatar>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title>
            Casper Signer Status
          </v-list-item-title>
          <v-list-item-subtitle v-text="`Version ${signer.version || 'unknown'}`" />
        </v-list-item-content>
      </navigation-drawer-list-item>
      <navigation-drawer-list-item
        :minified="minified"
        :tooltip="`Connected to ${HUMAN_READABLE_NETWORK}`"
      >
        <v-list-item-icon>
          <v-icon>
            mdi-lan
          </v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title>Casper Network</v-list-item-title>
          <v-list-item-subtitle v-text="HUMAN_READABLE_NETWORK" />
        </v-list-item-content>
      </navigation-drawer-list-item>
    </navigation-drawer-list>
  </v-navigation-drawer>
</template>

<script>
import NavigationDrawerList from '@/components/layout/NavigationDrawerList';
import NavigationDrawerListHeader from '@/components/layout/NavigationDrawerListHeader';
import NavigationDrawerListItem from '@/components/layout/NavigationDrawerListItem';
import { HUMAN_READABLE_NETWORK } from '@/helpers/env';
import { mapState } from 'vuex';

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
  },
  data() {
    return {
      minified: false,
      drawer: !this.$vuetify.breakpoint.mobile,
      HUMAN_READABLE_NETWORK,
    };
  },
  computed: {
    ...mapState([
      'signer',
    ]),
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

<style scoped>
    ::v-deep .v-list-item__icon {
        margin: auto 12px auto 0 !important;
    }
</style>
