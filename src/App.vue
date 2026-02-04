<template>
  <div id="app">
    <!-- Navigation -->
    <NavBar v-if="showNav" />
    
    <!-- Main Content -->
    <main class="app-main">
      <router-view />
    </main>
    
    <!-- Footer -->
    <footer v-if="showFooter" class="app-footer">
      <div class="footer-content">
        <div class="footer-section">
          <h3 class="footer-title">Delights</h3>
          <p class="footer-description">
            Your one-stop shop for amazing products. Quality, convenience, and great prices.
          </p>
        </div>
        
        <div class="footer-section">
          <h4 class="footer-heading">Quick Links</h4>
          <router-link to="/" class="footer-link">Home</router-link>
          <router-link to="/admin/login" class="footer-link">Admin Login</router-link>
        </div>
        
        <div class="footer-section">
          <h4 class="footer-heading">Contact</h4>
          <p class="footer-text">Email: support@delights.com</p>
          <p class="footer-text">Phone: (123) 456-7890</p>
        </div>
      </div>
      
      <div class="footer-bottom">
        <p>&copy; {{ currentYear }} Delights. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import NavBar from './components/NavBar.vue';

const route = useRoute();
const currentYear = new Date().getFullYear();

// Hide nav/footer on login page
const showNav = computed(() => {
  return route.path !== '/admin/login';
});

const showFooter = computed(() => {
  return route.path !== '/admin/login' && route.path !== '/admin/dashboard';
});
</script>

<style>
/* Global Styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  line-height: 1.6;
  color: #333;
  background-color: #f8fafc;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-main {
  flex: 1;
}

/* Footer */
.app-footer {
  background: linear-gradient(135deg, #2d3748 0%, #1a202c 100%);
  color: white;
  padding: 40px 20px 20px;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 40px;
  margin-bottom: 40px;
}

.footer-section {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.footer-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #667eea;
  margin: 0;
}

.footer-description {
  color: #a0aec0;
  line-height: 1.6;
  margin: 0;
}

.footer-heading {
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0 0 15px 0;
  color: #e2e8f0;
}

.footer-link {
  color: #a0aec0;
  text-decoration: none;
  transition: color 0.3s;
}

.footer-link:hover {
  color: #667eea;
}

.footer-text {
  color: #a0aec0;
  margin: 5px 0;
}

.footer-bottom {
  max-width: 1200px;
  margin: 0 auto;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  text-align: center;
  color: #a0aec0;
  font-size: 0.9rem;
}

/* Router Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Scrollbar */
::-webkit-scrollbar {
  width: 10px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #667eea;
  border-radius: 5px;
}

::-webkit-scrollbar-thumb:hover {
  background: #764ba2;
}
</style>