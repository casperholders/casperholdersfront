<template>
  <v-card
    class="align-center rounded-xl secondary"
    width="100%"
  >
    <v-card-title class="align-center">
      <v-avatar
        class="mr-4"
        color="primary"
        size="52"
      >
        <v-icon>mdi-wallet</v-icon>
      </v-avatar>
      Balance
    </v-card-title>
    <v-divider />
    <card-section-title
      icon="mdi-chart-arc"
      title="Balance"
    />
    <v-card-text v-if="errored">
      <not-connected-alert id="balance-not-connected"/>
    </v-card-text>
    <template v-else>
      <div class="d-flex px-4 pb-2 flex-wrap">
        <balance-amount-card
          id="balance-total-staked"
          class="flex-grow-1 flex-shrink-1 balance-cards mx-2 mb-2"
          :loading="loading"
          :amount="totalStaked"
          :logo="casperLogo"
          title="Total staked"
        />
        <balance-amount-card
          id="balance-total-available"
          class="flex-grow-1 flex-shrink-1 balance-cards mx-2 mb-2"
          :loading="loading"
          :amount="totalAvailable"
          :logo="casperLogo"
          title="Total available"
        />
        <balance-amount-card
          id="balance-total"
          class="flex-grow-1 flex-shrink-1 balance-cards mx-2 mb-2"
          :loading="loading"
          :amount="total"
          :logo="casperLogo"
          title="Total"
        />
      </div>
      <v-divider />
      <card-section-title
        icon="mdi-safe"
        title="Staking detail"
      />
      <card-horizontal-list
        v-if="validators.length > 0"
        class="px-6 pb-4"
      >
        <balance-amount-card
          v-for="(validator, index) in validators"
          :key="`validators-${index}`"
          class="validator-cards"
          :amount="validator.amount"
          :logo="validator.logo"
          :title="validator.name"
          :cspr-live-path-url="'validator/'+validator.publicKey"
        >
          <template #actions>
            <v-card-actions>
              <v-btn
                class="rounded-xl flex-grow-1 flex-shrink-1 "
                color="secondary"
                :to="'/stake/'+validator.publicKey"
              >
                Stake
              </v-btn>
              <v-btn
                class="rounded-xl flex-grow-1 flex-shrink-1 "
                color="secondary"
                :to="'/unstake/'+validator.publicKey"
              >
                Unstake
              </v-btn>
            </v-card-actions>
          </template>
        </balance-amount-card>
      </card-horizontal-list>
      <v-divider />
      <card-section-title
        icon="mdi-chart-arc"
        title="ERC 20"
        class="d-flex"
      >
        <template #action>
          <v-spacer />
          <v-btn icon>
            <v-icon>
              mdi-plus
            </v-icon>
          </v-btn>
        </template>
      </card-section-title>
      <card-horizontal-list
        v-if="validators.length > 0"
        class="px-6 pb-4"
      >
        <v-card
          v-if="getERC20.length === 0"
          style="height: 147px"
          class="validator-cards text-center"
          color="primary"
        >
          <div class="fill-height pa-2 d-flex flex-column">
            <v-spacer />
            <div>
              <v-btn
                color="secondary"
                class="rounded-xl"
              >
                <v-icon left>
                  mdi-plus
                </v-icon>
                Add ERC20 token
              </v-btn>
            </div>
            <v-spacer />
          </div>
        </v-card>
        <!-- TODO ERC20 Balance from ERC20 Hashes in the localstorage -->
      </card-horizontal-list>
    </template>
    <v-divider />
    <reward-calculator-panel
      :validator="mergedValidator"
      :amount="totalStaked.toString()"
    />
    <v-divider />
    <card-section-title
      icon="mdi-swap-horizontal"
      title="Operations"
    />
    <operations-table />
    <v-divider />
    <v-card-actions class="pa-5">
      <v-row>
        <v-col
          cols="12"
          md="4"
        >
          <card-quick-link
            to="/transfer"
            icon="mdi-send"
            title="Transfer"
            subtitle="Transfer funds"
          />
        </v-col>
        <v-col
          cols="12"
          md="4"
        >
          <card-quick-link
            to="/stake"
            icon="mdi-safe"
            title="Stake"
            subtitle="Stake your tokens"
          />
        </v-col>
        <v-col
          cols="12"
          md="4"
        >
          <card-quick-link
            to="/unstake"
            icon="mdi-wallet"
            title="Unstake"
            subtitle="Unstake your tokens"
          />
        </v-col>
      </v-row>
    </v-card-actions>
  </v-card>
</template>

<script>
import BalanceAmountCard from '@/components/account/BalanceAmountCard';
import CardHorizontalList from '@/components/account/CardHorizontalList';
import CardQuickLink from '@/components/account/CardQuickLink';
import CardSectionTitle from '@/components/account/CardSectionTitle';
import NotConnectedAlert from '@/components/account/NotConnectedAlert';
import RewardCalculatorPanel from '@/components/chart/RewardCalculatorPanel';
import OperationsTable from '@/components/operations/OperationsTable';
import balanceService from '@/helpers/balanceService';
import { API } from '@/helpers/env';
import nativeToken from '@/services/tokens/nativeToken';
import Big from 'big.js';
import { mapState } from 'vuex';

