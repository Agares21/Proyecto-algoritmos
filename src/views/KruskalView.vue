<template>
  <div class="kruskal-page">
    <!-- Header - MISMO DISEÑO QUE LOS OTROS ALGORITMOS -->
    <div class="hero-section">
      <div class="hero-content">
        <h1>Algoritmo de Kruskal</h1>
        <p>Árbol de Expansión Mínima (MST) - Encuentra la conexión más económica entre todos los nodos</p>
      </div>
      <div class="algorithm-badge">
        Árbol de Expansión Mínima
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
            <label>Número de nodos</label>
            <div class="number-control">
              <button @click="decrementNodes" class="num-btn">−</button>
              <span class="num-value">{{ nodeCount }}</span>
              <button @click="incrementNodes" class="num-btn">+</button>
            </div>
          </div>

          <div class="action-buttons">
            <button @click="generateRandomGraph" class="btn-outline">🎲 Grafo Aleatorio</button>
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
              <strong>Nodos:</strong> {{ nodeCount }}
            </div>
            <div class="info-status">
              <strong>Aristas:</strong> {{ edgesList.length }}
            </div>
          </div>

          <button @click="runKruskal" class="btn-execute" :disabled="isExecuting">
            <span class="execute-icon">▶</span>
            {{ isExecuting ? 'Calculando...' : 'Ejecutar Kruskal' }}
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
            <span class="pill pill-node">
              <span class="pill-dot node-dot"></span>
              Nodos
            </span>
            <span class="pill pill-edge-mst">
              <span class="pill-dot mst-dot"></span>
              Aristas del MST
            </span>
            <span class="pill pill-edge-normal">
              <span class="pill-dot normal-dot"></span>
              Aristas no seleccionadas
            </span>
          </div>
        </div>
        <div class="graph-container">
          <div class="graph-backdrop"></div>
          <canvas ref="canvasRef" class="graph-canvas" @click="handleCanvasClick"></canvas>
        </div>
        
        <!-- Leyenda de colores -->
        <div class="legend">
          <div class="legend-item">
            <div class="legend-color mst-color"></div>
            <span>Arista del MST</span>
          </div>
          <div class="legend-item">
            <div class="legend-color normal-color"></div>
            <span>Arista no seleccionada</span>
          </div>
          <div class="legend-item">
            <div class="legend-color node-color"></div>
            <span>Nodo</span>
          </div>
        </div>
      </div>

      <!-- Panel de resultados -->
      <div class="results-card">
        <div class="config-header">
          <h3>Resultados</h3>
        </div>

        <div class="results-content">
          <!-- Tarjeta de peso total -->
          <div class="result-section-card gradient-card">
            <div class="card-header">
              <div class="card-icon blue-gradient">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 10a8 8 0 1116 0 8 8 0 01-16 0zm8-6a6 6 0 100 12 6 6 0 000-12z"/>
                  <path d="M10 6v4l3 2" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
              </div>
              <div>
                <h4>Peso Total del MST</h4>
                <p>Suma de todas las aristas seleccionadas</p>
              </div>
            </div>
            <div class="total-value-card value-min">
              <span class="value-number">{{ totalWeight }}</span>
            </div>
          </div>

          <!-- Lista de aristas del MST -->
          <div class="result-section-card">
            <div class="section-header">
              <div class="section-title">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
                <h4>Árbol de Expansión Mínima</h4>
              </div>
              <span class="stat-badge">{{ mstEdges.length }} aristas</span>
            </div>
            
            <div class="edges-list">
              <div v-for="(edge, idx) in mstEdges" :key="idx" class="edge-item">
                <span class="edge-nodes">{{ edge.from }} → {{ edge.to }}</span>
                <span class="edge-weight">{{ edge.weight }}</span>
              </div>
              <div v-if="mstEdges.length === 0" class="empty-state">
                Ejecuta el algoritmo para ver el resultado
              </div>
            </div>
          </div>

          <!-- Pasos del algoritmo -->
          <div class="result-section-card" v-if="steps.length > 0">
            <div class="section-header">
              <div class="section-title">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                  <path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clip-rule="evenodd"/>
                </svg>
                <h4>Pasos del Algoritmo</h4>
              </div>
              <button @click="toggleSteps" class="toggle-steps-btn">
                {{ showSteps ? 'Ocultar' : 'Mostrar' }}
              </button>
            </div>
            
            <div v-if="showSteps" class="steps-container">
              <div v-for="(step, idx) in steps" :key="idx" class="step-item">
                <div class="step-number">{{ idx + 1 }}</div>
                <div class="step-content">
                  <p>{{ step }}</p>
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
            <h2>Guía del Algoritmo de Kruskal</h2>
            <button class="close-modal" @click="closeHelpModal">✕</button>
          </div>
          <div class="modal-body">
            <div class="help-content-detailed">
              <div class="help-section">
                <h3>¿Qué es el Algoritmo de Kruskal?</h3>
                <p>Es un algoritmo greedy que encuentra el Árbol de Expansión Mínima (MST) de un grafo conexo ponderado. Selecciona aristas de menor peso sin formar ciclos hasta conectar todos los nodos.</p>
              </div>

              <div class="help-section">
                <h3>Cómo funciona:</h3>
                <div class="steps-list">
                  <div class="step-detail">
                    <div class="step-num">1</div>
                    <div class="step-text"><strong>Ordenar aristas:</strong> Se ordenan todas las aristas por peso de menor a mayor</div>
                  </div>
                  <div class="step-detail">
                    <div class="step-num">2</div>
                    <div class="step-text"><strong>Inicializar:</strong> Cada nodo comienza en su propio conjunto</div>
                  </div>
                  <div class="step-detail">
                    <div class="step-num">3</div>
                    <div class="step-text"><strong>Seleccionar arista:</strong> Se toma la arista con menor peso</div>
                  </div>
                  <div class="step-detail">
                    <div class="step-num">4</div>
                    <div class="step-text"><strong>Verificar ciclo:</strong> Si los nodos están en distintos conjuntos, se añade al MST</div>
                  </div>
                  <div class="step-detail">
                    <div class="step-num">5</div>
                    <div class="step-text"><strong>Repetir:</strong> Continuar hasta tener N-1 aristas en el MST</div>
                  </div>
                </div>
              </div>

              <div class="help-section">
                <h3>Complejidad:</h3>
                <ul>
                  <li><strong>Tiempo:</strong> O(E log E) donde E es el número de aristas</li>
                  <li><strong>Espacio:</strong> O(V + E) donde V es el número de vértices</li>
                </ul>
              </div>

              <div class="help-section">
                <h3>Interacción:</h3>
                <ul>
                  <li>Haz clic en el canvas para agregar/eliminar nodos</li>
                  <li>Arrastra desde un nodo a otro para crear aristas</li>
                  <li>Edita el peso de las aristas haciendo doble clic</li>
                  <li>Los nodos se pueden arrastrar para reorganizar el grafo</li>
                </ul>
              </div>

              <div class="help-note-box">
                <strong>💡 Nota:</strong> El grafo debe ser conexo para que el algoritmo pueda encontrar un árbol de expansión válido.
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
import { ref, onMounted, onUnmounted, watch, nextTick } from "vue";

