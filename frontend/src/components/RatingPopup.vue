<template>
  <el-dialog
    v-model="visible"
    title="Give Feedback!"
    width="800px"
    class="rating-dialog"
    :close-on-click-modal="false"
    :show-close="true"
    append-to-body
    modal
    @close="handleClose"
  >
    <div class="feedback-container">
      <div class="input-column">
        <div class="rating-section">
          <h3 class="rating-title">Your rating <i class="fas fa-question-circle rating-icon"></i></h3>
          <el-rate v-model="rating" size="large" :colors="['#fcc419', '#fcc419', '#fcc419']" />
        </div>
        <div class="thoughts-section">
          <label class="thoughts-question" for="feedback-text" style="display: block;">Do you have any thoughts you'd like to share?</label>
          <textarea id="feedback-text" name="feedback" v-model="feedbackText" placeholder="Tell us about your experience..." class="feedback-textarea" rows="5"></textarea>
          <div class="anonymous-option">
            <label class="checkbox-label" for="anonymous-feedback">
              <input type="checkbox" id="anonymous-feedback" name="anonymous" v-model="isAnonymous" />
              <span class="checkbox-text">Hide my name (Post Anonymously)</span>
            </label>
          </div>
        </div>
      </div>
      <div class="preview-column">
        <h3 class="preview-title">Live Preview</h3>
        <div class="review-card preview-card">
          <div class="review-header">
            <div class="reviewer-info">
              <div class="avatar">{{ isAnonymous ? '?' : 'Y' }}</div>
              <div><span class="name">{{ isAnonymous ? 'Incognito User' : 'You' }}</span><span class="date">Just now</span></div>
            </div>
            <div class="review-stars"><i v-for="n in 5" :key="n" class="fas fa-star" :class="{ filled: n <= rating }"></i></div>
          </div>
          <p class="review-text">{{ feedbackText || 'Your review text will appear here...' }}</p>
        </div>
      </div>
    </div>
    <template #footer>
      <div class="rating-footer">
        <button class="footer-btn cancel-btn" @click="handleClose">Cancel</button>
        <button class="footer-btn submit-btn" @click="submitFeedback" :disabled="rating === 0">Submit</button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  event: Object,
  modelValue: Boolean,
  initialRating: { type: Number, default: 0 },
  initialFeedback: { type: String, default: '' },
  initialAnonymous: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'close', 'submit'])

const visible = ref(props.modelValue)
const rating = ref(props.initialRating)
const feedbackText = ref(props.initialFeedback)
const isAnonymous = ref(props.initialAnonymous)

watch(() => props.modelValue, (val) => { visible.value = val })
watch(visible, (val) => { emit('update:modelValue', val) })

const handleClose = () => { emit('close') }
const submitFeedback = () => {
  if (rating.value > 0) {
    emit('submit', { rating: rating.value, feedback: feedbackText.value, isAnonymous: isAnonymous.value })
  }
}
</script>

<style scoped>
/* CSS kodları aynen senin attığın gibi */
.feedback-container { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; }
.input-column { display: flex; flex-direction: column; }
.preview-column { background: #ffffff; border-radius: 12px; padding: 20px; border: 1px dashed #e2e8f0; }
.preview-title { font-size: 14px; font-weight: 600; color: #64748b; margin: 0 0 16px 0; text-transform: uppercase; letter-spacing: 0.05em; }
.rating-section { margin-bottom: 24px; }
.rating-title { display: flex; align-items: center; gap: 8px; color: #111111; margin-top: 0; margin-bottom: 12px; font-size: 16px; font-weight: 600; }
.rating-icon { color: #94a3b8; font-size: 14px; cursor: help; }
.thoughts-section { margin-top: 0; }
.thoughts-question { color: #111111; margin-bottom: 12px; font-weight: 500; font-size: 14px; }
.feedback-textarea { width: 100%; min-height: 120px; padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; font-family: "Inter", sans-serif; font-size: 14px; background-color: #fff; color: #111111; resize: vertical; line-height: 1.5; outline: none; transition: border-color 0.2s; }
.feedback-textarea:focus { border-color: #111111; }
.anonymous-option { margin-top: 16px; }
.checkbox-label { display: flex; align-items: center; gap: 8px; cursor: pointer; user-select: none; }
.checkbox-text { font-size: 14px; color: #475569; font-weight: 500; }
input[type="checkbox"] { accent-color: #111111; width: 16px; height: 16px; cursor: pointer; }
.review-card { background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; }
.review-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
.reviewer-info { display: flex; align-items: center; gap: 12px; }
.avatar { width: 40px; height: 40px; background: #f1f5f9; color: #111111; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; }
.reviewer-info .name { display: block; font-weight: 600; color: #111111; }
.reviewer-info .date { font-size: 12px; color: #9ca3af; }
.review-stars { color: #e2e8f0; font-size: 14px; }
.review-stars .filled { color: #fbbf24; }
.review-text { color: #475569; line-height: 1.6; margin: 0; word-break: break-word; }

/* Custom Footer Buttons */
.rating-footer { display: flex; justify-content: flex-end; gap: 10px; }
.footer-btn { padding: 9px 20px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
.cancel-btn { background: #ffffff; border: 1px solid #e2e8f0; color: #475569; }
.cancel-btn:hover { background: #f8fafc; border-color: #cbd5e1; color: #111111; }
.submit-btn { background: #111111; border: 1px solid #111111; color: #ffffff; }
.submit-btn:hover:not(:disabled) { background: #333333; }
.submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }

@media (max-width: 768px) { .feedback-container { grid-template-columns: 1fr; } }
</style> 
