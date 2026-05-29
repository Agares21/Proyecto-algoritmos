<!-- src/views/DashboardView.vue -->
<template>
  <div class="dashboard">
    <header class="dashboard-header">
      <div class="header-content">
        <h1>🏛️ Distribución Óptima de Recursos</h1>
        <p>Gobierno Central de Bolivia → Gobernaciones Departamentales</p>
        <div class="header-badges">
          <span class="badge">🇧🇴 Bolivia</span>
          <span class="badge">📊 9 Departamentos</span>
        </div>
      </div>
    </header>

    <div class="dashboard-grid">
      <!-- Dijkstra Card -->
      <div class="stat-card" @click="goToDijkstra">
        <div class="stat-icon">🛣️</div>
        <h3>Dijkstra - Rutas Óptimas</h3>
        <p>Encuentra el camino más corto desde el Gobierno Central hasta cada gobernación</p>
        <div class="stat-details">
          <span class="stat-value">💰 Minimizar costos</span>
          <span class="stat-value">⏱️ Minimizar tiempo</span>
        </div>
        <button class="card-btn">Explorar →</button>
      </div>

      <!-- Kruskal Card -->
      <div class="stat-card" @click="goToKruskal">
        <div class="stat-icon">🌳</div>
        <h3>Kruskal - Red de Distribución</h3>
        <p>Construye la red de conexiones más económica entre todas las gobernaciones</p>
        <div class="stat-details">
          <span class="stat-value">🔗 Conexión total</span>
          <span class="stat-value">📉 Mínimo costo</span>
        </div>
        <button class="card-btn">Explorar →</button>
      </div>
    </div>

    <div class="map-section">
      <div class="map-header">
        <h3>🗺️ Mapa de Bolivia - Centros de Distribución</h3>
        <p>Haz clic en los marcadores para ver información</p>
      </div>
      <div id="map" class="bolivia-map"></div>
    </div>

    <div class="info-section">
      <div class="info-card">
        <h4>📋 Datos del Problema</h4>
        <ul>
          <li><strong>Origen:</strong> Gobierno Central (La Paz)</li>
          <li><strong>Destinos:</strong> 9 Gobernaciones Departamentales</li>
          <li><strong>Recursos a distribuir:</strong> Educación, Salud, Infraestructura</li>
          <li><strong>Objetivo:</strong> Minimizar costos de transporte</li>
        </ul>
      </div>
      <div class="info-card">
        <h4>💡 ¿Cómo funciona?</h4>
        <ul>
          <li><strong>Dijkstra:</strong> Encuentra la ruta más barata desde La Paz a cada departamento</li>
          <li><strong>Kruskal:</strong> Diseña la red de carreteras más económica para conectar todos los departamentos</li>
          <li><strong>Visualización:</strong> Los resultados se muestran en el mapa</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const router = useRouter();

const goToDijkstra = () => router.push('/dijkstra');
const goToKruskal = () => router.push('/kruskal');

// Coordenadas de los departamentos de Bolivia
const departamentos = [
  { name: 'La Paz', coords: [-16.5, -68.15], resources: '500M' },
  { name: 'Santa Cruz', coords: [-17.78, -63.18], resources: '400M' },
  { name: 'Cochabamba', coords: [-17.38, -66.16], resources: '350M' },
  { name: 'Potosí', coords: [-19.58, -65.75], resources: '200M' },
  { name: 'Sucre', coords: [-19.03, -65.26], resources: '250M' },
  { name: 'Tarija', coords: [-21.53, -64.73], resources: '180M' },
  { name: 'Beni', coords: [-14.83, -64.90], resources: '150M' },
  { name: 'Pando', coords: [-11.02, -68.75], resources: '100M' },
  { name: 'Oruro', coords: [-17.97, -67.11], resources: '220M' }
];

let map = null;

onMounted(() => {
  // Inicializar el mapa
  map = L.map('map').setView([-16.5, -65], 6);
  
  // Capa de mapa
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  // Marcar La Paz (Gobierno Central) con un marcador especial
  const laPaz = departamentos[0];
  L.marker(laPaz.coords, {
    icon: L.divIcon({
      className: 'gov-marker',
      html: '🏛️',
      iconSize: [40, 40]
    })
  }).addTo(map)
    .bindPopup(`<strong>${laPaz.name}</strong><br>🏛️ Gobierno Central<br>Recursos disponibles: ${laPaz.resources}`);

  // Marcar los demás departamentos
  departamentos.slice(1).forEach(depto => {
    L.marker(depto.coords).addTo(map)
      .bindPopup(`<strong>${depto.name}</strong><br>Recursos asignados: ${depto.resources}`);
  });

  // Forzar redraw después de un tiempo
  setTimeout(() => {
    if (map) map.invalidateSize();
  }, 500);
});
</script>

<style scoped>
.dashboard {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  padding: 2rem;
  color: white;
}

.dashboard-header {
  text-align: center;
  margin-bottom: 3rem;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 24px;
  backdrop-filter: blur(10px);
}

.header-content h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, #f5af19, #f12711);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.header-badges {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1rem;
}

.badge {
  background: rgba(255, 255, 255, 0.1);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.stat-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 24px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.stat-card:hover {
  transform: translateY(-10px);
  background: rgba(255, 255, 255, 0.2);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.stat-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.stat-details {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin: 1rem 0;
}

.stat-value {
  background: rgba(255, 255, 255, 0.1);
  padding: 0.3rem 0.8rem;
  border-radius: 12px;
  font-size: 0.8rem;
}

.card-btn {
  background: linear-gradient(135deg, #f5af19, #f12711);
  color: white;
  border: none;
  padding: 0.8rem 2rem;
  border-radius: 20px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
}

.card-btn:hover {
  transform: scale(1.05);
}

.map-section {
  margin-bottom: 3rem;
}

.map-header {
  text-align: center;
  margin-bottom: 1rem;
}

.bolivia-map {
  height: 500px;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.info-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.info-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.info-card h4 {
  margin-bottom: 1rem;
  color: #f5af19;
}

.info-card ul {
  list-style: none;
  padding: 0;
}

.info-card li {
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

@media (max-width: 768px) {
  .dashboard {
    padding: 1rem;
  }
  .header-content h1 {
    font-size: 1.8rem;
  }
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
  .bolivia-map {
    height: 300px;
  }
}
</style>