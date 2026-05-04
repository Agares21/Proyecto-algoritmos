<template>
  <div class="dijkstra-page">
    <!-- Header -->
    <div class="hero-section">
      <div class="hero-content">
        <h1>Algoritmo de Dijkstra</h1>
        <p>Camino más corto desde un nodo origen a todos los demás nodos en un grafo ponderado</p>
      </div>
      <div class="algorithm-badge">
        🛣️ Camino Más Corto
      </div>
    </div>

    <div class="main-layout">
      <!-- Panel de configuración -->
      <div class="config-card">
        <div class="config-header">
          <h3>Configuración</h3>
        </div>

        <div class="config-group">
          <div class="dimension-item full-width">
            <label>🎲 Generar grafo aleatorio</label>
            <div class="number-control">
              <button @click="decrementNodes" class="num-btn">−</button>
              <span class="num-value">{{ nodeCount }}</span>
              <button @click="incrementNodes" class="num-btn">+</button>
            </div>
          </div>

          <div class="action-buttons">
            <button @click="generateRandomGraph" class="btn-outline">🎲 Aleatorio</button>
            <button @click="loadExample" class="btn-outline">📋 Ejemplo</button>
            <button @click="resetGraph" class="btn-outline">🗑️ Limpiar</button>
            <div class="export-group">
              <input 
                type="text" 
                v-model="exportFileName" 
                class="export-name-input" 
                placeholder="nombre_archivo">
              <button @click="exportData" class="btn-outline export-btn">Exportar</button>
            </div>
            <button @click="triggerImport" class="btn-outline">Importar</button>
          </div>

          <div class="info-panel">
            <div class="info-status">
              <strong>📊 Nodos:</strong> {{ nodes.length }}
            </div>
            <div class="info-status">
              <strong>🔗 Aristas:</strong> {{ edgesList.length }}
            </div>
            <div class="info-status">
              <strong>📍 Nodo Origen:</strong> 
              <span class="source-badge" :style="{ backgroundColor: selectedSourceColor }">
                {{ getNodeLabel(sourceNode) }}
              </span>
            </div>
          </div>

          <button @click="runDijkstra" class="btn-execute" :disabled="isExecuting">
            <span class="execute-icon">▶</span>
            {{ isExecuting ? 'Calculando...' : 'Ejecutar Dijkstra' }}
          </button>

          <button @click="showHelpModal = true" class="btn-help">Ayuda</button>
        </div>

        <p v-if="statusMessage" class="status-message" :class="statusTone">
          {{ statusMessage }}
        </p>
      </div>

      <!-- Visualización del grafo -->
      <div class="graph-card">
        <div class="graph-header">
          <h3>Visualización del Grafo</h3>
          <div class="graph-pills">
            <span class="pill pill-node">🔵 Nodos</span>
            <span class="pill pill-path">🟢 Camino más corto</span>
            <span class="pill pill-normal">⚪ Otras aristas</span>
          </div>
        </div>
        
        <div class="graph-instructions">
          💡 <strong>Instrucciones:</strong> 
          <span>Haz clic en un nodo para seleccionarlo como ORIGEN</span>
          <span>| Arrastra nodos para reubicarlos</span>
          <span>| Doble clic en arista para editar peso</span>
        </div>

        <div class="graph-container">
          <div class="graph-backdrop"></div>
          <canvas ref="canvasRef" class="graph-canvas" @click="handleCanvasClick"></canvas>
        </div>
        
        <!-- Leyenda de colores -->
        <div class="legend">
          <div class="legend-item">
            <div class="legend-color source-color"></div>
            <span>🔴 Nodo Origen (seleccionado)</span>
          </div>
          <div class="legend-item">
            <div class="legend-color path-color"></div>
            <span>🟢 Arista del camino más corto</span>
          </div>
          <div class="legend-item">
            <div class="legend-color normal-color"></div>
            <span>⚪ Otra arista</span>
          </div>
          <div class="legend-item">
            <div class="legend-color node-color"></div>
            <span>🔵 Nodo normal</span>
          </div>
        </div>
      </div>

      <!-- Panel de resultados -->
      <div class="results-card">
        <div class="config-header">
          <h3>📊 Resultados</h3>
        </div>

        <div class="results-content">
          <!-- Resumen del origen -->
          <div class="result-section-card gradient-card">
            <div class="card-header">
              <div class="card-icon blue-gradient">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 110-12 6 6 0 010 12z"/>
                  <path d="M10 6a1 1 0 011 1v3l2 1a1 1 0 01-1 1l-3-1.5V7a1 1 0 011-1z"/>
                </svg>
              </div>
              <div>
                <h4>🎯 Desde el nodo origen</h4>
                <p class="source-info">Nodo <strong>{{ getNodeLabel(sourceNode) }}</strong> → a todos los demás</p>
              </div>
            </div>
            
            <div class="distances-grid">
              <div v-for="(dist, idx) in distances" :key="idx" class="distance-card" :class="{ 'self-distance': idx === sourceNode }">
                <span class="distance-node">{{ getNodeLabel(idx) }}</span>
                <span class="distance-arrow">→</span>
                <span class="distance-value" :class="{ 'infinite': dist === Infinity }">
                  {{ dist === Infinity ? '∞' : dist }}
                </span>
              </div>
            </div>
          </div>

          <!-- Tabla de distancias detallada -->
          <div class="result-section-card" v-if="distancesTable.length > 0">
            <div class="section-header">
              <div class="section-title">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
                <h4>📋 Tabla de distancias</h4>
              </div>
            </div>
            
            <div class="table-wrapper">
              <table class="results-table">
                <thead>
                  <tr>
                    <th>Destino</th>
                    <th>Distancia desde {{ getNodeLabel(sourceNode) }}</th>
                    <th>Ruta</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(dist, idx) in distances" :key="idx" v-if="idx !== sourceNode">
                    <td class="node-cell">{{ getNodeLabel(idx) }}</td>
                    <td class="dist-cell" :class="{ 'infinite-cell': dist === Infinity }">
                      {{ dist === Infinity ? 'No alcanzable' : dist }}
                    </td>
                    <td class="path-cell">{{ getPathString(idx) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Pasos del algoritmo -->
          <div class="result-section-card" v-if="steps.length > 0">
            <div class="section-header">
              <div class="section-title">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                  <path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5z" clip-rule="evenodd"/>
                </svg>
                <h4>📖 Explicación paso a paso</h4>
              </div>
              <button @click="toggleSteps" class="toggle-steps-btn">
                {{ showSteps ? 'Ocultar' : 'Mostrar' }}
              </button>
            </div>
            
            <div v-if="showSteps" class="steps-container">
              <div v-for="(step, idx) in steps" :key="idx" class="step-item">
                <div class="step-number">{{ idx + 1 }}</div>
                <div class="step-content">
                  <p v-html="step"></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de ayuda -->
    <Teleport to="body">
      <div v-if="showHelpModal" class="modal-overlay" @click.self="closeHelpModal">
        <div class="help-modal">
          <div class="modal-header">
            <h2>📖 Guía del Algoritmo de Dijkstra</h2>
            <button class="close-modal" @click="closeHelpModal">✕</button>
          </div>
          <div class="modal-body">
            <div class="help-content-detailed">
              <div class="help-section">
                <h3>🎯 ¿Qué es el Algoritmo de Dijkstra?</h3>
                <p>Es un algoritmo que encuentra el camino más corto desde un nodo origen a todos los demás nodos en un grafo con pesos positivos.</p>
              </div>

              <div class="help-section">
                <h3>📝 ¿Cómo se usa?</h3>
                <div class="steps-list">
                  <div class="step-detail">
                    <div class="step-num">1</div>
                    <div class="step-text"><strong>Selecciona el nodo origen:</strong> Haz clic en cualquier nodo del grafo para elegirlo como punto de partida</div>
                  </div>
                  <div class="step-detail">
                    <div class="step-num">2</div>
                    <div class="step-text"><strong>Ejecuta el algoritmo:</strong> Presiona el botón "Ejecutar Dijkstra"</div>
                  </div>
                  <div class="step-detail">
                    <div class="step-num">3</div>
                    <div class="step-text"><strong>Observa los resultados:</strong> Se mostrarán las distancias mínimas a cada nodo y los caminos</div>
                  </div>
                </div>
              </div>

              <div class="help-section">
                <h3>⚙️ Cómo funciona paso a paso:</h3>
                <div class="steps-list">
                  <div class="step-detail">
                    <div class="step-num">1</div>
                    <div class="step-text">Se asigna distancia 0 al nodo origen e infinito a los demás</div>
                  </div>
                  <div class="step-detail">
                    <div class="step-num">2</div>
                    <div class="step-text">Se selecciona el nodo no visitado con menor distancia</div>
                  </div>
                  <div class="step-detail">
                    <div class="step-num">3</div>
                    <div class="step-text">Se revisan sus vecinos y se actualizan sus distancias si se encuentra un camino más corto</div>
                  </div>
                  <div class="step-detail">
                    <div class="step-num">4</div>
                    <div class="step-text">Se marca el nodo como visitado y se repite hasta recorrer todos</div>
                  </div>
                </div>
              </div>

              <div class="help-section">
                <h3>🖱️ Interacción con el grafo:</h3>
                <ul>
                  <li><strong>Clic en nodo:</strong> Selecciona el nodo como ORIGEN</li>
                  <li><strong>Arrastrar nodo:</strong> Reubica el nodo en el canvas</li>
                  <li><strong>Doble clic en arista:</strong> Edita el peso de la conexión</li>
                  <li><strong>Shift + clic en vacío:</strong> Crea un nuevo nodo</li>
                </ul>
              </div>

              <div class="help-note-box">
                <strong>💡 Nota importante:</strong> El algoritmo de Dijkstra solo funciona con pesos positivos. Los caminos se muestran en color verde en el grafo.
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <input ref="importInputRef" type="file" accept=".json" class="hidden-input" @change="importData">
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from "vue";

// Estado
const nodeCount = ref(6);
const sourceNode = ref(0);
const isExecuting = ref(false);
const showHelpModal = ref(false);
const showSteps = ref(false);
const statusMessage = ref("");
const statusTone = ref("");
const exportFileName = ref("dijkstra");
const selectedSourceColor = ref("#ef4444");

// Datos del grafo
const nodes = ref([]);
const edgesList = ref([]);
const distances = ref([]);
const previous = ref([]);
const pathEdges = ref([]);
const steps = ref([]);
const distancesTable = ref([]);

// Canvas
const canvasRef = ref(null);
let ctx = null;
let dragging = false;
let dragNode = null;
let creatingEdge = false;
let edgeStartNode = null;

const nodeLabels = ["A", "B", "C", "D", "E", "F", "G", "H"];

// ============ FUNCIONES DEL GRAFO ============

const getNodeLabel = (id) => {
  const node = nodes.value.find(n => n.id === id);
  return node ? node.label : `N${id}`;
};

const getPathString = (targetId) => {
  if (targetId === sourceNode.value) return `${getNodeLabel(sourceNode.value)}`;
  if (previous.value[targetId] === -1) return "No hay ruta";
  
  const path = [];
  let current = targetId;
  while (current !== -1) {
    path.unshift(getNodeLabel(current));
    current = previous.value[current];
    if (current === sourceNode.value) {
      path.unshift(getNodeLabel(sourceNode.value));
      break;
    }
  }
  return path.join(" → ");
};

const generateRandomGraph = () => {
  const n = nodeCount.value;
  const newNodes = [];
  const newEdges = [];
  
  const centerX = 400;
  const centerY = 250;
  const radius = 180;
  
  for (let i = 0; i < n; i++) {
    const angle = (i * 2 * Math.PI / n) - Math.PI / 2;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    newNodes.push({
      id: i,
      label: nodeLabels[i % nodeLabels.length] + (i >= nodeLabels.length ? (Math.floor(i / nodeLabels.length) + 1) : ""),
      x, y
    });
  }
  
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (Math.random() > 0.4) {
        const weight = Math.floor(Math.random() * 15) + 1;
        newEdges.push({
          id: `${i}-${j}`,
          from: i,
          to: j,
          weight: weight
        });
      }
    }
  }
  
  nodes.value = newNodes;
  edgesList.value = newEdges;
  drawGraph();
  statusMessage.value = "✅ Grafo aleatorio generado";
  statusTone.value = "success";
  setTimeout(() => statusMessage.value = "", 2000);
};

