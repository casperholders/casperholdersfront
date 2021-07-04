<template>
  <v-navigation-drawer
      app
      bottom
      v-if="$vuetify.breakpoint.mobile"
      color="secondary"
      v-model="drawer"
      height="100%"
  >
    <div
        v-bind:key="name"
        v-for="(items, name) in links"
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
      <v-divider></v-divider>
    </div>
    <div>
      <v-list>
        <v-list-item>
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-list-item-avatar
                  :color="signer.connected ? 'green' : 'red'"
                  v-bind="attrs"
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
      <v-divider></v-divider>
      <v-list>
        <v-list-item>
          <v-list-item-content class="px-2">
            <v-list-item-title>Casper Network</v-list-item-title>
            <v-list-item-subtitle>{{ network === "casper" ? "MainNet" : "TestNet" }}</v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </div>
  </v-navigation-drawer>
</template>

<script>

import {mapState} from "vuex";

export default {
  name: "NavigationDrawer",
  props: ['links'],
  data: () => ({
    network: "",
    drawer: false,
  }),
  computed: {
    ...mapState([
      "signer",
    ]),
  },
  mounted() {
    this.network = process.env.VUE_APP_NETWORK
    this.$root.$on('toggleDrawer', () => {
      this.drawer = !this.drawer
    })
  }
}
</script>

<style scoped>

</style>