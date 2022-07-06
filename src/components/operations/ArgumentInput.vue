<template>
  <v-row
    align="center"
    justify="center"
    class="rounded mb-7 mx-1"
    style="border: thin solid rgba(255, 255, 255, 0.12)"
  >
    <v-col
      cols="12"
      md="2"
    >
      <v-autocomplete
        :id="`${index}-type`"
        v-model="type"
        :items="types"
        item-text="name"
        item-value="type"
        color="white"
        label="Type"
        required
        @input="$emit('update', {type: $event})"
      >
        <template #prepend>
          <v-icon>
            mdi-weight
          </v-icon>
        </template>
      </v-autocomplete>
    </v-col>
    <v-col
      cols="12"
      md="2"
    >
      <v-text-field
        :id="`${index}-name`"
        v-model="name"
        hint="Name of the argument"
        type="string"
        color="white"
        label="Name"
        required
        @input="$emit('update', {name: $event})"
      >
        <template #prepend>
          <v-icon>
            mdi-weight
          </v-icon>
        </template>
      </v-text-field>
    </v-col>
    <v-col
      cols="12"
      md="7"
    >
      <v-text-field
        :id="`${index}-value`"
        v-model="rawValue"
        hint="Value of the argument"
        type="string"
        color="white"
        label="Value"
        :rules="weightRules"
        required
        :disabled="type === 'unit'"
        @input="$emit('update', {value: $event})"
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
        :id="`${index}-delete`"
        class="rounded-xl"
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
import { Buffer } from 'buffer';
import {
  CLURef,
  CLValueBuilder, decodeBase16,
} from 'casper-js-sdk';

export default {
  name: 'ArgumentInput',
  props: {
    /**
     type: {
      required: true,
      type: CLType,
    },
     name: {
      required: true,
      type: String,
    },
     rawValue: {
      required: true,
      type: CLValue,
    },* */
    index: {
      required: true,
      type: String,
    },
  },
  data() {
    return {
      types: [
        { name: 'Bool', type: 'bool' },
        { name: 'U8', type: 'u8' },
        { name: 'U32', type: 'u32' },
        { name: 'I32', type: 'i32' },
        { name: 'U64', type: 'u64' },
        { name: 'I64', type: 'i64' },
        { name: 'U128', type: 'u128' },
        { name: 'U256', type: 'u256' },
        { name: 'U512', type: 'u512' },
        { name: 'Unit', type: 'unit' },
        { name: 'String', type: 'string' },
        { name: 'Key', type: 'key' },
        { name: 'URef', type: 'uref' },
        { name: 'List', type: 'list' },
        { name: 'Tuple1', type: 'tuple1' },
        { name: 'Tuple2', type: 'tuple2' },
        { name: 'Tuple3', type: 'tuple3' },
        { name: 'Option', type: 'option' },
        { name: 'Map', type: 'map' },
        { name: 'PublicKey', type: 'publicKey' },
        { name: 'ByteArray', type: 'byteArray' },
      ],
      type: null,
      name: 'Arg',
      rawValue: '',
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
        (a) => (a !== null && this.type !== null) || 'Type is required before validating the value',
        // eslint-disable-next-line new-cap
        () => {
          try {
            const builtCLVValue = this.buildCLValue();
            console.log(builtCLVValue);
            return typeof builtCLVValue === 'string'
              ? builtCLVValue : builtCLVValue.isCLValue;
          } catch (e) {
            return e.toString();
          }
        },
      ],
    };
  },
  computed: {},
  watch: {
    type() {
      this.rawValue = '';
    },
  },
  methods: {
    buildCLValue() {
      console.log((!(this.rawValue === '0' || this.rawValue === 'false')));
      let keyParameter = null;
      switch (this.type) {
        case 'bool':
          return CLValueBuilder[this.type]((!(this.rawValue === '0' || this.rawValue === 'false')));
        case 'u8':
        case 'u32':
        case 'i32':
        case 'u64':
        case 'i64':
        case 'u128':
        case 'u256':
        case 'u512':
        case 'unit':
        case 'string':
          return CLValueBuilder[this.type](this.rawValue);
        case 'uref':
          return CLURef.fromFormattedStr(this.rawValue);
        case 'key':
          if (this.rawValue.startsWith('uref-')) {
            keyParameter = CLURef.fromFormattedStr(this.rawValue);
          } else if (this.rawValue.startsWith('01') || this.rawValue.startsWith('02')) {
            keyParameter = CLValueBuilder.publicKey(
              decodeBase16(this.rawValue).subarray(1),
              decodeBase16(this.rawValue)[0],
            );
          } else {
            keyParameter = CLValueBuilder.byteArray(Buffer.from(this.rawValue));
          }
          return CLValueBuilder.key(keyParameter);
        case 'list':
        case 'tuple1':
        case 'tuple2':
        case 'tuple3':
        case 'option':
        case 'map':
          return 'Not supported';
        case 'publicKey':
          return CLValueBuilder[this.type](
            decodeBase16(this.rawValue).subarray(1),
            decodeBase16(this.rawValue)[0],
          );
        case 'byteArray':
          return CLValueBuilder[this.type](Buffer.from(this.rawValue));
        default:
          return 'Select a type';
      }
    },
  },
};
</script>
