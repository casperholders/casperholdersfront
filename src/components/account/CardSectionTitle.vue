<template>
  <div class="text-overline px-6 py-4">
    <v-icon v-text="icon" />
    {{ title }}
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
