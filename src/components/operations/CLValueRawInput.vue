<template>
  <v-text-field
    v-model="rawValue"
    hint="Value of the argument"
    type="string"
    color="white"
    label="Value"
    :rules="weightRules"
    required
    :disabled="clType === 'unit' || clType === 'option'"
  >
    <template #prepend>
      <v-icon>
        mdi-weight
      </v-icon>
    </template>
  </v-text-field>
</template>

<script>
import buildCLValue from '@/helpers/genericCLValueBuilder';

export default {
  name: 'CLValueRawInput',
  props: {
    clType: {
      required: false,
      default: null,
      type: String,
    },
  },
  data() {
    return {
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
        (a) => (a !== null && this.clType !== null) || 'Type is required before validating the value',
        // eslint-disable-next-line new-cap
        () => {
          try {
            const builtCLVValue = buildCLValue(this.clType, this.rawValue);
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
  watch: {
    clType() {
      this.rawValue = '';
    },
    rawValue() {
      this.$emit('value', buildCLValue(this.clType, this.rawValue));
    },
  },
  methods: {},
};
</script>
