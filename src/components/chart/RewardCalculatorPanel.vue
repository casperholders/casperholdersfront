<template>
  <div class="reward-calculator-panel">
    <v-expansion-panels
      accordion
      flat
      tile
    >
      <v-expansion-panel class="secondary">
        <v-expansion-panel-header>
          <div class="d-flex align-center text-overline">
            <v-icon
              left
            >
              mdi-calculator
            </v-icon>
            Rewards calculator
          </div>
        </v-expansion-panel-header>
        <v-expansion-panel-content>
          <reward-calculator
            :validator="validator"
            :amount="amount"
          />
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
  </div>
</template>

<script>
import RewardCalculator from '@/components/chart/RewardCalculator';

/**
 * RewardCalculatorPanel wrapper for the RewardCalculator component
 */
export default {
  name: 'RewardCalculatorPanel',
  components: { RewardCalculator },
  props: {
    validator: {
      type: Object,
      default: undefined,
    },
    amount: {
      type: String,
      default: undefined,
    },
  },
};
</script>
