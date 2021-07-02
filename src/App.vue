<template>
  <v-app>
    <NavigationDrawer :links="links" />
    <AppBar :links="links" />
    <v-main>
      <div id="wave">
        <svg
          viewBox="0 0 900 1000"
          xmlns="http://www.w3.org/2000/svg"
          version="1.1"
        >
          <linearGradient id="gradient">
            <stop
              offset="0%"
              stop-color="#00012a"
              stop-opacity="0.75"
            />
            <stop
              offset="50%"
              stop-color="#00126b"
              stop-opacity="0.75"
            />
            <stop
              offset="100%"
              stop-color="#ff473e"
              stop-opacity="0.75"
            />
          </linearGradient>
          <path
            d="M0 226L37.5 243.2C75 260.3 150 294.7 225 307C300 319.3 375 309.7 450 288.3C525 267 600 234 675 231.7C750 229.3 825 257.7 862.5 271.8L900 286L900 0L862.5 0C825 0 750 0 675 0C600 0 525 0 450 0C375 0 300 0 225 0C150 0 75 0 37.5 0L0 0Z"
            fill="url(#gradient)"
            stroke-linecap="round"
            stroke-linejoin="miter"
          ></path>
        </svg>
      </div>
      <v-container fluid>
        <router-view></router-view>
      </v-container>
    </v-main>
    <v-footer color="secondary">
      <v-container>
        <p class="mb-0 text-center">
          <strong>
            CasperHolders is not affiliated with CasperNetwork / CasperAssociation.
            <br />
            This is a project from a community member.
          </strong>
        </p>
      </v-container>
    </v-footer>
  </v-app>
</template>

<script>

import AppBar from "@/components/layout/AppBar";
import NavigationDrawer from "@/components/layout/NavigationDrawer";

