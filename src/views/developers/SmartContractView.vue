<template>
  <v-card>
    <v-card-title>
      Smart Contract Operations
    </v-card-title>
    <v-tabs
      v-model="tab"
      grow
      background-color="transparent"
      color="white"
    >
      <v-tab>
        New Smart Contract
      </v-tab>
      <v-tab data-cy="manageSmartContract">
        Manage smart contract
      </v-tab>
    </v-tabs>

    <v-tabs-items v-model="tab">
      <v-tab-item>
        <card-horizontal-list>
          <contract-card
            v-for="(c, i) in contracts"
            :key="i"
            :title="c.title"
            :description="c.description"
            :github-url="c.githubUrl"
            :icon="c.icon"
            class="contract-card"
          >
            <template #actions>
              <v-card-actions
                class="mt-auto justify-space-between"
              >
                <a
                  :href="c.downloadUrl"
                  download
                  :data-cy="`download-${c.title}`"
                >
                  <v-btn
                    color="secondary"
                    rounded
                  >
                    Download
                  </v-btn>
                </a>
                <v-btn
                  :data-cy="`setArgs-${c.title}`"
                  color="secondary"
                  rounded
                  @click="onSetArguments(c.args)"
                >
                  Set arguments
                </v-btn>
              </v-card-actions>
            </template>
          </contract-card>
        </card-horizontal-list>
        <operation
          :amount="0"
          :fee="amount"
          :loading-sign-and-deploy="loadingSignAndDeploy"
          :loading-simulate="loadingSimulate"
          :simulate-deploy="simulateFees"
          :remaining-balance="remainingBalance"
          :send-deploy="sendDeploy"
          :type="type"
          :balance="balance"
          :icon="mdiFileDocumentEdit"
          submit-title="Deploy"
          title="Send smart contract"
        >
          <v-file-input
            id="smartContractFile"
            v-model="contract"
            :show-size="1000"
            accept=".wasm"
            color="white"
            counter
            label="Smart Contracts"
            outlined
            placeholder="Select your contracts"
            :prepend-icon="mdiPaperclip"
          >
            <template #selection="{ text }">
              {{ text }}
            </template>
          </v-file-input>
          <v-expansion-panels>
            <v-expansion-panel
              v-for="(item,i) in args"
              :key="item.lid"
              :data-cy="`arg-panel-${item.name || i + 1}`"
              class="mt-2"
              style="border: thin solid rgba(255, 255, 255, 0.12)"
            >
              <v-expansion-panel-header>Argument {{ item.name || i + 1 }}</v-expansion-panel-header>
              <v-expansion-panel-content>
                <Argument
                  :arg-name="item.name"
                  :cl-type="item.type"
                  :data-cy="`arg-panel-content-${item.name || i + 1}`"
                  @value="item.value = $event"
                  @name="item.name = $event"
                />
                <v-btn
                  :data-cy="`arg-delete-${item.name || i + 1}`"
                  color="error"
                  rounded
                  @click="args.splice(i, 1);"
                >
                  Delete argument
                </v-btn>
              </v-expansion-panel-content>
            </v-expansion-panel>
          </v-expansion-panels>
          <div class="text-center">
            <v-btn
              color="primary"
              class="mt-5"
              rounded
              @click="onAddArgument"
            >
              Add argument
            </v-btn>
          </div>
          <Amount
            :balance="balance"
            :fee="Number(0)"
            :min="minPayment"
            :value="amount"
            class="mb-4"
            @input="amount = $event"
          />
          <operation-summary
            :balance-loading="loadingBalance"
            :balance="balance"
            :fee="Number(0)"
            :amount="`-${amount}`"
            class="mx-n1 mb-4"
            :append-values="[
              { name: 'Simulated Result', value: simulatedResult },
            ]"
          />
          <v-row
            class="white-top-border ma-n4"
          >
            <v-col>Estimated deploy fee</v-col>
            <v-col class="text-right cspr">
              {{ specExecFee }}
              <v-btn
                v-if="specExecFee !== 'N/A'"
                small
                class="primary default-font font-weight-bold"
                @click="amount = specExecFee"
              >
                <v-icon left>
                  {{ mdiDownloadOutline }}
                </v-icon>
                Apply
              </v-btn>
            </v-col>
          </v-row>
          <v-alert
            v-if="errorBalance"
            data-cy="errorBalance"
            class="mt-5"
            dense
            prominent
            type="error"
          >
            <v-row align="center">
              <v-col class="grow">
                {{ errorBalance.message }}
              </v-col>
              <v-col class="shrink">
                <v-btn
                  v-if="isInstanceOfNoActiveKeyError"
                  color="primary"
                  @click="connectionRequest"
                >
                  <v-icon left>
                    {{ mdiAccountCircle }}
                  </v-icon>
                  Connect
                </v-btn>
              </v-col>
            </v-row>
          </v-alert>
          <v-alert
            v-if="errorDeploy"
            class="mt-5"
            dense
            type="error"
          >
            {{ errorDeploy.message }}
          </v-alert>
        </operation>
      </v-tab-item>
      <v-tab-item>
        <manage-stepper />
      </v-tab-item>
    </v-tabs-items>
  </v-card>
