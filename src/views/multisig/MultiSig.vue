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
          <v-icon>mdi-key-chain</v-icon>
        </v-avatar>
        <v-card-title
          class="pl-4"
          style="word-break: break-word"
        >
          Sign a multisig deploy
        </v-card-title>
      </v-card-title>
      <v-card-text>
        <v-card
          outlined
          elevation="3"
          class="mb-4"
        >
          <v-card-title>
            <v-icon left>
              mdi-clipboard-list
            </v-icon>
            Summary
          </v-card-title>
          <v-card-text>
            <div class="mx-n1">
              <v-row
                class="white-bottom-border"
              >
                <v-col>Account</v-col>
                <v-col class="text-right cspr">
                  {{ account }}
                </v-col>
              </v-row>
              <v-row
                class="white-bottom-border"
              >
                <v-col>Operation Name</v-col>
                <v-col class="text-right cspr">
                  {{ name }}
                </v-col>
              </v-row>
              <v-row
                class="white-bottom-border"
              >
                <v-col>Amount</v-col>
                <v-col class="text-right cspr">
                  {{ amount }} CSPR
                </v-col>
              </v-row>
              <v-row
                class="white-bottom-border"
              >
                <v-col>Fee</v-col>
                <v-col class="text-right cspr">
                  {{ cost }} CSPR
                </v-col>
              </v-row>
              <v-row
                class="white-bottom-border"
              >
                <v-col>Approvals</v-col>
                <v-col class="text-right cspr">
                  <template v-for="(approval, i) in approvals">
                    <div :key="i">
                      {{ approval.signer }}
                    </div>
                  </template>
                </v-col>
              </v-row>
              <v-row>
                <v-expansion-panels accordion>
                  <v-expansion-panel>
                    <v-expansion-panel-header>
                      Details
                    </v-expansion-panel-header>
                    <v-expansion-panel-content>
                      <vue-json-pretty
                        class="overflow-auto"
                        style="height: 500px; background-color: black;"
                        :data="deployJson()"
                        :show-line="true"
                      />
                    </v-expansion-panel-content>
                  </v-expansion-panel>
                </v-expansion-panels>
              </v-row>
            </div>
          </v-card-text>
        </v-card>
        <template v-if="countdown && !alreadySigned">
          <p>
            <template
              v-if="validated"
            >
              <v-icon
                color="success"
                left
              >
                mdi-checkbox-marked-circle
              </v-icon>
              Account authorized to sign this deploy.
            </template>
            <template v-else>
              <v-icon
                color="error"
                left
              >
                mdi-alert-circle
              </v-icon>
              Account not authorized to sign this deploy.
            </template>
          </p>
          <p>
            <v-icon
              color="info"
              left
            >
              mdi-information
            </v-icon>
            Current deploy weight : {{ currentWeight }}
          </p>
          <p>
            <v-icon
              color="info"
              left
            >
              mdi-information
            </v-icon>
            Current key weight : {{ currentKeyWeight }}
          </p>
          <p>
            <v-icon
              color="info"
              left
            >
              mdi-information
            </v-icon>
            Weight needed : {{ weightNeeded }}
          </p>
          <p>
            <v-icon
              color="success"
              left
            >
              mdi-checkbox-marked-circle
            </v-icon>
            This deploy is still valid, but it will expire in {{ countdown }}.
          </p>
          <p>
            <template
              v-if="(currentWeight + currentKeyWeight) >= weightNeeded"
            >
              <v-icon
                color="success"
                left
              >
                mdi-checkbox-marked-circle
              </v-icon>
              Deploy will be sent right after you sign it since it will reach the required weight.
            </template>
            <template v-else>
              <v-icon
                color="error"
                left
              >
                mdi-alert-circle
              </v-icon>
              The deploy will still miss {{ weightNeeded - currentWeight - currentKeyWeight }}
              weight before sending it.
            </template>
          </p>
        </template>
        <template v-else>
          <p v-if="!countdown">
            <v-icon
              color="error"
              left
            >
              mdi-alert-circle
            </v-icon>
            Unfortunately this deploy is expired.
          </p>
          <p v-if="alreadySigned">
            <v-icon
              color="success"
              left
            >
              mdi-checkbox-marked-circle
            </v-icon>
            You already signed this deploy.
          </p>
        </template>
        <v-alert
          v-if="errorSign"
          class="mt-5"
          dense
          prominent
          type="error"
        >
          {{ errorSign.message }}
        </v-alert>
      </v-card-text>
      <v-card-actions class="pa-4">
        <v-btn
          id="agreeAndSign"
          class="rounded-xl"
          color="primary"
          dark
          large
          :disabled="!countdown || alreadySigned"
          :loading="signingLoading"
          @click="signMultisig"
        >
          <v-icon left>
            mdi-draw
          </v-icon>
          Agree & Sign
        </v-btn>
      </v-card-actions>
    </v-card>
    <OperationResult
      v-for="operation in filteredOperations"
      :key="operation.hash"
      :deploy-hash="operation.hash"
    />
    <OperationPending v-if="offlineDeploys.length > 0" />
    <OperationPendingWeight v-if="weightedDeploys.length > 0" />
  </div>
