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
const getArrowsConfig = (directed) =>
  directed ? "to" : { to: { enabled: false } };

const normalizeUndirectedEdges = () => {
  const allEdges = edges.get();
  const seenPairs = new Map();
  const edgesToRemove = [];
  const edgesToUpdate = [];

  allEdges.forEach((edge) => {
    const a = Number(edge.from);
    const b = Number(edge.to);
    const pairKey = a <= b ? `${a}-${b}` : `${b}-${a}`;

    if (!seenPairs.has(pairKey)) {
      seenPairs.set(pairKey, edge.id);
      return;
    }

    edgesToRemove.push(edge.id);
  });

  seenPairs.forEach((edgeId) => {
    edgesToUpdate.push({ id: edgeId, arrows: getArrowsConfig(false) });
  });

  if (edgesToRemove.length > 0) edges.remove(edgesToRemove);
  if (edgesToUpdate.length > 0) edges.update(edgesToUpdate);
};

const findEdgeBetweenNodes = (nodeA, nodeB) =>
  edges
    .get()
    .find(
      (edge) =>
        (edge.from === nodeA && edge.to === nodeB) ||
        (edge.from === nodeB && edge.to === nodeA),
    );

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
    const defaultLabel = getLetterLabel(newId);
    const inputLabel = window.prompt(
      "Ingresa el nombre del nodo:",
      defaultLabel,
    );
    if (inputLabel === null) return;

    const finalLabel = inputLabel.trim() || defaultLabel;
    nodes.add({ id: newId, label: finalLabel, x, y });

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
      if (!isDirected.value) {
        const existingEdge = findEdgeBetweenNodes(sourceNode.value, targetId);
        if (existingEdge) {
          edges.update({
            id: existingEdge.id,
            label: String(weight),
            arrows: getArrowsConfig(false),
          });
          nodes.update({ id: sourceNode.value, color: null });
          sourceNode.value = null;
          edgeStep.value = "Selecciona Origen";
          if (showMatrixPanel.value) updateMatrix();
          return;
        }
      }

      edges.add({
        from: sourceNode.value,
        to: targetId,
        label: String(weight),
        arrows: getArrowsConfig(isDirected.value),
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

  // --- FUNCIÓN AÑADIDA: EDITAR NOMBRE DE NODO ---
  const updateNodeLabel = (nodeId) => {
    const node = nodes.get(nodeId);
    if (!node) return;
    let newLabel = window.prompt("Modifica el nombre del nodo:", node.label);

    if (newLabel === null || newLabel.trim() === "") return;

    nodes.update({ id: nodeId, label: newLabel.trim() });

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
    if (!isDirected.value) {
      normalizeUndirectedEdges();
    } else {
      const allEdges = edges.get();
      const updates = allEdges.map((edge) => ({
        id: edge.id,
        arrows: getArrowsConfig(true),
      }));
      edges.update(updates);
    }
    if (showMatrixPanel.value) updateMatrix(); // Actualiza matriz en vivo
  };

  const clearGraph = () => {
    nodes.clear();
    edges.clear();
    setMode("move");
    if (showMatrixPanel.value) updateMatrix(); // Limpia la matriz
  };

  // --- NUEVA FUNCIÓN: EXPORTAR GRAFO ---
  const exportGraph = async () => {
    const data = {
      nodes: nodes.get(),
      edges: edges.get(),
      isDirected: isDirected.value,
    };
    const defaultName = "mi_grafo";
    const fileNameInput = window.prompt(
      "Nombre del archivo (sin extension):",
      defaultName,
    );
    if (fileNameInput === null) return;

    const safeBaseName = (fileNameInput.trim() || defaultName).replace(
      /[\\/:*?"<>|]/g,
      "_",
    );
    const finalFileName = safeBaseName.endsWith(".json")
      ? safeBaseName
      : `${safeBaseName}.json`;
    const jsonData = JSON.stringify(data, null, 2);

    try {
      if ("showSaveFilePicker" in window) {
        const fileHandle = await window.showSaveFilePicker({
          suggestedName: finalFileName,
          types: [
            {
              description: "Archivo JSON",
              accept: { "application/json": [".json"] },
            },
          ],
        });
        const writable = await fileHandle.createWritable();
        await writable.write(jsonData);
        await writable.close();
        alert(`✅ Grafo exportado como ${fileHandle.name}`);
        return;
      }
    } catch (error) {
      if (error?.name === "AbortError") return;
    }

    const blob = new Blob([jsonData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", url);
    downloadAnchorNode.setAttribute("download", finalFileName);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    URL.revokeObjectURL(url);
    alert(
      "⚠️ Tu navegador descargó el archivo en la carpeta de descargas por defecto.",
    );
  };

  // --- NUEVA FUNCIÓN: IMPORTAR GRAFO ---
  const importGraph = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        // 1. Leemos el archivo JSON
        const data = JSON.parse(e.target.result);

        // 2. Limpiamos el lienzo actual
        nodes.clear();
        edges.clear();

        // 3. Restauramos la configuración y los datos
        if (data.isDirected !== undefined) isDirected.value = data.isDirected;
        if (data.nodes) nodes.add(data.nodes);
        if (data.edges) edges.add(data.edges);
        // Fuerza consistencia visual de flechas segun modo dirigido/no dirigido.
        const importedEdges = edges.get();
        if (importedEdges.length > 0) {
          edges.update(
            importedEdges.map((edge) => ({
              id: edge.id,
              arrows: getArrowsConfig(isDirected.value),
            })),
          );
        }

        // 4. Actualizamos la matriz si el panel está abierto
        if (showMatrixPanel.value) updateMatrix();

        alert("✅ Grafo importado con éxito");
      } catch (error) {
        alert(
          "❌ Error al leer el archivo. Asegúrate de que sea un archivo .json válido.",
        );
      }
    };
    reader.readAsText(file);

    // Reseteamos el input para que puedas volver a importar el mismo archivo si quieres
    event.target.value = null;
  };

  return {
    nodes,
    edges,
    currentMode,
    edgeStep,
    sourceNode,
    isDirected,
    showMatrixPanel,
    matrixData,
    setMode,
    addNode,
    setSourceNode,
    connectNodes,
    updateEdgeWeight,
    updateNodeLabel,
    deleteNode,
    deleteEdge,
    toggleDirected,
    clearGraph,
    toggleMatrixPanel,
    exportGraph, // <--- AÑADE ESTO AQUÍ
    importGraph, // <--- AÑADE ESTO AQUÍ
  };
}
