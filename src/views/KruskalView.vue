<template>
  <div class="kruskal-page">
    <!-- Header -->
    <div class="hero-section">
      <div class="hero-content">
        <h1>Algoritmo de Kruskal</h1>
        <p>
          Árbol de {{ optimizationType === 'min' ? 'Mínima' : 'Máxima' }} Expansión - Encuentra la conexión más 
          {{ optimizationType === 'min' ? 'económica' : 'beneficiosa' }} entre todos los departamentos
        </p>
      </div>
      <div class="algorithm-badge" :class="optimizationType === 'min' ? 'badge-min' : 'badge-max'">
        {{ optimizationType === 'min' ? '🌳 Árbol Mínimo' : '🌲 Árbol Máximo' }}
      </div>
    </div>

    <div class="main-layout">
      <!-- Panel de configuración -->
      <div class="config-card">
        <div class="config-header">
          <h3>⚙️ Configuración</h3>
        </div>

        <div class="config-group">
          <div class="dimension-item full-width">
            <label>📊 Número de departamentos</label>
            <div class="number-control">
              <button @click="decrementNodes" class="num-btn">−</button>
              <span class="num-value">{{ nodeCount }}</span>
              <button @click="incrementNodes" class="num-btn">+</button>
            </div>
          </div>

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
            <button @click="loadBoliviaGraph" class="btn-outline">🇧🇴 Cargar Bolivia</button>
            <button @click="resetGraph" class="btn-outline danger">
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
              <strong>🔵 Departamentos:</strong> {{ nodes.length }}
            </div>
            <div class="info-status">
              <strong>🔗 Rutas:</strong> {{ edgesList.length }}
            </div>
            <div class="info-status">
              <strong>🎯 Objetivo:</strong> {{ optimizationType === 'min' ? 'Minimizar recursos totales' : 'Maximizar recursos totales' }}
            </div>
          </div>

          <button
            @click="runKruskal"
            class="btn-execute"
            :disabled="isExecuting"
          >
            <span class="execute-icon">▶</span>
            {{ isExecuting ? "Calculando..." : `Ejecutar Kruskal (${optimizationType === 'min' ? 'Mínimo' : 'Máximo'})` }}
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
          <h3>🌐 Mapa de Bolivia - Recursos</h3>
          <div class="graph-pills">
            <span class="pill pill-node">
              <span class="pill-dot node-dot"></span>
              Departamentos
            </span>
            <span class="pill pill-edge-mst">
              <span class="pill-dot mst-dot"></span>
              Rutas del {{ optimizationType === 'min' ? 'MST' : 'Árbol Máximo' }}
            </span>
            <span class="pill pill-edge-normal">
              <span class="pill-dot normal-dot"></span>
              Rutas no seleccionadas
            </span>
          </div>
        </div>

        <div class="graph-instructions">
          💡 <strong>Instrucciones:</strong>
          <span>Modo Nodo: clic en espacio vacío</span>
          <span>| Modo Arista: clic origen y destino</span>
          <span>| Mover: arrastra nodos</span>
          <span>✏️ Doble clic en arista → Editar peso</span>
        </div>

        <div class="graph-container">
          <canvas ref="canvasRef" class="graph-canvas"></canvas>
        </div>

        <!-- Leyenda -->
        <div class="legend">
          <div class="legend-item">
            <div class="legend-color mst-color"></div>
            <span>{{ optimizationType === 'min' ? '🟢 Ruta del MST' : '🟠 Ruta del Árbol Máximo' }}</span>
          </div>
          <div class="legend-item">
            <div class="legend-color normal-color"></div>
            <span>⚪ Ruta no seleccionada</span>
          </div>
          <div class="legend-item">
            <div class="legend-color node-color"></div>
            <span>🔵 Gobernación</span>
          </div>
          <div class="legend-item">
            <div class="legend-color selected-color"></div>
            <span>🟡 Nodo seleccionado</span>
          </div>
        </div>
      </div>

      <!-- Panel de resultados -->
      <div class="results-card">
        <div class="config-header">
          <h3>📊 Resultados</h3>
        </div>

        <div class="results-content">
          <!-- Tarjeta de peso total -->
          <div class="result-section-card gradient-card">
            <div class="card-header">
              <div class="card-icon" :class="optimizationType === 'min' ? 'blue-gradient' : 'orange-gradient'">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path
                    d="M2 10a8 8 0 1116 0 8 8 0 01-16 0zm8-6a6 6 0 100 12 6 6 0 000-12z"
                  />
                  <path
                    d="M10 6v4l3 2"
                    stroke="white"
                    stroke-width="1.5"
                    stroke-linecap="round"
                  />
                </svg>
              </div>
              <div>
                <h4>Recursos Totales del {{ optimizationType === 'min' ? 'MST' : 'Árbol Máximo' }}</h4>
                <p>{{ optimizationType === 'min' ? 'Suma de rutas seleccionadas (mínima posible)' : 'Suma de rutas seleccionadas (máxima posible)' }}</p>
              </div>
            </div>
            <div class="total-value-card" :class="optimizationType === 'min' ? 'value-min' : 'value-max'">
              <span class="value-number">{{ totalWeight }}</span>
            </div>
          </div>

          <!-- Lista de aristas seleccionadas -->
          <div class="result-section-card">
            <div class="section-header">
              <div class="section-title">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clip-rule="evenodd"
                  />
                </svg>
                <h4>{{ optimizationType === 'min' ? '🌲 Árbol de Expansión Mínima' : '🌳 Árbol de Expansión Máxima' }}</h4>
              </div>
              <span class="stat-badge">{{ selectedEdges.length }} rutas</span>
            </div>

            <div class="edges-list">
              <div v-for="(edge, idx) in selectedEdges" :key="idx" class="edge-item">
                <span class="edge-nodes"
                  >{{ getNodeLabel(edge.from) }} →
                  {{ getNodeLabel(edge.to) }}</span
                >
                <span class="edge-weight">{{ edge.weight }} recursos</span>
              </div>
              <div v-if="selectedEdges.length === 0" class="empty-state">
                Ejecuta el algoritmo para ver el resultado
              </div>
            </div>
          </div>

          <!-- Pasos del algoritmo -->
          <div class="result-section-card" v-if="steps.length > 0">
            <div class="section-header">
              <div class="section-title">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path
                    fill-rule="evenodd"
                    d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5z"
                    clip-rule="evenodd"
                  />
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
      <div
        v-if="showHelpModal"
        class="modal-overlay"
        @click.self="closeHelpModal"
      >
        <div class="help-modal">
          <div class="modal-header">
            <h2>📖 Guía del Algoritmo de Kruskal</h2>
            <button class="close-modal" @click="closeHelpModal">✕</button>
          </div>
          <div class="modal-body">
            <div class="help-content-detailed">
              <div class="help-section">
                <h3>🎯 ¿Qué es?</h3>
                <p>
                  Algoritmo greedy que encuentra el Árbol de Expansión 
                  <strong>{{ optimizationType === 'min' ? 'Mínima (MST)' : 'Máxima' }}</strong> 
                  de un grafo conexo ponderado.
                </p>
              </div>
              <div class="help-section">
                <h3>📝 Cómo funciona:</h3>
                <div class="steps-list">
                  <div class="step-detail">
                    <div class="step-num">1</div>
                    <div class="step-text">
                      Ordenar aristas por peso de 
                      <strong>{{ optimizationType === 'min' ? 'menor a mayor' : 'mayor a menor' }}</strong>
                    </div>
                  </div>
                  <div class="step-detail">
                    <div class="step-num">2</div>
                    <div class="step-text">
                      Inicializar: cada nodo en su propio conjunto
                    </div>
                  </div>
                  <div class="step-detail">
                    <div class="step-num">3</div>
                    <div class="step-text">
                      Seleccionar arista con peso más 
                      <strong>{{ optimizationType === 'min' ? 'pequeño' : 'grande' }}</strong>
                    </div>
                  </div>
                  <div class="step-detail">
                    <div class="step-num">4</div>
                    <div class="step-text">
                      Si no forma ciclo, agregar al árbol
                    </div>
                  </div>
                  <div class="step-detail">
                    <div class="step-num">5</div>
                    <div class="step-text">Repetir hasta tener N-1 aristas</div>
                  </div>
                </div>
              </div>
              <div class="help-section">
                <h3>🧭 Uso en esta pantalla:</h3>
                <ul>
                  <li>Elige <strong>Minimizar</strong> para obtener el árbol de expansión mínima.</li>
                  <li>Elige <strong>Maximizar</strong> para obtener el árbol de expansión máxima.</li>
                  <li>Usa las herramientas de nodo y arista para dibujar el grafo.</li>
                  <li>Haz doble clic sobre una arista para cambiar su peso.</li>
                </ul>
              </div>
              <div class="help-note-box">
                <strong>💡 Nota:</strong> 
                {{ optimizationType === 'min' 
                  ? 'El MST minimiza el peso total de las conexiones. El grafo debe ser conexo para formar un árbol completo.' 
                  : 'El árbol máximo maximiza el peso total de las conexiones. El grafo debe ser conexo para formar un árbol completo.' }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <input
      ref="importInputRef"
      type="file"
      accept=".json"
      class="hidden-input"
      @change="importData"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from "vue";

// Estado
const nodeCount = ref(9);
const optimizationType = ref('min');
const isExecuting = ref(false);
const showHelpModal = ref(false);
const showSteps = ref(false);
const statusMessage = ref("");
const statusTone = ref("");
const exportFileName = ref("kruskal_bolivia");
const edgeWeight = ref(1);
const editorMode = ref("move");
const edgeStartNode = ref(null);
const editorStatus = ref("Modo mover: arrastra nodos para reubicarlos.");

// Datos del grafo
const nodes = ref([]);
const edgesList = ref([]);
const selectedEdges = ref([]);
const totalWeight = ref(0);
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

// Departamentos de Bolivia
const departamentos = [
  "La Paz", "Santa Cruz", "Cochabamba", "Potosí", 
  "Sucre", "Tarija", "Beni", "Pando", "Oruro"
];

// ============ FUNCIONES DEL GRAFO ============

const getNodeLabel = (id) => {
  const node = nodes.value.find((n) => n.id === id);
  return node ? node.label : `N${id}`;
};

const showMessage = (text, type) => {
  statusMessage.value = text;
  statusTone.value = type;
  setTimeout(() => {
    if (statusMessage.value === text) statusMessage.value = "";
  }, 2500);
};

const setEditorMode = (mode) => {
  editorMode.value = mode;
  edgeStartNode.value = null;
  selectedNode.value = null;
  const statusByMode = {
    move: "Modo mover: arrastra nodos para reubicarlos.",
    node: "Modo nodo: haz clic en un espacio vacío para crear un nodo.",
    edge: "Modo arista: selecciona el nodo origen y luego el destino.",
    delete: "Modo borrar: haz clic en un nodo o arista para eliminarlo.",
  };
  editorStatus.value = statusByMode[mode];
  drawGraph(true);
};

const resetResults = () => {
  selectedEdges.value = [];
  totalWeight.value = 0;
  steps.value = [];
};

const syncNodeCount = () => {
  nodeCount.value = nodes.value.length;
};

const getDefaultNodeLabel = () => {
  const nextIndex = nodes.value.length;
  return departamentos[nextIndex % departamentos.length] + (nextIndex >= departamentos.length ? Math.floor(nextIndex / departamentos.length) + 1 : "");
};

const addNodeAt = (x, y) => {
  const id = nodes.value.length;
  const label = prompt("Nombre del departamento:", getDefaultNodeLabel());
  if (label === null) return;

  nodes.value.push({
    id,
    label: label.trim() || getDefaultNodeLabel(),
    x,
    y,
  });

  syncNodeCount();
  resetResults();
  drawGraph();
  showMessage("Departamento agregado", "success");
};

const remapGraphAfterNodeDelete = (nodeId) => {
  const remainingNodes = nodes.value.filter((node) => node.id !== nodeId);
  const idMap = new Map();

  remainingNodes.forEach((node, newId) => {
    idMap.set(node.id, newId);
    node.id = newId;
  });

  nodes.value = remainingNodes;
  edgesList.value = edgesList.value
    .filter((edge) => edge.from !== nodeId && edge.to !== nodeId)
    .map((edge) => ({
      ...edge,
      from: idMap.get(edge.from),
      to: idMap.get(edge.to),
      id: `${idMap.get(edge.from)}-${idMap.get(edge.to)}`,
    }))
    .filter((edge) => edge.from !== undefined && edge.to !== undefined);

  selectedNode.value = null;
  syncNodeCount();
  resetResults();
};

const deleteNodeById = (nodeId) => {
  remapGraphAfterNodeDelete(nodeId);
  drawGraph(true);
  showMessage("Departamento eliminado", "neutral");
};

const addEdgeBetween = (from, to) => {
  if (from === to) {
    showMessage("La arista necesita dos departamentos distintos", "error");
    return;
  }

  const exists = edgesList.value.some((edge) =>
    (edge.from === from && edge.to === to) || (edge.from === to && edge.to === from)
  );

  if (exists) {
    showMessage("Esa ruta ya existe", "error");
    return;
  }

  const value = prompt(`Recursos de la ruta ${getNodeLabel(from)} - ${getNodeLabel(to)}:`, edgeWeight.value || 1);
  if (value === null) return;

  const weight = Number(value);
  if (!Number.isFinite(weight) || weight <= 0) {
    showMessage("Los recursos deben ser mayor a 0", "error");
    return;
  }

  const a = Math.min(from, to);
  const b = Math.max(from, to);
  edgesList.value.push({ id: `${a}-${b}`, from: a, to: b, weight });
  edgeWeight.value = weight;
  resetResults();
  drawGraph();
  showMessage("Ruta agregada", "success");
};

const deleteEdgeById = (edgeId) => {
  edgesList.value = edgesList.value.filter((edge) => edge.id !== edgeId);
  resetResults();
  drawGraph(true);
  showMessage("Ruta eliminada", "neutral");
};

const loadBoliviaGraph = () => {
  const canvas = canvasRef.value;
  if (canvas) {
    canvasWidth = canvas.clientWidth;
    canvasHeight = canvas.clientHeight;
  }

  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;
  const radius = Math.min(canvasWidth, canvasHeight) * 0.4;

  // Posiciones de los departamentos
  const positions = [
    { x: centerX - radius * 0.6, y: centerY - radius * 0.5 }, // La Paz
    { x: centerX + radius * 0.8, y: centerY + radius * 0.1 }, // Santa Cruz
    { x: centerX, y: centerY - radius * 0.3 }, // Cochabamba
    { x: centerX - radius * 0.2, y: centerY + radius * 0.5 }, // Potosí
    { x: centerX - radius * 0.1, y: centerY + radius * 0.1 }, // Sucre
    { x: centerX + radius * 0.2, y: centerY + radius * 0.7 }, // Tarija
    { x: centerX - radius * 0.7, y: centerY - radius * 0.8 }, // Beni
    { x: centerX - radius * 0.9, y: centerY - radius * 0.9 }, // Pando
    { x: centerX - radius * 0.3, y: centerY + radius * 0.2 }, // Oruro
  ];

  nodes.value = departamentos.map((nombre, i) => ({
    id: i,
    label: nombre,
    x: positions[i].x,
    y: positions[i].y,
  }));

  // Aristas con recursos (pesos simulados)
  edgesList.value = [
    { id: "0-1", from: 0, to: 1, weight: 45 },
    { id: "0-2", from: 0, to: 2, weight: 25 },
    { id: "0-6", from: 0, to: 6, weight: 30 },
    { id: "0-7", from: 0, to: 7, weight: 35 },
    { id: "0-8", from: 0, to: 8, weight: 15 },
    { id: "1-2", from: 1, to: 2, weight: 30 },
    { id: "1-4", from: 1, to: 4, weight: 25 },
    { id: "1-5", from: 1, to: 5, weight: 40 },
    { id: "2-3", from: 2, to: 3, weight: 20 },
    { id: "2-4", from: 2, to: 4, weight: 15 },
    { id: "2-8", from: 2, to: 8, weight: 10 },
    { id: "3-4", from: 3, to: 4, weight: 20 },
    { id: "3-5", from: 3, to: 5, weight: 25 },
    { id: "4-5", from: 4, to: 5, weight: 30 },
    { id: "6-7", from: 6, to: 7, weight: 18 },
    { id: "6-2", from: 6, to: 2, weight: 28 },
  ];

  selectedEdges.value = [];
  totalWeight.value = 0;
  steps.value = [];

  nextTick(() => {
    resizeCanvas();
    drawGraph();
  });

  statusMessage.value = "✅ Mapa de Bolivia cargado";
  statusTone.value = "success";
  setTimeout(() => (statusMessage.value = ""), 2000);
};

const resetGraph = () => {
  nodes.value = [];
  edgesList.value = [];
  selectedNode.value = null;
  syncNodeCount();
  resetResults();
  drawGraph();
  statusMessage.value = "🔄 Grafo reiniciado";
  statusTone.value = "neutral";
  setTimeout(() => (statusMessage.value = ""), 2000);
};

// ============ ALGORITMO DE KRUSKAL (MIN/MAX) ============

const find = (parent, i) => {
  if (parent[i] === i) return i;
  return find(parent, parent[i]);
};

const union = (parent, rank, x, y) => {
  const xroot = find(parent, x);
  const yroot = find(parent, y);

  if (rank[xroot] < rank[yroot]) {
    parent[xroot] = yroot;
  } else if (rank[xroot] > rank[yroot]) {
    parent[yroot] = xroot;
  } else {
    parent[yroot] = xroot;
    rank[xroot]++;
  }
};

const runKruskal = async () => {
  if (nodes.value.length === 0) {
    statusMessage.value = "❌ No hay nodos en el grafo";
    statusTone.value = "error";
    setTimeout(() => (statusMessage.value = ""), 2000);
    return;
  }

  if (edgesList.value.length === 0) {
    statusMessage.value = "❌ No hay aristas en el grafo";
    statusTone.value = "error";
    setTimeout(() => (statusMessage.value = ""), 2000);
    return;
  }

  isExecuting.value = true;
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Ordenar según minimizar o maximizar
  const sortedEdges = [...edgesList.value].sort((a, b) => 
    optimizationType.value === 'min' ? a.weight - b.weight : b.weight - a.weight
  );
  
  const parent = [];
  const rank = [];
  const result = [];
  const stepList = [];

  for (let i = 0; i < nodes.value.length; i++) {
    parent[i] = i;
    rank[i] = 0;
  }

  const objetivo = optimizationType.value === 'min' ? 'mínimo' : 'máximo';
  stepList.push(
    `🎯 <strong>INICIO:</strong> ${nodes.value.length} departamentos, cada uno en su propio conjunto. Objetivo: ${objetivo}`,
  );
  stepList.push(`📋 <strong>ORDENAMIENTO:</strong> Rutas ordenadas por recursos de ${optimizationType.value === 'min' ? 'menor a mayor' : 'mayor a menor'}`);

  let e = 0;
  let i = 0;

  while (e < nodes.value.length - 1 && i < sortedEdges.length) {
    const nextEdge = sortedEdges[i++];
    const x = find(parent, nextEdge.from);
    const y = find(parent, nextEdge.to);

    stepList.push(
      `📌 <strong>Evaluando:</strong> ${getNodeLabel(nextEdge.from)}-${getNodeLabel(nextEdge.to)} (recursos: ${nextEdge.weight})`,
    );

    if (x !== y) {
      result.push(nextEdge);
      union(parent, rank, x, y);
      stepList.push(
        `  ✅ <strong>ACEPTADA:</strong> No forma ciclo → Agregada al ${optimizationType.value === 'min' ? 'MST' : 'árbol máximo'}`,
      );
      e++;
    } else {
      stepList.push(`  ❌ <strong>RECHAZADA:</strong> Formaría un ciclo`);
    }

    selectedEdges.value = [...result];
    totalWeight.value = result.reduce((sum, edge) => sum + edge.weight, 0);
    drawGraph(true);
    await new Promise((resolve) => setTimeout(resolve, 300));
  }

  if (result.length !== nodes.value.length - 1) {
    stepList.push(
      `⚠️ <strong>ADVERTENCIA:</strong> El grafo no es conexo. No se puede formar un árbol completo.`,
    );
    statusMessage.value = "⚠️ El grafo no es conexo";
    statusTone.value = "error";
  } else {
    const tipo = optimizationType.value === 'min' ? 'mínimo' : 'máximo';
    stepList.push(
      `✅ <strong>FINALIZADO!</strong> Árbol de expansión ${tipo} encontrado con recursos totales: ${totalWeight.value}`,
    );
    statusMessage.value = `✅ Árbol ${tipo} encontrado con recursos totales: ${totalWeight.value}`;
    statusTone.value = "success";
  }

  steps.value = stepList;
  selectedEdges.value = result;
  totalWeight.value = result.reduce((sum, edge) => sum + edge.weight, 0);
  drawGraph(true);

  isExecuting.value = false;
  setTimeout(() => (statusMessage.value = ""), 3000);
};

// ============ DIBUJO DEL GRAFO ============

const drawGraph = (highlightSelected = false) => {
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
  edgesList.value.forEach((edge) => {
    const fromNode = nodes.value.find((n) => n.id === edge.from);
    const toNode = nodes.value.find((n) => n.id === edge.to);

    if (!fromNode || !toNode) return;

    const isSelected = highlightSelected && selectedEdges.value.some((e) => e.id === edge.id);

    ctx.beginPath();
    ctx.moveTo(fromNode.x, fromNode.y);
    ctx.lineTo(toNode.x, toNode.y);

    if (isSelected) {
      ctx.strokeStyle = optimizationType.value === 'min' ? "#10b981" : "#f97316";
      ctx.lineWidth = 4;
      ctx.setLineDash([]);
    } else {
      ctx.strokeStyle = "#94a3b8";
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 6]);
    }

    ctx.stroke();
    ctx.setLineDash([]);

    // Dibujar peso
    const midX = (fromNode.x + toNode.x) / 2;
    const midY = (fromNode.y + toNode.y) / 2;
    const angle = Math.atan2(toNode.y - fromNode.y, toNode.x - fromNode.x);
    const offsetX = Math.sin(angle) * 12;
    const offsetY = -Math.cos(angle) * 12;

    ctx.fillStyle = "white";
    ctx.fillRect(midX + offsetX - 15, midY + offsetY - 10, 30, 20);
    ctx.fillStyle = isSelected ? (optimizationType.value === 'min' ? "#10b981" : "#f97316") : "#475569";
    ctx.font = "bold 14px 'Segoe UI'";
    ctx.fillText(edge.weight, midX + offsetX, midY + offsetY + 4);
  });

  // Dibujar nodos
  nodes.value.forEach((node) => {
    const isSelected = selectedNode.value === node.id;

    ctx.beginPath();
    ctx.arc(node.x, node.y, 28, 0, 2 * Math.PI);

    if (isSelected) {
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
  for (const edge of edgesList.value) {
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
      selectedNode.value = node.id;
      editorStatus.value = `Origen ${node.label} seleccionado. Ahora elige destino.`;
      drawGraph(true);
    } else {
      addEdgeBetween(edgeStartNode.value, node.id);
      edgeStartNode.value = null;
      selectedNode.value = null;
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
    selectedNode.value = node.id;
    drawGraph(true);
    setTimeout(() => {
      if (selectedNode.value === node.id) {
        selectedNode.value = null;
        drawGraph(true);
      }
    }, 1000);
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

  for (const edge of edgesList.value) {
    const fromNode = nodes.value.find((n) => n.id === edge.from);
    const toNode = nodes.value.find((n) => n.id === edge.to);
    if (fromNode && toNode) {
      const midX = (fromNode.x + toNode.x) / 2;
      const midY = (fromNode.y + toNode.y) / 2;
      const dx = midX - pos.x;
      const dy = midY - pos.y;
      if (Math.sqrt(dx * dx + dy * dy) < 25) {
        const newWeight = prompt(
          `✏️ Editar recursos de la ruta ${getNodeLabel(edge.from)} → ${getNodeLabel(edge.to)}:`,
          edge.weight,
        );
        if (newWeight && !isNaN(newWeight) && parseInt(newWeight) > 0) {
          edge.weight = parseInt(newWeight);
          drawGraph(true);
          statusMessage.value = `✏️ Recursos actualizados a ${newWeight}`;
          statusTone.value = "success";
          setTimeout(() => (statusMessage.value = ""), 1500);
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
const toggleSteps = () => {
  showSteps.value = !showSteps.value;
};
const closeHelpModal = () => {
  showHelpModal.value = false;
};
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
    statusMessage.value = "No hay datos para exportar";
    statusTone.value = "error";
    setTimeout(() => (statusMessage.value = ""), 2000);
    return;
  }

  const payload = {
    nodes: nodes.value,
    edges: edgesList.value,
    optimizationType: optimizationType.value,
    exportDate: new Date().toISOString(),
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  const fileName = exportFileName.value.trim() || "kruskal_bolivia";
  link.download = `${fileName}.json`;
  link.click();
  URL.revokeObjectURL(url);
  statusMessage.value = `📁 Grafo exportado como ${fileName}.json`;
  statusTone.value = "success";
  setTimeout(() => (statusMessage.value = ""), 2000);
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
        syncNodeCount();
        if (data.optimizationType) {
          optimizationType.value = data.optimizationType;
        }
        selectedEdges.value = [];
        totalWeight.value = 0;
        steps.value = [];
        selectedNode.value = null;
        nextTick(() => {
          resizeCanvas();
          drawGraph();
        });
        statusMessage.value = "✅ Grafo importado exitosamente";
        statusTone.value = "success";
      } else {
        throw new Error("Formato inválido");
      }
    } catch (error) {
      statusMessage.value = "❌ Error al importar archivo";
      statusTone.value = "error";
    }
    setTimeout(() => (statusMessage.value = ""), 2000);
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
  loadBoliviaGraph();
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

.kruskal-page {
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
}

.badge-min {
  background: linear-gradient(135deg, #10b981, #059669);
}

.badge-max {
  background: linear-gradient(135deg, #f97316, #ea580c);
}

/* Main Layout */
.main-layout {
  display: grid;
  grid-template-columns: 320px 1fr 360px;
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

/* Optimization Toggle */
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
.mst-dot { background: #10b981; }
.normal-dot { background: #94a3b8; }

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
  border-radius: 4px;
}

.mst-color {
  background: #10b981;
}
.normal-color {
  background: #94a3b8;
}
.node-color {
  background: #3b82f6;
  border-radius: 50%;
}
.selected-color {
  background: #f59e0b;
  border-radius: 50%;
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

.orange-gradient {
  background: linear-gradient(135deg, #f97316, #ea580c);
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

.total-value-card {
  padding: 12px;
  border-radius: 14px;
  text-align: center;
}

.value-min {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
}

.value-max {
  background: linear-gradient(135deg, #f97316, #ea580c);
  color: white;
}

.value-number {
  display: block;
  font-size: 2rem;
  font-weight: bold;
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

.stat-badge {
  padding: 4px 10px;
  background: #dbeafe;
  border-radius: 20px;
  font-size: 0.65rem;
  font-weight: 600;
  color: #1e40af;
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

.edges-list {
  max-height: 200px;
  overflow-y: auto;
}

.edge-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  margin-bottom: 8px;
  transition: all 0.2s;
}

.edge-item:hover {
  border-color: #667eea;
  transform: translateX(4px);
}

.edge-nodes {
  font-weight: 600;
  color: #333;
  font-size: 0.8rem;
}

.edge-weight {
  background: #eff6ff;
  padding: 2px 8px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  color: #3b82f6;
}

.empty-state {
  text-align: center;
  padding: 20px;
  color: #999;
  font-size: 0.8rem;
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

/* Responsive */
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
  .config-card,
  .results-card {
    position: static;
  }
  .hero-section {
    flex-direction: column;
    text-align: center;
  }
}

@media (max-width: 768px) {
  .kruskal-page {
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