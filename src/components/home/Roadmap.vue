<template>
  <v-row class="mt-10">
    <v-col
      cols="12"
      md="6"
    >
      <v-card class="fill-height rounded-xl secondary">
        <v-card-title>
          <v-avatar
            color="primary"
            size="52"
            class="mr-4"
          >
            <v-icon>mdi-numeric-positive-1</v-icon>
          </v-avatar>
          Next features
        </v-card-title>
        <v-card-text class="text-body-1">
          <v-icon
            color="tertiary"
            left
          >mdi-gavel
          </v-icon>
          Add bid<br />
          <v-icon
            color="tertiary"
            left
          >mdi-connection
          </v-icon>
          Withdraw bid<br />
          <v-icon
            color="tertiary"
            left
          >mdi-laptop
          </v-icon>
          Desktop Wallet<br />
          <v-icon
            color="tertiary"
            left
          >mdi-file-document-edit
          </v-icon>
          Smart contract deploy
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
            color="primary"
            size="52"
            class="mr-4"
          >
            <v-icon>mdi-thought-bubble-outline</v-icon>
          </v-avatar>
            Future features
        </v-card-title>
        <v-card-text class="text-body-1">
          <v-icon
            color="quaternary"
            left
          >mdi-account
          </v-icon>
          Interactive tutorial & UI Improvements<br />
          <v-icon
            color="quaternary"
            left
          >mdi-currency-usd
          </v-icon>
          Staking rewards Overview<br />
          <v-icon
            color="quaternary"
            left
          >mdi-chart-line
          </v-icon>
          Proper platform metrics<br />
          <v-icon
            color="quaternary"
            left
          >mdi-brain
          </v-icon>
          Smart staking
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