</template>

<script>
import CardHorizontalList from '@/components/account/CardHorizontalList';
import ContractCard from '@/components/account/ContractCard';
import Amount from '@/components/forms/inputs/AmountInput';
import Argument from '@/components/forms/inputs/ArgumentInput';
import Operation from '@/components/operations/OperationCard';
import ManageStepper from '@/components/smartcontract/ManageStepper';
import balanceService from '@/helpers/balanceService';
import { NETWORK } from '@/helpers/env';
import generateLid from '@/helpers/generateLid';
import genericSendDeploy from '@/helpers/genericSendDeploy';
import specExec from '@/helpers/specExec';
import {
  InsufficientFunds,
  NoActiveKeyError,
  SmartContractDeployParameters,
  SmartContractResult,
} from '@casperholders/core';
import CurrencyUtils from '@casperholders/core/src/services/helpers/currencyUtils';
import {
  mdiAccountCircle,
  mdiAlert,
  mdiCircleMultiple, mdiDownloadOutline,
  mdiFileDocumentEdit,
  mdiImage,
  mdiImageFrame,
  mdiPaperclip,
} from '@mdi/js';
import { mapGetters, mapState } from 'vuex';

/**
 * SmartContract view
 * Contains two fields
 * - Amount of fee to deploy the smartcontract
 * - File input for the wasm smart contract
 */
