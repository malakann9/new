<template>
  <div class="standard-layout-container">
    <Announcements/>
    <div class="content-wrapper">
        <Filters 
          :filterChange="onFilterChange" 
          v-model:activeType="activeType"
          v-model:sortOrder="sortOrder"
        />
        
        <EventGrid 
          :events="filteredEvents" 
          :seeAll="seeAll" 
        />
    </div>
    
    <CTABanner />
    <UserGuidanceModal />
  </div>
  <!-- Global event detail dialog -->
  <el-dialog 
    v-model="dialogVisible" 
    width="90%" 
    style="max-width: 800px; border-radius: 16px; overflow: hidden;"
    :show-close="true"
    :close-on-click-modal="true"
    :close-on-press-escape="true"
    :lock-scroll="true"
    class="event-detail-modal"
  >
    <template #header="{ close, titleId, titleClass }">
      <div class="my-header" style="display: flex; justify-content: space-between; align-items: center;">
        <h4 :id="titleId" :class="titleClass" style="margin: 0; font-size: 20px; font-weight: 700; color: var(--brand-600);">{{ selectedEvent?.name }}</h4>
      </div>
    </template>
    <div class="dialog-content-wrapper">
      
      <div class="dialog-image-container">
        <img 
          :src="selectedEvent.image" 
          :alt="selectedEvent.alt" 
          class="dialog-image"
        />
      </div>

      <div class="dialog-text-container">
        
        <div class="detail-row">
          <i class="fas fa-calendar"></i> 
          <strong>Date:</strong> {{ selectedEvent.date }} at {{ selectedEvent.time }}
        </div>
        
        <div class="detail-row">
          <i class="fas fa-location-dot"></i> 
          <strong>Location:</strong> {{ selectedEvent.location }}
        </div>
        
        <div class="detail-row">
          <i class="fas fa-users"></i> 
          <strong>Community:</strong> {{ selectedEvent.community_name }}
        </div>

        <p style="color: #555; line-height: 1.6; margin: 20px 0; font-size: 15px;">
          Join us for this exciting event! Don't miss out on this opportunity to connect with the community and participate in engaging activities.
        </p>

        <div style="display: flex; gap: 10px; margin-top: 20px;">
          <button 
            @click="toggleRegistration"
            :style="{
              background: selectedEvent.registered ? '#e0e0e0' : 'var(--brand)',
              color: selectedEvent.registered ? '#333' : 'white',
              flex: 1
            }"
            style="border: none; padding: 12px 24px; border-radius: 10px; cursor: pointer; font-size: 16px; font-weight: 600;"
          >
            {{ selectedEvent.registered ? 'Unregister' : 'Register' }}
          </button>

          <button 
            @click="dialogVisible = false"
            style="background: transparent; border: 2px solid #ddd; color: #666; padding: 12px 24px; border-radius: 10px; cursor: pointer; font-size: 16px; font-weight: 600;"
          >
            Close
          </button>
        </div>
      </div>

    </div>
  </el-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import moment from 'moment'
import { store } from '../store.js'
import Announcements from '../components/Announcements.vue'
import Filters from '../components/Filters.vue'
import EventGrid from '../components/EventGrid.vue'
import CTABanner from '../components/CTABanner.vue'
import UserGuidanceModal from '../components/UserGuidanceModal.vue'
const universityMap = {
  "AYBU": "Ankara Yıldırım Beyazıt University",
  "AU": "Ankara University",
  "ODTÜ": "Orta doğu teknik Üniversitesi",
  "Hacettepe": "Hacettepe Üniversitesi",
  "Bilkent": "Bilkent Üniversitesi",
  "Gazi Üni": "Gazi Üniversitesi",
  "Other": "Other"
};

// Reactive state for selected event and dialog visibility
const selectedEvent = ref(null)
const dialogVisible = ref(false)
const activeType = ref('All')
const dateFilter = ref(null)
const sortOrder = ref('nearest')

