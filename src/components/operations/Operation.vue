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
          <slot />
        </v-card-text>

        <v-card-actions class="pa-4">
          <OperationDialog
            :icon="icon"
            :title="submitTitle"
            :operation-on-going="operationOnGoing"
            :send-deploy="sendDeploy"
            :openPopup="openPopup"
            :loading-sign-and-deploy="loadingSignAndDeploy"
            :error-deploy="errorDeploy"
            :error-deploy-message="errorDeployMessage"
            :amount="amount"
            :fee="fee"
            :remaining-balance="remainingBalance"
            :disabled-operation="disabledOperation"
            @operationCanceled="operationOnGoing = false"
          />
        </v-card-actions>
      </v-form>
    </v-card>
    <OperationResult
      v-if="signed"
      :deploy-hash="deployHash"
      :amount="amount"
      @finishedOperation="operationOnGoing = false"
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
        errorDeploy: {
            required: true,
            type: Boolean,
            default: false
        },
        errorDeployMessage: {
            required: true,
            type: String,
            default: ""
        },
        signed: {
            required: true,
            type: Boolean,
            default: false
        },
        deployHash: {
            required: true,
            type: String,
            default: ""
        },
        errorBalance: {
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
    computed: {
        disabledOperation() {
            return this.errorBalance || this.operationOnGoing;
        }
    },
    methods: {
        openPopup(on, event) {
            if (this.$refs.form.validate()) {
                on.click(event);
                this.operationOnGoing = true
            }
        },
    }
}
</script>
