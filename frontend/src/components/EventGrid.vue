<template>
  <section class="event-grid" v-if="events.length > 0">
      <EventCard v-for="(event, index) in events" :event="event" :key="event.event_name" :seeAll="seeAll" :isPriority="index < 4" />
  </section>
  <div v-else>
      <el-alert title="No Events Available" type="warning" />
  </div>
</template>

<script setup>
import EventCard from './EventCard.vue'

const props = defineProps({
  events: {
    type: Array,
    default: () => []
  },
  seeAll: {
    type: Function
  }
})
</script>
