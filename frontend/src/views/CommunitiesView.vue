<template>
  <main class="page-wrap">
    <!-- Intro text -->
    <section class="intro">
      <p class="intro-text">
        Connect with communities and explore new groups
      </p>

      <!-- big "Search communities..." bar -->
      <div class="community-search-shell">
        <label for="communitySearchInput" style="position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); border: 0;">Search communities</label>
        <i class="fas fa-search" aria-hidden="true"></i>
        <input
          v-model="searchQuery"
          id="communitySearchInput"
          name="search"
          type="search"
          placeholder="Search communities..."
          aria-label="Search communities"
        />
      </div>

      <!-- filter pills -->
      <div class="filters-row">
        <div class="filters-label-space"></div>

        <div class="filters-pills">


          <button v-if="isSuperAdmin" class="add-club-btn" @click="openModal">
            + Add Club
          </button>
        </div>
      </div>
    </section>

    <!-- Communities list -->
    <section class="community-list" id="communityList">
      <article
        v-for="(community, index) in filteredCommunities"
        :key="community.id"
        class="community-card"
      >
        <img
          v-if="!failedImages[community.id] && community.image"
          class="community-image"
          :src="community.image"
          :alt="community.name ? community.name + ' community image' : 'Community image'"
          :loading="index < 4 ? 'eager' : 'lazy'"
          @error="failedImages[community.id] = true"
        />
        <img
          v-else
          class="community-image"
          src="/placeholder.png"
          alt="Image Unavailable"
          :loading="index < 4 ? 'eager' : 'lazy'"
        />

        <div class="community-main">
          <h2 class="community-name">{{ community.name }}</h2>
          <p class="community-desc">{{ community.description }}</p>


        </div>

        <!-- ✅ REPLACED: Join -> Visit Website -->
        <div class="community-actions">
          <a
            v-if="community.website_url"
            class="status-pill outline website-btn"
            :href="community.website_url"
            target="_blank"
            rel="noopener noreferrer"
            title="Open community website"
          >
            <i class="fas fa-arrow-up-right-from-square"></i>
            Visit Website
          </a>
          <button
            v-if="store.canEditCommunity(community)"
            class="status-pill outline edit-btn"
            @click="openEditModal(community)"
          >
            <i class="fas fa-pen"></i>
          </button>
          <button
            v-if="isSuperAdmin"
            class="status-pill outline delete-btn"
            type="button"
            @click="deleteClub(community)"
            title="Delete this club"
          >
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </article>

      <div v-if="filteredCommunities.length === 0" class="no-results">
        No communities found matching your criteria.
      </div>
    </section>
  </main>

  <!-- ADD CLUB MODAL -->
  <div class="modal-overlay" :class="{ 'is-open': isModalOpen }" aria-hidden="true" @click.self="closeModal">
    <div class="modal-card">
      <button class="modal-close" aria-label="Close" @click="closeModal">
        <span>&times;</span>
      </button>

      <h2 class="modal-title">
        {{ isEditMode ? 'Edit Club' : 'Create Club' }}
      </h2>


      <form @submit.prevent="submitClub" class="modal-form">
        <div class="form-field">
          <label for="modalClubName">Club Name</label>
          <input type="text" id="modalClubName" name="clubName" v-model="formData.name" required />
        </div>

        <div class="form-field">
          <label for="modalClubDescription">Description</label>
          <textarea id="modalClubDescription" name="clubDescription" v-model="formData.description" rows="3" required></textarea>
        </div>

        <!-- ✅ Website / Instagram URL -->
        <div class="form-field">
          <label for="modalClubWebsite">Instagram / Website Link</label>
          <input type="url" id="modalClubWebsite" name="clubWebsite" v-model="formData.website_url" placeholder="https://instagram.com/..." />
        </div>

        <!-- ✅ Image File slot -->
        <div class="form-field">
          <label for="modalClubImage">Club Image</label>
          <div class="file-upload-box" @click="triggerFileInput" :class="{ 'has-file': !!previewUrl }">
            <input
              id="modalClubImage"
              name="clubImage"
              ref="fileInput"
              type="file"
              accept="image/png, image/jpeg"
              @change="onFileChange"
              style="display: none;"
            />
            
            <div v-if="previewUrl" class="preview-container">
              <img v-if="!previewImageFailed" :src="previewUrl" alt="Preview" class="preview-img" loading="lazy" @error="previewImageFailed = true" />
              <img v-else src="/placeholder.png" alt="Preview Unavailable" class="preview-img" loading="lazy" />
              <button type="button" class="remove-file-btn" @click.stop="removeFile">
                <i class="fas fa-times"></i>
              </button>
            </div>

            <div v-else class="upload-placeholder">
              <i class="fas fa-cloud-upload-alt"></i>
              <span>Click to upload image</span>
              <small>(PNG, JPG)</small>
            </div>
          </div>
        </div>

        <div class="modal-actions">
          <button type="button" class="btn-secondary" @click="closeModal">
            Cancel
          </button>
          <button type="submit" class="btn-primary" :disabled="isSubmitting">
            <span v-if="isSubmitting">
              {{ isEditMode ? 'Saving...' : 'Creating...' }}
            </span>
            <span v-else>
              {{ isEditMode ? 'Save Changes' : 'Create Club' }}
            </span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { store } from '../store.js'
