<template>
  <div class="layout-wrapper">
    <!-- TOP GREEN STRIP -->
    <div class="top-bar"></div>

    <!-- NAVBAR -->
    <header class="navbar">
      <div class="nav-inner standard-layout-container">
        <div class="nav-left">
          <!-- CUTE WALKING CAT -->
          <div class="nav-walker" id="navWalker">
            <div class="cat">
              <div class="cat-tail"></div>
              <div class="cat-body"></div>
              <div class="cat-head">
                <div class="cat-ear left"></div>
                <div class="cat-ear right"></div>
                <div class="cat-eye left"></div>
                <div class="cat-eye right"></div>
                <div class="cat-nose"></div>
                <div class="cat-whisker left-1"></div>
                <div class="cat-whisker left-2"></div>
                <div class="cat-whisker right-1"></div>
                <div class="cat-whisker right-2"></div>
              </div>
              <div class="cat-scarf"></div>
              <div class="cat-scarf-end"></div>
              <div class="cat-leg left"></div>
              <div class="cat-leg right"></div>
            </div>
          </div>

          <router-link to="/" class="logo" aria-label="CirCle Home">
            <span class="logo-letter" aria-hidden="true">C</span>
            <span class="logo-letter" aria-hidden="true">i</span>
            <span class="logo-letter" aria-hidden="true">r</span>
            <span class="logo-letter" aria-hidden="true">C</span>
            <span class="logo-letter" aria-hidden="true">l</span>
            <span class="logo-letter" aria-hidden="true">e</span>
          </router-link>

          <nav class="tabs" aria-label="Primary navigation">
            <router-link to="/communities" class="tab" active-class="is-active">Communities</router-link>
            <router-link to="/events" class="tab" active-class="is-active">Events</router-link>
          </nav>
        </div>

        <div class="nav-center">
          <form class="global-search" role="search" aria-label="Search for an Event" @submit.prevent="handleSearch">
            <label for="global-search-input" style="position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); border: 0;">Search for an Event</label>
            <input 
              id="global-search-input"
              name="search"
              type="search" 
              placeholder="Search for an Event" 
              aria-label="Search for an Event" 
              v-model="searchQuery"
            />
            <button type="submit" class="search-btn" aria-label="Search">
              <i class="fas fa-search"></i>
            </button>
          </form>
        </div>

        <div class="nav-right">
          <router-link v-if="isLoggedIn" to="/profile" class="icon-btn-link">
            <el-avatar :size="48" :src="userAvatar" />
          </router-link>
          <router-link v-else to="/login" class="sign-in-btn">
            Sign in
          </router-link>
        </div>
      </div>
    </header>

    <div class="nav-bottom-line"></div>

    <!-- MAIN CONTENT -->
    <main class="page-content">
      <slot />
    </main>

    <AppFooter />
    
    <RatingPopup 
      v-if="ratingEvent"
      v-model="showRatingPopup"
      :event="ratingEvent"
      @close="closeRatingPopup"
      @submit="handleRatingSubmit"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import AppFooter from '../components/AppFooter.vue'
import RatingPopup from '../components/RatingPopup.vue'
import { store } from '../store.js'

const router = useRouter()
const isLoggedIn = ref(false)
const userAvatar = ref('')
const showRatingPopup = ref(false)
const ratingEvent = ref(null)
const searchQuery = ref('')

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({ path: '/events', query: { search: searchQuery.value } })
  } else {
    // If empty, just go to events page (clears search)
    router.push({ path: '/events' })
  }
  searchQuery.value = ''
}

const loadAvatar = () => {
  const stored = localStorage.getItem('user_avatar')
  if (stored) {
    userAvatar.value = stored
  } else {
    // Default avatar if none set - MATCH PROFILE PAGE LOGIC
    const name = localStorage.getItem('user_name') || 'User'
    userAvatar.value = `https://api.dicebear.com/7.x/initials/svg?seed=${name}&backgroundColor=372d2d&textColor=ffffff`
  }
}

const checkLogin = () => {
  if (localStorage.getItem('user_token')) {
    isLoggedIn.value = true
  } else {
    isLoggedIn.value = false
  }
}

const checkRating = () => {
  if (!isLoggedIn.value) return

  // Prevent popup for admins
  const role = localStorage.getItem('user_role')
  if (role === 'admin' || role === 'super_admin') return

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Find a past event that is registered but not rated
  const candidate = store.events.find(e => {
    if (!e.registered) return false
    
    const eventDate = new Date(e.date)
    console.log(`Checking event ${e.id}: registered=${e.registered}, date=${e.date}, isPast=${eventDate < today}`)
    
    if (eventDate >= today) return false // Future event
    
    // Check if already rated
    const rated = localStorage.getItem(`rated_event_${e.id}`)
    console.log(`Event ${e.id} rated status: ${rated}`)
    return !rated
  })

  console.log('Candidate event:', candidate)

  if (candidate) {
    ratingEvent.value = candidate
    showRatingPopup.value = true
  }
}

