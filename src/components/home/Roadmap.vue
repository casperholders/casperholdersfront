<template>
  <v-row class="mt-10">
    <v-col
      cols="12"
      md="6"
      offset-md="3"
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
          >
            mdi-lock
          </v-icon>
          High security accounts settings<br>
          <v-icon
            color="tertiary"
            left
          >
            mdi-laptop
          </v-icon>
          Desktop Wallet & Mobile Wallet
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
/**
 * Roadmap component displayed on the homepage
 */
export default {
  name: 'Roadmap',
};
</script>
