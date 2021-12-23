<template>
  <div class="d-flex flex-column justify-center">
    <div class="mx-auto">
      <img
        width="120px"
        :src="logoSvg"
        alt="Casper Holders Logo"
      >
    </div>
    <div class="d-flex align-center mx-auto text-h3  mb-6 text-center text--white pb-4 ">
      Casper Holders
    </div>
    <div class="mx-auto text-h5 text-center text--white pb-6">
      <p>
        The first third party UI to interact with the Casper Blockchain.
      </p>
    </div>
    <div class="d-flex align-center flex-wrap">
      <v-btn
        class="mb-8 mx-auto"
        color="tertiary"
        href="https://chrome.google.com/webstore/detail/casperlabs-signer/djhndpllfiibmcdbnmaaahkhchcoijce"
        large
        rounded
        target="_blank"
        rel="noopener"
      >
        <v-icon
          class="mr-3"
          large
          left
        >
          mdi-download
        </v-icon>
        Download Casper Signer
      </v-btn>

      <v-dialog
        v-model="dialog"
        width="1200"
      >
        <template #activator="{ on, attrs }">
          <v-btn
            id="tutorial"
            class="mb-8 mx-auto"
            color="secondary"
            large
            rounded
            v-bind="attrs"
            v-on="on"
          >
            <v-icon
              class="mr-3"
              large
              left
            >
              mdi-account-circle
            </v-icon>
            CasperHolders tutorial
          </v-btn>
        </template>

        <v-card
          id="tutorialDialog"
          class="rounded-xl primary"
        >
          <v-card-title class="text-h5">
            CasperHolders Tutorial
          </v-card-title>

          <v-card-text>
            <v-carousel
              hide-delimiter-background
              delimiter-icon="mdi-minus"
            >
              <v-carousel-item>
                <v-row
                  class="fill-height"
                  align="center"
                  justify="center"
                >
                  <p class="text-body-1">
                    Download Casper Signer
                    <a
                      href="https://chrome.google.com/webstore/detail/casperlabs-signer/djhndpllfiibmcdbnmaaahkhchcoijce"
                      target="_blank"
                      rel="noopener"
                    >
                      here
                    </a>.
                    <br>
                    Install it and allow the permission to read data from website.<br>
                    The Casper Signer work with a whitelist so only authorized website can use it.
                    <br>
                    You may have to accept those permissions again in the future
                    if other website are integrated.<br>
                  </p>
                </v-row>
              </v-carousel-item>
              <v-carousel-item>
                <v-row
                  class="fill-height"
                  align="center"
                  justify="center"
                >
                  <p class="text-body-1">
                    Open the extension, you'll be greeted to create a new vault.<br>
                    Enter a secure password and make sure to not forget it.<br>
                    <v-img
                      src="@/assets/images/new_vault.png"
                      alt="New vault image"
                      contain
                      max-height="300px"
                    />
                  </p>
                </v-row>
              </v-carousel-item>
              <v-carousel-item>
                <v-row
                  class="fill-height"
                  align="center"
                  justify="center"
                >
                  <p class="text-body-1">
                    Then click on create account, you'll have to choose between two types of
                    key.<br>
                    ED25519 is fast, provides high level of security with fool
                    proof session keys among other features.<br>
                    Secp256k1 is an efficient encryption algorithm and it's
                    the same algorithm used by bitcoin and Ethereum.<br>
                    If you plan to use a Ledger device please choose Secp256k1
                    otherwise choose whatever type you want.<br>
                    <v-img
                      src="@/assets/images/new_account.png"
                      alt="New account image"
                      contain
                      max-height="300px"
                    />
                  </p>
                </v-row>
              </v-carousel-item>
              <v-carousel-item>
                <v-row
                  class="fill-height"
                  align="center"
                  justify="center"
                >
                  <p class="text-body-1">
                    You've just created an account on Casper Network, congrats !<br>
                    <strong>Make sure to back-up your key before doing anything else !</strong><br>
                    Click on the top right menu and then "Download Active Key"<br>
                    You can also download any of your accounts in the "Key Management" page<br>
                    By clicking the download icon (downward arrow) on any of your keys.<br>
                    <v-img
                      src="@/assets/images/account_created.png"
                      alt="Account created image"
                      contain
                      max-height="300px"
                    />
                  </p>
                </v-row>
              </v-carousel-item>
              <v-carousel-item>
                <v-row
                  class="fill-height"
                  align="center"
                  justify="center"
                >
                  <p class="text-body-1">
                    Let's see if everything is working !<br>
                    <v-btn
                      class="mr-2"
                      color="secondary"
                      @click="connectionRequest"
                    >
                      Connect
                    </v-btn>
                    to the casper signer !<br>
                    You should see this screen : <br>
                    <v-img
                      src="@/assets/images/connect.png"
                      alt="Connection page image"
                      contain
                      max-height="300px"
                    />
                    After being connected you'll see a confirmation text just under this text.<br>
                    <template v-if="publicKey">
                      <v-icon color="green">
                        mdi-checkbox-marked-circle
                      </v-icon>
                      Congrats ! You're connected
                    </template>
                  </p>
                </v-row>
              </v-carousel-item>
              <v-carousel-item>
                <v-row
                  class="fill-height"
                  align="center"
                  justify="center"
                >
                  <p class="text-body-1">
                    <template v-if="publicKey">
                      Here's your public key : {{ publicKey }}
                      <v-tooltip
                        bottom
                      >
                        <template #activator="{ on, attrs }">
                          <v-btn
                            id="copyToClipboard"
                            fab
                            x-small
                            icon
                            v-bind="attrs"
                            @click="copyPublicKey"
                            v-on="on"
                          >
                            <v-icon>mdi-content-copy</v-icon>
                          </v-btn>
                        </template>

                        <span>{{ copied ? 'Copied !' : 'Not copied' }}</span>
                      </v-tooltip>

                      <br>
                      Now you can transfer funds from exchange to this public key.<br>
                      <strong>
                        Note : If exchange ask for a memo or a transfer ID
                        try putting "0" with a small amount first.
                      </strong><br>
                      After you've transferred some funds (this could take a few minutes) check your
                      <a href="/balance">balance</a><br>
                      Or <a href="/stake">stake</a> with us or do any operations
                      you want on CasperHolders. Enjoy !
                    </template>
                    <template v-else>
                      <v-icon color="red">
                        mdi-alert-circle
                      </v-icon>
                      Oops... You don't seems to be connected or you don't have
                      selected an account.<br>
                      Go back to create an account or open the Casper Signer
                      and select an account.<br>
                      You can do that in the top right menu and selecting
                      an account in the list.<br>
                    </template>
                  </p>
                </v-row>
              </v-carousel-item>
            </v-carousel>
          </v-card-text>

          <v-divider />

          <v-card-actions>
            <v-btn
              id="closeTutorial"
              color="quaternary"
              rounded
              @click="dialog = false"
            >
              Close
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>

    <Features />
    <Roadmap />
    <Metrics />
    <v-btn
      class="mb-3 mt-10 mx-auto"
      color="tertiary"
      href="https://github.com/casperholders/casperholdersfront"
      large
      rounded
      target="_blank"
      rel="noopener"
    >
      <v-icon
        class="mr-3"
        large
        left
      >
        mdi-github
      </v-icon>
      Technical information
    </v-btn>
    <v-btn
      class="mb-3 mt-10 mx-auto"
      color="secondary"
      :href="swapCasperHoldersUrl"
      large
      rounded
    >
      <v-icon
        class="mr-3"
        large
        left
      >
        mdi-swap-horizontal-bold
      </v-icon>
      Switch to {{ swapNetworkName }}
    </v-btn>
  </div>
</template>

<script>

import Features from '@/components/home/Features';
import Metrics from '@/components/home/Metrics';
import Roadmap from '@/components/home/Roadmap';
import { NETWORK } from '@/helpers/env';
import { mapState } from 'vuex';
import logoSvg from '@/assets/images/logo.svg';

/**
 * Home view
 * Holds a small tutorial to create an account on the Casper Signer extension
 * & The Metrics / Roadmap / Features components
 */
export default {
  name: 'Home',
  components: { Metrics, Roadmap, Features },
  data: () => ({
    logoSvg,
    carousel: 0,
    dialog: false,
    copied: false,
  }),
  computed: {
    ...mapState(['signer']),
    publicKey() {
      return this.signer.activeKey;
    },
    swapNetworkName() {
      return NETWORK === 'casper' ? 'TestNet' : 'MainNet';
    },
    swapCasperHoldersUrl() {
      return NETWORK === 'casper' ? 'https://testnet.casperholders.io' : 'https://casperholders.io';
    },
  },
  methods: {
    async connectionRequest() {
      await this.$store.dispatch('openConnectDialog');
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
