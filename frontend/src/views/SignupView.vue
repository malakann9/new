<template>
  <div class="signup-page">
    <main>
        <div class="signup-container">
            <div class="signup-box">
                <svg class="close-icon" width="47" height="47" viewBox="0 0 47 47" fill="none" xmlns="http://www.w3.org/2000/svg" @click="$router.push('/')">
                  <path d="M18.6042 18.604L28.3959 28.3957" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M28.3959 18.604L18.6042 28.3957" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M33.2917 5.875H13.7083C9.3821 5.875 5.875 9.3821 5.875 13.7083V33.2917C5.875 37.6179 9.3821 41.125 13.7083 41.125H33.2917C37.6179 41.125 41.125 37.6179 41.125 33.2917V13.7083C41.125 9.3821 37.6179 5.875 33.2917 5.875Z" stroke="var(--Accents-Orange, #FF8D28)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>

                <h2 class="title">SIGN UP</h2>

                <el-form ref="formRef" :model="form" :rules="rules" label-position="top" class="signup-form">
                    <div class="form-row">
                        <el-form-item label="First Name" prop="firstName" label-for="signup-firstName">
                            <el-input id="signup-firstName" name="firstName" v-model="form.firstName" placeholder="Enter your first name"></el-input>
                        </el-form-item>
                        <el-form-item label="Last Name" prop="lastName" label-for="signup-lastName">
                            <el-input id="signup-lastName" name="lastName" v-model="form.lastName" placeholder="Enter your last name"></el-input>
                        </el-form-item>
                    </div>
                    <el-form-item label="Username" prop="username" label-for="signup-username">
                        <el-input id="signup-username" name="username" v-model="form.username" placeholder="Enter your username"></el-input>
                    </el-form-item>

                    <el-form-item label="Major" prop="major" label-for="signup-major">
                        <el-input id="signup-major" name="major" v-model="form.major" placeholder="e.g. Computer Science"></el-input>
                    </el-form-item>

                    <el-form-item label="Email" prop="email" label-for="signup-email">
                        <el-input id="signup-email" name="email" v-model="form.email" placeholder="Enter your e-mail"></el-input>
                    </el-form-item>
                    <el-form-item label="Password" prop="password" label-for="signup-password">
                        <el-input id="signup-password" name="password" v-model="form.password" type="password" show-password placeholder="Create a password"></el-input>
                    </el-form-item>
                    <el-form-item label="Confirm Password" prop="confirmPassword" label-for="signup-confirmPassword">
                        <el-input id="signup-confirmPassword" name="confirmPassword" v-model="form.confirmPassword" type="password" show-password placeholder="Re-enter your password"></el-input>
                    </el-form-item>
                    <el-form-item>
                        <el-button class="signup-button" type="success" :loading="isSubmitting" @click="submit">
                            Sign up
                        </el-button>
                    </el-form-item>
                </el-form>

                <div class="no-account">
                    Already have an account? <router-link to="/login">Sign in.</router-link>
                </div>
            </div>
        </div>
        
        <footer class="bottom-links">
        </footer>
    </main>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { apiFetch } from '../api'

const router = useRouter()
const formRef = ref(null)
const isSubmitting = ref(false)
const form = ref({
    username: '',
    firstName: '',
    lastName: '',
    major: '',
    email: '',
    password: '',
    confirmPassword: ''
})

const validatePasswordStrength = (rule, value, callback) => {
    if (!value) {
        callback(new Error('Password is required'))
    } else if (value.length < 8) {
        callback(new Error('Password must be at least 8 characters'))
    } else {
        callback()
    }
}

const validateConfirmPassword = (rule, value, callback) => {
    if (!value) {
        callback(new Error('Please confirm your password'))
    } else if (value !== form.value.password) {
        callback(new Error('Passwords do not match'))
    } else {
        callback()
    }
}

const rules = {
    username: [
        { required: true, message: 'Username is required', trigger: 'blur' }
    ],
    firstName: [
        { required: true, message: 'First name is required', trigger: 'blur' }
    ],
    lastName: [
        { required: true, message: 'Last name is required', trigger: 'blur' }
    ],
    major: [
        { required: true, message: 'Major is required', trigger: 'blur' }
    ],
    email: [
        { required: true, message: 'Email is required', trigger: 'blur' },
        { type: 'email', message: 'Enter a valid email', trigger: ['blur', 'change'] }
    ],
    password: [
        { validator: validatePasswordStrength, trigger: 'blur' }
    ],
    confirmPassword: [
        { validator: validateConfirmPassword, trigger: 'blur' }
    ]
}

watch(
    () => form.value.password,
    () => {
        if (!formRef.value) return
        formRef.value.validateField('confirmPassword')
    }
)

