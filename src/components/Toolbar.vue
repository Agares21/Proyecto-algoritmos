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
        title="Clic en espacio vacio para crear"
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
      {{ edgeStep }}
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

      <button @click="openHelp" class="btn-help">❓ Help</button>

      <button @click="clearGraph" class="danger">🗑 Borrar Todo</button>
    </div>

    <div v-if="showHelpModal" class="help-overlay" @click.self="closeHelp">
      <div class="help-modal" role="dialog" aria-modal="true" aria-label="Ayuda de grafo">
        <div class="help-header">
          <h3>Guia rapida de la ventana de grafos</h3>
          <div class="help-actions">
            <button class="btn-pdf" @click="downloadHelpPdf">📄 Descargar PDF</button>
            <button class="help-close" @click="closeHelp" aria-label="Cerrar ayuda">X</button>
          </div>
        </div>

        <div class="help-content">
          <p><strong>1. Herramientas principales</strong></p>
          <p>
            Mover y Editar: selecciona nodos/aristas y haz doble clic para editar
            nombre o peso.
          </p>
          <p>Nodo: clic en espacio vacio para crear un nuevo nodo.</p>
          <p>
            Arista: selecciona nodo origen y luego destino para conectarlos con un
            peso.
          </p>
          <p>Borrador: elimina nodos o aristas con un clic.</p>

          <p><strong>2. Opciones</strong></p>
          <p>Dirigido (Flechas): activa o desactiva la direccion de las aristas.</p>
          <p>
            Matriz: abre/cierra la matriz de adyacencia con conteos y sumas por
            fila/columna.
          </p>
          <p>Exportar: guarda tu grafo en un archivo JSON.</p>
          <p>Importar: carga un grafo desde un archivo JSON.</p>
          <p>Borrar Todo: limpia todo el lienzo y reinicia la edicion.</p>

          <p><strong>3. Atajos utiles</strong></p>
          <p>
            Puedes seleccionar un nodo o arista y presionar Delete/Backspace para
            eliminar.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
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

const route = useRoute();
const router = useRouter();
const showHelpModal = ref(false);

const openHelp = () => {
  showHelpModal.value = true;
};

const closeHelp = () => {
  showHelpModal.value = false;
  if (route.query.help) {
    const query = { ...route.query };
    delete query.help;
    router.replace({ query });
  }
};

const downloadHelpPdf = () => {
  const contenido = `
    <h1>Manual general del sitio web</h1>
    <p>Fecha: ${new Date().toLocaleDateString()}</p>

    <h2>1. Inicio</h2>
    <p>
      Presenta el proyecto de Analisis de Algoritmos y da acceso rapido a las
      secciones principales.
    </p>

    <h2>2. Algoritmo</h2>
    <p>
      Muestra contenido teorico/practico de algoritmos para consulta y apoyo de estudio.
    </p>

    <h2>3. Crea tu Grafo (Editor)</h2>
    <p>
      Es la zona interactiva para construir y analizar grafos con nodos, aristas,
      pesos y matriz de adyacencia.
    </p>
    <p><strong>Herramientas:</strong></p>
    <p>- Mover y Editar: seleccionar y editar nodos/aristas (doble clic).</p>
    <p>- Nodo: crear nodos con clic en espacio vacio.</p>
    <p>- Arista: conectar origen y destino, asignando peso.</p>
    <p>- Borrador: eliminar nodos o aristas.</p>
    <p>- Dirigido: alterna flechas en las aristas.</p>
    <p>- Matriz: abre la matriz de adyacencia con conteos y sumas.</p>
    <p>- Exportar/Importar: guardar y cargar grafos en JSON.</p>
    <p>- Borrar Todo: limpia el lienzo.</p>
    <p>- Atajo: Delete/Backspace elimina el elemento seleccionado.</p>

    <h2>4. Acerca de</h2>
    <p>
      Seccion informativa del proyecto, objetivos, contexto y detalles del equipo.
    </p>

    <h2>Recomendaciones de uso</h2>
    <p>
      1) Activa Matriz para verificar conexiones y pesos en tiempo real.<br />
      2) Usa Exportar para guardar avances frecuentes.<br />
      3) Importa archivos JSON para continuar ejercicios anteriores.
    </p>
  `;

  const ventana = window.open("", "_blank");
  if (!ventana) return;

  ventana.document.write(`
    <!doctype html>
    <html lang="es">
      <head>
        <meta charset="UTF-8" />
        <title>Manual del sitio - Analisis de Algoritmos</title>
        <style>
          body { font-family: Arial, sans-serif; color: #0f172a; margin: 24px; line-height: 1.5; }
          h1 { font-size: 24px; margin-bottom: 8px; }
          h2 { font-size: 18px; margin-top: 20px; margin-bottom: 8px; color: #0e7490; }
          p { margin: 6px 0; }
          @media print { body { margin: 14mm; } }
        </style>
      </head>
      <body>
        ${contenido}
      </body>
    </html>
  `);
  ventana.document.close();
  ventana.focus();
  ventana.print();
};

watch(
  () => route.query.help,
  (helpValue) => {
    if (helpValue === "1" || helpValue === "true") {
      showHelpModal.value = true;
    }
  },
  { immediate: true },
);
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
  position: relative;
}

.group {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
  align-items: center;
}

.right-actions {
  margin-left: auto;
}

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

.btn-help {
  border-color: #06b6d4;
  color: #0e7490;
}

.btn-help:hover {
  background: #06b6d4;
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

.help-overlay {
  position: fixed;
  inset: 0;
  background: rgba(2, 6, 23, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  z-index: 1000;
}

.help-modal {
  width: min(680px, 100%);
  max-height: 85vh;
  overflow: hidden;
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #cbd5e1;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

.help-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.help-header h3 {
  margin: 0;
  color: #0f172a;
}

.help-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-pdf {
  border-color: #0e7490;
  color: #0e7490;
}

.btn-pdf:hover {
  background: #0e7490;
  color: #ffffff;
}

.help-close {
  width: 34px;
  height: 34px;
  padding: 0;
  border-radius: 8px;
  font-weight: 700;
}

.help-content {
  padding: 16px;
  overflow-y: auto;
  max-height: calc(85vh - 60px);
}

.help-content p {
  margin: 0 0 10px;
  color: #334155;
}

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
    margin-left: 0;
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
    flex-grow: 1;
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

  .help-modal {
    max-height: 92vh;
  }

  .help-content {
    max-height: calc(92vh - 60px);
  }
}
</style>
