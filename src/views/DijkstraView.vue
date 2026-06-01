<template>
  <div class="dijkstra-page">
    <div class="hero-section">
      <div class="hero-content">
        <h1>Algoritmo de Dijkstra</h1>
        <p>
          {{ optimizationType === 'min'
            ? 'Camino más corto desde un nodo origen a todos los demás nodos'
            : 'Camino simple de mayor peso desde un nodo origen a todos los demás nodos' }}
        </p>
      </div>
      <div class="algorithm-badge">
        {{ optimizationType === 'min' ? '🛣️ Camino Más Corto' : '🛣️ Camino Máximo' }}
      </div>
    </div>

    <div class="main-layout">
      <!-- Panel de configuración -->
      <div class="config-card">
        <div class="config-header">
          <h3>⚙️ Configuración</h3>
        </div>

        <div class="config-group">
          <!-- Número de nodos -->
          <div class="dimension-item full-width">
            <label>📊 Número de nodos</label>
            <div class="number-control">
              <button @click="decrementNodes" class="num-btn">−</button>
              <span class="num-value">{{ nodeCount }}</span>
              <button @click="incrementNodes" class="num-btn">+</button>
            </div>
          </div>

          <!-- Botones Minimizar/Maximizar -->
          <div class="optimization-toggle">
            <button 
              @click="optimizationType = 'min'" 
              class="toggle-btn" 
              :class="{ active: optimizationType === 'min' }">
              📉 Minimizar
            </button>
            <button 
              @click="optimizationType = 'max'" 
              class="toggle-btn" 
              :class="{ active: optimizationType === 'max' }">
              📈 Maximizar
            </button>
          </div>

          <div class="graph-tools">
            <h4>Herramientas</h4>
            <div class="tool-grid">
              <button @click="setEditorMode('move')" :class="{ active: editorMode === 'move' }" class="tool-btn">Mover</button>
              <button @click="setEditorMode('node')" :class="{ active: editorMode === 'node' }" class="tool-btn">Nodo</button>
              <button @click="setEditorMode('edge')" :class="{ active: editorMode === 'edge' }" class="tool-btn">Arista</button>
              <button @click="setEditorMode('delete')" :class="{ active: editorMode === 'delete' }" class="tool-btn danger">Borrar</button>
            </div>
            <p class="tool-status">{{ editorStatus }}</p>
          </div>

          <div class="action-buttons">
            <button @click="loadExample" class="btn-outline">📋 Ejemplo</button>
            <button @click="clearGraph" class="btn-outline danger">
              🗑️ Limpiar
            </button>
            <div class="export-group">
              <input
                type="text"
                v-model="exportFileName"
                class="export-name-input"
                placeholder="nombre_archivo"
              />
              <button @click="exportData" class="btn-outline export-btn">
                📤 Exportar
              </button>
            </div>
            <button @click="triggerImport" class="btn-outline">
              📥 Importar
            </button>
          </div>

          <div class="info-panel">
            <div class="info-status">
              <strong>🔵 Nodos:</strong> {{ nodes.length }}
            </div>
            <div class="info-status">
              <strong>🔗 Aristas:</strong> {{ edges.length }}
            </div>
            <div class="info-status">
              <strong>📍 Origen:</strong>
              <strong class="source-badge">{{
                getNodeLabel(sourceNode)
              }}</strong>
            </div>
            <div class="info-status">
              <strong>Destino:</strong>
              <strong class="target-badge">{{
                targetNode === null ? "Sin destino" : getNodeLabel(targetNode)
              }}</strong>
            </div>
          </div>

          <div class="origen-selector">
            <label>🎯 Seleccionar nodo origen:</label>
            <div class="origen-buttons">
              <button
                v-for="node in nodes"
                :key="node.id"
                @click="selectSourceNode(node.id)"
                :class="{ active: sourceNode === node.id }"
                class="origen-btn"
              >
                {{ node.label }}
              </button>
            </div>
          </div>

          <div class="origen-selector">
            <label>Seleccionar nodo destino:</label>
            <div class="origen-buttons">
              <button
                v-for="node in nodes"
                :key="`target-${node.id}`"
                @click="selectTargetNode(node.id)"
                :class="{ active: targetNode === node.id }"
                :disabled="sourceNode === node.id"
                class="origen-btn target-btn"
              >
                {{ node.label }}
              </button>
            </div>
          </div>

          <button
            @click="runDijkstra"
            class="btn-execute"
            :disabled="isExecuting"
          >
            <span class="execute-icon">▶</span>
            {{ isExecuting ? "Calculando..." : "Ejecutar Dijkstra" }}
          </button>

          <button @click="showHelpModal = true" class="btn-help">
            ❓ Ayuda
          </button>
        </div>

        <p v-if="statusMessage" class="status-message" :class="statusTone">
          {{ statusMessage }}
        </p>
      </div>

      <!-- Visualización del grafo -->
      <div class="graph-card">
        <div class="graph-header">
          <h3>🌐 Visualización del Grafo</h3>
          <div class="graph-pills">
            <span class="pill pill-node">
              <span class="pill-dot node-dot"></span>
              Nodos
            </span>
            <span class="pill pill-edge-path">
              <span class="pill-dot path-dot"></span>
              {{ optimizationType === 'min' ? 'Camino más corto' : 'Camino máximo' }}
            </span>
            <span class="pill pill-edge-normal">
              <span class="pill-dot normal-dot"></span>
              Otras aristas
            </span>
          </div>
        </div>

        <div class="graph-instructions">
          💡 <strong>Instrucciones:</strong>
          <span>Modo Nodo: clic en espacio vacío</span>
          <span>| Modo Arista: clic origen y destino</span>
          <span>| Mover: arrastra nodos o clic para origen</span>
          <span>| ✏️ Doble clic en arista → Editar peso</span>
        </div>

        <div class="graph-container">
          <canvas ref="canvasRef" class="graph-canvas"></canvas>
        </div>

        <!-- Leyenda -->
        <div class="legend">
          <div class="legend-item">
            <div class="legend-color source-color"></div>
            <span>🔴 Nodo Origen</span>
          </div>
          <div class="legend-item">
            <div class="legend-color path-color"></div>
            <span>🟢 Arista del camino</span>
          </div>
          <div class="legend-item">
            <div class="legend-color normal-color"></div>
            <span>⚪ Arista no seleccionada</span>
          </div>
          <div class="legend-item">
            <div class="legend-color node-color"></div>
            <span>🔵 Nodo</span>
          </div>
        </div>
      </div>

      <!-- Panel de resultados -->
      <div class="results-card">
        <div class="config-header">
          <h3>📊 Resultados</h3>
        </div>

        <div class="results-content">
          <!-- Resumen -->
          <div class="result-section-card gradient-card">
            <div class="card-header">
              <div class="card-icon blue-gradient">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 10a8 8 0 1116 0 8 8 0 01-16 0zm8-6a6 6 0 100 12 6 6 0 000-12z"/>
                  <path d="M10 6v4l3 2" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
              </div>
              <div>
                <h4>{{ optimizationType === 'min' ? 'Distancias mínimas' : 'Pesos máximos' }} desde {{ getNodeLabel(sourceNode) }}</h4>
                <p>{{ optimizationType === 'min' ? 'Camino más corto a cada nodo' : 'Camino simple de mayor peso a cada nodo' }}</p>
              </div>
            </div>
            
            <div class="distances-grid">
              <div v-for="(dist, idx) in distances" :key="idx" class="distance-card">
                <span class="distance-node">{{ getNodeLabel(idx) }}</span>
                <span class="distance-arrow">→</span>
                <span class="distance-value" :class="{ 'infinite': dist === Infinity }">
                  {{ dist === Infinity ? '∞' : dist }}
                </span>
              </div>
            </div>
          </div>

          <div class="result-section-card" v-if="targetNode !== null && distances.length > 0">
            <div class="section-header">
              <div class="section-title">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 2a6 6 0 016 6c0 4.5-6 10-6 10S4 12.5 4 8a6 6 0 016-6zm0 8a2 2 0 100-4 2 2 0 000 4z"/>
                </svg>
                <h4>Ruta al destino {{ getNodeLabel(targetNode) }}</h4>
              </div>
            </div>
            <div class="target-route-card">
              <span class="target-route-label">{{ optimizationType === 'min' ? 'Distancia' : 'Peso' }}</span>
              <strong>{{ getTargetDistance() === Infinity ? "No alcanzable" : getTargetDistance() }}</strong>
              <span class="target-route-path">{{ getPathString(targetNode) }}</span>
            </div>
          </div>

          <!-- Tabla de rutas -->
          <div class="result-section-card" v-if="distances.length > 0">
            <div class="section-header">
              <div class="section-title">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
                <h4>📋 Rutas desde {{ getNodeLabel(sourceNode) }}</h4>
              </div>
            </div>
            <div class="table-wrapper">
              <table class="results-table">
                <thead>
                  <tr>
                    <th>Destino</th>
                    <th>{{ optimizationType === 'min' ? 'Distancia' : 'Peso' }}</th>
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
                <h4>📖 Pasos del Algoritmo</h4>
              </div>
              <button @click="toggleSteps" class="toggle-steps-btn">
                {{ showSteps ? "Ocultar" : "Mostrar" }}
              </button>
            </div>

            <div v-if="showSteps" class="steps-container">
              <div v-for="(step, idx) in steps" :key="idx" class="step-item">
                <div class="step-number">{{ idx + 1 }}</div>
                <div class="step-content" v-html="step"></div>
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
                <h3>🎯 ¿Qué es?</h3>
                <p>
                  {{ optimizationType === 'min'
                    ? 'Encuentra el camino más corto desde un nodo origen a todos los demás en un grafo con pesos positivos.'
                    : 'Encuentra caminos simples de mayor peso desde un nodo origen, sin repetir nodos para evitar ciclos infinitos.' }}
                </p>
              </div>
              <div class="help-section">
                <h3>📝 Cómo funciona:</h3>
                <div class="steps-list">
                  <template v-if="optimizationType === 'min'">
                    <div class="step-detail"><div class="step-num">1</div><div class="step-text">Distancia al origen = 0, al resto = infinito</div></div>
                    <div class="step-detail"><div class="step-num">2</div><div class="step-text">Seleccionar nodo no visitado con menor distancia</div></div>
                    <div class="step-detail"><div class="step-num">3</div><div class="step-text">Actualizar distancias a sus vecinos</div></div>
                    <div class="step-detail"><div class="step-num">4</div><div class="step-text">Repetir hasta visitar todos</div></div>
                  </template>
                  <template v-else>
                    <div class="step-detail"><div class="step-num">1</div><div class="step-text">Comenzar en el origen con peso acumulado 0</div></div>
                    <div class="step-detail"><div class="step-num">2</div><div class="step-text">Explorar rutas simples sin repetir nodos</div></div>
                    <div class="step-detail"><div class="step-num">3</div><div class="step-text">Guardar la ruta con mayor peso encontrada para cada destino</div></div>
                    <div class="step-detail"><div class="step-num">4</div><div class="step-text">Resaltar la mejor ruta hacia el destino seleccionado</div></div>
                  </template>
                </div>
              </div>
              <div class="help-note-box">
                <strong>💡 Nota:</strong>
                {{ optimizationType === 'min'
                  ? 'Los pesos deben ser positivos para que Dijkstra funcione correctamente.'
                  : 'Maximizar caminos con ciclos puede crecer indefinidamente; por eso se buscan caminos simples.' }}
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
import { ref, onMounted, onUnmounted, nextTick, watch } from "vue";

