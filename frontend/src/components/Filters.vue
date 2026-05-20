<template>
  <aside class="filters">
      <h3>Filter</h3>
      <div class="filter-group">
        <label class="filter-label" for="universityFilter">University</label>
        <el-select 
          id="universityFilter"
          name="universityFilter"
          :model-value="activeType" 
          @update:model-value="updateType" 
          placeholder="Select University" 
          style="width: 100%"
          size="large"
        >
          <el-option
            v-for="school in schools"
            :key="school"
            :label="school === 'All' ? 'All Schools' : school"
            :value="school"
          />
        </el-select>
      </div>

      <div class="filter-group">
        <label class="filter-label" for="sortFilter">Sort by Date</label>
        <el-select 
          id="sortFilter"
          name="sortFilter"
          :model-value="sortOrder" 
          @update:model-value="updateSort" 
          placeholder="Sort Order" 
          style="width: 100%"
          size="large"
        >
          <el-option label="Nearest Date" value="nearest" />
          <el-option label="Farthest Date" value="farthest" />
        </el-select>
      </div>
      
      <div class="filter-item date-filter-container">
          <label for="event-date">Date</label>
          <el-date-picker
              id="event-date"
              name="event-date"
              v-model="dateRange"
              type="daterange"
              range-separator="-"
              start-placeholder="Start"
              end-placeholder="End"
              size="default"
              style="max-width:200px"
          />                        
      </div>
  </aside> 
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  filterChange: {
    type: Function
  },
  activeType: {
    type: String,
    default: 'All'
  },
  sortOrder: {
    type: String,
    default: 'nearest'
  }
})
const schools = ['All', 'AYBU', 'AU', 'ODTÜ', 'Hacettepe', 'Bilkent', 'Gazi Üni', 'Other']

const universityMap = {
  "AYBU": "Ankara Yıldırım Beyazıt University",
  "AU": "Ankara University",
  "ODTÜ": "Orta doğu teknik Üniversitesi",
  "Hacettepe": "Hacettepe Üniversitesi",
  "Bilkent": "Bilkent Üniversitesi",
  "Gazi Üni": "Gazi Üniversitesi",
  "Other": "Other"
};



const emit = defineEmits(['update:activeType', 'update:sortOrder'])

const dateRange = ref([])

const updateType = (type) => {
  emit('update:activeType', type)
}

const updateSort = (order) => {
  emit('update:sortOrder', order)
}

watch(dateRange, (nv) => {
  if (props.filterChange) {
    props.filterChange(nv)
  }
})
</script>

<style scoped>
.filters {
  background: #fff;
  padding: 20px;
  border-radius: 16px;
  box-shadow: 0 3px 10px rgba(0,0,0,.06);
  height: fit-content;
  min-width: 250px;
}

.filters h3 {
  margin-top: 0;
  margin-bottom: 16px;
  font-size: 18px;
  color: var(--brand-600);
}

.filter-group {
  margin-bottom: 24px;
}

.filter-label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--brand-600);
}

.filter-item {
  /* Kept for date filter container compatibility if needed, 
     though date-filter-container overrides most things. */
  margin-bottom: 8px;
}

.date-filter-container {
  margin-top: 20px;
  cursor: default;
}

.date-filter-container:hover {
  background: transparent;
  color: inherit;
}

.date-filter-container label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 600;
}
</style>
