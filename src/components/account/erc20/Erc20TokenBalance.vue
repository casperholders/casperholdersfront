<template>
  <balance-amount-card
    class="validator-cards"
    :amount="amount"
    :token="token"
    :logo="token.logo"
    :title="token.name"
    :cspr-live-path-url="`contract/${token.id}`"
  >
    <template #actions>
      <v-card-actions>
        <v-btn
          :to="`/transfer/${token.id}`"
          class="flex-grow-1 flex-shrink-1"
          color="secondary"
          rounded
        >
          Transfer
        </v-btn>
        <v-btn
          title="Untrack"
          class="flex-grow-1 flex-shrink-1"
          color="error"
          rounded
          @click="$emit('remove')"
        >
          <v-icon>
            {{ mdiDeleteOutline }}
          </v-icon>
        </v-btn>
      </v-card-actions>
      <v-card-actions>
        <v-dialog
          v-model="allowancesDialog"
          width="600"
        >
          <template #activator="{ attrs, on }">
            <v-btn
              :data-cy="`erc20-${token.id}-allowance-open`"
              color="secondary"
              rounded
              block
              v-bind="attrs"
              v-on="on"
            >
              <v-icon left>
                {{ mdiLockOpenCheck }}
              </v-icon>
              Allowance
            </v-btn>
          </template>
          <v-card>
            <v-card-title>
              Manage allowances
            </v-card-title>
            <v-card-subtitle
              v-if="!canRevokeAllowance || deployError || deploySuccess"
              class="pt-4"
            >
              <v-alert
                v-if="!canRevokeAllowance"
                type="error"
                class="mb-0"
                dense
              >
                Not enough funds to revoke allowance.
                <br>
                You need at least
                <token-amount :amount="computeFormattedTokenValue(allowancesFee, nativeToken)" />
              </v-alert>
              <v-alert
                v-if="deployError"
                type="error"
                class="mb-0"
                dense
              >
                {{ deployError.message }}
              </v-alert>
              <v-alert
                v-if="deploySuccess"
                type="success"
                class="mb-0"
                dense
              >
                {{ deploySuccess.message }}
              </v-alert>
            </v-card-subtitle>
            <v-card-text class="pa-0">
              <template v-if="allowances && allowances.length">
                <v-list>
                  <v-divider role="presentation" />
                  <template v-for="allowance in allowances">
                    <v-list-item :key="allowance.spender">
                      <v-list-item-content>
                        <v-list-item-title>
                          <a
                            :href="`${CSPR_LIVE_URL}contract/${allowance.spender}`"
                            target="_blank"
                            rel="noopener"
                          >
                            {{ truncate(allowance.spender) }}
                            <v-icon x-small>{{ mdiOpenInNew }}</v-icon>
                          </a>
                        </v-list-item-title>
                        <v-tooltip bottom>
                          <template #activator="{ attrs, on }">
                            <v-list-item-subtitle
                              v-bind="attrs"
                              v-on="on"
                            >
                              <token-amount
                                :data-cy="`erc20-${token.id}-${allowance.spender}-allowance`"
                                :amount="computeFormattedTokenValue(
                                  convertErc20MotesToAmount(token, allowance.amount),
                                  token
                                )"
                                class="white--text amount"
                              />
                            </v-list-item-subtitle>
                          </template>
                          <span>
                            <token-amount
                              :amount="computeFormattedTokenValue(
                                convertErc20MotesToAmount(token, allowance.amount),
                                token
                              )"
                              class="white--text amount"
                            />
                          </span>
                        </v-tooltip>
                      </v-list-item-content>
                      <v-list-item-action>
                        <v-btn
                          :data-cy="`erc20-${token.id}-${allowance.spender}-allowance-revoke`"
                          :disabled="!canRevokeAllowance"
                          :loading="deployLoading"
                          color="quaternary"
                          rounded
                          @click="onRevokeAllowance(allowance)"
                        >
                          <v-icon left>
                            {{ mdiLockRemove }}
                          </v-icon>
                          Revoke
                        </v-btn>
                      </v-list-item-action>
                      <v-list-item-action>
                        <v-btn
                          :data-cy="`erc20-${token.id}-${allowance.spender}-allowance-max`"
                          :disabled="!canRevokeAllowance"
                          :loading="deployLoading"
                          color="primary"
                          rounded
                          @click="onMaximizeAllowance(allowance)"
                        >
                          <v-icon left>
                            {{ mdiLockPlus }}
                          </v-icon>
                          Set max
                        </v-btn>
                      </v-list-item-action>
                    </v-list-item>
                    <v-divider
                      :key="`${allowance.spender}-divider`"
                      role="presentation"
                    />
                  </template>
                </v-list>
                <v-pagination
                  :value="allowancesPage"
                  :length="allowancesTotalPages"
                  :total-visible="3"
                  class="mb-2"
                  @input="onAllowancesPage"
                />
                <v-divider role="presentation" />
              </template>
              <v-card-text v-else-if="allowances">
                No allowance on this contract for now.
              </v-card-text>
              <v-card-text
                v-else
                class="text-center"
              >
                <v-progress-circular
                  color="white"
                  width="3"
                  size="16"
                  indeterminate
                />
              </v-card-text>
            </v-card-text>
            <v-card-actions>
              <v-btn
                :data-cy="`erc20-${token.id}-allowance-close`"
                rounded
                text
                @click="onCloseAllowances"
              >
                Close
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-card-actions>
    </template>
  </balance-amount-card>
