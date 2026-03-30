<template>
  <div class="assignment-editor">
    <div class="assignment-header">
      <h2>Algoritmo de Asignacion</h2>
      <p>Usa el mismo editor de grafos para dibujar un bipartito NxN y luego conviertelo en matriz.</p>
    </div>

    <div class="editor-layout">
      <Toolbar :show-files="false" :show-visualization="false" />

      <div class="canvas-area">
        <div class="graph-surface">
          <GraphCanvas />
        </div>

        <div class="assignment-panel">
          <div class="panel-section">
            <h3>Generar Matriz</h3>
            <p>
              Dibuja el grafo con nodos tipo <strong>O1...On</strong> para origenes y
              <strong>D1...Dn</strong> para destinos.
            </p>
            <button @click="generateAssignmentMatrix" class="panel-btn primary">
              Generar matriz desde el grafo
            </button>
          </div>

          <div class="panel-section">
            <h3>Algoritmo</h3>
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
              class="panel-btn primary"
              :disabled="!matrixGenerated"
            >
              Ejecutar algoritmo de asignacion
            </button>
          </div>

          <div class="panel-section">
            <h3>Estado</h3>
            <div class="status-card" :class="statusTone">
              {{ statusMessage }}
            </div>
          </div>

          <div class="panel-section">
            <h3>Referencia</h3>
            <small>Solo se toman aristas desde origenes hacia destinos.</small>
            <small>La matriz se arma con filas Oi y columnas Dj.</small>
            <small>Debe haber la misma cantidad de origenes y destinos.</small>
          </div>

          <div v-if="matrixGenerated" class="panel-section">
            <h3>Matriz Generada</h3>

            <div class="matrix-info">
              <span class="matrix-type">Bipartita</span>
              <span class="matrix-size">{{ detectedOrigins.length }} x {{ detectedDestinations.length }}</span>
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

          <div v-if="assignmentResult" class="panel-section">
            <h3>Resultado Optimo</h3>

            <div class="result-summary" :class="problemType">
              <span>{{ problemType === 'min' ? 'Costo minimo total' : 'Beneficio maximo total' }}</span>
              <strong>{{ assignmentResult.totalValue }}</strong>
            </div>

            <div class="assignment-list">
              <div
                v-for="(assignment, index) in assignmentResult.assignments"
                :key="'assignment-' + index"
                class="assignment-item"
              >
                <span>{{ assignment.origin }}</span>
                <span class="assignment-arrow">→</span>
                <span>{{ assignment.destination }}</span>
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
const statusMessage = ref("Dibuja el bipartito y presiona el boton para convertirlo.");
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
    statusMessage.value =
      "No se pudo identificar el bipartito. Usa etiquetas Oi/Dj, direccion de aristas origen->destino o separa los nodos entre izquierda y derecha.";
    statusTone.value = "error";
    return;
  }

  if (originList.length !== destinationList.length) {
    matrixGenerated.value = false;
    generatedMatrix.value = [];
    statusMessage.value = "El grafo debe ser bipartito NxN: misma cantidad de origenes y destinos.";
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
    statusMessage.value = "No se pudieron ubicar todos los nodos dentro de la matriz del GraphCanvas.";
    statusTone.value = "error";
    return;
  }

  const matrix = originIndexes.map((originIndex) =>
    destinationIndexes.map((destinationIndex) => Number(fullMatrix[originIndex]?.[destinationIndex] ?? 0)),
  );

  const invalidEdges = edges.get().filter((edge) => {
    const fromNode = nodes.get(edge.from);
    const toNode = nodes.get(edge.to);
    return !/^o\d+$/i.test(String(fromNode?.label || "").trim()) || !/^d\d+$/i.test(String(toNode?.label || "").trim());
  });

  generatedMatrix.value = matrix;
  matrixGenerated.value = true;
  assignmentResult.value = null;

  if (invalidEdges.length > 0) {
    statusMessage.value =
      "La matriz se genero correctamente.";
    statusTone.value = "warning";
  } else {
    statusMessage.value =
      mode === "labels"
        ? "Matriz generada correctamente desde el grafo bipartito."
        : mode === "edges"
          ? "Matriz generada correctamente usando la direccion de las aristas."
        : "Matriz generada correctamente usando la posicion de los nodos (izquierda y derecha).";
    statusTone.value = "success";
  }
};

