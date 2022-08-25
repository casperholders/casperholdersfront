<template>
  <div class="card-horizontal-list d-flex overflow-x-auto">
    <slot />
  </div>
</template>

<script>
export default {
  name: 'CardHorizontalList',
};
</script>

<style
  lang="scss"
  scoped
>
  .card-horizontal-list > :not(:first-child) {
    margin-left: 16px;
  }
</style>