</template>

<script>
import BalanceAmountCard from '@/components/account/BalanceAmountCard.vue';
import TokenAmount from '@/components/account/TokenAmount.vue';
import balanceService from '@/helpers/balanceService';
import { CSPR_LIVE_URL, DATA_API } from '@/helpers/env';
import buildCLValue from '@/helpers/genericCLValueBuilder';
import genericSendDeploy from '@/helpers/genericSendDeploy';
import parseContentRange from '@/helpers/parseContentRange';
import truncate from '@/helpers/strings/truncate';
import computeFormattedTokenValue from '@/services/tokens/computeFormattedTokenValue';
import convertErc20MotesToAmount from '@/services/tokens/convertErc20MotesToAmount';
import findTokenGroup from '@/services/tokens/findTokenGroup';
import nativeToken from '@/services/tokens/nativeToken';
import {
  mdiDeleteOutline,
  mdiLockOpenCheck,
  mdiLockPlus,
  mdiLockRemove,
  mdiOpenInNew,
} from '@mdi/js';
import Big from 'big.js';
import { mapGetters, mapState } from 'vuex';

/**
 * Component to display ERC20 balance for a token.
 */
export default {
  name: 'Erc20TokenBalance',
  components: { BalanceAmountCard, TokenAmount },
  props: {
    /**
     * The current account native token balance.
     */
    balance: {
      required: true,
      type: String,
    },
    /**
     * The tracked token.
     */
    token: {
      required: true,
      type: Object,
    },
    /**
     * The balance for this token.
     */
    amount: {
      type: String,
      default: undefined,
    },
  },
  data: () => ({
    mdiDeleteOutline,
    mdiLockPlus,
    mdiLockRemove,
    mdiOpenInNew,
    mdiLockOpenCheck,
    CSPR_LIVE_URL,
    nativeToken,
    truncate,
    computeFormattedTokenValue,
    allowancesDialog: false,
    allowancesLoading: false,
    allowancesPerPage: 10,
    allowancesTotal: 0,
    allowancesPage: 1,
    allowances: undefined,
    deployLoading: false,
    deployError: null,
    deploySuccess: null,
  }),
  computed: {
    ...mapState([
      'signer',
      'internet',
    ]),
    ...mapGetters([
      'signerObject',
      'signerOptionsFactory',
      'activeKey',
    ]),
    /**
     * Check if current balance has enough funds to send an allowance deploy.
     *
     * @returns {boolean}
     */
    canRevokeAllowance() {
      return Big(this.balance).gt(this.allowancesFee);
    },
    /**
     * Get the total number of allowances pages.
     *
     * @returns {number}
     */
    allowancesTotalPages() {
      return Math.ceil(this.allowancesTotal / this.allowancesPerPage);
    },
    tokenGroup() {
      return findTokenGroup(this.token.groupId);
    },
    allowancesFee() {
      return this.tokenGroup.features.approve.approveFee;
    },
  },
  watch: {
    allowancesDialog: 'onAllowancesDialog',
  },
  methods: {
    convertErc20MotesToAmount,
    /**
     * Fetch allowances for current page.
     *
     * @returns {Promise<void>}
     */
    async fetchAllowances() {
      this.allowancesLoading = true;

      const query = new URLSearchParams();
      const offset = (this.allowancesPage - 1) * this.allowancesPerPage;

      query.set('offset', String(offset));
      query.set('limit', String(this.allowancesPerPage));
      query.set('from', `eq.${this.activeKey}`);
      query.set('contract_hash', `eq.${this.token.id}`);

      const response = await fetch(`${DATA_API}/allowance?${query.toString()}`, {
        headers: new Headers({
          Prefer: 'count=exact',
          'Range-Unit': 'items',
        }),
      });

      this.allowancesTotal = parseContentRange(response.headers.get('Content-Range')).size;
      this.allowances = await Promise.all((await response.json()).map(async (a) => {
        const spender = a.spender.replace('hash-', '');
        const amount = await balanceService.fetchAllowanceOfErc20(this.token.id, spender);

        return { spender, amount };
      }));

      this.allowancesLoading = false;
    },
    /**
     * Fetch allowances on first dialog open.
     *
     * @param {boolean} dialog
     *
     * @returns {Promise<void>}
     */
    async onAllowancesDialog(dialog) {
      if (dialog && !this.allowancesLoading && this.allowances === undefined) {
        await this.fetchAllowances();
      }
    },
    /**
     * Change the allowances list current page.
     *
     * @param {number} page
     *
     * @returns {Promise<void>}
     */
    async onAllowancesPage(page) {
      this.allowancesPage = page;
      await this.fetchAllowances();
    },
    /**
     * Send an allowance revoke deploy.
     *
     * @param allowance
     *
     * @returns {Promise<void>}
     */
    async onRevokeAllowance(allowance) {
      await this.onDeployAllowance(allowance, '0');
    },
    /**
     * Send an allowance maximize (set to token balance) deploy.
     *
     * @param allowance
     *
     * @returns {Promise<void>}
     */
    async onMaximizeAllowance(allowance) {
      await this.onDeployAllowance(allowance, this.amount);
    },
    /**
     * Send an allowance deploy of given amount.
     *
     * @param {object} allowance
     * @param {string} amount
     *
     * @returns {Promise<void>}
     */
    async onDeployAllowance(allowance, amount) {
      this.deployError = null;
      this.deploySuccess = null;
      this.deployLoading = true;
      const deployParameter = this.tokenGroup.features.approve.makeDeployParameters(
        {
          activeKey: this.activeKey,
          amount,
          address: buildCLValue('key', allowance.spender),
          token: this.token,
        },
      );
      const options = this.signerOptionsFactory.getOptionsForOperations();
      const result = await genericSendDeploy(
        this.internet,
        this.activeKey,
        this.signer.activeKey,
        this.signerObject,
        deployParameter,
        options,
        this.allowancesFee,
        0,
        false,
        this.token,
      );
      if (result.error) {
        this.deployError = result.error;
      } else {
        await this.$store.dispatch(result.event, result.data);
        this.deploySuccess = {
          message: 'Deploy sent. Check the status in the operation results list at the end of this page.',
        };
      }

      this.deployLoading = false;
    },
    /**
     * Close the allowances' dialog.
     */
    onCloseAllowances() {
      this.allowancesDialog = false;
    },
  },
};
</script>
