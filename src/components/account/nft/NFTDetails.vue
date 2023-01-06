<template>
  <n-f-t-details-base
    :nft-data="nft"
    @closeDetailsBase="$emit('closeDetails')"
  >
    <v-btn
      v-if="nft.burn"
      title="Burned NFT"
      text
      color="red"
      aria-label="burned"
      class="disable-events"
    >
      <v-icon>
        {{ mdiFire }}
      </v-icon>
      Burned
    </v-btn>
    <v-simple-table
      v-if="getCharacteristics.size > 0"
    >
      <tbody>
        <tr>
          <th scope="col">
            Characteristics
          </th>
          <th scope="col">
            Value
          </th>
        </tr>
        <tr
          v-for="[characteristicName, characteristicValue] in getCharacteristics"
          :key="characteristicName"
        >
          <td>{{ capitalizeFirstLetter(characteristicName) }}</td>
          <td
            v-if="typeof characteristicValue !== 'object'
              || Array.isArray(characteristicValue)"
            class="text-break"
          >
            <template v-if="characteristicValue.toString().match(/^http(s)?:\/\//)">
              <a
                :href="characteristicValue.toString()"
                target="_blank"
                rel="noopener"
              >
                Link
              </a>
            </template>
            <template v-else>
              {{ characteristicValue.toString() }}
            </template>
          </td>
          <td
            v-else-if="typeof characteristicValue === 'object'
              && characteristicValue !== null"
            class="text-break"
          >
            <ul>
              <li
                v-for="[k, v] in Object.entries(characteristicValue)"
                :key="k"
              >
                {{ k }}: {{ v }}
              </li>
            </ul>
          </td>
          <td v-else>
            N/A
          </td>
        </tr>
      </tbody>
    </v-simple-table>
    <v-container class="d-flex flex-wrap justify-space-evenly">
      <v-card
        v-for="[attrName, attrValue] in getAttributes"
        :key="attrName"
        class="text-center pt-2 mt-2"
      >
        <v-card-subtitle>
          {{ attrName }}
        </v-card-subtitle>
        <v-card-title>
          {{ attrValue }}
        </v-card-title>
      </v-card>
    </v-container>
  </n-f-t-details-base>
</template>

<script>
import NFTDetailsBase from '@/components/account/nft/NFTDetailsBase.vue';
import { mdiFire } from '@mdi/js';

export default {
  name: 'NFTDetails',
  components: { NFTDetailsBase },
  props: {
    nftData: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      mdiFire,
      nft: this.nftData,
    };
  },
  computed: {
    getCharacteristics() {
      const characteristics = new Map(this.nft.metadata);
      characteristics.delete('description');
      characteristics.delete('name');
      characteristics.delete('image');
      characteristics.delete('token_uri');
      characteristics.delete('attributes');
      characteristics.delete('pictureIpfs');
      characteristics.delete('ipfs_url');
      characteristics.delete('animation_url');
      characteristics.delete('asset');
      return characteristics;
    },
    getAttributes() {
      if (this.nft.metadata?.get('attributes')) {
        if (Array.isArray(this.nft.metadata.get('attributes'))) {
          this.nft.metadata.set('attributes', new Map(this.nft.metadata.get('attributes').map((attr) => [attr.trait_type, attr.value])));
        }
        return this.nft.metadata.get('attributes');
      }
      return undefined;
    },
  },
  watch: {
    nftData: {
      handler: 'refreshData',
      deep: true,
      immediate: true,
    },
  },
  mounted() {
    this.nft = this.nftData;
  },
  methods: {
    capitalizeFirstLetter(string) {
      return string.charAt(0).toUpperCase() + string.slice(1).replaceAll('_', ' ');
    },
    refreshData(val) {
      this.nft = val;
    },
  },
};
</script>

<style scoped>
    .disable-events {
        pointer-events: none;
    }
</style>
