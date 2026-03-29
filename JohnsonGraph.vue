<template>
  <div class="johnson-container">
    <div class="control-panel">
      <h2>📊 Algoritmo de Johnson</h2>
      
      <div v-if="step === 1" class="step">
        <h3>Paso 1: Selecciona el tipo de ruta</h3>
        <div class="type-buttons">
          <button @click="selectType('min')" :class="{ selected: selectedType === 'min' }" class="type-btn min">
            <span class="type-icon">⬆️</span>
            <span>Camino Mínimo</span>
            <small>Menor peso total</small>
          </button>
          <button @click="selectType('max')" :class="{ selected: selectedType === 'max' }" class="type-btn max">
            <span class="type-icon">⬇️</span>
            <span>Camino Máximo</span>
            <small>Mayor peso total</small>
          </button>
        </div>
      </div>

      <div v-if="step === 2" class="step">
        <h3>Paso 2: Selecciona origen y destino</h3>
        
        <div class="select-group">
          <div class="select-item">
            <label>📍 Nodo de inicio</label>
            <select v-model="startNode" @change="validateNodes">
              <option value="">Seleccionar...</option>
              <option v-for="node in nodesList" :key="node.id" :value="node.id">
                {{ node.label }}
              </option>
            </select>
          </div>

          <div class="select-item">
            <label>🎯 Nodo de destino</label>
            <select v-model="endNode" @change="validateNodes">
              <option value="">Seleccionar...</option>
              <option v-for="node in nodesList" :key="node.id" :value="node.id">
                {{ node.label }}
              </option>
            </select>
          </div>
        </div>

        <button @click="calculatePath" :disabled="!canCalculate" class="calculate-btn">
          🔍 Calcular Ruta
        </button>
      </div>

      <div v-if="step === 3 && result" class="step result-step">
        <div class="result-card" :class="selectedType">
          <div class="result-header">
            <span class="result-icon">{{ selectedType === 'min' ? '⬆️' : '⬇️' }}</span>
            <span>{{ selectedType === 'min' ? 'Camino Mínimo' : 'Camino Máximo' }}</span>
          </div>

          <div class="result-path">
            <div class="path-label">Ruta encontrada:</div>
            <div class="path-nodes">
              <span v-for="(nodeId, index) in result.path" :key="index" class="path-node">
                {{ getNodeLabel(nodeId) }}
                <span v-if="index < result.path.length - 1" class="arrow">→</span>
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
          <button @click="reset" class="reset-btn">↺ Calcular otra ruta</button>
          <button @click="newCalculation" class="new-btn">🔄 Nueva configuración</button>
        </div>
      </div>
    </div>

    <div class="graph-container">
      <svg :viewBox="`0 0 ${svgWidth} ${svgHeight}`" class="graph-svg">
        <!-- Aristas -->
        <g v-for="edge in edgesList" :key="edge.id">
          <line
            :x1="getNodePosition(edge.from).x"
            :y1="getNodePosition(edge.from).y"
            :x2="getNodePosition(edge.to).x"
            :y2="getNodePosition(edge.to).y"
            :class="['edge-line', { 'edge-highlight': isEdgeInPath(edge.from, edge.to) }]"
          />
          <!-- Flecha dirigida -->
          <polygon
            :points="getArrowPoints(edge.from, edge.to)"
            :class="['arrow', { 'arrow-highlight': isEdgeInPath(edge.from, edge.to) }]"
          />
          <!-- Peso de la arista -->
          <circle
            :cx="(getNodePosition(edge.from).x + getNodePosition(edge.to).x) / 2"
            :cy="(getNodePosition(edge.from).y + getNodePosition(edge.to).y) / 2 - 12"
            r="14"
            fill="white"
            stroke="#cbd5e1"
            stroke-width="1.5"
          />
          <text
            :x="(getNodePosition(edge.from).x + getNodePosition(edge.to).x) / 2"
            :y="(getNodePosition(edge.from).y + getNodePosition(edge.to).y) / 2 - 12"
            class="edge-weight"
          >
            {{ edge.label }}
          </text>
        </g>

        <!-- Nodos con círculos divididos -->
        <g v-for="node in nodesList" :key="node.id">
          <!-- Círculo principal -->
          <circle
            :cx="getNodePosition(node.id).x"
            :cy="getNodePosition(node.id).y"
            r="38"
            :class="[
              'node-circle',
              {
                'node-start': node.id === startNode,
                'node-end': node.id === endNode,
                'node-highlight': isNodeInPath(node.id)
              }
            ]"
          />
          
          <!-- Línea divisoria horizontal -->
          <line
            :x1="getNodePosition(node.id).x - 28"
            :y1="getNodePosition(node.id).y"
            :x2="getNodePosition(node.id).x + 28"
            :y2="getNodePosition(node.id).y"
            stroke="white"
            stroke-width="2.5"
          />
          
          <!-- Valor superior (d - distancia) -->
          <text
            :x="getNodePosition(node.id).x"
            :y="getNodePosition(node.id).y - 15"
            class="node-value-top"
          >
            {{ getNodeDistance(node.id) }}
          </text>
          
          <!-- Letra del nodo (centro) -->
          <text
            :x="getNodePosition(node.id).x"
            :y="getNodePosition(node.id).y + 5"
            class="node-label"
          >
            {{ node.label }}
          </text>
          
          <!-- Valor inferior (π - predecesor) -->
          <text
            :x="getNodePosition(node.id).x"
            :y="getNodePosition(node.id).y + 25"
            class="node-value-bottom"
          >
            {{ getNodePredecessor(node.id) }}
          </text>
        </g>
      </svg>
    </div>
  </div>
