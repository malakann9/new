<template>
  <article class="community-card">
    <img
      class="community-image"
      :src="community.image"
      :alt="community.name ? community.name + ' community image' : 'Community image'"
    />

    <div class="community-main">
      <h2 class="community-name">{{ community.name }}</h2>
      <p class="community-desc">
        {{ community.description }}
      </p>
      <div class="community-meta">
        <span><i class="fas fa-user-group"></i> {{ community.members }} members</span>
      </div>
    </div>

    <button 
      class="status-pill" 
      :class="community.joined ? 'joined' : 'outline'"
      type="button"
      @click="toggleJoin(community)"
    >
      <i v-if="community.joined" class="fas fa-check"></i>
      {{ community.joined ? 'Joined' : 'Join Community' }}
    </button>
  </article>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { store } from '../store.js'

const props = defineProps({
  community: {
    type: Object,
    required: true
  }
})

const router = useRouter()

const toggleJoin = (community) => {
  // Check if user is logged in
  if (!localStorage.getItem('user_token')) {
    alert('Please sign in first to join!')
    router.push('/login')
    return
  }
  
  // User is authenticated, proceed with toggle
  store.joinCommunity(community)
}
</script>

<style scoped>
.community-card {
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr) auto;
  align-items: stretch;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 3px 10px rgba(0,0,0,.06);
  overflow: hidden;
  margin-bottom: 12px;
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
  color: #6b7c74;
  margin: 0;
}

.community-meta {
  margin-top: 4px;
  font-size: 12px;
  color: #556b5f;
}

.community-meta i {
  margin-right: 6px;
}

.status-pill {
  align-self: center;
  margin-right: 18px;
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  border: 1px solid transparent;
  cursor: pointer;
  white-space: nowrap;
}

.status-pill.joined {
  background: #e5f7e7;
  color: #1e8b47;
  border-color: #bce5c4;
}

.status-pill.joined i {
  margin-right: 6px;
}

.status-pill.outline {
  background: #fff;
  border-color: #1b8f48;
  color: #1b8f48;
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
</style>