const runAssignment = () => {
  if (!matrixGenerated.value || generatedMatrix.value.length === 0) {
    statusMessage.value = "Primero genera la matriz desde el grafo.";
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

  statusMessage.value =
    problemType.value === "min"
      ? "Asignacion optima calculada por minimizacion."
      : "Asignacion optima calculada por maximizacion.";
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
  statusMessage.value = "El grafo cambio. Vuelve a generar la matriz.";
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
  background: #ffffff;
  overflow: hidden;
}

.assignment-header {
  padding: 18px 24px;
  border-bottom: 1px solid #e2e8f0;
  background: #ffffff;
  flex-shrink: 0;
  position: relative;
  z-index: 2;
}

.assignment-header h2 {
  margin: 0 0 8px;
  font-size: 1.35rem;
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
  overflow: hidden;
  background: #ffffff;
}

.canvas-area {
  flex: 1;
  position: relative;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  background: #ffffff;
}

.graph-surface {
  width: 100%;
  height: 100%;
  min-height: 0;
  background: #ffffff;
}

.assignment-panel {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 380px;
  max-height: calc(100% - 40px);
  overflow-y: auto;
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(8px);
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.14);
}

.panel-section {
  padding: 18px 20px;
  border-bottom: 1px solid #e2e8f0;
}

.panel-section:last-child {
  border-bottom: none;
}

.panel-section h3 {
  margin: 0 0 10px;
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #64748b;
}

.panel-section p,
.panel-section small {
  display: block;
  margin: 0 0 6px;
  font-size: 0.82rem;
  line-height: 1.5;
  color: #475569;
}

.panel-btn {
  width: 100%;
  padding: 10px 12px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.2s;
}

.panel-btn.primary {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
}

.panel-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  transform: none;
}

.panel-btn:hover {
  transform: translateY(-1px);
}

.problem-toggle {
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
}

.toggle-btn {
  flex: 1;
  padding: 9px 10px;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  background: #f8fafc;
  color: #475569;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.toggle-btn.active {
  background: #dbeafe;
  border-color: #93c5fd;
  color: #1d4ed8;
}

.status-card {
  padding: 12px 14px;
  border-radius: 12px;
  font-size: 0.82rem;
  font-weight: 500;
  line-height: 1.5;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  color: #475569;
}

.status-card.success {
  background: #ecfdf5;
  color: #166534;
  border-color: #bbf7d0;
}

.status-card.warning {
  background: #fffbeb;
  color: #92400e;
  border-color: #fde68a;
}

.status-card.error {
  background: #fef2f2;
  color: #991b1b;
  border-color: #fecaca;
}

.matrix-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f8fafc;
  border-radius: 12px;
  margin-bottom: 16px;
}

.matrix-type {
  font-size: 0.85rem;
  font-weight: 600;
  color: #3b82f6;
  background: #dbeafe;
  padding: 4px 12px;
  border-radius: 20px;
}

.matrix-size {
  font-size: 0.85rem;
  color: #64748b;
  font-family: monospace;
}

.matrix-table-container {
  overflow-x: auto;
}

.matrix-table {
  border-collapse: collapse;
  width: 100%;
  background: white;
}

.matrix-table th,
.matrix-table td {
  border: 1px solid #cbd5e1;
  padding: 10px 12px;
  text-align: center;
  min-width: 52px;
}

.matrix-table th {
  background: #f1f5f9;
  font-weight: 600;
  color: #334155;
  position: sticky;
  top: 0;
}

.corner-cell,
.col-header,
.row-header {
  background: #f1f5f9;
}

.row-header {
  position: sticky;
  left: 0;
}

.nonzero-cell {
  background: #dbeafe;
  color: #1e40af;
  font-weight: 600;
}

.result-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 14px;
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

.assignment-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.assignment-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: #ffffff;
  font-size: 0.84rem;
  color: #334155;
}

.assignment-arrow {
  color: #94a3b8;
}

.assignment-weight {
  margin-left: auto;
  font-weight: 700;
  color: #0f172a;
}

.assignment-panel::-webkit-scrollbar {
  width: 6px;
}

.assignment-panel::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 10px;
}

.assignment-panel::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}

@media (max-width: 900px) {
  .editor-layout {
    flex-direction: column;
  }

  .assignment-panel {
    position: static;
    width: auto;
    max-height: none;
    margin: 16px;
  }

  .canvas-area {
    overflow: auto;
  }
}
</style>
