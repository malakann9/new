<template>
  <div class="page-wrap">
    <!-- PROFILE BANNER -->
    <section class="profile-banner">
      <div class="profile-left">
        <!-- Dynamic Avatar using Element Plus -->
        <el-avatar 
          :size="100" 
          :src="userAvatar" 
          class="avatar-shadow"
          role="presentation" 
        />

        <div class="identity">
          <div class="name-row">
            <div class="name" :class="{ 'is-admin': user.role === 'admin' || user.role === 'super_admin' }">
              {{ user.name }}
            </div>
            
            <!-- Verified Icon for Admin -->
            <el-icon v-if="user.role === 'admin' || user.role === 'super_admin'" class="verified-icon" :size="20" color="#409EFF">
              <CircleCheckFilled />
            </el-icon>

            <!-- Admin Badge -->
            <el-tag 
              v-if="user.role === 'admin' || user.role === 'super_admin'" 
              :type="user.role === 'super_admin' ? 'warning' : 'success'" 
              size="small" 
              effect="dark" 
              round
            >
              {{ user.role === 'super_admin' ? 'Super Admin' : 'Admin' }}
            </el-tag>
          </div>
          <div class="sub">{{ user.sub }}</div>
        </div>
      </div>

      <div class="profile-right">
        <router-link to="/settings" style="text-decoration: none;">
          <button class="ghost-gear" aria-label="Settings">
            <i class="fas fa-gear"></i>
          </button>
        </router-link>
        <button class="logout" aria-label="Log Out" @click="logout">
          Log Out
          <i class="fas fa-arrow-right-from-bracket"></i>
        </button>
      </div>
    </section>

    <!-- ADMIN DASHBOARD (SUPER ADMIN ONLY) -->
    <div v-if="isSuperAdmin" class="admin-dashboard-section">
      <!-- KPI CARDS -->
      <section class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-icon"><i class="fas fa-university"></i></div>
          <div class="kpi-content">
            <h3>{{ stats.universities || 0 }}</h3>
            <p>Universities</p>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon"><i class="fas fa-users"></i></div>
          <div class="kpi-content">
            <h3>{{ stats.clubs || 0 }}</h3>
            <p>Communities</p>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon"><i class="fas fa-calendar-alt"></i></div>
          <div class="kpi-content">
            <h3>{{ stats.events || 0 }}</h3>
            <p>Events</p>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon"><i class="fas fa-user-graduate"></i></div>
          <div class="kpi-content">
            <h3>{{ stats.students || 0 }}</h3>
            <p>Students</p>
          </div>
        </div>
      </section>

      <!-- LEADERBOARD TABLE -->
      <section class="leaderboard-section">
        <div class="leaderboard-header">
          <h2>Community Leaderboard</h2>
          <div class="search-box">
            <label for="profileSearchInput" style="position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); border: 0;">Search community or president</label>
            <i class="fas fa-search search-icon"></i>
            <input 
              id="profileSearchInput"
              name="search"
              type="text" 
              v-model="searchQuery" 
              placeholder="Search community, president..." 
              class="search-input"
            />
          </div>
        </div>
        
        <div class="table-scroll-container">
          <table class="leaderboard-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Community Details</th>
                <th>Contact Info</th>
                <th>Events</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(comm, index) in filteredCommunities" :key="comm.name">
                <td>#{{ index + 1 }}</td>
                <td>
                  <div class="comm-details-cell">
                    <span class="comm-name">{{ comm.name }}</span>
                    <span class="comm-uni">{{ comm.university || 'N/A' }}</span>
                  </div>
                </td>
                <td>
                  <div class="contact-info-cell">
                    <span class="contact-name">{{ comm.president || 'Unknown' }}</span>
                    <a v-if="comm.email" :href="'mailto:' + comm.email" class="contact-email">{{ comm.email }}</a>
                  </div>
                </td>
                <td>
                  <span class="event-count-badge">{{ comm.count }}</span>
                </td>
              </tr>
              <tr v-if="filteredCommunities.length === 0">
                <td colspan="4" class="no-data">No matching results found</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>

    <!-- TABS UNDER PROFILE -->
    <section class="dual-tabs" :style="{ gridTemplateColumns: isSuperAdmin ? '1fr 1fr' : '1fr' }">
      <button 
        class="tabbtn" 
        :class="activePanel === 'events' ? 'solid' : 'outline'" 
        @click="activePanel = 'events'"
        :aria-pressed="activePanel === 'events'"
      >My Events</button>
      <button 
        v-if="isSuperAdmin"
        class="tabbtn" 
        :class="activePanel === 'applications' ? 'solid' : 'outline'" 
        @click="activePanel = 'applications'"
        :aria-pressed="activePanel === 'applications'"
        style="position: relative;"
      >
        Pending Apps
        <span v-if="pendingApplications.length > 0" class="notification-badge">{{ pendingApplications.length }}</span>
      </button>
    </section>

    <div v-show="activePanel === 'events'" class="panel is-active">
      <!-- UPCOMING EVENTS -->
      <section class="section-head">
        <h3>Upcoming Events</h3>
        <router-link to="/events?filter=upcoming" class="see-all">
          See All <i class="fas fa-caret-right"></i>
        </router-link>
      </section>

      <section class="slider-shell" aria-label="Upcoming Events">
        <button class="slide-btn left" type="button" @click="slide('upcoming', -1)">
          <i class="fas fa-chevron-left"></i>
        </button>

        <div class="slider-track" ref="upcomingTrack">
          <article class="card event-card" v-for="event in upcomingEvents" :key="event.id">
            <img :src="event.image" class="event-cover" :alt="event.name ? event.name + ' event cover' : 'Event cover image'" loading="lazy" @error="(e) => { e.target.onerror = null; e.target.src = '/placeholder.png' }" />
            <div class="event-body">
              <h4>{{ event.name }}</h4>
              <p>{{ event.date }}</p>
            </div>
            <router-link :to="'/events/' + event.id" class="view-pill">View</router-link>
          </article>
          <div v-if="upcomingEvents.length === 0" class="no-data-msg">
            No upcoming events found.
          </div>
        </div>

        <button class="slide-btn right" type="button" @click="slide('upcoming', 1)">
          <i class="fas fa-chevron-right"></i>
        </button>
      </section>

      <!-- NEAREST ACTIVITIES -->
      <section class="section-head">
        <h3>Nearest Activities</h3>
        <router-link to="/events?filter=registered" class="see-all">
          See All <i class="fas fa-caret-right"></i>
        </router-link>
      </section>

      <section class="slider-shell" aria-label="Nearest Activities">
        <button class="slide-btn left" type="button" @click="slide('activities', -1)">
          <i class="fas fa-chevron-left"></i>
        </button>

        <div class="slider-track" ref="activitiesTrack">
          <!-- Dynamic activities from store -->
          <article 
            class="card activity-card" 
            v-for="event in registeredEvents" 
            :key="event.id"
          >
            <img :src="event.image" class="event-cover" :alt="event.name ? event.name + ' event cover' : 'Event cover image'" loading="lazy" @error="(e) => { e.target.onerror = null; e.target.src = '/placeholder.png' }" />
            <div class="activity-content">
              <h4>{{ event.name }}</h4>
              <p>{{ event.date }} • {{ event.location }}</p>
            </div>
          </article>
          <div v-if="registeredEvents.length === 0" class="no-data-msg">
            No upcoming activities.
          </div>
        </div>

        <button class="slide-btn right" type="button" @click="slide('activities', 1)">
          <i class="fas fa-chevron-right"></i>
        </button>
      </section>

      <!-- PAST EVENTS -->
      <section class="section-head" v-if="pastEvents.length > 0">
        <h3>Past Events</h3>
        <button class="see-all" @click="openSeeAll('past')">
          See All <i class="fas fa-caret-right"></i>
        </button>
      </section>

      <section class="slider-shell" aria-label="Past Events" v-if="pastEvents.length > 0">
        <button class="slide-btn left" type="button" @click="slide('past', -1)">
          <i class="fas fa-chevron-left"></i>
        </button>

        <div class="slider-track" ref="pastTrack">
          <article class="card event-card" v-for="event in pastEvents" :key="event.id">
            <img :src="event.image" class="event-cover" :alt="event.name ? event.name + ' event cover' : 'Event cover image'" loading="lazy" @error="(e) => { e.target.onerror = null; e.target.src = '/placeholder.png' }" />
            <div class="event-body">
              <h4>{{ event.name }}</h4>
              <p>{{ event.date }}</p>
            </div>
            <button 
              v-if="isAdmin"
              class="view-registrations-btn"
              @click="openRegistrations(event)"
            >
              <i class="fas fa-users"></i> View Registrations
            </button>
            <button 
              v-else
              class="rate-pill" 
              style="position: absolute; right: 16px; bottom: 16px; background-color: #111111; color: white; border: none; border-radius: 20px; padding: 4px 12px; font-weight: bold; font-size: 12px;"
              :class="{ 'is-rated': isRated(event.id) }"
              @click="openRating(event)"
            >
              <template v-if="isRated(event.id)">
                <span style="display: flex; align-items: center; gap: 6px;">
                  <i class="fas fa-star" style="color: #fcc419;"></i>
                  {{ getEventRating(event.id) }}/5
                  <i class="fas fa-pen" style="font-size: 10px; margin-left: 4px; opacity: 0.7;"></i>
                </span>
              </template>
              <template v-else>
                <i class="fas fa-star"></i> Rate
              </template>
            </button>
          </article>
        </div>

        <button class="slide-btn right" type="button" @click="slide('past', 1)">
          <i class="fas fa-chevron-right"></i>
        </button>
      </section>
    </div>



    <!-- PENDING APPLICATIONS PANEL -->
    <div v-show="activePanel === 'applications'" class="panel is-active">
      <section class="section-head">
        <h3>Pending Club Applications</h3>
        <span class="community-count">{{ pendingApplications.length }} pending</span>
      </section>

      <div v-if="pendingApplications.length === 0" class="empty-state">
        <el-empty description="No pending applications" />
      </div>

      <section class="applications-container" aria-label="Pending Applications" v-else>
        <div class="app-list">
          <article class="app-card" v-for="app in pendingApplications" :key="app.id">
            <div class="app-info">
              <h4>{{ app.name }}</h4>
              <p class="app-desc">{{ app.short_description || app.description }}</p>
              <button class="view-details-btn" @click="openApplicationDetails(app)">
                View Details
              </button>
            </div>
            <div class="app-actions">
              <button class="app-reject-btn" @click="rejectApp(app.id)" :disabled="rejectingId === app.id">
                {{ rejectingId === app.id ? 'Rejecting...' : 'Reject' }}
              </button>
              <button class="app-approve-btn" @click="approveApp(app.id)" :disabled="approvingId === app.id">
                {{ approvingId === app.id ? 'Approving...' : 'Approve & Promote' }}
              </button>
            </div>
          </article>
        </div>
      </section>
    </div>

    <!-- SEE ALL OVERLAYS -->
    <div class="seeall-overlay" :class="{ 'is-open': seeAllTarget === 'events' }" @click.self="closeSeeAll">
      <div class="seeall-inner">
        <div class="seeall-header">
          <h2>All Upcoming Events</h2>
          <button class="seeall-close" type="button" aria-label="Close" @click="closeSeeAll">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="seeall-grid">
           <article class="card event-card" v-for="n in 8" :key="n"><button class="view-pill">View</button></article>
        </div>
      </div>
    </div>

    <div class="seeall-overlay" :class="{ 'is-open': seeAllTarget === 'activities' }" @click.self="closeSeeAll">
      <div class="seeall-inner">
        <div class="seeall-header">
          <h2>All Nearest Activities</h2>
          <button class="seeall-close" type="button" aria-label="Close" @click="closeSeeAll">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="seeall-grid">
          <article class="card activity-card" v-for="n in 8" :key="n"></article>
        </div>
      </div>
    </div>

    <div class="seeall-overlay" :class="{ 'is-open': seeAllTarget === 'past' }" @click.self="closeSeeAll">
      <div class="seeall-inner">
        <div class="seeall-header">
          <h2>All Past Events</h2>
          <button class="seeall-close" type="button" aria-label="Close" @click="closeSeeAll">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="seeall-grid">
          <article class="card event-card" v-for="event in pastEvents" :key="event.id">
            <img :src="event.image" class="event-cover" :alt="event.name ? event.name + ' event cover' : 'Event cover image'" loading="lazy" @error="(e) => { e.target.onerror = null; e.target.src = '/placeholder.png' }" />
            <div class="event-body">
              <h4>{{ event.name }}</h4>
              <p>{{ event.date }}</p>
            </div>
            <button 
              v-if="isAdmin"
              class="view-registrations-btn"
              @click="openRegistrations(event)"
            >
              <i class="fas fa-users"></i> View Registrations
            </button>
            <button 
              v-else
              class="rate-pill" 
              style="position: absolute; right: 16px; bottom: 16px; background-color: #111111; color: white; border: none; border-radius: 20px; padding: 4px 12px; font-weight: bold; font-size: 12px;"
              :class="{ 'is-rated': isRated(event.id) }"
              @click="openRating(event)"
            >
              <template v-if="isRated(event.id)">
                <span style="display: flex; align-items: center; gap: 6px;">
                  <i class="fas fa-star" style="color: #fcc419;"></i>
                  {{ getEventRating(event.id) }}/5
                  <i class="fas fa-pen" style="font-size: 10px; margin-left: 4px; opacity: 0.7;"></i>
                </span>
              </template>
              <template v-else>
                <i class="fas fa-star"></i> Rate
              </template>
            </button>
          </article>
        </div>
      </div>
    </div>

    <RatingPopup 
      v-if="ratingEvent"
      v-model="showRatingPopup"
      :event="ratingEvent"
      :initial-rating="currentRating"
      :initial-feedback="currentFeedback"
      :initial-anonymous="currentAnonymous"
      @close="closeRatingPopup"
      @submit="handleRatingSubmit"
    />

    <!-- Admin Registration Popup -->
    <el-dialog
      v-model="showRegistrationPopup"
      :title="registrationEvent?.name + ' - Registrations'"
      width="90%"
      class="event-detail-modal"
      append-to-body
    >
      <div class="registration-list">
        <div class="registration-summary">
          <strong>Total Registrations:</strong> {{ registrations.length }} / {{ registrationEvent?.capacity || 'Not Given' }}
        </div>

        <div v-if="loadingRegistrations" class="loading-state">
         Loading list...
        </div>

        <div v-else-if="registrationsError" class="empty-state">
         {{ registrationsError }}
        </div>

        <div v-else-if="registrations.length === 0" class="empty-state">
          No registrations yet.
         </div>

         <div v-else class="attendee-list">
           <div v-for="u in registrations" :key="u.id" class="attendee-item">
             <el-avatar 
               :size="40" 
               :src="u.avatar_url || ''"
               style="background-color: #f1f5f9; color: #111111; font-weight: 700; font-size: 14px; margin-right: 12px; flex-shrink: 0;"
             >
               {{ ((u.first_name?.charAt(0) || '') + (u.last_name?.charAt(0) || '')).toUpperCase() || '?' }}
             </el-avatar>
             <div class="attendee-info">
               <div class="attendee-name">{{ u.first_name }} {{ u.last_name }}</div>
              <div class="attendee-email">{{ u.email }}</div>
             </div>
           </div>
         </div>
       </div>
    </el-dialog>
