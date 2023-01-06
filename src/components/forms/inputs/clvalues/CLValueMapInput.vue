<template>
  <v-row
    align="center"
    justify="center"
    class="rounded mb-7 mx-1"
    style="border: thin solid rgba(255, 255, 255, 0.12); width: 100%"
  >
    <v-col cols="12">
      <CLTypeInput
        :cl-type="keyClType"
        data-cy="mapKeyType"
        type-prefix="Key "
        @cltype="mapValues = []; mapKeysType = $event; $emit('value', [mapKeysType, mapValuesType])"
      />
      <CLTypeInput
        v-if="mapKeysType === 'option'"
        type-prefix="Option "
        @cltype="optionKeyType = $event;"
      />
      <CLTypeInput
        :cl-type="valueClType"
        data-cy="mapValueType"
        type-prefix="Value "
        @cltype="mapValues = [];
                 mapValuesType = $event;
                 $emit('value', [mapKeysType, mapValuesType])"
      />
      <CLTypeInput
        v-if="mapValuesType === 'option'"
        type-prefix="Option "
        @cltype="optionValueType = $event;"
      />
    </v-col>
    <v-col
      v-for="index in mapValues.length"
      :key="index"
      cols="12"
    >
      <v-row>
        <v-col cols="11">
          Key Data
          <CLValueInput
            :cl-type="mapKeysType"
            :inner-option-type="optionKeyType"
            :hide-type="true"
            @value="mapValues[index-1].key = $event; $emit('value', mapValues)"
          />
          Value Data
          <CLValueInput
            :cl-type="mapValuesType"
            :inner-option-type="optionValueType"
            :hide-type="true"
            @value="mapValues[index-1].value = $event; $emit('value', mapValues)"
          />
        </v-col>
        <v-col cols="1">
          <v-btn
            class="rounded-xl"
            color="primary"
            fab
            dark
            small
            @click="mapValues.splice((index - 1), 1);"
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
        fab
        dark
        small
        @click="mapValues.push({key: null, value: null})"
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
  name: 'CLValueMapInput',
  components: { CLTypeInput },
  props: {
    keyClType: {
      required: false,
      default: null,
      type: String,
    },
    valueClType: {
      required: false,
      default: null,
      type: String,
    },
  },
  data() {
    return {
      mdiMinus,
      mdiPlus,
      optionKeyType: null,
      optionValueType: null,
      mapKeysType: null,
      mapValuesType: null,
      mapValues: [],
    };
  },
  methods: {},
};
</script>
