<template>
  <div class="editor-layout">
    <Toolbar />
    <div class="main-area">
      <GraphCanvas />
    </div>
  </div>
</template>

<script setup>
import Toolbar from "../components/Toolbar.vue";
import GraphCanvas from "../components/GraphCanvas.vue";
</script>

<style>
.editor-layout {
  display: flex;
  flex-direction: column;
  height: 100vh; /* Altura total de la ventana */
  overflow: hidden;
}

.main-area {
  flex-grow: 1; /* Ocupa el espacio restante bajo la barra */
  position: relative;
  overflow: hidden;
}
</style>