const loadExample = () => {
  nodeCount.value = 6;
  nodes.value = [
    { id: 0, label: "A", x: 150, y: 150 },
    { id: 1, label: "B", x: 350, y: 100 },
    { id: 2, label: "C", x: 550, y: 150 },
    { id: 3, label: "D", x: 100, y: 350 },
    { id: 4, label: "E", x: 400, y: 380 },
    { id: 5, label: "F", x: 650, y: 350 }
  ];
  
  edgesList.value = [
    { id: "0-1", from: 0, to: 1, weight: 4 },
    { id: "0-3", from: 0, to: 3, weight: 5 },
    { id: "1-2", from: 1, to: 2, weight: 2 },
    { id: "1-3", from: 1, to: 3, weight: 6 },
    { id: "1-4", from: 1, to: 4, weight: 3 },
    { id: "2-4", from: 2, to: 4, weight: 7 },
    { id: "2-5", from: 2, to: 5, weight: 8 },
    { id: "3-4", from: 3, to: 4, weight: 4 },
    { id: "4-5", from: 4, to: 5, weight: 5 }
  ];
  
  sourceNode.value = 0;
  drawGraph();
  statusMessage.value = "✅ Ejemplo clásico cargado";
  statusTone.value = "success";
  setTimeout(() => statusMessage.value = "", 2000);
};

