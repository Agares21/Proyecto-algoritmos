<template>
  <div class="editor-layout">
    <div class="canvas-wrapper">
      <div ref="canvasRef" class="canvas-container"></div>
    </div>

    <div v-if="showMatrixPanel" class="matrix-panel">
      <div class="panel-header">
        <h3>Matriz de Adyacencia</h3>
      </div>

      <div class="table-container">
        <table class="matriz-table">
          <thead>
            <tr>
              <th></th>
              <th v-for="label in matrixData.labels" :key="'col-' + label">
                {{ label }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(row, rowIndex) in matrixData.matrix"
              :key="'row-' + rowIndex"
            >
              <td class="row-header">
                <strong>{{ matrixData.labels[rowIndex] }}</strong>
              </td>
              <td
                v-for="(col, colIndex) in row"
                :key="'cell-' + rowIndex + '-' + colIndex"
                :class="{ 'celda-cero': col === 0, 'celda-valor': col !== 0 }"
              >
                {{ col }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p class="panel-info">
        💡 Dibuja, borra o edita nodos y verás la matriz cambiar en vivo.
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from "vue";
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
  setMode,
  updateEdgeWeight,
  deleteNode,
  deleteEdge,
  showMatrixPanel,
  matrixData,
  updateNodeLabel, // <-- ESTO DEBE ESTAR AQUÍ
} = useGraph();

let network = null;

// CORRECCIÓN 1: Quitamos el "bold: true" que rompía el dibujo del nodo
const options = {
  physics: { enabled: false },
  interaction: { hover: true, dragNodes: true, dragView: true, zoomView: true },
  nodes: {
    shape: "circle",
    font: { size: 18, color: "#000000" } /* Letra negra sólida y segura */,
    borderWidth: 2,
    shadow: true,
    color: { background: "#97C2FC", border: "#2B7CE9" },
    margin: 10,
  },
  edges: {
    width: 2,
    smooth: { type: "continuous" },
    font: { align: "top", size: 14, color: "#333333", background: "white" },
  },
};

const borrarSeleccion = (nodeId, edgeId) => {
  if (nodeId) deleteNode(nodeId);
  else if (edgeId) deleteEdge(edgeId);
};

const handleKeyDown = (event) => {
  if (event.key === "Delete" || event.key === "Backspace") {
    if (network) {
      const selectedNodes = network.getSelectedNodes();
      const selectedEdges = network.getSelectedEdges();
      if (selectedNodes.length > 0) borrarSeleccion(selectedNodes[0], null);
      else if (selectedEdges.length > 0)
        borrarSeleccion(null, selectedEdges[0]);
    }
  }
};

onMounted(() => {
  if (canvasRef.value) {
    network = new Network(canvasRef.value, { nodes, edges }, options);
    window.addEventListener("keydown", handleKeyDown);

    network.on("doubleClick", (params) => {
      // ¡RECUERDA! Solo funciona si tienes la flechita (Mover) seleccionada
      if (currentMode.value === "move") {
        const clickedNodeId = params.nodes.length > 0 ? params.nodes[0] : null;
        const clickedEdgeId =
          params.edges.length > 0 && !clickedNodeId ? params.edges[0] : null;

        if (clickedNodeId) {
          updateNodeLabel(clickedNodeId);
        } else if (clickedEdgeId) {
          updateEdgeWeight(clickedEdgeId);
        }
      }
    });

    network.on("click", (params) => {
      const clickPos = params.pointer.canvas;
      const clickedNodeId = params.nodes.length > 0 ? params.nodes[0] : null;
      const clickedEdgeId =
        params.edges.length > 0 && !clickedNodeId ? params.edges[0] : null;

      if (currentMode.value === "delete")
        borrarSeleccion(clickedNodeId, clickedEdgeId);

      // Aquí es donde se agrega el nodo si la herramienta está activa
      if (currentMode.value === "node" && !clickedNodeId)
        addNode(clickPos.x, clickPos.y);

      if (currentMode.value === "edge" && clickedNodeId) {
        if (sourceNode.value === null) setSourceNode(clickedNodeId);
        else {
          let peso = prompt("Ingresa el peso de la arista (SOLO NÚMEROS):");
          if (peso !== null) {
            while (isNaN(peso) || peso.trim() === "") {
              peso = prompt("❌ Valor inválido. Ingresa SOLO NÚMEROS:");
              if (peso === null) break;
            }
          }
          if (peso !== null) connectNodes(clickedNodeId, peso);
          else if (setMode) setMode("move");
        }
      }
    });

    network.setOptions({
      interaction: { dragNodes: currentMode.value === "move" },
    });
  }
});

watch(currentMode, (newMode) => {
  if (network)
    network.setOptions({ interaction: { dragNodes: newMode === "move" } });
});

watch(showMatrixPanel, () => {
  nextTick(() => {
    if (network) network.redraw();
  });
});

onUnmounted(() => {
  if (network) network.destroy();
  window.removeEventListener("keydown", handleKeyDown);
});
</script>

<style scoped>
/* --- MAQUETACIÓN DIVIDIDA (EL CONTENEDOR PADRE) --- */
.editor-layout {
  display: flex;
  flex-direction: row;
  width: 100%;

  /* Usamos 85vh (85% de la pantalla) que es mucho más seguro 
     y no chocará con tu barra verde de arriba */
  height: 85vh;
  min-height: 600px;
  overflow: hidden;
  border-bottom: 2px solid #e2e8f0; /* Una línea sutil para ver dónde termina tu área de trabajo */
}

/* --- LADO IZQUIERDO (EL LIENZO) --- */
.canvas-wrapper {
  flex: 1; /* Toma el 70% o el 100% según si la matriz está abierta */
  position: relative; /* Clave para el truco de abajo */
  height: 100%;
}

.canvas-container {
  /* ¡ESTE ES EL TRUCO MÁGICO! Fuerza al lienzo a estirarse a las 4 esquinas de su padre */
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;

  width: 100%;
  height: 100%;
  background: #ffffff;
  background-image: radial-gradient(#ccc 1px, transparent 1px);
  background-size: 20px 20px;
  outline: none;
}

/* --- LADO DERECHO (EL PANEL DE LA MATRIZ) --- */
.matrix-panel {
  width: 30%;
  min-width: 320px;
  height: 100%; /* Obliga a la matriz a tener la misma altura que el lienzo */
  background: #f8fafc;
  border-left: 2px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  box-shadow: -5px 0 15px rgba(0, 0, 0, 0.03);
}

.panel-header {
  padding: 20px;
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  text-align: center;
}

.panel-header h3 {
  margin: 0;
  color: #1e293b;
  font-size: 1.2rem;
}

.table-container {
  padding: 20px;
  overflow-y: auto;
  overflow-x: auto;
  flex: 1;
}

/* --- TABLA --- */
.matriz-table {
  border-collapse: collapse;
  margin: 0 auto;
  background: white;
}

/* 2. Busca .matriz-table th, .matriz-table td y reemplázalo por esto: */
.matriz-table th,
.matriz-table td {
  border: 1px solid #cbd5e1;
  /* Reducimos de 40px a 32px para que la tabla sea más compacta */
  width: 32px;
  height: 32px;
  text-align: center;
  vertical-align: middle;
  font-size: 0.9rem; /* Letra un pelín más pequeña */
}
.row-header {
  background: #f1f5f9;
  color: #334155;
}

.celda-cero {
  color: #cbd5e1;
  font-size: 0.85rem;
}
.celda-valor {
  font-weight: bold;
  color: #2563eb;
  background-color: #eff6ff;
}

.panel-info {
  padding: 15px;
  font-size: 0.85rem;
  color: #64748b;
  text-align: center;
  background: #f1f5f9;
  margin: 0;
  border-top: 1px solid #e2e8f0;
}

@media (max-width: 768px) {
  .editor-layout {
    flex-direction: column;
  }
  .matrix-panel {
    width: 100%;
    height: 300px;
    border-left: none;
    border-top: 2px solid #e2e8f0;
  }
}
</style>
