<template>
  <nav class="navbar">
    <div class="nav-container">
      <!-- Left Navigation Links -->
      <div class="nav-links nav-links-left">
        <router-link to="/" class="nav-link" exact-active-class="active">
          <span class="nav-text">Home</span>
        </router-link>
        
        <router-link 
          to="/products" 
          class="nav-link"
          active-class="active"
        >
          <span class="nav-text">Products</span>
        </router-link>
      </div>
      
      <!-- Center Logo -->
      <div class="nav-logo">
        <div class="logo-link" @click="handleLogoClick">
          <img 
            src="../assets/img/logo.png" 
            alt="Delights Logo" 
            class="logo-image"
            @error="handleImageError"
          />
        </div>
        
        <!-- Secret Admin Panel -->
        <transition name="fade">
          <div v-if="showAdminPanel" class="admin-panel">
            <div class="admin-panel-content">
              <button @click="closeAdminPanel" class="close-panel-btn">✕</button>
              
              <div v-if="!user" class="admin-panel-body">
                <h3>Admin Access</h3>
                <button @click="openLoginModal" class="admin-panel-link">
                  Login to Dashboard
                </button>
              </div>
              
              <div v-else class="admin-panel-body">
                <h3>Admin Menu</h3>
                <router-link 
                  to="/admin/dashboard" 
                  class="admin-panel-link"
                  @click="closeAdminPanel"
                >
                  Dashboard
                </router-link>
                <button @click="handleLogout" class="admin-panel-logout">
                  Logout
                </button>
              </div>
            </div>
          </div>
        </transition>
      </div>
      
      <!-- Right Navigation Links -->
      <div class="nav-links nav-links-right">
        <router-link 
          to="/about" 
          class="nav-link"
          active-class="active"
        >
          <span class="nav-text">About</span>
        </router-link>
        
        <router-link 
          to="/contact" 
          class="nav-link"
          active-class="active"
        >
          <span class="nav-text">Contact</span>
        </router-link>
      </div>
      
      <!-- Mobile Menu Button -->
      <button class="mobile-menu-btn" @click="toggleMobileMenu">
        <span v-if="!isMobileMenuOpen">☰</span>
        <span v-else>✕</span>
      </button>
    </div>
    
    <!-- Mobile Menu -->
    <transition name="slide">
      <div v-if="isMobileMenuOpen" class="mobile-menu">
        <router-link 
          to="/" 
          class="mobile-link"
          @click="closeMobileMenu"
          exact-active-class="active"
        >
          Home
        </router-link>
        
        <router-link 
          to="/products" 
          class="mobile-link"
          @click="closeMobileMenu"
          active-class="active"
        >
          Products
        </router-link>
        
        <router-link 
          to="/about" 
          class="mobile-link"
          @click="closeMobileMenu"
          active-class="active"
        >
          About
        </router-link>
        
        <router-link 
          to="/contact" 
          class="mobile-link"
          @click="closeMobileMenu"
          active-class="active"
        >
          Contact
        </router-link>
        
        <div class="mobile-divider"></div>
        
        <!-- Mobile Admin Access -->
        <div class="mobile-admin-section">
          <p class="mobile-admin-label">Admin Access</p>
          
          <button 
            v-if="!user"
            @click="openLoginModalMobile" 
            class="mobile-link mobile-admin-link"
          >
            Admin Login
          </button>
          
          <template v-else>
            <router-link 
              to="/admin/dashboard" 
              class="mobile-link mobile-admin-link"
              @click="closeMobileMenu"
            >
              Dashboard
            </router-link>
            
            <button 
              @click="handleLogoutMobile" 
              class="mobile-logout-btn"
            >
              Logout
            </button>
          </template>
        </div>
      </div>
    </transition>
    
    <!-- Login Modal -->
    <teleport to="body">
      <transition name="modal">
        <div v-if="showLoginModal" class="modal-overlay" @click="closeLoginModal">
          <div class="modal-content" @click.stop>
            <button class="modal-close" @click="closeLoginModal">✕</button>
            
            <div class="modal-body">
              <h2 class="modal-title">Admin Login</h2>
              
              <!-- Show message if redirected from protected route -->
              <p v-if="loginMessage" class="login-message">
                {{ loginMessage }}
              </p>
              
              <form @submit.prevent="handleLogin" class="login-form">
                <div class="form-group">
                  <label for="modal-email">Email</label>
                  <input 
                    type="email" 
                    id="modal-email" 
                    v-model="loginEmail" 
                    placeholder="admin@example.com"
                    required
                    autofocus
                  />
                </div>
                <div class="form-group">
                  <label for="modal-password">Password</label>
                  <input 
                    type="password" 
                    id="modal-password" 
                    v-model="loginPassword" 
                    placeholder="Enter password"
                    required
                  />
                </div>
                <button type="submit" :disabled="loginLoading" class="login-btn">
                  {{ loginLoading ? 'Logging in...' : 'Login to Dashboard' }}
                </button>
                <p v-if="loginError" class="error-message">{{ loginError }}</p>
              </form>
            </div>
          </div>
        </div>
      </transition>
    </teleport>
  </nav>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { supabase } from '../supabase.js';