<el-dialog
  v-model="showApplicationDialog"
  width="500px"
  title="Application Details"
  class="saas-modal"
  append-to-body
>
  <div v-if="selectedApplication" class="app-details-content">
    <div class="detail-row">
      <span class="detail-label">Name</span>
      <span class="detail-value">{{ selectedApplication.name }}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">University</span>
      <span class="detail-value">{{ selectedApplication.university }}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Description</span>
      <span class="detail-value">{{ selectedApplication.description }}</span>
    </div>
    <div class="detail-row" v-if="selectedApplication.short_description">
      <span class="detail-label">Short Desc</span>
      <span class="detail-value">{{ selectedApplication.short_description }}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Contact Person</span>
      <span class="detail-value">{{ selectedApplication.contact_person }}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Contact Email</span>
      <span class="detail-value"><a :href="'mailto:' + selectedApplication.contact_email">{{ selectedApplication.contact_email }}</a></span>
    </div>
    <div class="detail-row" v-if="selectedApplication.student_number">
      <span class="detail-label">Student No</span>
      <span class="detail-value">{{ selectedApplication.student_number }}</span>
    </div>
    <div v-if="selectedApplication.image" class="detail-image-box">
      <span class="detail-label">Club Image (Click to Expand)</span>
      <el-image 
        :src="selectedApplication.image" 
        :preview-src-list="[selectedApplication.image]"
        alt="Club Image" 
        class="detail-image"
        fit="contain"
        hide-on-click-modal
        style="cursor: pointer;"
      >
        <template #error>
          <div class="image-slot">Failed to load image</div>
        </template>
      </el-image>
    </div>
  </div>
