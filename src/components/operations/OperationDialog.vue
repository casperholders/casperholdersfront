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
        :loading="operationOnGoing"
        :disabled="operationOnGoing"
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
          color="secondary"
          class="rounded-xl"
          @click="closePopup"
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
            type: [Number, String],
            default: 0
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