import { useRouter } from 'vue-router';

const router = useRouter();
const user = ref(null);
const isMobileMenuOpen = ref(false);
const showAdminPanel = ref(false);
const showLoginModal = ref(false);
const imageError = ref(false);
const loginEmail = ref('');
const loginPassword = ref('');
const loginLoading = ref(false);
const loginError = ref('');
const pendingRedirect = ref(null);
const loginMessage = ref('');

// Listen for show-login-modal event
onMounted(async () => {
  const { data: { session } } = await supabase.auth.getSession();
  user.value = session?.user || null;
  
  // Listen for auth changes
  supabase.auth.onAuthStateChange((event, session) => {
    user.value = session?.user || null;
    
    // If user just logged in and there's a pending redirect
    if (event === 'SIGNED_IN' && pendingRedirect.value) {
      router.push(pendingRedirect.value);
      pendingRedirect.value = null;
    }
  });
  
  // Close admin panel when clicking outside
  document.addEventListener('click', handleClickOutside);
  // Close modal with Escape key
  document.addEventListener('keydown', handleEscapeKey);
  
  // Listen for show-login-modal event
  window.addEventListener('show-login-modal', handleShowLoginModal);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
  document.removeEventListener('keydown', handleEscapeKey);
  window.removeEventListener('show-login-modal', handleShowLoginModal);
});

// Handle show-login-modal event
const handleShowLoginModal = (event) => {
  pendingRedirect.value = event.detail.redirectPath;
  loginMessage.value = event.detail.message || '';
  openLoginModal();
};

// Handle Escape key to close modal
const handleEscapeKey = (event) => {
  if (event.key === 'Escape' && showLoginModal.value) {
    closeLoginModal();
  }
};

// Handle logo click to toggle admin panel
const handleLogoClick = (event) => {
  event.stopPropagation();
  showAdminPanel.value = !showAdminPanel.value;
};

// Close admin panel when clicking outside
const handleClickOutside = (event) => {
  const adminPanel = document.querySelector('.admin-panel');
  const logoLink = document.querySelector('.logo-link');
  
  if (showAdminPanel.value && 
      adminPanel && 
      !adminPanel.contains(event.target) && 
      logoLink &&
      !logoLink.contains(event.target)) {
    showAdminPanel.value = false;
  }
};

// Close admin panel
const closeAdminPanel = () => {
  showAdminPanel.value = false;
};

// Open login modal
const openLoginModal = () => {
  closeAdminPanel();
  showLoginModal.value = true;
};

const openLoginModalMobile = () => {
  closeMobileMenu();
  showLoginModal.value = true;
};

// Close login modal
const closeLoginModal = () => {
  showLoginModal.value = false;
  loginEmail.value = '';
  loginPassword.value = '';
  loginError.value = '';
  loginMessage.value = '';
  loginLoading.value = false;
  pendingRedirect.value = null;
};

// Handle image error
const handleImageError = () => {
  imageError.value = true;
};

// Toggle mobile menu
const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
};

// Close mobile menu
const closeMobileMenu = () => {
  isMobileMenuOpen.value = false;
};

