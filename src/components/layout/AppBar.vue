<template>
  <v-app-bar
      app
      elevate-on-scroll
      :class="{'appbar__top': isWindowTop}"
      class="appbar"
      v-scroll="onScroll"
  >
    <v-container
        class="d-flex container__small"
        :fluid="$vuetify.breakpoint.mobile"
    >
      <v-toolbar-title
          class="mr-auto"
          style="cursor: pointer"
          @click="$router.push('/')"
      >
        Casper Holders
      </v-toolbar-title>
      <div
          v-show="!$vuetify.breakpoint.mobile"
          v-bind:key="name"
          v-for="(items, name) in links"
      >
        <v-menu offset-y>
          <template v-slot:activator="{ on, attrs }">
            <v-btn
                text
                :ripple="false"
                v-bind="attrs"
                v-on="on"
            >
              {{ name }}
              <v-icon
                  right
                  dark
              >
                mdi-chevron-down
              </v-icon>
            </v-btn>
          </template>
          <v-list
              color="primary"
              style="border-bottom: 5px solid #ff473e !important;"
          >
            <v-list-item
                v-for="item in items"
                :key="item.title"
                :to="item.route"
                link
            >
              <v-list-item-icon>
                <v-icon>{{ item.icon }}</v-icon>
              </v-list-item-icon>

              <v-list-item-content>
                <v-list-item-title>{{ item.title }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-menu>
      </div>
    </v-container>
    <v-app-bar-nav-icon
        v-show="$vuetify.breakpoint.mobile"
        @click.stop="toggleDrawer"
    ></v-app-bar-nav-icon>
  </v-app-bar>
</template>

<script>
export default {
  name: "AppBar",
  props: ['links'],
  data: () => ({
    isWindowTop: true,
  }),
  methods: {
    toggleDrawer() {
      this.$root.$emit('toggleDrawer')
    },
    onScroll() {
      this.isWindowTop = document.documentElement.scrollTop === 0
    }
  }
}
</script>

<style scoped>
.appbar__top {
  background: linear-gradient(90deg, rgba(0, 1, 42, 0.75), rgba(0, 18, 107, 0.75), rgba(255, 71, 62, 0.75)) !important;
}

.appbar {
  background: linear-gradient(90deg, #00012A, #00126b, #ff473e)
}
</style>