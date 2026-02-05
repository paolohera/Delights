<template>
  <!-- Overlay for mobile sidebar -->
  <div
    v-if="mobileMenuOpen"
    @click="$emit('toggle-mobile-menu')"
    class="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
  ></div>

  <!-- Sidebar -->
  <aside 
    :class="[
      'fixed inset-y-0 left-0 z-40 w-64 transform border-r border-gray-200 bg-white shadow-xl transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 lg:shadow-none',
      mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
    ]"
  >
    <div class="flex h-full flex-col">
      <!-- Sidebar Header -->
      <div class="border-b border-gray-200 p-6">
        <div class="flex items-center gap-3">
          <div class="h-12 w-12">
            <img :src="logoUrl" alt="Logo" class="h-full w-full object-contain" @error="$emit('image-error', $event)" />
          </div>
          <div>
            <h2 class="font-bold text-gray-900">Admin Panel</h2>
           
          </div>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 space-y-1 overflow-y-auto p-4">
        <button
          @click="$emit('navigate', 'dashboard')"
          :class="[
            'flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition-colors',
            activeSection === 'dashboard'
              ? 'bg-gradient-to-r from-[#6f1d1b]/10 to-[#99582a]/10 text-[#6f1d1b] border border-[#6f1d1b]/20'
              : 'text-gray-700 hover:bg-gray-100'
          ]"
        >
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
          </svg>
          <span class="font-medium">Dashboard</span>
        </button>

        <button
          @click="$emit('navigate', 'products')"
          :class="[
            'flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition-colors',
            activeSection === 'products'
              ? 'bg-gradient-to-r from-[#6f1d1b]/10 to-[#99582a]/10 text-[#6f1d1b] border border-[#6f1d1b]/20'
              : 'text-gray-700 hover:bg-gray-100'
          ]"
        >
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
          </svg>
          <span class="font-medium">Products</span>
        </button>

        <!-- Tools Section -->
        <div class="pt-6">
          <h3 class="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">Tools</h3>
          <div class="space-y-1">
            <button
              @click="$emit('cleanup-images')"
              class="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-gray-700 transition-colors hover:bg-gray-100"
            >
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
              <span class="font-medium">Cleanup Images</span>
            </button>

            <button
              @click="$emit('export-csv')"
              class="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-gray-700 transition-colors hover:bg-gray-100"
            >
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              <span class="font-medium">Export CSV</span>
            </button>
          </div>
        </div>
      </nav>

      <!-- User Section -->
      <div class="border-t border-gray-200 p-4">
        <div class="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
          <div class="h-10 w-10 rounded-full bg-gradient-to-br from-[#6f1d1b] to-[#99582a] flex items-center justify-center">
            <span class="font-semibold text-white text-sm">{{ userEmail.charAt(0).toUpperCase() }}</span>
          </div>
          <div class="flex-1 min-w-0">
            <p class="truncate font-medium text-gray-900">{{ userEmail }}</p>
            <p class="text-sm text-gray-500">Administrator</p>
          </div>
        </div>

        <div class="mt-3 grid grid-cols-2 gap-2">
          <button
            @click="$emit('go-home')"
            class="flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
          >
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
            </svg>
            Visit Site
          </button>
          <button
            @click="$emit('logout')"
            class="flex items-center justify-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-100"
          >
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
            Logout
          </button>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup>
const props = defineProps({
  mobileMenuOpen: {
    type: Boolean,
    default: false
  },
  activeSection: {
    type: String,
    default: 'products'
  },
  userEmail: {
    type: String,
    default: 'Admin User'
  },
  logoUrl: {
    type: String,
    default: '/src/assets/img/logo.png'
  }
});

const emit = defineEmits([
  'toggle-mobile-menu',
  'navigate',
  'cleanup-images',
  'export-csv',
  'go-home',
  'logout',
  'image-error'
]);
</script>