const closeRatingPopup = () => {
  showRatingPopup.value = false
  // Mark as skipped/rated so it doesn't show again immediately? 
  // User asked "show popup once", so maybe we should mark it even if skipped?
  // For now, if skipped, we might show it again next reload unless we mark it.
  // Let's mark it as 'skipped' or just 'rated' to prevent annoyance.
  if (ratingEvent.value) {
    localStorage.setItem(`rated_event_${ratingEvent.value.id}`, 'skipped')
  }
  ratingEvent.value = null
}

const handleRatingSubmit = (payload) => {
  if (ratingEvent.value) {
    const rating = typeof payload === 'object' ? payload.rating : payload
    const feedback = typeof payload === 'object' ? payload.feedback : ''
    
    localStorage.setItem(`rated_event_${ratingEvent.value.id}`, rating)
    if (feedback) {
      localStorage.setItem(`feedback_event_${ratingEvent.value.id}`, feedback)
    }
    
    // Here we could also save the rating to a backend or store
    console.log(`Rated event ${ratingEvent.value.id} with ${rating} stars. Feedback: ${feedback}`)
  }
  showRatingPopup.value = false
  ratingEvent.value = null
}

onMounted(() => {
  checkLogin()
  loadAvatar()
  window.addEventListener('avatar-changed', loadAvatar)
  window.addEventListener('auth-changed', () => {
    checkLogin()
    loadAvatar()
    // Check rating after a short delay to ensure store is ready/loaded
    setTimeout(checkRating, 500)
  })
  
  // Initial check removed to prevent auto-show on load
})

onUnmounted(() => {
  window.removeEventListener('avatar-changed', loadAvatar)
  window.removeEventListener('auth-changed', checkLogin)
})

const toggleAuth = () => {
  // Logout logic
  localStorage.removeItem('user_token')
  localStorage.removeItem('user_role')
  localStorage.removeItem('user_avatar')
  
  isLoggedIn.value = false
  
  // Force reload to clear any state
  window.location.href = '/'
}
</script>

<style>
/* ========= BRAND TOKENS ========= */
:root {
 --brand: #372D2D;    
  --brand-600: #241D1D;   
  --brand-200: #EBE8E8;

  --page: #ffffff;
  --card: #ffffff;

  --ink: #153226;
  --muted: #6b7c74;
  --outline: #d8eadb;

  --shadow: 0 3px 10px rgba(0, 0, 0, 0.06);

  /* Cat Colors */
  --cat-body: #ffe8d4;
  --cat-outline: #e1c0a4;
}

/* ========= RESET ========= */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: "Inter", system-ui, -apple-system, "Segoe UI", sans-serif;
  background: var(--page);
  color: var(--ink);
}

.layout-wrapper {
  min-height: 100vh;
  background: var(--page);
}

.page-content {
  background: var(--page);
}

/* ========= TOP STRIP + NAVBAR ========= */

.top-bar {
  width: 100%;
  height: 14px;
  background: #372D2D;
}

.navbar {
  background: var(--page);
  position: relative;
  overflow: visible;
}

.nav-inner {
  /* max-width, margin, padding handled by .standard-layout-container */
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  position: relative;
  z-index: 2;
}

.nav-bottom-line {
  height: 2px;
  background: #372D2D;
  opacity: 0.6;
}

/* left: logo + tabs */

.nav-left {
  display: flex;
  align-items: center;
  position: relative; /* For cat positioning */
}

.logo {
  margin-right: 48px;
  font-family: 'Nunito', sans-serif;
  font-weight: 900;
  font-size: 40px;
  letter-spacing: -1px;
  color: #372D2D;
  text-decoration: none;
  position: relative;
  z-index: 5; /* Letters above cat when cat is behind */
}

/* each letter is separate so cat passes behind them */
.logo-letter {
  position: relative;
  display: inline-block;
  z-index: 5;
}

.tabs {
  display: flex;
  gap: 28px;
}

.tab {
  font-size: 16px;
  font-weight: 500;
  text-decoration: none;
  color: #333;
  padding-bottom: 6px;
  position: relative;
  z-index: 5;
}

.tab.is-active {
  border-bottom: 2px solid #372D2D;
}

/* center: search bar */

.nav-center {
  display: flex;
  justify-content: center;
}

