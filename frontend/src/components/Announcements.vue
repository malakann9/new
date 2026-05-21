<template>
  <section class="announcements-wrapper">
    <!-- Banner takes full width of parent container -->
      <el-carousel 
        ref="carouselRef"
        trigger="click" 
        height="500px" 
        indicator-position="outside" 
        :interval="5000" 
        arrow="hover"
        class="custom-carousel"
        style="width: 100% !important; max-width: none !important;"
        @touchstart="onTouchStart"
        @touchend="onTouchEnd"
      >
        <el-carousel-item v-for="item in 4" :key="item">
          <div class="banner-item">
            <el-image 
              :src="getImage('image' + item + '.jpg')" 
              fit="cover" 
              class="banner-image"
              :loading="item === 1 ? 'eager' : 'lazy'"
              :fetchpriority="item === 1 ? 'high' : 'auto'"
            />
          </div>
        </el-carousel-item>
      </el-carousel>
  </section>
</template>

<script setup>
import { ref } from 'vue'

// Helper to resolve image URLs from the project root "images" folder
const getImage = (fileName) => new URL(`../../images/${fileName}`, import.meta.url).href

const carouselRef = ref(null)
let touchStartX = 0
let touchEndX = 0

const onTouchStart = (e) => {
  touchStartX = e.changedTouches[0].screenX
}

const onTouchEnd = (e) => {
  touchEndX = e.changedTouches[0].screenX
  handleSwipe()
}

const handleSwipe = () => {
  if (touchEndX < touchStartX - 50) {
    // Swipe Left -> Next
    carouselRef.value.next()
  }
  if (touchEndX > touchStartX + 50) {
    // Swipe Right -> Prev
    carouselRef.value.prev()
  }
}
</script>

<style scoped>
.announcements-wrapper {
  width: 100% !important;
  max-width: none !important;
  margin: 0 !important;
  display: flex;
  justify-content: center;
  padding: 24px 0; /* Increased vertical spacing */
}

/* .custom-container removed */

.banner-item {
  width: 100%;
  height: 100%;
  position: relative;
  border-radius: 24px;
  overflow: hidden;
}

.banner-image {
  width: 100% !important;
  height: 100%;
  display: block;
}

/* --- Carousel Indicator Customization (Wide Bars) --- */
:deep(.el-carousel__indicators--outside) {
  margin-top: 16px !important;
  display: flex !important;
  justify-content: center !important;
  gap: 12px !important;
}

:deep(.el-carousel__indicator--outside) {
  padding: 0 !important; /* Remove default padding */
}

:deep(.el-carousel__indicator--outside .el-carousel__button) {
  width: 200px !important; /* Force wide bars */
  height: 9px !important; /* Force thicker */
  border-radius: 4px !important;
  background-color: var(--brand-200) !important; /* Inactive color */
  opacity: 1 !important;
  transition: all 0.3s !important;
}

:deep(.el-carousel__indicator--outside.is-active .el-carousel__button) {
  background-color: var(--brand) !important; /* Active color */
}

/* Mobile Responsiveness */
@media (max-width: 768px) {
  .custom-container {
    padding: 0 16px;
  }
  
  .banner-item {
    border-radius: 16px;
  }
  
  :deep(.el-carousel__container) {
    height: 200px !important;
  }

  /* Smaller indicators on mobile */
  :deep(.el-carousel__indicator--outside .el-carousel__button) {
    width: 40px;
    height: 6px;
  }

  /* Hide arrows on mobile */
  :deep(.el-carousel__arrow) {
    display: none !important;
  }
}

/* Fix for smooth rounded corners during slide transition */
:deep(.el-carousel__container) {
  border-radius: 24px;
  overflow: hidden;
  transform: translateZ(0); /* Force hardware acceleration to fix Safari clipping */
}
</style>
