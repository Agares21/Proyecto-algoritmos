<template>
  <div class="toolbar">
    <div class="group">
      <button
        @click="setMode('move')"
        :class="{ active: currentMode === 'move' }"
        title="Mover nodos"
      >
        🖐 Mover
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
        style="color: #dc3545"
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

    <div class="separator"></div>

    <span class="status" v-if="currentMode === 'edge'">
      👉 {{ edgeStep }}
    </span>

    <button @click="clearGraph" class="danger">🗑 Borrar Todo</button>
  </div>

  <button
    @click="toggleMatrixPanel"
    :class="{ active: showMatrixPanel }"
    style="
      background: #10b981;
      color: white;
      border-color: #10b981;
      margin-left: 10px;
    "
  >
    🧮 Matriz
  </button>
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
} = useGraph();
</script>
<style scoped>
/* --- ESTILOS ORIGINALES (ESCRITORIO) --- */
.toolbar {
  padding: 10px 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
  display: flex;
  flex-wrap: wrap; /* ¡Magia 1! Permite que los elementos bajen de línea */
  gap: 15px;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.group {
  display: flex;
  gap: 5px;
  flex-wrap: wrap; /* Permite que los botones del grupo también salten si es muy angosto */
}

button {
  padding: 8px 16px;
  border: 1px solid #ced4da;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
}

button:hover {
  background: #e9ecef;
}

button.active {
  background: #0d6efd;
  color: white;
  border-color: #0d6efd;
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

.danger {
  margin-left: auto;
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
    justify-content: center; /* Centramos todo */
    padding: 10px;
    gap: 10px;
  }

  .group {
    justify-content: center;
    width: 100%; /* Forzamos a que el grupo de botones tome todo el ancho */
  }

  .separator {
    display: none; /* Ocultamos las rayitas grises en celular porque se ven mal al bajar de línea */
  }

  .danger {
    margin-left: 0; /* Quitamos el margen automático */
    width: 100%; /* Hacemos el botón de borrar de todo el ancho (más fácil de tocar) */
    padding: 12px; /* Un poco más alto para los dedos */
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
