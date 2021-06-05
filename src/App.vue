<template>
  <v-app>
    <v-navigation-drawer
      app
      permanent
      color="secondary"
    >
      <v-list>
        <v-list-item
          link
          to="/"
        >
          <v-list-item-content>
            <v-list-item-title class="text-h6">
              Casper Holders
            </v-list-item-title>
            <v-list-item-subtitle>Interact with the Casper Network !</v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </v-list>

      <div
        v-bind:key="name"
        v-for="(items, name) in links"
      >
        <v-divider></v-divider>
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
      </div>
      <div>
        <v-divider></v-divider>
        <v-list>
          <v-list-item>
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-list-item-avatar
                  :color="connected ? 'green' : 'red'"
                  v-bind="attrs"
                  v-on="on"
                >
                  <v-icon>{{ connected ? "mdi-check-bold" : "mdi-close-thick" }}</v-icon>
                </v-list-item-avatar>
              </template>
              <span>{{ connected ? "Connected !" : "Disconnected !" }}</span>
            </v-tooltip>
            <v-list-item-content class="px-2">
              <v-list-item-title>Casper Signer Status</v-list-item-title>
              <v-list-item-subtitle>Version {{ version }}</v-list-item-subtitle>
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
    <v-main>
      <div id="particles"></div>
      <router-view></router-view>
    </v-main>
  </v-app>
</template>

<script>

import {Signer} from "casper-client-sdk";

export default {
    name: 'App',
    components: {},
    async mounted() {
        await this.signerStatus();
        this.timer = setInterval(await this.signerStatus, 60000);
        this.network = process.env.VUE_APP_NETWORK
    },
    data: () => ({
        network: "",
        connected: false,
        version: "",
        timer: '',
        links: {
            General: [
                {title: 'Balance', icon: 'mdi-wallet', route: 'balance'},
                {title: 'Transfer', icon: 'mdi-send', route: 'transfer'},
            ],
            Staking: [
                {title: 'Stake', icon: 'mdi-safe', route: 'stake'},
                {title: 'Unstack', icon: 'mdi-lock-open', route: 'unstack'},
            ],
            Validators: [
                {title: 'Add Bid (WIP)', icon: 'mdi-gavel'},
                {title: 'Withdraw Bid (WIP)', icon: 'mdi-connection'},
            ],
            Developers: [
                {title: 'Send smart contract (WIP)', icon: 'mdi-file-document-edit'},
            ],
            Others: [
                {title: 'FAQ', icon: 'mdi-help', route: 'faq'},
                {title: 'Contact', icon: 'mdi-mail', route: 'contact'},
            ],
        }
    }),
    beforeDestroy() {
        this.cancelAutoUpdate();
    },
    methods: {
        cancelAutoUpdate() {
            clearInterval(this.timer);
        },
        async signerStatus() {
            console.log("Check signer status")
            try {
                const isConnected = await Signer.isConnected();
                if (isConnected) {
                    this.connected = true
                    this.version = await Signer.getVersion()
                } else {
                    this.connected = false
                }
            } catch {
                this.connected = false
            }
        }
    }
};
</script>

<style>
#particles {
    position: fixed;
    top: 0;
    height: 100%;
    width: 100%;
    background-color: #00126b;
}

a {
    color: #e5e9ec !important;
    caret-color: #f4f4f4 !important;
}

.v-tooltip__content {
    border-radius: 24px !important;
}
</style>