// Login function
const handleLogin = async () => {
  try {
    loginLoading.value = true;
    loginError.value = '';
    
    const { data, error: loginErrorRes } = await supabase.auth.signInWithPassword({
      email: loginEmail.value,
      password: loginPassword.value
    });
    
    if (loginErrorRes) throw loginErrorRes;
    
    // Close modal
    closeLoginModal();
    
    // If there was a pending redirect, the auth state change handler will handle it
    // Otherwise, redirect to dashboard
    if (!pendingRedirect.value) {
      router.push('/admin/dashboard');
    }
    
  } catch (err) {
    loginError.value = err.message || 'Login failed';
  } finally {
    loginLoading.value = false;
  }
};

// Logout function
const handleLogout = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    closeAdminPanel();
    router.push('/');
  } catch (err) {
    console.error('Error logging out:', err);
    alert('Logout failed: ' + err.message);
  }
};

// Logout from mobile menu
const handleLogoutMobile = async () => {
  await handleLogout();
  closeMobileMenu();
};
</script>

<style scoped>
@import url('https://fonts.cdnfonts.com/css/varuna');

.navbar {
  background: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);    
  position: sticky;
  top: 0;
  z-index: 1000;

}

.nav-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 40px;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  height: 100px;
  gap: 40px;
}

/* Navigation Links */
.nav-links {
  display: flex;
  align-items: center;
  gap: 15px;
  font-family: 'VARUNA', sans-serif;
}

.nav-links-left {
  justify-content: flex-end;
}

.nav-links-right {
  justify-content: flex-start;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  color: #333;
  padding: 10px 18px;
margin-top: -10px;
  transition: all 0.3s ease;
  font-weight: 500;
  font-size: 0.95rem;
  position: relative;
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: 8px;
  left: 18px;
  width: 0;
  height: 2px;
  background: #8B4513;
  transition: width 0.3s ease;
}

.nav-link:hover::after {
  width: calc(100% - 36px);
}

.nav-link:hover {
  color: #8B4513;
}

.nav-link.active {
  color: #8B4513;
}

.nav-link.active::after {
  width: calc(100% - 36px);
}

.nav-icon {
  font-size: 1.1rem;
}

/* Center Logo */
.nav-logo {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

.logo-link {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 8px;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.logo-link:active {
  transform: scale(0.98);
}

.logo-image {
  height: 110px;
  width: auto;
  max-width: 150px;
  object-fit: contain;
  display: block;
  transition: none;
  margin-top: -10px;
}

.logo-fallback {
  font-size: 3rem;
  display: block;
}

/* Secret Admin Panel */
.admin-panel {
  position: absolute;
  top: calc(100% + 15px);
  left: 50%;
  transform: translateX(-50%);
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  border: 1px solid #e0e0e0;
  min-width: 250px;
  overflow: hidden;
  z-index: 1001;
}

.admin-panel::before {
  content: '';
  position: absolute;
  top: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-bottom: 8px solid white;
}

.admin-panel-content {
  position: relative;
}

.close-panel-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #666;
  cursor: pointer;
  padding: 5px;
  line-height: 1;
  transition: all 0.2s;
  z-index: 10;
}

.close-panel-btn:hover {
  color: #333;
  transform: rotate(90deg);
}

.admin-panel-body {
  padding: 30px 25px 20px;
}

.admin-panel-body h3 {
  margin: 0 0 15px 0;
  color: #333;
  font-size: 1.1rem;
  text-align: center;
}

.admin-panel-link {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 12px 15px;
  background: #8B4513;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.3s;
  font-weight: 500;
  margin-bottom: 10px;
  border: none;
  cursor: pointer;
  width: 100%;
  font-size: 0.95rem;
}

.admin-panel-link:hover {
  background: #6d3410;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(139, 69, 19, 0.3);
}

.admin-panel-logout {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  width: 100%;
  padding: 12px 15px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s;
}

.admin-panel-logout:hover {
  background: #c82333;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);
}

.panel-icon {
  font-size: 1.2rem;
}

/* Transitions */
.fade-enter-active, .fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-10px);
}

.slide-enter-active, .slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from, .slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Mobile Menu Button */
.mobile-menu-btn {
  display: none;
  background: transparent;
  border: 2px solid #333;
  color: #333;
  font-size: 1.8rem;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 8px;
  transition: all 0.3s;
}

