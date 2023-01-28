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
          Track new NFT
        </v-card-title>
        <v-card-text>
          <token-input
            v-model="token"
            :multiple="true"
            data-cy="token-input"
            :only-groups="['nftcep78', 'nftcep47']"
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
            data-cy="nft-add-submit"
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
  name: 'AddNFTDialog',
  components: { TokenInput },
  data: () => ({
    dialog: false,
    token: [],
  }),
  methods: {
    onSubmit() {
      if (this.token.length) {
        this.$emit('add', this.token);
      }

      this.dialog = false;
      this.token = [];
    },
    onCancel() {
      this.dialog = false;
      this.token = [];
    },
  },
};
</script>