</el-dialog>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { store } from '../store.js'
import { CircleCheckFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import RatingPopup from '../components/RatingPopup.vue'
import { useToast } from "vue-toastification";
import { apiFetch } from '../api'

const router = useRouter()
const activePanel = ref('events')
const toast = useToast();

const selectedApplication = ref(null)
const showApplicationDialog = ref(false)

const seeAllTarget = ref(null)
const upcomingTrack = ref(null)
const activitiesTrack = ref(null)
const pastTrack = ref(null)
const showRatingPopup = ref(false)
const ratingEvent = ref(null)
const ratedEvents = ref(new Set())

// Admin Registration Logic
const showRegistrationPopup = ref(false)
const registrationEvent = ref(null)

const registrations = ref([])
const loadingRegistrations = ref(false)
const registrationsError = ref("")

const openApplicationDetails = (app) => {
  selectedApplication.value = app
  showApplicationDialog.value = true
}

const openRegistrations = async (event) => {
  registrationEvent.value = event
  showRegistrationPopup.value = true

  registrations.value = []
  registrationsError.value = ""
  loadingRegistrations.value = true

  try {
    const data = await store.fetchParticipants(event.id)

    registrations.value = (Array.isArray(data) ? data : []).map((u) => ({
      id: u.id ?? u.user_id ?? u.email ?? Math.random(),
      first_name: u.first_name ?? (u.name ? String(u.name).split(" ")[0] : ""),
      last_name: u.last_name ?? (u.name ? String(u.name).split(" ").slice(1).join(" ") : ""),
      email: u.email ?? "",
      avatar_url: u.avatar_url ?? u.avatar ?? ""
    }))
  } catch (e) {
    registrationsError.value = e?.message || "Failed to load registrations."
    registrations.value = []
  } finally {
    loadingRegistrations.value = false
  }
}

// Admin logic
const stats = ref({
  universities: 0,
  clubs: 0,
  events: 0,
  students: 0,
  top_communities: [] // IMPORTANT: Must be 'top_communities', not 'top_universities'
})

const searchQuery = ref("")

const filteredCommunities = computed(() => {
  const query = searchQuery.value.toLowerCase().trim()
  const list = stats.value.top_communities || []
  
  if (!query) return list
  
  return list.filter(c => {
    return (c.name && c.name.toLowerCase().includes(query)) ||
           (c.university && c.university.toLowerCase().includes(query)) ||
           (c.president && c.president.toLowerCase().includes(query)) ||
           (c.email && c.email.toLowerCase().includes(query))
  })
})

// Fetch Stats
const fetchStats = async () => {
  try {
    const response = await apiFetch('/api/general/stats')
    const data = await response.json()
    console.log('Stats loaded:', data)
    stats.value = data
  } catch (error) {
    console.error('Failed to fetch stats:', error)
  }
}

// Reactive source for avatar
const storedAvatar = ref('')

// User data from localStorage
const user = reactive({
  name: 'Guest',
  role: 'user',
  sub: 'Student'
})

const isAdmin = computed(() => user.role === 'admin' || user.role === 'super_admin')
const isSuperAdmin = computed(() => user.role === 'super_admin')
const pendingApplications = ref([])
//const pendingApplications = computed(() => store.pendingApplications)
const approvingId = ref(null)

const rejectingId = ref(null);

const rejectApp = async (id) => {
  rejectingId.value = id;

  const result = await store.rejectApplication(id);

  if (result.success) {
    toast.success("Application rejected.");
    pendingApplications.value = pendingApplications.value.filter(app => app.id !== id);
  } else {
    toast.error("Failed to reject: " + (result.message || "Unknown error"));
  }

  rejectingId.value = null;
};

const approveApp = async (id) => {
  /*approvingId.value = id
  const result = await store.approveApplication(id, user.id || 1) // Fallback ID if not set
  
  if (result.success) {
    toast.success('Application approved and club promoted!')
  } else {
    toast.error('Failed to approve: ' + (result.message || 'Unknown error'))
  }
  approvingId.value = null*/
  const response = await apiFetch(`/api/general/communities/approve`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('user_token')}`
    },
    body: JSON.stringify({ id })
  })
  const data = await response.json()
  if (data.success) {
    toast.success('Application approved and club promoted!')
    // Remove approved application from local list
    pendingApplications.value = pendingApplications.value.filter(app => app.id !== id)
  } else {
    toast.error('Failed to approve: ' + (data.message || 'Unknown error'))
  }
}

const loadUserData = () => {
  const token = localStorage.getItem('user_token')
  if (token) {
    user.name = localStorage.getItem('user_name') || 'User'
    user.role = localStorage.getItem('user_role') || 'user'
    
    const major = localStorage.getItem('user_major') || 'Student'
    const gradYear = localStorage.getItem('user_grad_year')
    
    if (gradYear) {
      user.sub = `${major} • Class of ${gradYear}`
    } else {
      user.sub = major
    }
  }
}

const loadRatedEvents = () => {
  const keys = Object.keys(localStorage)
  const rated = new Set()
  keys.forEach(key => {
    if (key.startsWith('rated_event_')) {
      const id = parseInt(key.replace('rated_event_', ''))
      rated.add(id)
    }
  })
  ratedEvents.value = rated
}

const isRated = (eventId) => {
  const reviews = store.getReviewsByEventId(eventId)
  // Assuming current user is the one creating reviews in this local-only app
  // In a real app, we'd check review.userId === currentUser.id
  return reviews.some(r => r.isCurrentUser)
}

const getEventRating = (eventId) => {
  const reviews = store.getReviewsByEventId(eventId)
  const userReview = reviews.find(r => r.isCurrentUser)
  return userReview ? userReview.rating : 0
}

const toEventDateTime = (e) => {
  if (!e || !e.date) return null
  const time = e.time && String(e.time).trim() ? String(e.time).trim() : "00:00"
  const dt = new Date(`${e.date}T${time}`)
  return isNaN(dt.getTime()) ? null : dt
}


const registeredEvents = computed(() => {
  const now = new Date()
  return store.events
    .filter(e => e.registered && toEventDateTime(e) >= now)
    .sort((a, b) => toEventDateTime(a) - toEventDateTime(b))
})

const pastEvents = computed(() => {
  const now = new Date()

  return store.events
    .filter(e => {
      const isPast = toEventDateTime(e) < now

      // Super admin: tüm past eventler
      if (isSuperAdmin.value) return isPast

      // Admin: sadece kendi eventleri
      if (isAdmin.value) return store.canEditEvent(e) && isPast

      // User: sadece kayıt oldukları
      return e.registered && isPast
    })
    .sort((a, b) => toEventDateTime(b) - toEventDateTime(a))
})

const upcomingEvents = computed(() => {
  const now = new Date()
  return store.events
    .filter(e => toEventDateTime(e) >= now)
    .sort((a, b) => toEventDateTime(a) - toEventDateTime(b))
})


// Computed property for User Avatar
const userAvatar = computed(() => {
  if (storedAvatar.value) {
    return storedAvatar.value
  }
  // Default Letter Avatar using DiceBear Initials
  return `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}&backgroundColor=111111&textColor=ffffff`
})

const loadAvatar = () => {
  storedAvatar.value = localStorage.getItem('user_avatar') || ''
}

const loadPenginds = () => {
  apiFetch("/api/general/communities/pending", {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('user_token')}`
    }
  })
    .then(response => response.json())
    .then(data => {
      pendingApplications.value = Array.isArray(data) ? data : []
    })
}


