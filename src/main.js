import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import 'particles.js';
import router from './router'
Vue.config.productionTip = false

new Vue({
  vuetify,

  methods: {
    initParticles(){
      window.particlesJS('particles', this.$options.particlesOptions)
    }
  },

  particlesOptions: {
    "particles": {
      "number": {
        "value": 15,
        "density": {
          "enable": true,
          "value_area": 710.2328774690454
        }
      },
      "color": {
        "value": "#ff473e"
      },
      "shape": {
        "type": "circle",
        "stroke": {
          "width": 0,
          "color": "#000000"
        },
        "polygon": {
          "nb_sides": 4
        },
        "image": {
          "src": "img/github.svg",
          "width": 100,
          "height": 100
        }
      },
      "opacity": {
        "value": 1,
        "random": false,
        "anim": {
          "enable": false,
          "speed": 1,
          "opacity_min": 0.1,
          "sync": false
        }
      },
      "size": {
        "value": 35.51164387345227,
        "random": true,
        "anim": {
          "enable": false,
          "speed": 1,
          "size_min": 0.1,
          "sync": false
        }
      },
      "line_linked": {
        "enable": true,
        "distance": 250,
        "color": "#ffffff",
        "opacity": 1,
        "width": 1
      },
      "move": {
        "enable": true,
        "speed": 2,
        "direction": "none",
        "random": false,
        "straight": false,
        "out_mode": "out",
        "bounce": false,
        "attract": {
          "enable": false,
          "rotateX": 600,
          "rotateY": 1200
        }
      }
    },
    "interactivity": {
      "detect_on": "canvas",
      "events": {
        "onhover": {
          "enable": false,
          "mode": "repulse"
        },
        "onclick": {
          "enable": false,
          "mode": "push"
        },
        "resize": true
      },
      "modes": {
        "grab": {
          "distance": 400,
          "line_linked": {
            "opacity": 1
          }
        },
        "bubble": {
          "distance": 400,
          "size": 40,
          "duration": 2,
          "opacity": 8,
          "speed": 3
        },
        "repulse": {
          "distance": 200,
          "duration": 0.4
        },
        "push": {
          "particles_nb": 4
        },
        "remove": {
          "particles_nb": 2
        }
      }
    },
    "retina_detect": true
  },

  mounted() {
    this.$nextTick(() => {
      this.initParticles();
    });
  },

  router,
  render: h => h(App)
}).$mount('#app')
