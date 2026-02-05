import { createRouter, createWebHistory } from 'vue-router';
import { supabase } from '../supabase.js';
import Home from '../views/Home.vue';
import AdminDashboard from '../views/AdminDashboard.vue';
import AdminLayout from '../layouts/AdminLayout.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { title: 'Delights - Home' }
  },
  {
    path: '/admin',
    component: AdminLayout,
    children: [
      {
        path: 'dashboard',
        name: 'AdminDashboard',
        component: AdminDashboard,
        meta: { 
          title: 'Admin Dashboard',
          requiresAuth: true 
        }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0 };
    }
  }
});

// Authentication guard
router.beforeEach(async (to, from, next) => {
  // Set page title
  document.title = to.meta.title || 'Delights';
  
  // Get current session
  const { data: { session } } = await supabase.auth.getSession();
  
  // Check if route requires authentication
  if (to.meta.requiresAuth && !session) {
    // Store the route the user wanted to access
    const pendingRoute = to.fullPath;
    
    // Create a custom event to trigger the login modal
    const event = new CustomEvent('show-login-modal', { 
      detail: { 
        redirectPath: pendingRoute,
        message: 'Please login to access the admin dashboard'
      } 
    });
    window.dispatchEvent(event);
    
    // Redirect to home
    next('/');
  } else {
    // Continue navigation
    next();
  }
});

export default router;