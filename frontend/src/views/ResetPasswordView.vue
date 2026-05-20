<template>
  <div class="login-page">
    <main>
      <div class="signin-container">
        <div class="signin-box">
          <h2 class="title" style="font-size: 32px;">RESET PASSWORD</h2> 
          <p class="description">Create a new password for your account.</p>
          
          <form id="reset-form" @submit.prevent="handleResetConfirm">
            <div class="input-group password-group" style="margin-bottom: 20px;">
                <label for="reset-password" style="display: block; text-align: left; margin-bottom: 8px; font-weight: 600; font-size: 15px; color: #333;">New Password</label>
                <div style="position: relative;">
                    <input :type="showPassword ? 'text' : 'password'" id="reset-password" name="password" placeholder="New Password" v-model="password" required minlength="6">
                    <button type="button" class="password-toggle-btn" @click="showPassword = !showPassword" aria-label="Toggle password visibility">
                        <span class="material-icons">{{ showPassword ? 'visibility_off' : 'visibility' }}</span>
                    </button>
                </div>
            </div>

            <div class="input-group password-group" style="margin-bottom: 20px;">
                <label for="reset-confirmPassword" style="display: block; text-align: left; margin-bottom: 8px; font-weight: 600; font-size: 15px; color: #333;">Confirm New Password</label>
                <div style="position: relative;">
                    <input :type="showConfirmPassword ? 'text' : 'password'" id="reset-confirmPassword" name="confirmPassword" placeholder="Confirm New Password" v-model="confirmPassword" required minlength="6">
                    <button type="button" class="password-toggle-btn" @click="showConfirmPassword = !showConfirmPassword" aria-label="Toggle password visibility">
                        <span class="material-icons">{{ showConfirmPassword ? 'visibility_off' : 'visibility' }}</span>
                    </button>
                </div>
            </div>

            <button type="submit" class="signin-button" :disabled="isSubmitting">
                {{ isSubmitting ? 'Updating...' : 'Update Password' }}
            </button>
          </form>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { apiFetch } from '../api' // Senin orijinal fonksiyonun

const router = useRouter()
const route = useRoute()

const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const isSubmitting = ref(false)
const token = ref('')

onMounted(() => {
    token.value = route.query.token || '';
    if (!token.value) {
        alert("Invalid link.");
        router.push('/login');
    }
})

const handleResetConfirm = async () => {
  if (password.value !== confirmPassword.value) {
      alert("Passwords do not match!");
      return;
  }
  
  if (!token.value) {
      alert("Missing token.");
      return;
  }

  isSubmitting.value = true;

  try {
    const response = await apiFetch('/api/auth/reset-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        token: token.value,
        new_password: password.value
      })
    });

    const data = await response.json();

    if (response.ok) {
        alert('Password updated successfully! You can login now.');
        router.push('/login');
    } else {
        alert(data.error || 'Failed to update password.');
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
/* Reset Password stilleri (ForgotPassword ile aynı, kopyaladım) */
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');
@import url('https://fonts.googleapis.com/icon?family=Material+Icons');

.login-page { --color-bg-main: #ffffff; --color-text-dark: #000000; --color-text-link: #FF9E4A; --color-green-dark: #111111; font-family: 'Roboto', sans-serif; color: #333; min-height: 100vh; }
main { padding-top: 40px; min-height: 100vh; display: flex; flex-direction: column; align-items: center; }
.signin-container { flex-grow: 1; display: flex; align-items: flex-start; justify-content: center; padding: 80px 20px 20px; width: 100%; }
.signin-box { background-color: #ffffff; border-radius: 15px; padding: 40px 50px; width: 100%; max-width: 740px; min-height: 500px; text-align: center; position: relative; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.05); box-sizing: border-box; }
.title { color: #111111; font-size: 36px; font-weight: 800; margin-bottom: 20px; font-family: 'Roboto', sans-serif; }
.description { color: #555; font-size: 16px; margin-bottom: 30px; line-height: 1.5; max-width: 500px; margin-left: auto; margin-right: auto; }
.input-group { margin-bottom: 20px; width: 100%; }
.input-group input { width: 100%; max-width: 642px; height : 69px; padding: 15px 20px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 15px; outline: none; transition: border-color 0.3s; box-sizing: border-box; }
.input-group input:focus { border-color: var(--color-green-dark); }
.password-group { position: relative; max-width: 642px; margin: 0 auto 20px; }
.password-toggle-btn { position: absolute; right: 15px; top: 50%; transform: translateY(-50%); background: none; border: none; color: #111111; cursor: pointer; padding: 4px; display: flex; align-items: center; justify-content: center; }
.material-icons { font-size: 24px; }
.signin-button { width: 100%; max-width: 637px; height: 76.18px; background-color: #111111; border-radius: 16px; font-size: 24px; font-weight: 800; display: flex; align-items: center; justify-content: center; padding: 0; color: white; border: none; cursor: pointer; margin: 10px auto 0; transition: background-color 0.3s; }
.signin-button:hover:not(:disabled) { background-color:#333333; }
.signin-button:disabled { opacity: 0.7; cursor: not-allowed; }
</style>