.global-search {
  width: 40vw;
  max-width: 500px;
  min-width: 320px;
  height: 44px;
  padding: 0 18px;
  border-radius: 26px;
  background: #EAE6E6;
  display: flex;
  align-items: center;
  position: relative;
  z-index: 5;
}

.global-search input {
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  font-size: 15px;
  color: #4A3C3C;
}

.global-search input::placeholder {
  color: #A39696;
}

.search-btn {
  background: none;
  border: none;
  color: #372D2D;
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.2s;
}

.search-btn:hover {
  opacity: 0.7;
}

/* right: avatar / sign in */

.nav-right {
  display: flex;
  justify-content: flex-end;
  align-items: center; /* Fix vertical alignment */
  position: relative;
  z-index: 5;
}

.icon-btn-link {
  text-decoration: none;
  display: flex; /* Ensure link behaves as flex container */
  align-items: center;
}

.icon-btn {
  width: 48px;
  height: 48px;
  border-radius: 999px;
  border: none;
  background: #EAE6E6;
  display: grid;
  place-items: center;
  cursor: pointer;
}

.icon-btn i {
  color: #372D2D;
}

.sign-in-btn {
  display: inline-flex;
  align-items: center;
  background: none;
  border: none;
  font-size: 16px;
  font-weight: 600;
  color: #FF654A;
  cursor: pointer;
  padding: 8px 20px;
  white-space: nowrap;
  transition: opacity 0.2s;
  text-decoration: none;
}

.sign-in-btn:hover {
  opacity: 0.8;
}

/* ------------ CUTE WALKING CAT ------------ */

.nav-walker {
  position: absolute;
  top: 50%;
  left: 0;
  width: 52px;
  height: 52px;
  pointer-events: none;
  z-index: 1; /* Default behind */
  animation: walker-orbit 12s linear infinite;
  /* Scale down to look small */
  transform-origin: center bottom;
}

.cat {
  position: relative;
  width: 100%;
  height: 100%;
  transform: scale(0.4); /* Make it smallllll */
}

/* Tail */
.cat-tail {
  position: absolute;
  right: 6px;
  bottom: 14px;
  width: 18px;
  height: 8px;
  border-radius: 12px;
  background: var(--cat-body);
  box-shadow: 0 0 0 1.5px var(--cat-outline);
  transform-origin: left center;
  animation: cat-tail-wag 0.6s ease-in-out infinite alternate;
}

/* Body */
.cat-body {
  position: absolute;
  left: 10px;
  bottom: 8px;
  width: 28px;
  height: 22px;
  border-radius: 12px;
  background: var(--cat-body);
  box-shadow: 0 0 0 1.5px var(--cat-outline);
  animation: cat-bob 0.55s ease-in-out infinite;
}

/* Head */
.cat-head {
  position: absolute;
  left: 10px;
  bottom: 26px;
  width: 24px;
  height: 22px;
  border-radius: 12px;
  background: var(--cat-body);
  box-shadow: 0 0 0 1.5px var(--cat-outline);
}

/* Ears */
.cat-ear {
  position: absolute;
  width: 10px;
  height: 10px;
  background: var(--cat-body);
  box-shadow: 0 0 0 1.5px var(--cat-outline);
  transform: rotate(45deg);
  top: -4px;
}

.cat-ear.left {
  left: 2px;
}

.cat-ear.right {
  right: 2px;
}

/* Face */
.cat-eye {
  position: absolute;
  top: 7px;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #3c3a34;
}

.cat-eye.left {
  left: 6px;
}

.cat-eye.right {
  right: 6px;
}

.cat-nose {
  position: absolute;
  top: 11px;
  left: 50%;
  width: 4px;
  height: 3px;
  border-radius: 2px;
  background: #f58f8f;
  transform: translateX(-50%);
}

.cat-whisker {
  position: absolute;
  top: 12px;
  width: 8px;
  height: 1.5px;
  background: #c79f7f;
}

.cat-whisker.left-1 {
  left: 1px;
}
.cat-whisker.left-2 {
  left: 1px;
  top: 14px;
}
.cat-whisker.right-1 {
  right: 1px;
}
.cat-whisker.right-2 {
  right: 1px;
  top: 14px;
}

/* Scarf */
.cat-scarf {
  position: absolute;
  left: 8px;
  bottom: 24px;
  width: 18px;
  height: 7px;
  border-radius: 6px;
  background: #372D2D;
}

.cat-scarf-end {
  position: absolute;
  left: 16px;
  bottom: 18px;
  width: 6px;
  height: 10px;
  border-radius: 4px;
  background: #372D2D;
}

