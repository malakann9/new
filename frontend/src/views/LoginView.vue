<template>
  <div class="login-page">
    <main>
        
        <div class="signin-container">
            
            <div class="signin-box">
                  <svg class="close-icon" width="47" height="47" viewBox="0 0 47 47" fill="none" xmlns="http://www.w3.org/2000/svg" @click="$router.push('/')">
                  <path d="M18.6042 18.604L28.3959 28.3957" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M28.3959 18.604L18.6042 28.3957" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M33.2917 5.875H13.7083C9.3821 5.875 5.875 9.3821 5.875 13.7083V33.2917C5.875 37.6179 9.3821 41.125 13.7083 41.125H33.2917C37.6179 41.125 41.125 37.6179 41.125 33.2917V13.7083C41.125 9.3821 37.6179 5.875 33.2917 5.875Z" stroke="var(--Accents-Orange, #FF8D28)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                
                <h2 class="title">SIGN IN</h2> 
                
            
                
                <form id="signin-form" @submit.prevent="handleLogin">
                    <div class="input-group" style="display: block; max-width: 642px; margin: 0 auto 20px;">
                        <label for="signin-username" style="display: block; text-align: left; margin-bottom: 8px; font-weight: 600; font-size: 15px; color: #333;">Username or Email</label>
                        <input type="text" id="signin-username" name="username" v-model="username" placeholder="User name or email">
                    </div>

                    <div class="input-group password-group" style="margin-bottom: 20px;">
                        <label for="signin-password" style="display: block; text-align: left; margin-bottom: 8px; font-weight: 600; font-size: 15px; color: #333;">Password</label>
                        <div style="position: relative;">
                            <input :type="showPassword ? 'text' : 'password'" id="signin-password" name="password" placeholder="Enter password" v-model="password">
                            <button type="button" class="password-toggle-btn" :aria-label="showPassword ? 'Hide password' : 'Show password'" @click="showPassword = !showPassword">
                                <i class="fas" :class="showPassword ? 'fa-eye-slash' : 'fa-eye'"></i>
                            </button>
                        </div>
                    </div>

                    <button type="submit" class="signin-button">Sign in</button>

                    <div class="options">
                        <div class="remember-me">
                            <input type="checkbox" id="remember" name="remember" checked>
                            <label for="remember">Remember me</label>
                        </div>
                        <span class="forgot-password" @click="$router.push('/forgot-password')" style="cursor: pointer; position: relative; z-index: 10;">Forget password?</span>
                        
                    </div>
                </form>

                <div class="no-account">
                    Don't have an account? <router-link to="/signup">Register.</router-link>
                </div>
            </div>
        </div>
        
        <footer class="bottom-links">
        </footer>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { apiFetch } from '../api'

const router = useRouter()
const showPassword = ref(false)
const username = ref('')
const password = ref('')

const handleLogin = async () => {
  const user = username.value;
  const pass = password.value;

  try {
    // 1. Send request to Backend
    const response = await apiFetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: user,
        password: pass
      })
    });

    // 2. Check if response is OK
    const data = await response.json();
    if (response.ok) {
      if (data.access_token) {
        // Store auth data
        localStorage.setItem('user_token', data.access_token);

        
        // Fix: Use backend name instead of input email
        let displayName = user;
        const u = data.user || {}; 
        if (u.first_name && u.last_name) {
             displayName = `${u.first_name} ${u.last_name}`;
        } else if (u.name) {
             displayName = u.name;
        } else if (u.username) {
             displayName = u.username;
        }
        localStorage.setItem('user_name', displayName);
        // ⭐ ADD THIS HERE
        localStorage.setItem("user_id", data.id || data.user_id || data.user.id || data.user?.id || 0);
        // --- FIXED LOGIC (ENGLISH) ---
        // We strictly use the role from the backend response.
        // If the backend doesn't send a role, we default to 'user'.
        // We DO NOT rely on the username being "admin".
        let userRole = 'user';
        
        if (data.user && data.user.role) {
            userRole = data.user.role;
        } else if (data.role) {
            // Fallback if backend sends role at the top level
            userRole = data.role;
        }

        localStorage.setItem('user_role', userRole);
        // -----------------------------

        window.dispatchEvent(new Event('auth-changed'));
        
        // Redirect logic
        if (userRole === 'admin' || userRole === 'super_admin' || userRole === 'superadmin') {
             router.push('/'); 
        } else {
             router.push('/');
        }
        
      } else {
        alert('Login failed: Token missing from response.');
      }
    } else {
      if (response.status === 429) {
        alert('Too many failed login attempts. Your account is temporarily locked. Please try again later.');
      } else {
        alert(data.error || 'Invalid username or password!');
      }
    }
  } catch (error) {
    console.error('Login error:', error);
    alert('Unable to connect to the server.');
  }
}
</script>

