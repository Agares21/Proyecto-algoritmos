<template>
  <div class="editor-view">
    <div class="tab-bar">
      <button
        @click="activeTab = 'dijkstra'"
        :class="{ active: activeTab === 'dijkstra' }"
        class="tab-btn"
      >
        <span class="tab-icon">🛣️</span>
        <span>Dijkstra</span>
      </button>

      <button
        @click="activeTab = 'kruskal'"
        :class="{ active: activeTab === 'kruskal' }"
        class="tab-btn"
      >
        <span class="tab-icon">🌳</span>
        <span>Kruskal</span>
      </button>
    </div>

    <div v-if="activeTab === 'dijkstra'" class="dijkstra-layout">
      <DijkstraView />
    </div>

    <div v-else-if="activeTab === 'kruskal'" class="kruskal-layout">
      <KruskalView />
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import DijkstraView from "./DijkstraView.vue";
import KruskalView from "./KruskalView.vue";

const activeTab = ref("dijkstra");
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

.dijkstra-layout {
  flex: 1;
  overflow: auto;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.kruskal-layout {
  flex: 1;
  overflow: auto;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

@media (max-width: 768px) {
  .tab-btn {
    padding: 10px 16px;
    font-size: 0.85rem;
  }

  .tab-icon {
    font-size: 0.9rem;
  }

  .dijkstra-layout,
  .kruskal-layout {
    min-height: 100vh;
  }
}
</style>