/**
 * Balance view
 * Display the current user balance and their staked tokens on the Casper Node
 * configured in the env file
 */
export default {
  name: 'BalanceView',
  components: {
    NotConnectedAlert,
    BalanceAmountCard,
    CardHorizontalList,
    CardSectionTitle,
    CardQuickLink,
    OperationsTable,
    RewardCalculatorPanel,
  },
  data() {
    return {
      casperLogo: nativeToken.logo,
      loading: true,
      errored: false,
      totalAvailable: Big(0),
      totalStaked: Big(0),
      mergedValidator: undefined,
      validators: [],
    };
  },
  computed: {
    ...mapState(['signer']),
    total() {
      return this.totalStaked.plus(this.totalAvailable);
    },
    getERC20() {
      try {
        const tokenMap = new Map(JSON.parse(localStorage.casperHoldersERC20 ? localStorage.casperHoldersERC20 : '[]'));
        if (tokenMap.get(this.signer.activeKey)) {
          console.log(tokenMap.get(this.signer.activeKey));
          return tokenMap.get(this.signer.activeKey);
        }
      } catch (e) {
        // Broken map, reset to a normal state
        console.log(e);
        console.log('BROKEN MAP');
        localStorage.casperHoldersERC20 = JSON.stringify(Array.from(new Map().entries()));
      }
      return [];
    },
  },
  watch: {
    /**
     * Watch the state of the active key. In case of an update, re-fetch the balance data
     */
    'signer.activeKey': {
      handler: 'onActiveKeyChange',
      immediate: true,
    },
  },
  async mounted() {
    console.log(this.getERC20);
  },
  methods: {
    setERC20(erc20TokenHash) {
      try {
        const tokenMap = new Map(JSON.parse(localStorage.casperHoldersERC20 ? localStorage.casperHoldersERC20 : '[]'));
        let currentERC = new Set();
        if (tokenMap.get(this.signer.activeKey)) {
          currentERC = new Set(tokenMap.get(this.signer.activeKey));
        }
        currentERC.add(erc20TokenHash);
        tokenMap.set(this.signer.activeKey, Array.from(currentERC));
        localStorage.casperHoldersERC20 = JSON.stringify(Array.from(tokenMap.entries()));
      } catch (e) {
        // Broken map, reset to a normal state
        console.log(e);
        console.log('BROKEN MAP');
        const newErcState = new Map();
        newErcState.set(this.signer.activeKey, Array.from(new Set().add(erc20TokenHash)));
        localStorage.casperHoldersERC20 = JSON.stringify(Array.from(newErcState.entries()));
      }
    },
    removeERC20(erc20TokenHash) {
      try {
        const tokenMap = new Map(JSON.parse(localStorage.casperHoldersERC20 ? localStorage.casperHoldersERC20 : '[]'));
        let currentERC = new Set();
        if (tokenMap.get(this.signer.activeKey)) {
          currentERC = new Set(tokenMap.get(this.signer.activeKey));
        }
        currentERC.delete(erc20TokenHash);
        tokenMap.set(this.signer.activeKey, Array.from(currentERC));
        localStorage.casperHoldersERC20 = JSON.stringify(Array.from(tokenMap.entries()));
      } catch (e) {
        // Broken map, reset to a normal state
        console.log(e);
        console.log('BROKEN MAP');
        localStorage.casperHoldersERC20 = JSON.stringify(Array.from(new Map().entries()));
      }
    },
    onActiveKeyChange() {
      this.fetchBalances();
    },
    async fetchBalances() {
      this.loading = true;
      this.errored = false;

      this.totalStaked = Big(0);
      this.totalAvailable = Big(0);
      this.mergedValidator = undefined;
      this.validators = [];

      try {
        this.totalAvailable = await balanceService.fetchBalance();
      } catch {
        this.errored = true;
        this.loading = false;

        return;
      }

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
          this.totalStaked = this.totalStaked.plus(Big(validator.stakedTokens));

          const validatorFromAPI = validatorsData.find((v) => v.publicKey === validator.validator);
          this.validators.push({
            logo: validatorFromAPI?.logo,
            name: this.truncate(validatorFromAPI?.name || validator.validator),
            publicKey: validatorFromAPI.publicKey,
            amount: validator.stakedTokens,
          });

          totalValidatorsFees += validator.delegation_rate;
          validatorsFees.push(validator.delegation_rate);
        });
        this.validators.sort((a, b) => Big(b.amount) - Big(a.amount));

        this.mergedValidator = {
          delegation_rate: (totalValidatorsFees / validatorsFees.length) > 0
            ? validatorsFees.length
            : 1,
        };
      } catch (error) {
        console.log(error);
      } finally {
        this.loading = false;
      }
    },
    truncate(fullStr) {
      const strLen = 18;
      const separator = '...';

      if (fullStr.length <= strLen) return fullStr;

      const sepLen = separator.length;
      const charsToShow = strLen - sepLen;
      const frontChars = Math.ceil(charsToShow / 2);
      const backChars = Math.floor(charsToShow / 2);

      return fullStr.substr(0, frontChars) + separator + fullStr.substr(fullStr.length - backChars);
    },
  },
};
</script>

<style
  lang="scss"
  scoped
>
  .validator-cards {
    min-width: 250px;
    width: 250px;
  }

  .balance-cards {
    min-width: 220px;
  }
</style>
