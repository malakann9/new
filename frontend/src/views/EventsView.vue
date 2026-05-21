<template>
  <main class="page-wrap">
    <!-- HEADER ROW -->
    <section class="events-header">
      <div>
        <h1 class="events-title">Events</h1>
        <p class="events-subtitle">
          Explore upcoming events and manage your registrations.
        </p>
      </div>

      <!-- Create button for admin + super_admin -->
      <button
        v-if="canCreateEvent"
        id="openCreateEventModal"
        class="primary-btn"
        @click="openModal('create')"
      >
        + Create Event
      </button>
    </section>

    <!-- FILTERS -->
    <section class="events-filters">
      <div class="filters-pills">
        <button
          class="filter-pill"
          :class="{ 'is-active': activeFilter === 'upcoming' }"
          @click="activeFilter = 'upcoming'"
        >
          Upcoming
        </button>
        <button
          class="filter-pill"
          :class="{ 'is-active': activeFilter === 'past' }"
          @click="activeFilter = 'past'"
        >
          Past
        </button>
        <button
          class="filter-pill"
          :class="{ 'is-active': activeFilter === 'all' }"
          @click="activeFilter = 'all'"
        >
          All
        </button>
      </div>
    </section>

    <!-- EVENTS LIST -->
    <section class="events-list" id="eventsList">
      <article v-for="event in filteredEvents" :key="event.id" class="event-card">
        <div class="event-date-pill">
          <span class="event-date-day">{{ getDay(event.date) }}</span>
          <span class="event-date-month">{{ getMonth(event.date) }}</span>
        </div>

        <div class="event-main">
          <h2 class="event-name">{{ event.name }}</h2>
          <p class="event-desc">{{ event.description }}</p>
          <div class="event-meta">
            <span v-if="event.time"><i class="fas fa-clock"></i> {{ event.time }}</span>
            <span><i class="fas fa-location-dot"></i> {{ event.location }}</span>
            <span><i class="fas fa-users"></i> {{ event.capacity }} seats</span>
            <span><i class="fas fa-users-viewfinder"></i> {{ event.community_name }}</span>

            <span
              class="rating-meta"
              v-if="event.rating && isPast(event)"
            >
              <i class="fas fa-star" style="color: #fcc419;"></i>
              {{ event.rating }} ({{ event.ratingCount }})
            </span>
          </div>
        </div>

        <div class="event-actions">
          <button
            class="event-primary-btn"
            @click="register(event)"
            v-if="!isPast(event)"
          >
            {{ event.registered ? 'Registered' : 'Register' }}
          </button>

          <button
            v-if="store.canEditEvent(event)"
            class="event-edit-btn"
            type="button"
            @click="openModal('edit', event)"
          >
            <i class="fas fa-pen"></i> Edit
          </button>

          <button
            v-if="store.canEditEvent(event)"
            class="event-delete-btn"
            type="button"
            @click="deleteEvent(event)"
          >
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </article>

      <div
        v-if="filteredEvents.length === 0"
        style="text-align:center; color:var(--muted); padding:20px;"
      >
        No events found.
      </div>
    </section>
  </main>

  <!-- CREATE / EDIT EVENT MODAL -->
  <div
    class="modal-overlay"
    :class="{ 'is-open': isModalOpen }"
    aria-hidden="true"
    @click.self="closeModal"
  >
    <div class="modal-card">
      <button class="modal-close" aria-label="Close" @click="closeModal">
        <span>&times;</span>
      </button>

      <h2 class="modal-title">
        {{ modalMode === 'create' ? 'Create Event' : 'Edit Event' }}
      </h2>

        <div class="modal-upload-label">Upload Image <span style="font-weight:normal; color:#666; font-size:0.85em;">(Optional)</span></div>
        <div class="modal-upload-box">
        <div class="upload-icon">
          <i class="fas fa-upload"></i>
        </div>
        <p class="upload-text">Max 120 MB, PNG, JPEG</p>

        <!-- ✅ IMPORTANT: This input is now connected and saves a real File -->
        <label class="upload-btn" for="eventImage">
          Browse File
          <input
            id="eventImage"
            name="eventImage"
            type="file"
            accept="image/png, image/jpeg"
            hidden
            @change="onFileChange"
          />
        </label>

        <p v-if="selectedFileName" style="margin-top: 10px; font-size: 12px; color: #475569;">
          Selected: <b>{{ selectedFileName }}</b>
        </p>
      </div>

      <form @submit.prevent="submitForm" class="modal-form">
        <h3 class="form-section-title">Main Details</h3>

        <div class="form-row">
          <div class="form-field">
            <label for="eventName">Event Name</label>
            <input type="text" id="eventName" name="eventName" v-model="formData.name" required />
          </div>

          <div class="form-field">
            <label for="eventDate">Date</label>
            <input type="date" id="eventDate" name="eventDate" v-model="formData.date" required />
          </div>
        </div>
        <div class="form-field">
          <label for="eventTime">Time</label>
          <input type="time" id="eventTime" name="eventTime" v-model="formData.time" required />
        </div>
        <div class="form-row">
          <div class="form-field">
            <label for="eventLocation">Location</label>
            <input type="text" id="eventLocation" name="eventLocation" v-model="formData.location" />
          </div>

          <!-- ✅ REPLACED: no more hardcoded clubs -->
          <div class="form-field">
            <label for="eventClub">Club</label>
            <select id="eventClub" name="eventClub" v-model="formData.community_id" :disabled="communitySelectLocked" required>
              <option value="">Select a club</option>
              <option v-for="c in communityOptions" :key="c.id" :value="String(c.id)">
                {{ c.name }}
              </option>
            </select>
            <small style="color: var(--muted); font-size: 11px;">
              Admin: only your club. Super admin: all clubs.
            </small>
          </div>
        </div>

        <div class="form-field">
          <label for="eventCapacity">Capacity</label>
          <input type="number" id="eventCapacity" name="capacity" v-model="formData.capacity" min="1" required />
        </div>

        <div class="form-field">
          <label for="eventDescription">Description</label>
          <textarea id="eventDescription" name="eventDescription" v-model="formData.description" rows="4"></textarea>
        </div>

        <div class="modal-actions">
          <button type="button" class="btn-secondary" @click="closeModal">
            Cancel
          </button>
          <button type="submit" class="btn-primary">
            {{ modalMode === 'create' ? 'Submit' : 'Save Changes' }}
          </button>
        </div>
      </form>
    </div>
  </div>

  <ConfettiOverlay v-if="showCelebration" @close="showCelebration = false" />
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { store } from '../store.js'
import ConfettiOverlay from '../components/ConfettiOverlay.vue'
import { useToast } from "vue-toastification";
import { apiFetch } from '../api' // this will include Authorization if you used my updated api.js

