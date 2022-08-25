<template>
  <v-sheet
    style="background: transparent !important;"
    color="white"
    outlined
    rounded
    large
  >
    <v-list-item :to="to">
      <v-list-item-icon>
        <v-icon v-text="icon" />
      </v-list-item-icon>
      <v-list-item-content>
        <v-list-item-title v-text="title" />
        <v-list-item-subtitle v-text="subtitle" />
      </v-list-item-content>
    </v-list-item>
  </v-sheet>
</template>

<script>
export default {
  name: 'CardQuickLink',
  props: {
    to: {
      required: true,
      type: [String, Object],
    },
    icon: {
      required: true,
      type: String,
    },
    title: {
      required: true,
      type: String,
    },
    subtitle: {
      required: true,
      type: String,
    },
  },
};
</script>