// Estado
const nodeCount = ref(6);
const sourceNode = ref(0);
const targetNode = ref(null);
const optimizationType = ref('min');
const isExecuting = ref(false);
const showHelpModal = ref(false);
const showSteps = ref(false);
const statusMessage = ref("");
const statusTone = ref("");
const exportFileName = ref("dijkstra");
const edgeWeight = ref(1);
const editorMode = ref("move");
const edgeStartNode = ref(null);
const editorStatus = ref("Modo mover: arrastra nodos o selecciona el origen.");

// Datos del grafo
const nodes = ref([]);
const edges = ref([]);
const distances = ref([]);
const previous = ref([]);
const routePaths = ref([]);
const pathEdges = ref([]);
const steps = ref([]);
const selectedNode = ref(null);

// Canvas
const canvasRef = ref(null);
const importInputRef = ref(null);
let ctx = null;
let dragging = false;
let dragNode = null;
let canvasWidth = 800;
let canvasHeight = 550;

const nodeLabels = ["A", "B", "C", "D", "E", "F", "G", "H"];

// ============ FUNCIONES DEL GRAFO ============

const getNodeLabel = (id) => {
  const node = nodes.value.find((n) => n.id === id);
  return node ? node.label : `N${id}`;
};

const getPathString = (targetId) => {
  if (targetId === sourceNode.value) return `${getNodeLabel(sourceNode.value)}`;
  if (routePaths.value[targetId]?.length) {
    return routePaths.value[targetId].map((nodeId) => getNodeLabel(nodeId)).join(" → ");
  }
  if (previous.value[targetId] === -1 || previous.value[targetId] === undefined)
    return "No hay ruta";

  const path = [];
  let current = targetId;
  while (current !== -1 && current !== undefined) {
    path.unshift(getNodeLabel(current));
    if (current === sourceNode.value) break;
    current = previous.value[current];
  }
  return path.join(" → ");
};

