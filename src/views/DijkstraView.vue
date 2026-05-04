<template>
  <div class="dijkstra-page">
    <div class="hero-section">
      <div class="hero-content">
        <h1>Algoritmo de Dijkstra</h1>
        <p>Camino más corto desde un nodo origen a todos los demás nodos</p>
      </div>
      <div class="algorithm-badge">🛣️ Camino Más Corto</div>
    </div>

    <div class="main-layout">
      <!-- Panel de configuración -->
      <div class="config-card">
        <div class="config-header">
          <h3>⚙️ Configuración</h3>
        </div>

        <div class="config-group">
          <div class="action-buttons">
            <button @click="generateRandomGraph" class="btn-outline">
              🎲 Aleatorio
            </button>
            <button @click="loadExample" class="btn-outline">📋 Ejemplo</button>
            <button @click="clearGraph" class="btn-outline danger">
              🗑️ Limpiar
            </button>
          </div>

          <div class="info-panel">
            <div class="info-status">🔵 Nodos: {{ nodes.length }}</div>
            <div class="info-status">🔗 Aristas: {{ edges.length }}</div>
            <div class="info-status">
              📍 Origen:
              <strong class="source-badge">{{
                getNodeLabel(sourceNode)
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

          <!-- Sección de Importar/Exportar (NUEVA UBICACIÓN) -->
          <div class="import-export-section">
            <div class="file-name-input">
              <label>Nombre del archivo</label>
              <input
                type="text"
                v-model="exportFileName"
                class="file-name-field"
                placeholder="mi_grafo_dijkstra"
              />
            </div>
            <div class="import-export-buttons">
              <button @click="exportData" class="btn-export">
                📤 Exportar
              </button>
              <label class="btn-import">
                📥 Importar
                <input
                  type="file"
                  accept=".json"
                  @change="importData"
                  style="display: none"
                />
              </label>
            </div>
          </div>

          <button
            @click="runDijkstra"
            class="btn-execute"
            :disabled="isExecuting"
          >
            ▶ {{ isExecuting ? "Calculando..." : "Ejecutar Dijkstra" }}
          </button>

          <button @click="showHelp = !showHelp" class="btn-help">
            ❓ Ayuda
          </button>
        </div>

        <p v-if="message" class="status-message" :class="messageType">
          {{ message }}
        </p>
      </div>

      <!-- Canvas del grafo -->
      <div class="graph-card">
        <div class="graph-header">
          <h3>🌐 Visualización del Grafo</h3>
          <div class="legend">
            <span><span class="dot source"></span> Origen</span>
            <span><span class="dot path"></span> Ruta más corta</span>
            <span><span class="dot normal"></span> Otras aristas</span>
          </div>
        </div>

        <div class="graph-container">
          <canvas ref="canvasRef" class="graph-canvas"></canvas>
        </div>

        <div class="instructions">
          💡 <strong>Tips:</strong> Haz clic en un nodo para seleccionarlo como
          origen | Arrastra nodos para reubicarlos | Doble clic en arista para
          editar peso
        </div>
      </div>

      <!-- Panel de resultados -->
      <div class="results-card">
        <div class="config-header">
          <h3>📊 Resultados</h3>
        </div>

        <div v-if="distances.length > 0" class="results-content">
          <div class="distances-grid">
            <div
              v-for="(dist, idx) in distances"
              :key="idx"
              class="distance-item"
            >
              <strong>{{ getNodeLabel(idx) }}</strong>
              <span class="arrow">→</span>
              <span :class="{ infinite: dist === Infinity }">
                {{ dist === Infinity ? "∞" : dist }}
              </span>
            </div>
          </div>

          <div class="paths-list">
            <div
              v-for="(dist, idx) in distances"
              :key="'path-' + idx"
              v-if="idx !== sourceNode && dist !== Infinity"
              class="path-item"
            >
              <strong
                >{{ getNodeLabel(sourceNode) }} →
                {{ getNodeLabel(idx) }}</strong
              >
              <span class="path-value">{{ getPathString(idx) }}</span>
              <span class="distance-badge">{{ dist }}</span>
            </div>
          </div>

          <!-- NUEVO: Pasos del algoritmo paso a paso -->
          <div class="result-section-card" v-if="steps.length > 0">
            <div class="section-header">
              <div class="section-title">
                <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
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

        <div v-else class="empty-state">
          <span>🔍</span>
          <p>Selecciona un nodo origen y presiona "Ejecutar Dijkstra"</p>
        </div>
      </div>
    </div>

    <!-- Modal de ayuda -->
    <div v-if="showHelp" class="modal-overlay" @click="showHelp = false">
      <div class="help-modal" @click.stop>
        <div class="modal-header">
          <h2>📖 Guía de Dijkstra</h2>
          <button @click="showHelp = false" class="close-btn">✕</button>
        </div>
        <div class="modal-body">
          <p>
            El algoritmo de Dijkstra encuentra el camino más corto desde un nodo
            origen a todos los demás.
          </p>
          <ul>
            <li>
              <strong>Haz clic</strong> en un nodo para seleccionar el origen
            </li>
            <li>
              <strong>Arrastra</strong> los nodos para reorganizar el grafo
            </li>
            <li>
              <strong>Doble clic</strong> en una arista para editar su peso
            </li>
            <li>
              <strong>Presiona "Ejecutar"</strong> para calcular las rutas más
              cortas
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Input oculto para importar -->
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
const sourceNode = ref(0);
const isExecuting = ref(false);
const showHelp = ref(false);
const showSteps = ref(false);
const message = ref("");
const messageType = ref("");
const exportFileName = ref("dijkstra");
const importInputRef = ref(null);
const steps = ref([]); // NUEVO: almacenar pasos del algoritmo

// Datos del grafo
const nodes = ref([]);
const edges = ref([]);
const distances = ref([]);
const previous = ref([]);
const pathEdges = ref([]);

// Canvas
const canvasRef = ref(null);
let ctx = null;
let dragging = false;
let dragNode = null;

const nodeLabels = ["A", "B", "C", "D", "E", "F", "G", "H"];

// Funciones auxiliares
const getNodeLabel = (id) => {
  const node = nodes.value.find((n) => n.id === id);
  return node ? node.label : `N${id}`;
};

const getPathString = (targetId) => {
  if (targetId === sourceNode.value) return `${getNodeLabel(sourceNode.value)}`;
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

const showMessage = (text, type) => {
  message.value = text;
  messageType.value = type;
  setTimeout(() => {
    if (message.value === text) message.value = "";
  }, 3000);
};

// Seleccionar origen
const selectSourceNode = (id) => {
  sourceNode.value = id;
  drawGraph();
  showMessage(`🎯 Origen cambiado a ${getNodeLabel(id)}`, "success");
};

const toggleSteps = () => {
  showSteps.value = !showSteps.value;
};

// Exportar datos
const exportData = () => {
  if (nodes.value.length === 0) {
    showMessage("No hay datos para exportar", "error");
    return;
  }

  const payload = {
    nodes: nodes.value,
    edges: edges.value,
    sourceNode: sourceNode.value,
    exportDate: new Date().toISOString(),
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
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
        if (data.sourceNode !== undefined && data.sourceNode < nodes.value.length) {
          sourceNode.value = data.sourceNode;
        }
        distances.value = [];
        previous.value = [];
        pathEdges.value = [];
        steps.value = [];
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

// Generar grafo aleatorio
const generateRandomGraph = () => {
  const n = Math.min(6, nodeLabels.length);
  const newNodes = [];
  const newEdges = [];

  const canvas = canvasRef.value;
  const width = canvas?.clientWidth || 800;
  const height = canvas?.clientHeight || 500;
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) * 0.35;

  for (let i = 0; i < n; i++) {
    const angle = (i * 2 * Math.PI) / n - Math.PI / 2;
    newNodes.push({
      id: i,
      label: nodeLabels[i],
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
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
  distances.value = [];
  previous.value = [];
  pathEdges.value = [];
  steps.value = [];

  nextTick(() => drawGraph());
  showMessage("✅ Grafo aleatorio generado", "success");
};

// Cargar ejemplo
const loadExample = () => {
  const canvas = canvasRef.value;
  const width = canvas?.clientWidth || 800;
  const height = canvas?.clientHeight || 500;
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) * 0.35;

  nodes.value = [
    { id: 0, label: "A", x: centerX, y: centerY - radius },
    {
      id: 1,
      label: "B",
      x: centerX + radius * 0.866,
      y: centerY - radius * 0.5,
    },
    {
      id: 2,
      label: "C",
      x: centerX + radius * 0.866,
      y: centerY + radius * 0.5,
    },
    { id: 3, label: "D", x: centerX, y: centerY + radius },
    {
      id: 4,
      label: "E",
      x: centerX - radius * 0.866,
      y: centerY + radius * 0.5,
    },
    {
      id: 5,
      label: "F",
      x: centerX - radius * 0.866,
      y: centerY - radius * 0.5,
    },
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
  distances.value = [];
  previous.value = [];
  pathEdges.value = [];
  steps.value = [];

  nextTick(() => drawGraph());
  showMessage("✅ Ejemplo clásico cargado", "success");
};

// Limpiar grafo
const clearGraph = () => {
  nodes.value = [];
  edges.value = [];
  distances.value = [];
  previous.value = [];
  pathEdges.value = [];
  steps.value = [];
  if (canvasRef.value) {
    const ctx = canvasRef.value.getContext("2d");
    ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height);
  }
  showMessage("🔄 Grafo reiniciado", "neutral");
};

// Algoritmo de Dijkstra CON PASOS
const runDijkstra = async () => {
  if (nodes.value.length === 0) {
    showMessage("❌ No hay nodos en el grafo", "error");
    return;
  }

  if (sourceNode.value >= nodes.value.length) {
    showMessage("❌ Nodo origen inválido", "error");
    return;
  }

  isExecuting.value = true;
  const stepList = [];
  
  await new Promise((resolve) => setTimeout(resolve, 100));

  const n = nodes.value.length;
  const dist = Array(n).fill(Infinity);
  const prev = Array(n).fill(-1);
  const visited = Array(n).fill(false);

  const edgesMap = new Map();
  edges.value.forEach((edge) => {
    edgesMap.set(`${edge.from}-${edge.to}`, edge.weight);
    edgesMap.set(`${edge.to}-${edge.from}`, edge.weight);
  });

  dist[sourceNode.value] = 0;
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

  pathEdges.value = newPathEdges;
  
  const reached = dist.filter((d) => d !== Infinity && d !== 0).length;
  stepList.push(`✅ <strong>FINALIZADO!</strong> Se encontraron rutas a ${reached} nodos desde ${getNodeLabel(sourceNode.value)}`);
  steps.value = [...stepList];
  
  drawGraph(true);
  showMessage(`✅ Dijkstra completado. ${reached} nodos alcanzables`, "success");
  isExecuting.value = false;
};

// Dibujar grafo
const drawGraph = (highlight = false) => {
  if (!canvasRef.value || nodes.value.length === 0) return;

  const canvas = canvasRef.value;
  ctx = canvas.getContext("2d");

  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

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

  edges.value.forEach((edge) => {
    const fromNode = nodes.value.find((n) => n.id === edge.from);
    const toNode = nodes.value.find((n) => n.id === edge.to);
    if (!fromNode || !toNode) return;

    const isPath =
      highlight &&
      pathEdges.value.some((p) => p.from === edge.from && p.to === edge.to);

    ctx.beginPath();
    ctx.moveTo(fromNode.x, fromNode.y);
    ctx.lineTo(toNode.x, toNode.y);
    ctx.strokeStyle = isPath ? "#10b981" : "#94a3b8";
    ctx.lineWidth = isPath ? 4 : 2;
    ctx.setLineDash(isPath ? [] : [8, 6]);
    ctx.stroke();
    ctx.setLineDash([]);

    const midX = (fromNode.x + toNode.x) / 2;
    const midY = (fromNode.y + toNode.y) / 2;
    ctx.fillStyle = "white";
    ctx.fillRect(midX - 12, midY - 10, 24, 20);
    ctx.fillStyle = isPath ? "#10b981" : "#475569";
    ctx.font = "bold 12px Arial";
    ctx.fillText(edge.weight, midX, midY + 4);
  });

  nodes.value.forEach((node) => {
    ctx.beginPath();
    ctx.arc(node.x, node.y, 26, 0, 2 * Math.PI);
    ctx.fillStyle = node.id === sourceNode.value ? "#ef4444" : "#3b82f6";
    ctx.fill();
    ctx.strokeStyle = "white";
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = "white";
    ctx.font = "bold 16px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(node.label, node.x, node.y);
  });
};

// Eventos del canvas
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
    if (Math.sqrt(dx * dx + dy * dy) < 28) return node;
  }
  return null;
};

const handleClick = (e) => {
  const pos = getMousePos(e);
  const node = findNodeAt(pos.x, pos.y);
  if (node) selectSourceNode(node.id);
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
    dragNode.x = Math.max(30, Math.min(canvasRef.value.width - 30, pos.x));
    dragNode.y = Math.max(30, Math.min(canvasRef.value.height - 30, pos.y));
    drawGraph();
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
          `Editar peso (${getNodeLabel(edge.from)} → ${getNodeLabel(edge.to)}):`,
          edge.weight,
        );
        if (newWeight && !isNaN(newWeight) && parseInt(newWeight) > 0) {
          edge.weight = parseInt(newWeight);
          drawGraph();
          showMessage(`✏️ Peso actualizado a ${newWeight}`, "success");
        }
        break;
      }
    }
  }
};

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
    canvasRef.value.addEventListener("click", handleClick);
    canvasRef.value.addEventListener("mousedown", handleMouseDown);
    canvasRef.value.addEventListener("mousemove", handleMouseMove);
    canvasRef.value.addEventListener("mouseup", handleMouseUp);
    canvasRef.value.addEventListener("dblclick", handleDoubleClick);
  }
});