/* Legs */
.cat-leg {
  position: absolute;
  bottom: 0;
  width: 7px;
  height: 14px;
  border-radius: 4px;
  background: var(--cat-body);
  box-shadow: 0 0 0 1.3px var(--cat-outline);
  transform-origin: top center;
}

.cat-leg.left {
  left: 13px;
  animation: cat-leg-left 0.35s ease-in-out infinite alternate;
}

.cat-leg.right {
  left: 22px;
  animation: cat-leg-right 0.35s ease-in-out infinite alternate;
}

/* WALKING PATH (ORBIT) */
@keyframes walker-orbit {
  0% {
    left: -20px;
    transform: translateY(-50%) scaleX(1); /* Face Right */
    z-index: 1; /* Behind */
  }
  45% {
    left: 120px; /* End of logo */
    transform: translateY(-50%) scaleX(1);
    z-index: 1;
  }
  50% {
    left: 120px;
    transform: translateY(-50%) scaleX(-1); /* Turn Left */
    z-index: 10; /* In Front */
  }
  95% {
    left: -20px;
    transform: translateY(-50%) scaleX(-1);
    z-index: 10;
  }
  100% {
    left: -20px;
    transform: translateY(-50%) scaleX(1); /* Reset */
    z-index: 1;
  }
}

/* Cute motion */
@keyframes cat-bob {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-3px);
  }
}

@keyframes cat-leg-left {
  0% {
    transform: rotate(18deg);
  }
  100% {
    transform: rotate(-10deg);
  }
}

@keyframes cat-leg-right {
  0% {
    transform: rotate(-10deg);
  }
  100% {
    transform: rotate(18deg);
  }
}

@keyframes cat-tail-wag {
  0% {
    transform: rotate(10deg);
  }
  100% {
    transform: rotate(-12deg);
  }
}

/* ========= RESPONSIVE ========= */

@media (max-width: 768px) {
  /* 1. Aggressively Hide Search */
  .nav-center,
  .global-search,
  .search-bar,
  header form,
  header input {
    display: none !important;
  }

  /* 2. Unhide & Style Tabs */
  .nav-left .tabs {
    display: flex !important;
    gap: 12px; /* Consistent gap between links */
    margin-left: 12px; /* Consistent gap between Logo and Tabs */
    overflow: visible;
  }

  .nav-left .tab {
    display: block !important;
    font-size: 13px; /* Readable size */
    padding-bottom: 4px;
    white-space: nowrap;
    margin-right: 0 !important;
  }

  /* 3. Force Horizontal Layout */
  .nav-inner {
    display: flex !important;
    flex-direction: row !important;
    justify-content: space-between !important; /* Logo+Tabs Left, Icon Right */
    align-items: center !important;
    padding: 12px 16px;
    gap: 0;
  }

  .nav-left {
    display: flex !important;
    align-items: center !important;
    width: auto !important;
    flex: 1; /* Allow growing to push icon if needed, but space-between handles it */
  }

  .nav-right {
    display: flex !important;
    justify-content: flex-end !important;
    width: auto !important;
    margin-left: 12px; /* Gap between Events and Icon */
  }

  .logo {
    margin-right: 0 !important;
    font-size: 18px; /* Balanced logo size */
  }

  /* 4. Shrink Icon (User Avatar) */
  .icon-btn {
    width: 32px;
    height: 32px;
  }
  
  .icon-btn :deep(.el-avatar) {
    --el-avatar-size: 32px !important;
  }

  /* 5. Sign In Button (Text Mode) */
  .sign-in-btn {
    font-size: 12px !important;
    width: auto !important;
    height: auto !important;
    padding: 6px 10px !important;
    border-radius: 4px !important;
    background-color: transparent !important;
    color: #FF654A !important;
    display: inline-flex !important;
    text-decoration: none !important;
  }

  .sign-in-btn::after {
    display: none !important;
  }

  /* 6. Responsive Cat */
  .cat {
    transform: scale(0.25); /* Smaller on mobile */
  }

  .nav-walker {
    animation-name: walker-orbit-mobile; /* Use shorter path */
    left: -10px; /* Adjust start pos */
  }
}

@keyframes walker-orbit-mobile {
  0% {
    left: -10px;
    transform: translateY(-50%) scaleX(1);
    z-index: 1;
  }
  45% {
    left: 60px; /* Shorter distance for smaller logo */
    transform: translateY(-50%) scaleX(1);
    z-index: 1;
  }
  50% {
    left: 60px;
    transform: translateY(-50%) scaleX(-1);
    z-index: 10;
  }
  95% {
    left: -10px;
    transform: translateY(-50%) scaleX(-1);
    z-index: 10;
  }
  100% {
    left: -10px;
    transform: translateY(-50%) scaleX(1);
    z-index: 1;
  }
}
</style>