const resetGraph = () => {
  nodes.value = [];
  edgesList.value = [];
  distances.value = [];
  previous.value = [];
  pathEdges.value = [];
  steps.value = [];
  drawGraph();
  statusMessage.value = "🔄 Grafo reiniciado";
  statusTone.value = "neutral";
  setTimeout(() => statusMessage.value = "", 2000);
};

// ============ ALGORITMO DE DIJKSTRA ============

const runDijkstra = async () => {
  if (nodes.value.length === 0) {
    statusMessage.value = "❌ No hay nodos en el grafo";
    statusTone.value = "error";
    setTimeout(() => statusMessage.value = "", 2000);
    return;
  }
  
  if (sourceNode.value >= nodes.value.length) {
    statusMessage.value = "❌ Nodo origen inválido";
    statusTone.value = "error";
    setTimeout(() => statusMessage.value = "", 2000);
    return;
  }
  
  isExecuting.value = true;
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const n = nodes.value.length;
  const dist = Array(n).fill(Infinity);
  const prev = Array(n).fill(-1);
  const visited = Array(n).fill(false);
  const stepList = [];
  const edgesMap = new Map();
  
  edgesList.value.forEach(edge => {
    edgesMap.set(`${edge.from}-${edge.to}`, edge.weight);
    edgesMap.set(`${edge.to}-${edge.from}`, edge.weight);
  });
  
  dist[sourceNode.value] = 0;
  stepList.push(`🎯 <strong>Inicio:</strong> Distancia al nodo <strong>${getNodeLabel(sourceNode.value)}</strong> = 0, a los demás = ∞`);
  
  for (let count = 0; count < n; count++) {
    let minDist = Infinity;
    let u = -1;
    
    for (let i = 0; i < n; i++) {
      if (!visited[i] && dist[i] < minDist) {
        minDist = dist[i];
        u = i;
      }
    }
    
    if (u === -1) break;
    
    visited[u] = true;
    if (u !== sourceNode.value) {
      stepList.push(`📍 <strong>Paso ${count + 1}:</strong> Seleccionamos el nodo <strong>${getNodeLabel(u)}</strong> con distancia ${dist[u]} desde el origen`);
    } else {
      stepList.push(`📍 <strong>Paso ${count + 1}:</strong> Comenzamos desde el nodo origen <strong>${getNodeLabel(u)}</strong>`);
    }
    
    for (let v = 0; v < n; v++) {
      const weight = edgesMap.get(`${u}-${v}`);
      if (weight && !visited[v]) {
        const newDist = dist[u] + weight;
        if (newDist < dist[v]) {
          const oldDist = dist[v] === Infinity ? "∞" : dist[v];
          dist[v] = newDist;
          prev[v] = u;
          stepList.push(`  ↳ <strong>Actualizamos ${getNodeLabel(v)}:</strong> ${oldDist} → ${newDist} (vía ${getNodeLabel(u)})`);
        }
      }
    }
    
    distances.value = [...dist];
    drawGraph(true);
    await new Promise(resolve => setTimeout(resolve, 400));
  }
  
  const reachedNodes = dist.filter(d => d !== Infinity).length - 1;
  stepList.push(`✅ <strong>Finalizado!</strong> Se encontraron rutas a ${reachedNodes} nodos desde ${getNodeLabel(sourceNode.value)}`);
  
  // Reconstruir caminos
  const newPathEdges = [];
  for (let i = 0; i < n; i++) {
    if (i !== sourceNode.value && prev[i] !== -1) {
      let current = i;
      while (prev[current] !== -1) {
        const from = prev[current];
        const to = current;
        if (!newPathEdges.some(e => (e.from === from && e.to === to) || (e.from === to && e.to === from))) {
          newPathEdges.push({ from, to });
        }
        current = prev[current];
        if (current === sourceNode.value) break;
      }
    }
  }
  
  pathEdges.value = newPathEdges;
  steps.value = stepList;
  distancesTable.value = dist.map((d, i) => ({ node: getNodeLabel(i), distance: d }));
  drawGraph(true);
  
  statusMessage.value = `✅ Dijkstra completado. Distancias calculadas desde ${getNodeLabel(sourceNode.value)}`;
  statusTone.value = "success";
  isExecuting.value = false;
  setTimeout(() => statusMessage.value = "", 3000);
};

