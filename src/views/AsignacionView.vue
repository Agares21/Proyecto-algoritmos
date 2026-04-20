<template>
  <div class="assignment-editor">
    <div class="assignment-header">
      <div class="header-content">
        <div class="header-title-section">
          <div class="title-icon-wrapper">
            <svg class="title-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 3H21V21H3V3Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M8 8H16V16H8V8Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 3V21M3 12H21" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </div>
          <div class="header-text">
            <h2>Algoritmo de Asignación</h2>
            <p>Dibuja un grafo bipartito NxN y conviértelo en matriz para resolver el problema</p>
          </div>
        </div>
        <div class="header-badge">
          <span class="badge-dot"></span>
          Método Húngaro
        </div>
      </div>
    </div>

    <div class="editor-layout">
      <div class="tools-panel">
        <div class="panel-header">
          <div class="panel-header-icon">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2h-2zM11 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2h-2z"/>
            </svg>
          </div>
          <h3>Herramientas</h3>
        </div>
        <div class="tools-content">
          <div class="tools-section">
            <p class="tools-caption">Selecciona un modo para editar el grafo.</p>
            <div class="tool-grid">
              <button
                v-for="tool in editorTools"
                :key="tool.mode"
                class="tool-button"
                :class="{ active: currentMode === tool.mode }"
                @click="setMode(tool.mode)"
              >
                <span class="tool-icon">{{ tool.icon }}</span>
                <span class="tool-text">{{ tool.label }}</span>
                <span class="tool-key">{{ tool.shortcut }}</span>
              </button>
            </div>
          </div>

          <div class="tools-section">
            <p class="tools-caption">Acciones rapidas del editor.</p>
            <div class="quick-actions">
              <button class="quick-action primary" @click="fitGraphToView">
                Ajustar grafo
              </button>
              <button class="quick-action" @click="exportGraph">
                Exportar
              </button>
              <button class="quick-action" @click="triggerImport">
                Importar
              </button>
              <button class="quick-action danger" @click="clearGraph">
                Limpiar
              </button>
            </div>
            <button class="panel-help-btn" @click="showTabHelp">
              Ayuda
            </button>
            <input
              ref="importInputRef"
              type="file"
              accept=".json"
              class="hidden-import-input"
              @change="importGraph"
            />
          </div>

          <div class="tools-section helper-section">
            <div v-if="currentMode === 'edge'" class="tool-status active-status">
              {{ edgeStep }}
            </div>
            <div v-else class="tool-status">
              Modo actual: {{ currentModeLabel }}
            </div>
            <div class="tool-tips">
              <span>Mover</span>
              <span>Nodo</span>
              <span>Arista</span>
              <span>Borrar</span>
            </div>
          </div>
        </div>
      </div>

      <div class="canvas-panel">
        <div class="canvas-header">
          <div class="canvas-title-section">
            <div class="canvas-title-icon">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M1 3a1 1 0 011-1h14a1 1 0 011 1v12a1 1 0 01-1 1H2a1 1 0 01-1-1V3zm2 1v10h12V4H3z" clip-rule="evenodd"/>
                <circle cx="7" cy="8" r="1.5" fill="currentColor"/>
                <circle cx="13" cy="8" r="1.5" fill="currentColor"/>
                <path d="M7 13L13 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            </div>
            <div>
              <h3>Editor de Grafos</h3>
              <p>Construye visualmente tu grafo bipartito</p>
            </div>
          </div>
          <div class="canvas-pills">
            <span class="pill pill-origin">
              <span class="pill-dot origin-dot"></span>
              Origen (O)
            </span>
            <span class="pill pill-destination">
              <span class="pill-dot destination-dot"></span>
              Destino (D)
            </span>
            <span class="pill pill-edge">
              <span class="pill-icon">→</span>
              Aristas con peso
            </span>
          </div>
        </div>
        <div class="graph-surface">
          <div class="graph-container">
            <div class="graph-backdrop"></div>
            <GraphCanvas />
          </div>
        </div>
      </div>

      <div class="config-panel">
        <div class="config-content">
          <!-- Tarjeta de Generación de Matriz -->
          <div class="config-card gradient-card">
            <div class="card-header">
              <div class="card-icon-wrapper blue-gradient">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V4z"/>
                  <path d="M3 8h14M8 3v14" stroke="white" stroke-width="1.5"/>
                </svg>
              </div>
              <div>
                <h3>Generar Matriz</h3>
                <p>O1...On = Orígenes | D1...Dn = Destinos</p>
              </div>
              <button class="resolution-close-btn" @click="closeResolution" aria-label="Cerrar resolución">
                ×
              </button>
            </div>
            <button @click="generateAssignmentMatrix" class="btn-primary btn-large">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"/>
              </svg>
              Generar matriz desde el grafo
            </button>
          </div>

          <!-- Tarjeta de Algoritmo -->
          <div class="config-card">
            <div class="card-header">
              <div class="card-icon-wrapper purple-gradient">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 10a8 8 0 1116 0 8 8 0 01-16 0zm8-6a6 6 0 100 12 6 6 0 000-12z"/>
                  <path d="M10 6v4l3 2" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
              </div>
              <div>
                <h3>Algoritmo</h3>
                <p>Selecciona el tipo de optimización</p>
              </div>
            </div>
            
            <div class="problem-toggle">
              <button
                @click="problemType = 'min'"
                :class="{ active: problemType === 'min' }"
                class="toggle-btn min-btn"
              >
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path d="M5 10h10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
                Minimizar
              </button>
              <button
                @click="problemType = 'max'"
                :class="{ active: problemType === 'max' }"
                class="toggle-btn max-btn"
              >
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 5v10M5 10h10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
                Maximizar
              </button>
            </div>

            <button
              @click="runAssignment"
              class="btn-primary"
              :disabled="!matrixGenerated || !problemType"
            >
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd"/>
              </svg>
              Ejecutar asignación
            </button>

            <button
              @click="toggleResolution"
              class="btn-secondary"
              :disabled="!assignmentResult"
            >
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"/>
              </svg>
              {{ showResolution ? "Ocultar resolución" : "Ver paso a paso" }}
            </button>
          </div>

          <!-- Matriz Generada -->
          <div v-if="matrixGenerated" class="matrix-section">
            <div class="section-header">
              <div class="section-title">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path d="M5 4a1 1 0 00-1 1v10a1 1 0 001 1h10a1 1 0 001-1V5a1 1 0 00-1-1H5zm0 2h10v8H5V6z"/>
                </svg>
                <h3>Matriz Generada</h3>
              </div>
              <div class="matrix-stats">
                <span class="stat-badge">{{ detectedOrigins.length }} × {{ detectedDestinations.length }}</span>
              </div>
            </div>
            <div class="matrix-table-wrapper">
              <table class="matrix-table">
                <thead>
                  <tr>
                    <th class="corner-cell"></th>
                    <th
                      v-for="destination in detectedDestinations"
                      :key="'destination-' + destination.id"
                      class="col-header"
                    >
                      {{ destination.label }}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, rowIndex) in generatedMatrix" :key="'row-' + rowIndex">
                    <th class="row-header">{{ detectedOrigins[rowIndex]?.label }}</th>
                    <td
                      v-for="(cell, colIndex) in row"
                      :key="'cell-' + rowIndex + '-' + colIndex"
                      :class="{ 'nonzero-cell': cell !== 0 }"
                    >
                      {{ cell }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Resultado -->
          <div v-if="assignmentResult" class="result-section">
            <div class="section-header">
              <div class="section-title">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
                <h3>Resultado Óptimo</h3>
              </div>
              <span class="result-badge" :class="problemType">
                {{ problemType === 'min' ? 'Costo mínimo' : 'Beneficio máximo' }}
              </span>
            </div>
            
            <div class="result-summary" :class="problemType">
              <span>Valor total</span>
              <strong>{{ assignmentResult.totalValue }}</strong>
            </div>

            <div class="assignment-list">
              <div
                v-for="(assignment, index) in assignmentResult.assignments"
                :key="'assignment-' + index"
                class="assignment-item"
              >
                <span class="assignment-origin">{{ assignment.origin }}</span>
                <svg class="assignment-arrow-icon" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd"/>
                </svg>
                <span class="assignment-destination">{{ assignment.destination }}</span>
                <span class="assignment-weight">{{ assignment.value }}</span>
              </div>
            </div>
          </div>

          <!-- Pasos de resolución -->
          <Teleport to="body">
          <div v-if="showResolution && resolutionSteps.length" class="resolution-section" @click.self="closeResolution">
            <div class="section-header">
              <div class="section-title">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                  <path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clip-rule="evenodd"/>
                </svg>
                <h3>Resolución Paso a Paso</h3>
              </div>
            </div>

            <div class="steps-container">
              <div
                v-for="(step, stepIndex) in resolutionSteps"
                :key="'resolution-step-' + stepIndex"
                class="step-card"
              >
                <div class="step-header">
                  <div class="step-number">{{ stepIndex + 1 }}</div>
                  <div class="step-info">
                    <h4>{{ step.title }}</h4>
                    <p>{{ step.description }}</p>
                  </div>
                </div>

                <div class="step-matrix">
                  <table class="matrix-table">
                    <thead>
                      <tr>
                        <th class="corner-cell"></th>
                        <th
                          v-for="destination in detectedDestinations"
                          :key="'resolution-destination-' + stepIndex + '-' + destination.id"
                          class="col-header"
                        >
                          {{ destination.label }}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(row, rowIndex) in step.matrix" :key="'resolution-row-' + stepIndex + '-' + rowIndex">
                        <th class="row-header">{{ detectedOrigins[rowIndex]?.label }}</th>
                        <td
                          v-for="(cell, colIndex) in row"
                          :key="'resolution-cell-' + stepIndex + '-' + rowIndex + '-' + colIndex"
                          :class="{
                            'nonzero-cell': cell !== 0,
                            'highlight-cell': isHighlightedCell(step, rowIndex, colIndex),
                          }"
                        >
                          {{ cell }}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div class="resolution-actions">
              <button class="resolution-back-btn" @click="closeResolution">
                Volver
              </button>
            </div>
          </div>
          </Teleport>

          <Teleport to="body">
          <div v-if="showHelpModal" class="help-modal-overlay" @click.self="closeHelpModal">
            <div class="help-modal">
              <div class="help-modal-header">
                <div class="section-title">
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-4a1 1 0 00-.867.5l-1 1.5a1 1 0 001.664 1.11L10 8.618l.203.304A1 1 0 0011.868 7.81l-1-1.5A1 1 0 0010 6zm0 8a1.25 1.25 0 100-2.5A1.25 1.25 0 0010 14z" clip-rule="evenodd"/>
                  </svg>
                  <h3>Ayuda</h3>
                </div>
                <button class="resolution-close-btn" @click="closeHelpModal" aria-label="Cerrar ayuda">
                  ×
                </button>
              </div>

              <div class="help-modal-body">
                <div class="help-block">
                  <h4>¿Qué hace esta pestaña?</h4>
                  <p>
                    Esta vista resuelve problemas de asignación a partir de un grafo bipartito NxN.
                    Puedes dibujar el grafo, importarlo, generar la matriz de costos o beneficios y
                    ejecutar el algoritmo para obtener la mejor asignación.
                  </p>
                </div>

                <div class="help-block">
                  <h4>Cómo usarla</h4>
                  <p>1. Crea o importa un grafo bipartito.</p>
                  <p>2. Usa nodos tipo O1...On para orígenes y D1...Dn para destinos.</p>
                  <p>3. Conecta los nodos con aristas y asigna sus pesos.</p>
                  <p>4. Pulsa `Generar matriz desde el grafo`.</p>
                  <p>5. Elige si deseas minimizar o maximizar.</p>
                  <p>6. Ejecuta el algoritmo para ver el resultado óptimo.</p>
                  <p>7. Si quieres entender el proceso, abre `Ver paso a paso`.</p>
                </div>

                <div class="help-block">
                  <h4>Herramientas del editor</h4>
                  <p><strong>Mover:</strong> reubica los nodos.</p>
                  <p><strong>Nodo:</strong> agrega nuevos nodos al lienzo.</p>
                  <p><strong>Arista:</strong> conecta origen y destino con un peso.</p>
                  <p><strong>Borrar:</strong> elimina nodos o aristas seleccionadas.</p>
                </div>

                <div class="help-block">
                  <h4>Atajos útiles</h4>
                  <p>`V` mover, `N` nodo, `E` arista y `D` borrar.</p>
                  <p>Doble clic en un nodo o una arista para editar su nombre o peso.</p>
                </div>
              </div>

              <div class="help-modal-actions">
                <button class="resolution-back-btn" @click="closeHelpModal">
                  Cerrar
                </button>
              </div>
            </div>
          </div>
          </Teleport>

          <!-- Mensaje de estado -->
          <div v-if="statusMessage" class="status-message" :class="statusTone">
            <svg v-if="statusTone === 'success'" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
            <svg v-else-if="statusTone === 'error'" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
            </svg>
            <svg v-else viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
            </svg>
            <span>{{ statusMessage }}</span>
          </div>
        </div>
      </div>
    </div>
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
const statusTone = ref("neutral");
const detectedOrigins = ref([]);
const detectedDestinations = ref([]);
const resolutionSteps = ref([]);
const showResolution = ref(false);
const showHelpModal = ref(false);
const highlightedAssignmentEdgeIds = ref([]);
let isUpdatingAssignmentStyles = false;

