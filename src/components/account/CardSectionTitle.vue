<template>
  <div class="d-flex align-center text-overline px-6 py-4">
    <v-icon
      left
    >
      {{ icon }}
    </v-icon>
    {{ title }}
    <slot name="action" />
  </div>
</template>

<script>
export default {
  name: 'CardSectionTitle',
  props: {
    icon: {
      required: true,
      type: String,
    },
    title: {
      required: true,
      type: String,
    },
  },
};
</script>
