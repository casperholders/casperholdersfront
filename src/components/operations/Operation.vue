<template>
  <v-container
    class="flex-column container__small"
    fill-height
  >
    <v-card
      class="align-center rounded-xl secondary"
      width="100%"
    >
      <v-card-title
        class="align-center"
      >
        <v-avatar
          class="mr-4"
          color="primary"
          size="52"
        >
          <v-icon>{{ icon }}</v-icon>
        </v-avatar>
        {{ title }}
      </v-card-title>
      <v-form
        ref="form"
        lazy-validation
      >
        <v-card-text class="text-body-1">
          <slot />
        </v-card-text>

        <v-card-actions class="pa-4">
          <OperationDialog
            :amount="amount"
            :fee="fee"
            :icon="icon"
            :loading-sign-and-deploy="loadingSignAndDeploy"
            :openPopup="openPopup"
            :operation-on-going="operationOnGoing"
            :remaining-balance="remainingBalance"
            :send-deploy="sendDeploy"
            :title="submitTitle"
            @operationCanceled="operationOnGoing = false"
          />
        </v-card-actions>
      </v-form>
    </v-card>
    <OperationResult
      v-for="operation in filteredOperations"
      :key="operation.hash"
      :deploy-hash="operation.hash"
    />
  </v-container>
</template>

<script>
import OperationResult from "@/components/operations/OperationResult";
import OperationDialog from "@/components/operations/OperationDialog";

/**
 * This component is used on every page that needs to perform an operation on the network.
 * The component have three main parts :
 * - The slot : It's where the content of the form will be added
 * - The OperationDialog component : Used to display a confirmation dialog to the user before signing & sending operation on the network
 * - The OperationResult component : Used to display all the operation of the type set in the prop "type"
 */
export default {
    name: 'Operation',
    components: {OperationDialog, OperationResult},
    props: {
        /**
         * The icon of the operation
         */
        icon: {
            required: true,
            type: String,
            default: ""
        },
        /**
         * The title of the operation
         */
        title: {
            required: true,
            type: String,
            default: ""
        },
        /**
         * The type of the operation. Must be the value of the getName() value of a DeployResult object
         */
        type: {
            required: true,
            type: String
        },
        /**
         * Text of the submit button that open the OperationDialog component
         */
        submitTitle: {
            required: true,
            type: String,
            default: ""
        },
        /**
         * Function to use when the user confirm the operation. At the end the operation must be sent to the casper blockchain.
         */
        sendDeploy: {
            required: true,
            type: Function
        },
        /**
         * Used to know if the Deploy is being signed & deployed.
         */
        loadingSignAndDeploy: {
            required: true,
            type: Boolean,
            default: false
        },
        /**
         * Amount to be displayed in the OperationDialog
         */
        amount: {
            required: true,
        },
        /**
         * Fee to be displayed in the OperationDialog
         */
        fee: {
            required: true,
            type: Number,
            default: 0
        },
        /**
         * Remaining balance to be displayed in the OperationDialog
         */
        remainingBalance: {
            required: true,
            type: Number,
            default: 0
        }
    },
    data() {
        return {
            operationOnGoing: false,
        }
    },
    mounted() {
      /**
       * When we receive the event operationFinished we set the operationOnGoing to false to enable the button to do another operation
       */
      this.$root.$on('operationFinished', () => {
            this.operationOnGoing = false;
        })
    },
    computed: {
      /**
       * Retrieve all the DeployResult of the type set in the type prop of the component
       * @returns {*}
       */
        filteredOperations() {
            return this.$store.getters.filterOperations(this.type).map(object => ({...object}));
        }
    },
    methods: {
      /**
       * Open the OperationDialog and disable underlying buttons to make sure the user don't send the same operation multiple times
       * @param on
       * @param event
       */
        openPopup(on, event) {
            if (this.$refs.form.validate()) {
                on.click(event);
                this.operationOnGoing = true
                this.$root.$emit("operationOnGoing");
            }
        },
    }
}
</script>