const editorTools = [
  { mode: "move", label: "Mover", shortcut: "V" },
  { mode: "node", label: "Nodo", shortcut: "N" },
  { mode: "edge", label: "Arista", shortcut: "E" },
  { mode: "delete", label: "Borrar", shortcut: "D" },
];

const currentModeLabel = computed(() => {
  const activeTool = editorTools.find((tool) => tool.mode === currentMode.value);
  return activeTool?.label || "Mover";
});

const triggerImport = () => {
  importInputRef.value?.click();
};

const fitGraphToView = () => {
  window.dispatchEvent(new CustomEvent("assignment-fit-graph"));
};

const defaultEdgeStyle = {
  color: {
    color: "#64748b",
  },
  width: 2,
  dashes: false,
};

const highlightedAssignmentEdgeStyle = {
  color: {
    color: "#f97316",
  },
  width: 3,
  dashes: [10, 6],
};

const parseNodeOrder = (label) => {
  const match = String(label).match(/(\d+)/);
  return match ? Number(match[1]) : Number.MAX_SAFE_INTEGER;
};

const sortByLabel = (a, b) => {
  const prefixA = String(a.label).charAt(0);
  const prefixB = String(b.label).charAt(0);

  if (prefixA !== prefixB) {
    return prefixA.localeCompare(prefixB);
  }

  const orderDifference = parseNodeOrder(a.label) - parseNodeOrder(b.label);
  if (orderDifference !== 0) {
    return orderDifference;
  }

  return String(a.label).localeCompare(String(b.label));
};

