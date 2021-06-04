<template>
  <v-container fill-height class="px-0">
    <v-row justify="center">
      <v-col md="auto">
        <v-card
            style="background: #00012a" class="align-center rounded-xl">
          <v-card-title class="justify-center text-h2"><b style="color: red">C</b>asper<b style="color: red">H</b>olders
          </v-card-title>
          <v-card-subtitle class="text-center mt-2 text-subtitle-1">
            Welcome to CasperHolders.<br/>
            The first third party UI to interact with the Casper Blockchain.<br/><br/>
            <b>CasperHolders is not affiliated with CasperNetwork / CasperAssociation.<br/>
              This is a project from a community member.</b>
          </v-card-subtitle>
        </v-card>
      </v-col>
    </v-row>
    <v-row justify="center">
      <v-card
          style="background: #00012a; width: auto;" class="align-center rounded-xl">
        <v-card-title class="align-start" style="width: 100%">
          <v-sheet rounded class="mt-n9" color="success">
            <div class="pa-7">
              <v-icon>mdi-check-circle-outline</v-icon>
            </div>
          </v-sheet>
          <v-card-title class="pl-4">
            Actual features implemented (On both MainNet & TestNet):
          </v-card-title>
        </v-card-title>
        <v-card-text class="text-body-1 ml-9">
          <v-icon color="success">mdi-check-circle</v-icon>
          Stacking<br/>
          <v-icon color="success">mdi-check-circle</v-icon>
          Unstaking<br/>
          <v-icon color="success">mdi-check-circle</v-icon>
          Balance<br/>
          <v-icon color="success">mdi-check-circle</v-icon>
          Transfer
        </v-card-text>
        <v-card-title class="align-start mt-9" style="width: 100%">
          <v-sheet rounded class="mt-n9" color="tertiary">
            <div class="pa-7">
              <v-icon>mdi-numeric-positive-1</v-icon>
            </div>
          </v-sheet>
          <v-card-title class="pl-4">
            Next features :
          </v-card-title>
        </v-card-title>
        <v-card-text class="text-body-1 ml-9">
          <v-icon color="tertiary">mdi-timeline-plus</v-icon>
          Add bid<br/>
          <v-icon color="tertiary">mdi-timeline-plus</v-icon>
          Withdraw bid<br/>
          <v-icon color="tertiary">mdi-timeline-plus</v-icon>
          Keys generation<br/>
          <v-icon color="tertiary">mdi-timeline-plus</v-icon>
          Smart contract deploy
        </v-card-text>
        <v-card-title class="align-start mt-9" style="width: 100%">
          <v-sheet rounded class="mt-n9" color="quaternary">
            <div class="pa-7">
              <v-icon>mdi-thought-bubble-outline</v-icon>
            </div>
          </v-sheet>
          <v-card-title class="pl-4">
            Future features :
          </v-card-title>
        </v-card-title>
        <v-card-text class="text-body-1 ml-9">
          <v-icon color="quaternary">mdi-timeline-clock</v-icon>
          Interactive tutorial & UI Improvements - In the future<br/>
          <v-icon color="quaternary">mdi-timeline-clock</v-icon>
          Staking rewards Overview - In the future<br/><br/>
        </v-card-text>
      </v-card>
    </v-row>
    <v-row>
      <v-spacer/>
      <v-btn x-large color="secondary" class="rounded-pill" href="https://github.com/KillianH/casperholdersfront"
             target="_blank">
        <v-icon class="mr-3">mdi-github</v-icon>
        Technical information
      </v-btn>
      <v-spacer/>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: 'Home',

  data: () => ({})
}
</script>
