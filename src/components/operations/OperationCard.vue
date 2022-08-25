<template>
  <div>
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
        <v-chip
          v-if="beta"
          outlined
          class="ma-2"
        >
          <v-icon left>
            mdi-fire
          </v-icon>
          Beta
        </v-chip>
      </v-card-title>
      <v-form
        ref="form"
        lazy-validation
      >
        <v-card-text class="text-body-1">
          <slot />
          <v-alert
            v-if="!internet & !sendDeployDisconnected & signerType !== TORUS_SIGNER"
            class="mt-5"
            type="warning"
            prominent
            border="left"
          >
            You are disconnect from internet and
            have disabled sending deploy when you're offline.<br>
            You can change this settings <a href="/settings"> here</a>.
          </v-alert>
          <v-alert
            v-if="!internet & signerType === TORUS_SIGNER"
            class="mt-5"
            type="warning"
            prominent
            border="left"
          >
            You are disconnect from internet and
            connected with the <strong>Tor.us</strong> wallet.<br>
            Tor.us wallet is <strong>not compatible</strong> with offline use.
            You'll be able to send operations when you will get back online.
          </v-alert>
          <v-alert
            v-if="!internet & sendDeployDisconnected & signerType !== TORUS_SIGNER"
            class="mt-5"
            type="warning"
            prominent
            border="left"
          >
            You are disconnect from internet and have <strong>ENABLED</strong>
            sending deploy when you are offline.<br>
            We can't verify your balance before sending the deploy
            so it may fail when you get back online<br>
            You can change this settings <a href="/settings"> here</a>.
          </v-alert>
        </v-card-text>

        <v-card-actions class="pa-4">
          <OperationDialog
            :icon="icon"
            :loading-sign-and-deploy="loadingSignAndDeploy"
            :open-popup="openPopup"
            :operation-on-going="operationOnGoing"
            :send-deploy="sendDeploy"
            :title="submitTitle"
            :balance="balance"
            :token-balance="tokenBalance"
            :token="token"
            :fee="fee"
            :amount="amount"
            :prepend-values="prependValues"
            :append-values="appendValues"
            @operationCanceled="operationOnGoing = false"
          />
        </v-card-actions>
      </v-form>
    </v-card>
    <OperationResult
      v-for="operation in [...filteredOperations].reverse()"
      :key="operation.hash"
      :deploy-hash="operation.hash"
    />
    <OperationPending v-if="offlineDeploys.length > 0" />
    <OperationPendingWeight v-if="weightedDeploys.length > 0" />
  </div>
</template>

<script>
import OperationDialog from '@/components/operations/OperationDialog';
import OperationPending from '@/components/operations/OperationPending';
import OperationPendingWeight from '@/components/operations/OperationPendingWeight';
import OperationResult from '@/components/operations/OperationResult';
import { TORUS_SIGNER } from '@/helpers/signers';
import nativeToken from '@/services/tokens/nativeToken';
import { mapState } from 'vuex';

/**
 * This component is used on every page that needs to perform an operation on the network.
 * The component have three main parts :
 * - The slot : It's where the content of the form will be added
 * - The OperationDialog component : Used to display a confirmation dialog
 *   to the user before signing & sending operation on the network
 * - The OperationResult component : Used to display all the operation
 *   of the type set in the prop "type"
 */
export default {
  name: 'OperationCard',
  components: { OperationPendingWeight, OperationPending, OperationDialog, OperationResult },
  props: {
    /**
     * The icon of the operation
     */
    icon: {
      required: true,
      type: String,
      default: '',
    },
    /**
     * The title of the operation
     */
    title: {
      required: true,
      type: String,
      default: '',
    },
    /**
     * The type of the operation. Must be the value of the getName() value of a DeployResult object
     */
    type: {
      required: true,
      type: String,
    },
    /**
     * Text of the submit button that open the OperationDialog component
     */
    submitTitle: {
      required: true,
      type: String,
      default: '',
    },
    /**
     * Function to use when the user confirm the operation.
     * At the end the operation must be sent to the casper blockchain.
     */
    sendDeploy: {
      required: true,
      type: Function,
    },
    /**
     * Used to know if the Deploy is being signed & deployed.
     */
    loadingSignAndDeploy: {
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
    beta: {
      required: false,
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      operationOnGoing: false,
      TORUS_SIGNER,
    };
  },
  computed: {
    ...mapState([
      'internet',
      'offlineDeploys',
      'weightedDeploys',
      'signerType',
    ]),
    /**
     * Retrieve all the DeployResult of the type set in the type prop of the component
     * @returns {*}
     */
    filteredOperations() {
      return this.$store.getters.filterOperations(this.type).map((object) => ({ ...object }));
    },
    sendDeployDisconnected() {
      return localStorage.sendDeployDisconnected === 'true';
    },
  },
  mounted() {
    /**
     * When we receive the event operationFinished we set the operationOnGoing
     * to false to enable the button to do another operation
     */
    this.$root.$on('operationFinished', () => {
      this.operationOnGoing = false;
    });
  },
  methods: {
    /**
     * Open the OperationDialog and disable underlying buttons to make sure
     * the user don't send the same operation multiple times
     * @param on
     * @param event
     */
    openPopup(on, event) {
      if (this.$refs.form.validate()) {
        on.click(event);
        this.operationOnGoing = true;
        this.$root.$emit('operationOnGoing');
      }
    },
  },
};
</script>
