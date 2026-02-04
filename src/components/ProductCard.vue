<template>
  <div class="product-card" :class="{ 'admin-view': isAdminView }">
    <div class="product-image-container">
      <img 
        :src="getImageUrl(product.image_url)" 
        :alt="product.name" 
        class="product-image"
        @error="handleImageError"
        loading="lazy"
      />
      <div v-if="isAdminView" class="admin-badge">Admin View</div>
    </div>
    
    <div class="product-content">
      <h3 class="product-name">{{ product.name }}</h3>
      
      <p class="product-description">
        {{ truncateDescription(product.description) }}
      </p>
      
      <div class="product-footer">
        <div class="price-section">
          <span class="currency">₱</span>
          <span class="price">{{ formatPrice(product.price) }}</span>
        </div>
        
        <div v-if="isAdminView" class="admin-actions">
          <button 
            @click="$emit('edit', product)" 
            class="action-btn edit-btn"
            :disabled="isDeleting"
            title="Edit Product"
          >
            <span class="btn-icon">✏️</span>
            <span class="btn-text">Edit</span>
          </button>
          
          <button 
            @click="$emit('delete', product.id)" 
            class="action-btn delete-btn"
            :disabled="isDeleting"
            title="Delete Product"
          >
            <span v-if="isDeleting" class="btn-icon">⏳</span>
            <span v-else class="btn-icon">🗑️</span>
            <span class="btn-text">
              {{ isDeleting ? 'Deleting...' : 'Delete' }}
            </span>
          </button>
        </div>
      </div>
      
      <div v-if="product.created_at" class="product-meta">
        <small class="created-at">
          Added: {{ formatDate(product.created_at) }}
        </small>
      </div>
    </div>
  </div>
</template>

<script setup>
import { getProductImageUrl } from '../utils/storage.js';

const props = defineProps({
  product: {
    type: Object,
    required: true
  },
  isAdminView: {
    type: Boolean,
    default: false
  },
  isDeleting: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['edit', 'delete']);

// Get full image URL
const getImageUrl = (path) => {
  return getProductImageUrl(path);
};

// Handle image loading errors
const handleImageError = (event) => {
  event.target.src = '/placeholder.jpg';
};

// Truncate description if too long
const truncateDescription = (description) => {
  if (!description) return 'No description available';
  
  const maxLength = props.isAdminView ? 80 : 120;
  if (description.length <= maxLength) return description;
  
  return description.substring(0, maxLength) + '...';
};

// Format price with proper decimals
const formatPrice = (price) => {
  if (!price) return '0.00';
  return parseFloat(price).toFixed(2);
};

// Format date
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};
</script>

<style scoped>
.product-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid #eef2f7;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.product-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  border-color: #667eea;
}

.product-card.admin-view {
  border: 2px solid #f0f0f0;
}

.product-card.admin-view:hover {
  border-color: #764ba2;
}

/* Image Container */
.product-image-container {
  position: relative;
  height: 220px;
  overflow: hidden;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%);
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.product-card:hover .product-image {
  transform: scale(1.05);
}

.admin-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: bold;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

/* Content */
.product-content {
  padding: 24px;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.product-name {
  margin: 0 0 12px 0;
  font-size: 1.3rem;
  font-weight: 700;
  color: #2d3748;
  line-height: 1.4;
}

.product-description {
  color: #718096;
  line-height: 1.6;
  margin-bottom: 20px;
  flex-grow: 1;
  font-size: 0.95rem;
}

/* Footer */
.product-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  padding-top: 20px;
  border-top: 1px solid #edf2f7;
}

.price-section {
  display: flex;
  align-items: baseline;
}

.currency {
  font-size: 1rem;
  font-weight: 600;
  color: #667eea;
  margin-right: 4px;
}

.price {
  font-size: 1.8rem;
  font-weight: 800;
  color: #2d3748;
  line-height: 1;
}

/* Admin Actions */
.admin-actions {
  display: flex;
  gap: 10px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.edit-btn {
  background: linear-gradient(135deg, #ffc107 0%, #ff9800 100%);
  color: #212529;
}

.edit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 152, 0, 0.3);
}

.delete-btn {
  background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
  color: white;
}

.delete-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

.btn-icon {
  font-size: 1rem;
}

.btn-text {
  display: none;
}

/* Product Meta */
.product-meta {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px dashed #e2e8f0;
}

.created-at {
  color: #a0aec0;
  font-size: 0.85rem;
}

/* Responsive */
@media (min-width: 768px) {
  .product-image-container {
    height: 250px;
  }
  
  .btn-text {
    display: inline;
  }
  
  .action-btn {
    padding: 10px 20px;
  }
}

@media (min-width: 1024px) {
  .product-image-container {
    height: 280px;
  }
  
  .product-name {
    font-size: 1.4rem;
  }
  
  .price {
    font-size: 2rem;
  }
}
</style>