import { apiFetch } from '../api'

const route = useRoute()

const searchQuery = ref('')
const isSuperAdmin = ref(false)
const isAdmin = ref(false)
const isModalOpen = ref(false)
const isSubmitting = ref(false)

const isEditMode = ref(false)
const editingCommunityId = ref(null)

const failedImages = reactive({})
const previewImageFailed = ref(false)

const fileInput = ref(null)
const selectedFile = ref(null)
const previewUrl = ref(null)

watch(previewUrl, () => {
  previewImageFailed.value = false
})

const formData = reactive({
  name: '',
  description: '',
  website_url: ''
})

const loadCommunities = async () => {
  try {
    const res = await apiFetch("/api/general/communities")
    const data = await res.json()

    store.communities = (Array.isArray(data) ? data : []).map(c => ({
      id: c.id,
      name: c.name,
      description: c.description || "",
      members: c.members_count ?? 0,
      admin_id: c.admin_id ?? null,
      // ✅ accept either backend field
      website_url: c.website_url || c.external_link || "",
      image: c.image_url || "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80"
    }))
  } catch (err) {
    console.error("Failed to load communities:", err)
  }
}

onMounted(() => {
  loadCommunities()

  const role = (localStorage.getItem('user_role') || '').toLowerCase()
  isSuperAdmin.value = role === 'super_admin' || role === 'superadmin'
  isAdmin.value = role === 'admin' || role === 'super_admin'
})


const filteredCommunities = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  return store.communities.filter(community => {
    if (q && !String(community.name || "").toLowerCase().includes(q)) return false
    return true
  })
})



async function deleteClub(community) {
  if (!confirm(`Are you sure you want to delete "${community.name}"? This cannot be undone.`)) {
    return
  }
  
  const success = await store.deleteCommunity(community.id)
  if (success) {
    // optional: show success toast or alert
  }
}

function onFileChange(e) {
  const file = e.target.files?.[0] || null
  if (file) {
    selectedFile.value = file
    // create preview
    const reader = new FileReader()
    reader.onload = (evt) => {
      previewUrl.value = evt.target.result
    }
    reader.readAsDataURL(file)
  }
}

function triggerFileInput() {
  fileInput.value?.click()
}

function removeFile() {
  selectedFile.value = null
  previewUrl.value = null
  if (fileInput.value) fileInput.value.value = ""
}
const openEditModal = (community) => {
  isEditMode.value = true
  editingCommunityId.value = community.id

  formData.name = community.name
  formData.description = community.description
  formData.website_url = community.website_url || ""

  previewUrl.value = community.image || null
  selectedFile.value = null

  isModalOpen.value = true
  document.body.style.overflow = 'hidden'
}

