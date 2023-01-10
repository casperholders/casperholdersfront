<template>
  <v-row
    class="mb-3"
    style="border: thin solid rgba(255, 255, 255, 0.12)"
  >
    <v-col cols="12">
      <span class="text-h6">
        {{ name }}
      </span>
    </v-col>
    <v-col
      cols="12"
      md="6"
    >
      <v-menu
        v-model="dateMenu"
        :close-on-content-click="false"
        :nudge-right="40"
        transition="scale-transition"
        offset-y
        min-width="auto"
      >
        <template #activator="{ on, attrs }">
          <v-text-field
            v-model="date"
            label="Date"
            :prepend-icon="mdiCalendar"
            readonly
            color="white"
            v-bind="attrs"
            v-on="on"
          />
        </template>
        <v-date-picker
          v-model="date"
          scrollable
          color="grey"
          :min="minDate"
          @input="dateMenu = false"
        />
      </v-menu>
    </v-col>
    <v-col
      cols="12"
      md="6"
    >
      <v-menu
        ref="timeMenu"
        v-model="timeMenu"
        :close-on-content-click="false"
        :nudge-right="40"
        :return-value.sync="time"
        transition="scale-transition"
        offset-y
        max-width="290px"
        min-width="290px"
      >
        <template #activator="{ on, attrs }">
          <v-text-field
            v-model="time"
            label="Time"
            color="white"
            :prepend-icon="mdiClockTimeFourOutline"
            readonly
            v-bind="attrs"
            v-on="on"
          />
        </template>
        <v-time-picker
          v-if="timeMenu"
          v-model="time"
          full-width
          scrollable
          format="24hr"
          color="grey"
          :min="minTime"
          @click:minute="$refs.timeMenu.save(time)"
        />
      </v-menu>
    </v-col>
  </v-row>
</template>

<script>
import { mdiCalendar, mdiClockTimeFourOutline } from '@mdi/js';

const currentDate = new Date(Date.now() + (60 * 1000));

export default {
  name: 'DateTimePicker',
  props: {
    name: {
      type: String,
      required: true,
    },
    min: {
      type: Number,
      required: false,
      default: Date.now(),
    },
  },
  data() {
    return {
      mdiCalendar,
      mdiClockTimeFourOutline,
      dateMenu: false,
      date: currentDate.toISOString().substr(0, 10),
      timeMenu: false,
      minRequirement: this.min,
      time: `${currentDate.getUTCHours() > 9 ? currentDate.getUTCHours() : `0${currentDate.getUTCHours()}`}:${currentDate.getMinutes() > 9 ? currentDate.getMinutes() : `0${currentDate.getMinutes()}`}`,
    };
  },
  computed: {
    currentComputedDate() {
      const initDate = this.minRequirement
        ? this.minRequirement
        : Date.now();
      return new Date(initDate + (60 * 1000));
    },
    minDate() {
      return this.currentComputedDate.toISOString().substring(0, 10);
    },
    minTime() {
      if (this.date !== this.minDate) {
        return undefined;
      }
      return `${this.currentComputedDate.getUTCHours() > 9 ? this.currentComputedDate.getUTCHours() : `0${this.currentComputedDate.getUTCHours()}`}:${this.currentComputedDate.getMinutes() > 9 ? this.currentComputedDate.getMinutes() : `0${this.currentComputedDate.getMinutes()}`}`;
    },
    currentTimestamp() {
      return new Date(`${this.date}T${this.time}:00Z`).getTime();
    },
    minTimestamp() {
      const minTime = `${this.currentComputedDate.getUTCHours() > 9 ? this.currentComputedDate.getUTCHours() : `0${this.currentComputedDate.getUTCHours()}`}:${this.currentComputedDate.getMinutes() > 9 ? this.currentComputedDate.getMinutes() : `0${this.currentComputedDate.getMinutes()}`}`;
      return new Date(`${this.minDate}T${minTime}:00Z`).getTime();
    },
  },
  watch: {
    date: {
      handler: 'emitValue',
      immediate: true,
    },
    time: {
      handler: 'emitValue',
      immediate: true,
    },
    min: {
      handler: 'checkMin',
      immediate: true,
    },
  },
  mounted() {
    this.minRequirement = this.min;
  },
  methods: {
    checkMin(val) {
      this.minRequirement = val;
      if (this.currentTimestamp < this.minTimestamp) {
        this.date = this.minDate;
        this.time = this.minTime;
      }
    },
    emitValue() {
      this.$emit('value', new Date(`${this.date}T${this.time}:00Z`).getTime());
    },
  },
};
</script>