const route = useRoute()
const router = useRouter()
const toast = useToast()
const showCelebration = ref(false)

/* =========================
   ADMIN CHECK
   ========================= */
const isAdmin = ref(false)

/* =========================
   COMMUNITY DROPDOWN (NEW)
   ========================= */
const communityOptions = ref([])              // [{id,name}]
const communitySelectLocked = ref(false)      // admin gets only one option
const selectedFile = ref(null)               // actual File
const selectedFileName = ref("")

const canCreateEvent = computed(() => {
  const role = String(store.userRole || localStorage.getItem("user_role") || "").toLowerCase()
  return role === "admin" || role === "super_admin" || role === "superadmin"
})

// 🔥 Instantly update the event locally without reload
const updateLocalEvent = (id, registeredState) => {
  const target = store.events.find(e => e.id === id);
  if (target) {
    target.registered = registeredState; // Vue triggers re-render
  }
};

async function loadCommunityOptions() {
  const role = localStorage.getItem('user_role')
  const isSuper = (role === 'super_admin' || role === 'superadmin')
  
  let list = []
  if (isSuper) {
    // Super Admin: get ALL communities
    const res = await apiFetch("/api/general/communities")
    list = await res.json()
  } else {
    // Regular Admin: get ONLY my communities
    const res = await apiFetch("/api/general/communities/options")
    list = await res.json()
  }
  
  communityOptions.value = Array.isArray(list) ? list : []

  // If regular admin has exactly 1 option => lock it
  // Super admin always unlocked (unless 0 options, but that's edge case)
  if (!isSuper && communityOptions.value.length === 1) {
    formData.community_id = String(communityOptions.value[0].id)
    communitySelectLocked.value = true
  } else {
    communitySelectLocked.value = false
    // keep existing selection if any, else empty
    if (!formData.community_id) formData.community_id = ""
  }
}

