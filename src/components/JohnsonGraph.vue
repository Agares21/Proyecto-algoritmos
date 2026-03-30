<template>
  <div class="johnson-container">
    <div class="control-panel">
      <h2>Algoritmo de Johnson</h2>

      <div v-if="step === 1" class="step">
        <h3>Paso 1: Selecciona el tipo de ruta</h3>
        <div class="type-buttons">
          <button
            @click="selectType('min')"
            :class="{ selected: selectedType === 'min' }"
            class="type-btn min"
          >
            <span class="type-icon">Min</span>
            <span>Camino minimo</span>
            <small>Menor peso total</small>
          </button>
          <button
            @click="selectType('max')"
            :class="{ selected: selectedType === 'max' }"
            class="type-btn max"
          >
            <span class="type-icon">Max</span>
            <span>Camino maximo</span>
            <small>Mayor peso total</small>
          </button>
        </div>
      </div>

      <div v-if="step === 2 || step === 3" class="step">
        <h3>Paso 2: Selecciona origen y destino</h3>

        <div class="select-group">
          <div class="select-item">
            <label>Nodo de inicio</label>
            <select v-model="startNode" @change="validateNodes">
              <option value="">Seleccionar...</option>
              <option v-for="node in nodesList" :key="node.id" :value="node.id">
                {{ node.label }}
              </option>
            </select>
          </div>

          <div class="select-item">
            <label>Nodo de destino</label>
            <select v-model="endNode" @change="validateNodes">
              <option value="">Seleccionar...</option>
              <option v-for="node in nodesList" :key="node.id" :value="node.id">
                {{ node.label }}
              </option>
            </select>
          </div>
        </div>

        <button @click="calculatePath" :disabled="!canCalculate" class="calculate-btn">
          Calcular ruta
        </button>
      </div>

      <div v-if="result" class="step result-step">
        <div class="result-card" :class="selectedType">
          <div class="result-header">
            <span class="result-icon">{{ selectedType === "min" ? "Min" : "Max" }}</span>
            <span>{{ selectedType === "min" ? "Camino minimo" : "Camino maximo" }}</span>
          </div>

          <div class="result-path">
            <div class="path-label">Ruta encontrada:</div>
            <div class="path-nodes">
              <span v-for="(nodeId, index) in result.path" :key="index" class="path-node">
                {{ getNodeLabel(nodeId) }}
                <span v-if="index < result.path.length - 1" class="arrow">-></span>
              </span>
            </div>
          </div>

          <div class="result-weight">
            <div class="weight-label">Peso total:</div>
            <div class="weight-value">{{ result.weight }}</div>
          </div>

          <div class="result-detail" v-if="result.detail">
            <div class="detail-label">Desglose:</div>
            <div class="detail-value">{{ result.detail }}</div>
          </div>
        </div>

        <div class="action-buttons">
          <button @click="reset" class="reset-btn">Ocultar ruta</button>
          <button @click="newCalculation" class="new-btn">Nueva configuracion</button>
        </div>
      </div>
    </div>

    <div class="graph-container">
      <div ref="networkRef" class="graph-network"></div>
    </div>
  </div>
</template>
<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { DataSet } from "vis-data";
import { Network } from "vis-network";
import { useGraph } from "../composables/useGraph";

const { nodes, edges } = useGraph();

const nodesList = computed(() => nodes.get());
const edgesList = computed(() => edges.get());
const networkRef = ref(null);
const displayNodes = new DataSet([]);
const displayEdges = new DataSet([]);

let network = null;

// Controles de la interfaz (No se borran)
const step = ref(1);
const selectedType = ref(null);
const startNode = ref(null);
const endNode = ref(null);
const result = ref(null);

// Variables para Camino Mínimo
const distances = ref({});
const predecessors = ref({});

// Variables para Camino Máximo (CPM - Tus apuntes)
const TE_values = ref({});
const TL_values = ref({});
const holguras = ref({});
const criticalEdges = ref([]);

const networkOptions = {
  autoResize: true,
  physics: { enabled: false },
  interaction: { hover: true, dragNodes: false, dragView: true, zoomView: true },
  nodes: {
    shape: "circle",
    size: 44,
    font: { size: 16, color: "rgba(0,0,0,0)", face: "Arial", bold: true },
    borderWidth: 2,
    shadow: true,
    color: { background: "#97C2FC", border: "#2B7CE9" },
  },
  edges: {
    width: 2,
    smooth: { type: "continuous" },
    font: { align: "top", size: 12, color: "#333333", background: "white" },
    shadow: true,
    arrows: { to: { enabled: true } },
    color: { color: "#94a3b8", highlight: "#eab308", hover: "#64748b" },
  },
};

