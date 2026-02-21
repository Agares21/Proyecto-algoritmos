import { ref } from "vue";
import { DataSet } from "vis-data";

// --- ESTADO GLOBAL (Singleton) ---
const nodes = new DataSet([]);
const edges = new DataSet([]);
const currentMode = ref("move"); // 'move', 'node', 'edge'
const edgeStep = ref("Inactivo"); // Texto de ayuda
const sourceNode = ref(null); // ID del nodo origen
const isDirected = ref(false); // Estado de grafo dirigido/no dirigido

export function useGraph() {
  // Cambiar herramienta
  const setMode = (mode) => {
    currentMode.value = mode;
    sourceNode.value = null; // Resetear selección al cambiar modo
    edgeStep.value = mode === "edge" ? "Selecciona Origen" : "Inactivo";

    // Restaurar colores de nodos si había alguno seleccionado
    nodes.forEach((node) => {
      nodes.update({ id: node.id, color: null });
    });
  };

  // Agregar Nodo
  const addNode = (x, y) => {
    const allIds = nodes.getIds();
    const newId = allIds.length > 0 ? Math.max(...allIds) + 1 : 1;
    nodes.add({ id: newId, label: String(newId), x, y });
  };

  // Preparar conexión (Paso 1: Seleccionar origen)
  const setSourceNode = (nodeId) => {
    sourceNode.value = nodeId;
    edgeStep.value = "Selecciona Destino";
    // Feedback visual: Poner amarillo el origen
    nodes.update({
      id: nodeId,
      color: { background: "#FFD700", border: "#FFA500" },
    });
  };

  // Conectar nodos (Paso 2: Crear arista)
  const connectNodes = (targetId, weight = "") => {
    if (sourceNode.value !== null) {
      edges.add({
        from: sourceNode.value,
        to: targetId,
        label: weight ? String(weight) : undefined, // Solo muestra etiqueta si hay peso
        arrows: isDirected.value ? "to" : undefined, // Flecha si está activado
      });

      // Restaurar color del origen
      nodes.update({ id: sourceNode.value, color: null }); // null vuelve al default

      // Resetear estado
      sourceNode.value = null;
      edgeStep.value = "Selecciona Origen";
    }
  };

  // Alternar entre Dirigido / No Dirigido
  const toggleDirected = () => {
    isDirected.value = !isDirected.value;
    const allEdges = edges.get();

    // Actualizar visualmente todas las aristas existentes
    const updates = allEdges.map((edge) => ({
      id: edge.id,
      arrows: isDirected.value ? "to" : undefined,
    }));
    edges.update(updates);
  };

  const clearGraph = () => {
    nodes.clear();
    edges.clear();
    setMode("move");
  };

  return {
    nodes,
    edges,
    currentMode,
    edgeStep,
    sourceNode,
    isDirected,
    setMode,
    addNode,
    setSourceNode,
    connectNodes,
    toggleDirected,
    clearGraph,
  };
}