export default {
    name: 'App',
    components: {AppBar, NavigationDrawer},
    mounted() {
        this.$nextTick(() => {
            this.$store.dispatch("updateSignerStatus");
            window.addEventListener("signer:connected", (msg) => this.$store.dispatch("connectedSignerEvent", msg.detail));
            window.addEventListener("signer:disconnected", (msg) => this.$store.dispatch("connectedSignerEvent", msg.detail));
            window.addEventListener("signer:tabUpdated", (msg) => this.$store.dispatch("connectedSignerEvent", msg.detail));
            window.addEventListener("signer:activeKeyChanged", (msg) => this.$store.dispatch("connectedSignerEvent", msg.detail));
            window.addEventListener("signer:locked", (msg) => this.$store.dispatch("connectedSignerEvent", msg.detail));
            window.addEventListener("signer:unlocked", (msg) => this.$store.dispatch("connectedSignerEvent", msg.detail));
        })
    },
    data: () => ({
        links: {
            Account: [
                {title: 'Balance', icon: 'mdi-wallet', route: 'balance'},
                {title: 'Transfer', icon: 'mdi-send', route: 'transfer'},
            ],
            Staking: [
                {title: 'Stake', icon: 'mdi-safe', route: 'stake'},
                {title: 'Unstake', icon: 'mdi-lock-open', route: 'unstake'},
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
};
</script>

<style>
@font-face {
    font-family: "RobotoCondensed";
    src: url("assets/fonts/RobotoCondensed/RobotoCondensed-Regular.ttf");
    font-weight: normal;
    font-style: normal;
}

@font-face {
    font-family: "EczarBold";
    src: url("assets/fonts/Eczar/Eczar-Bold.ttf");
    font-weight: bold;
    font-style: normal;
}

.cspr {
    font-family: 'EczarBold', 'RobotoCondensed', Helvetica, Arial, sans-serif;
}

#app {
    font-family: 'RobotoCondensed', Helvetica, Arial, sans-serif;
    background-color: #00126b;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 2000 1500'%3E%3Cdefs%3E%3Crect stroke='%2300126b' stroke-width='0.46' width='1' height='1' id='s'/%3E%3Cpattern id='a' width='3' height='3' patternUnits='userSpaceOnUse' patternTransform='scale(10) translate(-900 -675)'%3E%3Cuse fill='%2305176e' href='%23s' y='2'/%3E%3Cuse fill='%2305176e' href='%23s' x='1' y='2'/%3E%3Cuse fill='%230a1b71' href='%23s' x='2' y='2'/%3E%3Cuse fill='%230a1b71' href='%23s'/%3E%3Cuse fill='%230f2074' href='%23s' x='2'/%3E%3Cuse fill='%230f2074' href='%23s' x='1' y='1'/%3E%3C/pattern%3E%3Cpattern id='b' width='7' height='11' patternUnits='userSpaceOnUse' patternTransform='scale(10) translate(-900 -675)'%3E%3Cg fill='%23142577'%3E%3Cuse href='%23s'/%3E%3Cuse href='%23s' y='5' /%3E%3Cuse href='%23s' x='1' y='10'/%3E%3Cuse href='%23s' x='2' y='1'/%3E%3Cuse href='%23s' x='2' y='4'/%3E%3Cuse href='%23s' x='3' y='8'/%3E%3Cuse href='%23s' x='4' y='3'/%3E%3Cuse href='%23s' x='4' y='7'/%3E%3Cuse href='%23s' x='5' y='2'/%3E%3Cuse href='%23s' x='5' y='6'/%3E%3Cuse href='%23s' x='6' y='9'/%3E%3C/g%3E%3C/pattern%3E%3Cpattern id='h' width='5' height='13' patternUnits='userSpaceOnUse' patternTransform='scale(10) translate(-900 -675)'%3E%3Cg fill='%23142577'%3E%3Cuse href='%23s' y='5'/%3E%3Cuse href='%23s' y='8'/%3E%3Cuse href='%23s' x='1' y='1'/%3E%3Cuse href='%23s' x='1' y='9'/%3E%3Cuse href='%23s' x='1' y='12'/%3E%3Cuse href='%23s' x='2'/%3E%3Cuse href='%23s' x='2' y='4'/%3E%3Cuse href='%23s' x='3' y='2'/%3E%3Cuse href='%23s' x='3' y='6'/%3E%3Cuse href='%23s' x='3' y='11'/%3E%3Cuse href='%23s' x='4' y='3'/%3E%3Cuse href='%23s' x='4' y='7'/%3E%3Cuse href='%23s' x='4' y='10'/%3E%3C/g%3E%3C/pattern%3E%3Cpattern id='c' width='17' height='13' patternUnits='userSpaceOnUse' patternTransform='scale(10) translate(-900 -675)'%3E%3Cg fill='%231a2a7a'%3E%3Cuse href='%23s' y='11'/%3E%3Cuse href='%23s' x='2' y='9'/%3E%3Cuse href='%23s' x='5' y='12'/%3E%3Cuse href='%23s' x='9' y='4'/%3E%3Cuse href='%23s' x='12' y='1'/%3E%3Cuse href='%23s' x='16' y='6'/%3E%3C/g%3E%3C/pattern%3E%3Cpattern id='d' width='19' height='17' patternUnits='userSpaceOnUse' patternTransform='scale(10) translate(-900 -675)'%3E%3Cg fill='%2300126b'%3E%3Cuse href='%23s' y='9'/%3E%3Cuse href='%23s' x='16' y='5'/%3E%3Cuse href='%23s' x='14' y='2'/%3E%3Cuse href='%23s' x='11' y='11'/%3E%3Cuse href='%23s' x='6' y='14'/%3E%3C/g%3E%3Cg fill='%231f2e7d'%3E%3Cuse href='%23s' x='3' y='13'/%3E%3Cuse href='%23s' x='9' y='7'/%3E%3Cuse href='%23s' x='13' y='10'/%3E%3Cuse href='%23s' x='15' y='4'/%3E%3Cuse href='%23s' x='18' y='1'/%3E%3C/g%3E%3C/pattern%3E%3Cpattern id='e' width='47' height='53' patternUnits='userSpaceOnUse' patternTransform='scale(10) translate(-900 -675)'%3E%3Cg fill='%23ff473e'%3E%3Cuse href='%23s' x='2' y='5'/%3E%3Cuse href='%23s' x='16' y='38'/%3E%3Cuse href='%23s' x='46' y='42'/%3E%3Cuse href='%23s' x='29' y='20'/%3E%3C/g%3E%3C/pattern%3E%3Cpattern id='f' width='59' height='71' patternUnits='userSpaceOnUse' patternTransform='scale(10) translate(-900 -675)'%3E%3Cg fill='%23ff473e'%3E%3Cuse href='%23s' x='33' y='13'/%3E%3Cuse href='%23s' x='27' y='54'/%3E%3Cuse href='%23s' x='55' y='55'/%3E%3C/g%3E%3C/pattern%3E%3Cpattern id='g' width='139' height='97' patternUnits='userSpaceOnUse' patternTransform='scale(10) translate(-900 -675)'%3E%3Cg fill='%23ff473e'%3E%3Cuse href='%23s' x='11' y='8'/%3E%3Cuse href='%23s' x='51' y='13'/%3E%3Cuse href='%23s' x='17' y='73'/%3E%3Cuse href='%23s' x='99' y='57'/%3E%3C/g%3E%3C/pattern%3E%3C/defs%3E%3Crect fill='url(%23a)' width='100%25' height='100%25'/%3E%3Crect fill='url(%23b)' width='100%25' height='100%25'/%3E%3Crect fill='url(%23h)' width='100%25' height='100%25'/%3E%3Crect fill='url(%23c)' width='100%25' height='100%25'/%3E%3Crect fill='url(%23d)' width='100%25' height='100%25'/%3E%3Crect fill='url(%23e)' width='100%25' height='100%25'/%3E%3Crect fill='url(%23f)' width='100%25' height='100%25'/%3E%3Crect fill='url(%23g)' width='100%25' height='100%25'/%3E%3C/svg%3E");
    background-attachment: fixed;
    background-size: cover;
}

#wave {
    position: fixed;
    height: 100%;
    width: 100%;
}

a {
    color: #e5e9ec !important;
    caret-color: #f4f4f4 !important;
}

.v-tooltip__content {
    border-radius: 24px !important;
}

.container__small {
    max-width: 1200px !important;
}
</style>
