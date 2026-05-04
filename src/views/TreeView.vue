<template>
  <div class="tree-page">
    <div class="hero-section">
      <div class="hero-content">
        <h1>🌳 Árbol Binario - Recorridos</h1>
        <p>Preorder, Inorder y Postorder - Construcción dinámica paso a paso</p>
      </div>
      <div class="algorithm-badge" :class="getBadgeClass()">
        {{ getTreeTypeName() }}
      </div>
    </div>

    <div class="main-layout">
      <!-- Panel de configuración -->
      <div class="config-card">
        <div class="config-header">
          <h3>⚙️ Configuración</h3>
        </div>

        <div class="config-group">
          <div class="mode-selector">
            <button
              @click="inputMode = 'dynamic'"
              class="mode-btn"
              :class="{ active: inputMode === 'dynamic' }"
            >
              🔢 Agregar Números
            </button>
            <button
              @click="inputMode = 'sequences'"
              class="mode-btn"
              :class="{ active: inputMode === 'sequences' }"
            >
              📝 Ingresar Recorridos
            </button>
          </div>

          <!-- Modo Dinámico -->
          <div v-if="inputMode === 'dynamic'" class="dynamic-mode">
            <div class="input-group">
              <label>📌 Nuevo valor</label>
              <div class="number-input-group">
                <input
                  v-model.number="newNodeValue"
                  type="number"
                  class="number-input"
                  placeholder="Ej: 50"
                  @keyup.enter="addNode"
                />
                <button @click="addNode" class="btn-add">➕ Agregar</button>
              </div>
            </div>

            <div class="tree-type-buttons">
              <button
                @click="treeType = 'bst'"
                class="type-btn"
                :class="{ active: treeType === 'bst' }"
              >
                🌲 BST
              </button>
              <button
                @click="treeType = 'complete'"
                class="type-btn"
                :class="{ active: treeType === 'complete' }"
              >
                🌳 Completo
              </button>
              <button
                @click="treeType = 'simple'"
                class="type-btn"
                :class="{ active: treeType === 'simple' }"
              >
                🌿 Simple
              </button>
            </div>

            <div class="action-buttons">
              <button @click="generateRandomNode" class="btn-random">
                🎲 Aleatorio
              </button>
              <button @click="generateBalancedSample" class="btn-balanced">
                ⚖️ Ejemplo
              </button>
              <button @click="clearAllNodes" class="btn-clear">
                🗑️ Limpiar
              </button>
            </div>

            <div v-if="nodeValuesList.length > 0" class="values-list">
              <label
                >📋 Valores ingresados ({{ nodeValuesList.length }}):</label
              >
              <div class="values-badges">
                <span
                  v-for="(val, idx) in nodeValuesList"
                  :key="idx"
                  class="value-badge"
                >
                  {{ val }}
                  <button @click="removeNodeAtIndex(idx)" class="remove-badge">
                    ×
                  </button>
                </span>
              </div>
            </div>
          </div>

          <!-- Modo Secuencias -->
          <div v-else class="sequences-mode">
            <div class="input-group">
              <label>📋 Preorder (raíz → izquierda → derecha)</label>
              <input
                v-model="preorderInput"
                type="text"
                class="sequence-input"
                placeholder="Ej: 50,30,20,40,70,60,80"
              />
            </div>

            <div class="input-group">
              <label>📋 Inorder (izquierda → raíz → derecha)</label>
              <input
                v-model="inorderInput"
                type="text"
                class="sequence-input"
                placeholder="Ej: 20,30,40,50,60,70,80"
              />
            </div>

            <div class="input-group">
              <label>📋 Postorder (izquierda → derecha → raíz)</label>
              <input
                v-model="postorderInput"
                type="text"
                class="sequence-input"
                placeholder="Ej: 20,40,30,60,80,70,50"
              />
            </div>

            <div class="action-buttons">
              <button @click="buildFromSequences" class="btn-construct">
                🌲 Construir Árbol
              </button>
              <button @click="clearSequences" class="btn-clear">Limpiar</button>
            </div>
          </div>

          <div class="import-export-section">
            <div class="file-name-input">
              <label>📁 Nombre del archivo</label>
              <input
                type="text"
                v-model="exportFileName"
                class="file-name-field"
                placeholder="mi_arbol"
              />
            </div>
            <div class="import-export-buttons">
              <button @click="exportData" class="btn-export">
                📤 Exportar
              </button>
              <label class="btn-import">
                📥 Importar
                <input
                  type="file"
                  accept=".json"
                  @change="importData"
                  style="display: none"
                />
              </label>
            </div>
          </div>

          <button @click="resetTree" class="btn-reset">⟳ Reiniciar</button>
          <button @click="showHelpModal = true" class="btn-help">
            ❓ Ayuda
          </button>
        </div>

        <div class="stats-display">
          <div class="stat-item">
            <span class="stat-label">📊 Nodos</span>
            <span class="stat-value">{{ nodeCount }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">📏 Altura</span>
            <span class="stat-value">{{ treeHeight }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">🔢 Niveles</span>
            <span class="stat-value">{{ treeLevels }}</span>
          </div>
        </div>

        <p v-if="statusMessage" class="status-message" :class="statusTone">
          {{ statusMessage }}
        </p>
      </div>

      <!-- Visualización del árbol -->
      <div class="visualization-card">
        <div class="visualization-header">
          <h3>🌲 Visualización del Árbol</h3>
          <span class="tree-hint">{{ treeTypeHint }}</span>
        </div>

        <div class="tree-container" ref="treeContainer">
          <svg
            :viewBox="`0 0 ${svgWidth} ${svgHeight}`"
            class="tree-svg"
            v-if="root"
          >
            <g class="edges-group">
              <line
                v-for="edge in edges"
                :key="'edge-' + edge.id"
                :x1="edge.x1"
                :y1="edge.y1"
                :x2="edge.x2"
                :y2="edge.y2"
                class="tree-edge"
                stroke="#cbd5e1"
                stroke-width="2"
              />
            </g>

            <g class="nodes-group">
              <g v-for="node in nodePositions" :key="'node-' + node.id">
                <circle
                  :cx="node.x"
                  :cy="node.y"
                  :class="{
                    'node-highlighted': highlightedNode === node.id,
                    'node-root': node.id === rootId,
                  }"
                  r="28"
                  :fill="getNodeColor(node.id)"
                  stroke="#fff"
                  stroke-width="2"
                  @click="selectNode(node.id)"
                  @mouseenter="highlightNode(node.id)"
                  @mouseleave="clearHighlight"
                  style="cursor: pointer; transition: all 0.3s ease"
                />
                <text
                  :x="node.x"
                  :y="node.y"
                  class="node-label"
                  text-anchor="middle"
                  dominant-baseline="central"
                  fill="white"
                  font-size="14px"
                  font-weight="bold"
                  pointer-events="none"
                >
                  {{ node.value }}
                </text>
              </g>
            </g>
          </svg>
          <div v-else class="empty-tree">
            <span>🌳</span>
            <p>El árbol está vacío. Agrega valores para comenzar.</p>
          </div>
        </div>

        <div class="traversals-panel">
          <div
            class="traversal-card"
            :class="{ active: activeTraversal === 'preorder' }"
            @click="activeTraversal = 'preorder'"
          >
            <h4>Preorder</h4>
            <div class="traversal-values">
              {{ formatTraversal(preorderResult) }}
            </div>
          </div>
          <div
            class="traversal-card"
            :class="{ active: activeTraversal === 'inorder' }"
            @click="activeTraversal = 'inorder'"
          >
            <h4>Inorder</h4>
            <div class="traversal-values">
              {{ formatTraversal(inorderResult) }}
            </div>
          </div>
          <div
            class="traversal-card"
            :class="{ active: activeTraversal === 'postorder' }"
            @click="activeTraversal = 'postorder'"
          >
            <h4>Postorder</h4>
            <div class="traversal-values">
              {{ formatTraversal(postorderResult) }}
            </div>
          </div>
        </div>

        <div class="legend">
          <div class="legend-item">
            <div class="legend-color root-color"></div>
            <span>Raíz</span>
          </div>
          <div class="legend-item">
            <div class="legend-color node-color"></div>
            <span>Nodo normal</span>
          </div>
          <div class="legend-item">
            <div class="legend-color highlighted-color"></div>
            <span>Seleccionado</span>
          </div>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <div
        v-if="showHelpModal"
        class="modal-overlay"
        @click.self="showHelpModal = false"
      >
        <div class="help-modal">
          <div class="modal-header">
            <h2>📖 Guía del Árbol Binario</h2>
            <button class="close-modal" @click="showHelpModal = false">
              ✕
            </button>
          </div>
          <div class="modal-body">
            <div class="help-section">
              <h3>🎯 Modos de construcción:</h3>
              <ul>
                <li>
                  <strong>BST:</strong> Los números se organizan automáticamente
                  (menores a la izquierda, mayores a la derecha)
                </li>
                <li>
                  <strong>Completo:</strong> Los números se agregan llenando
                  niveles de izquierda a derecha
                </li>
                <li>
                  <strong>Simple:</strong> Los números se agregan como hijos
                  derechos (árbol degenerado)
                </li>
              </ul>

              <h3>📝 Modo Recorridos:</h3>
              <ul>
                <li>Ingrese 2 de los 3 recorridos separados por comas</li>
                <li>El sistema construirá el árbol automáticamente</li>
                <li>Ejemplo: "50,30,20,40,70,60,80"</li>
              </ul>

              <h3>💡 Tips:</h3>
              <ul>
                <li>Haz clic en cualquier nodo para resaltarlo</li>
                <li>Los recorridos se actualizan automáticamente</li>
                <li>Puedes exportar/importar árboles en formato JSON</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";

// Estado
const inputMode = ref("dynamic");
const treeType = ref("bst");
const newNodeValue = ref(null);
const nodeValuesList = ref([]);
const preorderInput = ref("");
const inorderInput = ref("");
const postorderInput = ref("");
const exportFileName = ref("arbol_binario");
const showHelpModal = ref(false);
const statusMessage = ref("");
const statusTone = ref("");
const highlightedNode = ref(null);
const activeTraversal = ref("preorder");

// Estructura del árbol
const root = ref(null);
const nodeCount = ref(0);
const treeHeight = ref(0);
const treeLevels = ref(0);
const rootId = ref(null);
const nodePositions = ref([]);
const edges = ref([]);
const preorderResult = ref([]);
const inorderResult = ref([]);
const postorderResult = ref([]);

// SVG
const svgWidth = 1000;
const svgHeight = 500;
const treeContainer = ref(null);

let nextNodeId = 0;

// Clase Nodo
class TreeNode {
  constructor(value, id) {
    this.value = value;
    this.left = null;
    this.right = null;
    this.id = id;
    this.x = 0;
    this.y = 0;
  }
}

// Funciones auxiliares
const getTreeTypeName = () => {
  const names = { bst: "BST", complete: "Completo", simple: "Simple" };
  return names[treeType.value];
};

const getBadgeClass = () => {
  const classes = {
    bst: "badge-bst",
    complete: "badge-complete",
    simple: "badge-simple",
  };
  return classes[treeType.value];
};

const treeTypeHint = computed(() => {
  const hints = {
    bst: "🌲 Árbol Binario de Búsqueda",
    complete: "🌳 Árbol Completo (niveles llenos de izquierda a derecha)",
    simple: "🌿 Árbol Simple (todos los nodos a la derecha)",
  };
  return hints[treeType.value] || hints.bst;
});

const getNodeColor = (nodeId) => {
  if (nodeId === rootId.value) return "#ef4444";
  return "#3b82f6";
};

// Insertar en BST
const insertBST = (node, value) => {
  if (!node) return new TreeNode(value, nextNodeId++);
  if (value < node.value) {
    node.left = insertBST(node.left, value);
  } else if (value > node.value) {
    node.right = insertBST(node.right, value);
  }
  return node;
};

// Insertar en árbol completo
const insertComplete = (rootNode, value) => {
  if (!rootNode) return new TreeNode(value, nextNodeId++);
  const queue = [rootNode];
  while (queue.length > 0) {
    const current = queue.shift();
    if (!current.left) {
      current.left = new TreeNode(value, nextNodeId++);
      return rootNode;
    } else if (!current.right) {
      current.right = new TreeNode(value, nextNodeId++);
      return rootNode;
    } else {
      queue.push(current.left);
      queue.push(current.right);
    }
  }
  return rootNode;
};

// Insertar en árbol simple
const insertSimple = (rootNode, value) => {
  if (!rootNode) return new TreeNode(value, nextNodeId++);
  let current = rootNode;
  while (current.right) {
    current = current.right;
  }
  current.right = new TreeNode(value, nextNodeId++);
  return rootNode;
};

// Agregar nodo
const addNode = () => {
  const value = newNodeValue.value;
  if (value === null || value === "" || isNaN(value)) {
    statusMessage.value = "Ingrese un número válido";
    statusTone.value = "error";
    setTimeout(() => (statusMessage.value = ""), 2000);
    return;
  }

  if (treeType.value === "bst") {
    root.value = insertBST(root.value, value);
  } else if (treeType.value === "complete") {
    root.value = insertComplete(root.value, value);
  } else {
    root.value = insertSimple(root.value, value);
  }

  nodeValuesList.value.push(value);
  updateTreeInfo();
  updateVisualization();

  newNodeValue.value = null;
  statusMessage.value = `✅ Nodo ${value} agregado`;
  statusTone.value = "success";
  setTimeout(() => (statusMessage.value = ""), 1500);
};

const removeNodeAtIndex = (index) => {
  nodeValuesList.value.splice(index, 1);
  rebuildTreeFromList();
};

const clearAllNodes = () => {
  root.value = null;
  nodeValuesList.value = [];
  nextNodeId = 0;
  updateTreeInfo();
  updateVisualization();
  statusMessage.value = "🗑️ Todos los nodos eliminados";
  statusTone.value = "neutral";
  setTimeout(() => (statusMessage.value = ""), 1500);
};

const rebuildTreeFromList = () => {
  root.value = null;
  nextNodeId = 0;
  for (const val of nodeValuesList.value) {
    if (treeType.value === "bst") {
      root.value = insertBST(root.value, val);
    } else if (treeType.value === "complete") {
      root.value = insertComplete(root.value, val);
    } else {
      root.value = insertSimple(root.value, val);
    }
  }
  updateTreeInfo();
  updateVisualization();
};

const generateRandomNode = () => {
  const randomValue = Math.floor(Math.random() * 90) + 10;
  newNodeValue.value = randomValue;
  addNode();
};

const generateBalancedSample = () => {
  const balancedValues = [50, 30, 70, 20, 40, 60, 80];
  root.value = null;
  nodeValuesList.value = [];
  nextNodeId = 0;
  for (const val of balancedValues) {
    if (treeType.value === "bst") {
      root.value = insertBST(root.value, val);
    } else if (treeType.value === "complete") {
      root.value = insertComplete(root.value, val);
    } else {
      root.value = insertSimple(root.value, val);
    }
    nodeValuesList.value.push(val);
  }
  updateTreeInfo();
  updateVisualization();
  statusMessage.value = "⚖️ Árbol balanceado generado";
  statusTone.value = "success";
  setTimeout(() => (statusMessage.value = ""), 2000);
};

// Construir desde recorridos
const parseInput = (input) => {
  if (!input.trim()) return [];
  return input
    .split(",")
    .map((s) => parseInt(s.trim()))
    .filter((n) => !isNaN(n));
};

const buildFromPreIn = (preorder, inorder) => {
  if (preorder.length === 0 || inorder.length === 0) return null;
  if (preorder.length !== inorder.length) return null;

  const rootValue = preorder[0];
  const rootIndex = inorder.indexOf(rootValue);
  if (rootIndex === -1) return null;

  const leftInorder = inorder.slice(0, rootIndex);
  const rightInorder = inorder.slice(rootIndex + 1);
  const leftPreorder = preorder.slice(1, 1 + leftInorder.length);
  const rightPreorder = preorder.slice(1 + leftInorder.length);

  const node = new TreeNode(rootValue, nextNodeId++);
  node.left = buildFromPreIn(leftPreorder, leftInorder);
  node.right = buildFromPreIn(rightPreorder, rightInorder);

  return node;
};

const buildFromInPost = (inorder, postorder) => {
  if (inorder.length === 0 || postorder.length === 0) return null;
  if (inorder.length !== postorder.length) return null;

  const rootValue = postorder[postorder.length - 1];
  const rootIndex = inorder.indexOf(rootValue);
  if (rootIndex === -1) return null;

  const leftInorder = inorder.slice(0, rootIndex);
  const rightInorder = inorder.slice(rootIndex + 1);
  const leftPostorder = postorder.slice(0, leftInorder.length);
  const rightPostorder = postorder.slice(leftInorder.length, -1);

  const node = new TreeNode(rootValue, nextNodeId++);
  node.left = buildFromInPost(leftInorder, leftPostorder);
  node.right = buildFromInPost(rightInorder, rightPostorder);

  return node;
};

const buildFromSequences = () => {
  const preorder = parseInput(preorderInput.value);
  const inorder = parseInput(inorderInput.value);
  const postorder = parseInput(postorderInput.value);

  let tree = null;
  let message = "";

  if (
    preorder.length > 0 &&
    inorder.length > 0 &&
    preorder.length === inorder.length
  ) {
    nextNodeId = 0;
    tree = buildFromPreIn(preorder, inorder);
    if (tree) {
      message = "✅ Árbol construido desde Preorder + Inorder";
      nodeValuesList.value = inorder;
    }
  } else if (
    inorder.length > 0 &&
    postorder.length > 0 &&
    inorder.length === postorder.length
  ) {
    nextNodeId = 0;
    tree = buildFromInPost(inorder, postorder);
    if (tree) {
      message = "✅ Árbol construido desde Inorder + Postorder";
      nodeValuesList.value = inorder;
    }
  }

  if (tree) {
    root.value = tree;
    updateTreeInfo();
    updateVisualization();
    statusMessage.value = message;
    statusTone.value = "success";
  } else {
    statusMessage.value =
      "❌ No se pudo construir el árbol. Verifica los recorridos.";
    statusTone.value = "error";
  }

  setTimeout(() => (statusMessage.value = ""), 3000);
};

const clearSequences = () => {
  preorderInput.value = "";
  inorderInput.value = "";
  postorderInput.value = "";
};

// Recorridos
const getPreorder = (node, result = []) => {
  if (!node) return result;
  result.push(node.value);
  getPreorder(node.left, result);
  getPreorder(node.right, result);
  return result;
};

const getInorder = (node, result = []) => {
  if (!node) return result;
  getInorder(node.left, result);
  result.push(node.value);
  getInorder(node.right, result);
  return result;
};

const getPostorder = (node, result = []) => {
  if (!node) return result;
  getPostorder(node.left, result);
  getPostorder(node.right, result);
  result.push(node.value);
  return result;
};

// Estadísticas
const getHeight = (node) => {
  if (!node) return 0;
  return 1 + Math.max(getHeight(node.left), getHeight(node.right));
};

const countNodes = (node) => {
  if (!node) return 0;
  return 1 + countNodes(node.left) + countNodes(node.right);
};

const updateTreeInfo = () => {
  nodeCount.value = countNodes(root.value);
  treeHeight.value = getHeight(root.value);
  treeLevels.value = Math.max(1, Math.ceil(Math.log2(nodeCount.value + 1)));
  rootId.value = root.value?.id || null;

  preorderResult.value = getPreorder(root.value);
  inorderResult.value = getInorder(root.value);
  postorderResult.value = getPostorder(root.value);
};

// Posicionamiento
const calculatePositions = (node, level = 0, offset = 0, positions = []) => {
  if (!node) return;

  const levelWidth = Math.pow(2, level);
  const x = (offset + 0.5) * (svgWidth / levelWidth);
  const y = 60 + level * 70;

  node.x = x;
  node.y = y;
  positions.push({ id: node.id, value: node.value, x, y, level });

  calculatePositions(node.left, level + 1, offset * 2, positions);
  calculatePositions(node.right, level + 1, offset * 2 + 1, positions);

  return positions;
};

const calculateEdges = (node, edgesList = []) => {
  if (!node) return edgesList;

  if (node.left) {
    edgesList.push({
      id: `${node.id}-${node.left.id}`,
      x1: node.x,
      y1: node.y + 20,
      x2: node.left.x,
      y2: node.left.y - 20,
    });
    calculateEdges(node.left, edgesList);
  }

  if (node.right) {
    edgesList.push({
      id: `${node.id}-${node.right.id}`,
      x1: node.x,
      y1: node.y + 20,
      x2: node.right.x,
      y2: node.right.y - 20,
    });
    calculateEdges(node.right, edgesList);
  }

  return edgesList;
};

const updateVisualization = () => {
  if (!root.value) {
    nodePositions.value = [];
    edges.value = [];
    return;
  }

  nodePositions.value = calculatePositions(root.value, 0, 0, []);
  edges.value = calculateEdges(root.value, []);
};

// Exportar/Importar
const exportData = () => {
  if (nodeValuesList.value.length === 0) {
    statusMessage.value = "No hay datos para exportar";
    statusTone.value = "error";
    setTimeout(() => (statusMessage.value = ""), 2000);
    return;
  }

  const data = {
    treeType: treeType.value,
    values: nodeValuesList.value,
    traversals: {
      preorder: preorderResult.value,
      inorder: inorderResult.value,
      postorder: postorderResult.value,
    },
    exportDate: new Date().toISOString(),
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${exportFileName.value || "arbol"}.json`;
  link.click();
  URL.revokeObjectURL(url);
  statusMessage.value = `📁 Árbol exportado como ${exportFileName.value}.json`;
  statusTone.value = "success";
  setTimeout(() => (statusMessage.value = ""), 2000);
};

const importData = (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      if (data.values && Array.isArray(data.values)) {
        treeType.value = data.treeType || "bst";
        nodeValuesList.value = data.values;
        rebuildTreeFromList();
        statusMessage.value = "✅ Árbol importado exitosamente";
        statusTone.value = "success";
      } else {
        throw new Error("Formato inválido");
      }
    } catch (error) {
      statusMessage.value = "❌ Error al importar archivo";
      statusTone.value = "error";
    }
    setTimeout(() => (statusMessage.value = ""), 2000);
  };
  reader.readAsText(file);
  event.target.value = "";
};

const resetTree = () => {
  root.value = null;
  nodeValuesList.value = [];
  nextNodeId = 0;
  nodePositions.value = [];
  edges.value = [];
  nodeCount.value = 0;
  treeHeight.value = 0;
  treeLevels.value = 0;
  preorderResult.value = [];
  inorderResult.value = [];
  postorderResult.value = [];
  preorderInput.value = "";
  inorderInput.value = "";
  postorderInput.value = "";
  newNodeValue.value = null;
  statusMessage.value = "🔄 Árbol reiniciado";
  statusTone.value = "neutral";
  setTimeout(() => (statusMessage.value = ""), 2000);
};

// Interacciones
const selectNode = (id) => {
  highlightedNode.value = id;
  setTimeout(() => {
    if (highlightedNode.value === id) highlightedNode.value = null;
  }, 1500);
};

const highlightNode = (id) => {
  highlightedNode.value = id;
};

const clearHighlight = () => {
  setTimeout(() => {
    if (highlightedNode.value !== null) highlightedNode.value = null;
  }, 100);
};

const formatTraversal = (arr) => {
  if (!arr || arr.length === 0) return "Vacío";
  return arr.join(" → ");
};

// Inicializar
onMounted(() => {
  generateBalancedSample();
});

// Watcher
watch(treeType, () => {
  if (nodeValuesList.value.length > 0) {
    rebuildTreeFromList();
  }
});
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.tree-page {
  min-height: 100vh;
  padding: 32px;
  background: linear-gradient(135deg, #1a1a2e 0%, #56a6cb 100%);
  position: relative;
}

.hero-section {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 32px;
  padding: 32px 48px;
  margin-bottom: 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 24px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.hero-content {
  flex: 1;
}

.hero-content h1 {
  font-size: 2rem;
  margin: 0 0 8px 0;
  background: linear-gradient(135deg, #11998e, #38ef7d);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-content p {
  color: #666;
  margin: 0;
}

.algorithm-badge {
  padding: 12px 24px;
  border-radius: 16px;
  font-weight: bold;
  font-size: 1rem;
  color: white;
}

.badge-bst {
  background: linear-gradient(135deg, #11998e, #38ef7d);
}

.badge-complete {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
}

.badge-simple {
  background: linear-gradient(135deg, #8b5cf6, #6d28d9);
}

.main-layout {
  display: grid;
  grid-template-columns: 380px 1fr;
  gap: 24px;
}

.config-card {
  background: white;
  border-radius: 24px;
  padding: 24px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  height: fit-content;
  position: sticky;
  top: 24px;
}

.config-header h3 {
  margin: 0 0 24px 0;
  font-size: 1.2rem;
  color: #333;
  padding-bottom: 16px;
  border-bottom: 2px solid #f0f0f0;
}

.config-group {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.mode-selector {
  display: flex;
  gap: 12px;
}

.mode-btn {
  flex: 1;
  padding: 10px;
  border: 2px solid #e0e0e0;
  background: white;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
}

.mode-btn.active {
  border-color: #11998e;
  background: #11998e;
  color: white;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-group label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #333;
}

.number-input-group {
  display: flex;
  gap: 8px;
}

.number-input {
  flex: 1;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 10px;
  font-size: 1rem;
  text-align: center;
}

.number-input:focus {
  outline: none;
  border-color: #11998e;
}

.sequence-input {
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 10px;
  font-size: 0.9rem;
  font-family: monospace;
}

.sequence-input:focus {
  outline: none;
  border-color: #11998e;
}

.tree-type-buttons {
  display: flex;
  gap: 8px;
}

.type-btn {
  flex: 1;
  padding: 8px;
  border: 2px solid #e0e0e0;
  background: white;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: 600;
}

.type-btn.active {
  border-color: #11998e;
  background: #11998e;
  color: white;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.btn-add,
.btn-construct,
.btn-random,
.btn-balanced,
.btn-clear {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.btn-add,
.btn-construct {
  background: linear-gradient(135deg, #11998e, #38ef7d);
  color: white;
}

.btn-random,
.btn-balanced {
  background: #f8f9fa;
  border: 1px solid #ddd;
  color: #333;
}

.btn-clear {
  background: #ef4444;
  color: white;
}

.btn-add:hover,
.btn-construct:hover,
.btn-random:hover,
.btn-balanced:hover,
.btn-clear:hover {
  transform: translateY(-2px);
}

.values-list {
  margin-top: 12px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 10px;
}

.values-list label {
  font-size: 0.8rem;
  color: #666;
  margin-bottom: 8px;
  display: block;
}

.values-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  max-height: 150px;
  overflow-y: auto;
}

.value-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px 4px 12px;
  background: linear-gradient(135deg, #11998e, #38ef7d);
  color: white;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
}

.remove-badge {
  background: rgba(255, 255, 255, 0.3);
  border: none;
  color: white;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.remove-badge:hover {
  background: rgba(255, 255, 255, 0.5);
}

.import-export-section {
  border-top: 1px solid #e0e0e0;
  padding-top: 16px;
  margin-top: 8px;
}

.file-name-input {
  margin-bottom: 12px;
}

.file-name-field {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 10px;
  font-size: 0.85rem;
}

.file-name-field:focus {
  outline: none;
  border-color: #11998e;
}

.import-export-buttons {
  display: flex;
  gap: 12px;
}

.btn-export,
.btn-import {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  text-align: center;
}

.btn-export {
  background: linear-gradient(135deg, #11998e, #38ef7d);
  color: white;
}

.btn-import {
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  color: white;
  display: inline-block;
}

.btn-export:hover,
.btn-import:hover {
  transform: translateY(-2px);
}

.btn-reset,
.btn-help {
  width: 100%;
  padding: 12px;
  background: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 14px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.btn-reset {
  color: #666;
}

.btn-help {
  color: #11998e;
  margin-top: 8px;
}

.btn-help:hover,
.btn-reset:hover {
  background: #e0e0e0;
  transform: translateY(-2px);
}

.stats-display {
  display: flex;
  gap: 12px;
  padding: 12px;
  background: linear-gradient(135deg, #f5f7fa, #c3cfe2);
  border-radius: 12px;
  margin-top: 16px;
}

.stat-item {
  flex: 1;
  text-align: center;
}

.stat-label {
  display: block;
  font-size: 0.7rem;
  color: #666;
  margin-bottom: 4px;
}

.stat-value {
  display: block;
  font-size: 1.2rem;
  font-weight: bold;
  color: #11998e;
}

.status-message {
  margin-top: 16px;
  padding: 12px;
  border-radius: 12px;
  text-align: center;
  font-size: 0.85rem;
  animation: slideIn 0.3s ease;
}

.status-message.success {
  background: #d4edda;
  color: #155724;
}

.status-message.error {
  background: #f8d7da;
  color: #721c24;
}

.status-message.neutral {
  background: #e7f3ff;
  color: #004085;
}

.visualization-card {
  background: white;
  border-radius: 24px;
  padding: 24px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.visualization-header {
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.visualization-header h3 {
  margin: 0;
  color: #333;
}

.tree-hint {
  font-size: 0.8rem;
  color: #11998e;
  font-weight: 500;
}

.tree-container {
  background: #f8f9fa;
  border-radius: 16px;
  padding: 20px;
  min-height: 500px;
  overflow: auto;
  display: flex;
  justify-content: center;
  align-items: center;
}

.tree-svg {
  width: 100%;
  height: auto;
  background: #f8f9fa;
}

.empty-tree {
  text-align: center;
  padding: 80px 20px;
}

.empty-tree span {
  font-size: 4rem;
  display: block;
  margin-bottom: 16px;
}

.empty-tree p {
  color: #999;
  font-size: 0.9rem;
}

.nodes-group circle {
  transition: all 0.3s ease;
  cursor: pointer;
}

.nodes-group circle:hover {
  transform: scale(1.1);
  filter: brightness(1.1);
}

.node-highlighted {
  fill: #f59e0b !important;
  stroke: #fff;
  stroke-width: 3;
  filter: drop-shadow(0 0 8px rgba(245, 158, 11, 0.5));
}

.node-root {
  fill: #ef4444 !important;
}

.traversals-panel {
  display: flex;
  gap: 16px;
  margin: 20px 0;
}

.traversal-card {
  flex: 1;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
  text-align: center;
  border: 2px solid transparent;
}

.traversal-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.traversal-card.active {
  background: linear-gradient(135deg, #11998e, #38ef7d);
  color: white;
  border-color: #11998e;
}

.traversal-card h4 {
  margin: 0 0 8px 0;
  font-size: 0.9rem;
}

.traversal-values {
  font-size: 0.75rem;
  font-family: monospace;
  word-break: break-word;
}

.legend {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-top: 16px;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.8rem;
  color: #666;
}

.legend-color {
  width: 20px;
  height: 20px;
  border-radius: 50%;
}

.root-color {
  background: #ef4444;
}

.node-color {
  background: #3b82f6;
}

.highlighted-color {
  background: #f59e0b;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

.help-modal {
  background: white;
  border-radius: 32px;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow: auto;
  animation: slideUp 0.3s ease;
}

.modal-header {
  padding: 20px 24px;
  background: linear-gradient(135deg, #11998e, #38ef7d);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 32px 32px 0 0;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.3rem;
}

.close-modal {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  font-size: 1.5rem;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-modal:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: rotate(90deg);
}

.modal-body {
  padding: 24px;
}

.help-section {
  margin-bottom: 24px;
}

.help-section h3 {
  color: #11998e;
  font-size: 1rem;
  margin: 0 0 12px 0;
}

.help-section ul {
  margin: 0;
  padding-left: 20px;
}

.help-section li {
  margin: 8px 0;
  color: #555;
  line-height: 1.5;
}

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
    transform: translateY(50px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 1024px) {
  .main-layout {
    grid-template-columns: 1fr;
  }
  .config-card {
    position: static;
  }
  .hero-section {
    flex-direction: column;
    text-align: center;
  }
}

@media (max-width: 768px) {
  .tree-page {
    padding: 16px;
  }
  .hero-section {
    padding: 24px;
  }
  .hero-content h1 {
    font-size: 1.5rem;
  }
  .traversals-panel {
    flex-direction: column;
  }
  .mode-selector,
  .tree-type-buttons,
  .action-buttons,
  .import-export-buttons {
    flex-direction: column;
  }
  .tree-container {
    min-height: 400px;
  }
  .node-label {
    font-size: 10px;
  }
  .nodes-group circle {
    r: 20;
  }
}
</style>
