<template>
  <header class="header-global">
    <base-nav class="navbar-main" transparent type effect="light" expand>
      <router-link slot="brand" class="navbar-brand mr-lg-5" to="/">
        <img src="img/brand/white.png" />
      </router-link>

      <div class="row" slot="content-header" slot-scope="{ closeMenu }">
        <div class="col-6 collapse-brand">
          <a href="../index.html">
            <img src="img/brand/blue.png" />
          </a>
        </div>
        <div class="col-6 collapse-close">
          <close-button @click="closeMenu"></close-button>
        </div>
      </div>

      <div
        class="navbar-nav"
        style="display: flex; justify-content: space-between; width: 100%"
        slot-scope="{ closeMenu }"
      >
        <ul class="navbar-nav navbar-nav-hover align-items-lg-center">
          <li class="nav-item">
            <a
              href="#"
              class="nav-link"
              data-toggle="dropdown"
              role="button"
              @click="closeMenu"
            >
              <i class="ni ni-fat-add" style="margin-right: 0px"></i>
              <span class="nav-link-inner--text">Start A New JamOff</span>
            </a>
          </li>
          <li class="nav-item">
            <a
              href="#"
              class="nav-link"
              data-toggle="dropdown"
              role="button"
              @click="closeMenu"
            >
              <i class="ni ni-trophy" style="margin-right: 0px"></i>
              <span class="nav-link-inner--text">Join An Existing JamOff</span>
            </a>
          </li>
        </ul>
        <div
          class="navbar-nav align-items-lg-center ml-lg-auto"
          @click="closeMenu"
        >
          <base-button
            tag="router-link"
            to="/login"
            class="mb-3 mb-sm-0"
            type="neutral"
            icon="ni ni-single-02 mr-2"
          >
            Login
          </base-button>
        </div>
      </div>
    </base-nav>
  </header>
</template>
<script>
import BaseNav from "@/components/BaseNav";
import CloseButton from "@/components/CloseButton";

export default {
  components: {
    BaseNav,
    CloseButton
  }
};
</script>
<style></style>