// ============ DIBUJO DEL GRAFO ============

const drawGraph = (highlightPaths = false) => {
  if (!canvasRef.value || !nodes.value.length) return;
  
  const canvas = canvasRef.value;
  ctx = canvas.getContext("2d");
  
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Dibujar aristas
  edgesList.value.forEach(edge => {
    const fromNode = nodes.value.find(n => n.id === edge.from);
    const toNode = nodes.value.find(n => n.id === edge.to);
    
    if (!fromNode || !toNode) return;
    
    const isPath = highlightPaths && pathEdges.value.some(
      p => (p.from === edge.from && p.to === edge.to) || (p.from === edge.to && p.to === edge.from)
    );
    
    ctx.beginPath();
    ctx.moveTo(fromNode.x, fromNode.y);
    ctx.lineTo(toNode.x, toNode.y);
    
    if (isPath) {
      ctx.strokeStyle = "#10b981";
      ctx.lineWidth = 4;
      ctx.setLineDash([]);
    } else {
      ctx.strokeStyle = "#94a3b8";
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
    }
    
    ctx.stroke();
    ctx.setLineDash([]);
    
    const midX = (fromNode.x + toNode.x) / 2;
    const midY = (fromNode.y + toNode.y) / 2;
    
    ctx.fillStyle = isPath ? "#10b981" : "#475569";
    ctx.font = "bold 14px Inter";
    ctx.shadowBlur = 0;
    ctx.fillText(edge.weight, midX + 5, midY - 5);
  });
  
  // Dibujar nodos
  nodes.value.forEach(node => {
    ctx.beginPath();
    ctx.arc(node.x, node.y, 26, 0, 2 * Math.PI);
    
    if (node.id === sourceNode.value) {
      ctx.fillStyle = "#ef4444";
      ctx.shadowColor = "rgba(239, 68, 68, 0.5)";
      ctx.shadowBlur = 10;
    } else {
      ctx.fillStyle = "#3b82f6";
      ctx.shadowColor = "rgba(59, 130, 246, 0.3)";
      ctx.shadowBlur = 8;
    }
    ctx.fill();
    ctx.strokeStyle = "white";
    ctx.lineWidth = 3;
    ctx.stroke();
    
    ctx.fillStyle = "white";
    ctx.font = "bold 16px Inter";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowBlur = 0;
    ctx.fillText(node.label, node.x, node.y);
  });
};