function onFileChange(e) {
  const file = e.target.files?.[0] || null
  selectedFile.value = file
  selectedFileName.value = file ? file.name : ""
}

/* =========================
   FILTERS
   ========================= */
const activeFilter = ref('upcoming')
const searchQuery = ref('')

const filteredEvents = computed(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  let events = store.events

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    events = events.filter(e => {
      try {
        const name = (e.name || '').toLowerCase()
        const desc = (e.description || '').toLowerCase()
        const loc = (e.location || '').toLowerCase()
        const club = (e.community_name || '').toLowerCase()
        return name.includes(query) || desc.includes(query) || loc.includes(query) || club.includes(query)
      } catch {
        return false
      }
    })
  }

  if (route.query.filter === 'registered') {
    events = events.filter(e => e.registered)
  }

  return events.filter(event => {
  const dt = toEventDateTime(event)
  const past = dt ? dt < new Date() : false

  if (activeFilter.value === 'upcoming') return !past
  if (activeFilter.value === 'past') return past
  return true
}).sort((a, b) => {
  const dtA = toEventDateTime(a)
  const dtB = toEventDateTime(b)
  const now = new Date()

  const isPastA = dtA ? dtA < now : false
  const isPastB = dtB ? dtB < now : false

  if (!isPastA && isPastB) return -1
  if (isPastA && !isPastB) return 1

  if (!isPastA && !isPastB) return dtA - dtB
  if (isPastA && isPastB) return dtB - dtA
  return 0
})
})

/* =========================
   INITIAL LOAD
   ========================= */
onMounted(async () => {
  // 0) auth sync (login -> route geçişlerinde role stale kalmasın)
  store.refreshAuth()

  // 1 communities load (edit/delete butonları için ŞART)
  

  // 2 Events list
  const res = await apiFetch("/api/general/events")
  const data = await res.json()
  store.events = data

  // 3 Admin check (istersen kalsın, ama bu ref’i aslında artık kullanmıyorsun)
  const role = String(localStorage.getItem('user_role') || "").toLowerCase()
  isAdmin.value = role === 'admin' || role === 'super_admin' || role === 'superadmin'

  // 4 route filters
  if (route.query.filter === 'upcoming') activeFilter.value = 'upcoming'
  else if (route.query.filter === 'registered') activeFilter.value = 'all'

  if (route.query.search) {
    searchQuery.value = route.query.search
    activeFilter.value = 'all'
  }
})

watch(() => route.query.filter, (newVal) => {
  if (newVal === 'upcoming') activeFilter.value = 'upcoming'
  else if (newVal === 'registered') activeFilter.value = 'all'
})

watch(() => route.query.search, (newVal) => {
  searchQuery.value = newVal || ''
  if (newVal) activeFilter.value = 'all'
})

const toEventDateTime = (event) => {
  if (!event || !event.date) return null
  const t = event.time && String(event.time).trim() ? String(event.time).trim() : "00:00"
  const dt = new Date(`${event.date}T${t}`)
  return isNaN(dt.getTime()) ? null : dt
}

/* =========================
   DATE HELPERS
   ========================= */
const getDay = (dateStr) => {
  const date = new Date(dateStr)
  return date.getDate().toString().padStart(2, '0')
}