const selectType = (type) => {
  selectedType.value = type;
  step.value = 2;
};

const canCalculate = computed(() => {
  return startNode.value && endNode.value && startNode.value !== endNode.value;
});

const validateNodes = () => {
  if (startNode.value === endNode.value) {
    alert("Los nodos deben ser diferentes");
    endNode.value = null;
  }
};

const getNodeLabel = (nodeId) => {
  const node = nodesList.value.find((item) => item.id === nodeId);
  return node?.label || "?";
};

// --- ALGORITMO CAMINO MÍNIMO ---
const calculateMinPath = () => {
  const nodeIds = nodesList.value.map((node) => node.id);
  const edgeList = edgesList.value;
  const dist = {};
  const pred = {};

  nodeIds.forEach((id) => {
    dist[id] = Infinity;
    pred[id] = null;
  });
  dist[startNode.value] = 0;

  for (let i = 0; i < nodeIds.length - 1; i++) {
    let updated = false;
    edgeList.forEach((edge) => {
      const weight = parseFloat(edge.label || 0);
      if (dist[edge.from] !== Infinity && dist[edge.from] + weight < dist[edge.to]) {
        dist[edge.to] = dist[edge.from] + weight;
        pred[edge.to] = edge.from;
        updated = true;
      }
    });
    if (!updated) break;
  }

  const path = [];
  let current = endNode.value;
  while (current !== null && current !== undefined) {
    path.unshift(current);
    current = pred[current];
  }

  if (path[0] !== startNode.value) {
    alert(`No existe un camino desde ${getNodeLabel(startNode.value)} hasta ${getNodeLabel(endNode.value)}`);
    return;
  }

  let totalWeight = 0;
  const detailParts = [];
  for (let i = 0; i < path.length - 1; i++) {
    const edge = edgeList.find((item) => item.from === path[i] && item.to === path[i + 1]);
    if (edge) {
      const weight = parseFloat(edge.label || 0);
      totalWeight += weight;
      detailParts.push(`${weight} (${getNodeLabel(path[i])}->${getNodeLabel(path[i + 1])})`);
    }
  }

  distances.value = dist;
  predecessors.value = pred;
  criticalEdges.value = []; // Limpiamos datos de CPM
  
  result.value = {
    path,
    weight: totalWeight,
    detail: `${detailParts.join(" + ")} = ${totalWeight}`,
  };
};

// --- ALGORITMO CAMINO MÁXIMO (CPM / RUTA CRÍTICA) ---
const calculateMaxPath = () => {
  const nodeIds = nodesList.value.map(n => n.id);
  const edgeList = edgesList.value;

  // 1. IDA: Tiempos Tempranos (TE)
  const TE = {};
  nodeIds.forEach(id => TE[id] = 0);

  for (let i = 0; i < nodeIds.length - 1; i++) {
    edgeList.forEach(edge => {
      const dur = parseFloat(edge.label || 0);
      if (TE[edge.from] !== undefined && TE[edge.from] + dur > (TE[edge.to] || 0)) {
        TE[edge.to] = TE[edge.from] + dur;
      }
    });
  }

  // 2. VUELTA: Tiempos Tardíos (TL)
  const TL = {};
  nodeIds.forEach(id => TL[id] = Infinity);
  const projectDuration = TE[endNode.value];
  TL[endNode.value] = projectDuration;

  for (let i = 0; i < nodeIds.length - 1; i++) {
    edgeList.forEach(edge => {
      const dur = parseFloat(edge.label || 0);
      if (TL[edge.to] !== Infinity && TL[edge.to] - dur < TL[edge.from]) {
        TL[edge.from] = TL[edge.to] - dur;
      }
    });
  }

  // 3. HOLGURAS
  const h_values = {};
  const c_edges = [];
  let totalWeight = 0;
  const detailParts = [];
  const path = [];

  edgeList.forEach(edge => {
    const dur = parseFloat(edge.label || 0);
    const h = TL[edge.to] - TE[edge.from] - dur;
    h_values[edge.id] = h;
    if (h === 0) c_edges.push(edge.id);
  });

  // Reconstruir la ruta visual
  let curr = startNode.value;
  path.push(curr);
  while (curr !== endNode.value) {
    const nextEdge = edgeList.find(e => e.from === curr && c_edges.includes(e.id));
    if (!nextEdge) break;
    
    totalWeight += parseFloat(nextEdge.label || 0);
    detailParts.push(`${parseFloat(nextEdge.label || 0)} (${getNodeLabel(nextEdge.from)}->${getNodeLabel(nextEdge.to)})`);
    curr = nextEdge.to;
    path.push(curr);
  }

  TE_values.value = TE;
  TL_values.value = TL;
  holguras.value = h_values;
  criticalEdges.value = c_edges;

  result.value = {
    path,
    weight: projectDuration,
    detail: `Camino Crítico: ${detailParts.join(" + ")} = ${projectDuration}`,
  };
};

