<script setup>
import { RouterLink } from "vue-router";
</script>

<template>
  <header class="mi-header">
    <div class="logo">
      <router-link to="/">
        <img src="/img/ucb.png" alt="Logo" />
      </router-link>
      <h3>Distribución de Recursos</h3>
    </div>

    <nav>
      <RouterLink to="/introduccion" class="nav-link">Inicio</RouterLink>
      <RouterLink to="/editor" class="nav-link">Algoritmos</RouterLink>
      <RouterLink to="/ayuda" class="nav-link">Ayuda</RouterLink>
      <RouterLink to="/acerca" class="nav-link">Acerca de</RouterLink>
    </nav>
  </header>
</template>

<style scoped>
.mi-header {
  background: linear-gradient(135deg, #dc2626, #f59e0b, #10b981);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
}

.logo {
  display: flex;
  align-items: center;
  gap: 15px;
}

.logo h3 {
  margin: 0;
  color: white;
}

.logo img {
  max-height: 60px;
}

nav {
  display: flex;
  gap: 1.5rem;
}

.nav-link {
  color: white;
  text-decoration: none;
  font-weight: 500;
  transition: opacity 0.3s;
}

.nav-link:hover {
  opacity: 0.8;
}

.router-link-active {
  border-bottom: 2px solid white;
}

@media (max-width: 768px) {
  .mi-header {
    flex-direction: column;
    padding: 1rem;
    gap: 15px;
  }

  .logo {
    flex-direction: column;
    text-align: center;
    gap: 10px;
  }

  .logo img {
    max-height: 60px;
  }

  nav {
    flex-wrap: wrap;
    justify-content: center;
    gap: 1rem;
    width: 100%;
  }
}
</style>