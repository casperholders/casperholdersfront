<template>
  <v-container
    fill-height
    class="flex-column justify-center container__small"
  >
    <v-card class="align-center rounded-xl secondary" width="100%">
      <v-card-title class="align-center">
        <v-avatar
          color="primary"
          size="52"
        >
          <v-icon>mdi-mail</v-icon>
        </v-avatar>
        <v-card-title class="pl-4">Contact</v-card-title>
      </v-card-title>
      <v-card-text class="text-body-1">
        <h2>Discord</h2><br />
        <p>
          Join the official Discord community server from Casper Network ! Ping me @killian :)<br /><br />
          My ID : killian#7405<br />
        </p>
      </v-card-text>

      <v-card-actions class="justify-center">
        <v-btn
          color="primary"
          href="https://discord.com/invite/Q38s3Vh"
          target="_blank"
          rel="noopener"
          rounded
        >
          <v-icon
              left
              dark
          >
            mdi-discord
          </v-icon>
          Join the discord
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script>
export default {
    name: 'FAQ',
}
</script>