const getPositionBasedPartition = (allNodes) => {
  const normalizedNodes = allNodes.map((node) => ({
    ...node,
    x: Number(node.x ?? 0),
  }));

  if (normalizedNodes.length < 2 || normalizedNodes.length % 2 !== 0) {
    return { origins: [], destinations: [] };
  }

  const sortedByX = [...normalizedNodes].sort((a, b) => a.x - b.x);
  const half = sortedByX.length / 2;

  return {
    origins: sortedByX.slice(0, half).sort(sortByLabel),
    destinations: sortedByX.slice(half).sort(sortByLabel),
  };
};

const getEdgeBasedPartition = (allNodes, edgeList) => {
  if (allNodes.length < 2) {
    return { origins: [], destinations: [] };
  }

  const outgoingByNode = new Map();
  const incomingByNode = new Map();

  allNodes.forEach((node) => {
    outgoingByNode.set(node.id, 0);
    incomingByNode.set(node.id, 0);
  });

  edgeList.forEach((edge) => {
    outgoingByNode.set(edge.from, (outgoingByNode.get(edge.from) || 0) + 1);
    incomingByNode.set(edge.to, (incomingByNode.get(edge.to) || 0) + 1);
  });

  const origins = allNodes
    .filter((node) => (outgoingByNode.get(node.id) || 0) > 0)
    .sort(sortByLabel);
  const destinations = allNodes
    .filter((node) => (incomingByNode.get(node.id) || 0) > 0)
    .sort(sortByLabel);

  if (origins.length === 0 || destinations.length === 0) {
    return { origins: [], destinations: [] };
  }

  return { origins, destinations };
};

const resolvePartitions = () => {
  const allNodes = nodes.get();
  const edgeList = edges.get();

  const labeledOrigins = allNodes
    .filter((node) => /^o\d+$/i.test(String(node.label).trim()))
    .sort(sortByLabel);
  const labeledDestinations = allNodes
    .filter((node) => /^d\d+$/i.test(String(node.label).trim()))
    .sort(sortByLabel);

  if (labeledOrigins.length > 0 && labeledDestinations.length > 0) {
    return {
      origins: labeledOrigins,
      destinations: labeledDestinations,
      mode: "labels",
    };
  }

  const edgePartition = getEdgeBasedPartition(allNodes, edgeList);
  if (edgePartition.origins.length > 0 && edgePartition.destinations.length > 0) {
    return {
      ...edgePartition,
      mode: "edges",
    };
  }

  const positionPartition = getPositionBasedPartition(allNodes);
  if (positionPartition.origins.length > 0 && positionPartition.destinations.length > 0) {
    return {
      ...positionPartition,
      mode: "positions",
    };
  }

  return { origins: [], destinations: [], mode: "none" };
};

