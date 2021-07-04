<template>
  <v-dialog
      v-model="confirmDialog"
      persistent
      max-width="500"
  >
    <template v-slot:activator="{ on, attrs }">
      <v-btn
          color="primary"
          dark
          v-bind="attrs"
          @click="openPopup(on,$event)"
          large
          class="rounded-xl"
          :loading="transactionOnGoing"
          :disabled="isTransactionOnGoing || errorBalance"
      >
        <v-icon left>
          mdi-send
        </v-icon>
        Send Transaction
      </v-btn>
    </template>
    <v-card
        class="rounded-xl primary"
    >
      <v-card-title class="text-h5">
        Transfer Confirmation
      </v-card-title>
      <v-card-subtitle>
        Please confirm the following information before signing and sending the transfer.
      </v-card-subtitle>
      <v-card-text class="text-body-1">
        Amount : {{ amount }} CSPR<br/>
        Transfer fee : {{ transferFee }} CSPR<br/>
        Remaining funds after transfer : {{ remainingBalance }} CSPR<br/>
      </v-card-text>
      <v-card-text v-if="signError">
        <v-icon color="red">mdi-alert-circle</v-icon>
        Oops... A problem as occured. Please retry to sign or check the transfer values.
      </v-card-text>
      <v-card-actions class="pa-5">
        <v-btn
            color="secondary"
            class="rounded-xl"
            @click="transactionOnGoing = false; confirmDialog = false"
        >
          Disagree
        </v-btn>
        <v-btn
            color="quaternary"
            class="rounded-xl ml-5"
            @click="sendDeploy"
            :loading="loadingSignAndDeploy"
        >
          Agree & Sign
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: "OperationDialog",
  props: ['transactionOnGoing', 'sendDeploy'],
  data() {
    return {
      loadingSignAndDeploy: false,
      confirmDialog: false,
    }
  },
  computed: {
    isTransactionOnGoing() {
      if (!this.transactionOnGoing) {
        return
      }
      return "disabled"
    },
  },
  methods: {
    openPopup(on, event) {
      //TODO check if possible from child component and still necessary since the form use lazy-validation
      //if (this.$refs.form.validate()) {
        on.click(event);
        this.$emit('openPopup');
      //}
    },
  }
}
</script>

<style scoped>

</style>