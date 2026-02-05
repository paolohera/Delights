<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
    <!-- Mobile Header -->
    <AdminMobileHeader
      @toggle-mobile-menu="toggleMobileMenu"
      @go-home="goToHome"
      @image-error="handleImageError"
    />

    <div class="flex">
      <!-- Sidebar -->
      <AdminSidebar
        :mobile-menu-open="mobileMenuOpen"
        :active-section="activeSection"
        :user-email="userEmail"
        @toggle-mobile-menu="toggleMobileMenu"
        @navigate="navigateTo"
        @cleanup-images="cleanupOrphanedImages"
        @export-csv="exportProducts"
        @go-home="goToHome"
        @logout="handleLogout"
        @image-error="handleImageError"
      />

      <!-- Main Content -->
      <main class="flex-1 pb-8 lg:pb-0">
        <!-- Desktop Header -->
        <AdminDesktopHeader
          :section-title="getSectionTitle(activeSection)"
          :section-subtitle="getSectionSubtitle(activeSection)"
          @cleanup-images="cleanupOrphanedImages"
          @export-csv="exportProducts"
        />

        <!-- Status Messages -->
        <div v-if="deleteStatus" class="sticky top-0 z-20 px-4 pt-4 lg:px-8 lg:pt-6">
          <div
            :class="[
              'rounded-lg border px-4 py-3 shadow-sm',
              deleteStatusType === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                : deleteStatusType === 'error'
                ? 'border-red-200 bg-red-50 text-red-800'
                : 'border-blue-200 bg-blue-50 text-blue-800'
            ]"
          >
            <div class="flex items-center justify-between">
              <span class="font-medium">{{ deleteStatus }}</span>
              <button @click="deleteStatus = ''" class="text-gray-400 hover:text-gray-600">
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Content Area -->
        <div class="px-4 pt-6 lg:px-8">
          <!-- Use ProductManagement component -->
          <ProductManagement
            :products="products"
            :loading="loading"
            :deleting-product-id="deletingProductId"
            v-model:search-query="searchQuery"
            @open-add-modal="openAddModal"
            @edit-product="editProduct"
            @toggle-best-seller="toggleBestSeller"
            @delete-product="deleteProduct"
          />
        </div>
      </main>
    </div>

    <!-- Use ProductModal component -->
    <ProductModal
      :show="showModal"
      :editing-product="editingProduct"
      :form-data="formData"
      :selected-file="selectedFile"
      :upload-progress="uploadProgress"
      :saving="saving"
      :uploading="uploading"
      @close="closeModal"
      @save="saveProductHandler"
      @update:form-data="updateFormData"
      @update:selected-file="updateSelectedFile"
      @remove-image="removeImage"
      @trigger-file-input="triggerFileInput"
      @handle-file-select="handleFileSelect"
      @handle-drop="handleDrop"
    />
  </div>
</template>

