<template>
  <div class="editor-view">
    <div class="tab-bar">
      <button
        @click="activeTab = 'editor'"
        :class="{ active: activeTab === 'editor' }"
        class="tab-btn"
      >
        <span class="tab-icon">✏️</span>
        <span>Editor de Grafos</span>
      </button>

      <button
        @click="activeTab = 'johnson'"
        :class="{ active: activeTab === 'johnson' }"
        class="tab-btn"
      >
        <span class="tab-icon">📊</span>
        <span>Algoritmo de Johnson</span>
      </button>

      <button
        @click="activeTab = 'asignacion'"
        :class="{ active: activeTab === 'asignacion' }"
        class="tab-btn"
      >
        <span class="tab-icon">🎯</span>
        <span>Algoritmo de Asignación</span>
      </button>

      <button
        @click="activeTab = 'northwest'"
        :class="{ active: activeTab === 'northwest' }"
        class="tab-btn"
      >
        <span class="tab-icon">NW</span>
        <span>Esquina Noroeste</span>
      </button>
    </div>

    <div v-if="activeTab === 'editor'" class="editor-layout">
      <Toolbar />
      <div class="canvas-area">
        <GraphCanvas />
      </div>
    </div>

    <div v-else-if="activeTab === 'johnson'" class="johnson-layout">
      <JohnsonGraph />
    </div>

    <div v-else-if="activeTab === 'asignacion'" class="asignacion-layout">
      <AsignacionView />
    </div>

    <div v-else-if="activeTab === 'northwest'" class="northwest-layout">
      <NorthwestView />
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import Toolbar from "../components/Toolbar.vue";
import GraphCanvas from "../components/GraphCanvas.vue";
import JohnsonGraph from "../components/JohnsonGraph.vue";
import AsignacionView from "./AsignacionView.vue";
import NorthwestView from "./NorthwestView.vue";

const activeTab = ref("editor");
</script>

<style scoped>
.editor-view {
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background: #f8fafc;
  display: flex;
  flex-direction: column;
}

.tab-bar {
  display: flex;
  background: #1e293b;
  gap: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
  overflow-x: auto;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 28px;
  border: none;
  background: transparent;
  color: #94a3b8;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 500;
  transition: all 0.3s ease;
  border-bottom: 3px solid transparent;
  white-space: nowrap;
}

.tab-btn:hover {
  color: #f1f5f9;
  background: rgba(255, 255, 255, 0.05);
}

.tab-btn.active {
  color: #3b82f6;
  background: #0f172a;
  border-bottom-color: #3b82f6;
}

.tab-icon {
  font-size: 1.1rem;
}

/* Layout del editor - DOS COLUMNAS FIJAS */
.editor-layout {
  display: flex;
  flex: 1;
  overflow: hidden;
  background: #ffffff;
}

.canvas-area {
  flex: 1;
  overflow: hidden;
  position: relative;
}

/* Layout de Johnson */
.johnson-layout {
  flex: 1;
  overflow: auto;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* Layout de Asignación */
.asignacion-layout {
  flex: 1;
  overflow: auto;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.northwest-layout {
  flex: 1;
  overflow: auto;
  background: linear-gradient(135deg, #0f766e 0%, #164e63 100%);
}

@media (max-width: 768px) {
  .tab-btn {
    padding: 10px 16px;
    font-size: 0.85rem;
  }
  
  .tab-icon {
    font-size: 0.9rem;
  }
  
  .editor-layout {
    flex-direction: column;
  }
}
</style>
