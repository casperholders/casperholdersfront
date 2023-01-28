<template>
  <v-row
    align="center"
    justify="center"
    class="rounded mb-7 mx-1"
    style="border: thin solid rgba(255, 255, 255, 0.12); width: 100%"
  >
    <v-col cols="12">
      <CLTypeInput
        :cl-type="clType"
        data-cy="listType"
        type-prefix="List "
        @cltype="listValues = []; listValuesType = $event; $emit('value', listValues)"
      />
      <CLTypeInput
        v-if="listValuesType === 'option'"
        type-prefix="Option "
        @cltype="listValues = []; optionType = $event; $emit('value', listValues)"
      />
    </v-col>
    <v-col
      v-for="index in listValues.length"
      :key="index"
      cols="12"
    >
      <v-row>
        <v-col cols="11">
          <CLValueInput
            :cl-type="listValuesType"
            :inner-option-type="optionType"
            :hide-type="true"
            @value="listValues[index-1] = $event; $emit('value', listValues)"
          />
        </v-col>
        <v-col cols="1">
          <v-btn
            class="rounded-xl"
            color="primary"
            fab
            dark
            small
            @click="listValues.splice((index - 1), 1);"
          >
            <v-icon>
              {{ mdiMinus }}
            </v-icon>
          </v-btn>
        </v-col>
      </v-row>
    </v-col>
    <v-col cols="1">
      <v-btn
        class="rounded-xl"
        color="primary"
        data-cy="listNewValue"
        fab
        dark
        small
        @click="listValues.push('')"
      >
        <v-icon>
          {{ mdiPlus }}
        </v-icon>
      </v-btn>
    </v-col>
  </v-row>
</template>

<script>
import CLTypeInput from '@/components/forms/inputs/clvalues/CLTypeInput';
import { mdiMinus, mdiPlus } from '@mdi/js';

export default {
  name: 'CLValueListInput',
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
      mdiMinus,
      mdiPlus,
      optionType: null,
      listValuesType: null,
      listValues: [],
    };
  },
  methods: {},
};
</script>