const getTargetDistance = () => {
  if (targetNode.value === null || distances.value.length === 0) return null;
  return distances.value[targetNode.value];
};

const showMessage = (text, type) => {
  statusMessage.value = text;
  statusTone.value = type;
  setTimeout(() => {
    if (statusMessage.value === text) statusMessage.value = "";
  }, 3000);
};

const setEditorMode = (mode) => {
  editorMode.value = mode;
  edgeStartNode.value = null;
  selectedNode.value = null;
  const statusByMode = {
    move: "Modo mover: arrastra nodos o selecciona el origen.",
    node: "Modo nodo: haz clic en un espacio vacío para crear un nodo.",
    edge: "Modo arista: selecciona el nodo origen y luego el destino.",
    delete: "Modo borrar: haz clic en un nodo o arista para eliminarlo.",
  };
  editorStatus.value = statusByMode[mode];
  drawGraph(true);
};

const resetResults = () => {
  distances.value = [];
  previous.value = [];
  routePaths.value = [];
  pathEdges.value = [];
  steps.value = [];
};

const pathToEdges = (path) => {
  const routeEdges = [];
  if (!path || path.length < 2) return routeEdges;

  for (let i = 1; i < path.length; i++) {
    routeEdges.push({ from: path[i - 1], to: path[i] });
  }
  return routeEdges;
};

const collectPathEdges = (paths) => {
  const routeEdges = [];
  paths.forEach((path) => {
    pathToEdges(path).forEach((edge) => {
      const exists = routeEdges.some(
        (item) =>
          (item.from === edge.from && item.to === edge.to) ||
          (item.from === edge.to && item.to === edge.from),
      );
      if (!exists) routeEdges.push(edge);
    });
  });
  return routeEdges;
};

const buildRoutePathsFromPrevious = (prev, n) => {
  const paths = Array(n).fill(null);
  if (sourceNode.value !== null) {
    paths[sourceNode.value] = [sourceNode.value];
  }

  for (let target = 0; target < n; target++) {
    if (target === sourceNode.value || prev[target] === -1 || prev[target] === undefined) continue;

    const path = [];
    const seen = new Set();
    let current = target;
    while (current !== -1 && current !== undefined && !seen.has(current)) {
      seen.add(current);
      path.unshift(current);
      if (current === sourceNode.value) break;
      current = prev[current];
    }

    if (path[0] === sourceNode.value) {
      paths[target] = path;
    }
  }

  return paths;
};

const buildPathEdgesTo = (targetId, prev = previous.value) => {
  if (routePaths.value[targetId]?.length) {
    return pathToEdges(routePaths.value[targetId]);
  }

  const routeEdges = [];
  if (targetId === null || targetId === sourceNode.value || prev[targetId] === -1 || prev[targetId] === undefined) {
    return routeEdges;
  }

  let current = targetId;
  while (prev[current] !== -1 && prev[current] !== undefined) {
    const from = prev[current];
    const to = current;
    routeEdges.push({ from, to });
    current = from;
    if (current === sourceNode.value) break;
  }
  return routeEdges;
};

const updateTargetPathHighlight = () => {
  if (distances.value.length > 0 && targetNode.value !== null) {
    pathEdges.value = buildPathEdgesTo(targetNode.value);
  }
  drawGraph(true);
};

watch(optimizationType, () => {
  resetResults();
  drawGraph();
});

const getDefaultNodeLabel = () => {
  const nextIndex = nodes.value.length;
  return nodeLabels[nextIndex % nodeLabels.length] + (nextIndex >= nodeLabels.length ? Math.floor(nextIndex / nodeLabels.length) + 1 : "");
};

const syncNodeCount = () => {
  nodeCount.value = nodes.value.length;
};

const addNodeAt = (x, y) => {
  const id = nodes.value.length;
  const label = prompt("Nombre del nodo:", getDefaultNodeLabel());
  if (label === null) return;

  nodes.value.push({
    id,
    label: label.trim() || getDefaultNodeLabel(),
    x,
    y,
  });

  if (sourceNode.value === null) sourceNode.value = id;
  syncNodeCount();
  resetResults();
  drawGraph();
  showMessage("Nodo agregado", "success");
};