// ============ INTERACCIONES DEL CANVAS ============

const getMousePos = (e) => {
  const rect = canvasRef.value.getBoundingClientRect();
  const scaleX = canvasRef.value.width / rect.width;
  const scaleY = canvasRef.value.height / rect.height;
  return {
    x: (e.clientX - rect.left) * scaleX,
    y: (e.clientY - rect.top) * scaleY
  };
};

const findNodeAt = (x, y) => {
  for (const node of nodes.value) {
    const dx = node.x - x;
    const dy = node.y - y;
    if (Math.sqrt(dx * dx + dy * dy) < 26) {
      return node;
    }
  }
  return null;
};

const handleCanvasClick = (e) => {
  const pos = getMousePos(e);
  const node = findNodeAt(pos.x, pos.y);
  
  if (node) {
    // Seleccionar nodo como origen (clic normal)
    sourceNode.value = node.id;
    drawGraph();
    statusMessage.value = `🎯 Nodo origen cambiado a ${node.label}`;
    statusTone.value = "success";
    setTimeout(() => statusMessage.value = "", 1500);
  } else {
    // Crear nuevo nodo con Shift + clic
    if (e.shiftKey) {
      const newLabel = prompt("Nombre del nodo:", nodeLabels[nodes.value.length % nodeLabels.length] + (Math.floor(nodes.value.length / nodeLabels.length) + 1));
      if (newLabel) {
        nodes.value.push({
          id: nodes.value.length,
          label: newLabel,
          x: pos.x,
          y: pos.y
        });
        nodeCount.value = nodes.value.length;
        drawGraph();
        statusMessage.value = `✅ Nodo ${newLabel} creado`;
        statusTone.value = "success";
        setTimeout(() => statusMessage.value = "", 1500);
      }
    }
  }
};

const handleMouseDown = (e) => {
  const pos = getMousePos(e);
  const node = findNodeAt(pos.x, pos.y);
  
  if (node) {
    dragging = true;
    dragNode = node;
    e.preventDefault();
  }
};

const handleMouseMove = (e) => {
  if (dragging && dragNode) {
    const pos = getMousePos(e);
    dragNode.x = Math.max(26, Math.min(canvasRef.value.width - 26, pos.x));
    dragNode.y = Math.max(26, Math.min(canvasRef.value.height - 26, pos.y));
    drawGraph();
  }
};

const handleMouseUp = () => {
  dragging = false;
  dragNode = null;
};

