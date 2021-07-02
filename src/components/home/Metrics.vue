<template>
  <v-row class="mt-10">
    <v-col
      cols="12"
      md="4"
    >
      <v-card
        class="rounded-xl mx-auto"
        color="secondary"
      >
        <v-card-title class="align-center">
          <v-avatar
            color="primary"
            size="52"
          >
            <v-icon>mdi-heart-pulse</v-icon>
          </v-avatar>
          <v-card-title class="pl-4">
            Transfer Operations
          </v-card-title>
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
    <v-col
      cols="12"
      md="4"
    >
      <v-card
        class="rounded-xl mx-auto"
        color="secondary"
      >
        <v-card-title class="align-center">
          <v-avatar
            color="primary"
            size="52"
          >
            <v-icon>mdi-heart-pulse</v-icon>
          </v-avatar>
          <v-card-title class="pl-4">
            Staking Operations
          </v-card-title>
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
    <v-col
      cols="12"
      md="4"
    >
      <v-card
        class="rounded-xl mx-auto"
        color="secondary"
      >
        <v-card-title class="align-center">
          <v-avatar
            color="primary"
            size="52"
          >
            <v-icon>mdi-heart-pulse</v-icon>
          </v-avatar>
          <v-card-title class="pl-4">
            Unstake Operations
          </v-card-title>
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
</template>

<script>
export default {
    name: "Metrics",
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

<style scoped>

</style>