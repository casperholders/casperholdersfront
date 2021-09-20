<template>
  <v-slide-y-transition
    tag="div"
    leave-absolute
  >
    <div
      v-show="!minified"
      class="text-overline text-truncate pl-4 pr-2 pt-2"
    >
      <slot />
    </div>
  </v-slide-y-transition>
</template>

<script>
export default {
  name: 'NavigationDrawerListHeader',
  props: {
    minified: {
      type: Boolean,
      default: false,
    },
  },
};
</script>
