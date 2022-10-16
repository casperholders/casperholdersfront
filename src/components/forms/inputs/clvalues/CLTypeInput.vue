<template>
  <v-autocomplete
    v-model="type"
    :items="types"
    item-text="name"
    item-value="type"
    color="white"
    :label="typePrefix+'Type'"
    required
    :disabled="clType !== null"
  >
    <template #prepend>
      <v-icon>
        mdi-weight
      </v-icon>
    </template>
  </v-autocomplete>
</template>

<script>
export default {
  name: 'CLTypeInput',
  props: {
    clType: {
      required: false,
      default: null,
      type: String,
    },
    typePrefix: {
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
    };
  },
  computed: {
    type: {
      get() {
        return this.clType;
      },
      set(val) {
        this.$emit('cltype', val);
      },
    },
  },
};
</script>
