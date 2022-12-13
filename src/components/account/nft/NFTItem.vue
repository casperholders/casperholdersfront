<template>
  <v-dialog
    v-model="dialog"
    transition="dialog-transition"
    content-class="container__small"
  >
    <template #activator="dialogActivator">
      <v-hover
        v-slot="{ hover }"
        open-delay="200"
      >
        <v-card
          color="background"
          class="mt-5 fill-height position-relative"
          min-width="200"
          max-width="200"
          min-height="200"
          max-height="200"
          @focus="hover = true"
          @blur="hover = false"
        >
          <v-img
            v-if="!getAnimation"
            cover
            min-width="200"
            max-width="200"
            min-height="200"
            max-height="200"
            :src="getImage"
          />
          <video
            v-if="getAnimation"
            autoplay
            loop
            muted
            :src="getAnimation"
            style="min-height: 200px; min-width: 200px; max-height: 200px; max-width: 200px;"
          />

          <v-fade-transition>
            <v-overlay
              v-if="hover"
              absolute
            >
              <v-sheet
                min-width="200"
                max-width="200"
                min-height="200"
                max-height="200"
                color="rgb(0,0,0,0.8)"
              >
                <v-card-title class="text-white">
                  {{ getName }}
                </v-card-title>
                <v-card-subtitle
                  v-if="getDescription"
                  class="text-wrap text-white"
                  style="max-height: 40%"
                >
                  {{ getDescription }}
                </v-card-subtitle>
                <v-spacer />
                <v-card-actions class="justify-center">
                  <v-btn
                    title="Open NFT"
                    icon
                    color="white"
                    aria-label="expand"
                    v-bind="dialogActivator.attrs"
                    v-on="dialogActivator.on"
                  >
                    <v-icon>
                      mdi-arrow-expand-all
                    </v-icon>
                  </v-btn>
                </v-card-actions>
                <v-spacer />
              </v-sheet>
            </v-overlay>
          </v-fade-transition>
        </v-card>
      </v-hover>
    </template>

    <v-card>
      <v-row no-gutters>
        <v-col
          cols="12"
          md="6"
        >
          <v-img
            v-if="!getAnimation"
            cover
            :src="getImage"
          />
          <div
            v-if="getAnimation"
            class="fill-height"
          >
            <video
              v-if="getAnimation"
              controls
              style="height: 100%; width: 100%; margin-bottom: -7px;"
            >
              <source
                :src="getAnimation"
              >
            </video>
          </div>
        </v-col>
        <v-col
          cols="12"
          md="6"
        >
          <v-row
            class="mt-1"
            no-gutters
          >
            <v-col
              cols="auto"
              class="mr-auto"
              style="max-width: 74%"
            >
              <v-card-title class="text-wrap">
                {{ getName }}
              </v-card-title>
              <v-card-subtitle class="text-wrap">
                {{ getDescription }}
              </v-card-subtitle>
            </v-col>
            <v-col
              cols="auto"
              class="d-flex mr-4 my-auto"
            >
              <v-btn
                title="Close NFT"
                text
                icon
                color="background"
                @click="dialog = false"
              >
                <v-icon>
                  mdi-close
                </v-icon>
              </v-btn>
            </v-col>
          </v-row>
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
        </v-col>
      </v-row>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'NFTItem',
  props: {
    nftData: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      dialog: false,
      nft: this.nftData,
    };
  },
  computed: {
    getImage() {
      if (this.nft.loading === false) {
        if (this.nft.metadata?.get('image')) {
          const image = this.nft.metadata.get('image').replace('ipfs://', 'https://gateway.ipfs.io/ipfs/');
          return image.match(/^http(s)*:\/\//) ? image : `https://gateway.ipfs.io/ipfs/${image}`;
        }
        if (this.nft.metadata?.get('ipfs_url')) {
          return this.nft.metadata.get('ipfs_url').replace('ipfs://', 'https://gateway.ipfs.io/ipfs/');
        }
        if (this.nft.metadata?.get('pictureIpfs')) {
          return `https://gateway.ipfs.io/ipfs/${this.nft.metadata.get('pictureIpfs').replace('ipfs://', '')}`;
        }
        if (this.nft.metadata?.get('asset') && !this.nft.metadata?.get('asset').match(/\.json$/)) {
          return this.nft.metadata.get('asset').replace('ipfs://', 'https://gateway.ipfs.io/ipfs/');
        }
        if (this.getAnimation) {
          return '/movie-open.svg';
        }
      }
      return '/image-off.svg';
    },
    getAnimation() {
      if (this.nft) {
        if (this.nft.metadata?.get('animation_url')) {
          return this.nft.metadata.get('animation_url').replace('ipfs://', 'https://gateway.ipfs.io/ipfs/');
        }
      }
      return null;
    },
    getName() {
      if (this.nft.metadata?.get('name')) {
        return this.nft.metadata.get('name');
      }
      return this.nft.token_id;
    },
    getDescription() {
      if (this.nft.metadata?.get('description')) {
        return this.nft.metadata.get('description');
      }
      if (this.nft.metadata?.get('name')) {
        return this.nft.token_id;
      }
      return this.nft.metadata?.get('name');
    },
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
