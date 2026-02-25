import { ref } from "vue";
import { DataSet } from "vis-data";

// --- ESTADO GLOBAL ---
const nodes = new DataSet([]);
const edges = new DataSet([]);
const currentMode = ref("move");
const edgeStep = ref("Inactivo");
const sourceNode = ref(null);
const isDirected = ref(false);

// --- NUEVO: ESTADO DE LA MATRIZ ---
const showMatrixPanel = ref(false);
const matrixData = ref({ labels: [], matrix: [] });

export function useGraph() {
  // Función para calcular y actualizar la matriz al instante
  const updateMatrix = () => {
    const allNodes = nodes.get().sort((a, b) => a.id - b.id);
    const allEdges = edges.get();
    const n = allNodes.length;
    const labels = allNodes.map((node) => node.label);

    const idToIndex = {};
    allNodes.forEach((node, index) => {
      idToIndex[node.id] = index;
    });

    const matrix = Array(n)
      .fill(null)
      .map(() => Array(n).fill(0));

    allEdges.forEach((edge) => {
      const fromIdx = idToIndex[edge.from];
      const toIdx = idToIndex[edge.to];
      const weight = parseFloat(edge.label);

      if (fromIdx !== undefined && toIdx !== undefined) {
        matrix[fromIdx][toIdx] = weight;
        if (!isDirected.value) matrix[toIdx][fromIdx] = weight;
      }
    });

    matrixData.value = { labels, matrix };
  };

  // Mostrar/Ocultar el panel lateral
  const toggleMatrixPanel = () => {
    showMatrixPanel.value = !showMatrixPanel.value;
    if (showMatrixPanel.value) updateMatrix();
  };

  const setMode = (mode) => {
    currentMode.value = mode;
    sourceNode.value = null;
    edgeStep.value = mode === "edge" ? "Selecciona Origen" : "Inactivo";
    nodes.forEach((node) => nodes.update({ id: node.id, color: null }));
  };

  const getLetterLabel = (num) => {
    let label = "";
    let temp = num;
    while (temp > 0) {
      let rem = (temp - 1) % 26;
      label = String.fromCharCode(65 + rem) + label;
      temp = Math.floor((temp - 1) / 26);
    }
    return label;
  };

  const addNode = (x, y) => {
    const allIds = nodes.getIds();
    const newId = allIds.length > 0 ? Math.max(...allIds) + 1 : 1;
    nodes.add({ id: newId, label: getLetterLabel(newId), x, y });

    if (showMatrixPanel.value) updateMatrix(); // Actualiza matriz en vivo
  };

  const setSourceNode = (nodeId) => {
    sourceNode.value = nodeId;
    edgeStep.value = "Selecciona Destino";
    nodes.update({
      id: nodeId,
      color: { background: "#FFD700", border: "#FFA500" },
    });
  };

  const connectNodes = (targetId, weight) => {
    if (sourceNode.value !== null) {
      edges.add({
        from: sourceNode.value,
        to: targetId,
        label: String(weight),
        arrows: isDirected.value ? "to" : undefined,
        font: { align: "top", size: 14, color: "#333333", background: "white" },
      });
      nodes.update({ id: sourceNode.value, color: null });
      sourceNode.value = null;
      edgeStep.value = "Selecciona Origen";

      if (showMatrixPanel.value) updateMatrix(); // Actualiza matriz en vivo
    }
  };

  const updateEdgeWeight = (edgeId) => {
    const edge = edges.get(edgeId);
    if (!edge) return;
    let newWeight = window.prompt(
      "Modifica el peso de la arista (SOLO NÚMEROS):",
      edge.label,
    );
    if (newWeight === null) return;
    while (isNaN(newWeight) || newWeight.trim() === "") {
      newWeight = window.prompt(
        "❌ Valor inválido. Ingresa SOLO NÚMEROS:",
        edge.label,
      );
      if (newWeight === null) return;
    }
    edges.update({ id: edgeId, label: String(newWeight) });

    if (showMatrixPanel.value) updateMatrix(); // Actualiza matriz en vivo
  };

  const deleteNode = (nodeId) => {
    const connectedEdges = edges
      .get()
      .filter((e) => e.from === nodeId || e.to === nodeId);
    edges.remove(connectedEdges.map((e) => e.id));
    nodes.remove(nodeId);
    if (showMatrixPanel.value) updateMatrix(); // Actualiza matriz en vivo
  };

  const deleteEdge = (edgeId) => {
    edges.remove(edgeId);
    if (showMatrixPanel.value) updateMatrix(); // Actualiza matriz en vivo
  };

  const toggleDirected = () => {
    isDirected.value = !isDirected.value;
    const allEdges = edges.get();
    const updates = allEdges.map((edge) => ({
      id: edge.id,
      arrows: isDirected.value ? "to" : undefined,
    }));
    edges.update(updates);
    if (showMatrixPanel.value) updateMatrix(); // Actualiza matriz en vivo
  };

  const clearGraph = () => {
    nodes.clear();
    edges.clear();
    setMode("move");
    if (showMatrixPanel.value) updateMatrix(); // Limpia la matriz
  };

  return {
    nodes,
    edges,
    currentMode,
    edgeStep,
    sourceNode,
    isDirected,
    showMatrixPanel,
    matrixData, // EXPORTAMOS LA MATRIZ Y SU ESTADO
    setMode,
    addNode,
    setSourceNode,
    connectNodes,
    updateEdgeWeight,
    deleteNode,
    deleteEdge,
    toggleDirected,
    clearGraph,
    toggleMatrixPanel,
  };
}
