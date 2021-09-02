<template>
  <v-dialog
    v-model="confirmDialog"
    max-width="500"
    persistent
  >
    <template v-slot:activator="{ on, attrs }">
      <v-btn
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
        Amount : {{ amount }} CSPR<br />
        Fee : {{ fee }} CSPR<br />
        Remaining funds after operation : {{ remainingBalance }} CSPR<br />
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

export default {
    name: "OperationDialog",
    props: {
        icon: {
            required: true,
            type: String,
            default: ""
        },
        title: {
            required: true,
            type: String,
            default: ""
        },
        operationOnGoing: {
            required: true,
            type: Boolean,
            default: false
        },
        sendDeploy: {
            required: true,
            type: Function
        },
        openPopup: {
            required: true,
            type: Function
        },
        loadingSignAndDeploy: {
            required: true,
            type: Boolean,
            default: false
        },
        amount: {
            required: true,
            type: String,
            default: "0"
        },
        fee: {
            required: true,
            type: Number,
            default: 0
        },
        remainingBalance: {
            required: true,
            type: Number,
            default: 0
        },
    },
    data() {
        return {
            confirmDialog: false,
        }
    },
    mounted() {
        this.$root.$on('closeOperationDialog', () => {
            this.confirmDialog = false;
        })
    },
    methods: {
        closePopup() {
            this.$emit("operationCanceled")
            this.confirmDialog = false
        }
    }
}
</script>

<style scoped>

</style>