const calculatePath = () => {
  if (!startNode.value || !endNode.value) {
    alert("Selecciona origen y destino");
    return;
  }
  
  if (selectedType.value === "min") {
    calculateMinPath();
  } else {
    calculateMaxPath();
  }
  step.value = 3;
};

const reset = () => {
  startNode.value = null;
  endNode.value = null;
  result.value = null;
  step.value = 2;
};

const newCalculation = () => {
  selectedType.value = null;
  startNode.value = null;
  endNode.value = null;
  result.value = null;
  step.value = 1;
};

// --- DIBUJO EN EL CANVAS ---
const syncGraphView = () => {
  const pathNodes = new Set(result.value?.path || []);
  const pathEdges = new Set();

  if (result.value?.path?.length) {
    for (let i = 0; i < result.value.path.length - 1; i++) {
      pathEdges.add(`${result.value.path[i]}-${result.value.path[i + 1]}`);
    }
  }

  const nextNodes = nodes.get().map((node) => {
    const isStart = node.id === startNode.value;
    const isEnd = node.id === endNode.value;
    const isInPath = pathNodes.has(node.id);
    
    // Colores base para nodos
    let bg = "#97C2FC";
    let border = "#2B7CE9";

    if (isInPath && selectedType.value === 'min') { bg = "#fde047"; border = "#eab308"; } // Amarillo para Mínimo
    if (isInPath && selectedType.value === 'max') { bg = "#fca5a5"; border = "#ef4444"; } // Rojo para Máximo (Crítico)
    if (isStart) { bg = "#dcfce7"; border = "#10b981"; }
    if (isEnd) { bg = "#fee2e2"; border = "#ef4444"; }

    return {
      ...node,
      label: "", // El nombre se dibuja en el canvas
      color: { background: bg, border: border, highlight: { background: bg, border: border } }
    };
  });

const nextEdges = edges.get().map((edge) => {
    const isPathMin = selectedType.value === 'min' && pathEdges.has(`${edge.from}-${edge.to}`);
    const isPathMax = selectedType.value === 'max' && criticalEdges.value.includes(edge.id);
    const inPath = isPathMin || isPathMax;

    let edgeColor = "#94a3b8"; // Gris por defecto
    if (isPathMin) edgeColor = "#eab308"; // Amarillo
    if (isPathMax) edgeColor = "#ef4444"; // Rojo

    return {
      ...edge,
      label: "", // <--- AQUÍ ESTÁ LA MAGIA PARA LIMPIAR LAS FLECHAS
      width: inPath ? 4 : 2,
      color: { color: edgeColor, highlight: edgeColor, hover: edgeColor }
    };
  });

  displayNodes.clear();
  displayEdges.clear();
  displayNodes.add(nextNodes);
  displayEdges.add(nextEdges);

  if (network && nextNodes.length > 0) {
    network.fit({ animation: { duration: 300 } });
  }
};

const drawNodeAnnotations = (ctx) => {
  if (!network) return;
  const positions = network.getPositions(nodesList.value.map((node) => node.id));

  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  nodesList.value.forEach((node) => {
    const pos = positions[node.id];
    if (!pos) return;

    // Dibujar el nombre del nodo en el centro
    ctx.font = "700 18px Arial";
    ctx.fillStyle = "#0f172a";
    ctx.fillText(node.label, pos.x, pos.y + 1);

    // Solo dibujar TE y TL si estamos en "Camino Máximo" y ya se calculó
    if (step.value === 3 && selectedType.value === "max") {
      const te = TE_values.value[node.id];
      const tl = TL_values.value[node.id];

      if (te !== undefined && tl !== undefined) {
        const text = `${te} | ${tl}`;
        const badgeY = pos.y + 35; 

        ctx.fillStyle = "rgba(255,255,255,0.95)";
        ctx.strokeStyle = te === tl ? "#ef4444" : "#cbd5e1";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(pos.x - 25, badgeY - 12, 50, 24, 6);
        ctx.fill();
        ctx.stroke();

        ctx.font = "bold 13px Arial";
        ctx.fillStyle = te === tl ? "#ef4444" : "#1e293b"; 
        ctx.fillText(text, pos.x, badgeY);
      }
    }
  });
  ctx.restore();
};

