<template>
  <div>
    <v-card
      class="align-center rounded-xl secondary"
      width="100%"
    >
      <v-card-title class="align-center">
        <v-avatar
          color="primary"
          size="52"
        >
          <v-icon>mdi-mail</v-icon>
        </v-avatar>
        <v-card-title class="pl-4">
          Contact
        </v-card-title>
      </v-card-title>
      <v-card-text class="text-body-1">
        <h2>Discord</h2>
        <p>
          Join the official Discord community server from Casper Network ! Ping me @killian :)
        </p>
        <h2>Telegram</h2>
        <p>
          Join the official Casper Telegram Channel from Casper Network ! Ping me @KillianH :)
        </p>
        <p>
          Or join the official DEVxDAO Telegram Channel ! Ping me @KillianH :)
        </p>
      </v-card-text>

      <v-card-actions class="justify-md-space-around flex-md-row flex-column">
        <v-btn
          color="primary"
          href="https://discord.com/invite/Q38s3Vh"
          rel="noopener"
          rounded
          target="_blank"
          class="mb-3"
        >
          <v-icon
            dark
            left
          >
            mdi-discord
          </v-icon>
          Join the discord
        </v-btn>
        <v-btn
          color="primary"
          href="https://t.me/casperofficialann"
          rel="noopener"
          rounded
          target="_blank"
          class="mb-3"
        >
          <v-icon
            dark
            left
          >
            mdi-send
          </v-icon>
          Join the Casper Telegram
        </v-btn>
        <v-btn
          color="primary"
          href="https://t.me/devxdao"
          rel="noopener"
          rounded
          target="_blank"
          class="mb-3"
        >
          <v-icon
            dark
            left
          >
            mdi-send
          </v-icon>
          Join the DEVxDAO Telegram
        </v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>

<script>

/**
 * Contact view
 */
export default {
  name: 'Contact',
};
</script>
