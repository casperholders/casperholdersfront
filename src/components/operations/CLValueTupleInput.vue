<template>
  <v-row
    align="center"
    justify="center"
    class="rounded mb-7 mx-1"
    style="border: thin solid rgba(255, 255, 255, 0.12); width: 100%"
  >
    <v-col
      v-for="index in tupleValues.length"
      :key="index"
      cols="12"
    >
      <v-row>
        <v-col cols="11">
          <CLValueInput
            @value="tupleValues[index-1] = $event; $emit('value', tupleValues)"
          />
        </v-col>
        <v-col cols="1">
          <v-btn
            class="rounded-xl"
            color="primary"
            fab
            dark
            small
            :disabled="tupleValues.length === 1"
            @click="removeTuple(index - 1)"
          >
            <v-icon>
              mdi-minus
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
        :disabled="tupleValues.length === 3"
        @click="addTupleValue()"
      >
        <v-icon>
          mdi-plus
        </v-icon>
      </v-btn>
    </v-col>
  </v-row>
</template>

<script>

export default {
  name: 'CLValueTupleInput',
  props: {
    clType: {
      required: false,
      default: null,
      type: String,
    },
  },
  data() {
    return {
      tupleValues: [''],
    };
  },
  methods: {
    addTupleValue() {
      if (this.tupleValues.length < 3) {
        this.tupleValues.push('');
      }
    },
    removeTuple(index) {
      if (this.tupleValues.length > 1) {
        this.tupleValues.splice(index, 1);
      }
    },
  },
};
</script>
