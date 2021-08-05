<template>
  <v-row class="mt-10">
    <v-col
      cols="12"
      md="6"
    >
      <v-card class="fill-height rounded-xl secondary">
        <v-card-title>
          <v-avatar
            class="mr-4"
            color="primary"
            size="52"
          >
            <v-icon>mdi-numeric-positive-1</v-icon>
          </v-avatar>
          Next features
        </v-card-title>
        <v-card-text class="text-body-1">

          <v-icon
            color="tertiary"
            left
          >mdi-account
          </v-icon>
          Operation history<br />
          <v-icon
            color="tertiary"
            left
          >mdi-currency-usd
          </v-icon>
          Staking rewards Overview
        </v-card-text>
      </v-card>
    </v-col>
    <v-col
      cols="12"
      md="6"
    >
      <v-card class="fill-height rounded-xl secondary">
        <v-card-title>
          <v-avatar
            class="mr-4"
            color="primary"
            size="52"
          >
            <v-icon>mdi-thought-bubble-outline</v-icon>
          </v-avatar>
          Future features
        </v-card-title>
        <v-card-text class="text-body-1">
          <v-icon
            color="quaternary"
            left
          >mdi-laptop
          </v-icon>
          Desktop Wallet & Mobile Wallet<br />
          <v-icon
            color="quaternary"
            left
          >mdi-lock
          </v-icon>
          High security accounts settings
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
export default {
    name: "Roadmap"
}
</script>

<style scoped>

</style>