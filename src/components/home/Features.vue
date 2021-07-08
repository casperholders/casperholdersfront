<template>
  <v-row>
    <v-col
      cols="12"
      lg="3"
      md="6"
    >
      <v-card class="d-flex flex-column align-center fill-height rounded-xl secondary">
        <v-card-title class="align-center">
          <v-avatar
            color="primary"
            size="52"
          >
            <v-icon>mdi-wallet</v-icon>
          </v-avatar>
          <v-card-title class="pl-4">
            Balance
          </v-card-title>
        </v-card-title>
        <v-card-text class="text-body-1 text-center">
          See your current wallet balance, repartition of staked tokens and your staked rewards.
        </v-card-text>
        <v-spacer></v-spacer>
        <v-card-actions class="justify-center">
          <v-btn
            rounded
            color="primary"
            to="balance"
          >
            Check your balance
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-col>
    <v-col
      cols="12"
      lg="3"
      md="6"
    >
      <v-card class="d-flex flex-column align-center fill-height rounded-xl secondary">
        <v-card-title class="align-center">
          <v-avatar
            color="primary"
            size="52"
          >
            <v-icon>mdi-send</v-icon>
          </v-avatar>
          <v-card-title class="pl-4">
            Transfer
          </v-card-title>
        </v-card-title>
        <v-card-text class="text-body-1 text-center">
          Transfer funds to another account in just a few clicks and within seconds.
        </v-card-text>
        <v-spacer></v-spacer>
        <v-card-actions class="justify-center">
          <v-btn
            rounded
            color="primary"
            to="transfer"
          >
            Transfer funds
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-col>
    <v-col
      cols="12"
      lg="3"
      md="6"
    >
      <v-card class="d-flex flex-column align-center fill-height rounded-xl secondary">
        <v-card-title class="align-center">
          <v-avatar
            color="primary"
            size="52"
          >
            <v-icon>mdi-safe</v-icon>
          </v-avatar>
          <v-card-title class="pl-4">
            Staking
          </v-card-title>
        </v-card-title>
        <v-card-text class="text-body-1 text-center">
          Stake your tokens to secure the network.<br />Earn up to 20% APY.
        </v-card-text>
        <v-spacer></v-spacer>
        <v-card-actions class="justify-center">
          <v-btn
            rounded
            color="primary"
            to="stake"
          >
            Stake now
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-col>
    <v-col
      cols="12"
      lg="3"
      md="6"
    >
      <v-card class="d-flex flex-column align-center fill-height rounded-xl secondary">
        <v-card-title class="align-center">
          <v-avatar
            color="primary"
            size="52"
          >
            <v-icon>mdi-lock-open</v-icon>
          </v-avatar>
          <v-card-title class="pl-4">
            Unstaking
          </v-card-title>
        </v-card-title>
        <v-card-text class="text-body-1 text-center">
          Unstake your tokens easily to restake to another validator or enjoy freely your tokens in your wallet.
        </v-card-text>
        <v-spacer></v-spacer>
        <v-card-actions class="justify-center">
          <v-btn
            rounded
            color="primary"
            to="unstake"
          >
            Unstake now
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-col>
    <v-col
      cols="12"
      lg="3"
      md="6"
    >
      <v-card class="d-flex flex-column align-center fill-height rounded-xl secondary">
        <v-card-title class="align-center">
          <v-avatar
            color="primary"
            size="52"
          >
            <v-icon>mdi-gavel</v-icon>
          </v-avatar>
          <v-card-title class="pl-4">
            Add bid
          </v-card-title>
        </v-card-title>
        <v-card-text class="text-body-1 text-center">
          Add bid to your current Validator node to stay in the Casper Validators list.
        </v-card-text>
        <v-spacer></v-spacer>
        <v-card-actions class="justify-center">
          <v-btn
            rounded
            color="primary"
            to="unstake"
          >
            Add bid
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-col>
    <v-col
      cols="12"
      lg="3"
      md="6"
    >
      <v-card class="d-flex flex-column align-center fill-height rounded-xl secondary">
        <v-card-title class="align-center">
          <v-avatar
            color="primary"
            size="52"
          >
            <v-icon>mdi-lock-open</v-icon>
          </v-avatar>
          <v-card-title class="pl-4">
            Withdraw bid
          </v-card-title>
        </v-card-title>
        <v-card-text class="text-body-1 text-center">
          Withdraw your tokens from your Validator Node easily and enjoy freely your tokens in your wallet.
        </v-card-text>
        <v-spacer></v-spacer>
        <v-card-actions class="justify-center">
          <v-btn
            rounded
            color="primary"
            to="unstake"
          >
            Withdraw now
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-col>
    <v-col
      cols="12"
      lg="3"
      md="6"
    >
      <v-card class="d-flex flex-column align-center fill-height rounded-xl secondary">
        <v-card-title class="align-center">
          <v-avatar
            color="primary"
            size="52"
          >
            <v-icon>mdi-file-document-edit</v-icon>
          </v-avatar>
          <v-card-title class="pl-4">
            Smart contracts
          </v-card-title>
        </v-card-title>
        <v-card-text class="text-body-1 text-center">
          Deploy one or multiple smart contract on the Casper Blockchain !
        </v-card-text>
        <v-spacer></v-spacer>
        <v-card-actions class="justify-center">
          <v-btn
            rounded
            color="primary"
            to="smartcontract"
          >
            Deploy Now
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-col>
    <v-col
      cols="12"
      lg="3"
      md="6"
    >
      <v-card class="d-flex flex-column align-center fill-height rounded-xl secondary">
        <v-card-title class="align-center">
          <v-avatar
            color="primary"
            size="52"
          >
            <v-icon>mdi-heart-pulse</v-icon>
          </v-avatar>
          <v-card-title class="pl-4">
            Platform Metrics
          </v-card-title>
        </v-card-title>
        <v-card-text class="text-body-1 text-center">
          Enjoy full platform metrics hover all the different types of operations available on the website.
        </v-card-text>
        <v-spacer></v-spacer>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
export default {
    name: "Features"
}
</script>

<style scoped>

</style>