const cloneMatrix = (matrix) => matrix.map((row) => [...row]);

const resetAssignmentHighlight = () => {
  if (!highlightedAssignmentEdgeIds.value.length) {
    return;
  }

  const edgeIdsToReset = [...highlightedAssignmentEdgeIds.value];
  highlightedAssignmentEdgeIds.value = [];
  isUpdatingAssignmentStyles = true;

  edges.update(
    edgeIdsToReset.map((edgeId) => ({
      id: edgeId,
      ...defaultEdgeStyle,
    })),
  );
  isUpdatingAssignmentStyles = false;
};

const highlightAssignmentInGraph = (assignmentIndexes) => {
  resetAssignmentHighlight();

  const currentEdges = edges.get();
  const edgeIdsToHighlight = assignmentIndexes
    .map((destinationIndex, originIndex) => {
      const originId = detectedOrigins.value[originIndex]?.id;
      const destinationId = detectedDestinations.value[destinationIndex]?.id;

      if (originId === undefined || destinationId === undefined) {
        return null;
      }

      const matchingEdge = currentEdges.find(
        (edge) => edge.from === originId && edge.to === destinationId,
      );

      return matchingEdge?.id ?? null;
    })
    .filter((edgeId) => edgeId !== null);

  if (!edgeIdsToHighlight.length) {
    return;
  }

  highlightedAssignmentEdgeIds.value = edgeIdsToHighlight;
  isUpdatingAssignmentStyles = true;
  edges.update(
    edgeIdsToHighlight.map((edgeId) => ({
      id: edgeId,
      ...highlightedAssignmentEdgeStyle,
    })),
  );
  isUpdatingAssignmentStyles = false;
};

const reduceRows = (matrix) =>
  matrix.map((row) => {
    const minValue = Math.min(...row);
    return row.map((value) => value - minValue);
  });

const reduceColumns = (matrix) => {
  const reducedMatrix = cloneMatrix(matrix);
  const totalColumns = reducedMatrix[0]?.length || 0;

  for (let col = 0; col < totalColumns; col++) {
    let minValue = Infinity;
    for (let row = 0; row < reducedMatrix.length; row++) {
      minValue = Math.min(minValue, reducedMatrix[row][col]);
    }
    for (let row = 0; row < reducedMatrix.length; row++) {
      reducedMatrix[row][col] -= minValue;
    }
  }

  return reducedMatrix;
};

const buildResolutionSteps = (originalMatrix, transformedMatrix, assignmentIndexes) => {
  const steps = [
    {
      title: "Matriz inicial",
      description: "Se muestra la matriz original obtenida desde el grafo.",
      matrix: cloneMatrix(originalMatrix),
    },
  ];

  let currentMatrix = cloneMatrix(transformedMatrix);

  if (problemType.value === "max") {
    steps.push({
      title: "Transformacion a minimizacion",
      description: "Para maximizar, se transforma la matriz antes de aplicar el algoritmo hungaro.",
      matrix: cloneMatrix(currentMatrix),
    });
  }

  currentMatrix = reduceRows(currentMatrix);
  steps.push({
    title: "Reduccion por filas",
    description: "Se resta el menor valor de cada fila.",
    matrix: cloneMatrix(currentMatrix),
  });

  currentMatrix = reduceColumns(currentMatrix);
  steps.push({
    title: "Reduccion por columnas",
    description: "Se resta el menor valor de cada columna.",
    matrix: cloneMatrix(currentMatrix),
  });

  steps.push({
    title: "Asignacion optima",
    description: "Se resaltan las celdas elegidas por la solucion final.",
    matrix: cloneMatrix(originalMatrix),
    highlightedCells: assignmentIndexes.map((destinationIndex, originIndex) => ({
      row: originIndex,
      col: destinationIndex,
    })),
  });

  return steps;
};

const generateAssignmentMatrix = () => {
  updateMatrix();

  const { origins: originList, destinations: destinationList } = resolvePartitions();
  const labels = matrixData.value.labels || [];
  const fullMatrix = matrixData.value.matrix || [];

  detectedOrigins.value = originList;
  detectedDestinations.value = destinationList;

  if (originList.length === 0 || destinationList.length === 0) {
    matrixGenerated.value = false;
    generatedMatrix.value = [];
    resolutionSteps.value = [];
    showResolution.value = false;
    statusMessage.value = "No se pudo identificar el bipartito.";
    statusTone.value = "error";
    return;
  }

  if (originList.length !== destinationList.length) {
    matrixGenerated.value = false;
    generatedMatrix.value = [];
    resolutionSteps.value = [];
    showResolution.value = false;
    statusMessage.value = "El grafo debe ser bipartito NxN.";
    statusTone.value = "error";
    return;
  }

  const labelToIndex = new Map(
    labels.map((label, index) => [String(label).trim().toUpperCase(), index]),
  );
  const originIndexes = originList.map((node) =>
    labelToIndex.get(String(node.label).trim().toUpperCase()),
  );
  const destinationIndexes = destinationList.map((node) =>
    labelToIndex.get(String(node.label).trim().toUpperCase()),
  );

  if (
    originIndexes.some((index) => index === undefined) ||
    destinationIndexes.some((index) => index === undefined)
  ) {
    matrixGenerated.value = false;
    generatedMatrix.value = [];
    resolutionSteps.value = [];
    showResolution.value = false;
    statusMessage.value = "No se pudieron ubicar los nodos en la matriz.";
    statusTone.value = "error";
    return;
  }

  const matrix = originIndexes.map((originIndex) =>
    destinationIndexes.map((destinationIndex) =>
      Number(fullMatrix[originIndex]?.[destinationIndex] ?? 0),
    ),
  );

  generatedMatrix.value = matrix;
  matrixGenerated.value = true;
  assignmentResult.value = null;
  resolutionSteps.value = [];
  showResolution.value = false;
  resetAssignmentHighlight();
  statusMessage.value = "Matriz generada correctamente.";
  statusTone.value = "success";
};