onMounted(() => {
  loadUserData()
  loadAvatar()
  if (isSuperAdmin.value) {
    loadPenginds()
    fetchStats() // Fetch stats if super admin
  }

  window.addEventListener('avatar-changed', loadAvatar)
})

onUnmounted(() => {
  window.removeEventListener('avatar-changed', loadAvatar)
})

const logout = () => {
  localStorage.removeItem('user_token')
  localStorage.removeItem('user_role')
  localStorage.removeItem('user_avatar')
  window.location.href = '/'
}

const openSeeAll = (target) => {
  seeAllTarget.value = target
  document.body.style.overflow = 'hidden'
}

const closeSeeAll = () => {
  seeAllTarget.value = null
  document.body.style.overflow = ''
}

const slide = (trackName, direction) => {
  const track = trackName === 'upcoming' ? upcomingTrack.value : activitiesTrack.value
  if (!track) return

  const cards = track.querySelectorAll('.card')
  if (!cards.length) return

  const firstCard = cards[0]
  const styles = getComputedStyle(track)
  const gap = parseFloat(styles.gap || "0")
  const cardWidth = firstCard.getBoundingClientRect().width
  const step = cardWidth + gap

  track.scrollBy({
    left: direction * step,
    behavior: "smooth"
  })
}

const currentRating = ref(0)
const currentFeedback = ref('')
const currentAnonymous = ref(false)

