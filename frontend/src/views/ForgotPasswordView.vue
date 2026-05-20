<template>
  <div class="login-page">
    <main>
      <div class="signin-container">
        <div class="signin-box">
          <svg class="close-icon" width="47" height="47" viewBox="0 0 47 47" fill="none" xmlns="http://www.w3.org/2000/svg" @click="$router.push('/login')">
             <path d="M18.6042 18.604L28.3959 28.3957" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
             <path d="M28.3959 18.604L18.6042 28.3957" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
             <path d="M33.2917 5.875H13.7083C9.3821 5.875 5.875 9.3821 5.875 13.7083V33.2917C5.875 37.6179 9.3821 41.125 13.7083 41.125H33.2917C37.6179 41.125 41.125 37.6179 41.125 33.2917V13.7083C41.125 9.3821 37.6179 5.875 33.2917 5.875Z" stroke="var(--Accents-Orange, #FF8D28)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          
          <h2 class="title">FORGOT PASSWORD</h2> 
          <p class="description">Enter your email address and we'll send you a link to reset your password.</p>
          
          <form id="forgot-form" @submit.prevent="handleReset">
            <div class="input-group" style="display: block; max-width: 642px; margin: 0 auto 40px;">
               <label for="forgot-email" style="display: block; text-align: left; margin-bottom: 8px; font-weight: 600; font-size: 15px; color: #333;">Email Address</label>
               <input type="email" id="forgot-email" name="email" v-model="email" placeholder="Enter your email" required>
            </div>

            <button type="submit" class="signin-button" :disabled="isSubmitting">
               {{ isSubmitting ? 'Sending...' : 'Send Reset Link' }}
            </button>
          </form>

          <div class="no-account">
             Remember your password? <router-link to="/login">Sign In.</router-link>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { apiFetch } from '../api' // Senin orijinal fonksiyonun

const router = useRouter()
const email = ref('')
const isSubmitting = ref(false)

const handleReset = async () => {
  if (!email.value) return;

  isSubmitting.value = true;

  try {
    // Senin apiFetch sistemini kullanıyoruz
    const response = await apiFetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: email.value
      })
    });

    const data = await response.json();

    if (response.ok) {
        alert('If an account exists with this email, you will receive a password reset link shortly.');
        router.push('/login');
    } else {
        alert(data.error || 'Failed to send reset link.');
    }

  } catch (error) {
    console.error('Error:', error);
    alert('Unable to connect to the server.');
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<style scoped>
/* Senin orijinal CSS kodların buraya gelecek, değiştirmedim */
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');
.login-page { --color-bg-main: #ffffff; --color-text-dark: #000000; --color-text-link: #FF9E4A; --color-green-dark: #111111; font-family: 'Roboto', sans-serif; color: #333; min-height: 100vh; }
main { padding-top: 40px; min-height: 100vh; display: flex; flex-direction: column; align-items: center; }
.signin-container { flex-grow: 1; display: flex; align-items: flex-start; justify-content: center; padding: 80px 20px 20px; width: 100%; }
.signin-box { background-color: #ffffff; border-radius: 15px; padding: 40px 50px; width: 100%; max-width: 740px; min-height: 561px; text-align: center; position: relative; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.05); box-sizing: border-box; }
.close-icon { position: absolute; top: 15px; right: 20px; width: 47px; height: 47px; cursor: pointer; opacity: 0.7; transition: opacity 0.2s, transform 0.2s; color: var(--color-green-dark); }
.title { color: #111111; font-size: 36px; font-weight: 800; margin-bottom: 30px; font-family: 'Roboto', sans-serif; }
.description { color: #7F8B9E; font-size: 20px; font-weight: 400; margin-bottom: 40px; line-height: 1.5; max-width: 500px; margin-left: auto; margin-right: auto; }
.input-group { margin-bottom: 40px; width: 100%; display: flex; justify-content: center; }
.input-group input { width: 100%; max-width: 642px; height : 69px; padding: 15px 20px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 15px; outline: none; transition: border-color 0.3s; box-sizing: border-box; }
.input-group input:focus { border-color: var(--color-green-dark); box-shadow: 0 0 0 1px var(--color-green-dark); }
.signin-button { width: 100%; max-width: 637px; height: 76.18px; background-color: #111111; border-radius: 16px; font-size: 24px; font-weight: 800; display: flex; align-items: center; justify-content: center; padding: 0; color: white; border: none; cursor: pointer; margin: 10px auto 0; transition: background-color 0.3s; }
.signin-button:hover:not(:disabled) { background-color:#333333; }
.signin-button:disabled { opacity: 0.7; cursor: not-allowed; }
.no-account { color: #7F8B9E; font-size: 20px; font-weight: 400; margin-top: 40px; text-align: center; }
.no-account a { color: #FF9E4A; font-weight: 700; text-decoration: underline; }
@media (max-width: 768px) { .signin-box { padding: 30px 20px; min-height: auto; } .title { font-size: 26px !important; } .input-group input { height: 55px; font-size: 14px; } .signin-button { height: 60px; font-size: 20px; } .no-account { font-size: 16px; } .no-account a { font-size: 16px; } }
</style>