<style scoped>
/* Keep only custom animations if needed */
@keyframes slide-in-from-top {
  from {
    opacity: 0;
    transform: translateY(-1rem);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-in {
  animation-fill-mode: both;
}

.slide-in-from-top {
  animation: slide-in-from-top 0.5s ease-out;
}
</style>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { supabase } from '../supabase.js';
import { deleteImageFromStorage } from '../utils/storage.js';
import { useRouter } from 'vue-router';
import AdminMobileHeader from '../components/AdminMobileHeader.vue';
import AdminSidebar from '../components/AdminSidebar.vue';
import AdminDesktopHeader from '../components/AdminDesktopHeader.vue';
import ProductManagement from '../components/ProductManagement.vue';
import ProductModal from '../components/ProductModal.vue';

const router = useRouter();

// State
const products = ref([]);
const loading = ref(true);
const saving = ref(false);
const uploading = ref(false);
const uploadProgress = ref(0);
const showModal = ref(false);
const editingProduct = ref(null);
const selectedFile = ref(null);
const deletingProductId = ref(null);
const deleteStatus = ref('');
const deleteStatusType = ref('');
const searchQuery = ref('');
const activeSection = ref('products');
const mobileMenuOpen = ref(false);
const user = ref(null);

// Form data
const formData = ref({
  name: '',
  description: '',
  price: 0,
  image_url: ''
});

// Computed properties
const bestSellerCount = computed(() => {
  return products.value.filter(p => p.is_best_seller).length;
});

const userEmail = computed(() => {
  return user.value?.email || 'Admin User';
});

// Methods
const fetchProducts = async () => {
  try {
    loading.value = true;
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    products.value = data || [];
  } catch (err) {
    console.error('Error fetching products:', err);
    showStatus('Error loading products: ' + err.message, 'error');
  } finally {
    loading.value = false;
  }
};

const openAddModal = () => {
  resetForm();
  showModal.value = true;
};

const editProduct = (product) => {
  editingProduct.value = product;
  formData.value = {
    name: product.name,
    description: product.description,
    price: parseFloat(product.price),
    image_url: product.image_url
  };
  selectedFile.value = null;
  showModal.value = true;
};

const resetForm = () => {
  editingProduct.value = null;
  formData.value = {
    name: '',
    description: '',
    price: 0,
    image_url: ''
  };
  selectedFile.value = null;
  uploadProgress.value = 0;
};

const closeModal = () => {
  showModal.value = false;
  setTimeout(resetForm, 300);
};

const handleFileSelect = (event) => {
  const file = event.target.files[0];
  if (!file) return;
  
  if (!file.type.startsWith('image/')) {
    alert('Please select an image file (JPG, PNG, GIF, etc.)');
    event.target.value = '';
    return;
  }
  
  if (file.size > 5 * 1024 * 1024) {
    alert('File size should be less than 5MB');
    event.target.value = '';
    return;
  }
  
  selectedFile.value = file;
  uploadProgress.value = 0;
};

const handleDrop = (event) => {
  const file = event.dataTransfer.files[0];
  if (file && file.type.startsWith('image/')) {
    selectedFile.value = file;
  }
};

const triggerFileInput = () => {
  // Create a temporary input element
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.onchange = handleFileSelect;
  input.click();
};

const removeImage = () => {
  selectedFile.value = null;
  if (editingProduct.value) {
    formData.value.image_url = '';
  }
};

const uploadImage = async () => {
  if (!selectedFile.value) return null;
  
  try {
    uploading.value = true;
    uploadProgress.value = 0;
    
    // Simulate upload progress (replace with actual progress tracking if needed)
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 100));
      uploadProgress.value = i;
    }
    
    const fileExt = selectedFile.value.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `products/${fileName}`;
    
    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(filePath, selectedFile.value, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);
    
    uploadProgress.value = 100;
    return publicUrl;
    
  } catch (err) {
    console.error('Error uploading image:', err);
    showStatus('Failed to upload image: ' + err.message, 'error');
    return null;
  } finally {
    uploading.value = false;
    setTimeout(() => {
      uploadProgress.value = 0;
    }, 500);
  }
};

const saveProductHandler = async (formData, selectedFile) => {
  try {
    saving.value = true;
    
    if (!formData.name.trim()) {
      showStatus('Product name is required', 'error');
      return;
    }
    
    if (!formData.price || formData.price <= 0) {
      showStatus('Please enter a valid price', 'error');
      return;
    }
    
    let imageUrl = formData.image_url;
    
    if (selectedFile) {
      const uploadedUrl = await uploadImage();
      if (uploadedUrl) {
        imageUrl = uploadedUrl;
      } else {
        return;
      }
    }
    
    const productData = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      price: parseFloat(formData.price),
      image_url: imageUrl,
      is_best_seller: editingProduct.value ? editingProduct.value.is_best_seller || false : false
    };
    
    if (editingProduct.value) {
      const { error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', editingProduct.value.id);
      
      if (error) throw error;
      showStatus('Product updated successfully!', 'success');
    } else {
      const { error } = await supabase
        .from('products')
        .insert([productData]);
      
      if (error) throw error;
      showStatus('Product added successfully!', 'success');
    }
    
    closeModal();
    fetchProducts();
    
  } catch (err) {
    console.error('Error saving product:', err);
    showStatus('Failed to save product: ' + err.message, 'error');
  } finally {
    saving.value = false;
  }
};

const updateFormData = (newFormData) => {
  formData.value = { ...newFormData };
};

const updateSelectedFile = (file) => {
  selectedFile.value = file;
};

const toggleBestSeller = async (product) => {
  try {
    if (!product.is_best_seller && bestSellerCount.value >= 3) {
      showStatus('Maximum 3 best sellers allowed. Remove one first.', 'error');
      return;
    }
    
    if (!product.is_best_seller && !product.image_url) {
      showStatus('Product must have an image to be a best seller', 'error');
      return;
    }
    
    const { error } = await supabase
      .from('products')
      .update({ is_best_seller: !product.is_best_seller })
      .eq('id', product.id);
    
    if (error) throw error;
    
    product.is_best_seller = !product.is_best_seller;
    
    showStatus(
      product.is_best_seller 
        ? 'Product added to best sellers carousel!' 
        : 'Product removed from best sellers carousel!',
      'success'
    );
    
  } catch (err) {
    console.error('Error toggling best seller:', err);
    showStatus('Error: ' + err.message, 'error');
  }
};