const openRating = (event) => {
  ratingEvent.value = event
  
  // Fetch existing rating if any from store
  const reviews = store.getReviewsByEventId(event.id)
  const userReview = reviews.find(r => r.isCurrentUser)
  
  if (userReview) {
    currentRating.value = userReview.rating
    currentFeedback.value = userReview.comment
    currentAnonymous.value = userReview.isAnonymous
  } else {
    currentRating.value = 0
    currentFeedback.value = ''
    currentAnonymous.value = false
  }
  
  showRatingPopup.value = true
}

const closeRatingPopup = () => {
  showRatingPopup.value = false
  ratingEvent.value = null
  currentRating.value = 0
  currentFeedback.value = ''
  currentAnonymous.value = false
}

const handleRatingSubmit = (payload) => {
  if (ratingEvent.value) {
    const rating = typeof payload === 'object' ? payload.rating : payload
    const feedback = typeof payload === 'object' ? payload.feedback : ''
    const isAnonymous = typeof payload === 'object' ? payload.isAnonymous : false
    
    store.addReview({
      eventId: ratingEvent.value.id,
      user: isAnonymous ? 'Incognito User' : 'You', // Should match EventDetailsView logic
      rating: rating,
      comment: feedback,
      isCurrentUser: true,
      isAnonymous: isAnonymous
    })
    
    toast.success(`Rated event with ${rating} stars.`)
  }
  showRatingPopup.value = false
  ratingEvent.value = null
  currentRating.value = 0
  currentFeedback.value = ''
  currentAnonymous.value = false
}

</script>

<style scoped>

img {
  background-color: #e2e8f0;
}

