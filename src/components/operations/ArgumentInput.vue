<template>
  <v-row
    align="center"
    justify="center"
    class="rounded mb-7 mx-1"
    style="border: thin solid rgba(255, 255, 255, 0.12)"
  >
    <v-col
      cols="12"
    >
      <v-text-field
        v-model="name"
        hint="Name of the argument"
        type="string"
        color="white"
        label="Name"
        required
        :disabled="argName !== ''"
      >
        <template #prepend>
          <v-icon>
            mdi-weight
          </v-icon>
        </template>
      </v-text-field>
    </v-col>
    <v-col cols="12">
      <CLValueInput
        :cl-type="clType"
        @value="$emit('value', test($event))"
      />
    </v-col>
    <v-col cols="1">
      <v-btn
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
import CLValueInput from '@/components/operations/CLValueInput';
import buildCLValue from '@/helpers/genericCLValueBuilder';

export default {
  name: 'ArgumentInput',
  components: { CLValueInput },
  props: {
    clType: {
      required: false,
      default: null,
      type: String,
    },
    argName: {
      required: false,
      default: '',
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
        { name: 'Tuple', type: 'tuple' },
        { name: 'Option', type: 'option' },
        { name: 'Map', type: 'map' },
        { name: 'PublicKey', type: 'publicKey' },
        { name: 'ByteArray', type: 'byteArray' },
      ],
      type: this.clType,
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
            const builtCLVValue = buildCLValue(this.type, this.rawValue);
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
  computed: {
    name: {
      get() {
        return this.argName;
      },
      set(val) {
        this.$emit('name', val);
      },
    },
    isSimpleValue() {
      return !['unit', 'option', 'tuple', 'list', 'map'].includes(this.type);
    },
  },
  watch: {
    type() {
      this.rawValue = '';
    },
    rawValue() {
      this.$emit('value', buildCLValue(this.type, this.rawValue));
    },
  },
  methods: {
    test(v) {
      console.log('ARG V');
      console.log(v);
      return v;
    }
  },
};
</script>
