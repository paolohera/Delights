<template>
  <div class="home-page">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">Discover Amazing Products</h1>
        <p class="hero-subtitle">Handpicked items just for you. Quality meets affordability.</p>
        <div class="hero-stats">
          <div class="stat">
            <span class="stat-number">{{ products.length }}</span>
            <span class="stat-label">Products</span>
          </div>
          <div class="stat">
            <span class="stat-icon">⭐</span>
            <span class="stat-label">Premium Quality</span>
          </div>
          <div class="stat">
            <span class="stat-icon">🚚</span>
            <span class="stat-label">Fast Shipping</span>
          </div>
        </div>
      </div>
    </section>
    
    <!-- Products Section -->
    <section class="products-section">
      <div class="section-header">
        <h2 class="section-title">Featured Products</h2>
        <p class="section-subtitle">Browse our collection of premium products</p>
      </div>
      
      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Loading amazing products...</p>
      </div>
      
      <!-- Products Grid -->
      <div v-else class="products-grid">
        <ProductCard 
          v-for="product in products" 
          :key="product.id"
          :product="product"
          :is-admin-view="false"
        />
      </div>
      
      <!-- Empty State -->
      <div v-if="products.length === 0 && !loading" class="empty-state">
        <div class="empty-icon">📦</div>
        <h3>No Products Yet</h3>
        <p>Check back soon for new arrivals!</p>
      </div>
      
      <!-- Loading More (for pagination) -->
      <div v-if="hasMore && !loading" class="load-more">
        <button @click="loadMoreProducts" class="load-more-btn">
          Load More Products
          <span class="arrow">↓</span>
        </button>
      </div>
    </section>
    
    <!-- Call to Action -->
    <section class="cta-section">
      <div class="cta-content">
        <h2>Want to Sell Your Products?</h2>
        <p>Join our platform and reach thousands of customers.</p>
        <router-link to="/admin/login" class="cta-btn">
          Become a Seller
        </router-link>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { supabase } from '../supabase.js';
import ProductCard from '../components/ProductCard.vue';

const products = ref([]);
const loading = ref(true);
const hasMore = ref(false);
const page = ref(1);
const pageSize = 12;

// Fetch products
const fetchProducts = async () => {
  try {
    loading.value = true;
    
    const from = (page.value - 1) * pageSize;
    const to = from + pageSize - 1;
    
    const { data, error, count } = await supabase
      .from('products')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);
    
    if (error) throw error;
    
    if (page.value === 1) {
      products.value = data || [];
    } else {
      products.value = [...products.value, ...data];
    }
    
    // Check if there are more products
    hasMore.value = count > products.value.length;
    
  } catch (err) {
    console.error('Error fetching products:', err);
    alert('Error loading products: ' + err.message);
  } finally {
    loading.value = false;
  }
};

// Load more products (for pagination)
const loadMoreProducts = () => {
  page.value++;
  fetchProducts();
};

// Initialize
onMounted(() => {
  fetchProducts();
});
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
}

/* Hero Section */
.hero-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 80px 20px;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.hero-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E");
  opacity: 0.1;
}

.hero-content {
  position: relative;
  z-index: 1;
  max-width: 800px;
  margin: 0 auto;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 800;
  margin-bottom: 20px;
  line-height: 1.2;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.hero-subtitle {
  font-size: 1.3rem;
  opacity: 0.9;
  margin-bottom: 40px;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.hero-stats {
  display: flex;
  justify-content: center;
  gap: 40px;
  margin-top: 40px;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 700;
  color: #ffd700;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.stat-icon {
  font-size: 2.5rem;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 0.9rem;
  opacity: 0.9;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-top: 5px;
}

/* Products Section */
.products-section {
  padding: 80px 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.section-header {
  text-align: center;
  margin-bottom: 60px;
}

.section-title {
  font-size: 2.5rem;
  color: #2d3748;
  margin-bottom: 15px;
  font-weight: 700;
}

.section-subtitle {
  color: #718096;
  font-size: 1.1rem;
  max-width: 600px;
  margin: 0 auto;
}

/* Products Grid */
.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
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
  padding: 80px 20px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.05);
  max-width: 500px;
  margin: 0 auto;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 20px;
  opacity: 0.5;
}

.empty-state h3 {
  font-size: 1.8rem;
  color: #2d3748;
  margin-bottom: 10px;
}

.empty-state p {
  color: #718096;
  font-size: 1.1rem;
}

/* Load More */
.load-more {
  text-align: center;
  margin-top: 40px;
}

.load-more-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 16px 32px;
  border-radius: 50px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.load-more-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
}

.arrow {
  font-size: 1.3rem;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {transform: translateY(0);}
  40% {transform: translateY(-10px);}
  60% {transform: translateY(-5px);}
}

/* CTA Section */
.cta-section {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  padding: 80px 20px;
  text-align: center;
  border-top: 1px solid #e2e8f0;
}

.cta-content {
  max-width: 600px;
  margin: 0 auto;
}

.cta-content h2 {
  font-size: 2.5rem;
  color: #2d3748;
  margin-bottom: 20px;
}

.cta-content p {
  color: #718096;
  font-size: 1.2rem;
  margin-bottom: 40px;
}

.cta-btn {
  display: inline-block;
  background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
  color: white;
  text-decoration: none;
  padding: 18px 40px;
  border-radius: 50px;
  font-size: 1.2rem;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(72, 187, 120, 0.3);
}

.cta-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 40px rgba(72, 187, 120, 0.4);
}

/* Responsive */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
  }
  
  .hero-subtitle {
    font-size: 1.1rem;
  }
  
  .hero-stats {
    flex-direction: column;
    gap: 30px;
  }
  
  .section-title {
    font-size: 2rem;
  }
  
  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 20px;
  }
  
  .cta-content h2 {
    font-size: 2rem;
  }
  
  .cta-btn {
    padding: 15px 30px;
    font-size: 1.1rem;
  }
}

@media (max-width: 480px) {
  .hero-title {
    font-size: 2rem;
  }
  
  .products-grid {
    grid-template-columns: 1fr;
  }
  
  .section-title {
    font-size: 1.8rem;
  }
}
</style>