const filteredEvents = computed(() => {
  if (store.events.length === 0) return [];

  let result = [...store.events];
  const now = moment().startOf('day');
  const fourMonthsAgo = moment().subtract(4, 'months').startOf('day');

  // 0. Base Filter: Only show events from the last 4 months onwards
  result = result.filter(e => {
    const eventDate = moment(e.date);
    return eventDate.isSameOrAfter(fourMonthsAgo);
  });

  // Convert acronym → full name
  const selectedFullName = universityMap[activeType.value] || activeType.value;

  // 1. Filter by activeType
  if (activeType.value !== 'All') {
    result = result.filter(e => {
      const match = 
        e.university === activeType.value || 
        e.community_name === activeType.value ||
        (e.organizer && String(e.organizer).toLowerCase().trim() === String(selectedFullName).toLowerCase().trim());
      return match;
    });
  }

  // 2. Filter by Date Range (Custom Picker)
  if (dateFilter.value && dateFilter.value.length === 2) {
    const startDate = moment(dateFilter.value[0]).startOf('day');
    const endDate = moment(dateFilter.value[1]).endOf('day');
    result = result.filter(item => {
      const itemDate = moment(item.date); 
      return itemDate.isBetween(startDate, endDate, 'day', '[]');
    });
  }

  // 3. Smart Sort: "Nearest"
  return result.sort((a, b) => {
    const dateA = moment(a.date);
    const dateB = moment(b.date);
    
    if (sortOrder.value === 'nearest') {
      const isPastA = dateA.isBefore(now);
      const isPastB = dateB.isBefore(now);

      // 1. Upcoming events always come before past events
      if (!isPastA && isPastB) return -1;
      if (isPastA && !isPastB) return 1;

      // 2. Both upcoming? Sort ascending (nearest first)
      if (!isPastA && !isPastB) return dateA - dateB;

      // 3. Both past? Sort descending (nearest past first)
      return dateB - dateA;
    } else {
      // Manual Descending (latest date first)
      return dateB - dateA; 
    }
  });
})

const seeAll = (event) => {
  // Open the global dialog with the clicked event's details
  selectedEvent.value = event
  dialogVisible.value = true
}

const toggleRegistration = () => {
  if (selectedEvent.value) {
    store.registerEvent(selectedEvent.value)
  }
}

const onFilterChange = (val) => {
  dateFilter.value = val;
}
</script>

<style scoped>
/* Dialog content layout - side by side */
.dialog-content-wrapper {
  display: flex;
  align-items: flex-start;
  gap: 20px;
}

/* Image container on the left */
.dialog-image-container {
  width: 40%;
  flex-shrink: 0;
}

.dialog-image {
  width: 100%;
  height: auto;
  border-radius: 8px;
  object-fit: cover;
  margin-bottom: 12px;
}

/* Text container on the right */
.dialog-text-container {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-row {
  font-size: 16px;
  line-height: 1.6;
  display: flex;
  align-items: center;
  gap: 8px;
}

.detail-row i {
  color: var(--brand);
  width: 20px;
}

.detail-row strong {
  margin-right: 8px;
}

/* Responsive: stack vertically on smaller screens */
@media (max-width: 768px) {
  .dialog-content-wrapper {
    flex-direction: column;
  }
  
  .dialog-image-container {
    width: 100%;
  }
}

/* Carousel indicator buttons - make them thicker and more visible */
:deep(.el-carousel__button) {
  width: 40px !important;
  height: 8px !important;
  border-radius: 4px !important;
  opacity: 0.8 !important;
  background-color: #ffffff !important;
}

:deep(.el-carousel__indicator.is-active .el-carousel__button) {
  opacity: 1 !important;
  background-color: var(--brand) !important;
}

/* Responsive: smaller indicators on mobile */
@media (max-width: 768px) {
  :deep(.el-carousel__button) {
    width: 12px !important;
    height: 6px !important;
    border-radius: 3px !important;
  }
}


/* .page-container styles removed - using global .standard-layout-container */
</style>