// Modal Methods
const openModal = () => {
  isEditMode.value = false
  editingCommunityId.value = null

  formData.name = ''
  formData.description = ''
  formData.website_url = ''
  selectedFile.value = null
  previewUrl.value = null

  isModalOpen.value = true
}


const closeModal = () => {
  isModalOpen.value = false
  isEditMode.value = false
  editingCommunityId.value = null
  document.body.style.overflow = ''
}


const submitClub = async () => {
  const token = localStorage.getItem("user_token")
  if (!token) {
    alert("Please login first.")
    return
  }

  isSubmitting.value = true
  try {
    const fd = new FormData()
    fd.append("name", formData.name)
    fd.append("description", formData.description)
    fd.append("website_url", formData.website_url)

    if (selectedFile.value instanceof File) {
      fd.append("image", selectedFile.value)
    }

    let res;

    if (isEditMode.value && editingCommunityId.value) {
      // ⭐ REAL EDIT — DO NOT DELETE ANYTHING
      res = await apiFetch(`/api/general/communities/${editingCommunityId.value}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: fd
      });
    } else {
      // CREATE
      res = await apiFetch("/api/general/communities", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: fd
      });
    }

    if (!res.ok) {
      let errorText = "Operation failed";
      try {
        const err = await res.json();
        errorText = err.error || err.msg || err.message || `Server Error: ${res.status} ${res.statusText}`;
      } catch (e) {
        errorText = `Server Error: ${res.status} ${res.statusText}`;
      }
      throw new Error(errorText);
    }

    await loadCommunities()
    closeModal()

  } catch (err) {
    console.error(err)
    alert(err.message || "Failed to save community")
  } finally {
    isSubmitting.value = false
  }
}


</script>

<style scoped>

img {
  background-color: #e2e8f0;
}

/* Your CSS is mostly fine; I added ONLY website styles */

.page-wrap {
 --brand: #372D2D;    
  --brand-600: #241D1D;   
  --brand-200: #EBE8E8;
  --page: #ffffff;
  --panel: #e6f6e6;
  --card: #ffffff;
  --card-soft: #e1f0e3;
  --ink: #153226;
  --muted: #6b7c74;
  --outline: #d8eadb;
  --pill: #bfe7c9;
  --accent-orange: #f08c00;
  --r-md: 10px;
  --r-lg: 14px;
  --shadow: 0 3px 10px rgba(0,0,0,.06);
}

.page-wrap {
  max-width: 1180px;
  margin: 18px auto 56px;
  padding: 0 20px 40px;
  font-family: "Inter", system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif;
  color: var(--ink);
}

.intro-text {
  font-size: 14px;
  color: var(--muted);
  margin-bottom: 10px;
}

.community-search-shell {
  width: 100%;
  height: 48px;
  border-radius: 999px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 20px;
  margin-bottom: 16px;
  transition: all 0.2s ease;
}

.community-search-shell:focus-within {
  border-color: #111111;
  box-shadow: 0 0 0 1px #111111;
}

.community-search-shell i {
  font-size: 16px;
  color: #6b7280;
}

.community-search-shell input {
  border: none;
  outline: none;
  flex: 1;
  min-width: 0;
  font-size: 15px;
  background: transparent;
  color: #111111;
}

.community-search-shell input::placeholder {
  color: #9ca3af;
}

.filters-row {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 18px;
}

.filters-pills {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.filter-pill {
  border-radius: 6px;
  border: 1px solid var(--outline);
  background: #f4faf4;
  padding: 5px 14px;
  font-size: 12px;
  font-weight: 500;
  color: #345243;
  cursor: pointer;
}

.filter-pill.is-active {
  border-color: #b4dbc0;
  background: #e1f3e3;
}

.filter-pill.primary {
  border: none;
  background: var(--brand);
  color: #fff;
}

.add-club-btn {
  margin-left: 10px;
  border: none;
  border-radius: 6px;
  background: var(--brand);
  color: #ffffff;
  font-size: 12px;
  font-weight: 600;
  padding: 6px 14px;
  cursor: pointer;
}

.community-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.community-card {
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr) auto;
  align-items: stretch;
  background: var(--card);
  border-radius: 16px;
  box-shadow: var(--shadow);
  overflow: hidden;
}

.community-image {
  width: 100%;
  height: 120px;
  object-fit: cover;
}

.community-main {
  padding: 12px 18px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.community-name {
  font-size: 15px;
  font-weight: 700;
  color: #1e3527;
  margin: 0;
}

.community-desc {
  font-size: 13px;
  color: var(--muted);
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}


/* ✅ NEW */
.community-website {
  margin-top: 6px;
  font-size: 12px;
  display: flex;
  gap: 8px;
  align-items: center;
  color: #556b5f;
}

.community-website.muted {
  color: #7a8b84;
}

.website-link {
  color: var(--brand);
  text-decoration: none;
  display: inline-block;
  vertical-align: bottom;
  max-width: 520px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.website-link:hover {
  text-decoration: underline;
}

/* Actions Column */
.community-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-end; /* Align right */
  justify-content: center;
  padding-right: 18px;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  border: 1px solid transparent;
  cursor: pointer;
  white-space: nowrap;
  text-decoration: none;
}

.status-pill.outline {
  background: #fff;
  border-color: var(--brand);
  color: var(--brand);
}

.website-btn {
  min-width: 140px;
}

.website-btn i {
  margin-right: 6px;
}

.delete-btn {
  border-color: #e55353 !important;
  color: #e55353 !important;
  width: 40px; /* Small square-ish button for trash */
  padding: 6px 0; /* Center icon */
}

.status-pill.outline:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.no-results {
  text-align: center;
  padding: 40px;
  color: var(--muted);
  font-style: italic;
}

/* MODAL */
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
  margin-bottom: 12px;
}

.modal-form {
  font-size: 12px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 3px;
  margin-bottom: 10px;
}

.form-field label {
  font-size: 11px;
  color: #5C6661;
}

.modal-form input,
.modal-form textarea {
  border-radius: 4px;
  border: 1px solid #dadfd4;
  padding: 6px 8px;
  font-size: 12px;
  font-family: inherit;
  outline: none;
  background: #ffffff;
}

.modal-form input:focus,
.modal-form textarea:focus {
  border-color: var(--brand);
}

.modal-actions {
  margin-top: 14px;
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

@media (max-width: 960px) {
  .community-card {
    grid-template-columns: 180px minmax(0, 1fr);
    grid-template-rows: auto auto;
  }

  .status-pill {
    grid-column: 1 / -1;
    margin: 0 0 10px 18px;
    align-self: flex-start;
  }
}

@media (max-width: 640px) {
  .page-wrap {
    margin: 18px auto 32px;
    padding: 0 14px 30px;
  }

  .community-card {
    grid-template-columns: 1fr;
  }

  .community-image {
    height: 140px;
  }

  .status-pill {
    margin-left: 18px;
  }
}

/* FILE UPLOAD CSS */
.file-upload-box {
  border: 2px dashed #e2e8f0;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  background: #ffffff;
  transition: all 0.2s;
  position: relative;
  min-height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.file-upload-box:hover {
  border-color: #111111;
  background: #f8fafc;
}

.file-upload-box.has-file {
  border-style: solid;
  padding: 0;
  overflow: hidden;
  background: #000;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  color: var(--muted);
}

.upload-placeholder i {
  font-size: 24px;
  color: #111111;
}

.preview-container {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
}

.preview-img {
  width: 100%;
  height: 180px;
  object-fit: cover;
  display: block;
}

.remove-file-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(0,0,0,0.6);
  color: #fff;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.remove-file-btn:hover {
  background: rgba(200, 50, 50, 0.9);
}
</style>