const submit = () => {
    if (!formRef.value) return
    
    formRef.value.validate(async (valid) => { // async ekledik
        if (valid) {
            isSubmitting.value = true
            
            try {
                // --- BACKEND BAĞLANTISI (YENİ EKLENEN KISIM) ---
                const response = await apiFetch('/api/auth/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    // Backend auth.py tam olarak bu isimleri bekliyor:
                    body: JSON.stringify({
                        firstName: form.value.firstName,
                        lastName: form.value.lastName,
                        username: form.value.username,
                        email: form.value.email,
                        major: form.value.major,
                        password: form.value.password
                    })
                });

                const data = await response.json();

            if (response.ok) {
                ElMessage.success({
                    message: 'Registration successful! Please check your email to verify your account.',
                    duration: 3000
                });

                setTimeout(() => {
                    router.push('/login');
                }, 3000);
            } else {
                    // Backend hata döndürdü (Örn: "Email zaten var")
                    ElMessage.error(data.error || 'Registration failed. Please try again.');
                }
            } catch (error) {
                console.error('Registration error:', error);
                ElMessage.error('Unable to connect to the server.');
            } finally {
                isSubmitting.value = false;
            }
        }
    })
}
</script>

<style scoped>
/* General Settings */
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');

.signup-page {
    --color-bg-main: #ffffff;
    --color-text-dark: #000000;
    --color-text-link: #FF9E4A;
    --color-green-dark: #111111;
    
    font-family: 'Roboto', sans-serif;
    color: #333;
    min-height: 100vh;
}

main {
    padding-top: 40px;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
}

/* Signup Container - Vertical Position Fix */
.signup-container {
    flex-grow: 1;
    display: flex;
    align-items: flex-start; /* Align to top */
    justify-content: center;
    padding: 80px 20px 20px; /* Fixed top spacing */
    width: 100%;
}

.signup-box {
    background-color: #ffffff;
    border-radius: 15px;
    padding: 40px 50px;
    width: 100%;
    max-width: 740px; /* Increased width to match Login box */
    text-align: center;
    position: relative;
    border: 1px solid #e2e8f0;
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    box-sizing: border-box;
}

.close-icon {
    position: absolute;
    top: 15px;
    right: 20px;
    width: 47px;
    height: 47px;
    cursor: pointer;
    opacity: 0.7;
    transition: opacity 0.2s, transform 0.2s;
    color: var(--color-green-dark);
}

.title {
    color: #111111;     
    font-size: 36px;   
    font-weight: 800;  
    margin-bottom: 30px; 
    font-family: 'Roboto', sans-serif;
}

/* Form Styles */
.signup-form {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.form-row {
    display: flex;
    gap: 20px;
}

.form-row .el-form-item {
    flex: 1;
}

/* Custom Input Styles for Substantial Look */
:deep(.el-input__wrapper) {
    height: 69px; /* Increased to match Login page */
    border-radius: 8px;
    box-shadow: none;
    border: 1px solid #e2e8f0;
    background-color: #ffffff;
    padding: 0 20px;
}

:deep(.el-input__wrapper.is-focus) {
    border-color: #111111;
    box-shadow: 0 0 0 1px #111111;
}

:deep(.el-input__inner) {
    font-size: 15px; /* Matched Login page */
    height: 100%;
    color: #333;
}

:deep(.el-form-item__label) {
    font-size: 16px;
    font-weight: 600;
    color: #4b5563;
    margin-bottom: 6px;
}

/* Button */
.signup-button {
    width: 100%;
    height: 76.18px;
    border-radius: 16px;
    background-color: #111111;
    border-color: #111111;
    font-size: 24px;
    font-weight: 800;
    font-family: 'Roboto', sans-serif;
    color: #ffffff;
    margin-top: 10px;
    transition: background-color 0.3s, border-color 0.3s;
}

.signup-button:hover {
    background-color: #333333;
    border-color: #333333;
}

/* Links */
.no-account {
    color: #7F8B9E;
    font-size: 20px;
    font-weight: 400;
    margin-top: 20px;
    text-align: center;
}

.no-account a {
    color: #FF9E4A;
    font-size: 20px;
    font-weight: 700;
    text-decoration: underline;
}

.bottom-links {
    padding: 10px 20px 20px 20px; 
    width: 100%;
    text-align: center;
}

.bottom-links a {
    color: rgba(0, 0, 0, 0.70);
    font-size: 16px;
    font-family: Roboto;
    font-weight: 600;
    letter-spacing: 3.84px;
    margin: 0 25px;
    text-decoration: none;
}

/* Responsive Styles */
@media (max-width: 768px) {
    .signup-container {
        padding-top: 40px; /* Slightly less padding on mobile if needed, or keep 80px */
    }

    .signup-box {
        width: 90%; /* 90% width on mobile */
        max-width: none;
        padding: 30px 20px; /* Reduced padding */
    }

    .form-row {
        flex-direction: column;
        gap: 0;
    }

    .title {
        font-size: 28px;
    }

    .bottom-links a {
        display: block;
        margin: 10px 0;
        letter-spacing: 1px;
    }

    /* Match Login page mobile input styles */
    :deep(.el-input__wrapper) {
        height: 55px;
        padding: 0 15px;
    }

    :deep(.el-input__inner) {
        font-size: 14px;
    }

    .signup-button {
        height: 60px;
        font-size: 20px;
    }
}
</style>
