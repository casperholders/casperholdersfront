import App from '@/App';
import vuetify from '@/plugins/vuetify';
import router from '@/router';
import store from '@/store';
import Vue from 'vue';

Vue.config.productionTip = false

new Vue({
  vuetify,
  router,
  store,
  render: (h) => h(App),
}).$mount('#app');
