<template>
  <div class="toolbar">
    <div class="group">
      <button
        @click="setMode('move')"
        :class="{ active: currentMode === 'move' }"
        title="Mover nodos"
      >
        🖐 Mover y Editar
      </button>
      <button
        @click="setMode('node')"
        :class="{ active: currentMode === 'node' }"
        title="Clic en espacio vacío para crear"
      >
        🔵 Nodo
      </button>
      <button
        @click="setMode('edge')"
        :class="{ active: currentMode === 'edge' }"
        title="Clic origen -> Clic destino"
      >
        🔗 Arista
      </button>

      <button
        @click="setMode('delete')"
        :class="{ active: currentMode === 'delete' }"
        title="Clic en nodo/arista para borrar"
        class="borrador"
      >
        🧽 Borrador
      </button>
    </div>

    <div class="separator"></div>

    <div class="options">
      <label class="checkbox-label">
        <input type="checkbox" :checked="isDirected" @change="toggleDirected" />
        <span>Dirigido (Flechas)</span>
      </label>
    </div>

    <span class="status" v-if="currentMode === 'edge'">
      👉 {{ edgeStep }}
    </span>

    <div class="group right-actions">
      <button
        @click="toggleMatrixPanel"
        :class="{ 'matriz-active': showMatrixPanel }"
        class="btn-matriz"
      >
        🧮 Matriz
      </button>

      <button @click="exportGraph" class="btn-exportar">💾 Exportar</button>

      <input
        type="file"
        id="import-file"
        accept=".json"
        style="display: none"
        @change="importGraph"
      />
      <label for="import-file" class="btn-importar base-btn">
        📂 Importar
      </label>

      <div class="separator hide-mobile"></div>

      <button @click="clearGraph" class="danger">🗑 Borrar Todo</button>
    </div>
  </div>
</template>

<script setup>
import { useGraph } from "../composables/useGraph";

const {
  setMode,
  currentMode,
  clearGraph,
  isDirected,
  toggleDirected,
  edgeStep,
  toggleMatrixPanel,
  showMatrixPanel,
  exportGraph,
  importGraph,
} = useGraph();
</script>

<style scoped>
/* --- ESTILOS ORIGINALES (ESCRITORIO) --- */
.toolbar {
  padding: 10px 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.group {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
  align-items: center;
}

/* El grupo derecho empuja todo hacia la derecha */
.right-actions {
  margin-left: auto;
}

/* Todos los botones comparten esta base */
button,
.base-btn {
  padding: 8px 16px;
  border: 1px solid #ced4da;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
  display: inline-block;
  font-size: 0.9rem;
  font-family: inherit;
  color: #212529;
}

button:hover,
.base-btn:hover {
  background: #e9ecef;
}

button.active {
  background: #0d6efd;
  color: white;
  border-color: #0d6efd;
}

.borrador {
  color: #dc3545;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
}

.status {
  font-weight: bold;
  color: #d63384;
}

/* --- COLORES PERSONALIZADOS PARA NUEVOS BOTONES --- */
.btn-matriz {
  border-color: #10b981;
  color: #10b981;
}
.btn-matriz.matriz-active,
.btn-matriz:hover {
  background: #10b981;
  color: white;
}

.btn-exportar {
  border-color: #3b82f6;
  color: #3b82f6;
}
.btn-exportar:hover {
  background: #3b82f6;
  color: white;
}

.btn-importar {
  border-color: #f59e0b;
  color: #f59e0b;
}
.btn-importar:hover {
  background: #f59e0b;
  color: white;
}

.danger {
  background: #dc3545;
  color: white;
  border: none;
}
.danger:hover {
  background: #bb2d3b;
}

.separator {
  width: 1px;
  height: 25px;
  background: #ccc;
}

/* --- ESTILOS PARA CELULARES --- */
@media (max-width: 768px) {
  .toolbar {
    justify-content: center;
    padding: 10px;
    gap: 10px;
  }

  .group {
    justify-content: center;
    width: 100%;
  }

  .right-actions {
    margin-left: 0; /* Quitamos el empuje a la derecha en móviles */
  }

  .separator {
    display: none;
  }
  .hide-mobile {
    display: none;
  }

  .danger,
  .base-btn,
  button {
    flex-grow: 1; /* Los botones se estiran para ser más fáciles de tocar */
    text-align: center;
  }

  .options {
    width: 100%;
    display: flex;
    justify-content: center;
  }

  .status {
    width: 100%;
    text-align: center;
    margin-top: -5px;
  }
}
</style>
