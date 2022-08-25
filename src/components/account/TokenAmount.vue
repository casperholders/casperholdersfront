<template>
  <span
    :class="{ 'cspr': amount.isAmount }"
    v-text="amount.value"
  />
</template>

<script>
export default {
  name: 'TokenAmount',
  props: {
    amount: {
      required: true,
      type: Object,
    },
  },
};
</script>