</template>

<script setup>
import { useGraph } from "../composables/useGraph";
import { ref, computed } from "vue";

const { nodes, edges } = useGraph();

const nodesList = computed(() => nodes.get());
const edgesList = computed(() => edges.get());

const svgWidth = 1000;
const svgHeight = 650;

// Estados del flujo
const step = ref(1);
const selectedType = ref(null);
const startNode = ref(null);
const endNode = ref(null);
const result = ref(null);
const distances = ref({});
const predecessors = ref({});

// Posiciones fijas para que no se sobrepongan
const nodePositions = {
  1: { x: 150, y: 300 },
  2: { x: 350, y: 150 },
  3: { x: 550, y: 200 },
  4: { x: 750, y: 120 },
  5: { x: 850, y: 280 },
  6: { x: 550, y: 450 },
  7: { x: 350, y: 500 },
  8: { x: 750, y: 500 },
};

const getNodePosition = (nodeId) => {
  return nodePositions[nodeId] || { x: 500, y: 300 };
};

// Calcular puntos de la flecha
const getArrowPoints = (fromId, toId) => {
  const from = getNodePosition(fromId);
  const to = getNodePosition(toId);
  
  const angle = Math.atan2(to.y - from.y, to.x - from.x);
  const arrowSize = 10;
  const nodeRadius = 38;
  
  const tipX = to.x - nodeRadius * Math.cos(angle);
  const tipY = to.y - nodeRadius * Math.sin(angle);
  
  const angle1 = angle + Math.PI / 5;
  const angle2 = angle - Math.PI / 5;
  
  const x1 = tipX - arrowSize * Math.cos(angle1);
  const y1 = tipY - arrowSize * Math.sin(angle1);
  const x2 = tipX - arrowSize * Math.cos(angle2);
  const y2 = tipY - arrowSize * Math.sin(angle2);
  
  return `${tipX},${tipY} ${x1},${y1} ${x2},${y2}`;
};

// Algoritmo de Bellman-Ford para encontrar caminos
const findPath = () => {
  const nodeIds = nodesList.value.map(n => n.id);
  const edgeList = edgesList.value;
  
  // Inicializar distancias
  let dist = {};
  let pred = {};
  
  nodeIds.forEach(id => {
    dist[id] = selectedType.value === 'min' ? Infinity : -Infinity;
    pred[id] = null;
  });
  dist[startNode.value] = 0;
  
  // Relax edges (V-1 veces)
  for (let i = 0; i < nodeIds.length - 1; i++) {
    let updated = false;
    edgeList.forEach(edge => {
      const weight = parseFloat(edge.label);
      if (selectedType.value === 'min') {
        if (dist[edge.from] !== Infinity && dist[edge.from] + weight < dist[edge.to]) {
          dist[edge.to] = dist[edge.from] + weight;
          pred[edge.to] = edge.from;
          updated = true;
        }
      } else {
        if (dist[edge.from] !== -Infinity && dist[edge.from] + weight > dist[edge.to]) {
          dist[edge.to] = dist[edge.from] + weight;
          pred[edge.to] = edge.from;
          updated = true;
        }
      }
    });
    if (!updated) break;
  }
  
  return { dist, pred };
};

