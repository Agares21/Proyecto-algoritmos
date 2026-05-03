<template>
  <div class="assignment-page">
    <!-- Header - MISMO DISEÑO QUE TRANSPORTE -->
    <div class="hero-section">
      <div class="hero-content">
        <h1>Algoritmo de Asignación</h1>
        <p>Método Húngaro para resolver problemas de asignación NxN</p>
      </div>
      <div class="optimization-badge" :class="problemType === 'min' ? 'badge-min' : 'badge-max'">
        {{ problemType === 'min' ? 'Minimizar Costo' : 'Maximizar Beneficio' }}
      </div>
    </div>

    <div class="main-layout">
      <!-- Panel de herramientas - CON AYUDA INTEGRADA -->
      <div class="config-card">
        <div class="config-header">
          <h3>Herramientas</h3>
        </div>

        <div class="config-group">
          <div class="tool-grid">
            <button 
              v-for="tool in editorTools"
              :key="tool.mode"
              @click="setMode(tool.mode)"
              class="tool-btn"
              :class="{ active: currentMode === tool.mode }">
              <span class="tool-icon">{{ tool.icon }}</span>
              <span>{{ tool.label }}</span>
              <span class="tool-shortcut">{{ tool.shortcut }}</span>
            </button>
          </div>

          <div class="action-buttons">
            <button @click="fitGraphToView" class="btn-outline">Ajustar grafo</button>
            <button @click="exportGraph" class="btn-outline">Exportar</button>
            <button @click="triggerImport" class="btn-outline">Importar</button>
            <button @click="clearGraph" class="btn-outline danger">Limpiar</button>
          </div>

          <div class="info-panel">
            <div v-if="currentMode === 'edge'" class="info-status active">
              {{ edgeStep }}
            </div>
            <div v-else class="info-status">
              Modo actual: {{ currentModeLabel }}
            </div>
            <div class="info-tips">
              <span>Mover (V)</span>
              <span>Nodo (N)</span>
              <span>Arista (E)</span>
              <span>Borrar (D)</span>
            </div>
          </div>

          <!-- Botón de ayuda AQUÍ (como en los demás algoritmos) -->
          <button @click="showHelpModal = true" class="btn-help">Ayuda</button>
        </div>

        <p v-if="statusMessage" class="status-message" :class="statusTone">
          {{ statusMessage }}
        </p>
      </div>

      <!-- Canvas del grafo -->
      <div class="canvas-card">
        <div class="canvas-header">
          <h3>Editor de Grafos Bipartitos</h3>
          <div class="canvas-pills">
            <span class="pill pill-origin">
              <span class="pill-dot origin-dot"></span>
              Origen (O)
            </span>
            <span class="pill pill-destination">
              <span class="pill-dot destination-dot"></span>
              Destino (D)
            </span>
          </div>
        </div>
        <div class="canvas-container">
          <div class="graph-backdrop"></div>
          <GraphCanvas />
        </div>
      </div>

      <!-- Panel de configuración y resultados -->
      <div class="results-card">
        <div class="config-header">
          <h3>Configuración</h3>
        </div>

        <div class="results-content">
          <!-- Tarjeta de Generación -->
          <div class="result-section-card">
            <div class="card-header">
              <div class="card-icon blue-gradient">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V4z"/>
                </svg>
              </div>
              <div>
                <h4>Generar Matriz</h4>
                <p>Orígenes O1...On | Destinos D1...Dn</p>
              </div>
            </div>
            <button @click="generateAssignmentMatrix" class="btn-primary">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"/>
              </svg>
              Generar matriz
            </button>
          </div>

          <!-- Tarjeta de Algoritmo -->
          <div class="result-section-card">
            <div class="card-header">
              <div class="card-icon purple-gradient">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 10a8 8 0 1116 0 8 8 0 01-16 0zm8-6a6 6 0 100 12 6 6 0 000-12z"/>
                  <path d="M10 6v4l3 2" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
              </div>
              <div>
                <h4>Tipo de Problema</h4>
                <p>Selecciona la optimización</p>
              </div>
            </div>
            
            <div class="optimization-toggle">
              <button
                @click="problemType = 'min'"
                :class="{ active: problemType === 'min' }"
                class="toggle-btn">
                Minimizar
              </button>
              <button
                @click="problemType = 'max'"
                :class="{ active: problemType === 'max' }"
                class="toggle-btn">
                Maximizar
              </button>
            </div>

            <button
              @click="runAssignment"
              class="btn-primary"
              :disabled="!matrixGenerated || !problemType">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd"/>
              </svg>
              Ejecutar asignación
            </button>

            <button
              @click="toggleResolution"
              class="btn-secondary"
              :disabled="!assignmentResult">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"/>
              </svg>
              {{ showResolution ? "Ocultar resolución" : "Ver paso a paso" }}
            </button>
          </div>

          <!-- Matriz Generada -->
          <div v-if="matrixGenerated" class="result-section-card matrix-preview">
            <div class="section-header">
              <div class="section-title">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path d="M5 4a1 1 0 00-1 1v10a1 1 0 001 1h10a1 1 0 001-1V5a1 1 0 00-1-1H5z"/>
                </svg>
                <h4>Matriz Generada</h4>
              </div>
              <span class="stat-badge">{{ detectedOrigins.length }} × {{ detectedDestinations.length }}</span>
            </div>
            <div class="matrix-wrapper">
              <table class="result-table">
                <thead>
                  <tr>
                    <th></th>
                    <th v-for="dest in detectedDestinations" :key="dest.id">{{ dest.label }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, i) in generatedMatrix" :key="i">
                    <th>{{ detectedOrigins[i]?.label }}</th>
                    <td v-for="(cell, j) in row" :key="j" :class="{ 'has-value': cell !== 0 }">
                      {{ cell }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Resultado -->
          <div v-if="assignmentResult" class="result-section-card">
            <div class="section-header">
              <div class="section-title">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
                <h4>Asignación Óptima</h4>
              </div>
              <span class="result-badge" :class="problemType">
                {{ problemType === 'min' ? 'Minimización' : 'Maximización' }}
              </span>
            </div>
            
            <div class="total-value-card" :class="problemType === 'min' ? 'value-min' : 'value-max'">
              <span class="value-label">Valor Total</span>
              <span class="value-number">{{ assignmentResult.totalValue }}</span>
            </div>

            <div class="assignment-list">
              <div v-for="(item, idx) in assignmentResult.assignments" :key="idx" class="assignment-item">
                <span class="assignment-origin">{{ item.origin }}</span>
                <svg class="arrow-icon" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd"/>
                </svg>
                <span class="assignment-destination">{{ item.destination }}</span>
                <span class="assignment-value">{{ item.value }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de resolución paso a paso -->
    <Teleport to="body">
      <div v-if="showResolution && resolutionSteps.length" class="modal-overlay" @click.self="closeResolution">
        <div class="result-modal">
          <div class="modal-header">
            <h2>Resolución Paso a Paso - Método Húngaro</h2>
            <button class="close-modal" @click="closeResolution">✕</button>
          </div>
          <div class="modal-body">
            <div class="steps-container">
              <div v-for="(step, idx) in resolutionSteps" :key="idx" class="step-card">
                <div class="step-header">
                  <div class="step-number">{{ idx + 1 }}</div>
                  <div>
                    <h4>{{ step.title }}</h4>
                    <p>{{ step.description }}</p>
                  </div>
                </div>
                <div class="step-matrix-wrapper">
                  <table class="result-table">
                    <thead>
                      <tr>
                        <th></th>
                        <th v-for="dest in detectedDestinations" :key="dest.id">{{ dest.label }}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(row, i) in step.matrix" :key="i">
                        <th>{{ detectedOrigins[i]?.label }}</th>
                        <td v-for="(cell, j) in row" :key="j" :class="{ 'highlight-cell': isHighlightedCell(step, i, j) }">
                          {{ cell }}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button @click="closeResolution" class="close-btn">Cerrar</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal de ayuda -->
    <Teleport to="body">
      <div v-if="showHelpModal" class="modal-overlay" @click.self="closeHelpModal">
        <div class="help-modal">
          <div class="modal-header">
            <h2>Guía del Algoritmo de Asignación</h2>
            <button class="close-modal" @click="closeHelpModal">✕</button>
          </div>
          <div class="modal-body">
            <div class="help-content-detailed">
              <div class="help-section">
                <h3>¿Qué es el Algoritmo de Asignación?</h3>
                <p>Resuelve problemas de asignación NxN utilizando el método húngaro, encontrando la asignación óptima que minimiza el costo o maximiza el beneficio.</p>
              </div>

              <div class="help-section">
                <h3>Pasos para usar:</h3>
                <div class="steps-list">
                  <div class="step-detail">
                    <div class="step-num">1</div>
                    <div class="step-text"><strong>Dibujar el grafo:</strong> Usa las herramientas para crear nodos O1...On y D1...Dn</div>
                  </div>
                  <div class="step-detail">
                    <div class="step-num">2</div>
                    <div class="step-text"><strong>Conectar nodos:</strong> Crea aristas entre orígenes y destinos con sus pesos</div>
                  </div>
                  <div class="step-detail">
                    <div class="step-num">3</div>
                    <div class="step-text"><strong>Generar matriz:</strong> Convierte el grafo en una matriz NxN</div>
                  </div>
                  <div class="step-detail">
                    <div class="step-num">4</div>
                    <div class="step-text"><strong>Ejecutar:</strong> Selecciona minimizar o maximizar y ejecuta el algoritmo</div>
                  </div>
                  <div class="step-detail">
                    <div class="step-num">5</div>
                    <div class="step-text"><strong>Explorar:</strong> Usa "Ver paso a paso" para entender el proceso</div>
                  </div>
                </div>
              </div>

              <div class="help-section">
                <h3>Herramientas del editor:</h3>
                <ul>
                  <li><strong>Mover (V):</strong> Reubica los nodos en el canvas</li>
                  <li><strong>Nodo (N):</strong> Agrega nuevos nodos</li>
                  <li><strong>Arista (E):</strong> Conecta origen y destino con un peso</li>
                  <li><strong>Borrar (D):</strong> Elimina elementos seleccionados</li>
                </ul>
              </div>

              <div class="help-note-box">
                <strong>💡 Nota importante:</strong> El grafo debe ser bipartito NxN (mismo número de orígenes que de destinos) para que el algoritmo funcione correctamente.
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <input ref="importInputRef" type="file" accept=".json" class="hidden-input" @change="importGraph">
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import GraphCanvas from "../components/GraphCanvas.vue";
import { useGraph } from "../composables/useGraph";

const {
  nodes,
  edges,
  matrixData,
  updateMatrix,
  clearGraph,
  currentMode,
  edgeStep,
  setMode,
  exportGraph,
  importGraph,
} = useGraph();

const importInputRef = ref(null);
const generatedMatrix = ref([]);
const matrixGenerated = ref(false);
const assignmentResult = ref(null);
const problemType = ref("");
const statusMessage = ref("");
const statusTone = ref("");
const detectedOrigins = ref([]);
const detectedDestinations = ref([]);
const resolutionSteps = ref([]);
const showResolution = ref(false);
const showHelpModal = ref(false);
const highlightedAssignmentEdgeIds = ref([]);
let isUpdatingAssignmentStyles = false;

const editorTools = [
  { mode: "move", label: "Mover", shortcut: "V", icon: "🖱️" },
  { mode: "node", label: "Nodo", shortcut: "N", icon: "⬤" },
  { mode: "edge", label: "Arista", shortcut: "E", icon: "🔗" },
  { mode: "delete", label: "Borrar", shortcut: "D", icon: "🗑️" },
];

const currentModeLabel = computed(() => {
  const active = editorTools.find(t => t.mode === currentMode.value);
  return active?.label || "Mover";
});

const triggerImport = () => importInputRef.value?.click();
const fitGraphToView = () => window.dispatchEvent(new CustomEvent("assignment-fit-graph"));

const defaultEdgeStyle = { color: { color: "#64748b" }, width: 2, dashes: false };
const highlightedEdgeStyle = { color: { color: "#f97316" }, width: 3, dashes: [10, 6] };

const parseNodeOrder = (label) => {
  const match = String(label).match(/(\d+)/);
  return match ? Number(match[1]) : Number.MAX_SAFE_INTEGER;
};

const sortByLabel = (a, b) => {
  const prefixA = String(a.label).charAt(0);
  const prefixB = String(b.label).charAt(0);
  if (prefixA !== prefixB) return prefixA.localeCompare(prefixB);
  return parseNodeOrder(a.label) - parseNodeOrder(b.label);
};

const resolvePartitions = () => {
  const allNodes = nodes.get();
  const edgeList = edges.get();

  const labeledOrigins = allNodes.filter(n => /^o\d+$/i.test(String(n.label).trim())).sort(sortByLabel);
  const labeledDestinations = allNodes.filter(n => /^d\d+$/i.test(String(n.label).trim())).sort(sortByLabel);

  if (labeledOrigins.length && labeledDestinations.length) {
    return { origins: labeledOrigins, destinations: labeledDestinations };
  }

  const outgoingByNode = new Map();
  const incomingByNode = new Map();
  allNodes.forEach(n => { outgoingByNode.set(n.id, 0); incomingByNode.set(n.id, 0); });
  edgeList.forEach(e => {
    outgoingByNode.set(e.from, (outgoingByNode.get(e.from) || 0) + 1);
    incomingByNode.set(e.to, (incomingByNode.get(e.to) || 0) + 1);
  });

  const origins = allNodes.filter(n => (outgoingByNode.get(n.id) || 0) > 0).sort(sortByLabel);
  const destinations = allNodes.filter(n => (incomingByNode.get(n.id) || 0) > 0).sort(sortByLabel);
  
  if (origins.length && destinations.length) return { origins, destinations };
  
  const sortedByX = [...allNodes].sort((a, b) => a.x - b.x);
  const half = Math.floor(sortedByX.length / 2);
  return { origins: sortedByX.slice(0, half).sort(sortByLabel), destinations: sortedByX.slice(half).sort(sortByLabel) };
};

const cloneMatrix = (m) => m.map(row => [...row]);

const reduceRows = (m) => m.map(row => { const min = Math.min(...row); return row.map(v => v - min); });
const reduceColumns = (m) => {
  const result = cloneMatrix(m);
  for (let col = 0; col < result[0]?.length; col++) {
    let min = Infinity;
    for (let row = 0; row < result.length; row++) min = Math.min(min, result[row][col]);
    for (let row = 0; row < result.length; row++) result[row][col] -= min;
  }
  return result;
};

const hungarianAlgorithm = (costMatrix) => {
  const n = costMatrix.length;
  const u = Array(n + 1).fill(0);
  const v = Array(n + 1).fill(0);
  const p = Array(n + 1).fill(0);
  const way = Array(n + 1).fill(0);

  for (let i = 1; i <= n; i++) {
    p[0] = i;
    let j0 = 0;
    const minv = Array(n + 1).fill(Infinity);
    const used = Array(n + 1).fill(false);
    do {
      used[j0] = true;
      const i0 = p[j0];
      let delta = Infinity;
      let j1 = 0;
      for (let j = 1; j <= n; j++) {
        if (!used[j]) {
          const cur = costMatrix[i0 - 1][j - 1] - u[i0] - v[j];
          if (cur < minv[j]) { minv[j] = cur; way[j] = j0; }
          if (minv[j] < delta) { delta = minv[j]; j1 = j; }
        }
      }
      for (let j = 0; j <= n; j++) {
        if (used[j]) { u[p[j]] += delta; v[j] -= delta; }
        else minv[j] -= delta;
      }
      j0 = j1;
    } while (p[j0] !== 0);
    do { const j1 = way[j0]; p[j0] = p[j1]; j0 = j1; } while (j0 !== 0);
  }
  const assignment = Array(n).fill(-1);
  for (let j = 1; j <= n; j++) if (p[j] !== 0) assignment[p[j] - 1] = j - 1;
  return assignment;
};

const buildResolutionSteps = (original, transformed, assignmentIdx) => {
  const steps = [
    { title: "Matriz inicial", description: "Matriz original obtenida desde el grafo.", matrix: cloneMatrix(original) }
  ];
  let current = cloneMatrix(transformed);
  if (problemType.value === "max") {
    steps.push({ title: "Transformación a minimización", description: "Para maximizar, se transforma la matriz restando cada valor del máximo.", matrix: cloneMatrix(current) });
  }
  current = reduceRows(current);
  steps.push({ title: "Reducción por filas", description: "Se resta el valor mínimo de cada fila a todos sus elementos.", matrix: cloneMatrix(current) });
  current = reduceColumns(current);
  steps.push({ title: "Reducción por columnas", description: "Se resta el valor mínimo de cada columna a todos sus elementos.", matrix: cloneMatrix(current) });
  steps.push({
    title: "Asignación óptima", description: "Celdas seleccionadas en la solución final.",
    matrix: cloneMatrix(original),
    highlightedCells: assignmentIdx.map((dest, orig) => ({ row: orig, col: dest }))
  });
  return steps;
};

const generateAssignmentMatrix = () => {
  updateMatrix();
  const { origins, destinations } = resolvePartitions();
  const labels = matrixData.value.labels || [];
  const fullMatrix = matrixData.value.matrix || [];

  detectedOrigins.value = origins;
  detectedDestinations.value = destinations;

  if (!origins.length || !destinations.length) {
    matrixGenerated.value = false;
    statusMessage.value = "No se pudo identificar el bipartito.";
    statusTone.value = "error";
    return;
  }
  if (origins.length !== destinations.length) {
    matrixGenerated.value = false;
    statusMessage.value = "El grafo debe ser bipartito NxN.";
    statusTone.value = "error";
    return;
  }

  const labelToIndex = new Map(labels.map((l, i) => [String(l).trim().toUpperCase(), i]));
  const originIdx = origins.map(n => labelToIndex.get(String(n.label).trim().toUpperCase()));
  const destIdx = destinations.map(n => labelToIndex.get(String(n.label).trim().toUpperCase()));

  generatedMatrix.value = originIdx.map(oi => destIdx.map(di => Number(fullMatrix[oi]?.[di] ?? 0)));
  matrixGenerated.value = true;
  assignmentResult.value = null;
  statusMessage.value = "Matriz generada correctamente.";
  statusTone.value = "success";
};

const runAssignment = () => {
  if (!matrixGenerated.value) {
    statusMessage.value = "Primero genera la matriz.";
    statusTone.value = "error";
    return;
  }
  if (!problemType.value) {
    statusMessage.value = "Selecciona minimizar o maximizar.";
    statusTone.value = "error";
    return;
  }

  const original = cloneMatrix(generatedMatrix.value);
  let working = cloneMatrix(original);
  if (problemType.value === "max") {
    const maxVal = Math.max(...working.flat());
    working = working.map(row => row.map(v => maxVal - v));
  }

  const assignment = hungarianAlgorithm(working);
  const assignments = assignment.map((destIdx, origIdx) => ({
    origin: detectedOrigins.value[origIdx]?.label || `O${origIdx + 1}`,
    destination: detectedDestinations.value[destIdx]?.label || `D${destIdx + 1}`,
    value: original[origIdx]?.[destIdx] ?? 0
  }));

  assignmentResult.value = { assignments, totalValue: assignments.reduce((s, i) => s + i.value, 0) };
  resolutionSteps.value = buildResolutionSteps(original, working, assignment);
  statusMessage.value = `Asignación óptima calculada exitosamente.`;
  statusTone.value = "success";
};

const toggleResolution = () => { if (assignmentResult.value) showResolution.value = !showResolution.value; };
const closeResolution = () => { showResolution.value = false; };
const closeHelpModal = () => { showHelpModal.value = false; };
const isHighlightedCell = (step, row, col) => step.highlightedCells?.some(c => c.row === row && c.col === col) ?? false;

const handleGraphChange = () => {
  matrixGenerated.value = false;
  assignmentResult.value = null;
  resolutionSteps.value = [];
  showResolution.value = false;
};

onMounted(() => {
  clearGraph();
  nodes.on("*", handleGraphChange);
  edges.on("*", handleGraphChange);
});

onUnmounted(() => {
  nodes.off("*", handleGraphChange);
  edges.off("*", handleGraphChange);
});
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.assignment-page {
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

.optimization-badge {
  padding: 12px 28px;
  border-radius: 40px;
  font-weight: bold;
  font-size: 1rem;
  color: white;
}

.badge-min {
  background: linear-gradient(135deg, #667eea, #764ba2);
}

.badge-max {
  background: linear-gradient(135deg, #f093fb, #f5576c);
}

/* Main Layout - 3 columnas */
.main-layout {
  display: grid;
  grid-template-columns: 300px 1fr 380px;
  gap: 24px;
}

/* Config Card - Panel izquierdo */
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

.tool-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.tool-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  border: 2px solid #e0e0e0;
  background: white;
  border-radius: 14px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
}

.tool-btn.active {
  border-color: #667eea;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.tool-icon {
  font-size: 1.1rem;
}

.tool-shortcut {
  margin-left: auto;
  font-size: 0.7rem;
  padding: 2px 6px;
  background: #f0f0f0;
  border-radius: 8px;
  font-family: monospace;
}

.tool-btn.active .tool-shortcut {
  background: rgba(255,255,255,0.2);
  color: white;
}

.action-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.btn-outline {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 12px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
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
  margin-bottom: 10px;
}

.info-status.active {
  color: #f59e0b;
}

.info-tips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.info-tips span {
  font-size: 0.7rem;
  padding: 4px 8px;
  background: #e9ecef;
  border-radius: 20px;
  color: #555;
}

.btn-help {
  width: 100%;
  padding: 12px;
  background: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 14px;
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

/* Canvas Card */
.canvas-card {
  background: white;
  border-radius: 24px;
  padding: 24px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

.canvas-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
}

.canvas-header h3 {
  margin: 0;
  color: #333;
  font-size: 1rem;
}

.canvas-pills {
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

.origin-dot { background: #3b82f6; }
.destination-dot { background: #8b5cf6; }

.canvas-container {
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

.canvas-container :deep(.graph-canvas-container) {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 450px;
}

/* Results Card - Panel derecho */
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

.blue-gradient { background: linear-gradient(135deg, #667eea, #764ba2); }
.purple-gradient { background: linear-gradient(135deg, #8b5cf6, #764ba2); }

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

/* Botones */
.btn-primary, .btn-secondary {
  width: 100%;
  padding: 10px 16px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: none;
  font-size: 0.85rem;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.btn-primary svg {
  width: 16px;
  height: 16px;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  margin-top: 10px;
  background: #e2e8f0;
  color: #334155;
}

.btn-secondary svg {
  width: 16px;
  height: 16px;
}

.btn-secondary:hover:not(:disabled) {
  background: #cbd5e1;
  transform: translateY(-2px);
}

/* Optimization Toggle */
.optimization-toggle {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.toggle-btn {
  flex: 1;
  padding: 8px;
  border: 2px solid #e0e0e0;
  background: white;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.85rem;
  transition: all 0.3s;
}

.toggle-btn.active {
  border-color: #667eea;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

/* Matriz */
.matrix-preview {
  max-height: 300px;
  overflow-y: auto;
}

.matrix-wrapper {
  overflow-x: auto;
  border-radius: 12px;
  border: 1px solid #e0e0e0;
  background: white;
}

.result-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.75rem;
}

.result-table th,
.result-table td {
  border: 1px solid #e0e0e0;
  padding: 8px;
  text-align: center;
}

.result-table th {
  background: #f8f9fa;
  font-weight: 600;
}

.has-value {
  background: #eff6ff;
  font-weight: 600;
  color: #3b82f6;
}

.highlight-cell {
  background: linear-gradient(135deg, #fef3c7, #fde68a) !important;
  color: #92400e !important;
  font-weight: 700;
}

/* Total Value Card */
.total-value-card {
  padding: 12px;
  border-radius: 14px;
  text-align: center;
  margin-bottom: 16px;
}

.value-min {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.value-max {
  background: linear-gradient(135deg, #f093fb, #f5576c);
  color: white;
}

.value-label {
  display: block;
  font-size: 0.65rem;
  opacity: 0.9;
  margin-bottom: 4px;
}

.value-number {
  display: block;
  font-size: 1.3rem;
  font-weight: bold;
}

/* Assignment List */
.assignment-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.assignment-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  transition: all 0.2s;
}

.assignment-item:hover {
  border-color: #667eea;
  transform: translateX(4px);
}

.assignment-origin, .assignment-destination {
  font-weight: 600;
  color: #333;
  font-size: 0.8rem;
}

.arrow-icon {
  width: 14px;
  height: 14px;
  color: #667eea;
}

.assignment-value {
  margin-left: auto;
  font-weight: 700;
  background: #eff6ff;
  padding: 2px 8px;
  border-radius: 20px;
  font-size: 0.75rem;
  color: #3b82f6;
}

/* Section headers */
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

.stat-badge, .result-badge {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.65rem;
  font-weight: 600;
}

.stat-badge {
  background: #dbeafe;
  color: #1e40af;
}

.result-badge.min {
  background: #dbeafe;
  color: #1e40af;
}

.result-badge.max {
  background: #fef3c7;
  color: #92400e;
}

/* Status message */
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

.result-modal, .help-modal {
  background: white;
  border-radius: 32px;
  width: 95%;
  max-width: 1000px;
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

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  justify-content: flex-end;
}

.close-btn {
  padding: 10px 24px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.85rem;
}

/* Steps */
.steps-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.step-card {
  background: #f8f9fa;
  border-radius: 16px;
  padding: 16px;
  border: 1px solid #e0e0e0;
}

.step-header {
  display: flex;
  gap: 14px;
  margin-bottom: 16px;
}

.step-number {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 0.85rem;
}

.step-header h4 {
  margin: 0 0 4px;
  font-size: 0.85rem;
}

.step-header p {
  margin: 0;
  font-size: 0.7rem;
  color: #666;
}

.step-matrix-wrapper {
  overflow-x: auto;
}

/* Help content */
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

/* Animations */
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
  
  .canvas-container :deep(.graph-canvas-container) {
    height: 400px;
  }
}

@media (max-width: 768px) {
  .assignment-page {
    padding: 16px;
  }
  
  .hero-section {
    padding: 24px;
  }
  
  .hero-content h1 {
    font-size: 1.5rem;
  }
  
  .tool-grid {
    grid-template-columns: 1fr;
  }
  
  .canvas-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .result-modal, .help-modal {
    width: 98%;
    max-height: 90vh;
  }
}
</style>