const remapGraphAfterNodeDelete = (nodeId) => {
  const remainingNodes = nodes.value.filter((node) => node.id !== nodeId);
  const idMap = new Map();

  remainingNodes.forEach((node, newId) => {
    idMap.set(node.id, newId);
    node.id = newId;
  });

  nodes.value = remainingNodes;
  edges.value = edges.value
    .filter((edge) => edge.from !== nodeId && edge.to !== nodeId)
    .map((edge) => ({
      ...edge,
      from: idMap.get(edge.from),
      to: idMap.get(edge.to),
      id: `${idMap.get(edge.from)}-${idMap.get(edge.to)}`,
    }))
    .filter((edge) => edge.from !== undefined && edge.to !== undefined);

  if (!nodes.value.length) {
    sourceNode.value = null;
    targetNode.value = null;
  } else if (sourceNode.value === nodeId || sourceNode.value === null || sourceNode.value >= nodes.value.length) {
    sourceNode.value = 0;
  } else {
    sourceNode.value = idMap.get(sourceNode.value) ?? 0;
  }

  if (nodes.value.length && targetNode.value !== null && targetNode.value !== nodeId) {
    targetNode.value = idMap.get(targetNode.value) ?? null;
  } else {
    targetNode.value = nodes.value.find((node) => node.id !== sourceNode.value)?.id ?? null;
  }
  selectedNode.value = null;
  syncNodeCount();
  resetResults();
};

const deleteNodeById = (nodeId) => {
  remapGraphAfterNodeDelete(nodeId);
  drawGraph(true);
  showMessage("Nodo eliminado", "neutral");
};

const addEdgeBetween = (from, to) => {
  if (from === to) {
    showMessage("La arista necesita dos nodos distintos", "error");
    return;
  }

  const exists = edges.value.some((edge) =>
    (edge.from === from && edge.to === to) || (edge.from === to && edge.to === from)
  );

  if (exists) {
    showMessage("Esa arista ya existe", "error");
    return;
  }

  const value = prompt(`Peso de la arista ${getNodeLabel(from)} - ${getNodeLabel(to)}:`, edgeWeight.value || 1);
  if (value === null) return;

  const weight = Number(value);
  if (!Number.isFinite(weight) || weight <= 0) {
    showMessage("El peso debe ser mayor a 0", "error");
    return;
  }

  const a = Math.min(from, to);
  const b = Math.max(from, to);
  edges.value.push({ id: `${a}-${b}`, from: a, to: b, weight });
  edgeWeight.value = weight;
  resetResults();
  drawGraph();
  showMessage("Arista agregada", "success");
};

const deleteEdgeById = (edgeId) => {
  edges.value = edges.value.filter((edge) => edge.id !== edgeId);
  resetResults();
  drawGraph(true);
  showMessage("Arista eliminada", "neutral");
};

// Seleccionar origen
const selectSourceNode = (id) => {
  sourceNode.value = id;
  selectedNode.value = id;
  if (targetNode.value === id) {
    targetNode.value = nodes.value.find((node) => node.id !== id)?.id ?? null;
  }
  resetResults();
  drawGraph();
  showMessage(`🎯 Origen cambiado a ${getNodeLabel(id)}`, "success");
};

const selectTargetNode = (id) => {
  if (id === sourceNode.value) {
    showMessage("El destino debe ser diferente al origen", "error");
    return;
  }

  targetNode.value = id;
  updateTargetPathHighlight();
  showMessage(`Destino cambiado a ${getNodeLabel(id)}`, "success");
};

const generateRandomGraph = () => {
  const n = nodeCount.value;
  const newNodes = [];
  const newEdges = [];

  const canvas = canvasRef.value;
  if (canvas) {
    canvasWidth = canvas.clientWidth;
    canvasHeight = canvas.clientHeight;
  }

  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;
  const radius = Math.min(canvasWidth, canvasHeight) * 0.35;

  for (let i = 0; i < n; i++) {
    const angle = (i * 2 * Math.PI) / n - Math.PI / 2;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    newNodes.push({
      id: i,
      label: nodeLabels[i % nodeLabels.length] + (i >= nodeLabels.length ? Math.floor(i / nodeLabels.length) + 1 : ""),
      x, y
    });
  }

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (Math.random() > 0.4) {
        newEdges.push({
          id: `${i}-${j}`,
          from: i,
          to: j,
          weight: Math.floor(Math.random() * 15) + 1,
        });
      }
    }
  }

  nodes.value = newNodes;
  edges.value = newEdges;
  resetResults();

  nextTick(() => {
    resizeCanvas();
    drawGraph();
  });

  showMessage("✅ Grafo aleatorio generado", "success");
};

const loadExample = () => {
  nodeCount.value = 6;

  const canvas = canvasRef.value;
  if (canvas) {
    canvasWidth = canvas.clientWidth;
    canvasHeight = canvas.clientHeight;
  }

  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;
  const radius = Math.min(canvasWidth, canvasHeight) * 0.35;

  nodes.value = [
    { id: 0, label: "A", x: centerX, y: centerY - radius },
    { id: 1, label: "B", x: centerX + radius * 0.866, y: centerY - radius * 0.5 },
    { id: 2, label: "C", x: centerX + radius * 0.866, y: centerY + radius * 0.5 },
    { id: 3, label: "D", x: centerX, y: centerY + radius },
    { id: 4, label: "E", x: centerX - radius * 0.866, y: centerY + radius * 0.5 },
    { id: 5, label: "F", x: centerX - radius * 0.866, y: centerY - radius * 0.5 },
  ];

  edges.value = [
    { id: "0-1", from: 0, to: 1, weight: 4 },
    { id: "0-5", from: 0, to: 5, weight: 5 },
    { id: "1-2", from: 1, to: 2, weight: 2 },
    { id: "1-5", from: 1, to: 5, weight: 6 },
    { id: "1-4", from: 1, to: 4, weight: 3 },
    { id: "2-3", from: 2, to: 3, weight: 7 },
    { id: "2-4", from: 2, to: 4, weight: 8 },
    { id: "3-4", from: 3, to: 4, weight: 4 },
    { id: "4-5", from: 4, to: 5, weight: 5 },
  ];

  sourceNode.value = 0;
  targetNode.value = 3;
  syncNodeCount();
  resetResults();

  nextTick(() => {
    resizeCanvas();
    drawGraph();
  });

  showMessage("✅ Ejemplo cargado", "success");
};

