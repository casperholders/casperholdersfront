<template>
  <v-row
    align="center"
    justify="center"
    class="rounded mb-7 mx-1"
    style="border: thin solid rgba(255, 255, 255, 0.12)"
  >
    <v-col
      cols="12"
      md="8"
    >
      <v-text-field
        :id="data.existingKey ? `${data.accountHash}-field` : `${index}-field`"
        color="white"
        label="Account Hash"
        type="text"
        :value="data.accountHash"
        :rules="accountHashRules"
        :readonly="data.existingKey"
        :hint="data.existingKey ?
          'You can\'t edit this key, you can only modify it\'s weight or delete it.' : undefined"
        :persistent-hint="data.existingKey"
        required
        @input="$emit('update', {accountHash: $event})"
      >
        <template #prepend>
          <v-tooltip
            bottom
          >
            <template #activator="{ on }">
              <v-btn
                icon
                :href="getAccountHashUrl(data.accountHash)"
                target="_blank"
                rel="noopener"
                v-on="on"
              >
                <v-icon>
                  {{ mdiOpenInNew }}
                </v-icon>
              </v-btn>
            </template>
            See on cspr.live
          </v-tooltip>
        </template>
      </v-text-field>
    </v-col>
    <v-col
      cols="12"
      md="3"
    >
      <v-text-field
        :id="data.existingKey ? `${data.accountHash}-weight` : `${index}-weight`"
        color="white"
        label="Weight"
        type="number"
        :min="data.existingKey ? 0 : 1"
        required
        :value="data.weight"
        :rules="weightRules"
        :hint="data.existingKey ? 'Set to 0 to remove this key' : undefined"
        :persistent-hint="data.existingKey"
        @input="$emit('update', {weight: $event})"
      >
        <template #prepend>
          <v-icon>
            {{ mdiWeight }}
          </v-icon>
        </template>
      </v-text-field>
    </v-col>
    <v-col cols="1">
      <v-btn
        :id="data.existingKey ? `${data.accountHash}-delete` : `${index}-delete`"
        class="rounded-xl"
        color="primary"
        fab
        dark
        small
        @click="$emit('delete')"
      >
        <v-icon>
          {{ mdiDelete }}
        </v-icon>
      </v-btn>
    </v-col>
    <v-col
      v-if="isCurrentAccount"
      cols="12"
    >
      <v-alert
        dense
        type="info"
      >
        This is the account hash of the currently connected/impersonated account.
      </v-alert>
    </v-col>
  </v-row>
</template>

<script>
import { CSPR_LIVE_URL } from '@/helpers/env';
import { mdiDelete, mdiOpenInNew, mdiWeight } from '@mdi/js';
import { CLPublicKey } from 'casper-js-sdk';
import { mapGetters } from 'vuex';

export default {
  name: 'AuthorizedKeyInput',
  props: {
    data: {
      required: true,
      type: Object,
    },
    index: {
      required: true,
      type: Number,
    },
  },
  data() {
    return {
      mdiOpenInNew,
      mdiDelete,
      mdiWeight,
      /**
       * Rules for the Account Hash text field
       */
      accountHashRules: [
        (a) => !!a || 'Account Hash required',
        (a) => /^[a-f0-9]{64}$/.test(a) || 'Account hash must be valid. (32 char string [a-f0-9]{64})',
      ],
      /**
       * Rules for the Weight field
       */
      weightRules: [
        (a) => a !== '' || 'Weight required',
        (a) => a > (this.data.existingKey ? -1 : 0) || `Weight must be at least ${this.data.existingKey ? '0' : '1'}`,
      ],
    };
  },
  computed: {
    ...mapGetters([
      'activeKey',
    ]),
    isCurrentAccount() {
      return CLPublicKey.fromHex(this.activeKey).toAccountHashStr().replace('account-hash-', '') === this.data.accountHash;
    },
  },
  methods: {
    getAccountHashUrl(accountHash) {
      return `${CSPR_LIVE_URL}account/${accountHash}`;
    },
  },
};
</script>
