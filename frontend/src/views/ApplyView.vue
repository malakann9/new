<template>
    <div class="page-wrap">
      <section class="club-card">
        <!-- LEFT SIDE: TEXT -->
        <div>
          <h1 class="club-left-title">Add your club to CirCle.</h1>
          <p class="club-left-sub">
            Are you running a student club or community and want your events to appear on CirCle?
            Fill out this form and send us your details. We’ll review your application and,
            once approved, your club will be visible to students on the platform.
          </p>

          <ul class="check-list">
            <li>
              <span class="check-icon"><i class="fas fa-check"></i></span>
              Reach more students who are actively looking for events.
            </li>
            <li>
              <span class="check-icon"><i class="fas fa-check"></i></span>
              Keep all your club’s activities in one clear place.
            </li>
            <li>
              <span class="check-icon"><i class="fas fa-check"></i></span>
              Make it easier for new members to discover and join you.
            </li>
          </ul>

          <div class="info-pill">
            <i class="far fa-question-circle"></i>
            Applications are reviewed manually before going live.
          </div>
        </div>

        <!-- RIGHT SIDE: FORM -->
        <div class="club-form-card">
          <el-form :model="form"  @submit.prevent="handleSubmit" novalidate>
            <div class="section-label">Club information</div>
            <div class="section-divider"></div>

            <div class="form-grid-2">
              <div class="form-group">
                <label class="form-label" for="clubName">
                  Club / community name <span>*</span>
                </label>
                <el-input
                  id="clubName"
                  name="clubName"
                  v-model="form.clubName"
                  class="form-input"
                  required
                />
                <div v-if="errors.clubName" class="form-error-inline">
                  {{ errors.clubName }}
                </div>
              </div>

              <div class="form-group">
                <label class="form-label" for="university">University <span>*</span></label>
                <el-select id="university" name="university" v-model="form.university" class="form-select" required>
                  <el-option value="">Select university</el-option>
                  <el-option value="Ankara Yıldırım Beyazıt University">Ankara Yıldırım Beyazıt University</el-option>
                  <el-option value="Ankara University">Ankara University</el-option>
                  <el-option value="Orta doğu teknik Üniversitesi">Orta doğu teknik Üniversitesi</el-option>
                  <el-option value="Hacettepe Üniversitesi">Hacettepe Üniversitesi</el-option>
                  <el-option value="Bilkent Üniversitesi ">Bilkent Üniversitesi </el-option>
                  <el-option value="Gazi Üniversitesi">Gazi Üniversitesi</el-option>
                  <el-option value="Other">Other</el-option>
                </el-select>
                <div v-if="errors.university" class="form-error-inline">
                  {{ errors.university }}
                </div>
              </div>
            </div>

            <div class="form-grid-2">
              <div class="form-group">
                <label class="form-label" for="clubType">
                  Club type <span>*</span>
                </label>
                <el-select id="clubType" name="clubType" v-model="form.clubType" class="form-select" required>
                  <el-option value="">Select type</el-option>
                  <el-option value="official">Official university club</el-option>
                  <el-option value="community">Student community / interest group</el-option>
                </el-select>
                <div v-if="errors.clubType" class="form-error-inline">
                  {{ errors.clubType }}
                </div>
              </div>

              <div class="form-group">
                <label class="form-label" for="category">
                  Category <span>*</span>
                </label>
                <el-select id="category" name="category" v-model="form.category" class="form-select" required>
                  <el-option value="">Select category</el-option>
                  <el-option value="Academic">Academic</el-option>
                  <el-option value="Technology">Technology</el-option>
                  <el-option value="Culture & Arts">Culture &amp; Arts</el-option>
                  <el-option value="Sports">Sports</el-option>
                  <el-option value="Social">Social</el-option>
                  <el-option value="Others">Others</el-option>
                </el-select>
                <div v-if="errors.category" class="form-error-inline">
                  {{ errors.category }}
                </div>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="description">
                Short description <span>*</span>
              </label>
              <el-input
                type="textarea"
                id="description"
                name="description"
                v-model="form.description"
                class="form-textarea"
                placeholder="Tell us briefly what your club is about and who it is for."
                required
              ></el-input>
              <div v-if="errors.description" class="form-error-inline">
                {{ errors.description }}
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="events">
                What kind of events do you organize?
              </label>
              <el-input
                type="textarea" 
                id="events"
                name="events"
                v-model="form.events"
                class="form-textarea"
                placeholder="Example: weekly meetups, workshops, competitions, trips, online sessions..."
              ></el-input>
            </div>

            <div class="section-label" style="margin-top: 8px;">Contact</div>
            <div class="section-divider"></div>

            <div class="form-grid-2">
              <div class="form-group">
                <label class="form-label" for="contactName">
                  Contact person name <span>*</span>
                </label>
                <el-input
                  id="contactName"
                  name="contactName"
                  v-model="form.contactName"
                  class="form-input"
                  required
                />
                <div v-if="errors.contactName" class="form-error-inline">
                  {{ errors.contactName }}
                </div>
              </div>

              <div class="form-group">
                <label class="form-label" for="studentNumber">
                  Student number (optional)
                </label>
                <el-input
                  id="studentNumber"
                  name="studentNumber"
                  v-model="form.studentNumber"
                  class="form-input"
                  :placeholder="studentNumberPlaceholder"
                />
              </div>
            </div>

            <div class="form-grid-2">
              <div class="form-group">
                <label class="form-label" for="email">
                  Contact email <span>*</span>
                </label>
                <el-input
                  id="email"
                  name="email"
                  v-model="form.email"
                  type="email"
                  class="form-input"
                  required
                />
                <div v-if="errors.email" class="form-error-inline">
                  {{ errors.email }}
                </div>
              </div>

              <div class="form-group">
                <label class="form-label" for="instagram">
                  Instagram (optional)
                </label>
                <el-input
                  id="instagram"
                  name="instagram"
                  v-model="form.instagram"
                  class="form-input"
                  placeholder="https://instagram.com/yourclub"
                />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="otherLink">
                Other link (optional)
              </label>
              <el-input
                id="otherLink"
                name="otherLink"
                v-model="form.otherLink"
                class="form-input"
                placeholder="Website, Telegram, WhatsApp, Discord..."
              />
            </div>

            <div class="section-label" style="margin-top: 8px;">Verification</div>
            <div class="section-divider"></div>

            <div class="form-group">
              <label class="form-label" for="clubImage">
                Club Image (optional)
              </label>
              <input
                id="clubImage"
                name="clubImage"
                type="file"
                class="form-file"
                accept=".png,.jpg,.jpeg"
                @change="handleFileChange"
              />
              <p class="form-small">
                Upload a logo or representative image for your club.
              </p>
            </div>

            <div class="form-footer-row">
              <label class="checkbox-row" for="confirmRepresentative">
                <el-checkbox id="confirmRepresentative" name="confirmRepresentative" type="checkbox" v-model="form.confirm" required />
                <span>
                  I confirm that I am an official representative of this club /
                  community and the information is correct.
                </span>
              </label>

              <button type="submit" class="btn-primary">
                Submit application
                <i class="fas fa-paper-plane"></i>
              </button>
            </div>

            <div v-if="showSuccess" class="form-success">
              <i class="far fa-check-circle"></i>
              Your application was sent. We’ll review it as soon as possible 💚
            </div>
          </el-form>
        </div>
      </section>
    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { apiFetch } from '../api'

