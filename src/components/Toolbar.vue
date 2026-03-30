<template>
  <div class="toolbar-static">
    <div class="toolbar-section">
      <h3>Herramientas</h3>

      <div class="mode-buttons">
        <button
          v-for="tool in tools"
          :key="tool.mode"
          @click="setMode(tool.mode)"
          :class="{ active: currentMode === tool.mode }"
          class="mode-btn"
        >
          <span class="mode-icon">{{ tool.icon }}</span>
          <div class="mode-info">
            <span class="mode-name">{{ tool.name }}</span>
            <span class="mode-shortcut">{{ tool.shortcut }}</span>
          </div>
        </button>
      </div>

      <button @click="clearGraph" class="quick-clear-btn">
        Limpiar grafo
      </button>
    </div>

    <div v-if="showFiles" class="toolbar-section">
      <h3>Archivos</h3>
      <div class="action-buttons">
        <button @click="exportGraph" class="action-btn export-btn">
          Exportar
        </button>
        <input
          type="file"
          id="import-file"
          accept=".json"
          style="display: none"
          @change="importGraph"
        />
        <label for="import-file" class="action-btn import-btn">
          Importar
        </label>
        <button @click="generateRandomGraph" class="action-btn random-btn">
          Aleatorio
        </button>
        <button @click="clearGraph" class="action-btn clear-btn">
          Limpiar
        </button>
      </div>
    </div>

    <div v-if="showVisualization" class="toolbar-section">
      <h3>Visualizacion</h3>
      <button @click="toggleMatrixPanel" class="matrix-btn">
        {{ showMatrixPanel ? "Ocultar Matriz" : "Mostrar Matriz" }}
      </button>
    </div>

    <div v-if="currentMode === 'edge' && edgeStep" class="status-bar">
      <span class="status-icon">🔗</span>
      <span class="status-text">{{ edgeStep }}</span>
    </div>

    <div class="toolbar-footer">
      <small>Tips:</small>
      <small>V: Mover | N: Nodo | E: Arista | D: Borrar</small>
      <small>Doble click para editar</small>
    </div>
  </div>
</template>

<script setup>
import { useGraph } from "../composables/useGraph";

defineProps({
  showFiles: {
    type: Boolean,
    default: true,
  },
  showVisualization: {
    type: Boolean,
    default: true,
  },
});

const {
  setMode,
  currentMode,
  clearGraph,
  edgeStep,
  exportGraph,
  importGraph,
  nodes,
  edges,
  showMatrixPanel,
  toggleMatrixPanel,
} = useGraph();

const tools = [
  { mode: "move", name: "Mover", icon: "🖐️", shortcut: "V" },
  { mode: "node", name: "Nodo", icon: "🔵", shortcut: "N" },
  { mode: "edge", name: "Arista", icon: "🔗", shortcut: "E" },
  { mode: "delete", name: "Borrar", icon: "🧽", shortcut: "D" },
];

const generateRandomGraph = () => {
  const nodeCount = Math.floor(Math.random() * 8) + 4;

  nodes.clear();
  edges.clear();

  for (let i = 1; i <= nodeCount; i++) {
    const angle = (i / nodeCount) * Math.PI * 2;
    const radius = 200;
    const x = 400 + radius * Math.cos(angle);
    const y = 250 + radius * Math.sin(angle);

    nodes.add({
      id: i,
      label: String.fromCharCode(64 + i),
      x,
      y,
    });
  }

  for (let i = 1; i <= nodeCount; i++) {
    for (let j = 1; j <= nodeCount; j++) {
      if (i !== j && Math.random() < 0.25) {
        const weight = Math.floor(Math.random() * 9) + 1;
        edges.add({
          from: i,
          to: j,
          label: String(weight),
          arrows: "to",
        });
      }
    }
  }
};
</script>

<style scoped>
.toolbar-static {
  width: 260px;
  background: #ffffff;
  border-right: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  padding: 20px 16px;
  gap: 24px;
  flex-shrink: 0;
}

.toolbar-section {
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 20px;
}

.toolbar-section:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.toolbar-section h3 {
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #64748b;
  margin: 0 0 12px 0;
}

.mode-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.mode-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
  text-align: left;
}

.mode-btn:hover {
  background: #e2e8f0;
  transform: translateX(2px);
}

.mode-btn.active {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  border-color: #2563eb;
  color: white;
}

.mode-icon {
  font-size: 1.2rem;
}

.mode-info {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.mode-name {
  font-size: 0.85rem;
  font-weight: 500;
}

.mode-shortcut {
  font-size: 0.7rem;
  font-family: monospace;
  background: rgba(0, 0, 0, 0.05);
  padding: 2px 6px;
  border-radius: 4px;
}

.active .mode-shortcut {
  background: rgba(255, 255, 255, 0.2);
}

.quick-clear-btn {
  width: 100%;
  padding: 9px 12px;
  border: 1px solid #fecaca;
  border-radius: 10px;
  background: #fef2f2;
  color: #b91c1c;
  font-size: 0.84rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.quick-clear-btn:hover {
  background: #fee2e2;
  transform: translateY(-1px);
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.action-btn {
  padding: 8px 12px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.85rem;
  text-align: center;
  transition: all 0.2s;
  font-weight: 500;
}

.export-btn {
  background: #10b981;
  color: white;
}

.import-btn {
  background: #f59e0b;
  color: white;
  display: inline-block;
  text-align: center;
  cursor: pointer;
}

.random-btn {
  background: #8b5cf6;
  color: white;
}

.clear-btn {
  background: #ef4444;
  color: white;
}

.action-btn:hover {
  transform: translateY(-1px);
  filter: brightness(1.05);
}

.matrix-btn {
  width: 100%;
  padding: 8px 12px;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s;
}

.matrix-btn:hover {
  background: #e2e8f0;
}

.status-bar {
  background: #fef3c7;
  border-radius: 8px;
  padding: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.8rem;
  border-left: 3px solid #f59e0b;
}

.status-icon {
  font-size: 1rem;
}

.status-text {
  font-weight: 500;
  color: #92400e;
}

.toolbar-footer {
  margin-top: auto;
  padding-top: 16px;
  border-top: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.toolbar-footer small {
  font-size: 0.7rem;
  color: #94a3b8;
}

.toolbar-static::-webkit-scrollbar {
  width: 4px;
}

.toolbar-static::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.toolbar-static::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

@media (max-width: 768px) {
  .toolbar-static {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid #e2e8f0;
    max-height: 300px;
  }

  .mode-buttons {
    flex-direction: row;
    flex-wrap: wrap;
  }

  .mode-btn {
    flex: 1;
    min-width: 100px;
  }

  .action-buttons {
    flex-direction: row;
    flex-wrap: wrap;
  }

  .action-btn {
    flex: 1;
  }
}
</style>
