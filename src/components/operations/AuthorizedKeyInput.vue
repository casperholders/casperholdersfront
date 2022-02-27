<template>
  <v-row
    align="center"
    justify="center"
  >
    <v-col
      cols="12"
      md="8"
    >
      <v-text-field
        color="white"
        label="Public key"
        type="text"
        :value="data.publicKey"
        :rules="publicKeyRules"
        required
        @input="$emit('update', {publicKey: $event})"
      >
        <template #prepend>
          <v-tooltip
            bottom
          >
            <template #activator="{ on }">
              <v-icon v-on="on">
                mdi-open-in-new
              </v-icon>
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
        color="white"
        label="Weight"
        type="number"
        min="1"
        required
        :value="data.weight"
        :rules="weightRules"
        @input="$emit('update', {weight: $event})"
      >
        <template #prepend>
          <v-icon>
            mdi-weight
          </v-icon>
        </template>
      </v-text-field>
    </v-col>
    <v-col cols="1">
      <v-btn
        class="rounded-xl mx-2"
        color="primary"
        fab
        dark
        small
        @click="$emit('delete')"
      >
        <v-icon>
          mdi-delete
        </v-icon>
      </v-btn>
    </v-col>
  </v-row>
</template>

<script>
import { CLPublicKey } from 'casper-js-sdk';

export default {
  name: 'AuthorizedKeyInput',
  props: {
    data: {
      required: true,
      type: Object,
    },
  },
  data() {
    return {
      /**
       * Rules for the Public Key text field
       */
      publicKeyRules: [
        (a) => !!a || 'Public Key required',
        (a) => {
          try {
            if (a) {
              CLPublicKey.fromHex(a);
            }
            return true;
          } catch (e) {
            return e.toString();
          }
        },
      ],
      /**
       * Rules for the Weight field
       */
      weightRules: [
        (a) => !!a || 'Weight required',
        (a) => a > 0 || 'Weight must be at least 1',
      ],
    };
  },
};
</script>