const clearGraph = () => {
  nodes.value = [];
  edges.value = [];
  sourceNode.value = null;
  targetNode.value = null;
  selectedNode.value = null;
  syncNodeCount();
  resetResults();
  drawGraph();
  showMessage("🔄 Grafo reiniciado", "neutral");
};

// ============ ALGORITMO DE DIJKSTRA ============

const runDijkstra = async () => {
  if (nodes.value.length === 0) {
    showMessage("❌ No hay nodos en el grafo", "error");
    return;
  }

  if (sourceNode.value >= nodes.value.length) {
    showMessage("❌ Nodo origen inválido", "error");
    return;
  }

  if (targetNode.value !== null && targetNode.value >= nodes.value.length) {
    targetNode.value = null;
  }

  isExecuting.value = true;
  const stepList = [];
  
  await new Promise((resolve) => setTimeout(resolve, 100));

  const n = nodes.value.length;
  const isMinimizing = optimizationType.value === "min";
  const dist = Array(n).fill(isMinimizing ? Infinity : -Infinity);
  const prev = Array(n).fill(-1);

  const edgesMap = new Map();
  const adjacency = Array.from({ length: n }, () => []);
  edges.value.forEach((edge) => {
    edgesMap.set(`${edge.from}-${edge.to}`, edge.weight);
    edgesMap.set(`${edge.to}-${edge.from}`, edge.weight);
    adjacency[edge.from]?.push({ to: edge.to, weight: edge.weight });
    adjacency[edge.to]?.push({ to: edge.from, weight: edge.weight });
  });

  dist[sourceNode.value] = 0;
  routePaths.value = [];
  pathEdges.value = [];
  previous.value = [...prev];
  distances.value = [...dist];

  if (!isMinimizing) {
    const bestPaths = Array(n).fill(null);
    bestPaths[sourceNode.value] = [sourceNode.value];
    stepList.push(`🎯 <strong>INICIO:</strong> Peso acumulado en <strong>${getNodeLabel(sourceNode.value)}</strong> = 0. Se buscarán caminos simples máximos.`);
    steps.value = [...stepList];

    const visited = Array(n).fill(false);
    const dfs = async (u, currentWeight, path) => {
      visited[u] = true;

      for (const edge of adjacency[u]) {
        const v = edge.to;
        if (visited[v]) continue;

        const newWeight = currentWeight + edge.weight;
        const newPath = [...path, v];
        if (newWeight > dist[v]) {
          const oldStr = dist[v] === -Infinity ? "-∞" : dist[v];
          dist[v] = newWeight;
          prev[v] = u;
          bestPaths[v] = newPath;
          stepList.push(`  ↳ <strong>Mejorando ${getNodeLabel(v)}:</strong> ${oldStr} → ${newWeight} (ruta ${newPath.map((nodeId) => getNodeLabel(nodeId)).join(" → ")})`);
          distances.value = [...dist];
          previous.value = [...prev];
          routePaths.value = [...bestPaths];
          pathEdges.value = targetNode.value !== null ? buildPathEdgesTo(targetNode.value) : collectPathEdges(bestPaths);
          steps.value = [...stepList];
          drawGraph(true);
          await new Promise((resolve) => setTimeout(resolve, 180));
        }

        await dfs(v, newWeight, newPath);
      }

      visited[u] = false;
    };

    await dfs(sourceNode.value, 0, [sourceNode.value]);

    routePaths.value = bestPaths;
    distances.value = dist.map((value) => (value === -Infinity ? Infinity : value));
    previous.value = [...prev];
    pathEdges.value = targetNode.value !== null ? buildPathEdgesTo(targetNode.value) : collectPathEdges(bestPaths);

    const reached = distances.value.filter((d) => d !== Infinity && d !== 0).length;
    if (targetNode.value !== null) {
      const targetDistance = distances.value[targetNode.value];
      const targetResult = targetDistance === Infinity
        ? `No hay ruta hasta ${getNodeLabel(targetNode.value)}`
        : `Ruta máxima a ${getNodeLabel(targetNode.value)} con peso ${targetDistance}: ${getPathString(targetNode.value)}`;
      stepList.push(`✅ <strong>DESTINO:</strong> ${targetResult}`);
    }
    stepList.push(`✅ <strong>FINALIZADO!</strong> Se encontraron rutas máximas a ${reached} nodos desde ${getNodeLabel(sourceNode.value)}`);
    steps.value = [...stepList];

    drawGraph(true);
    showMessage(`✅ Dijkstra máximo completado. ${reached} nodos alcanzables`, "success");
    isExecuting.value = false;
    return;
  }

  const visited = Array(n).fill(false);
  stepList.push(`🎯 <strong>INICIO:</strong> Distancia a <strong>${getNodeLabel(sourceNode.value)}</strong> = 0, a los demás = ∞`);
  steps.value = [...stepList];

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
      stepList.push(`📍 <strong>Paso ${count + 1}:</strong> Seleccionamos <strong>${getNodeLabel(u)}</strong> (distancia = ${dist[u]})`);
    } else {
      stepList.push(`📍 <strong>Paso ${count + 1}:</strong> Comenzamos desde el origen <strong>${getNodeLabel(u)}</strong>`);
    }

    let updatedCount = 0;
    for (let v = 0; v < n; v++) {
      const weight = edgesMap.get(`${u}-${v}`);
      if (weight && !visited[v]) {
        const newDist = dist[u] + weight;
        if (newDist < dist[v]) {
          const oldStr = dist[v] === Infinity ? "∞" : dist[v];
          dist[v] = newDist;
          prev[v] = u;
          stepList.push(`  ↳ <strong>Actualizando ${getNodeLabel(v)}:</strong> ${oldStr} → ${newDist} (vía ${getNodeLabel(u)})`);
          updatedCount++;
        }
      }
    }
    
    if (updatedCount === 0 && u !== sourceNode.value) {
      stepList.push(`  ℹ️ No se actualizaron distancias desde ${getNodeLabel(u)}`);
    }

    distances.value = [...dist];
    previous.value = [...prev];
    steps.value = [...stepList];
    drawGraph(true);
    await new Promise((resolve) => setTimeout(resolve, 300));
  }

  // Reconstruir caminos
  const newPathEdges = [];
  for (let i = 0; i < n; i++) {
    if (i !== sourceNode.value && prev[i] !== -1) {
      let current = i;
      while (prev[current] !== -1) {
        const from = prev[current];
        const to = current;
        if (!newPathEdges.some((e) => e.from === from && e.to === to)) {
          newPathEdges.push({ from, to });
        }
        current = prev[current];
        if (current === sourceNode.value) break;
      }
    }
  }

  pathEdges.value = targetNode.value !== null ? buildPathEdgesTo(targetNode.value, prev) : newPathEdges;
  routePaths.value = buildRoutePathsFromPrevious(prev, n);
  
  const reached = dist.filter((d) => d !== Infinity && d !== 0).length;
  if (targetNode.value !== null) {
    const targetDistance = dist[targetNode.value];
    const targetResult = targetDistance === Infinity
      ? `No hay ruta hasta ${getNodeLabel(targetNode.value)}`
      : `Ruta a ${getNodeLabel(targetNode.value)} con distancia ${targetDistance}: ${getPathString(targetNode.value)}`;
    stepList.push(`âœ… <strong>DESTINO:</strong> ${targetResult}`);
  }
  stepList.push(`✅ <strong>FINALIZADO!</strong> Se encontraron rutas a ${reached} nodos desde ${getNodeLabel(sourceNode.value)}`);
  steps.value = [...stepList];
  
  drawGraph(true);
  showMessage(`✅ Dijkstra completado. ${reached} nodos alcanzables`, "success");
  isExecuting.value = false;
};

