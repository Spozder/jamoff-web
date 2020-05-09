<template>
  <footer class="footer has-cards">
    <div class="container">
      <div class="row row-grid align-items-center my-md">
        <div class="col-lg-6">
          <h3 class="text-primary font-weight-light mb-2">
            An open source project by
            <br />
            <span>Spencer Pozder.</span>
          </h3>
        </div>
        <div class="col-lg-6 text-lg-center btn-wrapper">
          <a
            target="_blank"
            href="https://www.facebook.com/spozder"
            class="btn btn-neutral btn-icon-only btn-facebook btn-round btn-lg"
            data-toggle="tooltip"
            data-original-title="Find me on Facebook"
          >
            <font-awesome-icon :icon="['fab', 'facebook-square']" />
          </a>
          <a
            target="_blank"
            href="mailto:spencer.pozder@gmail.com"
            class="btn btn-neutral btn-icon-only btn-dribbble btn-lg btn-round"
            data-toggle="tooltip"
            data-original-title="Follow us"
          >
            <font-awesome-icon :icon="['far', 'envelope']" />
          </a>
          <a
            target="_blank"
            href="https://github.com/spozder"
            class="btn btn-neutral btn-icon-only btn-github btn-round btn-lg"
            data-toggle="tooltip"
            data-original-title="Look me up on GitHub"
          >
            <font-awesome-icon :icon="['fab', 'github']" />
          </a>
          <a
            target="_blank"
            href="https://linkedin.com/spozder"
            class="btn btn-neutral btn-icon-only btn-linkedin btn-round btn-lg"
            data-toggle="tooltip"
            data-original-title="Look me up on LinkedIn"
          >
            <font-awesome-icon :icon="['fab', 'linkedin-in']" />
          </a>
        </div>
      </div>
      <hr />
      <div class="row align-items-center justify-content-md-between">
        <div class="col-md-6">
          <div class="copyright">
            &copy; {{ year }}
            <a
              href="https://spozder.com"
              target="_blank"
              rel="noopener"
            >Spencer Pozder</a>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>
<script>
export default {
  name: "starter-footer",
  data() {
    return {
      year: new Date().getFullYear()
    };
  }
};
</script>
<style></style>
