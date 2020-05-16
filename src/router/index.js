import Vue from "vue";
import VueRouter from "vue-router";
import Header from "../layout/AppHeader";
import Footer from "../layout/AppFooter";
import Home from "../views/Home.vue";
import Login from "../views/Login.vue";
import Register from "../views/Register.vue";
import Profile from "../views/Profile.vue";

Vue.use(VueRouter);

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
    }
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
