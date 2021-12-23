<template>
  <v-card
    class="align-center rounded-xl secondary"
    width="100%"
  >
    <v-card-title class="align-center">
      <v-avatar
        color="primary"
        size="52"
      >
        <v-icon>mdi-cog</v-icon>
      </v-avatar>
      <v-card-title
        class="pl-4"
        style="word-break: break-word"
      >
        Settings
      </v-card-title>
    </v-card-title>
    <v-card-text>
      <v-card-text>
        <v-card
          outlined
          elevation="3"
          class="mb-4"
        >
          <v-card-title>
            <v-icon left>
              mdi-wifi
            </v-icon>
            Internet settings
          </v-card-title>
          <v-card-text
            id="internetSettings"
            class="d-flex align-center"
          >
            <v-radio-group v-model="sendDeployDisconnected">
              <template
                #label
              >
                <div class="text-body-1">
                  What behavior do you want to apply to deploys when you are offline ?
                </div>
              </template>
              <v-radio
                color="white"
                label="Disabled when disconnected"
                :value="false"
              />
              <v-radio
                color="white"
                label="Send directly when back online"
                :value="true"
              />
            </v-radio-group>
          </v-card-text>
        </v-card>
      </v-card-text>
    </v-card-text>
    <v-card-actions class="d-block text-center">
      Settings are saved automatically
    </v-card-actions>
  </v-card>
</template>

<script>
/**
 * Settings View
 */
export default {
  name: 'Settings',
  data: () => ({
    sendDeployDisconnected: false,
  }),
  watch: {
    sendDeployDisconnected(sendDeployDisconnected) {
      localStorage.sendDeployDisconnected = sendDeployDisconnected;
    },
  },
  mounted() {
    if (localStorage.sendDeployDisconnected) {
      this.sendDeployDisconnected = localStorage.sendDeployDisconnected === 'true';
    }
    localStorage.sendDeployDisconnected = this.sendDeployDisconnected;
  },
};
</script>