const router = useRouter()

const form = reactive({
  subject: "Yeni Kulüp Başvurusu",
  clubName: '',
  university: '',
  clubType: '',
  category: '',
  description: '',
  events: '',
  contactName: '',
  studentNumber: '',
  email: '',
  instagram: '',
  otherLink: '',
  clubImage: null,
  confirm: false
})

const errors = reactive({})
const showSuccess = ref(false)

const studentNumberPlaceholder = computed(() => {
  if (form.university === 'Ankara Yıldırım Beyazıt University') {
    return 'If you are from AYBU, you can add it.'
  } else if (form.university === 'Other') {
    return 'Enter your student number if applicable.'
  }
  return 'Select university first.'
})

const handleFileChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    form.clubImage = file
  }
}

onMounted(() => {
  const token = localStorage.getItem('user_token')
  if (!token) {
    router.push('/login')
  }
})

const validate = () => {
  Object.keys(errors).forEach(key => delete errors[key])
  let isValid = true

  if (!form.clubName.trim()) {
    errors.clubName = "This field is required."
    isValid = false
  }
  if (!form.university) {
    errors.university = "Please select a university."
    isValid = false
  }
  if (!form.clubType) {
    errors.clubType = "Please choose a type."
    isValid = false
  }
  if (!form.category) {
    errors.category = "Please select a category."
    isValid = false
  }
  if (!form.description.trim()) {
    errors.description = "Please add a short description."
    isValid = false
  }
  if (!form.contactName.trim()) {
    errors.contactName = "Please enter a contact name."
    isValid = false
  }
  if (!form.email.trim() || !/^\S+@\S+\.\S+$/.test(form.email.trim())) {
    errors.email = "Please enter a valid email."
    isValid = false
  }
  if (!form.confirm) {
    alert("Please confirm that you are a representative of the club.")
    isValid = false
  }

  return isValid
}

