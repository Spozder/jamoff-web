<template>
  <Profile :id="userId" />
</template>

<script>
import Profile from "./Profile";
import { mapGetters } from "vuex";
export default {
  components: { Profile },
  computed: {
    ...mapGetters(["userId"])
  }
};
</script>
