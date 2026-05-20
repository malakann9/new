<template>
    <div class="page-wrap">
      <section class="support-card">
        <!-- LEFT: NEW TECH SUPPORT DASHBOARD FIGURE -->
        <div class="support-figure">
          <svg
            class="support-svg"
            viewBox="0 0 260 210"
            xmlns="http://www.w3.org/2000/svg"
          >
            <!-- Background tile -->
            <rect
              x="16"
              y="20"
              width="228"
              height="160"
              rx="26"
              fill="#f8fafc"
            />
            <!-- Decorative soft circle -->
            <circle cx="50" cy="40" r="18" fill="#e2e8f0" />
            <circle cx="215" cy="168" r="16" fill="#ffe6c9" />

            <!-- Main monitor -->
            <rect
              x="42"
              y="46"
              width="150"
              height="92"
              rx="12"
              fill="#ffffff"
              stroke="#e2e8f0"
              stroke-width="1.5"
            />
            <!-- Monitor header bar -->
            <rect x="42" y="46" width="150" height="16" rx="10" fill="#f8fafc" />
            <circle cx="52" cy="54" r="3" fill="#f37c57" />
            <circle cx="60" cy="54" r="3" fill="#f4c95d" />
            <circle cx="68" cy="54" r="3" fill="#9ca3af" />

            <!-- Left panel "logs" -->
            <rect x="52" y="70" width="56" height="8" rx="4" fill="#f1f5f9" />
            <rect x="52" y="84" width="44" height="7" rx="3.5" fill="#f1f5f9" />
            <rect x="52" y="96" width="50" height="7" rx="3.5" fill="#f1f5f9" />
            <rect x="52" y="108" width="32" height="7" rx="3.5" fill="#f1f5f9" />
            <rect x="52" y="120" width="40" height="7" rx="3.5" fill="#f1f5f9" />

            <!-- Right "status" panel -->
            <rect
              x="116"
              y="70"
              width="64"
              height="40"
              rx="9"
              fill="#fdf8ec"
              stroke="#e6ddc3"
              stroke-width="1"
            />

            <!-- Rotating gear in panel -->
            <g class="gear-main">
              <circle cx="148" cy="87" r="10" fill="#ffffff" stroke="#111111" stroke-width="2" />
              <circle cx="148" cy="87" r="4" fill="#111111" />
              <rect x="146" y="75" width="4" height="6" rx="1" fill="#111111" />
              <rect x="146" y="93" width="4" height="6" rx="1" fill="#111111" />
              <rect x="136" y="85" width="6" height="4" rx="1" fill="#111111" />
              <rect x="154" y="85" width="6" height="4" rx="1" fill="#111111" />
            </g>

            <!-- Scan bar -->
            <rect
              class="scan-bar"
              x="120"
              y="108"
              width="20"
              height="4"
              rx="2"
              fill="#111111"
              opacity="0.15"
            />

            <!-- Monitor stand -->
            <rect x="94" y="142" width="46" height="6" rx="3" fill="#e2e8f0" />
            <rect x="84" y="148" width="66" height="9" rx="4.5" fill="#cbd5e1" />

            <!-- Side chat bubble (floating) -->
            <g class="chat-floating">
              <rect
                x="170"
                y="72"
                width="52"
                height="20"
                rx="10"
                fill="#111111"
              />
              <path
                d="M178 92 L184 92 L180 98 Z"
                fill="#111111"
              />
              <g class="dot-typing" transform="translate(178 80)">
                <circle cx="0" cy="0" r="2.4" fill="#ffffff" />
                <circle cx="7" cy="0" r="2.4" fill="#ffffff" />
                <circle cx="14" cy="0" r="2.4" fill="#ffffff" />
              </g>
            </g>

            <!-- User avatar with headset (bottom left) -->
            <g transform="translate(58 146)">
              <circle cx="0" cy="0" r="11" fill="#ffe5d4" />
              <path
                d="M-8 -1 q8 7 16 0"
                stroke="#e0b59b"
                stroke-width="2"
                fill="none"
                stroke-linecap="round"
              />
              <!-- headset band -->
              <path
                d="M-7 -4 q7 -7 14 0"
                stroke="#111111"
                stroke-width="2"
                fill="none"
                stroke-linecap="round"
              />
              <circle cx="-11" cy="0" r="3" fill="#111111" />
              <path
                d="M5 3 q5 4 0 7"
                stroke="#111111"
                stroke-width="1.6"
                fill="none"
                stroke-linecap="round"
              />
              <circle cx="5" cy="12" r="2" fill="#111111" />
            </g>

            <!-- Small ticket badge -->
            <rect
              x="182"
              y="128"
              width="40"
              height="16"
              rx="8"
              fill="#ffffff"
              stroke="#e2e8f0"
              stroke-width="1"
            />
            <circle cx="190" cy="136" r="4" fill="#f9c86f" />
            <rect x="198" y="133" width="20" height="6" rx="3" fill="#f1f5f9" />
          </svg>
        </div>

        <!-- RIGHT: TEXT + FORM -->
        <div>
          <div class="support-pill">
            <span class="support-pill-dot"></span>
            Technical Support
          </div>

          <h1 class="support-heading">Tell us about a technical issue.</h1>

          <p class="support-subtext">
            If a button didn’t work, a page didn’t load correctly, or you saw an
            error message, describe what happened and we’ll look into it as soon
            as possible.
          </p>

          <div class="support-form-card">
            <form @submit.prevent="handleSubmit">
              <div class="form-group">
                <label class="form-label" for="name">Your name *</label>
                <input id="name" name="name" v-model="form.name" class="form-input" required />
              </div>

              <div class="form-group">
                <label class="form-label" for="email">Email *</label>
                <input id="email" name="email" type="email" v-model="form.email" class="form-input" required />
              </div>

              <div class="form-group">
                <label class="form-label" for="issue">Describe the issue *</label>
                <textarea id="issue" name="issue" v-model="form.issue" class="form-textarea" required></textarea>
              </div>

              <button type="submit" class="btn-primary">Send report</button>

              <div v-if="showSuccess" class="support-success">
                Your report was sent. Thank you 💚
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
</template>

