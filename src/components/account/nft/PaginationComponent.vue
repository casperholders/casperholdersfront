<template>
  <v-row class="mt-2">
    <v-col
      cols="12"
      sm="9"
    >
      <nav>
        <ul
          class="d-inline-flex justify-space-between w-100"
          style="list-style: none"
        >
          <li>
            <v-btn
              :aria-current="value <= 1 ? 'true' : 'false'"
              title="First page"
              icon
              variant="text"
              :disabled="value <= 1"
              style="border-radius: 4px !important;"
              @click="model=1"
            >
              <v-icon>mdi-chevron-double-left</v-icon>
            </v-btn>
          </li>
          <li>
            <v-btn
              :aria-current="value <= 1 ? 'true' : 'false'"
              title="Previous page"
              icon
              variant="text"
              :disabled="value <= 1"
              style="border-radius: 4px !important;"
              @click="model--"
            >
              <v-icon>mdi-chevron-left</v-icon>
            </v-btn>
          </li>
          <li>
            <v-btn
              aria-current="true"
              icon
              variant="text"
              style="border-radius: 4px !important;"
            >
              {{ value }}
            </v-btn>
          </li>
          <li>
            <v-btn
              :aria-current="value >= max ? 'true' : 'false'"
              title="Next page"
              icon
              variant="text"
              :disabled="value >= max"
              style="border-radius: 4px !important;"
              @click="model++"
            >
              <v-icon>mdi-chevron-right</v-icon>
            </v-btn>
          </li>
          <li>
            <v-btn
              :aria-current="value >= max ? 'true' : 'false'"
              title="Last page"
              icon
              variant="text"
              :disabled="value >= max"
              style="border-radius: 4px !important;"
              @click="model=max"
            >
              <v-icon>mdi-chevron-double-right</v-icon>
            </v-btn>
          </li>
        </ul>
      </nav>
    </v-col>
    <v-col
      cols="12"
      sm="3"
      class="my-auto"
    >
      <v-text-field
        v-model="searchPage"
        label="Go-to"
        type="number"
        min="1"
        :max="max"
        :append-inner-icon="'mdi-arrow-right'"
        density="compact"
        color="fff"
        :hint="`Page 1-${max}`"
        persistent-hint
        required
        :on-click:append-inner="setPage"
        @keydown.enter="setPage"
      />
    </v-col>
  </v-row>
</template>

<script>
export default {
  name: 'PaginationComponent',
  props: {
    max: {
      type: Number,
      required: true,
      default: 1,
    },
    value: {
      type: Number,
      required: true,
      default: 1,
    },
  },
  emits: ['update:modelValue'],
  data() {
    return {
      searchPage: '',
    };
  },
  computed: {
    model: {
      get() {
        return this.value;
      },
      set(value) {
        this.$emit('input', value);
      },
    },
  },
  methods: {
    setPage() {
      if (Math.trunc(this.searchPage) < 1) {
        this.model = 1;
      } else if (Math.trunc(this.searchPage) > this.max) {
        this.model = this.max;
      } else {
        this.model = Math.trunc(this.searchPage);
      }
      this.searchPage = '';
    },
  },
};
</script>
