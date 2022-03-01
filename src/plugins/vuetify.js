import Vue from 'vue';
import Vuetify from 'vuetify/lib/framework';

Vue.use(Vuetify);

export default new Vuetify({
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