// ============ DIBUJO DEL GRAFO ============

const drawGraph = (highlightPaths = false) => {
  if (!canvasRef.value) return;

  const canvas = canvasRef.value;
  ctx = canvas.getContext("2d");

  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
  canvasWidth = canvas.width;
  canvasHeight = canvas.height;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Dibujar fondo con grid
  ctx.strokeStyle = "#e2e8f0";
  ctx.lineWidth = 0.5;
  for (let x = 0; x < canvas.width; x += 30) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y < canvas.height; y += 30) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  // Dibujar aristas
  edges.value.forEach((edge) => {
    const fromNode = nodes.value.find((n) => n.id === edge.from);
    const toNode = nodes.value.find((n) => n.id === edge.to);

    if (!fromNode || !toNode) return;

    const isPath = highlightPaths && pathEdges.value.some((p) => 
      (p.from === edge.from && p.to === edge.to) || (p.from === edge.to && p.to === edge.from)
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
      ctx.setLineDash([8, 6]);
    }

    ctx.stroke();
    ctx.setLineDash([]);

    // Peso
    const midX = (fromNode.x + toNode.x) / 2;
    const midY = (fromNode.y + toNode.y) / 2;
    const angle = Math.atan2(toNode.y - fromNode.y, toNode.x - fromNode.x);
    const offsetX = Math.sin(angle) * 12;
    const offsetY = -Math.cos(angle) * 12;

    ctx.fillStyle = "white";
    ctx.fillRect(midX + offsetX - 15, midY + offsetY - 10, 30, 20);
    ctx.fillStyle = isPath ? "#10b981" : "#475569";
    ctx.font = "bold 14px 'Segoe UI'";
    ctx.fillText(edge.weight, midX + offsetX, midY + offsetY + 4);
  });

  // Dibujar nodos
  nodes.value.forEach((node) => {
    ctx.beginPath();
    ctx.arc(node.x, node.y, 28, 0, 2 * Math.PI);

    if (node.id === sourceNode.value) {
      ctx.fillStyle = "#ef4444";
      ctx.shadowColor = "rgba(239, 68, 68, 0.5)";
    } else if (node.id === targetNode.value) {
      ctx.fillStyle = "#8b5cf6";
      ctx.shadowColor = "rgba(139, 92, 246, 0.45)";
    } else if (node.id === edgeStartNode.value || node.id === selectedNode.value) {
      ctx.fillStyle = "#f59e0b";
      ctx.shadowColor = "rgba(245, 158, 11, 0.5)";
    } else {
      ctx.fillStyle = "#3b82f6";
      ctx.shadowColor = "rgba(59, 130, 246, 0.3)";
    }
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.strokeStyle = "white";
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = "white";
    ctx.font = "bold 18px 'Segoe UI'";
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
    y: (e.clientY - rect.top) * scaleY,
  };
};

const findNodeAt = (x, y) => {
  for (const node of nodes.value) {
    const dx = node.x - x;
    const dy = node.y - y;
    if (Math.sqrt(dx * dx + dy * dy) < 28) {
      return node;
    }
  }
  return null;
};

