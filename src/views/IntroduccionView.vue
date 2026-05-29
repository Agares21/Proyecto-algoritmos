<template>
  <div class="intro-page">
    <header class="hero">
      <h1>🏛️ Distribución Óptima de Recursos</h1>
      <p>Gobierno Central de Bolivia → Gobernaciones Departamentales</p>
      <div class="hero-badges">
        <span class="badge">🇧🇴 Bolivia</span>
        <span class="badge">📊 9 Departamentos</span>
        <span class="badge">💰 Optimización de Recursos</span>
      </div>
    </header>

    <div class="container">
      <section class="intro-section">
        <h2>🎯 ¿Qué es este proyecto?</h2>
        <p>
          Esta plataforma permite visualizar y optimizar la <strong>distribución de recursos</strong> 
          desde el <strong>Gobierno Central de Bolivia</strong> hacia las <strong>9 gobernaciones departamentales</strong>.
        </p>
        <p>
          Utiliza dos algoritmos clásicos de optimización:
        </p>
        <div class="algorithm-cards">
          <div class="algo-card">
            <div class="algo-icon">🛣️</div>
            <h3>Algoritmo de Dijkstra</h3>
            <p>Encuentra la ruta más económica desde el Gobierno Central hasta cada gobernación, considerando los costos de transporte.</p>
          </div>
          <div class="algo-card">
            <div class="algo-icon">🌳</div>
            <h3>Algoritmo de Kruskal</h3>
            <p>Construye la red de distribución más eficiente que conecte todas las gobernaciones con el mínimo costo total.</p>
          </div>
        </div>
      </section>

      <section class="intro-section">
        <h2>🗺️ Mapa de Bolivia</h2>
        <div class="map-container">
          <div id="intro-map" class="bolivia-map"></div>
        </div>
        <p class="map-caption">
          Los marcadores representan los 9 departamentos de Bolivia. 
          <strong>La Paz</strong> es el punto de partida (Gobierno Central).
        </p>
      </section>

      <section class="intro-section">
        <h2>📋 Datos del Problema</h2>
        <div class="data-grid">
          <div class="data-card">
            <h4>🏛️ Origen</h4>
            <p>Gobierno Central - La Paz</p>
          </div>
          <div class="data-card">
            <h4>📍 Destinos</h4>
            <p>9 Gobernaciones Departamentales</p>
          </div>
          <div class="data-card">
            <h4>📦 Recursos</h4>
            <p>Educación, Salud, Infraestructura</p>
          </div>
          <div class="data-card">
            <h4>🎯 Objetivo</h4>
            <p>Minimizar costos de transporte</p>
          </div>
        </div>
      </section>

      <section class="intro-section">
        <h2>🚀 Comenzar</h2>
        <div class="cta-container">
          <router-link to="/editor" class="cta-button">
            Ir al Editor de Grafos →
          </router-link>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const departamentos = [
  { name: 'La Paz', coords: [-16.5, -68.15] },
  { name: 'Santa Cruz', coords: [-17.78, -63.18] },
  { name: 'Cochabamba', coords: [-17.38, -66.16] },
  { name: 'Potosí', coords: [-19.58, -65.75] },
  { name: 'Sucre', coords: [-19.03, -65.26] },
  { name: 'Tarija', coords: [-21.53, -64.73] },
  { name: 'Beni', coords: [-14.83, -64.90] },
  { name: 'Pando', coords: [-11.02, -68.75] },
  { name: 'Oruro', coords: [-17.97, -67.11] }
];

onMounted(() => {
  const map = L.map('intro-map').setView([-16.5, -65], 6);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
  
  departamentos.forEach(depto => {
    L.marker(depto.coords).addTo(map).bindPopup(depto.name);
  });
});
</script>

<style scoped>
.intro-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  padding: 2rem;
  color: white;
}

.hero {
  text-align: center;
  padding: 3rem 2rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 24px;
  margin-bottom: 2rem;
  backdrop-filter: blur(10px);
}

.hero h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, #f5af19, #f12711);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero p {
  font-size: 1.2rem;
  opacity: 0.9;
}

.hero-badges {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1rem;
  flex-wrap: wrap;
}

.badge {
  background: rgba(255, 255, 255, 0.1);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
}

.container {
  max-width: 1100px;
  margin: 0 auto;
}

.intro-section {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
}

.intro-section h2 {
  color: #f5af19;
  margin-bottom: 1rem;
}

.intro-section p {
  line-height: 1.6;
  margin-bottom: 1rem;
}

.algorithm-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.algo-card {
  background: rgba(255, 255, 255, 0.1);
  padding: 1.5rem;
  border-radius: 12px;
  text-align: center;
}

.algo-icon {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.algo-card h3 {
  margin: 0.5rem 0;
}

.map-container {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.bolivia-map {
  height: 400px;
  width: 100%;
}

.map-caption {
  margin-top: 1rem;
  font-size: 0.9rem;
  opacity: 0.8;
}

.data-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.data-card {
  background: rgba(255, 255, 255, 0.1);
  padding: 1rem;
  border-radius: 12px;
  text-align: center;
}

.data-card h4 {
  color: #f5af19;
  margin-bottom: 0.5rem;
}

.cta-container {
  text-align: center;
  padding: 2rem 0;
}

.cta-button {
  background: linear-gradient(135deg, #f5af19, #f12711);
  color: white;
  padding: 1rem 2rem;
  border-radius: 30px;
  text-decoration: none;
  font-weight: bold;
  font-size: 1.1rem;
  transition: all 0.3s;
  display: inline-block;
}

.cta-button:hover {
  transform: scale(1.05);
  box-shadow: 0 10px 20px rgba(241, 39, 17, 0.3);
}

@media (max-width: 768px) {
  .hero h1 {
    font-size: 1.8rem;
  }
  .bolivia-map {
    height: 300px;
  }
}
</style>