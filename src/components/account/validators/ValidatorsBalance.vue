<template>
  <div>
    <card-section-title
      :icon="mdiSafe"
      title="Staking detail"
    />
    <card-horizontal-list class="px-6 pb-4">
      <template v-if="loading">
        <balance-amount-card
          v-for="index in 3"
          :key="`skeletons-${index}`"
          class="validator-cards"
          loading
        />
      </template>
      <balance-amount-card
        v-for="(validator, index) in validators"
        :key="`validators-${index}`"
        class="validator-cards"
        :amount="validator.amount"
        :logo="validator.logo"
        :title="validator.name"
        :cspr-live-path-url="`validator/${validator.publicKey}`"
      >
        <template #actions>
          <v-card-actions>
            <v-btn
              :to="`/stake/${validator.publicKey}`"
              class="flex-grow-1 flex-shrink-1"
              color="secondary"
              rounded
            >
              Stake
            </v-btn>
            <v-btn
              :to="`/unstake/${validator.publicKey}`"
              class="flex-grow-1 flex-shrink-1"
              color="secondary"
              rounded
            >
              Unstake
            </v-btn>
          </v-card-actions>
        </template>
      </balance-amount-card>
    </card-horizontal-list>
    <v-divider />
    <reward-calculator-panel
      :validator="mergedValidator"
      :amount="totalStaked.toString()"
    />
  </div>
</template>

<script>
import BalanceAmountCard from '@/components/account/BalanceAmountCard';
import CardHorizontalList from '@/components/account/CardHorizontalList';
import CardSectionTitle from '@/components/account/CardSectionTitle';
import RewardCalculatorPanel from '@/components/chart/RewardCalculatorPanel';
import balanceService from '@/helpers/balanceService';
import { API } from '@/helpers/env';
import truncate from '@/helpers/strings/truncate';
import { mdiSafe } from '@mdi/js';
import Big from 'big.js';
import { mapState } from 'vuex';

/**
 * Component to display validator balance per validators.
 */
export default {
  name: 'ValidatorsBalance',
  components: { RewardCalculatorPanel, CardHorizontalList, BalanceAmountCard, CardSectionTitle },
  data: () => ({
    mdiSafe,
    loading: false,
    /**
     * The currently tracked validators.
     */
    validators: [],
    /**
     * The merged validator for fees approximation.
     */
    mergedValidator: undefined,
    /**
     * The total of staked tokens.
     */
    totalStaked: Big(0),
  }),
  computed: {
    ...mapState(['signer']),
  },
  watch: {
    /**
     * Watch the state of the active key. In case of an update, re-fetch the data.
     */
    'signer.activeKey': {
      handler: 'onActiveKeyChange',
      immediate: true,
    },
  },
  methods: {
    /**
     * On active key init or change.
     */
    async onActiveKeyChange() {
      await this.fetchValidators();
    },
    /**
     * Fetch all validators where active key have stacked tokens.
     *
     * @returns {Promise<void>}
     */
    async fetchValidators() {
      this.setTotalState(true, Big(0));
      this.validators = [];
      this.mergedValidator = undefined;

      let totalStacked = Big(0);
      try {
        let validatorsData = [];

        try {
          validatorsData = await (await fetch(`${API}/validators/accountinfos`)).json();
        } catch {
          console.log('Unable to retrieve validators info.');
        }

        let totalValidatorsFees = 0;
        const validatorsFees = [];
        const validators = await balanceService.fetchAllStakeBalance();

        validators.forEach((validator) => {
          totalStacked = totalStacked.plus(Big(validator.stakedTokens));

          const validatorFromAPI = validatorsData.find((v) => v.publicKey === validator.validator);
          this.validators.push({
            logo: validatorFromAPI?.logo,
            name: truncate(validatorFromAPI?.name || validator.validator),
            publicKey: validatorFromAPI.publicKey,
            amount: validator.stakedTokens,
          });

          totalValidatorsFees += validator.delegation_rate;
          validatorsFees.push(validator.delegation_rate);
        });

        this.validators.sort((a, b) => Big(b.amount).cmp(Big(a.amount)));

        this.mergedValidator = {
          delegation_rate: (totalValidatorsFees / validatorsFees.length) > 0
            ? validatorsFees.length
            : 1,
        };
      } catch (error) {
        console.log(error);
      } finally {
        this.setTotalState(false, totalStacked);
      }
    },
    setTotalState(loading, totalStaked) {
      this.loading = loading;
      this.totalStaked = totalStaked;

      this.$emit('total-state-change', { loading, totalStaked });
    },
  },
};
</script>
