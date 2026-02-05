<template>
  <div
    v-if="show"
    class="fixed inset-0 z-50 overflow-y-auto"
    aria-labelledby="modal-title"
    role="dialog"
    aria-modal="true"
  >
    <div class="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
      <!-- Background overlay -->
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="$emit('close')"></div>

      <!-- Modal panel -->
      <div class="relative inline-block w-full transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:max-w-lg sm:align-middle">
        <!-- Modal header -->
        <div class="border-b border-gray-200 bg-white px-6 py-4">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-medium text-gray-900">
              {{ editingProduct ? 'Edit Product' : 'Add New Product' }}
            </h3>
            <button
              @click="$emit('close')"
              class="rounded-md text-gray-400 hover:text-gray-500"
              :disabled="saving"
            >
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Modal body -->
        <form @submit.prevent="$emit('save', formData, selectedFile)" class="px-6 py-4">
          <div class="space-y-6">
            <!-- Product Name -->
            <div>
              <label for="name" class="block text-sm font-medium text-gray-700">Product Name *</label>
              <input
                type="text"
                id="name"
                :value="formData.name"
                @input="$emit('update:formData', { ...formData, name: $event.target.value })"
                required
                class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#6f1d1b] focus:outline-none focus:ring-1 focus:ring-[#6f1d1b]"
                placeholder="Enter product name"
                :disabled="saving"
              />
            </div>

            <!-- Price and Description -->
            <div class="grid gap-6 sm:grid-cols-2">
              <div>
                <label for="price" class="block text-sm font-medium text-gray-700">Price (₱) *</label>
                <input
                  type="number"
                  id="price"
                  :value="formData.price"
                  @input="$emit('update:formData', { ...formData, price: parseFloat($event.target.value) || 0 })"
                  required
                  min="0"
                  step="0.01"
                  class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#6f1d1b] focus:outline-none focus:ring-1 focus:ring-[#6f1d1b]"
                  placeholder="0.00"
                  :disabled="saving"
                />
              </div>
              <div>
                <label for="description" class="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  id="description"
                  :value="formData.description"
                  @input="$emit('update:formData', { ...formData, description: $event.target.value })"
                  rows="3"
                  class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#6f1d1b] focus:outline-none focus:ring-1 focus:ring-[#6f1d1b]"
                  placeholder="Product description..."
                  :disabled="saving"
                ></textarea>
              </div>
            </div>

            <!-- Image Upload -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Product Image</label>
              
              <!-- Image Preview -->
              <div v-if="imagePreview" class="mb-4 overflow-hidden rounded-lg border border-gray-300">
                <img :src="imagePreview" alt="Preview" class="h-48 w-full object-cover" />
                <div class="border-t border-gray-200 bg-gray-50 p-3">
                  <button
                    type="button"
                    @click="$emit('remove-image')"
                    class="rounded-md border border-red-300 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-100"
                    :disabled="saving || uploading"
                  >
                    Remove Image
                  </button>
                </div>
              </div>

              <!-- Upload Area -->
              <div
                @click="!saving && !uploading && $emit('trigger-file-input')"
                @dragover.prevent
                @drop.prevent="!saving && !uploading && $emit('handle-drop', $event)"
                class="mt-1 flex justify-center rounded-lg border-2 border-dashed border-gray-300 px-6 pt-5 pb-6"
                :class="{ 
                  'border-[#6f1d1b] bg-[#6f1d1b]/5': selectedFile,
                  'opacity-50 cursor-not-allowed': saving || uploading
                }"
              >
                <div class="space-y-1 text-center">
                  <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                  <div class="flex text-sm text-gray-600">
                    <label :class="[
                      'relative cursor-pointer rounded-md font-medium text-[#6f1d1b] hover:text-[#7a241f]',
                      (saving || uploading) && 'cursor-not-allowed opacity-50'
                    ]">
                      <span>{{ selectedFile ? selectedFile.name : 'Upload a file' }}</span>
                      <input
                        ref="fileInput"
                        type="file"
                        accept="image/*"
                        @change="$emit('handle-file-select', $event)"
                        class="sr-only"
                        :disabled="saving || uploading"
                      />
                    </label>
                    <p class="pl-1">or drag and drop</p>
                  </div>
                  <p class="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                  
                  <!-- Upload Progress -->
                  <div v-if="uploadProgress > 0" class="pt-2">
                    <div class="h-2 overflow-hidden rounded-full bg-gray-200">
                      <div
                        class="h-full rounded-full bg-[#6f1d1b] transition-all duration-300"
                        :style="{ width: uploadProgress + '%' }"
                      ></div>
                    </div>
                    <p class="mt-1 text-xs text-gray-600">{{ uploadProgress }}% uploaded</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Modal actions -->
          <div class="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end sm:space-x-3">
            <button
              type="button"
              @click="$emit('close')"
              :disabled="saving || uploading"
              class="inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#6f1d1b] focus:ring-offset-2 disabled:opacity-50 sm:w-auto"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="saving || uploading"
              class="inline-flex w-full justify-center rounded-md border border-transparent bg-[#6f1d1b] px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-[#7a241f] focus:outline-none focus:ring-2 focus:ring-[#6f1d1b] focus:ring-offset-2 disabled:opacity-50 sm:w-auto"
            >
              <span v-if="saving" class="flex items-center gap-2">
                <div class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                Saving...
              </span>
              <span v-else-if="uploading" class="flex items-center gap-2">
                <div class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                Uploading...
              </span>
              <span v-else>
                {{ editingProduct ? 'Update Product' : 'Add Product' }}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  editingProduct: {
    type: Object,
    default: null
  },
  formData: {
    type: Object,
    required: true,
    default: () => ({
      name: '',
      description: '',
      price: 0,
      image_url: ''
    })
  },
  selectedFile: {
    type: File,
    default: null
  },
  uploadProgress: {
    type: Number,
    default: 0
  },
  saving: {
    type: Boolean,
    default: false
  },
  uploading: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits([
  'close',
  'save',
  'update:formData',
  'update:selectedFile',
  'remove-image',
  'trigger-file-input',
  'handle-file-select',
  'handle-drop'
]);

const imagePreview = computed(() => {
  if (props.selectedFile) return URL.createObjectURL(props.selectedFile);
  if (props.editingProduct?.image_url) return props.editingProduct.image_url;
  return null;
});
</script>