const drawEdgeAnnotations = (ctx) => {
  if (!network) return; // ¡Quitamos la restricción del Paso 3 para que se vea siempre!
  const positions = network.getPositions(nodesList.value.map((node) => node.id));

  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  edgesList.value.forEach((edge) => {
    const from = positions[edge.from];
    const to = positions[edge.to];
    if (!from || !to) return;

    const originalWeight = edge.label || "0";
    let text = `${originalWeight}`; // POR DEFECTO: Siempre muestra el peso original
    let textColor = "#475569";

    // Si ya le dimos a calcular (Paso 3), agregamos los detalles
    if (step.value === 3) {
      if (selectedType.value === "max") {
        // MÁXIMO (Ruta Crítica): Mostrar "Duración (Holgura)"
        const h = holguras.value[edge.id];
        if (h !== undefined) {
          text = `${originalWeight} (${h})`; // Aquí quitamos el "h="
          if (h === 0) textColor = "#ef4444"; // Rojo si es crítico
        }
      } else if (selectedType.value === "min") {
        // MÍNIMO (Johnson): Mostrar "Suma Parcial | Peso Recalibrado"
        const jData = johnsonData.value;
        if (jData) {
          const potFrom = jData.potentials[edge.from] ?? 0;
          const partialSum = Number(originalWeight) + potFrom;
          const reweighted = jData.reweightedEdges[edge.id] ?? originalWeight;
          text = `${partialSum} | ${reweighted}`;
        }
      }
    }

    const midX = (from.x + to.x) / 2;
    const midY = (from.y + to.y) / 2;

    ctx.font = "bold 12px Arial";
    const width = ctx.measureText(text).width + 12;

    // Fondo blanquito
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.beginPath();
    ctx.roundRect(midX - width/2, midY - 12, width, 24, 4);
    ctx.fill();

    // Texto
    ctx.fillStyle = textColor;
    ctx.fillText(text, midX, midY);
  });
  ctx.restore();
};

  // --- RECUPERAMOS LOS CÁLCULOS DE JOHNSON PARA EL MÍNIMO ---
const johnsonData = computed(() => {
  const superSourceId = "__johnson_super_source__";
  const nodeIds = nodesList.value.map((node) => node.id);
  const originalEdges = edgesList.value.map((edge) => ({
    from: edge.from,
    to: edge.to,
    weight: Number(edge.label || 0),
    id: edge.id,
  }));
  const auxiliaryEdges = [
    ...originalEdges,
    ...nodeIds.map((nodeId) => ({ from: superSourceId, to: nodeId, weight: 0 })),
  ];
  
  const distancesMap = { [superSourceId]: 0 };
  nodeIds.forEach((nodeId) => distancesMap[nodeId] = Infinity);

  for (let i = 0; i < nodeIds.length; i++) {
    auxiliaryEdges.forEach((edge) => {
      if (distancesMap[edge.from] !== Infinity && distancesMap[edge.from] + edge.weight < distancesMap[edge.to]) {
        distancesMap[edge.to] = distancesMap[edge.from] + edge.weight;
      }
    });
  }

  const potentials = {};
  nodeIds.forEach((nodeId) => {
    potentials[nodeId] = distancesMap[nodeId] === Infinity ? 0 : distancesMap[nodeId];
  });

  const reweightedEdges = {};
  originalEdges.forEach((edge) => {
    reweightedEdges[edge.id] = edge.weight + potentials[edge.from] - potentials[edge.to];
  });

  return { potentials, reweightedEdges };
});

onMounted(() => {
  network = new Network(networkRef.value, { nodes: displayNodes, edges: displayEdges }, networkOptions);
  network.on("afterDrawing", (ctx) => {
    drawEdgeAnnotations(ctx);
    drawNodeAnnotations(ctx);
  });
  syncGraphView();
});

watch([nodesList, edgesList, startNode, endNode, result], () => {
  syncGraphView();
}, { deep: true });

onUnmounted(() => {
  if (network) {
    network.destroy();
    network = null;
  }


});

</script>

<style scoped>
.johnson-container {
  display: flex;
  width: 100%;
  height: 100%;
  background: #f1f5f9;
}

.control-panel {
  width: 360px;
  background: white;
  border-right: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  padding: 24px;
  gap: 20px;
  flex-shrink: 0;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.05);
}

.control-panel h2 {
  margin: 0 0 8px 0;
  font-size: 1.4rem;
  color: #1e293b;
  text-align: center;
}

.step h3 {
  font-size: 0.9rem;
  color: #475569;
  margin-bottom: 16px;
  text-align: center;
}

