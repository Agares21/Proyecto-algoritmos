<template>
  <div class="graph-canvas-container">
    <div ref="canvasRef" class="graph-canvas"></div>
    
    <!-- Modal de Matriz de Adyacencia -->
    <div v-if="showMatrixPanel" class="matrix-modal-overlay" @click.self="toggleMatrixPanel">
      <div class="matrix-modal">
        <div class="matrix-modal-header">
          <h3>📊 Matriz de Adyacencia</h3>
          <button @click="toggleMatrixPanel" class="matrix-close-btn">✕</button>
        </div>
        
        <div class="matrix-modal-body">
          <div class="matrix-info">
            <span class="matrix-type">Grafo Dirigido</span>
            <span class="matrix-size">{{ matrixData.labels.length }} x {{ matrixData.labels.length }}</span>
          </div>
          
          <div class="matrix-table-container">
            <table class="matrix-table">
              <thead>
                <tr>
                  <th class="corner-cell"></th>
                  <th v-for="label in matrixData.labels" :key="'col-' + label" class="col-header">
                    {{ label }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, rowIndex) in matrixData.matrix" :key="'row-' + rowIndex">
                  <th class="row-header">{{ matrixData.labels[rowIndex] }}</th>
                  <td 
                    v-for="(cell, colIndex) in row" 
                    :key="'cell-' + rowIndex + '-' + colIndex"
                    :class="{ 'nonzero-cell': cell !== 0 }"
                  >
                    {{ cell !== 0 ? cell : '0' }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div class="matrix-footer">
            <p class="matrix-note">💡 Cada celda muestra el peso de la arista del nodo fila al nodo columna</p>
            <button @click="toggleMatrixPanel" class="matrix-close-footer">Cerrar</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from "vue";
import { Network } from "vis-network";
import { useGraph } from "../composables/useGraph";

const canvasRef = ref(null);
const {
  nodes,
  edges,
  currentMode,
  addNode,
  sourceNode,
  setSourceNode,
  connectNodes,
  cancelEdgeSelection,
  setMode,
  updateEdgeWeight,
  deleteNode,
  deleteEdge,
  updateNodeLabel,
  showMatrixPanel,
  matrixData,
  toggleMatrixPanel,
} = useGraph();

let network = null;

const options = {
  physics: { enabled: false },
  interaction: { 
    hover: true, 
    dragNodes: true, 
    dragView: true, 
    zoomView: true,
    tooltipDelay: 200,
  },
  nodes: {
    shape: "circle",
    size: 30,
    font: { size: 16, color: "#000000", face: "Arial", bold: true },
    borderWidth: 2,
    shadow: {
      enabled: true,
      color: "rgba(0,0,0,0.1)",
      size: 4,
      x: 2,
      y: 2,
    },
    color: {
      background: "#97C2FC",
      border: "#2B7CE9",
    },
  },
  edges: {
    width: 2,
    smooth: { type: "continuous" },
    font: { 
      align: "top", 
      size: 12, 
      color: "#333333", 
      background: "white",
    },
    shadow: true,
    arrows: { to: { enabled: true } },
  },
};

const handleKeyDown = (event) => {
  if (event.key === 'v' || event.key === 'V') setMode('move');
  if (event.key === 'n' || event.key === 'N') setMode('node');
  if (event.key === 'e' || event.key === 'E') setMode('edge');
  if (event.key === 'd' || event.key === 'D') setMode('delete');
  
  if (event.key === 'Delete' || event.key === 'Backspace') {
    if (network) {
      const selectedNodes = network.getSelectedNodes();
      const selectedEdges = network.getSelectedEdges();
      if (selectedNodes.length > 0) deleteNode(selectedNodes[0]);
      else if (selectedEdges.length > 0) deleteEdge(selectedEdges[0]);
    }
  }
};

onMounted(() => {
  if (canvasRef.value) {
    network = new Network(canvasRef.value, { nodes, edges }, options);
    window.addEventListener("keydown", handleKeyDown);
    network.on("dragEnd", () => {
      network.storePositions();
    });

    network.on("doubleClick", (params) => {
      if (currentMode.value === "move") {
        const clickedNodeId = params.nodes.length > 0 ? params.nodes[0] : null;
        const clickedEdgeId = params.edges.length > 0 ? params.edges[0] : null;
        if (clickedNodeId) updateNodeLabel(clickedNodeId);
        else if (clickedEdgeId) updateEdgeWeight(clickedEdgeId);
      }
    });

    network.on("click", (params) => {
      const clickPos = params.pointer.canvas;
      const clickedNodeId = params.nodes.length > 0 ? params.nodes[0] : null;
      
      if (currentMode.value === "delete") {
        const selectedNodes = network.getSelectedNodes();
        const selectedEdges = network.getSelectedEdges();
        if (selectedNodes.length > 0) deleteNode(selectedNodes[0]);
        else if (selectedEdges.length > 0) deleteEdge(selectedEdges[0]);
      }
      
      if (currentMode.value === "node" && !clickedNodeId) {
        addNode(clickPos.x, clickPos.y);
      }
      
      if (currentMode.value === "edge" && clickedNodeId) {
        if (sourceNode.value === null) {
          setSourceNode(clickedNodeId);
        } else {
          let peso = prompt("Peso de la arista:");
          if (peso && !isNaN(peso) && peso.trim() !== "") {
            connectNodes(clickedNodeId, parseFloat(peso));
          } else {
            cancelEdgeSelection();
          }
        }
      }
    });
  }
});

watch(currentMode, (newMode) => {
  if (network) {
    network.setOptions({ interaction: { dragNodes: newMode === "move" } });
  }
});

onUnmounted(() => {
  if (network) network.destroy();
  window.removeEventListener("keydown", handleKeyDown);
});
</script>

<style scoped>
.graph-canvas-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.graph-canvas {
  width: 100%;
  height: 100%;
  background: #ffffff;
  background-image: radial-gradient(#e2e8f0 1px, transparent 1px);
  background-size: 25px 25px;
  outline: none;
}

/* Modal de Matriz - Ventana flotante centrada */
.matrix-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  animation: fadeIn 0.2s ease;
}

.matrix-modal {
  background: white;
  border-radius: 20px;
  width: 90%;
  max-width: 800px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease;
}

.matrix-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e2e8f0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px 20px 0 0;
}