const handleSubmit = async () => {
  if (!validate()) return

  // Simulate API call
  console.log("Submitting application:", form)
  

  
  // Reset file input manually if needed
  const fileInput = document.getElementById('proof')
  if (fileInput) fileInput.value = ''

  let token = localStorage.getItem('user_token');
  // let payload = JSON.stringify(form);
  const fd = new FormData();
  fd.append("clubName", form.clubName);
  fd.append("university", form.university);
  fd.append("clubType", form.clubType);
  fd.append("category", form.category);
  fd.append("shortDescription", form.description); // preserving duplication if backend expects it
  fd.append("description", form.description);
  fd.append("contactName", form.contactName);
  fd.append("events", form.events);
  fd.append("studentNumber", form.studentNumber);
  fd.append("email", form.email);
  fd.append("instagram", form.instagram);
  fd.append("otherLink", form.otherLink);
  
  if (form.clubImage) {
    fd.append("clubImage", form.clubImage);
  }

  // Log for verification
  for (let [key, value] of fd.entries()) {
    console.log(`FormData Apply: ${key} =`, value)
  }



  let response = await apiFetch('/api/general/communities/apply', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: fd
  })
    if (response.status === 422) {
      response.json().then(error => {
        console.log('Validation hatası:', error);
        debugger;
      })
    }    
    let data = await response.json();
    if (data.error) {
      alert(data.error);
      return;
    }
    if (data.message) {
      alert(data.message);
    }
    console.log('Response from server:', data);
    // Reset form
    /*Object.keys(form).forEach(key => {
      if (key === 'confirm') form[key] = false
      else if (key === 'proof') form[key] = null
      else form[key] = ''
    })*/
    showSuccess.value = true
    setTimeout(() => {
      showSuccess.value = false
    }, 4000)

}
</script>

<style scoped>
/* Scoped styles ported from apply.html */
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
  --danger: #e55353;
}

.page-wrap {
  max-width: 1180px;
  margin: 24px auto 56px;
  padding: 0 20px 40px;
  font-family: "Inter", system-ui, -apple-system, "Segoe UI", sans-serif;
}

.club-card {
  border-radius: 20px;
  background: #ffffff;
  padding: 32px 0 24px;
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 1.4fr);
  gap: 40px;
  align-items: flex-start;
}

.club-left-title {
  font-size: 32px;
  font-weight: 800;
  color: #111111;
  margin-bottom: 12px;
  letter-spacing: -0.02em;
}

.club-left-sub {
  font-size: 15px;
  color: #4b5563;
  margin-bottom: 24px;
  line-height: 1.6;
}

.check-list {
  list-style: none;
  display: grid;
  gap: 12px;
  margin-bottom: 24px;
  padding-left: 0;
}

.check-list li {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: #374151;
}

.check-icon {
  width: 20px;
  height: 20px;
  border-radius: 999px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  color: #111111;
  flex-shrink: 0;
}

.info-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 999px;
  background: #ffffffd0;
  font-size: 11px;
  color: #6b7c74;
}

.info-pill i {
  font-size: 12px;
  color: #4B2E15;
}

.club-form-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 32px 36px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
}

.section-label {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #6b7280;
  margin-bottom: 6px;
}

.section-divider {
  height: 1px;
  background: #e5e7eb;
  margin-bottom: 16px;
}

.form-grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-group {
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
}

.form-label span {
  color: #e55353;
}

.form-input,
.form-select,
.form-textarea,
.form-file {
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  padding: 10px 12px;
  font-size: 14px;
  background: #ffffff;
  outline: none;
  width: 100%;
  transition: all 0.2s ease;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus,
.form-file:focus {
  border-color: #111111;
  box-shadow: 0 0 0 1px #111111;
}

.form-select {
  cursor: pointer;
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.form-small {
  font-size: 11px;
  color: #6b7c74;
}

.form-footer-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  justify-content: space-between;
  margin-top: 8px;
}

.checkbox-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #4b5563;
}

.checkbox-row input {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  border: 1px solid #e2e8f0;
}

.btn-primary {
  border: none;
  border-radius: 999px;
  padding: 10px 24px;
  font-size: 14px;
  font-weight: 600;
  background: #111111;
  color: #ffffff;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary i {
  font-size: 14px;
}

.btn-primary:active {
  transform: translateY(1px);
  filter: brightness(0.96);
}

.form-success {
  margin-top: 8px;
  border-radius: 999px;
  padding: 6px 12px;
  font-size: 12px;
  color: #145c32;
  background-color: #e0f5e5;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.form-success i {
  font-size: 13px;
}

.form-error-inline {
  font-size: 11px;
  color: #e55353;
}

@media (max-width: 960px) {
  .club-card {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .page-wrap {
    padding: 0 14px 32px;
  }

  .club-card {
    padding: 20px 16px 18px;
    border-radius: 22px;
  }

  .club-left-title {
    font-size: 22px;
  }

  .form-grid-2 {
    grid-template-columns: 1fr;
  }
}
</style>
