import Vue from 'vue';
import { Scroll } from 'vuetify/lib/directives';
import Vuetify from 'vuetify/lib/framework';

Vue.use(Vuetify, { directives: { Scroll } });

export default new Vuetify({
  icons: {
    iconfont: 'mdiSvg',
  },
  theme: {
    options: {
      customProperties: true,
    },
    dark: true,
    themes: {
      dark: {
        primary: '#00126b',
        secondary: '#00012a',
        tertiary: '#ff473e',
        quaternary: '#af023f',
        quinary: '#B15DFF',
        senary: '#72DEFF',
      },
    },
  },
});
