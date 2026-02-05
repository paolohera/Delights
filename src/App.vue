<template>
  <div id="app">
    <!-- Main Layout (for public pages) -->
    <template v-if="!isAdminRoute">
      <!-- Navigation -->
      <NavBar />
      
      <!-- Main Content -->
      <main class="app-main">
        <router-view />
      </main>
      
      <!-- Footer -->
      <AppFooter />
    </template>
    
    <!-- Admin Layout (for admin pages) -->
    <template v-else>
      <router-view />
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import NavBar from './components/NavBar.vue';
import AppFooter from './components/AppFooter.vue';

const route = useRoute();

// Check if current route is an admin route
const isAdminRoute = computed(() => {
  return route.path.startsWith('/admin/');
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