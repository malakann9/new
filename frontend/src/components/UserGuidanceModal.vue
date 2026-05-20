<template>
  <Transition name="fade">
    <div v-if="visible" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Welcome to CirCle!</h3>
          <button @click="close" class="close-btn">&times;</button>
        </div>
        
        <div class="modal-body">
          <p>
            Use the filters to find events at your university or click the 
            <strong>Apply</strong> button to host your own.
          </p>
        </div>
        
        <div class="modal-footer">
          <label class="checkbox-container" for="dontShowGuidance">
            <input type="checkbox" id="dontShowGuidance" name="dontShowGuidance" v-model="dontShowAgain">
            <span class="checkmark"></span>
            Don't show this again
          </label>
          
          <button @click="close" class="got-it-btn">
            Got it
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const visible = ref(false)
const dontShowAgain = ref(true) // Default to true for better UX

onMounted(() => {
  const seen = localStorage.getItem('user_guidance_seen')
  if (!seen) {
    // Add a small delay for better effect
    setTimeout(() => {
      visible.value = true
    }, 500)
  }
})

const close = () => {
  if (dontShowAgain.value) {
    localStorage.setItem('user_guidance_seen', 'true')
  }
  visible.value = false
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5); /* Semi-transparent black */
  backdrop-filter: blur(4px); /* Modern blur effect */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000; /* High z-index to sit on top of everything */
}

.modal-content {
  background-color: #ffffff;
  border-radius: 16px;
  width: 90%;
  max-width: 500px;
  padding: 30px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(36, 29, 29, 0.1); /* Subtle green border hint */
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.modal-header h3 {
  font-size: 24px;
  font-weight: 700;
  color: var(--brand-600); /* Dark green/black theme color */
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 28px;
  color: #888;
  cursor: pointer;
  line-height: 1;
  padding: 0;
}

.close-btn:hover {
  color: #333;
}

.modal-body p {
  font-size: 16px;
  line-height: 1.6;
  color: #555;
  margin-bottom: 25px;
}

.modal-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* Custom Checkbox Styling */
.checkbox-container {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 14px;
  color: #666;
  user-select: none;
}

.checkbox-container input {
  margin-right: 8px;
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: var(--brand); /* Theme green */
}

.got-it-btn {
  background-color: var(--brand);
  color: white;
  border: none;
  padding: 10px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.got-it-btn:hover {
  background-color: var(--brand-600);
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
