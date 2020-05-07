<template>
  <div class="home">
    <div class="position-relative">
      <!-- shape Hero -->
      <section class="section-shaped my-0">
        <div class="shape shape-style-1 shape-default shape-skew">
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </div>
        <div class="container shape-container d-flex">
          <div class="col px-0">
            <div class="row">
              <div class="col-lg-6">
                <h1 class="display-3 text-white">
                  Compete in a Weekly Music Competition with your friends!
                </h1>
                <p class="lead text-white">
                  Every week, you and your friends compete to come up with the
                  song that best fits the week's theme. Winner picks the next
                  theme! Go out there and show of your music interests!
                </p>
                <div class="btn-wrapper">
                  <base-button
                    tag="router-link"
                    to="/register"
                    class="mb-3 mb-sm-0"
                    type="info"
                    :faIcon="['fas', 'user-plus']"
                  >
                    Sign Up
                  </base-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <!-- 1st Hero Variation -->
    </div>
    <section class="section section-lg pt-lg-0 mt--200">
      <div class="container">
        <img alt="Vue logo" src="../assets/logo.png" />
        <HelloWorld msg="Welcome to Your Vue.js App" />
      </div>
    </section>
  </div>
</template>

<script>
// @ is an alias to /src
import HelloWorld from "@/components/HelloWorld.vue";

export default {
  name: "Home",
  components: {
    HelloWorld
  }
};
</script>
