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
          class="mr-4"
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
            :icon="icon"
            :title="submitTitle"
            :operation-on-going="operationOnGoing"
            :send-deploy="sendDeploy"
            :openPopup="openPopup"
            :loading-sign-and-deploy="loadingSignAndDeploy"
            :amount="amount"
            :fee="fee"
            :remaining-balance="remainingBalance"
            @operationCanceled="operationOnGoing = false"
          />
        </v-card-actions>
      </v-form>
    </v-card>
    <OperationResult
      v-if="deployHash !== ''"
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
        deployHash: {
            required: true,
            type: String,
            default: ""
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
