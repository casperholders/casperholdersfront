<template>
  <div class="card-horizontal-list__scroller">
    <div class="card-horizontal-list d-flex py-4 px-6 overflow-x-auto">
      <slot />
    </div>
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
  .card-horizontal-list__scroller {
    position: relative;

    .card-horizontal-list {

      :deep(> :not(:first-child)) {
        margin-left: 16px;
      }
    }

    &:after {
      content: "";
      position: absolute;
      top: 0;
      bottom: 0;
      right: 0;
      width: 24px;
      background: linear-gradient(90deg, transparent, var(--v-secondary-base));
    }
  }
</style>