const getMonth = (dateStr) => {
  const date = new Date(dateStr)
  return date.toLocaleString('default', { month: 'short' }).toUpperCase()
}

const isPast = (event) => {
  const dt = toEventDateTime(event)
  if (!dt) return false
  return dt < new Date()
}

/* =========================
   MODAL LOGIC
   ========================= */
const isModalOpen = ref(false)
const modalMode = ref('create')

const formData = reactive({
  id: null,
  name: '',
  date: '',
  time: '',
  location: '',
  community_id: '',   // ✅ NEW: use id not club name
  capacity: '',
  description: ''
})

const openModal = async (mode, event = null) => {
  modalMode.value = mode

  // ✅ Always load DB communities when opening modal
  await loadCommunityOptions()

  if (mode === 'edit' && event) {
    formData.id = event.id
    formData.name = event.name
    formData.date = event.date
    formData.time = event.time || ''
    formData.location = event.location
    formData.capacity = event.capacity
    formData.description = event.description

    // ✅ FIXED: Populate the community ID if it exists
    formData.community_id = event.community_id ? String(event.community_id) : ""
  } else {
    formData.id = null
    formData.name = ''
    formData.date = ''
    formData.time = ''
    formData.location = ''
    formData.capacity = ''
    formData.description = ''
    // keep community_id if locked admin
    if (!communitySelectLocked.value) formData.community_id = ''
  }

  // reset file on open
  selectedFile.value = null
  selectedFileName.value = ""

  isModalOpen.value = true
  document.body.style.overflow = 'hidden'
}

const closeModal = () => {
  isModalOpen.value = false
  document.body.style.overflow = ''
}

/* =========================
   SUBMIT (CREATE)
   ========================= */
const submitForm = async () => {
  // 1. Kulüp seçili mi kontrolü
  if (!formData.community_id) {
    toast.error("Please select a club.");
    return;
  }

  const capacityNum = Number(formData.capacity);
  if (!formData.capacity || isNaN(capacityNum) || capacityNum <= 0) {
    toast.error("Capacity must be at least 1");
    return;
  }

  const fd = new FormData();
  // Backend hem 'name' hem 'title' alabilsin diye ikisini de ekliyoruz
  
  fd.append("title", formData.name); 
  fd.append("date", formData.date);
  fd.append("time", formData.time);
  fd.append("location", formData.location);
  fd.append("capacity", capacityNum);
  fd.append("description", formData.description);
  fd.append("community_id", formData.community_id);

  if (selectedFile.value) {
    fd.append("image", selectedFile.value);
  }
  try {
    if (modalMode.value === 'create') {
      // --- SADECE CREATE ---
      const res = await apiFetch("/api/general/events/create", {
        method: "POST",
        body: fd
      });
      if (!res.ok) throw new Error("Creation failed");
      toast.success("Event created! 🎉");
    } else {
      // --- SADECE EDIT ---
      const success = await store.updateEvent(formData.id, fd);
      if (!success) return; 
      toast.success("Event updated! ✏️");
    }

    // Listeyi tazele ve kapat
    const eventsRes = await apiFetch("/api/general/events");
    store.events = await eventsRes.json();
    closeModal();
  } catch (err) {
    toast.error(err.message || "Something went wrong");
  }
};

/* =========================
   DELETE + REGISTER
   ========================= */
const deleteEvent = (event) => {
  if (confirm('Are you sure you want to delete this event?')) {
    store.deleteEvent(event.id)
  }
}

const register = async (event) => {
  if (!localStorage.getItem('user_token')) {
    toast.warning('Please sign in to register.');
    router.push('/login');
    return;
  }

  if (event.registered) {
    const ok = await store.unregisterEvent(event.id);
    if (ok) {
      updateLocalEvent(event.id, false); // 🔥 instant unregistered
      toast.info("You have unregistered from the event.");
    }
  } else {
    const ok = await store.registerEvent(event.id);
    if (ok) {
      updateLocalEvent(event.id, true); // 🔥 instant registered
      toast.success("Successfully registered! 🎉");
      showCelebration.value = true;
    }
  }
};


