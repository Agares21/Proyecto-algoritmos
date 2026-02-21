<template>
  <div ref="canvasRef" class="canvas-container"></div>
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
} = useGraph();

let network = null;

// Configuración visual de Vis.js
const options = {
  physics: { enabled: false }, // Sin física loca
  interaction: {
    hover: true,
    dragNodes: true,
    dragView: true,
    zoomView: true,
  },
  nodes: {
    shape: "dot",
    size: 20,
    font: { size: 16 },
    borderWidth: 2,
    shadow: true,
  },
  edges: {
    width: 2,
    smooth: { type: "continuous" }, // Curva suave (necesario para bucles)
    font: { align: "top", size: 14 }, // Estilo del texto del peso
  },
};

// Observar cambio de modo para bloquear arrastre
watch(currentMode, (newMode) => {
  if (network) {
    network.setOptions({ interaction: { dragNodes: newMode === "move" } });
  }
});

onMounted(() => {
  if (canvasRef.value) {
    network = new Network(canvasRef.value, { nodes, edges }, options);

    network.on("click", (params) => {
      const clickPos = params.pointer.canvas;
      const clickedNodeId = params.nodes[0];

      // --- 1. MODO NODO ---
      if (currentMode.value === "node" && !clickedNodeId) {
        addNode(clickPos.x, clickPos.y);
      }

      // --- 2. MODO ARISTA ---
      if (currentMode.value === "edge" && clickedNodeId) {
        // A) Primer clic: Seleccionar Origen
        if (sourceNode.value === null) {
          setSourceNode(clickedNodeId);
        }
        // B) Segundo clic: Confirmar Destino
        else {
          // Preguntar por el peso
          // Nota: sourceNode.value y clickedNodeId pueden ser iguales (BUCLE)
          const peso = prompt(
            "Ingresa el peso de la arista (Enter para sin peso):",
          );

          if (peso !== null) {
            // Si no dio a cancelar
            connectNodes(clickedNodeId, peso);
          }
        }
      }
    });

    // Configuración inicial
    network.setOptions({
      interaction: { dragNodes: currentMode.value === "move" },
    });
  }
});

onUnmounted(() => {
  if (network) network.destroy();
});
</script>

<style scoped>
.canvas-container {
  width: 100%;
  height: 100%; /* Ocupa todo el espacio disponible */
  background: #ffffff;
  /* Patrón de puntos estilo cuaderno */
  background-image: radial-gradient(#ccc 1px, transparent 1px);
  background-size: 20px 20px;
}
</style>