// Estado
const nodeCount = ref(6);
const isExecuting = ref(false);
const showResultModal = ref(false);
const showHelpModal = ref(false);
const showSteps = ref(false);
const statusMessage = ref("");
const statusTone = ref("");
const exportFileName = ref("kruskal");

// Datos del grafo
const nodes = ref([]);
const edgesList = ref([]);
const mstEdges = ref([]);
const totalWeight = ref(0);
const steps = ref([]);

// Canvas
const canvasRef = ref(null);
let ctx = null;
let dragging = false;
let dragNode = null;
let creatingEdge = false;
let edgeStartNode = null;
let selectedEdge = null;
let editWeightValue = null;

// Posiciones de los nodos
const nodePositions = ref([]);

// Nodos predefinidos para ejemplo
const nodeLabels = ["A", "B", "C", "D", "E", "F"];

// ============ FUNCIONES DEL GRAFO ============

const generateRandomGraph = () => {
  const n = nodeCount.value;
  const newNodes = [];
  const newEdges = [];
  
  // Crear nodos en posiciones circulares
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
  
  // Crear aristas aleatorias (grafo denso)
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (Math.random() > 0.3) { // Probabilidad de conexión
        const weight = Math.floor(Math.random() * 20) + 1;
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
  updateNodePositions();
  drawGraph();
  statusMessage.value = "Grafo aleatorio generado";
  statusTone.value = "success";
  setTimeout(() => statusMessage.value = "", 2000);
};

const loadExample = () => {
  // Ejemplo clásico de Kruskal
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
  
  updateNodePositions();
  drawGraph();
  statusMessage.value = "Ejemplo cargado";
  statusTone.value = "success";
  setTimeout(() => statusMessage.value = "", 2000);
};

const resetGraph = () => {
  nodes.value = [];
  edgesList.value = [];
  mstEdges.value = [];
  totalWeight.value = 0;
  steps.value = [];
  drawGraph();
  statusMessage.value = "Grafo reiniciado";
  statusTone.value = "neutral";
  setTimeout(() => statusMessage.value = "", 2000);
};

const updateNodePositions = () => {
  nodePositions.value = nodes.value.map(node => ({ id: node.id, x: node.x, y: node.y }));
};

// ============ ALGORITMO DE KRUSKAL ============

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
    statusMessage.value = "No hay nodos en el grafo";
    statusTone.value = "error";
    setTimeout(() => statusMessage.value = "", 2000);
    return;
  }
  
  if (edgesList.value.length === 0) {
    statusMessage.value = "No hay aristas en el grafo";
    statusTone.value = "error";
    setTimeout(() => statusMessage.value = "", 2000);
    return;
  }
  
  isExecuting.value = true;
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Ordenar aristas por peso
  const sortedEdges = [...edgesList.value].sort((a, b) => a.weight - b.weight);
  const parent = [];
  const rank = [];
  const result = [];
  const stepList = [];
  
  // Inicializar conjuntos
  for (let i = 0; i < nodes.value.length; i++) {
    parent[i] = i;
    rank[i] = 0;
  }
  
  stepList.push(`Inicialización: ${nodes.value.length} nodos, cada uno en su propio conjunto`);
  
  let e = 0;
  let i = 0;
  
  while (e < nodes.value.length - 1 && i < sortedEdges.length) {
    const nextEdge = sortedEdges[i++];
    const x = find(parent, nextEdge.from);
    const y = find(parent, nextEdge.to);
    
    stepList.push(`Evaluando arista ${getNodeLabel(nextEdge.from)}-${getNodeLabel(nextEdge.to)} con peso ${nextEdge.weight}`);
    
    if (x !== y) {
      result.push(nextEdge);
      union(parent, rank, x, y);
      stepList.push(`  ✓ Seleccionada: no forma ciclo. Agregada al MST`);
      e++;
    } else {
      stepList.push(`  ✗ Rechazada: formaría un ciclo`);
    }
    
    // Actualizar visualización paso a paso
    mstEdges.value = [...result];
    totalWeight.value = result.reduce((sum, edge) => sum + edge.weight, 0);
    drawGraph(true);
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  
  if (result.length !== nodes.value.length - 1) {
    stepList.push(`⚠️ El grafo no es conexo. No se puede formar un árbol de expansión completo.`);
    statusMessage.value = "El grafo no es conexo";
    statusTone.value = "error";
  } else {
    stepList.push(`✅ Algoritmo completado. Se encontró el MST con peso total ${totalWeight.value}`);
    statusMessage.value = `MST encontrado con peso total: ${totalWeight.value}`;
    statusTone.value = "success";
  }
  
  steps.value = stepList;
  mstEdges.value = result;
  totalWeight.value = result.reduce((sum, edge) => sum + edge.weight, 0);
  drawGraph(true);
  
  isExecuting.value = false;
  setTimeout(() => statusMessage.value = "", 3000);
};

