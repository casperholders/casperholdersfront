<template>
  <v-row
    align="center"
    justify="center"
    class="rounded mb-7 mx-1"
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
            {{ mdiWeight }}
          </v-icon>
        </template>
      </v-text-field>
    </v-col>
    <v-col cols="12">
      <CLValueInput
        :cl-type="clType"
        type-prefix="Argument "
        @value="onValue"
      />
    </v-col>
  </v-row>
</template>

<script>
import CLValueInput from '@/components/forms/inputs/clvalues/CLValueInput';
import { mdiWeight } from '@mdi/js';

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
      mdiWeight,
      rawValue: '',
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
  },
  watch: {
    rawValue() {
      this.$emit('value', this.rawValue);
    },
  },
  methods: {
    onValue(v) {
      this.rawValue = v;
    },
  },
};
</script>
