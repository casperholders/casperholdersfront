<template>
  <v-card
    color="primary"
    class="d-flex flex-column"
  >
    <v-card-text>
      <div class="d-flex align-center text-overline">
        <v-avatar
          v-if="icon"
          color="secondary"
          size="32"
          class="my-1 mr-3"
        >
          <v-icon>
            {{ icon }}
          </v-icon>
        </v-avatar>
        <v-avatar
          v-else
          color="secondary"
          size="32"
          class="my-1 mr-3"
        >
          <v-icon dark>
            mdi-help
          </v-icon>
        </v-avatar>
        <span
          class="text-truncate font-weight-bold"
          style="font-size: 1.5em"
        >
          <template v-if="githubUrl !== ''">
            <a
              :href="githubUrl"
              target="_blank"
              rel="noopener"
            >
              {{ title }}
              <v-icon x-small>mdi-open-in-new</v-icon>
            </a>
          </template>
          <template v-else>
            {{ title }}
          </template>
        </span>
      </div>
      <div>
        {{ description }}
      </div>
    </v-card-text>
    <slot name="actions" />
  </v-card>
</template>

<script>
export default {
  name: 'ContractCard',
  props: {
    icon: {
      type: String,
      default: undefined,
    },
    title: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    githubUrl: {
      type: String,
      default: '',
    },
  },
};
</script>
