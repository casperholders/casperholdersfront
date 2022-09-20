import App from '@/App';
import '@/plugins/big';
import CLValueInput from '@/components/operations/CLValueInput';
import vuetify from '@/plugins/vuetify';
import router from '@/router';
import store from '@/store';
import Vue from 'vue';

Vue.config.productionTip = false;

Vue.component('CLValueInput', CLValueInput);

new Vue({
  vuetify,
  router,
  store,
  render: (h) => h(App),
}).$mount('#app');
