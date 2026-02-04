<template>
  <div class="admin-dashboard">
    <!-- Header -->
    <header class="dashboard-header">
      <div class="header-content">
        <div class="header-left">
          <h1 class="dashboard-title">
            <span class="dashboard-icon">📊</span>
            Admin Dashboard
          </h1>
          <p class="dashboard-subtitle">Manage your products and inventory</p>
        </div>
        
        <div class="header-right">
          <button @click="cleanupOrphanedImages" class="header-btn cleanup-btn" title="Clean up orphaned images">
            <span class="btn-icon">🧹</span>
            <span class="btn-text">Cleanup</span>
          </button>
          <button @click="handleLogout" class="header-btn logout-btn">
            <span class="btn-icon">🚪</span>
            <span class="btn-text">Logout</span>
          </button>
        </div>
      </div>
    </header>
    
    <!-- Status Messages -->
    <div v-if="deleteStatus" class="status-message" :class="deleteStatusType">
      <div class="status-content">
        <span class="status-icon">{{ deleteStatusIcon }}</span>
        <span class="status-text">{{ deleteStatus }}</span>
      </div>
      <button @click="deleteStatus = ''" class="status-close">×</button>
    </div>
    
    <!-- Main Content -->
    <main class="dashboard-main">
      <!-- Stats Section -->
      <section class="stats-section">
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">📦</div>
            <div class="stat-info">
              <h3 class="stat-number">{{ products.length }}</h3>
              <p class="stat-label">Total Products</p>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">💰</div>
            <div class="stat-info">
              <h3 class="stat-number">₱{{ totalValue }}</h3>
              <p class="stat-label">Total Value</p>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">🆕</div>
            <div class="stat-info">
              <h3 class="stat-number">{{ recentProducts }}</h3>
              <p class="stat-label">Recent (7 days)</p>
            </div>
          </div>
        </div>
      </section>
      
      <!-- Products Management -->
      <section class="products-section">
        <div class="section-header">
          <div class="section-title-group">
            <h2 class="section-title">Product Management</h2>
            <p class="section-subtitle">Add, edit, or delete products from your catalog</p>
          </div>
          
          <button @click="openAddModal" class="add-product-btn">
            <span class="btn-icon">+</span>
            <span class="btn-text">Add New Product</span>
          </button>
        </div>
        
        <!-- Loading -->
        <div v-if="loading" class="loading-state">
          <div class="loading-spinner"></div>
          <p>Loading products...</p>
        </div>
        
        <!-- Products Grid -->
        <div v-else class="products-grid">
          <ProductCard 
            v-for="product in products" 
            :key="product.id"
            :product="product"
            :is-admin-view="true"
            :is-deleting="deletingProductId === product.id"
            @edit="editProduct"
            @delete="deleteProduct"
          />
        </div>
        
        <!-- Empty State -->
        <div v-if="products.length === 0 && !loading" class="empty-state">
          <div class="empty-icon">📦</div>
          <h3>No Products Yet</h3>
          <p>Add your first product to get started!</p>
          <button @click="openAddModal" class="empty-state-btn">
            Add First Product
          </button>
        </div>
      </section>
    </main>
    
    <!-- Product Modal -->
    <div v-if="showModal" class="modal-overlay">
      <div class="modal">
        <h2 class="modal-title">
          <span class="modal-icon">{{ editingProduct ? '✏️' : '➕' }}</span>
          {{ editingProduct ? 'Edit Product' : 'Add New Product' }}
        </h2>
        
        <form @submit.prevent="saveProduct" class="product-form">
          <div class="form-group">
            <label for="name" class="form-label">
              Product Name <span class="required">*</span>
            </label>
            <input 
              type="text" 
              id="name" 
              v-model="formData.name" 
              class="form-input"
              placeholder="Enter product name"
              required
            />
          </div>
          
          <div class="form-group">
            <label for="description" class="form-label">Description</label>
            <textarea 
              id="description" 
              v-model="formData.description" 
              class="form-textarea"
              rows="3"
              placeholder="Describe your product..."
            ></textarea>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="price" class="form-label">
                Price (₱) <span class="required">*</span>
              </label>
              <input 
                type="number" 
                id="price" 
                v-model.number="formData.price" 
                class="form-input"
                step="0.01" 
                min="0" 
                placeholder="0.00"
                required
              />
            </div>
          </div>
          
          <!-- Image Upload Section -->
          <div class="form-group">
            <label class="form-label">Product Image</label>
            
            <!-- Image Preview -->
            <div v-if="imagePreview" class="image-preview">
              <img :src="imagePreview" alt="Preview" class="preview-image" />
              <div class="image-actions">
                <button 
                  type="button" 
                  @click="removeImage" 
                  class="image-action-btn remove-btn"
                >
                  Remove
                </button>
              </div>
            </div>
            
            <!-- File Upload -->
            <div class="file-upload-area">
              <input 
                type="file" 
                ref="fileInput"
                accept="image/*" 
                @change="handleFileSelect"
                class="file-input"
                hidden
              />
              
              <div 
                @click="triggerFileInput"
                @dragover.prevent
                @drop.prevent="handleDrop"
                class="upload-dropzone"
                :class="{ 'has-file': selectedFile }"
              >
                <div class="dropzone-content">
                  <div class="upload-icon">📁</div>
                  <p class="upload-text">
                    {{ selectedFile ? selectedFile.name : 'Click to browse or drag & drop' }}
                  </p>
                  <p class="upload-hint">Supports JPG, PNG, GIF • Max 5MB</p>
                </div>
              </div>
              
              <!-- Upload Progress -->
              <div v-if="uploadProgress > 0" class="upload-progress">
                <div class="progress-bar">
                  <div 
                    class="progress-fill" 
                    :style="{ width: uploadProgress + '%' }"
                  ></div>
                </div>
                <div class="progress-info">
                  <span class="progress-text">Uploading: {{ uploadProgress }}%</span>
                  <span class="progress-size" v-if="selectedFile">
                    ({{ formatFileSize(selectedFile.size) }})
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="modal-actions">
            <button 
              type="submit" 
              :disabled="saving || uploading" 
              class="modal-btn primary-btn"
            >
              <span v-if="saving" class="btn-spinner"></span>
              <span v-else class="btn-icon">{{ editingProduct ? '💾' : '➕' }}</span>
              <span class="btn-text">
                {{ saving ? 'Saving...' : (editingProduct ? 'Update Product' : 'Add Product') }}
              </span>
            </button>
            <button 
              type="button" 
              @click="closeModal" 
              class="modal-btn secondary-btn"
              :disabled="saving"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { supabase } from '../supabase.js';