<style scoped>
/* Genel Ayarlar ve Fontlar */
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');
@import url('https://fonts.googleapis.com/icon?family=Material+Icons');

/* Renk Paleti */
.login-page {
    --color-bg-main: #ffffff; /* Genel Açık Gri/Beyaz Alan */
    --color-text-dark: #000000;
    --color-text-link: #FF9E4A; /* Register ve Şifre Linkleri */
    --color-green-dark: #111111;
    
    font-family: 'Roboto', sans-serif;
    color: #333;
    min-height: 100vh;
}

a {
    text-decoration: none;
    color: var(--color-green-dark);
    font-weight: 500;
}

/* --- Ana İçerik ve Arka Plan --- */
main {
    padding-top: 40px;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
}

/* --- 3. Giriş Kutusu (Sign In Modal) --- */
.signin-container {
    flex-grow: 1; /* Ortalamak için boşluğu doldur */
    display: flex;
    align-items: flex-start; /* Align to top */
    justify-content: center;
    padding: 80px 20px 20px; /* Increased top padding to 80px */
    width: 100%;
}

.signin-box {
    background-color: #ffffff;
    border-radius: 15px;
    padding: 40px 50px;
    width: 100%;
    max-width: 740px; /* Fixed width changed to max-width */
    min-height: 561px;
    
    text-align: center;
    position: relative;
    border: 1px solid #e2e8f0; /* Kesikli Çizgi Efekti KALDIRILDI */
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    box-sizing: border-box;
}
/* ... (rest of CSS) ... */

/* Hesap Yok Linki */
.no-account {
  color: #5C6B80;
    font-size: 20px;
    font-weight: 400; /* Figma'ya göre 500'den 400'e güncellendi */
    
    font-family: 'Roboto', sans-serif;
    word-wrap: break-word;
    margin-top: 20px;
    text-align: center;
}

.no-account a {
    color: #D97706;
    font-size: 20px;
    font-weight: 700;
    text-decoration: underline;
    cursor: pointer;
}