/* =========================
   DESIGN TOKENS
   ========================= */
.page-wrap {
 --brand: #111111;    
  --brand-600: #000000;   
  --brand-200: #f1f5f9;

  --page: #ffffff;
  --panel: #f8fafc;
  --card: #ffffff;
  --card-soft: #f8fafc;

  --ink: #111111;
  --muted: #6b7280;
  --outline: #e2e8f0;

  --pill: #e2e8f0;
  --accent-orange: #f08c00;

  --r-md: 10px;
  --r-lg: 14px;
  --shadow: 0 3px 10px rgba(0, 0, 0, .06);
}

/* =========================
   PAGE LAYOUT
   ========================= */
.page-wrap {
  max-width: 1180px;
  margin: 18px auto 56px;
  padding: 0 20px;
  font-family: "Inter", system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif;
  color: var(--ink);
}

/* profile banner */
.profile-banner {
  background: var(--panel);
  border-radius: var(--r-lg);
  padding: 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.profile-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.avatar-shadow {
  box-shadow: var(--shadow);
  border: 4px solid #ffffff;
  background: #fff;
}

.identity .name-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.identity .name {
  font-size: 20px;
  font-weight: 700;
}

.identity .name.is-admin {
  color: var(--brand);
  font-weight: 800;
}

.verified-icon {
  display: flex;
  align-items: center;
}

.identity .sub {
  margin-top: 4px;
  font-size: 12px;
  font-weight: 500;
  color: #4e6d5c;
}

.profile-right {
  display: flex;
  align-items: center;
  gap: 14px;
}

.ghost-gear {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: var(--brand-200);
  display: grid;
  place-items: center;
  color: var(--brand-600);
  cursor: pointer;
  transition: all 0.2s;
}

.ghost-gear:hover {
  background: var(--brand);
  color: #ffffff;
}

.logout {
  border: none;
  background: transparent;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  font-weight: 600;
  color: #284738;
  cursor: pointer;
}

/* tabs row */
.dual-tabs {
  margin: 18px 0 16px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
}

.tabbtn {
  height: 40px;
  border-radius: var(--r-md);
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}

.tabbtn.solid {
  background: var(--brand);
  color: #fff;
  border: none;
}

.tabbtn.outline {
  background: transparent;
  border: 2px solid var(--brand);
  color: var(--brand);
}



.community-count {
  font-size: 14px;
  font-weight: 600;
  color: var(--muted);
}

.community-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.community-card {
  background: var(--card);
  border-radius: var(--r-lg);
  box-shadow: var(--shadow);
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 16px;
}

.community-cover {
  width: 100%;
  height: 140px;
  border-radius: var(--r-md);
  object-fit: cover;
  object-position: center;
}

.community-body h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: var(--ink);
}

.community-body p {
  margin: 8px 0 0;
  font-size: 14px;
  color: var(--muted);
  line-height: 1.5;
}

.community-meta {
  margin-top: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: var(--muted);
  gap: 12px;
}

.community-chip {
  padding: 4px 10px;
  border-radius: 999px;
  background: var(--brand-200);
  color: var(--brand);
  font-weight: 600;
  font-size: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
/* section headers */
.section-head {
  margin-top: 4px;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.section-head h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
}

.see-all {
  font-size: 14px;
  font-weight: 600;
  color: var(--accent-orange);
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  background: transparent;
  border: none;
  padding: 0;
  font-family: inherit;
}

/* =========================
   SLIDER (4 visible cards)
   ========================= */
.slider-shell {
  position: relative;
  margin-bottom: 30px;
}

.slider-track {
  display: flex;
  gap: 20px;
  overflow: hidden;
  scroll-behavior: smooth;
  padding: 4px 0 6px;
}

/* 4 visible on wide screens */
.card {
  flex: 0 0 calc((100% - 3 * 20px) / 4);
  border-radius: var(--r-lg);
  background: var(--card);
  box-shadow: var(--shadow);
  height: 220px;
  position: relative;
  scroll-snap-align: start;
}

/* Upcoming events look */
.event-card {
  background: var(--card);
  padding: 10px;
  display: flex;
  flex-direction: column;
}

.event-cover {
  width: 100%;
  height: 90px;
  border-radius: var(--r-md);
  object-fit: cover;
  margin-bottom: 8px;
}

.event-body h4 {
  font-size: 13px;
  margin: 0;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--ink);
}

.event-body p {
  font-size: 12px;
  color: var(--muted);
  margin: 2px 0 0;
}

.view-pill {
  position: absolute;
  right: 16px;
  bottom: 16px;
  border: none;
  border-radius: 999px;
  background: var(--pill);
  color: #285847;
  padding: 0 18px;
  height: 30px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Nearest activities look */
.activity-card {
  background: var(--card-soft);
  height: 220px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

.activity-content h4 {
  margin: 0 0 4px;
  font-size: 15px;
  font-weight: 700;
  color: #1e3527;
}

.activity-content p {
  margin: 0;
  font-size: 12px;
  color: #556b5f;
}

.rate-btn {
  margin-top: 8px;
  background: #f08c00;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  align-self: flex-start;
}

.rate-btn:hover {
  background: #d67a00;
  background: #d67a00;
}

.rate-pill.is-rated {
  background: transparent;
  border: 2px solid var(--brand);
  color: var(--brand);
  cursor: pointer;
  transition: all 0.2s;
}

.rate-pill.is-rated:hover {
  background: var(--brand);
  color: #ffffff;
}

.no-data-msg {
  padding: 20px;
  color: var(--muted);
  font-style: italic;
  width: 100%;
  text-align: center;
}

/* Empty State Enhanced */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  background: var(--card-soft);
  border-radius: var(--r-lg);
  border: 1px dashed var(--outline);
}

.empty-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #fff;
  display: grid;
  place-items: center;
  font-size: 24px;
  color: var(--brand);
  margin-bottom: 16px;
  box-shadow: var(--shadow);
}

