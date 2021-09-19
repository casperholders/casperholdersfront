<template>
  <v-tooltip
    :disabled="!minified"
    right
  >
    <template #activator="{ attrs, on }">
      <v-list-item
        v-bind="{ ...attrs, ...$attrs }"
        v-on="{ ...on, ...$listeners }"
      >
        <slot />
      </v-list-item>
    </template>
    <span v-text="tooltip" />
  </v-tooltip>
</template>

<script>
export default {
  name: 'NavigationDrawerListItem',
  inheritAttrs: false,
  props: {
    tooltip: {
      required: true,
      type: String,
    },
    minified: {
      type: Boolean,
      default: false,
    },
  },
};
</script>
