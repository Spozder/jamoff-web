import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import Argon from "./plugins/argon-kit";
import FA from "./plugins/fontawesome";
import "./registerServiceWorker";

Vue.config.productionTip = false;

Vue.use(Argon);
Vue.use(FA);

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");
