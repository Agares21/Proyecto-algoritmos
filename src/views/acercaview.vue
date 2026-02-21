<script setup>
import { ref } from "vue";

const equipo = ref([
  {
    id: 1,
    nombre: "Natalina Novillo",
    foto: "/img/foto1.jpg",
  },
  {
    id: 2,
    nombre: "Luzmila Mamani",
    foto: "/img/foto2.jpg",
  },
  {
    id: 3,
    nombre: "Alejandro Arce",
    foto: "/img/foto3.jpg",
  },
  {
    id: 4,
    nombre: "Lorena Rojas",
    foto: "/img/foto4.jpg",
  },
  {
    id: 5,
    nombre: "Sergio Trigo",
    foto: "",
  },
]);
</script>

<template>
  <div class="acerca-page">
    <div class="project-info">
      <h1>Sobre Nosotros</h1>
      <p class="intro">Somos el equipo compilando ideas.</p>
    </div>

    <div class="datos-lista">
      <li><strong>Materia:</strong> Análisis de Algoritmos</li>
      <li><strong>Semestre:</strong> 1-2026</li>
    </div>

    <br />
    <h2>Nuestro Equipo</h2>

    <div class="team-grid">
      <div v-for="miembro in equipo" :key="miembro.id" class="profile-card">
        <div class="img-container">
          <img :src="miembro.foto" :alt="miembro.nombre" class="profile-img" />
        </div>

        <div class="card-content">
          <h3>{{ miembro.nombre }}</h3>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.acerca-page {
  max-width: 2000px;
  margin: 0 auto;
  padding: 3rem 1.5rem;
  text-align: center;
  background-color: #f8fafc;
  min-height: 100vh;
}

.project-info {
  margin-bottom: 4rem;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
}
.datos-lista {
  list-style: none;
  padding: 0;
  margin: 1.5rem 0;
  text-align: left; /* Alineamos la lista a la izquierda para leer mejor */
  display: inline-block; /* Truco para centrar el bloque pero alinear texto */
}

.datos-lista li {
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
}

h1 {
  color: #1e293b;
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.intro {
  font-size: 1.1rem;
  color: #64748b;
  line-height: 1.6;
}

h2 {
  color: #2563eb;
  font-size: 2rem;
  margin-bottom: 3rem;
  position: relative;
  display: inline-block;
}

/* Línea decorativa debajo del título */
h2::after {
  content: "";
  display: block;
  width: 60px;
  height: 4px;
  background: #2563eb;
  margin: 0.5rem auto 0;
  border-radius: 2px;
}

/* --- GRID --- */
.team-grid {
  display: grid;
  /* Responsivo automático: crea columnas de mínimo 240px */
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 2rem;
  padding: 1rem;
}

/* --- TARJETA --- */
.profile-card {
  background: white;
  border-radius: 16px;
  overflow: hidden; /* Para que la imagen respete el borde redondeado */
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
  display: flex;
  flex-direction: column;
}

.profile-card:hover {
  transform: translateY(-5px);
  box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.img-container {
  height: 200px;
  width: 100%;
  background-color: #cbd5e1; /* Fondo gris por si no hay foto */
  overflow: hidden;
}

.profile-img {
  width: 100%;
  height: 100%;
  object-fit: cover; /* Recorta la imagen para llenar el espacio sin deformarse */
  object-position: center top;
}

.card-content {
  padding: 1.5rem;
  flex-grow: 1; /* Asegura que todas las tarjetas tengan altura similar */
  display: flex;
  flex-direction: column;
  align-items: center;
}

.profile-card h3 {
  margin: 0;
  color: #1e293b;
  font-size: 1.25rem;
  font-weight: 700;
}

.badge {
  background-color: #eff6ff;
  color: #2563eb;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 600;
  margin: 0.5rem 0 1rem;
}

.desc {
  color: #64748b;
  font-size: 0.95rem;
  line-height: 1.5;
}
</style>
