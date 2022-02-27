<template>
  <v-card
    class="align-center rounded-xl secondary"
    width="100%"
  >
    <v-card-title class="align-center">
      <v-avatar
        color="primary"
        size="52"
      >
        <v-icon>mdi-key</v-icon>
      </v-avatar>
      <v-card-title
        class="pl-4"
        style="word-break: break-word"
      >
        Security
      </v-card-title>
    </v-card-title>
    <v-card-text>
      <v-card
        outlined
        elevation="3"
        class="mb-4"
      >
        <v-card-title>
          <v-icon left>
            mdi-shield-key
          </v-icon>
          Threshold settings
        </v-card-title>
        <v-card-text
          class="d-flex align-center"
        >
          <v-row>
            <v-col
              cols="12"
              md="6"
            >
              <v-text-field
                color="white"
                label="Key management threshold"
                type="number"
                min="1"
                value="1"
                :rules="thresholdRules"
                required
              >
                <template #prepend>
                  <v-tooltip
                    bottom
                  >
                    <template #activator="{ on }">
                      <v-icon v-on="on">
                        mdi-help-circle-outline
                      </v-icon>
                    </template>
                    Minimum weight needed to make key management operations
                  </v-tooltip>
                </template>
              </v-text-field>
            </v-col>
            <v-col
              cols="12"
              md="6"
            >
              <v-text-field
                color="white"
                label="Deploy threshold"
                type="number"
                value="1"
                min="1"
                :rules="thresholdRules"
                required
              >
                <template #prepend>
                  <v-tooltip
                    bottom
                  >
                    <template #activator="{ on }">
                      <v-icon v-on="on">
                        mdi-help-circle-outline
                      </v-icon>
                    </template>
                    Minimum weight needed to perform deployments
                  </v-tooltip>
                </template>
              </v-text-field>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
      <v-card
        outlined
        elevation="3"
        class="mb-4"
      >
        <v-card-title>
          <v-icon left>
            mdi-key-chain
          </v-icon>
          Authorized keys
        </v-card-title>
        <v-list>
          <v-list-item
            v-for="(authorizedInput, index) in authorizedInputs"
            :key="index"
          >
            <authorized-key-input
              :data="authorizedInput"
              @update="onUpdate(index, $event)"
              @delete="onDelete(index)"
            />
          </v-list-item>
        </v-list>
        <v-card-actions>
          <v-btn
            class="rounded-xl"
            color="primary"
            dark
            large
            @click="onAdd"
          >
            <v-icon left>
              mdi-plus
            </v-icon>
            Add key
          </v-btn>
        </v-card-actions>
      </v-card>
      <v-card
        outlined
        elevation="3"
        class="mb-4"
      >
        <v-card-title>
          <v-icon left>
            mdi-clipboard-list
          </v-icon>
          Summary
        </v-card-title>
        <v-card-text
          class="d-flex align-center"
        >
        </v-card-text>
      </v-card>
    </v-card-text>
  </v-card>
</template>

<script>

import AuthorizedKeyInput from '../components/operations/AuthorizedKeyInput';

/**
 * Security view
 */
export default {
  name: 'Security',
  components: { AuthorizedKeyInput },
  data() {
    return {
      authorizedInputs: [],
      /**
       * Rules for the threshold fields
       */
      thresholdRules: [
        (a) => !!a || 'Threshold required',
        (a) => a > 0 || 'Threshold must be at least 1',
      ],
    };
  },
  computed: {},
  methods: {
    onAdd() {
      this.authorizedInputs.push({
        publicKey: '',
        weight: 1,
      });
    },
    onUpdate(index, data) {
      Object.keys(data).forEach((key) => {
        this.authorizedInputs[index][key] = data[key];
      });
    },
    onDelete(index) {
      this.authorizedInputs.splice(index, 1);
    },
  },
};
</script>