.empty-state h3 {
  font-size: 18px;
  font-weight: 700;
  color: var(--ink);
  margin: 0 0 8px;
}

.empty-state p {
  font-size: 14px;
  color: var(--muted);
  margin: 0 0 20px;
  max-width: 300px;
  line-height: 1.5;
}

.empty-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 24px;
  background: var(--brand);
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  border-radius: 999px;
  text-decoration: none;
  transition: all 0.2s;
}

.empty-btn:hover {
  background: var(--brand-600);
  transform: translateY(-1px);
}

/* Arrows */
.slide-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: none;
  background: var(--brand);
  color: #fff;
  cursor: pointer;
  display: grid;
  place-items: center;
  font-size: 16px;
  z-index: 5;
}

.slide-btn.left {
  left: -10px;
}

.slide-btn.right {
  right: -10px;
}

/* =========================
   SEE ALL OVERLAY
   ========================= */
.seeall-overlay {
  position: fixed;
  inset: 0;
  z-index: 2000;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
}

.seeall-overlay.is-open {
  opacity: 1;
  visibility: visible;
}

.seeall-inner {
  background: #ffffff;
  width: 90%;
  max-width: 900px;
  max-height: 85vh;
  border-radius: 24px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15);
  padding: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transform: scale(0.95) translateY(10px);
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.seeall-overlay.is-open .seeall-inner {
  transform: scale(1) translateY(0);
}

.seeall-header {
  padding: 20px 24px;
  border-bottom: 1px solid var(--outline);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #ffffff;
  position: sticky;
  top: 0;
  z-index: 10;
}

.seeall-header h2 {
  font-size: 20px;
  font-weight: 800;
  color: var(--ink);
  margin: 0;
}

.seeall-close {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid var(--outline);
  background: #f8fafc;
  color: var(--muted);
  display: grid;
  place-items: center;
  cursor: pointer;
  transition: all 0.2s;
}

.seeall-close:hover {
  background: #fee2e2;
  color: #dc2626;
  border-color: #fecaca;
}

.seeall-grid {
  padding: 24px;
  overflow-y: auto;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 20px;
  flex: 1;
}

/* Make cards in overlay a bit taller */
.seeall-grid .card {
  flex: 0 0 auto;
  height: 190px;
}

/* =========================
   RESPONSIVE
   ========================= */
@media (max-width: 960px) {
  .card {
    flex: 0 0 calc((100% - 20px) / 2);
  }
}

@media (max-width: 768px) {
  .profile-banner {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 20px;
  }

  .profile-left {
    flex-direction: column;
    text-align: center;
  }

  .identity .name-row {
    justify-content: center;
  }
  
  .profile-right {
    width: 100%;
    justify-content: center;
  }

  .dual-tabs {
    grid-template-columns: 1fr;
    gap: 10px;
  }
  
  .community-grid {
    grid-template-columns: repeat(auto-fill, minmax(100%, 1fr));
  }
}

@media (max-width: 600px) {
  .page-wrap {
    padding: 0 16px;
    margin-top: 10px;
  }

  .card {
    flex: 0 0 100%;
  }

  .slide-btn {
    display: none;
  }

  .slider-track {
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    padding-bottom: 12px; /* Space for scrollbar if visible, or just breathing room */
    -webkit-overflow-scrolling: touch;
  }
  
  .slider-track::-webkit-scrollbar {
    display: none;
  }

  .card {
    flex: 0 0 85%; /* Show part of the next card to encourage swipe */
    scroll-snap-align: start;
  }

  .seeall-inner {
    width: 94%;
    max-height: 85vh;
    padding: 16px;
  }
  
  .seeall-grid {
    grid-template-columns: 1fr;
  }
}

.view-registrations-btn {
  position: absolute;
  right: 16px;
  bottom: 16px;
  border: none;
  border-radius: 999px;
  background: var(--brand);
  color: #ffffff;
  padding: 0 18px;
  height: 30px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: background 0.2s;
}

.view-registrations-btn:hover {
  background: var(--brand-600);
}

.registration-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.registration-summary {
  font-size: 16px;
  color: var(--ink);
  padding-bottom: 12px;
  border-bottom: 1px solid var(--outline);
}

.attendee-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 400px;
  overflow-y: auto;
}

.attendee-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  border-radius: 8px;
  background: var(--card-soft);
}

.attendee-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.attendee-info {
  display: flex;
  flex-direction: column;
}

.attendee-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--ink);
}

.attendee-email {
  font-size: 12px;
  color: var(--muted);
}

/* Custom styles for the registration popup close button to match seeall-close */
:global(.event-detail-modal .el-dialog__headerbtn) {
  top: 20px;
  right: 20px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid var(--outline);
  background: #f8fafc;
  display: grid;
  place-items: center;
  transition: all 0.2s;
}

:global(.event-detail-modal .el-dialog__headerbtn:hover) {
  background: #fee2e2;
  border-color: #fecaca;
}

:global(.event-detail-modal .el-dialog__close) {
  color: var(--muted);
  font-size: 16px;
}

:global(.event-detail-modal .el-dialog__headerbtn:hover .el-dialog__close) {
  color: #dc2626;
}