export default {
  name: 'SmartContractView',
  components: {
    CardHorizontalList,
    ContractCard,
    ManageStepper,
    Argument,
    Amount,
    Operation,
  },
  data() {
    return {
      mdiAlert,
      mdiFileDocumentEdit,
      mdiPaperclip,
      mdiAccountCircle,
      mdiDownloadOutline,
      minPayment: 0,
      contract: [],
      amount: '1',
      balance: '0',
      errorBalance: null,
      loadingSignAndDeploy: false,
      loadingSimulate: false,
      errorDeploy: null,
      loadingBalance: true,
      type: SmartContractResult.getName(),
      buffer: null,
      tab: 0,
      args: [],
      specExecFee: 'N/A',
      simulatedResult: 'N/A',
      contracts: [
        {
          title: 'ERC20',
          githubUrl: 'https://github.com/casper-ecosystem/erc20',
          description: 'Casper Fungible Tokens (ERC-20 Standard)',
          icon: mdiCircleMultiple,
          downloadUrl: '/contracts/erc20_token.wasm',
          args: [
            {
              name: 'name',
              type: 'string',
            },
            {
              name: 'symbol',
              type: 'string',
            },
            {
              name: 'decimals',
              type: 'u8',
            },
            {
              name: 'total_supply',
              type: 'u512',
            },
          ],
        },
        {
          title: 'Uniswap ERC20',
          githubUrl: 'https://github.com/Rengo-Labs/CasperLabs-UniswapV2-Core/tree/main/erc20',
          description: 'ERC20 Implementation by Rengo Labs on Casper Network.',
          icon: mdiCircleMultiple,
          downloadUrl: '/contracts/uniswap_erc20_token.wasm',
          args: [
            {
              name: 'public_key',
              type: 'publicKey',
            },
            {
              name: 'name',
              type: 'string',
            },
            {
              name: 'symbol',
              type: 'string',
            },
            {
              name: 'decimals',
              type: 'u8',
            },
            {
              name: 'initial_supply',
              type: 'u256',
            },
            {
              name: 'contract_name',
              type: 'string',
            },
          ],
        },
        {
          title: 'NFT CEP47',
          githubUrl: 'https://github.com/casper-ecosystem/casper-nft-cep47',
          description: 'CEP-47 is the NFT standard for the Casper blockchain. The equivalent NFT standard on Ethereum is ERC-721.',
          icon: mdiImage,
          downloadUrl: '/contracts/cep47_token.wasm',
          args: [
            {
              name: 'name',
              type: 'string',
            },
            {
              name: 'symbol',
              type: 'string',
            },
            {
              name: 'meta',
              type: 'map',
            },
            {
              name: 'contract_name',
              type: 'string',
            },
          ],
        },
        {
          title: 'NFT CEP78',
          githubUrl: 'https://github.com/casper-ecosystem/cep-78-enhanced-nft',
          description: 'CEP-78: Enhanced NFT standard',
          icon: mdiImageFrame,
          downloadUrl: '/contracts/cep78_token.wasm',
          args: [
            {
              name: 'collection_name',
              type: 'string',
            },
            {
              name: 'collection_symbol',
              type: 'string',
            },
            {
              name: 'total_token_supply',
              type: 'u64',
            },
            {
              name: 'ownership_mode',
              type: 'u8',
            },
            {
              name: 'nft_kind',
              type: 'u8',
            },
            {
              name: 'nft_metadata_kind',
              type: 'u8',
            },
            {
              name: 'json_schema',
              type: 'string',
            },
            {
              name: 'identifier_mode',
              type: 'u8',
            },
            {
              name: 'metadata_mutability',
              type: 'u8',
            },
          ],
        },
      ],
    };
  },
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
    remainingBalance() {
      const result = this.balance - this.amount;
      return Math.trunc(result) >= 0 ? Number(result.toFixed(5)) : 0;
    },
    isInstanceOfNoActiveKeyError() {
      return this.errorBalance instanceof NoActiveKeyError;
    },
  },
  watch: {
    'signer.activeKey': 'getBalance',
    async internet(val) {
      if (val) {
        await this.getBalance();
      }
    },
    /**
     * Read the file selected by the user
     */
    contract() {
      const reader = new FileReader();

      reader.onload = (evt) => {
        this.buffer = evt.target.result;
      };

      reader.onerror = (evt) => {
        console.error('An error ocurred reading the file', evt);
      };

      reader.readAsArrayBuffer(this.contract, 'UTF-8');
    },
  },
  async mounted() {
    await this.getBalance();
    this.$root.$on('operationOnGoing', () => {
      this.errorDeploy = null;
    });
  },
  methods: {
    /**
     * Add a new arg to the list.
     */
    onAddArgument() {
      this.args.push({
        lid: generateLid(this.args.map(({ lid }) => lid)),
      });
    },
    /**
     * Set arguments.
     *
     * @param args
     */
    onSetArguments(args) {
      const newArgs = [];
      args.forEach((arg) => {
        newArgs.push({ ...arg, lid: generateLid(newArgs) });
      });

      this.args = newArgs;
    },
    /**
     * Get the user balance
     */
    async getBalance() {
      this.loadingBalance = true;
      this.errorBalance = null;
      this.balance = '0';
      try {
        this.balance = await balanceService.fetchBalance();
        if (this.balance <= this.minPayment && this.internet) {
          throw new InsufficientFunds(this.minPayment);
        }
      } catch (e) {
        this.errorBalance = e;
      }
      this.loadingBalance = false;
    },
    /**
     * Method used by the OperationSimulateDialog component when the user confirm the operation.
     * Simulate the deploy against the network.
     */
    async simulateFees() {
      this.loadingSimulate = true;
      this.simulatedResult = 'N/A';
      this.specExecFee = 'N/A';
      try {
        const args = {};
        this.args.forEach((a) => {
          args[a.name] = a.value;
        });

        const deployParameter = new SmartContractDeployParameters(
          this.activeKey,
          NETWORK,
          this.buffer,
          this.balance > 4000 ? 4000 : this.balance,
          args,
        );
        const signedDeploy = await this.signerObject
          .sign(deployParameter.makeDeploy, this.signerOptionsFactory.getOptionsForOperations());
        const result = await specExec.casperClient.speculativeDeploy(signedDeploy);
        console.log(result);
        const error = result.execution_result.Failure?.error_message;
        let cost = result.execution_result.Success?.cost;
        if (!cost) {
          cost = result.execution_result.Failure.cost;
        }
        this.specExecFee = CurrencyUtils.convertMotesToCasper(cost);
        this.simulatedResult = error || 'Deploy executed successfully';
      } catch (e) {
        console.log(e);
        this.simulatedResult = 'This deploy is invalid.';
      } finally {
        this.$root.$emit('closeSimulateDialog');
        this.loadingSimulate = false;
      }
    },
    /**
     * Method used by the OperationDialog component when the user confirm the operation.
     * Use the prepareSignAndSendDeploy method from the core library
     * Update the store with a deploy result containing the deployhash of the deploy sent
     */
    async sendDeploy() {
      const args = {};
      this.args.forEach((a) => {
        args[a.name] = a.value;
      });
      const deployParameter = new SmartContractDeployParameters(
        this.activeKey,
        NETWORK,
        this.buffer,
        this.amount,
        args,
      );
      const options = this.signerOptionsFactory.getOptionsForOperations();
      this.errorDeploy = null;
      this.loadingSignAndDeploy = true;
      const result = await genericSendDeploy(
        this.internet,
        this.activeKey,
        this.signer.activeKey,
        this.signerObject,
        deployParameter,
        options,
        '0',
        this.amount,
      );
      if (result.error) {
        console.log(result.error);
        this.errorDeploy = result.error;
      } else {
        await this.$store.dispatch(result.event, result.data);
      }
      this.loadingSignAndDeploy = false;
      this.$root.$emit('closeOperationDialog');
      this.$root.$emit('operationFinished');
    },
    async connectionRequest() {
      await this.$store.dispatch('openConnectDialog');
    },
  },
};
</script>

<style>
    .v-slide-group__next--disabled, .v-slide-group__prev--disabled {
        display: none !important;
    }

    .contract-card {
        min-width: 350px;
        width: 350px;
    }

    .card-actions {
        position: absolute;
        bottom: 0;
    }
</style>