const findEdgeAt = (x, y) => {
  for (const edge of edges.value) {
    const fromNode = nodes.value.find((n) => n.id === edge.from);
    const toNode = nodes.value.find((n) => n.id === edge.to);
    if (!fromNode || !toNode) continue;

    const midX = (fromNode.x + toNode.x) / 2;
    const midY = (fromNode.y + toNode.y) / 2;
    const dx = midX - x;
    const dy = midY - y;
    if (Math.sqrt(dx * dx + dy * dy) < 25) return edge;
  }
  return null;
};

const handleCanvasClick = (e) => {
  const pos = getMousePos(e);
  const node = findNodeAt(pos.x, pos.y);

  if (editorMode.value === "node") {
    if (!node) addNodeAt(pos.x, pos.y);
    return;
  }

  if (editorMode.value === "edge") {
    if (!node) return;
    if (edgeStartNode.value === null) {
      edgeStartNode.value = node.id;
      editorStatus.value = `Origen ${node.label} seleccionado. Ahora elige destino.`;
      drawGraph(true);
    } else {
      addEdgeBetween(edgeStartNode.value, node.id);
      edgeStartNode.value = null;
      editorStatus.value = "Modo arista: selecciona el nodo origen y luego el destino.";
    }
    return;
  }

  if (editorMode.value === "delete") {
    if (node) {
      deleteNodeById(node.id);
      return;
    }
    const edge = findEdgeAt(pos.x, pos.y);
    if (edge) deleteEdgeById(edge.id);
    return;
  }

  if (node) {
    selectSourceNode(node.id);
  }
};

const handleMouseDown = (e) => {
  const pos = getMousePos(e);
  const node = findNodeAt(pos.x, pos.y);

  if (node && editorMode.value === "move") {
    dragging = true;
    dragNode = node;
    e.preventDefault();
  }
};

const handleMouseMove = (e) => {
  if (dragging && dragNode) {
    const pos = getMousePos(e);
    dragNode.x = Math.max(30, Math.min(canvasRef.value.width - 30, pos.x));
    dragNode.y = Math.max(30, Math.min(canvasRef.value.height - 30, pos.y));
    drawGraph(true);
  }
};

const handleMouseUp = () => {
  dragging = false;
  dragNode = null;
};

const handleDoubleClick = (e) => {
  const pos = getMousePos(e);

  for (const edge of edges.value) {
    const fromNode = nodes.value.find((n) => n.id === edge.from);
    const toNode = nodes.value.find((n) => n.id === edge.to);
    if (fromNode && toNode) {
      const midX = (fromNode.x + toNode.x) / 2;
      const midY = (fromNode.y + toNode.y) / 2;
      const dx = midX - pos.x;
      const dy = midY - pos.y;
      if (Math.sqrt(dx * dx + dy * dy) < 25) {
        const newWeight = prompt(
          `✏️ Editar peso de la arista ${getNodeLabel(edge.from)} → ${getNodeLabel(edge.to)}:`,
          edge.weight,
        );
        if (newWeight && !isNaN(newWeight) && parseInt(newWeight) > 0) {
          edge.weight = parseInt(newWeight);
          drawGraph(true);
          showMessage(`✏️ Peso actualizado a ${newWeight}`, "success");
        }
        break;
      }
    }
  }
};

const handleKeyDown = (e) => {
  if (e.key === "v" || e.key === "V") setEditorMode("move");
  if (e.key === "n" || e.key === "N") setEditorMode("node");
  if (e.key === "e" || e.key === "E") setEditorMode("edge");
  if (e.key === "d" || e.key === "D") setEditorMode("delete");
  if (e.key === "Delete" && selectedNode.value !== null) {
    deleteNodeById(selectedNode.value);
  }
};

// Acciones
const triggerImport = () => importInputRef.value?.click();
const toggleSteps = () => { showSteps.value = !showSteps.value; };
const closeHelpModal = () => { showHelpModal.value = false; };
const decrementNodes = () => {
  if (nodes.value.length > 0) deleteNodeById(nodes.value[nodes.value.length - 1].id);
};
const incrementNodes = () => {
  const canvas = canvasRef.value;
  const width = canvas?.clientWidth || canvasWidth;
  const height = canvas?.clientHeight || canvasHeight;
  addNodeAt(width / 2, height / 2);
};

// Exportar/Importar
const exportData = () => {
  if (nodes.value.length === 0) {
    showMessage("No hay datos para exportar", "error");
    return;
  }

  const payload = {
    nodes: nodes.value,
    edges: edges.value,
    sourceNode: sourceNode.value,
    targetNode: targetNode.value,
    optimizationType: optimizationType.value,
    exportDate: new Date().toISOString(),
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  const fileName = exportFileName.value.trim() || "dijkstra";
  link.download = `${fileName}.json`;
  link.click();
  URL.revokeObjectURL(url);
  showMessage(`📁 Grafo exportado como ${fileName}.json`, "success");
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
        edges.value = data.edges;
        if (data.optimizationType === "min" || data.optimizationType === "max") {
          optimizationType.value = data.optimizationType;
        }
        syncNodeCount();
        if (data.sourceNode !== undefined && data.sourceNode < nodes.value.length) {
          sourceNode.value = data.sourceNode;
        } else {
          sourceNode.value = nodes.value.length > 0 ? 0 : null;
        }
        if (
          data.targetNode !== undefined &&
          data.targetNode < nodes.value.length &&
          data.targetNode !== sourceNode.value
        ) {
          targetNode.value = data.targetNode;
        } else {
          targetNode.value = nodes.value.find((node) => node.id !== sourceNode.value)?.id ?? null;
        }
        resetResults();
        nextTick(() => {
          resizeCanvas();
          drawGraph();
        });
        showMessage("✅ Grafo importado exitosamente", "success");
      } else {
        throw new Error("Formato inválido");
      }
    } catch (error) {
      showMessage("❌ Error al importar archivo", "error");
    }
  };
  reader.readAsText(file);
  event.target.value = "";
};

