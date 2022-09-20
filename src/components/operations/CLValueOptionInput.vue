<template>
  <v-row
    align="center"
    justify="center"
    class="rounded mb-7 mx-1"
    style="border: thin solid rgba(255, 255, 255, 0.12); width: 100%"
  >
    <v-col
      cols="12"
    >
      <v-row>
        <v-col
          v-if="clType === null"
          cols="2"
        >
          <CLTypeInput
            type-prefix="Option "
            @cltype="type = $event;"
          />
        </v-col>
        <v-col cols="2">
          <v-checkbox
            v-model="isNone"
            color="white"
            label="Is none ?"
            @click="isNone ? $emit('none', type) : false"
          />
        </v-col>
        <v-col
          v-if="!isNone"
          :cols="clType === null ? 8 : 10"
        >
          <CLValueInput
            :cl-type="type"
            :hide-type="true"
            @value="$emit('value', $event)"
          />
        </v-col>
      </v-row>
    </v-col>
  </v-row>
</template>

<script>
import CLTypeInput from '@/components/operations/CLTypeInput';

export default {
  name: 'CLValueOptionInput',
  components: { CLTypeInput },
  props: {
    clType: {
      required: false,
      default: null,
      type: String,
    },
  },
  data() {
    return {
      type: this.clType,
      isNone: false,
    };
  },
  watch: {
  },
  methods: {},
};
</script>
