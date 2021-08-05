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

export default {
    name: 'Operation',
    components: {OperationDialog, OperationResult},
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
        type: {
            required: true,
            type: String
        },
        submitTitle: {
            required: true,
            type: String,
            default: ""
        },
        sendDeploy: {
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
        }
    },
    data() {
        return {
            operationOnGoing: false,
        }
    },
    mounted() {
        this.$root.$on('operationFinished', () => {
            this.operationOnGoing = false;
        })
    },
    computed: {
        filteredOperations() {
            return this.$store.getters.filterOperations(this.type).map(object => ({...object}));
        }
    },
    methods: {
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
