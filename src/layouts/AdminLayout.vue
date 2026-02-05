<template>
  <div class="admin-layout">
    <AdminNavbar />
    
    <main class="admin-main">
      <router-view />
    </main>
  </div>
</template>

<script setup>

</script>

<style scoped>
.admin-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.admin-main {
  flex: 1;
  background: #f8fafc;
}
</style>