<script setup>
import { ref } from 'vue'

const form = ref({
  name: '',
  email: '',
  issue: ''
})
const showSuccess = ref(false)

const handleSubmit = async () => {
  try {
    const response = await fetch('https://circle-9srg.onrender.com/api/general/send-support', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(form.value)
    })

    if (response.ok) {
      // Reset form
      form.value = { name: '', email: '', issue: '' }
      
      // Show success message
      alert('Message sent successfully!')
      showSuccess.value = true
      setTimeout(() => {
        showSuccess.value = false
      }, 4000)
    } else {
      alert('Failed to send message. Please try again.')
    }
  } catch (error) {
    console.error('Error submitting form:', error)
    alert('An error occurred. Please try again later.')
  }
}
</script>

<style scoped>
.page-wrap {
  max-width: 1180px;
  margin: 24px auto 56px;
  padding: 0 20px;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.support-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 26px;
  padding: 24px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.06);
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 1.4fr);
  gap: 24px;
  align-items: center;
}

.support-figure {
  display: flex;
  justify-content: center;
  align-items: center;
}

.support-svg {
  max-width: 360px;
  width: 100%;
  height: auto;
}

/* ANIMATIONS */
.gear-main {
  transform-origin: 208px 76px;
  animation: gear-rotate 5s linear infinite;
}

@keyframes gear-rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.scan-bar {
  animation: scan-move 2.4s ease-in-out infinite;
}

@keyframes scan-move {
  0% {
    transform: translateX(0);
    opacity: 0.1;
  }
  40% {
    transform: translateX(32px);
    opacity: 0.9;
  }
  80% {
    transform: translateX(64px);
    opacity: 0.1;
  }
  100% {
    transform: translateX(0);
    opacity: 0.1;
  }
}

.chat-floating {
  animation: chat-float 2.2s ease-in-out infinite;
}

@keyframes chat-float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-6px);
  }
}

.dot-typing circle {
  animation: typing 1.4s ease-in-out infinite;
}

.dot-typing circle:nth-child(2) {
  animation-delay: 0.15s;
}

.dot-typing circle:nth-child(3) {
  animation-delay: 0.3s;
}

@keyframes typing {
  0%,
  100% {
    transform: translateY(0);
    opacity: 0.3;
  }
  50% {
    transform: translateY(-3px);
    opacity: 1;
  }
}

.support-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 4px 11px;
  margin-bottom: 10px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #111111;
}

.support-pill-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: 2px solid #111111;
  background: #fff;
}

.support-heading {
  font-size: 24px;
  font-weight: 800;
  margin-bottom: 4px;
  color: #111111;
}

.support-subtext {
  font-size: 13px;
  color: #4b5563;
  margin-bottom: 16px;
  line-height: 1.5;
}

.support-form-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  padding: 16px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.02);
}

.form-group {
  margin-bottom: 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.form-label {
  font-size: 12px;
  font-weight: 600;
  color: #4b5563;
}

.form-input,
.form-textarea {
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  padding: 8px 10px;
  font-size: 13px;
  background: #ffffff;
  outline: none;
  transition: all 0.2s;
  color: #111111;
}

.form-input:focus,
.form-textarea:focus {
  border-color: #111111;
  box-shadow: 0 0 0 1px #111111;
}

.form-textarea {
  min-height: 90px;
  resize: vertical;
}

.btn-primary {
  display: inline-block;
  border: none;
  border-radius: 999px;
  padding: 8px 20px;
  font-size: 13px;
  font-weight: 600;
  background: #111111;
  color: #fff;
  cursor: pointer;
  transition: box-shadow 0.2s ease, transform 0.1s ease;
}

.btn-primary:active {
  transform: translateY(1px);
  filter: brightness(0.96);
}

.support-success {
  display: inline-block;
  margin-top: 10px;
  border-radius: 999px;
  padding: 6px 12px;
  font-size: 12px;
  color: #111111;
  background-color: #f1f5f9;
}

@media (max-width: 900px) {
  .support-card {
    grid-template-columns: 1fr;
  }
}
</style>