const handleDoubleClick = (e) => {
  const pos = getMousePos(e);
  
  // Buscar arista para editar peso
  for (const edge of edgesList.value) {
    const fromNode = nodes.value.find(n => n.id === edge.from);
    const toNode = nodes.value.find(n => n.id === edge.to);
    if (fromNode && toNode) {
      const midX = (fromNode.x + toNode.x) / 2;
      const midY = (fromNode.y + toNode.y) / 2;
      const dx = midX - pos.x;
      const dy = midY - pos.y;
      if (Math.sqrt(dx * dx + dy * dy) < 25) {
        const newWeight = prompt(`Editar peso de la arista ${getNodeLabel(edge.from)} → ${getNodeLabel(edge.to)}:`, edge.weight);
        if (newWeight && !isNaN(newWeight) && parseInt(newWeight) > 0) {
          edge.weight = parseInt(newWeight);
          drawGraph();
          statusMessage.value = `✏️ Peso actualizado a ${newWeight}`;
          statusTone.value = "success";
          setTimeout(() => statusMessage.value = "", 1500);
        }
        break;
      }
    }
  }
};

// Acciones
const triggerImport = () => importInputRef.value?.click();
const toggleSteps = () => { showSteps.value = !showSteps.value; };
const closeHelpModal = () => { showHelpModal.value = false; };
const decrementNodes = () => { if (nodeCount.value > 2) { nodeCount.value--; generateRandomGraph(); } };
const incrementNodes = () => { if (nodeCount.value < 8) { nodeCount.value++; generateRandomGraph(); } };

// Exportar/Importar
const exportData = () => {
  const payload = {
    nodes: nodes.value,
    edges: edgesList.value,
    exportDate: new Date().toISOString()
  };
  
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  const fileName = exportFileName.value.trim() || "dijkstra";
  link.download = `${fileName}.json`;
  link.click();
  URL.revokeObjectURL(url);
  statusMessage.value = `📁 Grafo exportado como ${fileName}.json`;
  statusTone.value = "success";
  setTimeout(() => statusMessage.value = "", 2000);
};

const importData = (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      if (data.nodes && data.edges) {
        nodes.value = data.nodes;
        edgesList.value = data.edges;
        nodeCount.value = nodes.value.length;
        distances.value = [];
        previous.value = [];
        pathEdges.value = [];
        steps.value = [];
        drawGraph();
        statusMessage.value = "✅ Grafo importado exitosamente";
        statusTone.value = "success";
      } else {
        throw new Error("Formato inválido");
      }
    } catch (error) {
      statusMessage.value = "❌ Error al importar archivo";
      statusTone.value = "error";
    }
    setTimeout(() => statusMessage.value = "", 2000);
  };
  reader.readAsText(file);
  event.target.value = "";
};

const resizeCanvas = () => {
  if (canvasRef.value) {
    canvasRef.value.width = canvasRef.value.clientWidth;
    canvasRef.value.height = canvasRef.value.clientHeight;
    drawGraph();
  }
};

onMounted(() => {
  loadExample();
  window.addEventListener("resize", resizeCanvas);
  setTimeout(resizeCanvas, 100);
  
  if (canvasRef.value) {
    canvasRef.value.addEventListener("mousedown", handleMouseDown);
    canvasRef.value.addEventListener("mousemove", handleMouseMove);
    canvasRef.value.addEventListener("mouseup", handleMouseUp);
    canvasRef.value.addEventListener("dblclick", handleDoubleClick);
  }
});

onUnmounted(() => {
  if (canvasRef.value) {
    canvasRef.value.removeEventListener("mousedown", handleMouseDown);
    canvasRef.value.removeEventListener("mousemove", handleMouseMove);
    canvasRef.value.removeEventListener("mouseup", handleMouseUp);
    canvasRef.value.removeEventListener("dblclick", handleDoubleClick);
  }
  window.removeEventListener("resize", resizeCanvas);
});

watch(nodeCount, () => {
  generateRandomGraph();
});
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.dijkstra-page {
  min-height: 100vh;
  padding: 32px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
}

