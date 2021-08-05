import Vue from 'vue';
import Vuetify from 'vuetify/lib/framework';
import globalPlugin from './globalPlugin'

Vue.use(globalPlugin)
Vue.use(Vuetify);

export default new Vuetify({
    theme: {
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