onUnmounted(() => {
  if (canvasRef.value) {
    canvasRef.value.removeEventListener("click", handleClick);
    canvasRef.value.removeEventListener("mousedown", handleMouseDown);
    canvasRef.value.removeEventListener("mousemove", handleMouseMove);
    canvasRef.value.removeEventListener("mouseup", handleMouseUp);
    canvasRef.value.removeEventListener("dblclick", handleDoubleClick);
  }
  window.removeEventListener("resize", resizeCanvas);
});
</script>

<style scoped>
.dijkstra-page {
  min-height: 100vh;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.hero-section {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 24px;
  padding: 20px 40px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
}

.hero-content h1 {
  margin: 0 0 8px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero-content p {
  margin: 0;
  color: #666;
}

.algorithm-badge {
  padding: 8px 24px;
  background: linear-gradient(135deg, #ef4444, #dc2626);
  border-radius: 40px;
  color: white;
  font-weight: bold;
}

.main-layout {
  display: grid;
  grid-template-columns: 280px 1fr 320px;
  gap: 20px;
}

.config-card,
.graph-card,
.results-card {
  background: white;
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.config-header h3 {
  margin: 0 0 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid #f0f0f0;
}

.config-group {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.btn-outline {
  flex: 1;
  padding: 8px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-outline:hover {
  border-color: #667eea;
  transform: translateY(-2px);
}

.btn-outline.danger:hover {
  border-color: #ef4444;
  background: #fee2e2;
}

.info-panel {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 12px;
}

.info-status {
  margin: 4px 0;
  font-size: 0.85rem;
}

.source-badge {
  background: #ef4444;
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

/* Estilos para importar/exportar */
.import-export-section {
  margin-top: 4px;
  padding-top: 8px;
  border-top: 1px solid #e0e0e0;
}

.file-name-input {
  margin-bottom: 10px;
}

.file-name-input label {
  display: block;
  font-size: 0.7rem;
  color: #666;
  margin-bottom: 4px;
}

.file-name-field {
  width: 100%;
  padding: 6px 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 0.75rem;
  transition: all 0.2s;
}

.file-name-field:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.import-export-buttons {
  display: flex;
  gap: 8px;
}

.btn-export,
.btn-import {
  flex: 1;
  padding: 6px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
  font-size: 0.75rem;
}

.btn-export {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
}

.btn-export:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.btn-import {
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  color: white;
}

.btn-import:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
  cursor: pointer;
}

.hidden-input {
  display: none;
}

.btn-execute {
  width: 100%;
  padding: 10px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-execute:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-execute:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-help {
  width: 100%;
  padding: 8px;
  background: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  color: #667eea;
}

.status-message {
  margin-top: 12px;
  padding: 8px;
  border-radius: 8px;
  text-align: center;
  font-size: 0.75rem;
}

.status-message.success {
  background: #d4edda;
  color: #155724;
}

.status-message.error {
  background: #f8d7da;
  color: #721c24;
}

.status-message.neutral {
  background: #e7f3ff;
  color: #004085;
}

.graph-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.legend {
  display: flex;
  gap: 16px;
}

.legend .dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  display: inline-block;
  margin-right: 4px;
}

.dot.source {
  background: #ef4444;
}
.dot.path {
  background: #10b981;
}
.dot.normal {
  background: #94a3b8;
}

.graph-container {
  min-height: 450px;
  background: #f8f9fa;
  border-radius: 16px;
  overflow: hidden;
}

.graph-canvas {
  width: 100%;
  height: 450px;
  cursor: grab;
}

.graph-canvas:active {
  cursor: grabbing;
}

.instructions {
  margin-top: 12px;
  font-size: 0.7rem;
  color: #666;
  text-align: center;
}

.results-content {
  max-height: 500px;
  overflow-y: auto;
}

.distances-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  margin-bottom: 20px;
}

.distance-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 10px;
}

.distance-item .arrow {
  color: #667eea;
}

.distance-item .infinite {
  color: #ef4444;
  font-weight: bold;
}

.paths-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.path-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 10px;
  flex-wrap: wrap;
}

.path-value {
  flex: 1;
  font-family: monospace;
  font-size: 0.7rem;
  color: #059669;
}

.distance-badge {
  background: #667eea;
  color: white;
  padding: 2px 10px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: bold;
}

/* Estilos para la sección de pasos */
.result-section-card {
  background: #f8f9fa;
  border-radius: 16px;
  padding: 12px;
  margin-top: 16px;
  border: 1px solid #e0e0e0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 6px;
}

.section-title svg {
  color: #667eea;
}

.section-title h4 {
  margin: 0;
  font-size: 0.8rem;
  font-weight: 600;
  color: #333;
}

.toggle-steps-btn {
  padding: 3px 10px;
  background: #e2e8f0;
  border: none;
  border-radius: 16px;
  cursor: pointer;
  font-size: 0.65rem;
  font-weight: 600;
  color: #475569;
  transition: all 0.2s;
}

.toggle-steps-btn:hover {
  background: #cbd5e1;
}

.steps-container {
  max-height: 250px;
  overflow-y: auto;
}

.step-item {
  display: flex;
  gap: 10px;
  padding: 8px;
  border-bottom: 1px solid #e0e0e0;
}

.step-number {
  width: 22px;
  height: 22px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 0.65rem;
  flex-shrink: 0;
}

.step-content {
  flex: 1;
  font-size: 0.7rem;
  color: #555;
  line-height: 1.4;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
}

.empty-state span {
  font-size: 3rem;
}

.empty-state p {
  color: #999;
  font-size: 0.85rem;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.help-modal {
  background: white;
  border-radius: 24px;
  max-width: 500px;
  width: 90%;
  overflow: hidden;
}

.modal-header {
  padding: 16px 20px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.close-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.2rem;
}

.modal-body {
  padding: 20px;
}

.modal-body ul {
  margin: 12px 0;
  padding-left: 20px;
}

.modal-body li {
  margin: 8px 0;
  color: #555;
}

@media (max-width: 1000px) {
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

@media (max-width: 600px) {
  .dijkstra-page {
    padding: 12px;
  }
  .graph-canvas {
    height: 350px;
  }
}
</style>