import { deleteImageFromStorage } from '../utils/storage.js';
import { useRouter } from 'vue-router';
import ProductCard from '../components/ProductCard.vue';

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
const fileInput = ref(null);
const deletingProductId = ref(null);
const deleteStatus = ref('');
const deleteStatusType = ref('');

// Form data
const formData = ref({
  name: '',
  description: '',
  price: 0,
  image_url: ''
});

// Computed properties
const imagePreview = computed(() => {
  if (selectedFile.value) return URL.createObjectURL(selectedFile.value);
  if (editingProduct.value?.image_url) return editingProduct.value.image_url;
  return null;
});

const deleteStatusIcon = computed(() => {
  if (deleteStatusType.value === 'success') return '✅';
  if (deleteStatusType.value === 'error') return '❌';
  return 'ℹ️';
});

const totalValue = computed(() => {
  return products.value.reduce((sum, product) => {
    return sum + (parseFloat(product.price) || 0);
  }, 0).toFixed(2);
});

const recentProducts = computed(() => {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  return products.value.filter(product => {
    return new Date(product.created_at) >= oneWeekAgo;
  }).length;
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
  if (fileInput.value) {
    fileInput.value.value = '';
  }
};

const closeModal = () => {
  showModal.value = false;
  resetForm();
};

const handleFileSelect = (event) => {
  const file = event.target.files[0];
  if (!file) return;
  
  // Validate file type
  if (!file.type.startsWith('image/')) {
    alert('Please select an image file (JPG, PNG, GIF, etc.)');
    fileInput.value.value = '';
    return;
  }
  
  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    alert('File size should be less than 5MB');
    fileInput.value.value = '';
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
  fileInput.value?.click();
};

const removeImage = () => {
  selectedFile.value = null;
  if (editingProduct.value) {
    formData.value.image_url = '';
  }
  if (fileInput.value) {
    fileInput.value.value = '';
  }
};

const uploadImage = async () => {
  if (!selectedFile.value) return null;
  
  try {
    uploading.value = true;
    uploadProgress.value = 0;
    
    // Generate unique filename
    const fileExt = selectedFile.value.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `products/${fileName}`;
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(filePath, selectedFile.value, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) throw error;
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);
    
    return publicUrl;
    
  } catch (err) {
    console.error('Error uploading image:', err);
    showStatus('Failed to upload image: ' + err.message, 'error');
    return null;
  } finally {
    uploading.value = false;
    uploadProgress.value = 0;
  }
};

