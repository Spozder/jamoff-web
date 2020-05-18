import Vue from "vue";
import VueRouter from "vue-router";
import Header from "../layout/AppHeader";
import Footer from "../layout/AppFooter";
import Home from "../views/Home.vue";
import Login from "../views/Login.vue";
import Register from "../views/Register.vue";
import Profile from "../views/Profile.vue";
import { store, CHECK_AUTH } from "../store";

Vue.use(VueRouter);

const authGuard = async (to, from, next) => {
  if (store.state.isAuthenticated) {
    console.log("Authorized!");
    return next();
  }
  await store.dispatch(CHECK_AUTH);
  if (store.state.isAuthenticated) {
    console.log("Authorized after check!");
    return next();
  } else {
    console.log("Still not authorized after check");
    return next("/?failure=true");
  }
};

const routes = [
  {
    path: "/",
    name: "starter",
    components: {
      header: Header,
      default: Home,
      footer: Footer
    }
  },
  {
    path: "/login",
    name: "login",
    components: {
      header: Header,
      default: Login,
      footer: Footer
    }
  },
  {
    path: "/register",
    name: "register",
    components: {
      header: Header,
      default: Register,
      footer: Footer
    }
  },
  {
    path: "/me",
    name: "my profile",
    components: {
      header: Header,
      default: Profile,
      footer: Footer
    },
    beforeEnter: authGuard
  },
  {
    path: "/profile/:id",
    name: "profile",
    components: {
      header: Header,
      default: Profile,
      footer: Footer
    },
    props: {
      header: false,
      default: true,
      footer: false
    }
  }
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes
});

export default router;