.notification-badge {
  position: absolute;
  top: -5px;
  right: -10px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: #f56c6c;
  color: white;
  padding: 0;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: #f56c6c;
  color: white;
  padding: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 10px;
  font-weight: 700;
  border: 2px solid #fff;
}

/* ==================
   ADMIN DASHBOARD STYLES
   ================== */
.admin-dashboard-section {
  margin-bottom: 30px;
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
}

/* KPI Cards */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.kpi-card {
  background: var(--card);
  padding: 20px;
  border-radius: var(--r-lg);
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: var(--shadow);
  border: 1px solid #f0f0f0;
  transition: transform 0.2s;
}

.kpi-card:hover {
  transform: translateY(-2px);
}

.kpi-icon {
  width: 50px;
  height: 50px;
  background: #f1f5f9; /* Neutral bg */
  color: var(--brand); /* Brand match */
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.kpi-content h3 {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 800;
  color: var(--brand);
}

.kpi-content p {
  margin: 0;
  color: var(--muted);
  font-size: 0.9rem;
  font-weight: 500;
}

/* Leaderboard */
.leaderboard-section {
  background: var(--card);
  padding: 25px;
  border-radius: var(--r-lg);
  margin-bottom: 30px;
  box-shadow: var(--shadow);
}


.leaderboard-section h2 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--ink);
}

.leaderboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 10px;
}

.search-box {
  position: relative;
  width: 250px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--muted);
  font-size: 0.9rem;
}

.search-input {
  width: 100%;
  padding: 10px 10px 10px 36px;
  border: 1px solid var(--outline);
  border-radius: 999px;
  font-size: 0.9rem;
  outline: none;
  transition: border-color 0.2s;
}

.search-input:focus {
  border-color: var(--brand);
}

.table-scroll-container {
  overflow-y: auto;
  max-height: 400px;
  border-radius: 8px;
  border: 1px solid #f5f5f5;
}

.table-scroll-container::-webkit-scrollbar {
  width: 6px;
}
.table-scroll-container::-webkit-scrollbar-thumb {
  background-color: #ddd;
  border-radius: 3px;
}

.leaderboard-table {
  width: 100%;
  border-collapse: collapse;
}

.leaderboard-table th {
  position: sticky;
  top: 0;
  background: #ffffff;
  z-index: 2;
  padding: 14px 15px;
  text-align: left;
  border-bottom: 2px solid #f0f0f0;
  color: var(--muted);
  font-weight: 600;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.leaderboard-table td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #f7f7f7;
  color: var(--ink);
  font-size: 0.95rem;
}

.leaderboard-table tr:hover td {
  background-color: #fafafa;
}

.comm-details-cell {
  display: flex;
  flex-direction: column;
}

.comm-name {
  font-weight: 700;
  color: var(--ink);
  font-size: 0.95rem;
}

.comm-uni {
  font-size: 0.75rem; /* text-xs */
  color: #6b7280; /* text-gray-500 equivalent */
  margin-top: 2px;
}

.contact-info-cell {
  display: flex;
  flex-direction: column;
}

.contact-name {
  font-weight: 500;
  font-size: 0.9rem;
  color: var(--ink);
}

.contact-email {
  font-size: 0.8rem;
  color: var(--brand);
  text-decoration: none;
}

.contact-email:hover {
  text-decoration: underline;
}

.event-count-badge {
  background: var(--brand-200);
  color: var(--brand-600);
  padding: 4px 10px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 0.85rem;
}

.leaderboard-table tr:last-child td {
  border-bottom: none;
}

.no-data {
  text-align: center;
  color: var(--muted);
  padding: 30px;
  font-style: italic;
}

/* SaaS App Card styling */
.applications-container {
  width: 100%;
}
.app-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.app-card {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
}
.app-card:hover {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
  border-color: #cbd5e1;
}
.app-info h4 {
  margin: 0 0 6px 0;
  font-size: 16px;
  font-weight: 700;
  color: #111111;
}
.app-info .app-desc {
  margin: 0 0 10px 0;
  font-size: 13px;
  color: #64748b;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.view-details-btn {
  background: none;
  border: none;
  padding: 0;
  color: #111111;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  text-decoration: underline;
}
.app-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}
.app-reject-btn, .app-approve-btn {
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}
.app-reject-btn {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  color: #ef4444;
}
.app-reject-btn:hover {
  background: #fef2f2;
  border-color: #fca5a5;
}
.app-approve-btn {
  background: #111111;
  border: 1px solid #111111;
  color: #ffffff;
}
.app-approve-btn:hover {
  background: #333333;
}
.app-reject-btn:disabled, .app-approve-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
@media (max-width: 640px) {
  .app-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  .app-actions {
    width: 100%;
    margin-top: 10px;
  }
  .app-reject-btn, .app-approve-btn {
    flex: 1;
    text-align: center;
  }
}

/* SaaS App Details Dialog */
.app-details-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.detail-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f1f5f9;
}
.detail-row:last-child {
  border-bottom: none;
}
.detail-label {
  font-size: 12px;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.detail-value {
  font-size: 14px;
  color: #1e293b;
  line-height: 1.5;
}
.detail-value a {
  color: #111111;
  text-decoration: underline;
  font-weight: 500;
}
.detail-image-box {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 8px;
}
.detail-image {
  width: 100%;
  max-width: 400px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

:global(.saas-modal .el-dialog__header) {
  border-bottom: 1px solid #e2e8f0;
  margin-right: 0;
  padding-bottom: 16px;
}
:global(.saas-modal .el-dialog__title) {
  font-weight: 700;
  color: #111111;
}

</style>