const saveProduct = async () => {
  try {
    saving.value = true;
    
    // Validate required fields
    if (!formData.value.name.trim()) {
      showStatus('Product name is required', 'error');
      return;
    }
    
    if (!formData.value.price || formData.value.price <= 0) {
      showStatus('Please enter a valid price', 'error');
      return;
    }
    
    let imageUrl = formData.value.image_url;
    
    // Upload new image if selected
    if (selectedFile.value) {
      const uploadedUrl = await uploadImage();
      if (uploadedUrl) {
        imageUrl = uploadedUrl;
      } else {
        // If image upload failed, don't save product
        return;
      }
    }
    
    const productData = {
      name: formData.value.name.trim(),
      description: formData.value.description.trim(),
      price: parseFloat(formData.value.price),
      image_url: imageUrl
    };
    
    if (editingProduct.value) {
      // Update existing product
      const { error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', editingProduct.value.id);
      
      if (error) throw error;
      showStatus('Product updated successfully!', 'success');
    } else {
      // Add new product
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

const deleteProduct = async (productId) => {
  if (!confirm('Are you sure you want to delete this product and its image?')) return;
  
  deletingProductId.value = productId;
  showStatus('Deleting product...', 'info');
  
  try {
    // Get product data
    const { data: product, error: fetchError } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();
    
    if (fetchError) throw fetchError;
    
    // Delete image from storage if exists
    if (product?.image_url) {
      showStatus('Deleting image from storage...', 'info');
      const storageResult = await deleteImageFromStorage(product.image_url);
      
      if (!storageResult.success) {
        console.warn('Image deletion warning:', storageResult.message);
      }
    }
    
    // Delete from database
    showStatus('Deleting from database...', 'info');
    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);
    
    if (deleteError) throw deleteError;
    
    // Success
    showStatus('✅ Product deleted successfully!', 'success');
    fetchProducts();
    
  } catch (err) {
    console.error('Error deleting product:', err);
    showStatus('❌ Error: ' + err.message, 'error');
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
    
    // Get all product image URLs from database
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('image_url');
    
    if (productsError) throw productsError;
    
    const validImageUrls = products
      .map(p => p.image_url)
      .filter(url => url && url.includes('product-images/'));
    
    // Get all files from storage
    const { data: storageFiles, error: storageError } = await supabase.storage
      .from('product-images')
      .list('products');
    
    if (storageError) throw storageError;
    
    // Find orphaned files (in storage but not in database)
    const orphanedFiles = storageFiles.filter(storageFile => {
      const storageUrl = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/product-images/products/${storageFile.name}`;
      return !validImageUrls.some(url => url.includes(storageFile.name));
    });
    
    if (orphanedFiles.length === 0) {
      showStatus('✅ No orphaned images found!', 'success');
      return;
    }
    
    // Delete orphaned files
    const filePaths = orphanedFiles.map(file => `products/${file.name}`);
    
    deleteStatus.value = `Deleting ${orphanedFiles.length} orphaned image(s)...`;
    
    const { error: deleteError } = await supabase.storage
      .from('product-images')
      .remove(filePaths);
    
    if (deleteError) throw deleteError;
    
    showStatus(`✅ Deleted ${orphanedFiles.length} orphaned image(s)!`, 'success');
    
  } catch (err) {
    console.error('Error cleaning up orphaned images:', err);
    showStatus('❌ Cleanup failed: ' + err.message, 'error');
  }
};

const showStatus = (message, type = 'info') => {
  deleteStatus.value = message;
  deleteStatusType.value = type;
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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

// Initialize
onMounted(async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    router.push('/admin/login');
    return;
  }
  fetchProducts();
});
</script>

<style scoped>
/* Keep all the CSS styles from the previous version - they should work fine */
/* Only the JavaScript part was problematic */

.admin-dashboard {
  min-height: 100vh;
  background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
}

.dashboard-header {
  background: linear-gradient(135deg, #2d3748 0%, #1a202c 100%);
  color: white;
  padding: 30px 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}

.header-left {
  flex: 1;
}

.dashboard-title {
  font-size: 2.2rem;
  font-weight: 700;
  margin: 0 0 10px 0;
  display: flex;
  align-items: center;
  gap: 15px;
}

.dashboard-icon {
  font-size: 2.5rem;
}

.dashboard-subtitle {
  color: #a0aec0;
  font-size: 1.1rem;
  margin: 0;
}

.header-right {
  display: flex;
  gap: 15px;
}

.header-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 24px;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cleanup-btn {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.cleanup-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.logout-btn {
  background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
  color: white;
}

.logout-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(220, 53, 69, 0.4);
}

/* Status Message */
.status-message {
  max-width: 1400px;
  margin: 20px auto;
  padding: 15px 20px;
  border-radius: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  animation: slideDown 0.3s ease;
}

.status-message.success {
  background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
  border: 1px solid #b1dfbb;
  color: #155724;
}

.status-message.error {
  background: linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%);
  border: 1px solid #f1b0b7;
  color: #721c24;
}

.status-message.info {
  background: linear-gradient(135deg, #d1ecf1 0%, #bee5eb 100%);
  border: 1px solid #abdde5;
  color: #0c5460;
}

.status-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.status-icon {
  font-size: 1.3rem;
}

.status-text {
  font-weight: 500;
}

.status-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: inherit;
  opacity: 0.7;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.status-close:hover {
  opacity: 1;
  background: rgba(0, 0, 0, 0.1);
}

/* Main Content */
.dashboard-main {
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 20px;
}

/* Stats Section */
.stats-section {
  margin-bottom: 60px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 25px;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 30px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  border: 1px solid #e2e8f0;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
  border-color: #667eea;
}

.stat-icon {
  font-size: 2.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.stat-info {
  flex: 1;
}

.stat-number {
  font-size: 2.2rem;
  font-weight: 800;
  color: #2d3748;
  margin: 0 0 5px 0;
  line-height: 1;
}

.stat-label {
  color: #718096;
  font-size: 0.95rem;
  font-weight: 500;
  margin: 0;
}

/* Products Section */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
  flex-wrap: wrap;
  gap: 20px;
}

.section-title-group {
  flex: 1;
}

.section-title {
  font-size: 2rem;
  color: #2d3748;
  margin: 0 0 10px 0;
  font-weight: 700;
}

.section-subtitle {
  color: #718096;
  font-size: 1.1rem;
  margin: 0;
}

.add-product-btn {
  background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
  color: white;
  border: none;
  padding: 15px 30px;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(72, 187, 120, 0.3);
}

.add-product-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 30px rgba(72, 187, 120, 0.4);
}

/* Products Grid */
.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 30px;
  margin-bottom: 60px;
}

/* Loading State */
.loading-state {
  text-align: center;
  padding: 80px 20px;
  color: #718096;
}

.loading-spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  width: 60px;
  height: 60px;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px auto;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 80px 40px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.05);
  max-width: 500px;
  margin: 40px auto;
  border: 2px dashed #e2e8f0;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 20px;
  opacity: 0.3;
}

.empty-state h3 {
  font-size: 1.8rem;
  color: #2d3748;
  margin-bottom: 10px;
}

.empty-state p {
  color: #718096;
  font-size: 1.1rem;
  margin-bottom: 30px;
}

.empty-state-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 15px 30px;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.empty-state-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 30px rgba(102, 126, 234, 0.4);
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
  backdrop-filter: blur(5px);
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal {
  background: white;
  border-radius: 20px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.4s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-title {
  font-size: 1.8rem;
  color: #2d3748;
  margin: 0;
  padding: 30px 30px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid #e2e8f0;
}

.modal-icon {
  font-size: 1.8rem;
}

.product-form {
  padding: 30px;
}

.form-group {
  margin-bottom: 25px;
}

.form-label {
  display: block;
  font-weight: 600;
  color: #4a5568;
  margin-bottom: 8px;
  font-size: 0.95rem;
}

.required {
  color: #e53e3e;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 14px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.3s;
  background: #f8fafc;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #667eea;
  background: white;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}

/* Image Upload */
.image-preview {
  margin-bottom: 20px;
}

.preview-image {
  width: 100%;
  max-height: 250px;
  object-fit: contain;
  border-radius: 10px;
  border: 2px dashed #e2e8f0;
  padding: 10px;
  background: #f8fafc;
  margin-bottom: 15px;
}

.image-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.image-action-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.remove-btn {
  background: #fed7d7;
  color: #c53030;
}

.remove-btn:hover {
  background: #feb2b2;
}

.change-btn {
  background: #bee3f8;
  color: #2b6cb0;
}

.change-btn:hover {
  background: #90cdf4;
}

/* File Upload */
.upload-dropzone {
  border: 3px dashed #cbd5e0;
  border-radius: 12px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  background: #f8fafc;
}

.upload-dropzone:hover {
  border-color: #667eea;
  background: #edf2f7;
}

.upload-dropzone.has-file {
  border-color: #48bb78;
  background: #f0fff4;
}

.dropzone-content {
  color: #718096;
}

.upload-icon {
  font-size: 3rem;
  margin-bottom: 15px;
  opacity: 0.7;
}

.upload-text {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 8px 0;
}

.upload-hint {
  font-size: 0.9rem;
  margin: 0;
  opacity: 0.7;
}

/* Upload Progress */
.upload-progress {
  margin-top: 20px;
}

.progress-bar {
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #48bb78 0%, #38a169 100%);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
  color: #718096;
}

/* Modal Actions */
.modal-actions {
  display: flex;
  gap: 15px;
  margin-top: 30px;
  padding-top: 25px;
  border-top: 1px solid #e2e8f0;
}

.modal-btn {
  flex: 1;
  padding: 16px;
  border: none;
  border-radius: 10px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.primary-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.primary-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

.primary-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.secondary-btn {
  background: #e2e8f0;
  color: #4a5568;
}

.secondary-btn:hover:not(:disabled) {
  background: #cbd5e0;
}

.btn-spinner {
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top: 3px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* Responsive */
@media (max-width: 768px) {
  .dashboard-title {
    font-size: 1.8rem;
  }
  
  .header-content {
    flex-direction: column;
    text-align: center;
  }
  
  .header-right {
    width: 100%;
    justify-content: center;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .section-header {
    flex-direction: column;
    text-align: center;
  }
  
  .products-grid {
    grid-template-columns: 1fr;
  }
  
  .modal-actions {
    flex-direction: column;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .dashboard-title {
    font-size: 1.5rem;
  }
  
  .header-btn {
    padding: 10px 15px;
    font-size: 0.9rem;
  }
  
  .section-title {
    font-size: 1.6rem;
  }
  
  .modal {
    padding: 15px;
  }
  
  .product-form {
    padding: 20px;
  }
}
</style>