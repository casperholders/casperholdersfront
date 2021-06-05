<template>
  <v-container
    fluid
    fill-height
    class="flex-column justify-center px-0"
  >
    <v-card class="align-center rounded-xl secondary">
      <v-card-title class="justify-center text-h2"><b style="color: #ff473e">C</b>asper<b style="color: #ff473e">H</b>olders
      </v-card-title>
      <v-card-subtitle class="text-center mt-2 text-subtitle-1">
        Welcome to CasperHolders.<br />
        The first third party UI to interact with the Casper Blockchain.<br /><br />
        <b>CasperHolders is not affiliated with CasperNetwork / CasperAssociation.<br />
          This is a project from a community member.</b>
      </v-card-subtitle>
    </v-card>
    <v-card class="align-center rounded-xl my-5 secondary">
      <v-card-title class="align-center">
        <v-avatar
          color="primary"
          size="52"
        >
          <v-icon>mdi-check-circle-outline</v-icon>
        </v-avatar>
        <v-card-title class="pl-4">
          Actual features implemented (On both MainNet & TestNet):
        </v-card-title>
      </v-card-title>
      <v-card-text class="text-body-1 ml-9">
        <v-icon
          color="success"
          left
        >mdi-check-circle
        </v-icon>
        Stacking<br />
        <v-icon
          color="success"
          left
        >mdi-check-circle
        </v-icon>
        Unstaking<br />
        <v-icon
          color="success"
          left
        >mdi-check-circle
        </v-icon>
        Balance<br />
        <v-icon
          color="success"
          left
        >mdi-check-circle
        </v-icon>
        Transfer
      </v-card-text>
      <v-card-title class="align-center">
        <v-avatar
          color="primary"
          size="52"
        >
          <v-icon>mdi-numeric-positive-1</v-icon>
        </v-avatar>
        <v-card-title class="pl-4">
          Next features :
        </v-card-title>
      </v-card-title>
      <v-card-text class="text-body-1 ml-9">
        <v-icon
          color="tertiary"
          left
        >mdi-timeline-plus
        </v-icon>
        Add bid<br />
        <v-icon
          color="tertiary"
          left
        >mdi-timeline-plus
        </v-icon>
        Withdraw bid<br />
        <v-icon
          color="tertiary"
          left
        >mdi-timeline-plus
        </v-icon>
        Keys generation or Cross Platform Desktop Wallet<br />
        <v-icon
          color="tertiary"
          left
        >mdi-timeline-plus
        </v-icon>
        Smart contract deploy
      </v-card-text>
      <v-card-title class="align-center">
        <v-avatar
          color="primary"
          size="52"
        >
          <v-icon>mdi-thought-bubble-outline</v-icon>
        </v-avatar>
        <v-card-title class="pl-4">
          Future features :
        </v-card-title>
      </v-card-title>
      <v-card-text class="text-body-1 ml-9">
        <v-icon
          color="quaternary"
          left
        >mdi-timeline-clock
        </v-icon>
        Interactive tutorial & UI Improvements - In the future<br />
        <v-icon
          color="quaternary"
          left
        >mdi-timeline-clock
        </v-icon>
        Staking rewards Overview - In the future<br />
        <v-icon
          color="quaternary"
          left
        >mdi-timeline-clock
        </v-icon>
        Proper platform metrics
      </v-card-text>
      <v-card-actions class="justify-center">
        <v-btn
          large
          color="tertiary"
          class="rounded-pill mb-3"
          href="#"
        >
          <v-icon left large class="mr-3">mdi-github</v-icon>
          Technical information (Soon. See FAQ)
        </v-btn>
      </v-card-actions>
    </v-card>
    <v-container>
      <v-row justify="space-around">
        <v-col cols="12" md="4">
          <v-card
            class="rounded-xl mx-auto"
            color="secondary"
            max-width="400"
          >
            <v-card-title>
              <v-icon
                color="primary"
                class="mr-12"
                size="64"
              >
                mdi-heart-pulse
              </v-icon>
              Transfer Operations (WIP)
            </v-card-title>

            <v-sheet color="transparent">
              <v-sparkline
                :value="value1"
                :gradient="gradient"
                :smooth="radius || false"
                :padding="padding"
                :line-width="width"
                :stroke-linecap="lineCap"
                :gradient-direction="gradientDirection"
                :fill="fill"
                :type="type"
                :auto-line-width="autoLineWidth"
                auto-draw
              ></v-sparkline>
            </v-sheet>
          </v-card>
        </v-col>
        <v-col cols="12" md="4">
          <v-card
            class="rounded-xl mx-auto"
            color="secondary"
            max-width="400"
          >
            <v-card-title>
              <v-icon
                color="primary"
                class="mr-12"
                size="64"
              >
                mdi-heart-pulse
              </v-icon>
              Stacking Operations (WIP)
            </v-card-title>

            <v-sheet color="transparent">
              <v-sparkline
                :value="value2"
                :gradient="gradient"
                :smooth="radius || false"
                :padding="padding"
                :line-width="width"
                :stroke-linecap="lineCap"
                :gradient-direction="gradientDirection"
                :fill="fill"
                :type="type"
                :auto-line-width="autoLineWidth"
                auto-draw
              ></v-sparkline>
            </v-sheet>
          </v-card>
        </v-col>
        <v-col cols="12" md="4">
          <v-card
            class="rounded-xl mx-auto"
            color="secondary"
            max-width="400"
          >
            <v-card-title>
              <v-icon
                color="primary"
                class="mr-12"
                size="64"
              >
                mdi-heart-pulse
              </v-icon>
              Unstack Operations (WIP)
            </v-card-title>

            <v-sheet color="transparent">
              <v-sparkline
                :value="value3"
                :gradient="gradient"
                :smooth="radius || false"
                :padding="padding"
                :line-width="width"
                :stroke-linecap="lineCap"
                :gradient-direction="gradientDirection"
                :fill="fill"
                :type="type"
                :auto-line-width="autoLineWidth"
                auto-draw
              ></v-sparkline>
            </v-sheet>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-container>
</template>

<script>
export default {
    name: 'Home',

    data() {
        return {
            width: 2,
            radius: 10,
            padding: 8,
            lineCap: 'round',
            gradient: ['#af023f', '#00126b'],
            gradientDirection: 'top',
            fill: false,
            type: 'trend',
            autoLineWidth: false,
            value1: this.value(),
            value2: this.value(),
            value3: this.value(),
        }
    },
    methods: {
        value() {
            return Array.from({length: 40}, () => Math.floor(Math.random() * 40));
        }
    }
}
</script>