</script>

<style scoped>
/* (YOUR ORIGINAL CSS UNCHANGED BELOW) */

/* ========= PAGE WRAP ========= */

.page-wrap {
  max-width: 1180px;
  margin: 18px auto 56px;
  padding: 0 20px 40px;
}

/* ========= HEADER + FILTERS ========= */

.events-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.events-title {
  font-size: 22px;
  font-weight: 700;
}

.events-subtitle {
  font-size: 13px;
  color: var(--muted);
  margin-top: 4px;
}

/* create button */

.primary-btn {
  border: none;
  border-radius: 6px;
  background: var(--brand);
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
  padding: 8px 18px;
  cursor: pointer;
}

.events-filters {
  margin-bottom: 16px;
}

.filters-pills {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.filter-pill {
  border-radius: 20px;
  border: 1px solid #EBE8E8;
  background: #F4F2F2;
  padding: 5px 14px;
  font-size: 12px;
  font-weight: 500;
  color: #372D2D;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.filter-pill:hover {
  background: #EAE6E6;
  border-color: #DEDADA;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transform: translateY(-1px);
}

.filter-pill.is-active {
  border-color: #372D2D;
  background: #372D2D;
  color: #ffffff;
}

/* ========= EVENT CARDS ========= */

.events-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.event-card {
  display: grid;
  grid-template-columns: 64px minmax(0, 1fr) auto;
  align-items: flex-start;
  background: #ffffff;
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.03);
  padding: 20px 24px;
  gap: 24px;
  border: 1px solid transparent;
  transition: all 0.2s ease;
}

.event-card:hover {
  box-shadow: 0 6px 16px rgba(0,0,0,0.06);
  transform: translateY(-1px);
}

/* date pill */

.event-date-pill {
  width: 64px;
  height: 64px;
  border-radius: 14px;
  background: #F4F2F2;
  border: 1px solid #EBE8E8;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #372D2D;
  flex-shrink: 0;
}

.event-date-day {
  font-size: 20px;
  line-height: 1;
  font-weight: 800;
  color: #372D2D;
  margin-bottom: 2px;
}

.event-date-month {
  font-size: 11px;
  letter-spacing: 0.5px;
  line-height: 1;
  text-transform: uppercase;
  font-weight: 700;
  color: #372D2D;
}

/* middle */

.event-main {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-top: 2px;
}

.event-name {
  font-size: 17px;
  font-weight: 800;
  line-height: 1.3;
  color: #0f172a;
  margin: 0;
}

.event-desc {
  font-size: 14px;
  color: #64748b;
  line-height: 1.5;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.event-meta {
  margin-top: 8px;
  font-size: 13px;
  color: #4A3C3C;
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
  font-weight: 500;
}

.event-meta span {
  display: flex;
  align-items: center;
  gap: 6px;
}

.event-meta i {
  color: #4A3C3C;
  font-size: 14px;
}

/* right */

.event-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
  padding-top: 4px;
  min-width: 100px;
}

.event-primary-btn {
  border-radius: 999px;
  border: none;
  background: var(--brand);
  color: #ffffff;
  font-size: 13px;
  font-weight: 700;
  padding: 8px 24px;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
  text-align: center;
}

.event-primary-btn:hover {
  background: var(--brand);
  transform: translateY(-1px);
}

.event-primary-btn:disabled {
  opacity: 0.8;
  cursor: default;
  transform: none;
  background: var(--brand);
}

.event-edit-btn {
  border-radius: 999px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  color: #475569;
  font-size: 12px;
  font-weight: 600;
  padding: 6px 16px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
  justify-content: center;
}

.event-edit-btn:hover {
  border-color: #cbd5e1;
  background: #f8fafc;
  color: #334155;
}

.event-delete-btn {
  border-radius: 999px;
  border: 1px solid #fee2e2;
  background: #fff5f5;
  color: #dc2626;
  font-size: 12px;
  padding: 6px 12px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  width: 100%;
  justify-content: center;
}

