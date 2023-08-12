<template>
  <v-dialog
    v-model="simulateDialog"
    max-width="500"
    persistent
  >
    <template #activator="{ on, attrs }">
      <v-btn
        data-cy="simulateOperation"
        v-bind="attrs"
        :disabled="offline"
        class="rounded-xl ml-3"
        color="primary"
        dark
        large
        v-on="on"
      >
        <v-icon left>
          {{ icon }}
        </v-icon>
        Simulate {{ title }}
      </v-btn>
    </template>
    <v-card
      class="rounded-xl primary"
    >
      <v-card-title class="text-h5">
        Simulation
      </v-card-title>
      <v-card-subtitle>
        You need to sign the deploy to simulate it. It won't be sent to the network for execution.
        The gas fee is set to your max balance to avoid out of gas error
        and to get the real fee of the deploy.
      </v-card-subtitle>
      <v-card-text class="text-body-1 px-3">
        <operation-summary
          :balance="balance"
          :token-balance="tokenBalance"
          :token="token"
          :fee="balance"
          :amount="amount"
          :prepend-values="prependValues"
          :append-values="appendValues"
        />
      </v-card-text>
      <v-card-actions class="pa-5">
        <v-btn
          data-cy="cancelSimulate"
          class="rounded-xl"
          color="secondary"
          @click="closePopup"
        >
          Cancel
        </v-btn>
        <v-btn
          data-cy="simulateAction"
          :loading="loadingSimulate"
          class="rounded-xl ml-5"
          color="quaternary"
          @click="simulateDeploy"
        >
          Simulate
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import OperationSummary from '@/components/operations/OperationSummary';
import { TORUS_SIGNER } from '@/helpers/signers';
import nativeToken from '@/services/tokens/nativeToken';
import { mapState } from 'vuex';

/**
 * Generic dialog to confirm the Operation before signing & sending it on the blockchain
 */
export default {
  name: 'OperationSimulateDialog',
  components: { OperationSummary },
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
     * Function executed when the user confirm the operation
     */
    simulateDeploy: {
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
    loadingSimulate: {
      required: true,
      type: Boolean,
      default: false,
    },
    /**
     * Current native balance.
     */
    balance: {
      required: true,
      type: [String, Number, Object],
    },
    /**
     * Current token balance, if applicable.
     */
    tokenBalance: {
      type: [String, Number, Object],
      default: undefined,
    },
    /**
     * Currently used token.
     */
    token: {
      type: Object,
      default: () => nativeToken,
    },
    /**
     * Applicable fee for operation.
     */
    fee: {
      required: true,
      type: [String, Number, Object],
      default: 0,
    },
    /**
     * Applicable fee for operation.
     */
    amount: {
      type: [String, Number, Object],
      default: undefined,
    },
    /**
     * Prepends confirmation values.
     */
    prependValues: {
      type: Array,
      default: () => [],
    },
    /**
     * Appends confirmation values.
     */
    appendValues: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    /**
     * Used to open or close the popup
     */
    return {
      simulateDialog: false,
    };
  },
  computed: {
    ...mapState([
      'internet',
      'signerType',
    ]),
    offline() {
      return !this.internet && (this.signerType === TORUS_SIGNER || localStorage.sendDeployDisconnected !== 'true');
    },
  },
  mounted() {
    this.$root.$on('closeSimulateDialog', () => {
      this.simulateDialog = false;
    });
  },
  methods: {
    closePopup() {
      this.simulateDialog = false;
    },
  },
};
</script>
