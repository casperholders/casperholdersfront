<template>
  <v-navigation-drawer
    v-if="$vuetify.breakpoint.mobile"
    v-model="drawer"
    app
    bottom
    color="secondary"
    height="100%"
  >
    <div
      v-for="(items, name) in links"
      :key="name"
    >
      <v-subheader>{{ name }}</v-subheader>
      <v-list
        dense
      >
        <v-list-item
          v-for="item in items"
          :key="item.title"
          :to="item.route"
          link
        >
          <v-list-item-icon>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-icon>

          <v-list-item-content>
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
      <v-divider />
    </div>
    <div>
      <v-list>
        <v-list-item>
          <v-tooltip bottom>
            <template #activator="{ on, attrs }">
              <v-list-item-avatar
                v-bind="attrs"
                :color="signer.connected ? 'green' : 'red'"
                v-on="on"
              >
                <v-icon>{{ signer.connected ? "mdi-check-bold" : "mdi-close-thick" }}</v-icon>
              </v-list-item-avatar>
            </template>
            <span>{{ signer.connected ? "Connected !" : "Disconnected !" }}</span>
          </v-tooltip>
          <v-list-item-content class="px-2">
            <v-list-item-title>Casper Signer Status</v-list-item-title>
            <v-list-item-subtitle>Version {{ signer.version }}</v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </v-list>
      <v-divider />
      <v-list>
        <v-list-item>
          <v-list-item-content class="px-2">
            <v-list-item-title>Casper Network</v-list-item-title>
            <v-list-item-subtitle>{{ $getHumanReadableNetwork() }}</v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </div>
  </v-navigation-drawer>
</template>

<script>

import { mapState } from 'vuex';

/**
 * NavigationDrawer component
 */
export default {
  name: 'NavigationDrawer',
  props: {
    links: {
      type: Array,
      required: true,
    },
  },
  data: () => ({
    drawer: false,
  }),
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
};
</script>

<style scoped>

</style>
