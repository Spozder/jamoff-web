import Vue from "vue";
import Vuex from "vuex";
import axios from "axios";

Vue.use(Vuex);

const API_BASE = "/api";

// Muation names
const AUTH_CONFIRMED = "AUTHORIZATION_CONFIRMED";

// Action names
const CHECK_AUTH = "CHECK__AUTHORIZATION";

const store = new Vuex.Store({
  state: {
    isAuthenticated: false,
    userId: ""
  },
  mutations: {
    [AUTH_CONFIRMED]: (state, id) => {
      state.isAuthenticated = true;
      state.userId = String(id);
    }
  },
  actions: {
    [CHECK_AUTH]: async ({ commit, state }) => {
      if (!state.isAuthenticated) {
        const resp = await axios.get(`${API_BASE}/checkAuth`);
        if (resp.data && resp.data.isAuthenticated) {
          commit(AUTH_CONFIRMED, resp.data.userId);
        }
      }
    }
  },
  modules: {}
});

export { store, CHECK_AUTH };
