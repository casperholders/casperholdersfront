<template>
  <div>
    <v-row
      align="center"
      justify="center"
    >
      <v-col
        v-if="!hideType"
        cols="12"
      >
        <CLTypeInput
          :cl-type="findType(clType)"
          :type-prefix="typePrefix"
          @cltype="type = $event"
        />
      </v-col>
      <v-col
        v-if="isSimpleValue"
        cols="12"
      >
        <CLValueRawInput
          data-cy="CLValueRawInput"
          :cl-type="type ? type : findType(clType)"
          @value="$emit('value', $event)"
        />
      </v-col>
    </v-row>
    <CLValueListInput
      v-if="type === 'list'"
      data-cy="CLValueListInput"
      @value="$emit('value', build($event))"
    />
    <CLValueTupleInput
      v-if="type === 'tuple'"
      @value="$emit('value', build($event))"
    />
    <CLValueOptionInput
      v-if="type === 'option'"
      data-cy="CLValueOptionInput"
      :cl-type="optionType"
      @value="$emit('value', build($event))"
      @none="$emit('value', build($event, true))"
    />
    <CLValueMapInput
      v-if="type === 'map'"
      data-cy="CLValueMapInput"
      @value="$emit('value', build($event))"
    />
  </div>
</template>

<script>
import CLTypeInput from '@/components/forms/inputs/clvalues/CLTypeInput';
import CLValueListInput from '@/components/forms/inputs/clvalues/CLValueListInput';
import CLValueMapInput from '@/components/forms/inputs/clvalues/CLValueMapInput';
import CLValueOptionInput from '@/components/forms/inputs/clvalues/CLValueOptionInput';
import CLValueRawInput from '@/components/forms/inputs/clvalues/CLValueRawInput';
import CLValueTupleInput from '@/components/forms/inputs/clvalues/CLValueTupleInput';
import buildCLValue from '@/helpers/genericCLValueBuilder';

const types = [
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
  { name: 'AccountHash', type: 'accountHash' },
  { name: 'ContractHash', type: 'contractHash' },
  { name: 'ByteArray', type: 'byteArray' },
];

export default {
  name: 'CLValueInput',
  components: {
    CLValueMapInput,
    CLValueOptionInput,
    CLValueTupleInput,
    CLValueListInput,
    CLValueRawInput,
    CLTypeInput,
  },
  props: {
    clType: {
      required: false,
      default: null,
      type: String,
    },
    innerOptionType: {
      required: false,
      default: null,
      type: String,
    },
    typePrefix: {
      required: false,
      default: '',
      type: String,
    },
    hideType: {
      required: false,
      default: false,
      type: Boolean,
    },
  },
  data() {
    return {
      type: this.findType(this.clType),
      listType: null,
      optionType: this.innerOptionType,
    };
  },
  computed: {
    isSimpleValue() {
      return !['unit', 'option', 'tuple', 'list', 'map'].includes(this.type);
    },
  },
  watch: {
    type() {
      this.rawValue = '';
    },
    clType() {
      this.type = this.findType(this.clType);
    },
    innerOptionType() {
      this.optionType = this.innerOptionType;
    },
  },
  methods: {
    build(value, none = false) {
      if (none) {
        return buildCLValue(this.type, null, value);
      }
      return buildCLValue(this.type, value);
    },
    findType(searchType) {
      if (searchType) {
        return types.find((type) => type.type.toLowerCase() === searchType.toLowerCase())?.type
          || null;
      }
      return null;
    },
  },
};
</script>
