<template>
  <v-dialog
    v-model="dialog"
    width="500"
  >
    <template #activator="props">
      <slot
        name="activator"
        v-bind="props"
      />
    </template>
    <v-form @submit.prevent="onSubmit">
      <v-card>
        <v-card-title>
          Track new ERC20 token
        </v-card-title>
        <v-card-text>
          <token-input
            v-model="token"
            data-cy="token-input"
            :only-groups="['erc20']"
            no-default
            hide-details
          />
        </v-card-text>
        <v-card-actions class="justify-space-between">
          <v-btn
            rounded
            text
            @click="onCancel"
          >
            Cancel
          </v-btn>
          <v-btn
            data-cy="erc20-add-submit"
            type="submit"
            color="primary"
            rounded
          >
            Track token
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-form>
  </v-dialog>
</template>

<script>
import TokenInput from '@/components/forms/inputs/TokenInput';

export default {
  name: 'AddErc20TokenDialog',
  components: { TokenInput },
  data: () => ({
    dialog: false,
    token: undefined,
  }),
  methods: {
    onSubmit() {
      if (this.token) {
        this.$emit('add', this.token);
      }

      this.dialog = false;
      this.token = undefined;
    },
    onCancel() {
      this.dialog = false;
      this.token = undefined;
    },
  },
};
</script>
