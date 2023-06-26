<template>
  <div class="secondary rounded-xl">
    <v-card-title>
      <v-avatar
        class="mr-4"
        color="primary"
        size="52"
      >
        <v-icon size="24">
          {{ mdiNumericPositive1 }}
        </v-icon>
      </v-avatar>
      Features
    </v-card-title>
    <v-divider />
    <div class="d-flex flex-wrap justify-space-around">
      <div class="feature d-flex flex-column align-center fill-height rounded-xl">
        <v-card-title class="align-center">
          <v-avatar
            color="primary"
            size="52"
          >
            <v-icon size="24">
              {{ mdiWallet }}
            </v-icon>
          </v-avatar>
          <v-card-title class="pl-4">
            Balance
          </v-card-title>
        </v-card-title>
        <v-card-text class="text-body-1 text-center">
          See your current wallet balance, distribution of staked tokens and your staked rewards.
        </v-card-text>
        <v-spacer />
        <v-card-actions class="justify-center">
          <v-btn
            color="primary"
            rounded
            to="balance"
          >
            Check your balance
          </v-btn>
        </v-card-actions>
      </div>
      <div class="feature d-flex flex-column align-center fill-height rounded-xl">
        <v-card-title class="align-center">
          <v-avatar
            color="primary"
            size="52"
          >
            <v-icon size="24">
              {{ mdiSend }}
            </v-icon>
          </v-avatar>
          <v-card-title class="pl-4">
            Transfer
          </v-card-title>
        </v-card-title>
        <v-card-text class="text-body-1 text-center">
          Transfer funds to another account in just a few clicks and within seconds.
        </v-card-text>
        <v-spacer />
        <v-card-actions class="justify-center">
          <v-btn
            color="primary"
            rounded
            to="transfer"
          >
            Transfer funds
          </v-btn>
        </v-card-actions>
      </div>
      <div class="feature d-flex flex-column align-center fill-height rounded-xl">
        <v-card-title class="align-center">
          <v-avatar
            color="primary"
            size="52"
          >
            <v-icon size="24">
              {{ mdiSafe }}
            </v-icon>
          </v-avatar>
          <v-card-title class="pl-4">
            Staking
          </v-card-title>
        </v-card-title>
        <v-card-text class="text-body-1 text-center">
          Stake your tokens to secure the network.<br>Earn up to 20% APY.
        </v-card-text>
        <v-spacer />
        <v-card-actions class="justify-center">
          <v-btn
            color="primary"
            rounded
            to="stake"
          >
            Stake now
          </v-btn>
        </v-card-actions>
      </div>
      <div class="feature d-flex flex-column align-center fill-height rounded-xl">
        <v-card-title class="align-center">
          <v-avatar
            color="primary"
            size="52"
          >
            <v-icon size="24">
              {{ mdiLockOpen }}
            </v-icon>
          </v-avatar>
          <v-card-title class="pl-4">
            Unstaking
          </v-card-title>
        </v-card-title>
        <v-card-text class="text-body-1 text-center">
          Unstake your tokens easily to restake to another validator
          or enjoy freely your tokens in your wallet.
        </v-card-text>
        <v-spacer />
        <v-card-actions class="justify-center">
          <v-btn
            color="primary"
            rounded
            to="unstake"
          >
            Unstake now
          </v-btn>
        </v-card-actions>
      </div>
      <div class="feature d-flex flex-column align-center fill-height rounded-xl">
        <v-card-title class="align-center">
          <v-avatar
            color="primary"
            size="52"
          >
            <v-icon size="24">
              {{ mdiGavel }}
            </v-icon>
          </v-avatar>
          <v-card-title class="pl-4">
            Add bid
          </v-card-title>
        </v-card-title>
        <v-card-text class="text-body-1 text-center">
          Add bid to your current Validator node to stay in the Casper Validators list.
        </v-card-text>
        <v-spacer />
        <v-card-actions class="justify-center">
          <v-btn
            color="primary"
            rounded
            to="unstake"
          >
            Add bid
          </v-btn>
        </v-card-actions>
      </div>
      <div class="feature d-flex flex-column align-center fill-height rounded-xl">
        <v-card-title class="align-center">
          <v-avatar
            color="primary"
            size="52"
          >
            <v-icon size="24">
              {{ mdiLockOpen }}
            </v-icon>
          </v-avatar>
          <v-card-title class="pl-4">
            Withdraw bid
          </v-card-title>
        </v-card-title>
        <v-card-text class="text-body-1 text-center">
          Withdraw your tokens from your Validator Node easily and
          enjoy freely your tokens in your wallet.
        </v-card-text>
        <v-spacer />
        <v-card-actions class="justify-center">
          <v-btn
            color="primary"
            rounded
            to="unstake"
          >
            Withdraw now
          </v-btn>
        </v-card-actions>
      </div>
      <div class="feature d-flex flex-column align-center fill-height rounded-xl">
        <v-card-title class="align-center">
          <v-avatar
            color="primary"
            size="52"
          >
            <v-icon size="24">
              {{ mdiFileDocumentEdit }}
            </v-icon>
          </v-avatar>
          <v-card-title class="pl-4">
            Smart contracts
          </v-card-title>
        </v-card-title>
        <v-card-text class="text-body-1 text-center">
          Deploy smart contracts on the Casper blockchain !
        </v-card-text>
        <v-spacer />
        <v-card-actions class="justify-center">
          <v-btn
            color="primary"
            rounded
            to="smartcontract"
          >
            Deploy Now
          </v-btn>
        </v-card-actions>
      </div>
      <div class="feature d-flex flex-column align-center fill-height rounded-xl">
        <v-card-title class="align-center">
          <v-avatar
            color="primary"
            size="52"
          >
            <v-icon size="24">
              {{ mdiHeartPulse }}
            </v-icon>
          </v-avatar>
          <v-card-title class="pl-4">
            Platform Metrics
          </v-card-title>
        </v-card-title>
        <v-card-text class="text-body-1 text-center">
          Enjoy full platform metrics hover all the different
          types of operations available on our explorer.
        </v-card-text>
        <v-spacer />
        <v-card-actions class="justify-center">
          <v-btn
            color="primary"
            rounded
            href="https://div3.in/stats"
          >
            Div3.in explorer
          </v-btn>
        </v-card-actions>
      </div>
      <div class="feature d-flex flex-column align-center fill-height rounded-xl">
        <v-card-title class="align-center">
          <v-avatar
            color="primary"
            size="52"
          >
            <v-icon size="24">
              {{ mdiLock }}
            </v-icon>
          </v-avatar>
          <v-card-title class="pl-4">
            Security
          </v-card-title>
        </v-card-title>
        <v-card-text class="text-body-1 text-center">
          Manage your account security easily by adding or removing authorized keys and setting
          thresholds.
        </v-card-text>
        <v-spacer />
        <v-card-actions class="justify-center">
          <v-btn
            color="primary"
            rounded
            to="security"
          >
            Security settings
          </v-btn>
        </v-card-actions>
      </div>
      <div class="feature d-flex flex-column align-center fill-height rounded-xl">
        <v-card-title class="align-center">
          <v-avatar
            color="primary"
            size="52"
          >
            <v-icon size="24">
              {{ mdiLaptop }}
            </v-icon>
          </v-avatar>
          <v-card-title class="pl-4">
            Desktop & Mobile
          </v-card-title>
        </v-card-title>
        <v-card-text class="text-body-1 text-center">
          Install the application directly on your desktop or mobile !
        </v-card-text>
        <v-spacer />
        <v-card-actions class="justify-center">
          <v-btn
            color="primary"
            rounded
            to="smartcontract"
          >
            Install Now
          </v-btn>
        </v-card-actions>
      </div>
    </div>
  </div>
</template>

<script>

import {
  mdiFileDocumentEdit,
  mdiGavel,
  mdiHeartPulse, mdiLaptop, mdiLock,
  mdiLockOpen, mdiNumericPositive1,
  mdiSafe,
  mdiSend,
  mdiWallet,
} from '@mdi/js';

/**
 * Features component display on the homepage
 */
export default {
  name: 'FeatureCard',
  data: () => ({
    mdiWallet,
    mdiSend,
    mdiSafe,
    mdiLockOpen,
    mdiGavel,
    mdiFileDocumentEdit,
    mdiHeartPulse,
    mdiLock,
    mdiLaptop,
    mdiNumericPositive1,
  }),
};
</script>

<style scoped>
  .feature {
      min-width: 280px;
      width: 18%;
      max-width: 18%;
      height: 240px;
      margin: 10px;
  }
</style>
