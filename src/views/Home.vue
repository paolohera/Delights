<template>
  <div class="home-page">
    <!-- Hero Carousel Section -->
    <section class="hero-carousel-section">
      <div class="carousel-container">
        <!-- Carousel Wrapper -->
        <div class="carousel-wrapper">
          <div 
            class="carousel-slides" 
            :style="{ transform: `translateX(-${currentSlide * 100}%)` }"
          >
            <!-- Slide 1 -->
            <div 
              v-if="bestSellers[0]" 
              class="carousel-slide" 
              :style="{ backgroundImage: `url('${bestSellers[0].image_url || getDefaultImage(0)}')` }"
            >
              <!-- No content - just background image -->
            </div>

            <!-- Slide 2 -->
            <div 
              v-if="bestSellers[1]" 
              class="carousel-slide" 
              :style="{ backgroundImage: `url('${bestSellers[1].image_url || getDefaultImage(1)}')` }"
            >
              <!-- No content - just background image -->
            </div>

            <!-- Slide 3 -->
            <div 
              v-if="bestSellers[2]" 
              class="carousel-slide" 
              :style="{ backgroundImage: `url('${bestSellers[2].image_url || getDefaultImage(2)}')` }"
            >
              <!-- No content - just background image -->
            </div>

            <!-- Fallback slides if no best sellers -->
            <div 
              v-if="bestSellers.length === 0" 
              class="carousel-slide" 
              :style="{ backgroundImage: `url('${defaultImages[0]}')` }"
            >
              <!-- Default slide -->
            </div>
            <div 
              v-if="bestSellers.length <= 1" 
              class="carousel-slide" 
              :style="{ backgroundImage: `url('${defaultImages[1]}')` }"
            >
              <!-- Default slide -->
            </div>
            <div 
              v-if="bestSellers.length <= 2" 
              class="carousel-slide" 
              :style="{ backgroundImage: `url('${defaultImages[2]}')` }"
            >
              <!-- Default slide -->
            </div>
          </div>

          <!-- Navigation Arrows -->
          <button class="carousel-arrow carousel-arrow-left" @click="prevSlide">
            ←
          </button>
          <button class="carousel-arrow carousel-arrow-right" @click="nextSlide">
            →
          </button>

          <!-- Dots Indicator -->
          <div class="carousel-dots">
            <button 
              v-for="index in totalSlides" 
              :key="index" 
              class="carousel-dot" 
              :class="{ active: currentSlide === index - 1 }"
              @click="goToSlide(index - 1)"
            ></button>
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
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { supabase } from '../supabase.js';
import ProductCard from '../components/ProductCard.vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const products = ref([]);
const bestSellers = ref([]);
const loading = ref(true);
const hasMore = ref(false);
const page = ref(1);
const pageSize = 12;
const currentSlide = ref(0);
const autoSlideInterval = ref(null);

// Default placeholder images for carousel
const defaultImages = [
  
];

const totalSlides = computed(() => {
  return Math.max(1, Math.min(3, bestSellers.value.length || 1));
});

const getDefaultImage = (index) => {
  return defaultImages[index % defaultImages.length];
};

// Fetch best seller products
const fetchBestSellers = async () => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_best_seller', true)
      .order('created_at', { ascending: false })
      .limit(3);
    
    if (error) throw error;
    
    bestSellers.value = data || [];
    
  } catch (err) {
    console.error('Error fetching best sellers:', err);
    bestSellers.value = [];
  }
};

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

// Carousel Controls
const nextSlide = () => {
  currentSlide.value = (currentSlide.value + 1) % totalSlides.value;
  resetAutoSlide();
};

const prevSlide = () => {
  currentSlide.value = (currentSlide.value - 1 + totalSlides.value) % totalSlides.value;
  resetAutoSlide();
};

const goToSlide = (index) => {
  currentSlide.value = index;
  resetAutoSlide();
};

const startAutoSlide = () => {
  autoSlideInterval.value = setInterval(() => {
    nextSlide();
  }, 5000);
};

const resetAutoSlide = () => {
  if (autoSlideInterval.value) {
    clearInterval(autoSlideInterval.value);
    startAutoSlide();
  }
};

const viewProduct = (productId) => {
  if (productId) {
    router.push(`/product/${productId}`);
  }
};

// Load more products (for pagination)
const loadMoreProducts = () => {
  page.value++;
  fetchProducts();
};

// Initialize
onMounted(() => {
  fetchBestSellers();
  fetchProducts();
  startAutoSlide();
});

onUnmounted(() => {
  if (autoSlideInterval.value) {
    clearInterval(autoSlideInterval.value);
  }
});
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
}

/* Hero Carousel Section */
.hero-carousel-section {
  width: 100%;
  height: 70vh;
  position: relative;
  overflow: hidden;
}

.carousel-container {
  width: 100%;
  height: 100%;
}

.carousel-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.carousel-slides {
  display: flex;
  width: 100%;
  height: 100%;
  transition: transform 0.5s ease-in-out;
}

.carousel-slide {
  flex: 0 0 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  position: relative;
}

/* Navigation Arrows */
.carousel-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border: 2px solid white;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  font-size: 1.8rem;
  cursor: pointer;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.carousel-arrow:hover {
  background: rgba(0, 0, 0, 0.8);
  transform: translateY(-50%) scale(1.1);
}

.carousel-arrow-left {
  left: 30px;
}

.carousel-arrow-right {
  right: 30px;
}

/* Dots Indicator */
.carousel-dots {
  position: absolute;
  bottom: 30px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 15px;
  z-index: 10;
}

.carousel-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 2px solid white;
  background: transparent;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 0;
}

.carousel-dot.active {
  background: white;
  transform: scale(1.2);
}

.carousel-dot:hover {
  background: rgba(255, 255, 255, 0.5);
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
@media (max-width: 1024px) {
  .carousel-arrow {
    width: 50px;
    height: 50px;
    font-size: 1.5rem;
  }
}

@media (max-width: 768px) {
  .hero-carousel-section {
    height: 70vh;
  }
  
  .carousel-arrow {
    width: 40px;
    height: 40px;
    font-size: 1.2rem;
  }
  
  .carousel-arrow-left {
    left: 15px;
  }
  
  .carousel-arrow-right {
    right: 15px;
  }
  
  .carousel-dots {
    bottom: 20px;
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
  .hero-carousel-section {
    height: 60vh;
  }
  
  .carousel-arrow {
    width: 35px;
    height: 35px;
    font-size: 1rem;
  }
  
  .products-grid {
    grid-template-columns: 1fr;
  }
  
  .section-title {
    font-size: 1.8rem;
  }
}
</style>