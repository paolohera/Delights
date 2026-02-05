<template>
  <div class="product-management">
    <!-- Stats Cards -->
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <!-- Total Products -->
      <div class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Total Products</p>
            <h3 class="mt-2 text-3xl font-bold text-gray-900">{{ products.length }}</h3>
          </div>
          <div class="rounded-lg bg-[#6f1d1b]/10 p-3">
            <svg class="h-6 w-6 text-[#6f1d1b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
            </svg>
          </div>
        </div>
        <div v-if="recentProducts > 0" class="mt-4 inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
          <svg class="mr-1 h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"/>
          </svg>
          +{{ recentProducts }} this week
        </div>
      </div>

      <!-- Best Sellers -->
      <div class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Best Sellers</p>
            <h3 class="mt-2 text-3xl font-bold text-gray-900">{{ bestSellerCount }}/3</h3>
          </div>
          <div class="rounded-lg bg-[#bb9457]/10 p-3">
            <svg class="h-6 w-6 text-[#bb9457]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>
        </div>
        <div class="mt-4 text-sm text-gray-600">
          {{ 3 - bestSellerCount }} slots available
        </div>
      </div>

      <!-- Inventory Value -->
      <div class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:col-span-2 lg:col-span-1">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Inventory Value</p>
            <h3 class="mt-2 text-3xl font-bold text-gray-900">₱{{ totalValue }}</h3>
          </div>
          <div class="rounded-lg bg-[#99582a]/10 p-3">
            <svg class="h-6 w-6 text-[#99582a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
        </div>
        <div class="mt-4 text-sm text-gray-600">
          Average: ₱{{ averageValue }} per product
        </div>
      </div>
    </div>

    <!-- Products Table Section -->
    <div class="mt-8 rounded-xl border border-gray-200 bg-white shadow-sm">
      <!-- Table Header -->
      <div class="border-b border-gray-200 px-6 py-4">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 class="text-lg font-semibold text-gray-900">Product Management</h2>
            <p class="text-sm text-gray-600">Manage your product catalog</p>
          </div>
          <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div class="relative">
              <input
                type="text"
                :value="searchQuery"
                @input="$emit('update:searchQuery', $event.target.value)"
                placeholder="Search products..."
                class="w-full rounded-lg border border-gray-300 bg-gray-50 py-2 pl-10 pr-4 text-sm focus:border-[#6f1d1b] focus:outline-none focus:ring-1 focus:ring-[#6f1d1b] sm:w-64"
              />
              <svg class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </div>
            <button
              @click="$emit('open-add-modal')"
              class="flex items-center justify-center gap-2 rounded-lg bg-[#6f1d1b] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#7a241f]"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
              Add Product
            </button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="py-12">
        <div class="flex flex-col items-center justify-center gap-3">
          <div class="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-[#6f1d1b]"></div>
          <p class="text-sm text-gray-600">Loading products...</p>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredProducts.length === 0" class="py-12">
        <div class="text-center">
          <div class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
            <svg class="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
            </svg>
          </div>
          <h3 class="mb-2 text-lg font-medium text-gray-900">No products found</h3>
          <p class="mb-6 text-sm text-gray-600">
            {{ searchQuery ? 'No products match your search' : 'Get started by adding your first product' }}
          </p>
          <button
            @click="$emit('open-add-modal')"
            class="inline-flex items-center gap-2 rounded-lg bg-[#6f1d1b] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#7a241f]"
          >
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            Add Product
          </button>
        </div>
      </div>

      <!-- Products Table -->
      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Product</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Price</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 bg-white">
            <tr v-for="product in filteredProducts" :key="product.id" class="hover:bg-gray-50">
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    <img
                      v-if="product.image_url"
                      :src="product.image_url"
                      :alt="product.name"
                      class="h-full w-full object-cover"
                      @error="handleTableImageError"
                    />
                    <div v-else class="flex h-full w-full items-center justify-center text-xs text-gray-400">
                      No Image
                    </div>
                  </div>
                  <div class="min-w-0">
                    <h4 class="truncate font-medium text-gray-900">{{ product.name }}</h4>
                    <p v-if="product.description" class="truncate text-sm text-gray-600">
                      {{ truncateDescription(product.description, 40) }}
                    </p>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <span class="font-medium text-gray-900">₱{{ parseFloat(product.price).toFixed(2) }}</span>
              </td>
              <td class="px-6 py-4">
                <span
                  :class="[
                    'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                    product.is_best_seller
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  ]"
                >
                  {{ product.is_best_seller ? 'Best Seller' : 'Regular' }}
                </span>
              </td>
              <td class="px-6 py-4">
                <div class="flex flex-wrap gap-2">
                  <button
                    @click="$emit('toggle-best-seller', product)"
                    :disabled="!product.image_url || (bestSellerCount >= 3 && !product.is_best_seller)"
                    :class="[
                      'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                      product.is_best_seller
                        ? 'border border-yellow-300 bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
                        : 'border border-gray-300 bg-gray-50 text-gray-700 hover:bg-gray-100',
                      'disabled:opacity-50 disabled:cursor-not-allowed'
                    ]"
                  >
                    {{ product.is_best_seller ? 'Remove' : 'Best Seller' }}
                  </button>
                  <button
                    @click="$emit('edit-product', product)"
                    class="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    Edit
                  </button>
                  <button
                    @click="$emit('delete-product', product.id)"
                    :disabled="deletingProductId === product.id"
                    class="rounded-lg border border-red-300 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {{ deletingProductId === product.id ? 'Deleting...' : 'Delete' }}
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Table Footer -->
      <div v-if="filteredProducts.length > 0" class="border-t border-gray-200 px-6 py-4">
        <div class="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <p class="text-sm text-gray-700">
            Showing <span class="font-medium">{{ filteredProducts.length }}</span> of
            <span class="font-medium">{{ products.length }}</span> products
          </p>
          <p class="text-sm text-gray-700">
            <span class="font-medium">{{ bestSellerCount }}</span> best sellers
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  products: {
    type: Array,
    required: true,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  deletingProductId: {
    type: String,
    default: null
  },
  searchQuery: {
    type: String,
    default: ''
  }
});

const emit = defineEmits([
  'open-add-modal',
  'edit-product',
  'toggle-best-seller',
  'delete-product',
  'update:searchQuery'  // Make sure this emit is declared
]);

// Computed properties
const bestSellerCount = computed(() => {
  return props.products.filter(p => p.is_best_seller).length;
});

const filteredProducts = computed(() => {
  if (!props.searchQuery.trim()) return props.products;
  
  const query = props.searchQuery.toLowerCase();
  return props.products.filter(product => 
    product.name.toLowerCase().includes(query) ||
    product.description?.toLowerCase().includes(query) ||
    product.price.toString().includes(query)
  );
});

const totalValue = computed(() => {
  return props.products.reduce((sum, product) => {
    return sum + (parseFloat(product.price) || 0);
  }, 0).toFixed(2);
});

const averageValue = computed(() => {
  if (props.products.length === 0) return '0.00';
  return (parseFloat(totalValue.value) / props.products.length).toFixed(2);
});

const recentProducts = computed(() => {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  return props.products.filter(product => {
    return new Date(product.created_at) >= oneWeekAgo;
  }).length;
});

// Methods
const truncateDescription = (text, length = 60) => {
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
};

const handleTableImageError = (event) => {
  event.target.style.display = 'none';
  const parent = event.target.parentElement;
  if (parent) {
    parent.innerHTML = '<div class="flex h-full w-full items-center justify-center text-xs font-bold text-[#99582a]/40">Image Error</div>';
  }
};
</script>