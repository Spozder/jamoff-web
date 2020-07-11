<template>
  <Card :shadow="true" shadowSize="sm" :headerClasses="['h3']">
    <template v-slot:header
      ><img
        :src="
          group.imageUrl ||
            'https://assets.hongkiat.com/uploads/group-photography-tips/lights-lights-lights.jpg'
        "
    /></template>
    <template>
      <h3>{{ group.name }}</h3>
      <p>{{ group.description }}</p>
      <p>Total Members: {{ group.memberCount }}</p>
      <p>Total Rounds: {{ group.roundCount }}</p>
    </template>
  </Card>
</template>

<script>
import Card from "../Card.vue";
export default {
  components: { Card },
  props: {
    group: {
      type: Object,
      required: true
    }
  }
};
</script>
