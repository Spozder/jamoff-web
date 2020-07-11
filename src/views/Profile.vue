<template>
  <div class="profile-page">
    <section class="section-profile-cover section-shaped my-0">
      <div class="shape shape-style-1 shape-primary shape-skew alpha-4">
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
      </div>
    </section>
    <section class="section section-skew">
      <div class="container">
        <card shadow class="card-profile mt--300" no-body>
          <div class="px-4">
            <div class="row justify-content-center">
              <div class="col-lg-3 order-lg-2">
                <div class="card-profile-image">
                  <a href="#">
                    <img
                      v-lazy="'/img/theme/team-4-800x800.jpg'"
                      class="rounded-circle"
                    />
                  </a>
                </div>
              </div>
              <div
                class="col-lg-4 order-lg-3 text-lg-right align-self-lg-center"
              >
                <div class="card-profile-actions py-4 mt-lg-0">
                  <base-button type="info" size="sm" class="mr-4"
                    >Connect</base-button
                  >
                  <base-button type="default" size="sm" class="float-right"
                    >Message</base-button
                  >
                </div>
              </div>
              <div class="col-lg-4 order-lg-1">
                <div class="card-profile-stats d-flex justify-content-center">
                  <div>
                    <span class="heading">{{ profile.memberOf.length }}</span>
                    <span class="description"
                      >Group{{ profile.memberOf.length > 1 ? "s" : "" }}</span
                    >
                  </div>
                  <div>
                    <span class="heading">10</span>
                    <span class="description">Song Submissions</span>
                  </div>
                  <div>
                    <span class="heading">89</span>
                    <span class="description">Votes</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="text-center mt-5">
              <h3>
                {{ profile.fullName }}
              </h3>
            </div>
            <div class="mt-5 py-5 border-top text-center">
              <div class="row justify-content-center">
                <div class="col-lg-9">
                  <div class="card-deck">
                    <GroupCard
                      v-for="group in profile.memberOf"
                      :key="group.groupId"
                      :group="group"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </card>
      </div>
    </section>
  </div>
</template>
<script>
import { GET_PROFILE_BY_ID } from "../store";
import GroupCard from "../components/domain/GroupCard.vue";
export default {
  components: { GroupCard },
  props: {
    id: String
  },
  computed: {
    profile: function() {
      return this.$store.state.profilePageData;
    }
  },
  created: function() {
    this.$store.dispatch(GET_PROFILE_BY_ID, this.id);
  }
};
</script>
<style></style>