.matrix-modal-header h3 {
  margin: 0;
  font-size: 1.2rem;
  color: white;
}

.matrix-close-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.matrix-close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.05);
}

.matrix-modal-body {
  padding: 20px 24px;
  overflow-y: auto;
  flex: 1;
}

.matrix-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f8fafc;
  border-radius: 12px;
  margin-bottom: 20px;
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
  margin-bottom: 20px;
}

.matrix-table {
  border-collapse: collapse;
  margin: 0 auto;
  font-size: 13px;
  min-width: 300px;
}

.matrix-table th,
.matrix-table td {
  border: 1px solid #cbd5e1;
  padding: 10px 12px;
  text-align: center;
  min-width: 50px;
}

.matrix-table th {
  background: #f1f5f9;
  font-weight: 600;
  color: #334155;
  position: sticky;
  top: 0;
}

.corner-cell {
  background: #f1f5f9;
}

.col-header {
  background: #f1f5f9;
  font-weight: 600;
}

.row-header {
  background: #f1f5f9;
  font-weight: 600;
  position: sticky;
  left: 0;
}

.nonzero-cell {
  background: #dbeafe;
  color: #1e40af;
  font-weight: 600;
}

.matrix-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid #e2e8f0;
}

.matrix-note {
  margin: 0;
  font-size: 0.75rem;
  color: #64748b;
}

.matrix-close-footer {
  padding: 8px 20px;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
  transition: all 0.2s;
}

.matrix-close-footer:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

/* Animaciones */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* Scroll personalizado */
.matrix-modal-body::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.matrix-modal-body::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 10px;
}

.matrix-modal-body::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}

.matrix-modal-body::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