// Reconstruir el camino desde el origen hasta el destino
const reconstructPath = (pred) => {
  const path = [];
  let current = endNode.value;
  
  while (current !== null && current !== undefined) {
    path.unshift(current);
    current = pred[current];
  }
  
  // Verificar si el camino es válido
  if (path[0] !== startNode.value) {
    return null;
  }
  
  return path;
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

const calculatePath = () => {
  if (!startNode.value || !endNode.value) {
    alert("Selecciona origen y destino");
    return;
  }
  
  // Ejecutar algoritmo
  const { dist, pred } = findPath();
  const path = reconstructPath(pred);
  
  if (!path) {
    alert(`No existe un camino desde ${getNodeLabel(startNode.value)} hasta ${getNodeLabel(endNode.value)}`);
    return;
  }
  
  // Calcular peso total
  let totalWeight = 0;
  let detailParts = [];
  
  for (let i = 0; i < path.length - 1; i++) {
    const edge = edgesList.value.find(e => e.from === path[i] && e.to === path[i + 1]);
    if (edge) {
      const weight = parseFloat(edge.label);
      totalWeight += weight;
      detailParts.push(`${weight} (${getNodeLabel(path[i])}→${getNodeLabel(path[i + 1])})`);
    }
  }
  
  result.value = {
    path: path,
    weight: totalWeight,
    detail: detailParts.join(' + ') + ` = ${totalWeight}`
  };
  
  distances.value = dist;
  predecessors.value = pred;
  
  step.value = 3;
};

const getNodeLabel = (nodeId) => {
  const node = nodesList.value.find(n => n.id === nodeId);
  return node?.label || "?";
};

const getNodeDistance = (nodeId) => {
  const dist = distances.value[nodeId];
  if (dist === undefined) return '∞';
  if (dist === Infinity) return '∞';
  if (dist === -Infinity) return '-∞';
  return dist;
};

const getNodePredecessor = (nodeId) => {
  const pred = predecessors.value[nodeId];
  if (!pred) return '';
  const predNode = nodesList.value.find(n => n.id === pred);
  return predNode ? predNode.label : '';
};

const isNodeInPath = (nodeId) => {
  return result.value && result.value.path.includes(nodeId);
};

const isEdgeInPath = (fromId, toId) => {
  if (!result.value) return false;
  for (let i = 0; i < result.value.path.length - 1; i++) {
    if (result.value.path[i] === fromId && result.value.path[i + 1] === toId) {
      return true;
    }
  }
  return false;
};

const reset = () => {
  startNode.value = null;
  endNode.value = null;
  result.value = null;
  distances.value = {};
  predecessors.value = {};
  step.value = 2;
};

const newCalculation = () => {
  selectedType.value = null;
  startNode.value = null;
  endNode.value = null;
  result.value = null;
  distances.value = {};
  predecessors.value = {};
  step.value = 1;
};
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
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  background: white;
  cursor: pointer;
  transition: all 0.3s;
}

.type-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.type-btn.min:hover {
  border-color: #10b981;
  background: #f0fdf4;
}

.type-btn.max:hover {
  border-color: #ef4444;
  background: #fef2f2;
}

.type-btn.selected {
  border-width: 2px;
}

.type-btn.min.selected {
  border-color: #10b981;
  background: #f0fdf4;
}

.type-btn.max.selected {
  border-color: #ef4444;
  background: #fef2f2;
}

.type-icon {
  font-size: 1.8rem;
}

.type-btn span {
  font-weight: 600;
  font-size: 0.9rem;
}

.type-btn small {
  font-size: 0.65rem;
  color: #64748b;
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

.reset-btn, .new-btn {
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

.reset-btn:hover, .new-btn:hover {
  transform: translateY(-1px);
}

.graph-container {
  flex: 1;
  background: #ffffff;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: auto;
  padding: 20px;
}

.graph-svg {
  width: 100%;
  height: 100%;
  min-width: 900px;
  min-height: 600px;
  background: #ffffff;
  background-image: radial-gradient(#e2e8f0 1px, transparent 1px);
  background-size: 25px 25px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

/* Nodos */
.node-circle {
  fill: white;
  stroke: #cbd5e1;
  stroke-width: 2;
  transition: all 0.3s ease;
  cursor: pointer;
}

.node-start {
  fill: #dcfce7;
  stroke: #10b981;
  stroke-width: 3;
}

.node-end {
  fill: #fee2e2;
  stroke: #ef4444;
  stroke-width: 3;
}

.node-highlight {
  fill: #fde047;
  stroke: #eab308;
  stroke-width: 3;
  filter: drop-shadow(0 0 8px rgba(234, 179, 8, 0.5));
}

.node-label {
  font-size: 15px;
  font-weight: bold;
  text-anchor: middle;
  dominant-baseline: middle;
  fill: #1e293b;
}

.node-value-top {
  font-size: 12px;
  font-weight: 600;
  text-anchor: middle;
  dominant-baseline: middle;
  fill: #3b82f6;
}

.node-value-bottom {
  font-size: 12px;
  font-weight: 600;
  text-anchor: middle;
  dominant-baseline: middle;
  fill: #f59e0b;
}

/* Aristas */
.edge-line {
  stroke: #94a3b8;
  stroke-width: 2;
  transition: all 0.3s ease;
}

.edge-highlight {
  stroke: #eab308;
  stroke-width: 4;
}

.arrow {
  fill: #94a3b8;
  transition: all 0.3s ease;
}

.arrow-highlight {
  fill: #eab308;
}

.edge-weight {
  font-size: 12px;
  font-weight: bold;
  text-anchor: middle;
  dominant-baseline: middle;
  fill: #475569;
}

/* Scrollbar */
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
  
  .graph-svg {
    min-width: 100%;
  }
}
</style>