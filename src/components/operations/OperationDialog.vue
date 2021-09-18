<template>
  <v-dialog
    v-model="confirmDialog"
    max-width="500"
    persistent
  >
    <template #activator="{ on, attrs }">
      <v-btn
        id="submitOperation"
        v-bind="attrs"
        :disabled="operationOnGoing"
        :loading="operationOnGoing"
        class="rounded-xl"
        color="primary"
        dark
        large
        @click="openPopup(on,$event)"
      >
        <v-icon left>
          {{ icon }}
        </v-icon>
        {{ title }}
      </v-btn>
    </template>
    <v-card
      class="rounded-xl primary"
    >
      <v-card-title class="text-h5">
        Confirmation
      </v-card-title>
      <v-card-subtitle>
        Please confirm the following information before signing and sending the operation.
      </v-card-subtitle>
      <v-card-text class="text-body-1">
        Amount : {{ amount }} CSPR<br>
        Fee : {{ fee }} CSPR<br>
        Remaining funds after operation : {{ remainingBalance }} CSPR<br>
      </v-card-text>
      <v-card-actions class="pa-5">
        <v-btn
          class="rounded-xl"
          color="secondary"
          @click="closePopup"
        >
          Disagree
        </v-btn>
        <v-btn
          id="agreeAndSign"
          :loading="loadingSignAndDeploy"
          class="rounded-xl ml-5"
          color="quaternary"
          @click="sendDeploy"
        >
          Agree & Sign
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
/**
 * Generic dialog to confirm the Operation before signing & sending it on the blockchain
 */
export default {
  name: 'OperationDialog',
  props: {
    /**
     * Icon of the dialog
     */
    icon: {
      required: true,
      type: String,
      default: '',
    },
    /**
     * Title of the dialog
     */
    title: {
      required: true,
      type: String,
      default: '',
    },
    /**
     * Disable / Enable the button to open the popup
     */
    operationOnGoing: {
      required: true,
      type: Boolean,
      default: false,
    },
    /**
     * Function executed when the user confirm the operation
     */
    sendDeploy: {
      required: true,
      type: Function,
    },
    /**
     * Function executed when the user click on the button that open the popup.
     * Extracted in the Operation component.
     */
    openPopup: {
      required: true,
      type: Function,
    },
    /**
     * Used to disable the confirm button of the popup when the user confirm the operation
     */
    loadingSignAndDeploy: {
      required: true,
      type: Boolean,
      default: false,
    },
    /**
     * Amount to be displayed
     */
    amount: {
      required: true,
      type: String,
      default: '0',
    },
    /**
     * Amount to be displayed
     */
    fee: {
      required: true,
      type: Number,
      default: 0,
    },
    /**
     * Remaining balance to be displayed
     */
    remainingBalance: {
      required: true,
      type: Number,
      default: 0,
    },
  },
  data() {
    /**
     * Used to open or close the popup
     */
    return {
      confirmDialog: false,
    };
  },
  mounted() {
    this.$root.$on('closeOperationDialog', () => {
      this.confirmDialog = false;
    });
  },
  methods: {
    closePopup() {
      this.$emit('operationCanceled');
      this.confirmDialog = false;
    },
  },
};
</script>

<style scoped>

</style>