.type-buttons {
  display: flex;
  gap: 12px;
}

.type-btn {
  flex: 1;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
  padding: 18px 16px;
  border: 1px solid #dbe4f0;
  border-radius: 16px;
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  cursor: pointer;
  overflow: hidden;
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease,
    background 0.25s ease;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
}

.type-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 14px 28px rgba(15, 23, 42, 0.12);
}

.type-btn.min:hover {
  border-color: #34d399;
  background: linear-gradient(180deg, #ffffff 0%, #ecfdf5 100%);
}

.type-btn.max:hover {
  border-color: #f87171;
  background: linear-gradient(180deg, #ffffff 0%, #fef2f2 100%);
}

.type-btn.selected {
  transform: translateY(-2px);
}

.type-btn.min.selected {
  border-color: #10b981;
  background: linear-gradient(180deg, #f0fdf4 0%, #dcfce7 100%);
  box-shadow: 0 14px 30px rgba(16, 185, 129, 0.18);
}

.type-btn.max.selected {
  border-color: #ef4444;
  background: linear-gradient(180deg, #fef2f2 0%, #fee2e2 100%);
  box-shadow: 0 14px 30px rgba(239, 68, 68, 0.18);
}

.type-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 52px;
  height: 30px;
  padding: 0 12px;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  background: #e2e8f0;
  color: #0f172a;
}

.type-btn span {
  font-weight: 600;
  font-size: 0.95rem;
  text-align: left;
}

.type-btn small {
  font-size: 0.72rem;
  color: #64748b;
  text-align: left;
  line-height: 1.4;
}

.type-btn.min .type-icon {
  background: #d1fae5;
  color: #047857;
}

.type-btn.max .type-icon {
  background: #fee2e2;
  color: #b91c1c;
}

.select-group {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 20px;
}

.select-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.select-item label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #475569;
}

.select-item select {
  padding: 10px 12px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: border-color 0.2s;
  background: white;
}

.select-item select:focus {
  outline: none;
  border-color: #3b82f6;
}

.calculate-btn {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.calculate-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.calculate-btn:disabled {
  background: #cbd5e1;
  cursor: not-allowed;
}

.result-card {
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 16px;
}

.result-card.min {
  background: #f0fdf4;
  border: 2px solid #10b981;
}

.result-card.max {
  background: #fef2f2;
  border: 2px solid #ef4444;
}

.result-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-weight: 700;
  font-size: 1rem;
  margin-bottom: 12px;
}

.result-card.min .result-header {
  color: #10b981;
}

.result-card.max .result-header {
  color: #ef4444;
}

.result-path {
  margin-bottom: 10px;
}

.path-label {
  font-size: 0.75rem;
  color: #64748b;
  margin-bottom: 6px;
}

.path-nodes {
  font-size: 0.9rem;
  font-weight: 600;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.path-node {
  color: #1e293b;
}

.arrow {
  margin: 0 4px;
  color: #94a3b8;
}

.result-weight {
  margin-bottom: 10px;
}

.weight-label {
  font-size: 0.75rem;
  color: #64748b;
  margin-bottom: 4px;
}

.weight-value {
  font-size: 1.3rem;
  font-weight: 700;
}

.result-card.min .weight-value {
  color: #10b981;
}

.result-card.max .weight-value {
  color: #ef4444;
}

.result-detail {
  padding-top: 10px;
  border-top: 1px solid #e2e8f0;
}

.detail-label {
  font-size: 0.7rem;
  color: #64748b;
  margin-bottom: 4px;
}

.detail-value {
  font-size: 0.8rem;
  font-family: monospace;
  color: #475569;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.reset-btn,
.new-btn {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.reset-btn {
  background: #f1f5f9;
  color: #475569;
}

.new-btn {
  background: #1e293b;
  color: white;
}

.reset-btn:hover,
.new-btn:hover {
  transform: translateY(-1px);
}

.graph-container {
  flex: 1;
  background: #ffffff;
  overflow: auto;
  padding: 20px;
}

.graph-network {
  width: 100%;
  height: 100%;
  min-height: 600px;
  background: #ffffff;
  background-image: radial-gradient(#e2e8f0 1px, transparent 1px);
  background-size: 25px 25px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.control-panel::-webkit-scrollbar {
  width: 4px;
}

.control-panel::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.control-panel::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

@media (max-width: 768px) {
  .johnson-container {
    flex-direction: column;
  }

  .control-panel {
    width: 100%;
    max-height: 400px;
    border-right: none;
    border-bottom: 1px solid #e2e8f0;
  }

  .graph-container {
    min-height: 500px;
  }
}
</style>
