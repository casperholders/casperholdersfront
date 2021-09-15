import App from '@/App';
import vuetify from '@/plugins/vuetify';
import router from '@/router';
import store from '@/store';
import Vue from 'vue';

if (window.Cypress) {
  window.__store__ = store;
}

Vue.config.productionTip = false;

new Vue({
  vuetify,
  router,
  store,
  render: (h) => h(App),
}).$mount('#app');