const getNodeLabel = (id) => {
  const node = nodes.value.find(n => n.id === id);
  return node ? node.label : `N${id}`;
};

// ============ DIBUJO DEL GRAFO ============

const drawGraph = (highlightMST = false) => {
  if (!canvasRef.value) return;
  
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
    
    const isMST = highlightMST && mstEdges.value.some(e => e.id === edge.id);
    
    ctx.beginPath();
    ctx.moveTo(fromNode.x, fromNode.y);
    ctx.lineTo(toNode.x, toNode.y);
    
    if (isMST) {
      ctx.strokeStyle = "#10b981";
      ctx.lineWidth = 4;
    } else {
      ctx.strokeStyle = "#94a3b8";
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
    }
    
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Dibujar peso de la arista
    const midX = (fromNode.x + toNode.x) / 2;
    const midY = (fromNode.y + toNode.y) / 2;
    
    ctx.fillStyle = isMST ? "#10b981" : "#475569";
    ctx.font = "bold 12px Inter";
    ctx.fillText(edge.weight, midX + 5, midY - 5);
  });
  
  // Dibujar nodos
  nodes.value.forEach(node => {
    ctx.beginPath();
    ctx.arc(node.x, node.y, 24, 0, 2 * Math.PI);
    ctx.fillStyle = "#3b82f6";
    ctx.fill();
    ctx.strokeStyle = "white";
    ctx.lineWidth = 3;
    ctx.stroke();
    
    ctx.fillStyle = "white";
    ctx.font = "bold 14px Inter";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
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
    if (Math.sqrt(dx * dx + dy * dy) < 24) {
      return node;
    }
  }
  return null;
};