</template>

<script>

import OperationPending from '@/components/operations/OperationPending';
import OperationPendingWeight from '@/components/operations/OperationPendingWeight';
import OperationResult from '@/components/operations/OperationResult';
import clientCasper from '@/helpers/clientCasper';
import deployManager from '@/helpers/deployManager';
import { API } from '@/helpers/env';
import { KeyManagementResult, TransferResult } from '@casperholders/core';
import Big from 'big.js';
import { CLPublicKey, DeployUtil } from 'casper-js-sdk';
import parse from 'parse-duration';
import countdown from 'countdown';
import { mapGetters, mapState } from 'vuex';
import VueJsonPretty from 'vue-json-pretty';
import 'vue-json-pretty/lib/styles.css';

/**
 * Multi-sig View
 */
export default {
  name: 'MultiSig',
  components: {
    VueJsonPretty,
    OperationPendingWeight,
    OperationPending,
    OperationResult,
  },
  data() {
    return {
      deploy: {},
      notFound: false,
      keyInfo: null,
      validated: false,
      weightNeeded: 1,
      currentWeight: 0,
      currentKeyWeight: 0,
      signingLoading: false,
      errorSign: null,
      countdown: null,
    };
  },
  computed: {
    ...mapState([
      'signer',
      'offlineDeploys',
      'weightedDeploys',
      'operations',
    ]),
    ...mapGetters([
      'signerObject',
      'signerOptionsFactory',
      'activeKey',
    ]),
    filteredOperations() {
      return this.operations.filter(
        (operation) => operation.hash === this.$route.params.deployHash,
      );
    },
    account() {
      return this.deploy?.deploy ? this.deploy.deploy.deploy.header.account : '';
    },
    approvals() {
      return this.deploy?.deploy ? this.deploy.deploy.deploy.approvals : [];
    },
    alreadySigned() {
      return this.deploy?.deploy
        ? this.deploy.deploy.deploy.approvals.some(
          (approval) => approval.signer === this.signer.activeKey,
        )
        : false;
    },
    amount() {
      return this.deploy?.deployResult ? Big(this.deploy.deployResult.amount) : 0;
    },
    cost() {
      return this.deploy?.deployResult ? Big(this.deploy.deployResult.cost) : 0;
    },
    name() {
      return this.deploy?.deployResult ? this.deploy.deployResult.name : '';
    },
  },
  watch: {
    'signer.activeKey': {
      async handler() {
        await this.getKeyInfos();
      },
    },
  },
  async mounted() {
    await this.getDeployInfo();
    await this.getKeyInfos();
  },
  methods: {
    deployJson() {
      return this.deploy.deploy;
    },
    async getKeyInfos() {
      if (this.signer.activeKey && this.keyInfo) {
        const account = this.keyInfo.Account.associatedKeys.find(
          (v) => v.accountHash === CLPublicKey.fromHex(this.signer.activeKey).toAccountHashStr(),
        );
        this.validated = account !== undefined;
        this.currentKeyWeight = account ? account.weight : 0;
      }
    },
    async getDeployInfo() {
      const res = await fetch(`${API}/deploys/${this.$route.params.deployHash}`);
      if (res.ok) {
        this.deploy = await res.json();
        const latestBlock = await clientCasper.casperRPC.getLatestBlockInfo();
        const stateRootHash = await clientCasper.casperRPC.getStateRootHash(
          latestBlock.block.hash,
        );
        this.keyInfo = await clientCasper.casperRPC.getBlockState(
          stateRootHash,
          CLPublicKey.fromHex(this.deploy.deploy.deploy.header.account).toAccountHashStr(),
          [],
        );
        if (this.deploy.deployResult.name === KeyManagementResult.name) {
          this.weightNeeded = this.keyInfo.Account.actionThresholds.keyManagement;
        } else {
          this.weightNeeded = this.keyInfo.Account.actionThresholds.deployment;
        }
        this.deploy.deploy.deploy.approvals.forEach((approval) => {
          const approvalAccount = this.keyInfo.Account.associatedKeys.find(
            (v) => v.accountHash === CLPublicKey.fromHex(approval.signer).toAccountHashStr(),
          );
          this.currentWeight += approvalAccount ? approvalAccount.weight : 0;
        });
        const ttl = parse(this.deploy.deploy.deploy.header.ttl);
        const timestamp = Date.parse(this.deploy.deploy.deploy.header.timestamp);
        const countdownID = countdown(
          (ts) => {
            if (ts.value > 0) {
              this.countdown = ts.toString();
            } else {
              this.countdown = null;
              clearInterval(countdownID);
            }
          },
          ttl + timestamp,
          // eslint-disable-next-line no-bitwise
          (countdown.HOURS | countdown.MINUTES | countdown.SECONDS),
        );
      } else {
        this.notFound = true;
      }
    },
    async signMultisig() {
      this.signingLoading = true;
      this.errorSign = null;
      try {
        let options = this.signerOptionsFactory.getOptionsForOperations();
        console.log(this.deploy.deployResult.name);
        console.log(KeyManagementResult);
        if (this.deploy.deployResult.name === TransferResult.getName()) {
          console.log(DeployUtil.deployFromJson(this.deploy.deploy).val.session.getArgByName('target'));
          console.log(DeployUtil.deployFromJson(this.deploy.deploy).val.session.getArgByName('target').toHex());
          options = this.signerOptionsFactory.getOptionsForTransfer(DeployUtil.deployFromJson(this.deploy.deploy).val.session.getArgByName('target').toHex());
        }
        const signedDeploy = await this.signerObject
          .sign(DeployUtil.deployFromJson(this.deploy.deploy).val, options);
        this.deploy.deploy = DeployUtil.deployToJson(signedDeploy);
        this.currentWeight = 0;
        this.deploy.deploy.deploy.approvals.forEach((approval) => {
          const approvalAccount = this.keyInfo.Account.associatedKeys.find(
            (v) => v.accountHash === CLPublicKey.fromHex(approval.signer).toAccountHashStr(),
          );
          this.currentWeight += approvalAccount ? approvalAccount.weight : 0;
        });
        if (this.currentWeight >= this.weightNeeded) {
          const deployResult = await deployManager.sendDeploy(
            signedDeploy,
            TransferResult,
          );
          await this.$store.dispatch('addDeployResult', deployResult);
        }
      } catch (e) {
        console.log(e);
        this.errorSign = e;
      }
      this.signingLoading = false;
    },
  },
};
</script>