const runAssignment = () => {
  if (!matrixGenerated.value || generatedMatrix.value.length === 0) {
    statusMessage.value = "Primero genera la matriz desde el grafo.";
    statusTone.value = "error";
    return;
  }

  if (!problemType.value) {
    statusMessage.value = "Selecciona si deseas minimizar o maximizar antes de ejecutar.";
    statusTone.value = "error";
    return;
  }

  const originalMatrix = cloneMatrix(generatedMatrix.value);
  let workingMatrix = cloneMatrix(originalMatrix);

  if (problemType.value === "max") {
    const maxValue = Math.max(...workingMatrix.flat());
    workingMatrix = workingMatrix.map((row) => row.map((value) => maxValue - value));
  }

  const assignmentIndexes = hungarianAlgorithm(workingMatrix);
  const assignments = assignmentIndexes.map((destinationIndex, originIndex) => ({
    origin: detectedOrigins.value[originIndex]?.label || `O${originIndex + 1}`,
    destination: detectedDestinations.value[destinationIndex]?.label || `D${destinationIndex + 1}`,
    value: originalMatrix[originIndex]?.[destinationIndex] ?? 0,
  }));

  assignmentResult.value = {
    assignments,
    totalValue: assignments.reduce((sum, item) => sum + item.value, 0),
  };
  resolutionSteps.value = buildResolutionSteps(originalMatrix, workingMatrix, assignmentIndexes);
  showResolution.value = false;
  highlightAssignmentInGraph(assignmentIndexes);
  statusMessage.value =
    problemType.value === "min"
      ? "Asignacion optima calculada por minimizacion."
      : "Asignacion optima calculada por maximizacion.";
  statusTone.value = "success";
};

const toggleResolution = () => {
  if (!assignmentResult.value) return;
  showResolution.value = !showResolution.value;
};

const closeResolution = () => {
  showResolution.value = false;
};

const showTabHelp = () => {
  showHelpModal.value = true;
};

const closeHelpModal = () => {
  showHelpModal.value = false;
};

const handleViewKeyDown = (event) => {
  if (event.key === "Escape" && showResolution.value) {
    closeResolution();
  }

  if (event.key === "Escape" && showHelpModal.value) {
    closeHelpModal();
  }
};

const isHighlightedCell = (step, rowIndex, colIndex) =>
  step.highlightedCells?.some((cell) => cell.row === rowIndex && cell.col === colIndex) ?? false;

watch(problemType, (newValue, oldValue) => {
  if (!oldValue || newValue === oldValue) {
    return;
  }

  assignmentResult.value = null;
  resolutionSteps.value = [];
  showResolution.value = false;
  resetAssignmentHighlight();
  statusMessage.value = newValue
    ? `Modo ${newValue === "min" ? "minimizacion" : "maximizacion"} seleccionado. Ejecuta el algoritmo para ver el nuevo resultado.`
    : "";
  statusTone.value = "neutral";
});

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
          if (cur < minv[j]) {
            minv[j] = cur;
            way[j] = j0;
          }
          if (minv[j] < delta) {
            delta = minv[j];
            j1 = j;
          }
        }
      }

      for (let j = 0; j <= n; j++) {
        if (used[j]) {
          u[p[j]] += delta;
          v[j] -= delta;
        } else {
          minv[j] -= delta;
        }
      }
      j0 = j1;
    } while (p[j0] !== 0);

    do {
      const j1 = way[j0];
      p[j0] = p[j1];
      j0 = j1;
    } while (j0 !== 0);
  }

  const assignment = Array(n).fill(-1);
  for (let j = 1; j <= n; j++) {
    if (p[j] !== 0) {
      assignment[p[j] - 1] = j - 1;
    }
  }

  return assignment;
};

const handleGraphChange = () => {
  if (isUpdatingAssignmentStyles) {
    return;
  }

  matrixGenerated.value = false;
  generatedMatrix.value = [];
  assignmentResult.value = null;
  problemType.value = "";
  detectedOrigins.value = [];
  detectedDestinations.value = [];
  resolutionSteps.value = [];
  showResolution.value = false;
  resetAssignmentHighlight();
  statusMessage.value = "";
  statusTone.value = "neutral";
};

onMounted(() => {
  clearGraph();
  handleGraphChange();
  nodes.on("*", handleGraphChange);
  edges.on("*", handleGraphChange);
  window.addEventListener("keydown", handleViewKeyDown);
});

onUnmounted(() => {
  nodes.off("*", handleGraphChange);
  edges.off("*", handleGraphChange);
  window.removeEventListener("keydown", handleViewKeyDown);
});
</script>

