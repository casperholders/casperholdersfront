<template>
  <v-row
    align="center"
    justify="center"
  >
    <v-col
      v-if="!hideType"
      cols="12"
    >
      <CLTypeInput
        :cl-type="clType"
        @cltype="type = $event"
      />
    </v-col>
    <v-col
      v-if="isSimpleValue"
      cols="12"
    >
      <CLValueRawInput
        :cl-type="type ? type : clType"
        @value="$emit('value', $event)"
      />
    </v-col>
    <v-row
      v-if="type === 'list'"
      align="center"
      justify="center"
      class="rounded mb-7 mx-1"
      style="border: thin solid rgba(255, 255, 255, 0.12); width: 100%"
    >
      <v-col cols="12">
        <CLTypeInput
          :cl-type="listType"
          @cltype="listValues = []; listValuesType = $event;"
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
              :hide-type="true"
              @value="listValues[index-1] = $event; $emit('value', build(listValues))"
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
                mdi-minus
              </v-icon>
            </v-btn>
          </v-col>
        </v-row>
      </v-col>
      <template v-if="isList">
        <v-col cols="1">
          <v-btn
            class="rounded-xl"
            color="primary"
            fab
            dark
            small
            @click="listValues.push('')"
          >
            <v-icon>
              mdi-plus
            </v-icon>
          </v-btn>
        </v-col>
      </template>
    </v-row>
    <v-row
      v-if="type === 'tuple'"
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
              @value="tupleValues[index-1] = $event; $emit('value', build(tupleValues))"
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
    <v-row
      v-if="type === 'option'"
      align="center"
      justify="center"
      class="rounded mb-7 mx-1"
      style="border: thin solid rgba(255, 255, 255, 0.12); width: 100%"
    >
      <v-col
        cols="12"
      >
        <v-row>
          <v-col cols="2">
            <CLTypeInput
              @cltype="optionType = $event;"
            />
          </v-col>
          <v-col cols="2">
            <v-checkbox
              v-model="isNone"
              color="white"
              label="Is none ?"
              @click="isNone ? $emit('value', build(null)) : false"
            />
          </v-col>
          <v-col
            v-if="!isNone"
            cols="8"
          >
            <CLValueInput
              :cl-type="optionType"
              :hide-type="true"
              :disabled="true"
              @value="$emit('value', build($event))"
            />
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-row>
</template>

<script>
import CLTypeInput from '@/components/operations/CLTypeInput';
import CLValueRawInput from '@/components/operations/CLValueRawInput';
import buildCLValue from '@/helpers/genericCLValueBuilder';
import { CLBool, CLOption, CLString, CLValueBuilder } from 'casper-js-sdk';
import { Some } from 'ts-results';

export default {
  name: 'CLValueInput',
  components: { CLValueRawInput, CLTypeInput },
  props: {
    clType: {
      required: false,
      default: null,
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
      listType: null,
      listValuesType: null,
      listValues: [],
      tupleValues: [''],
      optionType: null,
      isNone: false,
    };
  },
  computed: {
    isSimpleValue() {
      return !['unit', 'option', 'tuple', 'list', 'map'].includes(this.type);
    },
    isList() {
      return this.type === 'list';
    },
  },
  watch: {
    type() {
      this.rawValue = '';
    },
  },
  methods: {
    build(value) {
      console.log('BUILD');
      console.log(this.type);
      const boolOpt = new CLOption(Some(new CLBool(false)));
      const stringOpt = new CLOption(Some(new CLString('test')));
      const listBoolOpt = CLValueBuilder.list([boolOpt]);
      const listStringOpt = CLValueBuilder.list([stringOpt]);
      console.log(listBoolOpt);
      console.log(listStringOpt);
      try {
        const listBoolStringOpt = CLValueBuilder.list([boolOpt, stringOpt]);
        console.log(listBoolStringOpt);
      } catch (e) {
        console.log('Failed to create Option multi type list');
        console.log(e);
      }
      if (Array.isArray(value)) {
        const refType = value[0].clType();
        value.every((i) => {
          console.log(i.clType().toString());
          console.log(i.clType().toString() === refType.toString());
          return i.clType().toString() === refType.toString();
        });
      }
      if (value === null && this.isNone && this.clType === 'option') {
        return buildCLValue(this.type, value, this.optionType);
      }
      return buildCLValue(this.type, value);
    },
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
