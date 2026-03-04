<script setup>
import { RouterLink } from "vue-router";
</script>

<template>
  <header class="mi-header">
    <div class="logo">
      <router-link to="/">
        <img src="/img/ucb.png" alt="Logo Personal" />
      </router-link>
      <h3>Analisis de Algoritmos</h3>
    </div>

    <nav>
      <RouterLink to="/" class="nav-link">Inicio</RouterLink>
      <RouterLink to="/algoritmo" class="nav-link">Algoritmo</RouterLink>
      <RouterLink to="/editor" class="nav-link">Crea tu Grafo</RouterLink>
      <RouterLink to="/acerca" class="nav-link">Acerca de</RouterLink>
    </nav>
  </header>
</template>
<style scoped>
/* --- ESTILOS PARA ESCRITORIO (Los que ya tenías) --- */
.mi-header {
  background-color: #1e293b;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.logo {
  display: flex;
  align-items: center;
  gap: 15px;
}

.logo h3 {
  margin: 0;
  color: #42b883;
}
.logo img {
  max-height: 80px;
  transition: all 0.3s ease;
}

nav {
  display: flex;
  gap: 1.5rem;
}

.nav-link {
  color: #cbd5e1;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s;
}

.nav-link:hover {
  color: white;
}

.router-link-active {
  color: #42b883;
  border-bottom: 2px solid #42b883;
}

/* --- ESTILOS PARA CELULARES (La magia de la responsividad) --- */
@media (max-width: 768px) {
  .mi-header {
    /* Cambia la dirección de fila a columna */
    flex-direction: column;
    padding: 1rem;
    gap: 15px;
  }

  .logo {
    /* Apila el logo y el texto, y los centra */
    flex-direction: column;
    text-align: center;
    gap: 10px;
  }

  .logo img {
    /* Achica un poquito el logo en celulares para ahorrar espacio */
    max-height: 60px;
  }

  .logo h3 {
    font-size: 1.3rem; /* Ajusta el tamaño del título */
  }

  nav {
    /* Permite que los enlaces salten de línea si no caben */
    flex-wrap: wrap;
    justify-content: center;
    gap: 1rem;
    width: 100%;
  }
}
</style>