const handleCanvasClick = (e) => {
  const pos = getMousePos(e);
  const node = findNodeAt(pos.x, pos.y);
  
  if (node) {
    if (creatingEdge && edgeStartNode) {
      if (edgeStartNode.id !== node.id) {
        const existingEdge = edgesList.value.find(
          edge => (edge.from === edgeStartNode.id && edge.to === node.id) ||
                  (edge.from === node.id && edge.to === edgeStartNode.id)
        );
        
        if (!existingEdge) {
          const weight = prompt("Ingrese el peso de la arista:", "1");
          if (weight && !isNaN(weight)) {
            edgesList.value.push({
              id: `${edgeStartNode.id}-${node.id}`,
              from: edgeStartNode.id,
              to: node.id,
              weight: parseInt(weight)
            });
            drawGraph();
          }
        } else {
          statusMessage.value = "La arista ya existe";
          statusTone.value = "error";
          setTimeout(() => statusMessage.value = "", 1500);
        }
      }
      creatingEdge = false;
      edgeStartNode = null;
    } else if (selectedEdge) {
      const newWeight = prompt("Editar peso:", selectedEdge.weight);
      if (newWeight && !isNaN(newWeight)) {
        selectedEdge.weight = parseInt(newWeight);
        drawGraph();
      }
      selectedEdge = null;
    }
  } else {
    if (creatingEdge) {
      creatingEdge = false;
      edgeStartNode = null;
    } else {
      const newLabel = prompt("Nombre del nodo:", `N${nodes.value.length + 1}`);
      if (newLabel) {
        nodes.value.push({
          id: nodes.value.length,
          label: newLabel,
          x: pos.x,
          y: pos.y
        });
        nodeCount.value = nodes.value.length;
        drawGraph();
      }
    }
  }
};

// Eventos de arrastre
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
    dragNode.x = Math.max(20, Math.min(canvasRef.value.width - 20, pos.x));
    dragNode.y = Math.max(20, Math.min(canvasRef.value.height - 20, pos.y));
    drawGraph();
  }
};

const handleMouseUp = () => {
  dragging = false;
  dragNode = null;
};

const handleDoubleClick = (e) => {
  const pos = getMousePos(e);
  const node = findNodeAt(pos.x, pos.y);
  
  if (node) {
    const newLabel = prompt("Editar nombre del nodo:", node.label);
    if (newLabel) {
      node.label = newLabel;
      drawGraph();
    }
  }
};

// Acciones para botones
const triggerImport = () => importInputRef.value?.click();
const toggleSteps = () => { showSteps.value = !showSteps.value; };
const closeHelpModal = () => { showHelpModal.value = false; };

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
  const fileName = exportFileName.value.trim() || "kruskal";
  link.download = `${fileName}.json`;
  link.click();
  URL.revokeObjectURL(url);
  statusMessage.value = `Grafo exportado como ${fileName}.json`;
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
        mstEdges.value = [];
        totalWeight.value = 0;
        steps.value = [];
        drawGraph();
        statusMessage.value = "Grafo importado exitosamente";
        statusTone.value = "success";
      } else {
        throw new Error("Formato inválido");
      }
    } catch (error) {
      statusMessage.value = "Error al importar archivo";
      statusTone.value = "error";
    }
    setTimeout(() => statusMessage.value = "", 2000);
  };
  reader.readAsText(file);
  event.target.value = "";
};

const decrementNodes = () => {
  if (nodeCount.value > 2) {
    nodeCount.value--;
    generateRandomGraph();
  }
};

const incrementNodes = () => {
  if (nodeCount.value < 8) {
    nodeCount.value++;
    generateRandomGraph();
  }
};

// Redimensionar canvas
const resizeCanvas = () => {
  if (canvasRef.value) {
    canvasRef.value.width = canvasRef.value.clientWidth;
    canvasRef.value.height = canvasRef.value.clientHeight;
    drawGraph();
  }
};

// Inicializar
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
  background: linear-gradient(135deg, #10b981, #059669);
}

/* Main Layout */
.main-layout {
  display: grid;
  grid-template-columns: 320px 1fr 380px;
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
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
}

.graph-header h3 {
  margin: 0;
  color: #333;
  font-size: 1rem;
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
  cursor: crosshair;
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

.total-value-card {
  padding: 12px;
  border-radius: 14px;
  text-align: center;
}

.value-min {
  background: linear-gradient(135deg, #667eea, #764ba2);
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
}

.step-content p {
  margin: 0;
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

/* Responsive */
@media (max-width: 1200px) {
  .main-layout {
    grid-template-columns: 280px 1fr 360px;
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
  .kruskal-page {
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
}
</style>