<template>
  <header class="sticky top-0 z-50 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 shadow-sm lg:hidden">
    <div class="flex items-center gap-3">
      <button @click="$emit('toggle-mobile-menu')" class="p-2 text-gray-600 hover:text-gray-900">
        <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
        </svg>
      </button>
      <div class="flex items-center gap-2">
        <div class="h-8 w-8 rounded-lg bg-gradient-to-br from-[#6f1d1b] to-[#99582a] p-1.5">
          <img :src="logoUrl" alt="Logo" class="h-full w-full object-contain" @error="$emit('image-error', $event)" />
        </div>
        <span class="font-bold text-gray-900">Admin</span>
      </div>
    </div>
    <button @click="$emit('go-home')" class="rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-200">
      Home
    </button>
  </header>
</template>

<script setup>
const props = defineProps({
  logoUrl: {
    type: String,
    default: '../assets/img/logo.png'
  }
});

const emit = defineEmits([
  'toggle-mobile-menu',
  'go-home',
  'image-error'
]);
</script>