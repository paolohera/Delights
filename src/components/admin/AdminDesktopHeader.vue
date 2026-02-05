<template>
  <header class="sticky top-0 z-40 hidden border-b border-gray-200 bg-white px-8 py-6 shadow-sm lg:block">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">{{ sectionTitle }}</h1>
        <p class="text-gray-600">{{ sectionSubtitle }}</p>
      </div>
      <div class="flex items-center gap-4">
        <button
          @click="$emit('cleanup-images')"
          class="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
        >
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
          </svg>
          Cleanup
        </button>
        <button
          @click="$emit('export-csv')"
          class="flex items-center gap-2 rounded-lg bg-[#6f1d1b] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#7a241f]"
        >
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
          Export CSV
        </button>
      </div>
    </div>
  </header>
</template>

<script setup>
const props = defineProps({
  sectionTitle: {
    type: String,
    default: 'Admin Dashboard'
  },
  sectionSubtitle: {
    type: String,
    default: 'Manage your store'
  }
});

const emit = defineEmits([
  'cleanup-images',
  'export-csv'
]);
</script>