const resizeCanvas = () => {
  if (canvasRef.value) {
    const rect = canvasRef.value.parentElement;
    if (rect) {
      canvasRef.value.width = rect.clientWidth - 40;
      canvasRef.value.height = 550;
    }
    drawGraph(true);
  }
};

// Inicializar
onMounted(() => {
  loadExample();
  window.addEventListener("resize", resizeCanvas);
  window.addEventListener("keydown", handleKeyDown);
  setTimeout(() => {
    resizeCanvas();
  }, 100);

  if (canvasRef.value) {
    canvasRef.value.addEventListener("mousedown", handleMouseDown);
    canvasRef.value.addEventListener("mousemove", handleMouseMove);
    canvasRef.value.addEventListener("mouseup", handleMouseUp);
    canvasRef.value.addEventListener("dblclick", handleDoubleClick);
    canvasRef.value.addEventListener("click", handleCanvasClick);
  }
});

onUnmounted(() => {
  if (canvasRef.value) {
    canvasRef.value.removeEventListener("mousedown", handleMouseDown);
    canvasRef.value.removeEventListener("mousemove", handleMouseMove);
    canvasRef.value.removeEventListener("mouseup", handleMouseUp);
    canvasRef.value.removeEventListener("dblclick", handleDoubleClick);
    canvasRef.value.removeEventListener("click", handleCanvasClick);
  }
  window.removeEventListener("resize", resizeCanvas);
  window.removeEventListener("keydown", handleKeyDown);
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

.main-layout {
  display: grid;
  grid-template-columns: 320px 1fr 360px;
  gap: 24px;
}

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

.optimization-toggle {
  display: flex;
  gap: 12px;
}

.toggle-btn {
  flex: 1;
  padding: 10px;
  border: 2px solid #e0e0e0;
  background: white;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
}

.toggle-btn.active {
  border-color: #667eea;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.action-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.graph-tools {
  padding: 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
}

.graph-tools h4 {
  margin: 0 0 10px;
  font-size: 0.9rem;
  color: #334155;
}

.tool-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.tool-btn {
  padding: 9px 10px;
  border: 1px solid #cbd5e1;
  background: white;
  color: #475569;
  border-radius: 10px;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 600;
}

.tool-btn:hover,
.tool-btn.active {
  border-color: #667eea;
  background: #eef2ff;
  color: #4f46e5;
}

.tool-btn.danger:hover,
.tool-btn.danger.active {
  border-color: #ef4444;
  background: #fef2f2;
  color: #dc2626;
}

.tool-status {
  margin: 10px 0 0;
  color: #64748b;
  font-size: 0.75rem;
  line-height: 1.35;
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

.btn-outline.danger:hover {
  border-color: #ef4444;
  background: #fef2f2;
  color: #ef4444;
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
  background: #ef4444;
  color: white;
  padding: 2px 10px;
  border-radius: 20px;
  display: inline-block;
}

.target-badge {
  background: #8b5cf6;
  color: white;
  padding: 2px 10px;
  border-radius: 20px;
  display: inline-block;
}

.origen-selector label {
  display: block;
  font-size: 0.8rem;
  margin-bottom: 8px;
  color: #666;
}

.origen-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  max-height: 120px;
  overflow-y: auto;
}

.origen-btn {
  width: 45px;
  padding: 6px;
  border: 2px solid #e0e0e0;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
}

.origen-btn.active {
  background: #ef4444;
  border-color: #ef4444;
  color: white;
}

.origen-btn.target-btn.active {
  background: #8b5cf6;
  border-color: #8b5cf6;
  color: white;
}

.origen-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
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

.graph-card {
  background: white;
  border-radius: 24px;
  padding: 24px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  min-height: 650px;
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
  font-size: 1.1rem;
}

.graph-pills {
  display: flex;
  gap: 8px;
}

.pill {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  background: #f8f9fa;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 500;
}

.pill-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.node-dot { background: #3b82f6; }
.path-dot { background: #10b981; }
.normal-dot { background: #94a3b8; }

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

.graph-container {
  position: relative;
  min-height: 550px;
  background: linear-gradient(180deg, #fafcff 0%, #f0f4ff 100%);
  border-radius: 20px;
  border: 2px solid rgba(59, 130, 246, 0.2);
  overflow: hidden;
}

.graph-canvas {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 550px;
  cursor: grab;
  background: #ffffff;
}

.graph-canvas:active {
  cursor: grabbing;
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
  font-size: 0.75rem;
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
.target-color {
  background: #8b5cf6;
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

.distances-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 10px;
}

.distance-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
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

.target-route-card {
  display: grid;
  grid-template-columns: auto auto;
  gap: 8px 12px;
  align-items: center;
  padding: 12px;
  background: white;
  border: 1px solid #e9d5ff;
  border-radius: 12px;
}

.target-route-label {
  color: #64748b;
  font-size: 0.75rem;
}

.target-route-card strong {
  color: #8b5cf6;
  font-size: 1.1rem;
  text-align: right;
}

.target-route-path {
  grid-column: 1 / -1;
  color: #059669;
  font-family: monospace;
  font-size: 0.78rem;
  overflow-wrap: anywhere;
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

.dist-cell.infinite-cell {
  color: #ef4444;
}

.path-cell {
  font-family: monospace;
  font-size: 0.75rem;
  color: #059669;
}

.steps-container {
  max-height: 200px;
  overflow-y: auto;
}

.step-item {
  display: flex;
  gap: 10px;
  padding: 8px;
  border-bottom: 1px solid #e0e0e0;
}

.step-number {
  width: 24px;
  height: 24px;
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
  font-size: 0.75rem;
  color: #555;
  line-height: 1.4;
}

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
    grid-template-columns: 280px 1fr 340px;
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
  .graph-container {
    min-height: 400px;
  }
  .graph-canvas {
    height: 400px;
  }
  .graph-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>


