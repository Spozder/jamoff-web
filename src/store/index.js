import Vue from "vue";
import Vuex from "vuex";
import axios from "axios";

Vue.use(Vuex);

const API_BASE = "http://localhost:3000/api";
// const API_BASE = "/api";

// Muation names
const AUTH_CONFIRMED = "AUTHORIZATION_CONFIRMED";
const LOGGED_OUT = "LOGGED_OUT";
const UPDATE_PROFILE_PAGE_DATA = "UPDATE_PROFILE_PAGE_DATA";

// Action names
const CHECK_AUTH = "CHECK__AUTHORIZATION";
const LOGOUT = "LOGOUT";
const GET_PROFILE_BY_ID = "GET_PROFILE_BY_ID";
const GET_MY_PROFILE = "GET_MY_PROFILE";

const store = new Vuex.Store({
  state: {
    isAuthenticated: false,
    userId: "",
    profilePageData: {
      memberOf: []
    }
  },
  mutations: {
    [LOGGED_OUT]: state => {
      state.isAuthenticated = false;
      state.userId = null;
    },
    [AUTH_CONFIRMED]: (state, id) => {
      state.isAuthenticated = true;
      state.userId = String(id);
    },
    [UPDATE_PROFILE_PAGE_DATA]: (state, data) => {
      state.profilePageData = data;
    }
  },
  actions: {
    [CHECK_AUTH]: async ({ commit, state }) => {
      if (!state.isAuthenticated) {
        const resp = await axios.get(`${API_BASE}/checkAuth`);
        if (resp.data && resp.data.isAuthenticated) {
          console.log("Auth check succeeded!");
          commit(AUTH_CONFIRMED, resp.data.userId);
        }
      }
    },
    [LOGOUT]: async ({ commit }) => {
      await axios.get(`${API_BASE}/logout`);
      commit(LOGGED_OUT);
    },
    [GET_PROFILE_BY_ID]: ({ commit }, id) => {
      axios
        .get(`${API_BASE}/profiles/${id}`)
        .then(resp => commit(UPDATE_PROFILE_PAGE_DATA, resp.data));
    },
    [GET_MY_PROFILE]: ({ commit }) => {
      axios
        .get(`${API_BASE}/me`)
        .then(resp => commit(UPDATE_PROFILE_PAGE_DATA, resp.data));
    }
  },
  modules: {},
  getters: {
    isAuthenticated: state => state.isAuthenticated,
    userId: state => state.userId
  }
});

export {
  store,
  LOGOUT,
  CHECK_AUTH,
  GET_PROFILE_BY_ID,
  GET_MY_PROFILE,
  AUTH_CONFIRMED,
  UPDATE_PROFILE_PAGE_DATA
};
