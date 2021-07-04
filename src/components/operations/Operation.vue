<template>
  <v-container
      fill-height
      class="flex-column container__small"
  >
    <v-card
        width="100%"
        class="align-center rounded-xl secondary"
    >
      <v-card-title
          class="align-center"
      >
        <v-avatar

            color="primary"
            size="52"
        >
          <v-icon>{{ icon }}</v-icon>
        </v-avatar>
        <v-card-title class="pl-4">{{ title }}</v-card-title>
      </v-card-title>
      <v-form
          ref="form"
          lazy-validation
      >
        <v-card-text class="text-body-1">
          <slot/>
        </v-card-text>

        <v-card-actions class="pa-4">
          <OperationDialog :transaction-on-going="transactionOnGoing" @openPopup="this.transactionOnGoing = true"/>
        </v-card-actions>
      </v-form>
    </v-card>
    <OperationResult v-if="signed" :deploy-hash="deployHash" :amount="amount" @finishedOperation="this.transactionOnGoing = false"/>
  </v-container>
</template>

<script>
import OperationResult from "@/components/operations/OperationResult";
import OperationDialog from "@/components/operations/OperationDialog";

export default {
  name: 'Operation',
  components: {OperationDialog, OperationResult},
  props: ['icon', 'title'],
  data() {
    return {
      loadingBalance: false,
      errorBalance: false,
      errorMessagesBalance: [],
      amount: 3,
      balance: null,
      minimumCSPRTransfer: 3,
      transferFee: 10000 / 1000000000,
      transferID: '0',
      address: "",
      signError: false,
      transferError: false,
      transferErrorMessage: "",
      deployHash: null,
      signed: false,
      transactionOnGoing: false,
    }
  },
}
</script>
