<template>
  <div class="assignment-editor">
    <div class="assignment-header">
      <h2>Algoritmo de Asignación</h2>
      <p>Usa el mismo editor de grafos para dibujar un bipartito NxN y luego conviértelo en matriz.</p>
    </div>

    <div class="editor-layout">
      <!-- Panel izquierdo: Herramientas -->
      <div class="tools-panel">
        <div class="tools-header">
          <h3>
            <span class="icon">🛠️</span>
            Herramientas
          </h3>
        </div>
        <Toolbar :show-files="false" :show-visualization="false" />
      </div>

      <!-- Panel central: Pizarra de grafos -->
      <div class="canvas-panel">
        <div class="canvas-header">
          <h3>
            <span class="icon">📐</span>
            Editor de Grafos
          </h3>
        </div>
        <div class="graph-surface">
          <GraphCanvas />
        </div>
      </div>

      <!-- Panel derecho: Configuración y resultados -->
      <div class="config-panel">
        <div class="config-sections">
          <!-- Sección Generar Matriz - Ahora más grande -->
          <div class="config-card matrix-generator-card">
            <h3>
              <span class="icon">📊</span>
              Generar Matriz
            </h3>
            <p class="card-description">
              Dibuja el grafo con nodos tipo <strong>O1...On</strong> para orígenes y
              <strong>D1...Dn</strong> para destinos.
            </p>
            <button @click="generateAssignmentMatrix" class="btn-primary btn-large">
              Generar matriz desde el grafo
            </button>
          </div>

          <!-- Sección Algoritmo -->
          <div class="config-card">
            <h3>
              <span class="icon">⚙️</span>
              Algoritmo
            </h3>
            <div class="problem-toggle">
              <button
                @click="problemType = 'min'"
                :class="{ active: problemType === 'min' }"
                class="toggle-btn"
              >
                Minimizar
              </button>
              <button
                @click="problemType = 'max'"
                :class="{ active: problemType === 'max' }"
                class="toggle-btn"
              >
                Maximizar
              </button>
            </div>
            <button
              @click="runAssignment"
              class="btn-primary"
              :disabled="!matrixGenerated"
            >
              Ejecutar algoritmo de asignación
            </button>
          </div>

          <!-- Matriz Generada -->
          <div v-if="matrixGenerated" class="matrix-section">
            <h3>
              <span class="icon">📋</span>
              Matriz Generada
            </h3>
            <div class="matrix-info">
              <span class="matrix-badge">Bipartita</span>
              <span class="matrix-size">{{ detectedOrigins.length }} × {{ detectedDestinations.length }}</span>
            </div>
            <div class="matrix-table-container">
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

          <!-- Resultado Óptimo -->
          <div v-if="assignmentResult" class="result-section">
            <h3>
              <span class="icon">🏆</span>
              Resultado Óptimo
            </h3>
            <div class="result-summary" :class="problemType">
              <span>{{ problemType === 'min' ? 'Costo mínimo total' : 'Beneficio máximo total' }}</span>
              <strong>{{ assignmentResult.totalValue }}</strong>
            </div>
            <div class="assignment-list">
              <div
                v-for="(assignment, index) in assignmentResult.assignments"
                :key="'assignment-' + index"
                class="assignment-item"
              >
                <span class="assignment-origin">{{ assignment.origin }}</span>
                <span class="assignment-arrow">→</span>
                <span class="assignment-destination">{{ assignment.destination }}</span>
                <span class="assignment-weight">{{ assignment.value }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from "vue";
import GraphCanvas from "../components/GraphCanvas.vue";
import Toolbar from "../components/Toolbar.vue";
import { useGraph } from "../composables/useGraph";

const { nodes, edges, matrixData, updateMatrix } = useGraph();

const generatedMatrix = ref([]);
const matrixGenerated = ref(false);
const assignmentResult = ref(null);
const problemType = ref("min");
const statusMessage = ref("");
const statusTone = ref("neutral");
const detectedOrigins = ref([]);
const detectedDestinations = ref([]);

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

const generateAssignmentMatrix = () => {
  updateMatrix();

  const { origins: originList, destinations: destinationList, mode } = resolvePartitions();
  const labels = matrixData.value.labels || [];
  const fullMatrix = matrixData.value.matrix || [];

  detectedOrigins.value = originList;
  detectedDestinations.value = destinationList;

  if (originList.length === 0 || destinationList.length === 0) {
    matrixGenerated.value = false;
    generatedMatrix.value = [];
    statusMessage.value = "❌ Error: No se pudo identificar el bipartito.";
    statusTone.value = "error";
    return;
  }

  if (originList.length !== destinationList.length) {
    matrixGenerated.value = false;
    generatedMatrix.value = [];
    statusMessage.value = "❌ Error: El grafo debe ser bipartito NxN.";
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

  if (originIndexes.some((index) => index === undefined) || destinationIndexes.some((index) => index === undefined)) {
    matrixGenerated.value = false;
    generatedMatrix.value = [];
    statusMessage.value = "❌ Error: No se pudieron ubicar los nodos en la matriz.";
    statusTone.value = "error";
    return;
  }

  const matrix = originIndexes.map((originIndex) =>
    destinationIndexes.map((destinationIndex) => Number(fullMatrix[originIndex]?.[destinationIndex] ?? 0)),
  );

  generatedMatrix.value = matrix;
  matrixGenerated.value = true;
  assignmentResult.value = null;
  statusMessage.value = "✓ Matriz generada correctamente";
  statusTone.value = "success";
};

const runAssignment = () => {
  if (!matrixGenerated.value || generatedMatrix.value.length === 0) {
    statusMessage.value = "❌ Error: Primero genera la matriz desde el grafo.";
    statusTone.value = "error";
    return;
  }

  const originalMatrix = generatedMatrix.value.map((row) => [...row]);
  let workingMatrix = originalMatrix.map((row) => [...row]);

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

  statusMessage.value = problemType.value === "min" 
    ? "✓ Asignación óptima calculada por minimización" 
    : "✓ Asignación óptima calculada por maximización";
  statusTone.value = "success";
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
  matrixGenerated.value = false;
  generatedMatrix.value = [];
  assignmentResult.value = null;
  detectedOrigins.value = [];
  detectedDestinations.value = [];
  statusMessage.value = "";
  statusTone.value = "neutral";
};

onMounted(() => {
  nodes.on("*", handleGraphChange);
  edges.on("*", handleGraphChange);
});

onUnmounted(() => {
  nodes.off("*", handleGraphChange);
  edges.off("*", handleGraphChange);
});
</script>

<style scoped>
.assignment-editor {
  width: 100%;
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  background: #f8fafc;
  overflow: hidden;
}

.assignment-header {
  padding: 20px 28px;
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  flex-shrink: 0;
}

.assignment-header h2 {
  margin: 0 0 6px;
  font-size: 1.5rem;
  font-weight: 600;
  color: #0f172a;
}

.assignment-header p {
  margin: 0;
  font-size: 0.9rem;
  color: #64748b;
}

.editor-layout {
  display: flex;
  flex: 1;
  min-height: 0;
  gap: 0;
  overflow: hidden;
}

/* Panel izquierdo - Herramientas */
.tools-panel {
  width: 280px;
  flex-shrink: 0;
  background: #ffffff;
  border-right: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.tools-header {
  padding: 20px 20px 12px 20px;
  border-bottom: 1px solid #e2e8f0;
}

.tools-header h3 {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Panel central - Pizarra */
.canvas-panel {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  overflow: hidden;
}

.canvas-header {
  padding: 12px 20px;
  border-bottom: 1px solid #e2e8f0;
  background: #ffffff;
  flex-shrink: 0;
}

.canvas-header h3 {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 8px;
}

.graph-surface {
  flex: 1;
  min-height: 0;
  background: #ffffff;
  position: relative;
}

/* Panel derecho - Configuración */
.config-panel {
  width: 450px;
  flex-shrink: 0;
  background: #f8fafc;
  border-left: 1px solid #e2e8f0;
  overflow-y: auto;
  overflow-x: hidden;
}

.config-sections {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Tarjeta de Generar Matriz - Más grande */
.matrix-generator-card {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border: 2px solid #3b82f6;
  border-radius: 20px;
  padding: 24px;
}

.matrix-generator-card h3 {
  font-size: 1.1rem;
  margin-bottom: 16px;
  color: #1e40af;
}

.matrix-generator-card .card-description {
  font-size: 0.9rem;
  margin-bottom: 20px;
  line-height: 1.6;
}

.btn-large {
  padding: 14px 20px;
  font-size: 1rem;
  border-radius: 14px;
}

.config-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 18px;
  border: 1px solid #e2e8f0;
  transition: all 0.2s;
}

.config-card:hover {
  border-color: #cbd5e1;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.config-card h3 {
  margin: 0 0 12px;
  font-size: 0.9rem;
  font-weight: 600;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 8px;
}

.config-card h3 .icon {
  font-size: 1rem;
}

.card-description {
  font-size: 0.8rem;
  color: #64748b;
  margin: 0 0 14px;
  line-height: 1.5;
}

.card-description strong {
  color: #334155;
  font-weight: 600;
}

.btn-primary {
  width: 100%;
  padding: 10px 16px;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.problem-toggle {
  display: flex;
  gap: 10px;
  margin-bottom: 14px;
}

.toggle-btn {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  background: #ffffff;
  color: #475569;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.toggle-btn.active {
  background: #3b82f6;
  border-color: #3b82f6;
  color: white;
}

/* Sección de matriz */
.matrix-section,
.result-section {
  background: #ffffff;
  border-radius: 16px;
  padding: 18px;
  border: 1px solid #e2e8f0;
}

.matrix-section h3,
.result-section h3 {
  margin: 0 0 12px;
  font-size: 0.9rem;
  font-weight: 600;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 8px;
}

.matrix-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.matrix-badge {
  font-size: 0.7rem;
  font-weight: 600;
  color: #3b82f6;
  background: #dbeafe;
  padding: 4px 10px;
  border-radius: 20px;
}

.matrix-size {
  font-size: 0.75rem;
  color: #64748b;
  font-family: monospace;
}

.matrix-table-container {
  overflow-x: auto;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
}

.matrix-table {
  border-collapse: collapse;
  width: 100%;
  font-size: 0.75rem;
}

.matrix-table th,
.matrix-table td {
  border: 1px solid #e2e8f0;
  padding: 8px 10px;
  text-align: center;
  min-width: 48px;
}

.matrix-table th {
  background: #f1f5f9;
  font-weight: 600;
  color: #334155;
}

.corner-cell {
  background: #f8fafc;
}

.row-header {
  background: #f8fafc;
  font-weight: 600;
  position: sticky;
  left: 0;
}

.nonzero-cell {
  background: #dbeafe;
  color: #1e40af;
  font-weight: 600;
}

/* Resultados */
.result-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-radius: 12px;
  margin-bottom: 14px;
  font-size: 0.85rem;
  font-weight: 600;
}

.result-summary.min {
  background: #ecfdf5;
  color: #166534;
}

.result-summary.max {
  background: #eff6ff;
  color: #1d4ed8;
}

.result-summary strong {
  font-size: 1.1rem;
}

.assignment-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.assignment-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 0.8rem;
}

.assignment-origin,
.assignment-destination {
  font-weight: 600;
  color: #334155;
}

.assignment-arrow {
  color: #94a3b8;
  font-size: 0.9rem;
}

.assignment-weight {
  margin-left: auto;
  font-weight: 700;
  color: #3b82f6;
  background: #eff6ff;
  padding: 2px 8px;
  border-radius: 20px;
  font-size: 0.75rem;
}

/* Scrollbar */
.tools-panel::-webkit-scrollbar,
.config-panel::-webkit-scrollbar {
  width: 6px;
}

.tools-panel::-webkit-scrollbar-track,
.config-panel::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.tools-panel::-webkit-scrollbar-thumb,
.config-panel::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}

/* Responsive */
@media (max-width: 1200px) {
  .tools-panel {
    width: 240px;
  }
  
  .config-panel {
    width: 400px;
  }
}

@media (max-width: 900px) {
  .editor-layout {
    flex-direction: column;
  }
  
  .tools-panel,
  .config-panel {
    width: 100%;
    max-height: 200px;
    border-right: none;
    border-left: none;
    border-bottom: 1px solid #e2e8f0;
  }
  
  .tools-panel:last-child,
  .config-panel:last-child {
    border-bottom: none;
  }
  
  .canvas-panel {
    min-height: 400px;
  }
}
</style>