.close-icon {
   position: absolute ;
    top: 15px;
    right: 20px;
    width: 47px; /* HTML'de tanımladık ama CSS ile de garanti edebiliriz */
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

/* Giriş Alanları */
.input-group {
    margin-bottom: 20px;
    width: 100%;
}

.input-group input {
    width: 100%; /* Changed from fixed 642px */
    max-width: 642px;
    height : 69px;
    padding: 15px 20px;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    font-size: 15px;
    outline: none;
    transition: border-color 0.3s;
    box-sizing: border-box;
}

.input-group input:focus {
    border-color: var(--color-green-dark);
}

.password-group {
    position: relative;
    max-width: 642px;
    margin: 0 auto 20px; /* Center the input group */
}

/* Wrapper for the first input to center it as well */
.input-group:not(.password-group) {
    display: flex;
    justify-content: center;
}

.password-toggle-btn {
    position: absolute;
    right: 15px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: #666;
    cursor: pointer;
    font-size: 20px;
    padding: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.password-toggle-btn:hover {
    color: #111111;
}

.password-toggle-btn:focus-visible {
    outline: 2px solid #111111;
    border-radius: 50%;
}

.password-toggle-btn i {
    pointer-events: none;
}

.signin-button {
    width: 100%; /* Changed from fixed 637px */
    max-width: 637px;
    height: 76.18px;
    background-color: #111111; /* Figma'daki yeni yeşil renk */
    border-radius: 16px;       /* Figma'daki border-radius */
    font-size: 24px;           /* Figma'daki font boyutu */
    font-weight: 800;          /* Figma'daki font kalınlığı */

    /* Metni dikey ve yatay ortalamak için */
    display: flex;
    align-items: center;
    justify-content: center;

    /* --- Korunan Eski Stiller --- */
    padding: 0; /* Artık padding yerine height kullanıyoruz */
    color: white;
    border: none;
    cursor: pointer;
    margin: 10px auto 0; /* Center button */
    transition: background-color 0.3s;
}

.signin-button:hover {
    background-color:#333333;
}

/* Seçenekler (Hatırla Beni / Şifremi Unuttum) */
.options {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 15px;
    font-size: 14px;
    width: 100%;
    max-width: 637px; /* Butonla aynı hizada olması için */
    margin-left: auto;
    margin-right: auto;
    flex-wrap: wrap; /* Allow wrapping on small screens */
    gap: 10px;
}

.remember-me {
   display: flex;
    align-items: center;
    color: #666;
    position: relative; /* Konumlandırma için */
    cursor: pointer;
}

.remember-me input[type="checkbox"] {
    /* Varsayılan görünümü tamamen kaldır */
    appearance: none;
    -webkit-appearance: none;
    -moz-appearance: none;
    
    /* Gizli de olsa tıklama alanını koru */
    position: absolute;
    opacity: 0;
    width: 31px;
    height: 30px;
    cursor: pointer;
}
.remember-me label {
    padding-left: 40px;  /* 31px (kutu) + 9px (boşluk) */
    position: relative;
    cursor: pointer;
    line-height: 30px;   /* Metni 30px'lik kutuyla dikeyde hizalar */
    
    /* --- Figma'dan Gelen YENİ Stiller --- */
    font-size: 20px;
    font-weight: 400;
    color: #000000;  /* Kutunun yüksekliğiyle metni hizala */
}
.remember-me label::before {
    content: "";
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%); /* Dikeyde tam ortala */
    
    width: 31px;
    height: 30px; 
    background-color: #111111; /* Figma SVG'den gelen renk */
    
    /* Figma SVG'deki yuvarlak köşelere benzer bir değer */
    border-radius: 6px; 
}
.remember-me input[type="checkbox"]:checked + label::after {
    content: "";
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    
    width: 31px;
    height: 30px;

    /* Figma'daki 'tick' SVG path verisini URL-encode ederek 
      doğrudan CSS'e gömdük.
    */
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 31 30'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M21.8475 10.3662C22.352 10.8544 22.352 11.6458 21.8475 12.134L13.83 20.259C13.3256 20.7471 12.5077 20.7471 12.0033 20.259L8.12832 16.509C7.62389 16.0208 7.62389 15.2294 8.12832 14.7412C8.63275 14.2531 9.45059 14.2531 9.95501 14.7412L12.9167 17.6073L20.0208 10.3662C20.5253 9.87806 21.3431 9.87806 21.8475 10.3662Z' fill='white'/%3E%3C/svg%3E");
    
    background-repeat: no-repeat;
    background-position: center;
}

.forgot-password {
    color: #D97706;
    font-size: 20px;
    font-weight: 500;
}

/* Hesap Yok Linki */
.no-account {
  color: #5C6B80;
    font-size: 20px;
    font-weight: 400; /* Figma'ya göre 500'den 400'e güncellendi */
    
    font-family: 'Roboto', sans-serif;
    word-wrap: break-word;
    margin-top: 20px;
    text-align: center;
}

.no-account a {
color: #D97706;
    font-size: 20px;
    font-weight: 700;
    text-decoration: underline;
}

/* --- 4. Alt Linkler (Footer) --- */
.bottom-links {
    padding: 10px 20px 20px 20px; 
    width: 100%;
    
    /* Figma'dan gelen stil: */
    text-align: center;
}

.bottom-links a {
  color: rgba(0, 0, 0, 0.70);
    font-size: 16px;
    font-family: Roboto;
    font-weight: 600;
    letter-spacing: 3.84px; /* ÖNEMLİ: Geniş boşluk buradan geliyor */
    word-wrap: break-word;
    
    /* DÜZELTME: Margin'i kaldırıyoruz */
    margin: 0 25px;
}

/* --- Responsive Media Queries --- */
@media (max-width: 768px) {
    .signin-box {
        padding: 30px 20px;
        min-height: auto;
    }

    .title {
        font-size: 28px;
    }

    .input-group input {
        height: 55px;
        font-size: 14px;
    }

    .signin-button {
        height: 60px;
        font-size: 20px;
    }

    .options {
        flex-direction: column;
        gap: 15px;
    }

    .remember-me label,
    .forgot-password,
    .no-account,
    .no-account a {
        font-size: 16px;
    }

    .bottom-links a {
        display: block;
        margin: 10px 0;
        letter-spacing: 1px;
    }
}
</style>