/* ========= MODAL ========= */

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  display: none;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.modal-overlay.is-open {
  display: flex;
}

.modal-card {
  width: 420px;
  max-width: 95%;
  background: #ffffff;
  border-radius: 18px;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.2);
  padding: 20px 22px 18px;
  position: relative;
}

.modal-close {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 30px;
  height: 30px;
  border-radius: 999px;
  border: 1px solid #ffcc7a;
  background: #fff4e1;
  display: grid;
  place-items: center;
  cursor: pointer;
}

.modal-close span {
  font-size: 18px;
  line-height: 1;
  color: #f08c00;
}

.modal-title {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 4px;
}

.modal-upload-label {
  font-size: 12px;
  color: var(--muted);
  margin-bottom: 6px;
}

.modal-upload-box {
  border-radius: 10px;
  border: 1px dashed #e2e8f0;
  background: #ffffff;
  padding: 24px 16px 18px;
  text-align: center;
  margin-bottom: 16px;
}

.upload-icon {
  font-size: 22px;
  color: #111111;
  margin-bottom: 8px;
}

.upload-text {
  font-size: 12px;
  color: #5C676D;
  margin-bottom: 10px;
}

.upload-btn {
  display: inline-block;
  border-radius: 20px;
  background: #111111;
  color: white;
  font-size: 12px;
  padding: 7px 22px;
  cursor: pointer;
}

.modal-form {
  font-size: 12px;
}

.form-section-title {
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 8px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 8px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 3px;
  margin-bottom: 8px;
  min-width: 0; /* Prevents long select options from pushing the card width */
}

.form-field label {
  font-size: 11px;
  color: #5C6661;
}

.modal-form input,
.modal-form textarea,
.modal-form select {
  width: 100%;
  max-width: 100%;
  border-radius: 4px;
  border: 1px solid #dadfd4;
  padding: 6px 8px;
  font-size: 12px;
  font-family: inherit;
  outline: none;
  background: #ffffff;
  box-sizing: border-box; /* Ensure padding doesn't add to width */
}

.modal-form input:focus,
.modal-form textarea:focus,
.modal-form select:focus {
  border-color: var(--brand);
}

.modal-actions {
  margin-top: 10px;
  display: flex;
  justify-content: space-between;
  gap: 8px;
}

.btn-secondary,
.btn-primary {
  font-size: 13px;
  font-weight: 600;
  border-radius: 4px;
  border: none;
  padding: 8px 18px;
  cursor: pointer;
  flex: 1;
}

.btn-secondary {
  background: #e4e4e0;
  color: #333;
}

.btn-primary {
  background: var(--brand);
  color: #ffffff;
}

/* Responsive */
@media (max-width: 1200px) {
  .events-list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }

  .event-card {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .event-main {
    flex: 1;
    margin: 10px 0;
  }

  .event-card {
    display: grid;
    grid-template-columns: auto 1fr;
    grid-template-rows: auto auto;
    gap: 10px;
    height: auto;
    padding: 16px;
  }

  .event-date-pill {
    grid-column: 1;
    grid-row: 1;
    margin-right: 0;
  }

  .event-main {
    grid-column: 2;
    grid-row: 1;
    margin: 0;
  }

  .event-actions {
    grid-column: 1 / -1;
    grid-row: 2;
    flex-direction: row;
    justify-content: flex-end;
    width: 100%;
    margin-left: 0;
    margin-top: 10px;
    gap: 8px;
  }
}

@media (max-width: 768px) {
  .events-list {
    grid-template-columns: 1fr;
  }

  .nav-inner {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .nav-center {
    order: 3;
  }

  .nav-right {
    order: 2;
    justify-content: flex-start;
  }
}

@media (max-width: 640px) {
  .page-wrap {
    margin: 18px auto 32px;
    padding: 0 14px 30px;
  }

  .event-date-pill {
    margin-bottom: 10px;
  }
}
</style>
