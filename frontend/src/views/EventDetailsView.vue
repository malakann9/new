<template>
  <div class="page-wrap">
    <div v-if="event" class="event-details-container">
      <button class="back-btn" @click="$router.go(-1)">
        <i class="fas fa-arrow-left"></i> Back
      </button>

      <div class="event-header">
        <h1>{{ event.name }}</h1>
        <span class="community-badge">{{ event.community_name }}</span>
      </div>

      <div class="image-container">
        <img :src="event.image" :alt="event.alt" class="event-image" fetchpriority="high" @error="(e) => { e.target.onerror = null; e.target.src = '/placeholder.png' }" />
      </div>

      <div class="tab-controls">
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'details' }"
          @click="activeTab = 'details'"
        >
          About Event
        </button>

        <button
          v-if="isPastEvent"
          class="tab-btn"
          :class="{ active: activeTab === 'reviews' }"
          @click="activeTab = 'reviews'"
        >
          Reviews & Ratings
        </button>

        <button
          v-if="isAdmin"
          class="tab-btn"
          :class="{ active: activeTab === 'participants' }"
          @click="fetchParticipants"
        >
          <i class="fas fa-users-cog"></i> Participants (Admin)
        </button>
      </div>

      <div class="content-area">
        <div v-if="activeTab === 'details'" id="details-content" class="fade-in">
          <div class="info-card">
            <div class="info-row">
              <i class="fas fa-calendar"></i>
              <div><strong>Date</strong><p>{{ event.date }}</p></div>
            </div>
            <div class="info-row">
              <i class="fas fa-clock"></i>
              <div><strong>Time</strong><p>{{ event.time }}</p></div>
            </div>
            <div class="info-row">
              <i class="fas fa-map-marker-alt"></i>
              <div><strong>Location</strong><p>{{ event.location }}</p></div>
            </div>
          </div>

          <div class="description-section">
            <h3>About this Event</h3>
            <p>{{ event.description || 'No description available.' }}</p>
          </div>

          <template v-if="!isPastEvent">
            <button
              class="register-btn"
              :class="{ 'registered': event.registered, 'is-loading': isRegistering }"
              @click="toggleRegistration"
              :disabled="isRegistering"
            >
              <span v-if="isRegistering">
                <i class="fas fa-spinner fa-spin"></i> Processing...
              </span>
              <span v-else>
                {{ event.registered ? 'Registered (Cancel)' : 'Register Now' }}
              </span>
            </button>
          </template>

          <button v-else class="register-btn event-ended" disabled>
            Event Ended
          </button>
        </div>

        <div v-if="activeTab === 'reviews' && isPastEvent" id="reviews-content" class="fade-in">
          <div class="reviews-summary">
            <div class="rating-score">
              <span class="score">{{ event.rating || 0 }}</span>
              <div class="stars">
                <i v-for="n in 5" :key="n" class="fas fa-star" :class="{ filled: n <= (event.rating || 0) }"></i>
              </div>
              <span class="count" v-if="isAdmin">Based on {{ reviewsList.length }} reviews</span>
            </div>

            <div class="summary-actions">
              <div v-if="!event.registered" style="text-align: right;">
                <span style="font-size: 14px; color: #666666; display: flex; align-items: center; gap: 5px;">
                  <i class="fas fa-info-circle"></i>
                  <span>Only participants can review.</span>
                </span>
              </div>

              <button
                v-else
                class="write-review-btn"
                @click="openRatingPopup"
              >
                <i v-if="event.is_rated" class="fas fa-edit" style="margin-right:5px;"></i>
                {{ event.is_rated ? 'Update Review' : 'Write a Review' }}
              </button>
            </div>
          </div>

          <div class="reviews-list">
            <div v-if="reviewsList.length === 0" class="empty-state" style="text-align:center; padding:20px; color:#555;">
              No reviews yet.
            </div>
            <div v-for="review in reviewsList" :key="review.id" class="review-card">
              <div class="review-header">
                <div class="reviewer-info">
                  <div class="avatar">{{ review.user ? review.user.charAt(0).toUpperCase() : '?' }}</div>
                  <div>
                    <span class="name">{{ review.user }}</span>
                    <span class="date">{{ review.created_at ? new Date(review.created_at).toLocaleDateString() : '' }}</span>
                  </div>
                </div>
                <div class="review-stars">
                  <i v-for="n in 5" :key="n" class="fas fa-star" :class="{ filled: n <= review.rating }"></i>
                </div>
              </div>
              <p class="review-text">{{ review.comment }}</p>
            </div>
          </div>

          <!-- <div v-else class="empty-state" style="text-align:center; padding:40px; color:#555; background:var(--brand-200); border-radius:12px; margin-top:20px;">
            <i class="fas fa-lock" style="font-size: 24px; margin-bottom: 10px; display:block;"></i>
            Detailed reviews are only visible to administrators.
          </div> -->
        </div>

        <div v-if="activeTab === 'participants' && isAdmin" class="fade-in">
          <div class="participants-panel">
            <h3>Registered Users</h3>
            <div v-if="loadingParticipants" class="loading-state">Loading list...</div>
            <div v-else-if="safeParticipants.length === 0" class="empty-state">No registrations yet.</div>

            <table v-else class="participants-table">
              <thead>
                <tr>
                  <th>Avatar</th>
                  <th>Name</th>
                  <th>Email</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="p in safeParticipants" :key="p.email">
                  <td>
                    <el-avatar
                      :size="36"
                      :src="p.avatar_url || ''"
                      style="background-color: #f1f5f9; color: #111111; font-weight: 700; font-size: 13px;"
                    >
                      {{ ((p.first_name?.charAt(0) || '') + (p.last_name?.charAt(0) || '')).toUpperCase() || '?' }}
                    </el-avatar>
                  </td>
                  <td style="font-weight: 500;">{{ p.first_name }} {{ p.last_name }}</td>
                  <td style="color: #64748b;">{{ p.email }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>

    <div v-else class="not-found">
      <h2>Event not found</h2>
      <button @click="$router.push('/events')">Go to Events</button>
    </div>

    <ConfettiOverlay v-if="showCelebration" @close="showCelebration = false" />
    <RatingPopup
      v-if="event"
      v-model="showRatingPopup"
      :event="event"
      @submit="handleRatingSubmit"
    />
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { store } from '../store.js'
import ConfettiOverlay from '../components/ConfettiOverlay.vue'
import RatingPopup from '../components/RatingPopup.vue'
import { useToast } from "vue-toastification"

const route = useRoute()
const router = useRouter()
const toast = useToast()

const showCelebration = ref(false)
const showRatingPopup = ref(false)
const activeTab = ref('details')
const isRegistering = ref(false)

const reviewsList = ref([])
const participantsList = ref([])
const loadingParticipants = ref(false)

const eventId = parseInt(route.params.id)

const event = computed(() => {
  return store.events.find(e => e.id === eventId)
})

// ✅ sonsuz satırı engelleyen güvenli getter
const safeParticipants = computed(() => {
  return Array.isArray(participantsList.value) ? participantsList.value : []
})

// --- CANLI MOD (SAAT HASSASİYETİ EKLENDİ) ---
const isPastEvent = computed(() => {
  if (!event.value?.date) return false

  const timeString = event.value.time ? event.value.time : '00:00'
  const eventDateTime = new Date(`${event.value.date}T${timeString}`)

  const now = new Date()
  return now > eventDateTime
})

// --- ADMIN KONTROLÜ ---
const isAdmin = computed(() => {
  let role = ''

  if (store.user && store.user.role) {
    role = store.user.role
  } else {
    try {
      const localUser = localStorage.getItem('user')
      if (localUser) {
        const parsedUser = JSON.parse(localUser)
        role = parsedUser.role || ''
      }
    } catch (e) {}
  }

  if (!role) {
    role = localStorage.getItem('user_role') || ''
  }

  const normalizedRole = String(role).toLowerCase().trim()
  const allowedRoles = ['admin', 'super_admin', 'superadmin', 'super admin']
  return allowedRoles.includes(normalizedRole)
})

const openRatingPopup = () => {
  showRatingPopup.value = true
}

const loadReviews = async () => {
  if (!event.value) return

  try {
    reviewsList.value = await store.fetchReviews(event.value.id)
  } catch (e) {
    reviewsList.value = []
  }
}

watch(activeTab, (newTab) => {
  if (newTab === 'reviews') loadReviews()
})

const toggleRegistration = async () => {
  if (!event.value) return

  // store.js zaten user_token kullanıyor; burada da aynı kontrol
  if (!localStorage.getItem('user_token')) {
    toast.warning('Please sign in to register.')
    router.push('/login')
    return
  }

  isRegistering.value = true
  try {
    if (event.value.registered) {
      await store.unregisterEvent(event.value)
      toast.info("You have unregistered from the event.")
    } else {
      await store.registerEvent(event.value)
      toast.success("Successfully registered for the event! 🎉")
      showCelebration.value = true
    }
  } catch (err) {
    toast.error(err.message || "Something went wrong")
    console.error(err)
  } finally {
    isRegistering.value = false
  }
}

const handleRatingSubmit = async (data) => {
  if (!event.value) return

  try {
    await store.addReview({
      eventId: event.value.id,
      rating: data.rating,
      comment: data.feedback,
      isAnonymous: data.isAnonymous
    })

    const actionText = event.value.is_rated ? "updated" : "submitted"
    toast.success(`Review ${actionText} successfully!`)

    showRatingPopup.value = false
    if (isAdmin.value) loadReviews()
  } catch (error) {
    const errMsg = error.response?.data?.error || error.message || "Failed to submit review"
    toast.error(errMsg)
  }
}

// ✅ Participants artık store üzerinden çekiliyor
const fetchParticipants = async () => {
  activeTab.value = 'participants'
  loadingParticipants.value = true

  try {
    participantsList.value = await store.fetchParticipants(eventId)
  } catch (error) {
    toast.error(error.message || "Failed to load list.")
    participantsList.value = []
  } finally {
    loadingParticipants.value = false
  }
}
</script>

<style scoped>
/* CSS Stilleri Aynen Korundu */
.page-wrap { max-width: 800px; margin: 40px auto; padding: 0 20px; font-family: 'Inter', sans-serif; color: var(--brand-600); }
.back-btn { background: none; border: none; color: #555; font-size: 16px; cursor: pointer; display: flex; align-items: center; gap: 8px; margin-bottom: 20px; padding: 0; }
.back-btn:hover { color: var(--brand); }
.event-header { margin-bottom: 24px; text-align: center; }
.event-header h1 { font-size: 32px; margin: 0 0 12px 0; color: var(--brand-600); }
.community-badge { background: var(--brand-200); color: var(--brand); padding: 6px 16px; border-radius: 20px; font-size: 14px; font-weight: 600; display: inline-block; }
.image-container { margin-bottom: 32px; }
.event-image { width: 100%; height: 300px; object-fit: cover; border-radius: 16px; box-shadow: 0 8px 24px rgba(0,0,0,0.12); }
.tab-controls { display: flex; justify-content: center; gap: 40px; border-bottom: 2px solid var(--brand-200); margin-bottom: 32px; }
.tab-btn { background: none; border: none; padding: 16px 8px; font-size: 16px; font-weight: 600; color: #555; cursor: pointer; position: relative; transition: color 0.3s; }
.tab-btn:hover { color: var(--brand-600); }
.tab-btn.active { color: var(--brand); }
.tab-btn.active::after { content: ''; position: absolute; bottom: -2px; left: 0; width: 100%; height: 2px; background: var(--brand); border-radius: 2px; }
.content-area { min-height: 300px; }
.fade-in { animation: fadeIn 0.3s ease-in-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.info-card { background: #ffffff; border: 1px solid var(--brand-200); border-radius: 16px; padding: 24px; margin-bottom: 32px; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 24px; }
.info-row { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 12px; margin-bottom: 0; }
.info-row i { font-size: 24px; color: var(--brand); background: var(--brand-200); padding: 12px; border-radius: 50%; }
.info-row strong { display: block; font-size: 14px; color: #555; margin-bottom: 4px; }
.info-row p { margin: 0; font-weight: 600; font-size: 16px; }
.description-section h3 { font-size: 22px; margin-bottom: 16px; color: var(--brand-600); }
.description-section p { line-height: 1.8; color: #555; font-size: 16px; }
.register-btn { width: 100%; padding: 18px; background: var(--brand); color: white; border: none; border-radius: 12px; font-size: 18px; font-weight: 600; cursor: pointer; margin-top: 40px; transition: all 0.2s; box-shadow: 0 4px 12px rgba(36, 29, 29, 0.2); }
.register-btn:hover { background: var(--brand-600); transform: translateY(-2px); }
.register-btn.registered { background: var(--brand-200); color: var(--brand); box-shadow: none; cursor: default; }
.register-btn.event-ended { background: #e5e7eb; color: #6b7280; cursor: not-allowed; box-shadow: none; }
.reviews-summary { background: var(--brand-200); padding: 24px; border-radius: 16px; margin-bottom: 32px; display: flex; justify-content: space-between; align-items: center; border: 1px solid var(--brand-200); }
.rating-score { display: flex; flex-direction: column; gap: 4px; }
.rating-score .score { font-size: 36px; font-weight: 800; color: var(--brand-600); line-height: 1; }
.rating-score .stars { color: #fbbf24; font-size: 14px; }
.rating-score .count { font-size: 14px; color: #555; }
.summary-actions { display: flex; flex-direction: column; align-items: flex-end; gap: 12px; }
.write-review-btn { background: var(--brand); color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: background 0.2s; }
.write-review-btn:hover { background: var(--brand-600); }
.reviews-list { display: flex; flex-direction: column; gap: 20px; }
.review-card { background: white; border: 1px solid var(--brand-200); border-radius: 12px; padding: 20px; transition: transform 0.2s; }
.review-card:hover { border-color: var(--brand-200); transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.04); }
.review-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
.reviewer-info { display: flex; align-items: center; gap: 12px; }
.avatar { width: 40px; height: 40px; background: var(--brand-200); color: var(--brand); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; }
.reviewer-info .name { display: block; font-weight: 600; color: var(--brand-600); }
.reviewer-info .date { font-size: 12px; color: #6b7280; }
.review-stars { color: #e5e7eb; font-size: 14px; }
.review-stars .filled { color: #fbbf24; }
.review-text { color: #555; line-height: 1.6; margin: 0; }
.not-found { text-align: center; padding: 60px; }
.participants-panel { background: white; padding: 24px; border-radius: 16px; border: 1px solid #e2e8f0; overflow-x: auto; }
.participants-table { width: 100%; border-collapse: collapse; margin-top: 16px; }
.participants-table th { text-align: left; padding: 12px; background: #f8fafc; color: #64748b; font-weight: 600; text-transform: uppercase; font-size: 12px; letter-spacing: 0.05em; }
.participants-table td { padding: 12px; border-bottom: 1px solid #e2e8f0; color: #111111; }
.loading-state, .empty-state { text-align: center; padding: 40px; color: #555; }
@media (max-width: 768px) {
  .info-card { grid-template-columns: 1fr; gap: 20px; }
  .info-row { flex-direction: row; text-align: left; }
  .event-image { height: 200px; }
}
</style>