/* Hero Section */
.hero-section {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 32px;
  padding: 32px 48px;
  margin-bottom: 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 24px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.hero-content {
  flex: 1;
}

.hero-content h1 {
  font-size: 2rem;
  margin: 0 0 8px 0;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-content p {
  color: #666;
  margin: 0;
}

.algorithm-badge {
  padding: 12px 28px;
  border-radius: 40px;
  font-weight: bold;
  font-size: 1rem;
  color: white;
  background: linear-gradient(135deg, #ef4444, #dc2626);
}

/* Main Layout */
.main-layout {
  display: grid;
  grid-template-columns: 320px 1fr 420px;
  gap: 24px;
}

/* Config Card */
.config-card {
  background: white;
  border-radius: 24px;
  padding: 24px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  height: fit-content;
  position: sticky;
  top: 24px;
}

.config-header h3 {
  margin: 0 0 20px 0;
  font-size: 1.2rem;
  color: #333;
  padding-bottom: 12px;
  border-bottom: 2px solid #f0f0f0;
}

.config-group {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.dimension-item.full-width {
  width: 100%;
}

.dimension-item label {
  display: block;
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 8px;
}

.number-control {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #f5f5f5;
  border-radius: 12px;
  padding: 4px;
}

.num-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1.2rem;
  font-weight: bold;
  color: #667eea;
  transition: all 0.2s;
}

.num-btn:hover {
  background: #667eea;
  color: white;
  transform: scale(1.05);
}

.num-value {
  font-size: 1.2rem;
  font-weight: bold;
  min-width: 40px;
  text-align: center;
}

.action-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.btn-outline {
  flex: 1;
  min-width: 70px;
  padding: 8px 12px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 10px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s;
}

.btn-outline:hover {
  border-color: #667eea;
  background: #f5f7fa;
  transform: translateY(-2px);
}

.export-group {
  display: flex;
  flex: 1;
  gap: 4px;
}

.export-name-input {
  flex: 1;
  padding: 8px 10px;
  border: 1px solid #ddd;
  border-radius: 10px;
  font-size: 0.8rem;
  transition: all 0.2s;
  min-width: 80px;
}

.export-name-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.export-btn {
  flex-shrink: 0;
}

.info-panel {
  background: #f8f9fa;
  border-radius: 14px;
  padding: 12px;
  margin-top: 8px;
}

.info-status {
  font-size: 0.85rem;
  font-weight: 600;
  color: #667eea;
  margin-bottom: 6px;
}

.source-badge {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 20px;
  color: white;
  font-size: 0.8rem;
  margin-left: 8px;
}

.btn-execute {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s;
}

.btn-execute:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
}

.btn-execute:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-help {
  width: 100%;
  padding: 10px;
  background: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  color: #667eea;
  transition: all 0.2s;
  margin-top: 8px;
}

.btn-help:hover {
  background: #667eea;
  color: white;
  border-color: #667eea;
  transform: translateY(-2px);
}

.execute-icon {
  font-size: 0.9rem;
}

.status-message {
  margin-top: 16px;
  padding: 10px;
  border-radius: 12px;
  text-align: center;
  font-size: 0.8rem;
  animation: slideIn 0.3s ease;
}

.status-message.success {
  background: #d4edda;
  color: #155724;
}

.status-message.error {
  background: #f8d7da;
  color: #991b1b;
}

.status-message.neutral {
  background: #e7f3ff;
  color: #004085;
}

/* Graph Card */
.graph-card {
  background: white;
  border-radius: 24px;
  padding: 24px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

.graph-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 12px;
}

.graph-header h3 {
  margin: 0;
  color: #333;
  font-size: 1rem;
}

.graph-instructions {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 12px;
  padding: 10px 16px;
  margin-bottom: 16px;
  font-size: 0.75rem;
  color: #166534;
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.graph-instructions span {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.graph-pills {
  display: flex;
  gap: 8px;
}

.pill {
  padding: 4px 12px;
  background: #f8f9fa;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 500;
}

.graph-container {
  position: relative;
  min-height: 450px;
  background: linear-gradient(180deg, #fafcff 0%, #f0f4ff 100%);
  border-radius: 20px;
  border: 1px solid rgba(59, 130, 246, 0.15);
  overflow: hidden;
}

.graph-backdrop {
  position: absolute;
  inset: 0;
  background-image: 
    radial-gradient(circle at 20% 30%, rgba(59,130,246,0.05) 0%, transparent 30%),
    linear-gradient(rgba(59,130,246,0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(59,130,246,0.03) 1px, transparent 1px);
  background-size: 100% 100%, 24px 24px, 24px 24px;
  pointer-events: none;
}

.graph-canvas {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 450px;
  cursor: pointer;
}

.legend {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-top: 16px;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.7rem;
  color: #666;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 50%;
}

.source-color {
  background: #ef4444;
}

.path-color {
  background: #10b981;
}

.normal-color {
  background: #94a3b8;
}

.node-color {
  background: #3b82f6;
}

/* Results Card */
.results-card {
  background: white;
  border-radius: 24px;
  padding: 24px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  height: fit-content;
  position: sticky;
  top: 24px;
  overflow-y: auto;
  max-height: calc(100vh - 48px);
}

.results-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.result-section-card {
  background: #f8f9fa;
  border-radius: 18px;
  padding: 18px;
  border: 1px solid #e0e0e0;
  transition: all 0.2s;
}

.result-section-card:hover {
  border-color: #667eea;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
}

.gradient-card {
  background: linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%);
  border: 1px solid rgba(102, 126, 234, 0.2);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 16px;
}

.card-icon {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.card-icon svg {
  width: 22px;
  color: white;
}

.blue-gradient {
  background: linear-gradient(135deg, #667eea, #764ba2);
}

.card-header h4 {
  margin: 0 0 4px;
  font-size: 0.9rem;
  font-weight: 600;
  color: #333;
}

.card-header p {
  margin: 0;
  font-size: 0.7rem;
  color: #666;
}

.source-info {
  font-size: 0.8rem;
  margin-top: 4px;
}

.source-info strong {
  color: #ef4444;
  background: #fee2e2;
  padding: 2px 8px;
  border-radius: 20px;
}

.distances-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
  gap: 10px;
}

.distance-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  transition: all 0.2s;
}

.distance-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.self-distance {
  background: linear-gradient(135deg, #fee2e2, #fecaca);
  border-color: #fca5a5;
}

.distance-node {
  font-weight: 700;
  color: #333;
  font-size: 0.85rem;
}

.distance-arrow {
  color: #667eea;
  font-size: 0.7rem;
}

.distance-value {
  font-weight: 700;
  color: #3b82f6;
  font-size: 0.9rem;
}

.distance-value.infinite {
  color: #ef4444;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-title svg {
  width: 16px;
  height: 16px;
  color: #667eea;
}

.section-title h4 {
  margin: 0;
  font-size: 0.85rem;
  font-weight: 600;
}

.toggle-steps-btn {
  padding: 4px 12px;
  background: #e2e8f0;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.7rem;
  font-weight: 600;
  color: #475569;
  transition: all 0.2s;
}

.toggle-steps-btn:hover {
  background: #cbd5e1;
}

.table-wrapper {
  overflow-x: auto;
}

.results-table {
  width: 100%;
  border-collapse: collapse;
}

.results-table th,
.results-table td {
  padding: 10px;
  text-align: left;
  border-bottom: 1px solid #e0e0e0;
}

.results-table th {
  background: #f8f9fa;
  font-weight: 600;
  color: #333;
}

.node-cell {
  font-weight: 600;
  color: #3b82f6;
}

.dist-cell {
  font-weight: 500;
}

.dist-cell.infinite-cell {
  color: #ef4444;
}

.path-cell {
  font-family: monospace;
  font-size: 0.75rem;
  color: #059669;
}

.steps-container {
  max-height: 350px;
  overflow-y: auto;
}

.step-item {
  display: flex;
  gap: 10px;
  padding: 10px;
  border-bottom: 1px solid #e0e0e0;
}

.step-number {
  width: 28px;
  height: 28px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 0.7rem;
  flex-shrink: 0;
}

.step-content {
  flex: 1;
}

.step-content p {
  margin: 0;
  font-size: 0.75rem;
  color: #555;
  line-height: 1.5;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

.help-modal {
  background: white;
  border-radius: 32px;
  width: 90%;
  max-width: 800px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: slideUp 0.3s ease;
}

.modal-header {
  padding: 20px 24px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.2rem;
}

.close-modal {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  font-size: 1.3rem;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s;
}

.close-modal:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: rotate(90deg);
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.help-content-detailed {
  padding: 8px;
}

.help-section {
  margin-bottom: 24px;
}

.help-section h3 {
  color: #667eea;
  font-size: 1rem;
  margin: 0 0 12px;
  padding-bottom: 6px;
  border-bottom: 2px solid #e0e0e0;
}

.steps-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.step-detail {
  display: flex;
  gap: 12px;
}

.step-num {
  width: 28px;
  height: 28px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.75rem;
  flex-shrink: 0;
}

.step-text {
  flex: 1;
  color: #555;
  font-size: 0.85rem;
  line-height: 1.5;
}

.help-section ul {
  margin: 8px 0;
  padding-left: 20px;
}

.help-section li {
  margin: 6px 0;
  color: #555;
  font-size: 0.85rem;
}

.help-note-box {
  padding: 12px;
  background: #fef3c7;
  border-left: 4px solid #f59e0b;
  border-radius: 8px;
  color: #92400e;
  font-size: 0.8rem;
}

.hidden-input {
  display: none;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(50px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes slideIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 1200px) {
  .main-layout {
    grid-template-columns: 280px 1fr 380px;
    gap: 16px;
  }
}

@media (max-width: 1024px) {
  .main-layout {
    grid-template-columns: 1fr;
  }
  
  .config-card, .results-card {
    position: static;
  }
  
  .hero-section {
    flex-direction: column;
    text-align: center;
  }
}

@media (max-width: 768px) {
  .dijkstra-page {
    padding: 16px;
  }
  
  .hero-section {
    padding: 24px;
  }
  
  .hero-content h1 {
    font-size: 1.5rem;
  }
  
  .graph-container :deep(.graph-canvas) {
    height: 350px;
  }
  
  .graph-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .distances-grid {
    grid-template-columns: 1fr;
  }
  
  .graph-instructions {
    flex-direction: column;
    gap: 8px;
  }
}
</style>