const deleteProduct = async (productId) => {
  if (!confirm('Are you sure you want to delete this product and its image?')) return;
  
  deletingProductId.value = productId;
  showStatus('Deleting product...', 'info');
  
  try {
    const { data: product, error: fetchError } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();
    
    if (fetchError) throw fetchError;
    
    if (product?.image_url) {
      showStatus('Deleting image from storage...', 'info');
      const storageResult = await deleteImageFromStorage(product.image_url);
      
      if (!storageResult.success) {
        console.warn('Image deletion warning:', storageResult.message);
      }
    }
    
    showStatus('Deleting from database...', 'info');
    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);
    
    if (deleteError) throw deleteError;
    
    showStatus('Product deleted successfully!', 'success');
    fetchProducts();
    
  } catch (err) {
    console.error('Error deleting product:', err);
    showStatus('Error: ' + err.message, 'error');
  } finally {
    setTimeout(() => {
      deleteStatus.value = '';
      deleteStatusType.value = '';
    }, 5000);
    deletingProductId.value = null;
  }
};

const cleanupOrphanedImages = async () => {
  if (!confirm('This will find and delete orphaned images (images in storage but not in database). Continue?')) return;
  
  try {
    deleteStatus.value = 'Searching for orphaned images...';
    deleteStatusType.value = 'info';
    
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('image_url');
    
    if (productsError) throw productsError;
    
    const validImageUrls = products
      .map(p => p.image_url)
      .filter(url => url && url.includes('product-images/'));
    
    const { data: storageFiles, error: storageError } = await supabase.storage
      .from('product-images')
      .list('products');
    
    if (storageError) throw storageError;
    
    const orphanedFiles = storageFiles.filter(storageFile => {
      const storageUrl = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/product-images/products/${storageFile.name}`;
      return !validImageUrls.some(url => url.includes(storageFile.name));
    });
    
    if (orphanedFiles.length === 0) {
      showStatus('No orphaned images found!', 'success');
      return;
    }
    
    const filePaths = orphanedFiles.map(file => `products/${file.name}`);
    
    deleteStatus.value = `Deleting ${orphanedFiles.length} orphaned image(s)...`;
    
    const { error: deleteError } = await supabase.storage
      .from('product-images')
      .remove(filePaths);
    
    if (deleteError) throw deleteError;
    
    showStatus(`Deleted ${orphanedFiles.length} orphaned image(s)!`, 'success');
    
  } catch (err) {
    console.error('Error cleaning up orphaned images:', err);
    showStatus('Cleanup failed: ' + err.message, 'error');
  }
};

const showStatus = (message, type = 'info') => {
  deleteStatus.value = message;
  deleteStatusType.value = type;
};

const handleLogout = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    router.push('/admin/login');
  } catch (err) {
    console.error('Error logging out:', err);
    alert('Logout failed: ' + err.message);
  }
};

const goToHome = () => {
  router.push('/');
};

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value;
};

const navigateTo = (section) => {
  activeSection.value = section;
  mobileMenuOpen.value = false;
};

const getSectionTitle = (section) => {
  const titles = {
    dashboard: 'Dashboard Overview',
    products: 'Product Management'
  };
  return titles[section] || 'Admin Dashboard';
};

const getSectionSubtitle = (section) => {
  const subtitles = {
    dashboard: 'Overview of your store performance',
    products: 'Manage your product catalog and inventory'
  };
  return subtitles[section] || 'Manage your store';
};

const handleImageError = (event) => {
  event.target.style.display = 'none';
};

const exportProducts = () => {
  const csvContent = [
    ['Name', 'Description', 'Price', 'Best Seller', 'Created At', 'Image URL'],
    ...products.value.map(p => [
      p.name,
      p.description || '',
      `₱${parseFloat(p.price).toFixed(2)}`,
      p.is_best_seller ? 'Yes' : 'No',
      new Date(p.created_at).toLocaleDateString(),
      p.image_url || ''
    ])
  ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `products_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
  
  showStatus('Products exported successfully!', 'success');
};

onMounted(async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    router.push('/admin/login');
    return;
  }
  user.value = session.user;
  fetchProducts();
});
</script>