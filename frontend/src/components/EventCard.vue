<template>
  <div class="event-card" v-if="event">
      <div class="card-image-wrapper">
        <img 
          :src="event.image" 
          :alt="event.alt" 
          :loading="isPriority ? 'eager' : 'lazy'"
          :fetchpriority="isPriority ? 'high' : 'auto'"
          @error="(e) => { e.target.onerror = null; e.target.src = '/placeholder.png' }"
        >
      </div>
      <div class="card-content">
          <div class="card-info">

            <h4 class="event-name">{{event.name}}</h4>
            <div class="event-detail location">
                <i class="fas fa-map-marker-alt"></i>
                <span>{{event.location}}</span>
            </div>
            <div class="event-detail time">
                <i class="fas fa-clock"></i>
                <span>{{event.time || '00:00'}}</span>
            </div>
          </div>
          <div class="card-actions">
            <EventDialog :event="event" />
          </div>
      </div>
  </div>
</template>

<script setup>
import EventDialog from './EventDialog.vue'

const props = defineProps({
  event: {
    type: Object
  },
  seeAll: {
    type: Function
  },
  isPriority: {
    type: Boolean,
    default: false
  }
})
</script>

<style scoped>
/* Scoped styles can be used here if needed, but we are relying on global style.css for consistency */
/* However, for component-specific structure, we can add some here */

.event-card {
  display: flex;
  flex-direction: column;
  height: auto; /* Allow card to grow with content */
  min-height: 100%; /* Ensure it fills the grid cell */
  border-radius: 12px;
  overflow: hidden;
  background: white;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transition: transform 0.2s;
}

.event-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.12);
}

.card-image-wrapper {
  height: 200px; /* Fixed height as requested */
  width: 100%;
  overflow: hidden;
}

.card-image-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center top; /* Focus on faces/top */
}

.card-content {
  padding: 16px;
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 12px; /* Flexbox gap for spacing */
}

.card-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.event-name {
  font-size: 16px;
  font-weight: 700;
  color: var(--brand-600); /* Darker color */
  margin: 0;
  line-height: 1.4;
  
  /* Line Clamp for 2 lines */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.event-detail {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px; /* Smaller size */
  color: #555;
}

.event-detail i {
  width: 16px;
  text-align: center;
  color: var(--brand);
}

.card-actions {
  margin-top: auto;
  padding-top: 8px;
}

.community-name {
  margin-bottom: 16px;
  font-size: 14px; /* Optional: make it look like a label */
  color: #666; /* Optional: make it subtle */
  margin-top: 0;
}
  /* Mobile Fix: Ensure card content is not clipped */
  @media (max-width: 768px) {
    .event-card {
      height: auto !important;
      min-height: auto !important;
    }

    .card-content {
      padding-bottom: 24px; /* Extra padding for button space */
      gap: 16px;
    }
  }
</style>
