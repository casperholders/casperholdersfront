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
          </div>
        </v-card-text>
      </v-card>
      <template v-if="countdown">
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
            Account authorized to manage keys.
          </template>
          <template v-else>
            <v-icon
              color="error"
              left
            >
              mdi-alert-circle
            </v-icon>
            Account not authorized to manage keys.
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
        <p>
          <v-icon
            color="error"
            left
          >
            mdi-alert-circle
          </v-icon>
          Unfortunately this deploy is expired.
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
        :disabled="!countdown"
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
</template>

<script>

import clientCasper from '@/helpers/clientCasper';
import { API } from '@/helpers/env';
import { KeyManagementResult } from '@casperholders/core/dist/services/results/keyManagementResult';
import Big from 'big.js';
import { CLPublicKey, DeployUtil } from 'casper-js-sdk';
import parse from 'parse-duration';
import countdown from 'countdown';
import { mapGetters, mapState } from 'vuex';

/**
 * Multi-sig View
 */
export default {
  name: 'MultiSig',
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
    ]),
    ...mapGetters([
      'signerObject',
      'signerOptionsFactory',
      'activeKey',
    ]),
    account() {
      return this.deploy?.deploy ? this.deploy.deploy.deploy.header.account : '';
    },
    approvals() {
      return this.deploy?.deploy ? this.deploy.deploy.deploy.approvals : [];
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
        const countdownID = countdown((ts) => {
          if (ts.value > 0) {
            this.countdown = ts.toString();
          } else {
            this.countdown = null;
            clearInterval(countdownID);
          }
        },
        ttl + 10000000 + timestamp,
        // eslint-disable-next-line no-bitwise
        countdown.HOURS | countdown.MINUTES | countdown.SECONDS);
      } else {
        this.notFound = true;
      }
    },
    async signMultisig() {
      this.signingLoading = true;
      this.errorSign = null;
      try {
        const options = this.signerOptionsFactory.getOptionsForOperations();
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
      } catch (e) {
        console.log(e);
        this.errorSign = e;
      }
      this.signingLoading = false;
    },
  },
};
</script>