.mobile-menu-btn:hover {
  background: #f5f5f5;
  border-color: #8B4513;
  color: #8B4513;
}

/* Mobile Menu */
.mobile-menu {
  flex-direction: column;
  background: white;
  padding: 20px;
  border-top: 1px solid #e0e0e0;
}

.mobile-link {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  color: #333;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 8px;
  transition: all 0.3s;
  font-weight: 500;
  position: relative;
}

.mobile-link::after {
  content: '';
  position: absolute;
  bottom: 10px;
  left: 15px;
  width: 0;
  height: 2px;
  background: #8B4513;
  transition: width 0.3s ease;
}

.mobile-link:hover::after,
.mobile-link.active::after {
  width: calc(100% - 30px);
}

.mobile-link:hover {
  color: #8B4513;
}

.mobile-link.active {
  color: #8B4513;
}

.mobile-icon {
  font-size: 1.2rem;
}

.mobile-divider {
  height: 1px;
  background: #e0e0e0;
  margin: 15px 0;
}

.mobile-admin-section {
  margin-top: 10px;
}

.mobile-admin-label {
  color: #666;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 0 0 10px 15px;
  font-weight: 600;
}

.mobile-admin-link {
  background: #f8f8f8;
  border: 1px solid #e0e0e0;
}

.mobile-logout-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  width: 100%;
  background: #dc3545;
  color: white;
  border: none;
  padding: 15px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  margin-top: 8px;
  transition: all 0.3s;
}

.mobile-logout-btn:hover {
  background: #c82333;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-content {
  background: white;
  border-radius: 16px;
  padding: 30px;
  width: 90%;
  max-width: 450px;
  position: relative;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-close {
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #666;
  cursor: pointer;
  padding: 5px;
  line-height: 1;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.modal-close:hover {
  background: #f5f5f5;
  color: #333;
  transform: rotate(90deg);
}

.modal-title {
  text-align: center;
  color: #333;
  margin-bottom: 25px;
  font-size: 1.8rem;
}

.login-message {
  text-align: center;
  color: #8B4513;
  background: #fdf6e3;
  padding: 10px 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 0.95rem;
  border-left: 4px solid #8B4513;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 600;
  color: #555;
  font-size: 0.95rem;
}

.form-group input {
  padding: 14px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.3s;
  width: 100%;
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: #8B4513;
  box-shadow: 0 0 0 3px rgba(139, 69, 19, 0.1);
}

.login-btn {
  padding: 16px;
  background: linear-gradient(135deg, #8B4513 0%, #6d3410 100%);
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.3s;
  margin-top: 10px;
}

.login-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #6d3410 0%, #8B4513 100%);
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(139, 69, 19, 0.3);
}

.login-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.error-message {
  color: #dc3545;
  text-align: center;
  margin-top: 15px;
  font-size: 0.9rem;
  padding: 10px;
  background: #f8d7da;
  border-radius: 6px;
  border: 1px solid #f5c6cb;
}

/* Modal transition */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

/* Responsive */
@media (max-width: 968px) {
  .nav-links {
    display: none;
  }
  
  .mobile-menu-btn {
    display: block;
    grid-column: 3;
    justify-self: end;
  }
  
  .nav-container {
    grid-template-columns: 1fr auto auto;
    padding: 0 20px;
    height: 70px;
    gap: 20px;
  }
  
  .nav-logo {
    grid-column: 2;
  }
  
  .logo-image {
    height: 50px;
  }
  
  .logo-fallback {
    font-size: 2.5rem;
  }
}

@media (max-width: 480px) {
  .nav-container {
    padding: 0 15px;
    height: 60px;
  }
  
  .logo-image {
    height: 40px;
  }
  
  .logo-fallback {
    font-size: 2rem;
  }
  
  .mobile-menu-btn {
    font-size: 1.5rem;
    padding: 6px 10px;
  }
  
  .modal-content {
    width: 95%;
    padding: 25px 20px;
    margin: 0 10px;
  }
  
  .modal-title {
    font-size: 1.5rem;
    margin-bottom: 20px;
  }
  
  .form-group input {
    padding: 12px 14px;
  }
  
  .login-btn {
    padding: 14px;
  }
}
</style>