<style scoped>
/* Variables y reset */
.assignment-editor {
  --primary-blue: #3b82f6;
  --primary-purple: #8b5cf6;
  --success-green: #10b981;
  --warning-orange: #f59e0b;
  --error-red: #ef4444;
  --gray-50: #f8fafc;
  --gray-100: #f1f5f9;
  --gray-200: #e2e8f0;
  --gray-600: #475569;
  --gray-700: #334155;
  --gray-800: #1e293b;
  --gray-900: #0f172a;
  
  width: 100%;
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #fdf4ff 100%);
  overflow: hidden;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* Header mejorado */
.assignment-header {
  padding: 20px 32px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(59, 130, 246, 0.15);
  flex-shrink: 0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-title-section {
  display: flex;
  align-items: center;
  gap: 16px;
}

.title-icon-wrapper {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 20px rgba(59, 130, 246, 0.25);
}

.title-icon {
  width: 28px;
  height: 28px;
  color: white;
}

.header-text h2 {
  margin: 0 0 4px;
  font-size: 1.6rem;
  font-weight: 700;
  background: linear-gradient(135deg, var(--gray-900), var(--gray-700));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.header-text p {
  margin: 0;
  font-size: 0.9rem;
  color: var(--gray-600);
}

.header-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
  border-radius: 100px;
  border: 1px solid rgba(59, 130, 246, 0.2);
  color: var(--primary-blue);
  font-weight: 600;
  font-size: 0.85rem;
}

.badge-dot {
  width: 8px;
  height: 8px;
  background: var(--primary-blue);
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Layout principal */
.editor-layout {
  display: flex;
  flex: 1;
  min-height: 0;
  overflow: hidden;
  gap: 20px;
  padding: 20px;
}

/* Panel de herramientas */
.tools-panel {
  width: 300px;
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.tools-content {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.tools-section {
  background: rgba(255, 255, 255, 0.88);
  border: 1px solid rgba(226, 232, 240, 0.9);
  border-radius: 18px;
  padding: 16px;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.05);
}

.tools-caption {
  margin: 0 0 14px;
  font-size: 0.82rem;
  color: var(--gray-600);
  line-height: 1.45;
}

.tool-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.tool-button {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  border-radius: 14px;
  border: 1px solid rgba(203, 213, 225, 0.95);
  background: linear-gradient(180deg, #ffffff, #f8fafc);
  color: var(--gray-700);
  cursor: pointer;
  transition: all 0.2s ease;
}

.tool-button:hover {
  transform: translateY(-1px);
  border-color: rgba(96, 165, 250, 0.55);
  box-shadow: 0 12px 22px rgba(59, 130, 246, 0.08);
}

.tool-button.active {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: #ffffff;
  border-color: transparent;
  box-shadow: 0 14px 26px rgba(37, 99, 235, 0.22);
}

.tool-icon {
  width: 30px;
  height: 30px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: rgba(226, 232, 240, 0.72);
  font-size: 0.82rem;
  font-weight: 800;
}

.tool-button.active .tool-icon {
  background: rgba(255, 255, 255, 0.2);
}

.tool-text {
  flex: 1;
  text-align: left;
  font-size: 0.84rem;
  font-weight: 700;
}

.tool-key {
  font-size: 0.72rem;
  font-family: monospace;
  padding: 3px 7px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.06);
}

.tool-button.active .tool-key {
  background: rgba(255, 255, 255, 0.18);
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.quick-action {
  border: 1px solid rgba(191, 219, 254, 0.95);
  background: linear-gradient(180deg, #ffffff, #eff6ff);
  color: #1d4ed8;
  border-radius: 14px;
  padding: 11px 12px;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.quick-action:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 22px rgba(59, 130, 246, 0.1);
}

.quick-action.primary {
  background: linear-gradient(135deg, #3b82f6, #0ea5e9);
  color: #ffffff;
  border-color: transparent;
}

.quick-action.danger {
  background: linear-gradient(180deg, #fff1f2, #ffe4e6);
  color: #be123c;
  border-color: rgba(253, 164, 175, 0.9);
}

.panel-help-btn {
  width: 100%;
  margin-top: 12px;
  border: 1px solid rgba(191, 219, 254, 0.95);
  background: linear-gradient(180deg, #ffffff, #eff6ff);
  color: #1d4ed8;
  border-radius: 14px;
  padding: 11px 12px;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.panel-help-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 22px rgba(59, 130, 246, 0.1);
}

.hidden-import-input {
  display: none;
}

.helper-section {
  margin-top: auto;
}

.tool-status {
  padding: 11px 12px;
  border-radius: 12px;
  background: #f8fafc;
  border: 1px solid rgba(226, 232, 240, 0.95);
  color: var(--gray-700);
  font-size: 0.8rem;
  font-weight: 600;
}

.tool-status.active-status {
  background: #fff7ed;
  border-color: rgba(253, 186, 116, 0.8);
  color: #c2410c;
}

.tool-tips {
  margin-top: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tool-tips span {
  padding: 5px 9px;
  border-radius: 999px;
  background: rgba(241, 245, 249, 0.95);
  color: var(--gray-600);
  font-size: 0.72rem;
  font-weight: 700;
}

.panel-header {
  padding: 20px;
  border-bottom: 1px solid var(--gray-200);
  display: flex;
  align-items: center;
  gap: 12px;
}

.panel-header-icon {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-blue);
}

.panel-header-icon svg {
  width: 20px;
  height: 20px;
}

.panel-header h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--gray-800);
}

/* Panel del canvas */
.canvas-panel {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.canvas-header {
  padding: 20px 24px;
  border-bottom: 1px solid var(--gray-200);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}

.canvas-title-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.canvas-title-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #dbeafe, #bfdbfe);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-blue);
}

.canvas-title-icon svg {
  width: 22px;
  height: 22px;
}

.canvas-title-section h3 {
  margin: 0 0 4px;
  font-size: 1rem;
  font-weight: 600;
  color: var(--gray-800);
}

.canvas-title-section p {
  margin: 0;
  font-size: 0.8rem;
  color: var(--gray-600);
}

.canvas-pills {
  display: flex;
  gap: 8px;
}

.pill {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  background: white;
  border-radius: 100px;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--gray-700);
  border: 1px solid var(--gray-200);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
}

.pill-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.origin-dot {
  background: #3b82f6;
  box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
}

.destination-dot {
  background: #8b5cf6;
  box-shadow: 0 0 10px rgba(139, 92, 246, 0.5);
}

.pill-icon {
  color: var(--primary-blue);
  font-weight: 700;
}

.graph-surface {
  flex: 1;
  min-height: 0;
  padding: 20px;
}

.graph-container {
  position: relative;
  height: 100%;
  min-height: 420px;
  border-radius: 20px;
  overflow: hidden;
  background: linear-gradient(180deg, #fafcff 0%, #f0f4ff 100%);
  border: 1px solid rgba(59, 130, 246, 0.15);
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.02), 0 8px 20px rgba(0, 0, 0, 0.04);
}

.graph-backdrop {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background-image: 
    radial-gradient(circle at 20% 30%, rgba(59, 130, 246, 0.08) 0%, transparent 30%),
    radial-gradient(circle at 80% 70%, rgba(139, 92, 246, 0.08) 0%, transparent 30%),
    linear-gradient(rgba(59, 130, 246, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(59, 130, 246, 0.03) 1px, transparent 1px);
  background-size: 100% 100%, 100% 100%, 24px 24px, 24px 24px;
}

.graph-container :deep(.graph-canvas-container) {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
}

.graph-container :deep(.graph-canvas) {
  width: 100%;
  height: 100%;
  background: transparent;
}

/* Panel de configuración */
.config-panel {
  width: 420px;
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.05);
  overflow-y: auto;
}

.config-content {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Tarjetas */
.config-card {
  background: white;
  border-radius: 20px;
  padding: 20px;
  border: 1px solid var(--gray-200);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
  transition: all 0.2s ease;
}

.config-card:hover {
  border-color: rgba(59, 130, 246, 0.3);
  box-shadow: 0 8px 24px rgba(59, 130, 246, 0.08);
}

.gradient-card {
  background: linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%);
  border: 1px solid rgba(59, 130, 246, 0.2);
}

.card-header {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  margin-bottom: 18px;
}

.card-icon-wrapper {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.card-icon-wrapper svg {
  width: 22px;
  height: 22px;
  color: white;
}

.blue-gradient {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
}

.purple-gradient {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
}

.card-header h3 {
  margin: 0 0 4px;
  font-size: 1rem;
  font-weight: 600;
  color: var(--gray-800);
}

.card-header p {
  margin: 0;
  font-size: 0.8rem;
  color: var(--gray-600);
}

/* Botones */
.btn-primary,
.btn-secondary {
  width: 100%;
  padding: 12px 18px;
  border-radius: 14px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: none;
}

.btn-primary {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.btn-primary svg {
  width: 18px;
  height: 18px;
  fill: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(59, 130, 246, 0.4);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  box-shadow: none;
}

.btn-secondary {
  margin-top: 10px;
  background: var(--gray-50);
  color: var(--gray-700);
  border: 1px solid var(--gray-200);
}

.btn-secondary svg {
  width: 18px;
  height: 18px;
  fill: currentColor;
}

.btn-secondary:hover:not(:disabled) {
  background: white;
  border-color: var(--primary-blue);
  color: var(--primary-blue);
}

.btn-large {
  padding: 14px 20px;
  font-size: 1rem;
}

/* Toggle de problema */
.problem-toggle {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
  padding: 6px;
  background: var(--gray-100);
  border-radius: 16px;
}

.toggle-btn {
  flex: 1;
  padding: 10px 12px;
  border: none;
  border-radius: 12px;
  background: transparent;
  color: var(--gray-600);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.toggle-btn svg {
  width: 16px;
  height: 16px;
}

.toggle-btn:hover {
  background: rgba(255, 255, 255, 0.7);
  color: var(--gray-800);
}

.toggle-btn.active {
  background: white;
  color: var(--primary-blue);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.toggle-btn.min-btn.active {
  color: #3b82f6;
}

.toggle-btn.max-btn.active {
  color: #8b5cf6;
}

/* Secciones */
.matrix-section,
.result-section,
.resolution-section {
  background: white;
  border-radius: 20px;
  padding: 20px;
  border: 1px solid var(--gray-200);
}

.resolution-section {
  position: fixed;
  top: 50%;
  left: 50%;
  z-index: 80;
  display: flex;
  flex-direction: column;
  width: min(960px, calc(100vw - 48px));
  max-height: calc(100vh - 48px);
  transform: translate(-50%, -50%);
  padding: 24px;
  background: rgba(255, 255, 255, 0.98);
  box-shadow:
    0 32px 80px rgba(15, 23, 42, 0.26),
    0 0 0 9999px rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(8px);
}

.help-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 90;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(6px);
}

.help-modal {
  width: min(760px, calc(100vw - 48px));
  max-height: calc(100vh - 48px);
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.98);
  border: 1px solid rgba(226, 232, 240, 0.9);
  border-radius: 24px;
  box-shadow: 0 32px 80px rgba(15, 23, 42, 0.26);
  overflow: hidden;
}

.help-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 22px 24px 18px;
  border-bottom: 1px solid var(--gray-200);
}

.help-modal-body {
  overflow-y: auto;
  padding: 22px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.help-block {
  background: linear-gradient(135deg, var(--gray-50), white);
  border: 1px solid var(--gray-200);
  border-radius: 18px;
  padding: 16px 18px;
}

.help-block h4 {
  margin: 0 0 10px;
  font-size: 0.92rem;
  font-weight: 700;
  color: var(--gray-800);
}

.help-block p {
  margin: 0 0 8px;
  font-size: 0.84rem;
  line-height: 1.6;
  color: var(--gray-700);
}

.help-block p:last-child {
  margin-bottom: 0;
}

.help-modal-actions {
  display: flex;
  justify-content: flex-end;
  padding: 18px 24px 22px;
  border-top: 1px solid var(--gray-200);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.section-title svg {
  width: 20px;
  height: 20px;
  color: var(--primary-blue);
}

.section-title h3 {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--gray-800);
}

.resolution-close-btn {
  width: 38px;
  height: 38px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #eff6ff, #dbeafe);
  color: var(--primary-blue);
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
  transition: all 0.2s ease;
}

.resolution-close-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 20px rgba(59, 130, 246, 0.15);
}

.matrix-stats {
  display: flex;
  gap: 8px;
}

.stat-badge {
  padding: 4px 10px;
  background: linear-gradient(135deg, #dbeafe, #bfdbfe);
  border-radius: 100px;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--primary-blue);
}

/* Tabla de matriz */
.matrix-table-wrapper {
  overflow-x: auto;
  border-radius: 14px;
  border: 1px solid var(--gray-200);
  background: white;
}

.matrix-table {
  border-collapse: collapse;
  width: 100%;
  font-size: 0.8rem;
}

.matrix-table th,
.matrix-table td {
  border: 1px solid var(--gray-200);
  padding: 10px 12px;
  text-align: center;
  min-width: 50px;
}

.matrix-table th {
  background: linear-gradient(180deg, var(--gray-50), var(--gray-100));
  font-weight: 600;
  color: var(--gray-700);
}

.row-header {
  font-weight: 600;
  background: var(--gray-50);
}

.nonzero-cell {
  background: linear-gradient(135deg, #eff6ff, #dbeafe);
  color: var(--primary-blue);
  font-weight: 600;
}

.highlight-cell {
  background: linear-gradient(135deg, #fef3c7, #fde68a) !important;
  color: #92400e !important;
  font-weight: 700;
  box-shadow: inset 0 0 0 2px #fbbf24;
}

/* Resultado */
.result-badge {
  padding: 4px 12px;
  border-radius: 100px;
  font-size: 0.75rem;
  font-weight: 600;
}

.result-badge.min {
  background: #dcfce7;
  color: #166534;
}

.result-badge.max {
  background: #dbeafe;
  color: #1e40af;
}

.result-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-radius: 14px;
  margin-bottom: 16px;
  font-size: 0.9rem;
  font-weight: 600;
}

.result-summary.min {
  background: linear-gradient(135deg, #f0fdf4, #dcfce7);
  color: #166534;
}

.result-summary.max {
  background: linear-gradient(135deg, #eff6ff, #dbeafe);
  color: #1e40af;
}

.result-summary strong {
  font-size: 1.3rem;
}

.assignment-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.assignment-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  background: linear-gradient(135deg, var(--gray-50), white);
  border: 1px solid var(--gray-200);
  border-radius: 12px;
  font-size: 0.85rem;
  transition: all 0.2s;
}

.assignment-item:hover {
  border-color: var(--primary-blue);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
  transform: translateX(4px);
}

.assignment-origin,
.assignment-destination {
  font-weight: 600;
  color: var(--gray-800);
}

.assignment-arrow-icon {
  width: 16px;
  height: 16px;
  color: var(--primary-blue);
}

.assignment-weight {
  margin-left: auto;
  font-weight: 700;
  color: var(--primary-blue);
  background: #eff6ff;
  padding: 4px 10px;
  border-radius: 100px;
  font-size: 0.8rem;
}

/* Pasos de resolución */
.steps-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
  padding-right: 4px;
}

.resolution-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 18px;
  padding-top: 16px;
  border-top: 1px solid var(--gray-200);
}

.resolution-back-btn {
  min-width: 120px;
  padding: 11px 18px;
  border: none;
  border-radius: 14px;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: #ffffff;
  font-size: 0.84rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.resolution-back-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 24px rgba(37, 99, 235, 0.24);
}

.step-card {
  background: linear-gradient(135deg, var(--gray-50), white);
  border: 1px solid var(--gray-200);
  border-radius: 16px;
  padding: 16px;
}

.step-header {
  display: flex;
  gap: 14px;
  margin-bottom: 14px;
}

.step-number {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 0.9rem;
  flex-shrink: 0;
}

.step-info h4 {
  margin: 0 0 4px;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--gray-800);
}

.step-info p {
  margin: 0;
  font-size: 0.8rem;
  color: var(--gray-600);
  line-height: 1.5;
}

.step-matrix {
  overflow-x: auto;
}

/* Mensaje de estado */
.status-message {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 18px;
  border-radius: 14px;
  font-size: 0.85rem;
  font-weight: 500;
}

.status-message svg {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.status-message.success {
  background: #f0fdf4;
  border: 1px solid #86efac;
  color: #166534;
}

.status-message.error {
  background: #fef2f2;
  border: 1px solid #fca5a5;
  color: #991b1b;
}

.status-message.neutral {
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  color: #1e40af;
}

/* Scrollbar personalizado */
.config-panel::-webkit-scrollbar {
  width: 6px;
}

.config-panel::-webkit-scrollbar-track {
  background: transparent;
  margin: 10px 0;
}

.config-panel::-webkit-scrollbar-thumb {
  background: var(--gray-300);
  border-radius: 10px;
}

.config-panel::-webkit-scrollbar-thumb:hover {
  background: var(--gray-400);
}

/* Responsive */
@media (max-width: 1200px) {
  .tools-panel {
    width: 260px;
  }

  .config-panel {
    width: 380px;
  }

  .tool-grid,
  .quick-actions {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 900px) {
  .editor-layout {
    flex-direction: column;
  }

  .tools-panel,
  .config-panel {
    width: 100%;
    max-height: 300px;
  }

  .canvas-panel {
    min-height: 450px;
  }

  .header-content,
  .canvas-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .resolution-section {
    width: calc(100vw - 24px);
    max-height: calc(100vh - 24px);
    padding: 18px;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  .help-modal {
    width: calc(100vw - 24px);
    max-height: calc(100vh - 24px);
  }

  .help-modal-header,
  .help-modal-body,
  .help-modal-actions {
    padding-left: 18px;
    padding-right: 18px;
  }
}
</style>
