<template>
  <div class="sort-page">
    <!-- Header simplificado -->
    <div class="hero-section">
      <div class="hero-content">
        <h1>Algoritmos de Ordenamiento</h1>
        <p>Visualización interactiva de Bubble Sort, Quick Sort y Merge Sort</p>
      </div>
      <div class="algorithm-badge" :class="getAlgorithmClass()">
        {{ getAlgorithmName() }}
      </div>
    </div>

    <div class="main-layout">
      <!-- Panel de configuración -->
      <div class="config-card">
        <div class="config-header">
          <h3>Configuración</h3>
        </div>

        <div class="config-group">
          <div class="dimension-item full-width">
            <label>Tamaño del arreglo</label>
            <div class="number-control">
              <button @click="decrementSize" class="num-btn">−</button>
              <span class="num-value">{{ arraySize }}</span>
              <button @click="incrementSize" class="num-btn">+</button>
            </div>
          </div>

          <!-- Rango de valores -->
          <div class="range-group">
            <div class="range-item">
              <label>Límite Inferior</label>
              <div class="number-control">
                <button @click="decrementLowerLimit" class="num-btn">−</button>
                <span class="num-value">{{ lowerLimit }}</span>
                <button @click="incrementLowerLimit" class="num-btn">+</button>
              </div>
            </div>
            <div class="range-item">
              <label>Límite Superior</label>
              <div class="number-control">
                <button @click="decrementUpperLimit" class="num-btn">−</button>
                <span class="num-value">{{ upperLimit }}</span>
                <button @click="incrementUpperLimit" class="num-btn">+</button>
              </div>
            </div>
          </div>

          <div class="algorithm-selector">
            <button
              @click="selectedAlgorithm = 'bubble'"
              class="algo-btn"
              :class="{ active: selectedAlgorithm === 'bubble' }"
            >
              Bubble Sort
            </button>
            <button
              @click="selectedAlgorithm = 'quick'"
              class="algo-btn"
              :class="{ active: selectedAlgorithm === 'quick' }"
            >
              Quick Sort
            </button>
            <button
              @click="selectedAlgorithm = 'merge'"
              class="algo-btn"
              :class="{ active: selectedAlgorithm === 'merge' }"
            >
              Merge Sort
            </button>
          </div>

          <div class="speed-control">
            <label>Velocidad de visualización</label>
            <input
              type="range"
              v-model="speed"
              min="1"
              max="100"
              class="speed-slider"
            />
            <span class="speed-value">{{ speed }}%</span>
          </div>

          <div class="action-buttons">
            <button @click="generateRandomArray" class="btn-outline">
              🎲 Aleatorio
            </button>
            <button @click="generateSortedArray" class="btn-outline">
              ✓ Ordenado
            </button>
            <button @click="generateReversedArray" class="btn-outline">
              ↺ Inverso
            </button>
            <button @click="generatePartialArray" class="btn-outline">
              ⚠ Parcial
            </button>
          </div>

          <!-- Sección de Importar/Exportar -->
          <div class="import-export-section">
            <div class="file-name-input">
              <label>Nombre del archivo</label>
              <input
                type="text"
                v-model="fileName"
                class="file-name-field"
                placeholder="mi_arreglo"
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

          <!-- Botones de acción principales -->
          <div class="main-action-buttons">
            <button
              @click="startSorting"
              class="btn-execute"
              :disabled="isSorting"
            >
              <span class="execute-icon">▶</span>
              {{ isSorting ? "Ordenando..." : "Iniciar Ordenamiento" }}
            </button>

            <button @click="clearAll" class="btn-clear">🗑️ Limpiar Todo</button>

            <button @click="resetArray" class="btn-reset">⟳ Reiniciar</button>
          </div>

          <!-- Botón de ayuda -->
          <button @click="showHelpModal = true" class="btn-help">Ayuda</button>
        </div>

        <div class="stats-display">
          <div class="stat-item">
            <span class="stat-label">Comparaciones</span>
            <span class="stat-value">{{ comparisons }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Intercambios</span>
            <span class="stat-value">{{ swaps }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Tiempo</span>
            <span class="stat-value">{{ executionTime }}ms</span>
          </div>
        </div>

        <p v-if="statusMessage" class="status-message" :class="statusTone">
          {{ statusMessage }}
        </p>
      </div>

      <!-- Visualización del arreglo con cuadrados -->
      <div class="visualization-card">
        <div class="visualization-header">
          <h3>Visualización del Arreglo</h3>
          <span class="array-hint"
            >{{ array.length }} elementos | Rango: {{ lowerLimit }} -
            {{ upperLimit }}</span
          >
        </div>

        <div class="squares-container">
          <div
            v-for="(value, index) in array"
            :key="index"
            class="array-square-wrapper"
            :class="{
              comparing: comparingIndices.includes(index),
              swapping: swappingIndices.includes(index),
              sorted: sortedIndices.includes(index),
            }"
          >
            <div
              class="array-square"
              :style="{
                width: getSquareSize(value) + 'px',
                height: getSquareSize(value) + 'px',
                backgroundColor: getBarColor(index),
              }"
            >
              <span class="square-value">{{ value }}</span>
            </div>
            <div class="square-index">{{ index }}</div>
          </div>
        </div>

        <div class="legend">
          <div class="legend-item">
            <div class="legend-color comparing-color"></div>
            <span>Comparando</span>
          </div>
          <div class="legend-item">
            <div class="legend-color swapping-color"></div>
            <span>Intercambiando</span>
          </div>
          <div class="legend-item">
            <div class="legend-color sorted-color"></div>
            <span>Ordenado</span>
          </div>
          <div class="legend-item">
            <div class="legend-color default-color"></div>
            <span>Pendiente</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de ayuda -->
    <Teleport to="body">
      <div
        v-if="showHelpModal"
        class="modal-overlay"
        @click.self="showHelpModal = false"
      >
        <div class="help-modal">
          <div class="modal-header">
            <h2>Guía de Algoritmos de Ordenamiento</h2>
            <button class="close-modal" @click="showHelpModal = false">
              ✕
            </button>
          </div>
          <div class="modal-body">
            <div class="help-content-detailed">
              <div class="help-section">
                <h3>¿Qué son los algoritmos de ordenamiento?</h3>
                <p>
                  Los algoritmos de ordenamiento son métodos para reorganizar
                  los elementos de una lista o arreglo en un orden específico
                  (generalmente ascendente o descendente).
                </p>
              </div>

              <div class="help-section">
                <h3>Algoritmos disponibles:</h3>
                <div class="steps-list">
                  <div class="step-detail">
                    <div class="step-num">1</div>
                    <div class="step-text">
                      <strong>Bubble Sort:</strong> Compara elementos adyacentes
                      y los intercambia si están en el orden incorrecto.
                      Complejidad: O(n²).
                    </div>
                  </div>
                  <div class="step-detail">
                    <div class="step-num">2</div>
                    <div class="step-text">
                      <strong>Quick Sort:</strong> Divide y vencerás usando un
                      pivote. Complejidad: O(n log n) promedio.
                    </div>
                  </div>
                  <div class="step-detail">
                    <div class="step-num">3</div>
                    <div class="step-text">
                      <strong>Merge Sort:</strong> Divide el arreglo en mitades
                      y las mezcla ordenadamente. Complejidad: O(n log n).
                    </div>
                  </div>
                </div>
              </div>

              <div class="help-section">
                <h3>Importar/Exportar:</h3>
                <ul>
                  <li>
                    <strong>Exportar:</strong> Guarda el arreglo actual en un
                    archivo JSON
                  </li>
                  <li>
                    <strong>Importar:</strong> Carga un arreglo desde un archivo
                    JSON
                  </li>
                  <li>
                    <strong>Nombre del archivo:</strong> Personaliza el nombre
                    del archivo al exportar
                  </li>
                </ul>
              </div>

              <div class="help-section">
                <h3>Botones de control:</h3>
                <ul>
                  <li>
                    <strong>Limpiar Todo:</strong> Elimina todos los elementos
                    del arreglo
                  </li>
                  <li>
                    <strong>Reiniciar:</strong> Genera un nuevo arreglo
                    aleatorio
                  </li>
                  <li>
                    <strong>Iniciar Ordenamiento:</strong> Ejecuta el algoritmo
                    seleccionado
                  </li>
                </ul>
              </div>

              <div class="help-section">
                <h3>Visualización:</h3>
                <ul>
                  <li>
                    El <strong>tamaño del cuadrado</strong> es proporcional al
                    valor numérico
                  </li>
                  <li>Los números se muestran dentro de cada cuadrado</li>
                  <li>El índice se muestra debajo de cada cuadrado</li>
                  <li>
                    <span style="color: #f59e0b">Amarillo:</span> Elementos
                    siendo comparados
                  </li>
                  <li>
                    <span style="color: #ef4444">Rojo:</span> Elementos siendo
                    intercambiados
                  </li>
                  <li>
                    <span style="color: #10b981">Verde:</span> Elementos ya
                    ordenados
                  </li>
                  <li>
                    <span style="color: #3b82f6">Azul:</span> Elementos
                    pendientes
                  </li>
                </ul>
              </div>

              <div class="help-note-box">
                <strong>Nota:</strong> Los cuadrados más pequeños representan
                números menores, los más grandes representan números mayores.
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";

// Estado
const arraySize = ref(15);
const lowerLimit = ref(10);
const upperLimit = ref(100);
const selectedAlgorithm = ref("bubble");
const speed = ref(50);
const isSorting = ref(false);
const showHelpModal = ref(false);
const statusMessage = ref("");
const statusTone = ref("");
const array = ref([]);
const comparisons = ref(0);
const swaps = ref(0);
const executionTime = ref(0);
const comparingIndices = ref([]);
const swappingIndices = ref([]);
const sortedIndices = ref([]);
const fileName = ref("arreglo_ordenamiento");

// Métodos
const getSquareSize = (value) => {
  const minSize = 30;
  const maxSize = 100;
  const range = upperLimit.value - lowerLimit.value;
  const normalizedValue = (value - lowerLimit.value) / range;
  return minSize + normalizedValue * (maxSize - minSize);
};

const getAlgorithmName = () => {
  const names = {
    bubble: "Bubble Sort",
    quick: "Quick Sort",
    merge: "Merge Sort",
  };
  return names[selectedAlgorithm.value];
};

const getAlgorithmClass = () => {
  const classes = {
    bubble: "badge-bubble",
    quick: "badge-quick",
    merge: "badge-merge",
  };
  return classes[selectedAlgorithm.value];
};

const getBarColor = (index) => {
  if (comparingIndices.value.includes(index)) return "#f59e0b";
  if (swappingIndices.value.includes(index)) return "#ef4444";
  if (sortedIndices.value.includes(index)) return "#10b981";
  return "#3b82f6";
};

// Limpiar todo el arreglo
const clearAll = () => {
  array.value = [];
  arraySize.value = 0;
  sortedIndices.value = [];
  comparingIndices.value = [];
  swappingIndices.value = [];
  comparisons.value = 0;
  swaps.value = 0;
  executionTime.value = 0;
  statusMessage.value = "Arreglo limpiado completamente";
  statusTone.value = "neutral";
  setTimeout(() => {
    statusMessage.value = "";
  }, 2000);
};

// Exportar datos
const exportData = () => {
  if (array.value.length === 0) {
    statusMessage.value =
      "No hay datos para exportar. Genere o importe un arreglo primero.";
    statusTone.value = "error";
    setTimeout(() => {
      statusMessage.value = "";
    }, 2000);
    return;
  }

  const exportObject = {
    metadata: {
      name: fileName.value,
      date: new Date().toISOString(),
      size: array.value.length,
      lowerLimit: lowerLimit.value,
      upperLimit: upperLimit.value,
      algorithm: selectedAlgorithm.value,
    },
    data: array.value,
    config: {
      arraySize: arraySize.value,
      lowerLimit: lowerLimit.value,
      upperLimit: upperLimit.value,
      algorithm: selectedAlgorithm.value,
      speed: speed.value,
    },
  };

  const jsonString = JSON.stringify(exportObject, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${fileName.value || "arreglo"}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  statusMessage.value = "Arreglo exportado exitosamente";
  statusTone.value = "success";
  setTimeout(() => {
    statusMessage.value = "";
  }, 2000);
};

// Importar datos
const importData = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const importedData = JSON.parse(e.target.result);

      if (importedData.data && Array.isArray(importedData.data)) {
        array.value = importedData.data;
        arraySize.value = array.value.length;

        if (importedData.config) {
          if (importedData.config.lowerLimit)
            lowerLimit.value = importedData.config.lowerLimit;
          if (importedData.config.upperLimit)
            upperLimit.value = importedData.config.upperLimit;
          if (importedData.config.algorithm)
            selectedAlgorithm.value = importedData.config.algorithm;
          if (importedData.config.speed)
            speed.value = importedData.config.speed;
        } else if (importedData.metadata) {
          if (importedData.metadata.lowerLimit)
            lowerLimit.value = importedData.metadata.lowerLimit;
          if (importedData.metadata.upperLimit)
            upperLimit.value = importedData.metadata.upperLimit;
          if (importedData.metadata.name)
            fileName.value = importedData.metadata.name;
        }

        const minValue = Math.min(...array.value);
        const maxValue = Math.max(...array.value);
        if (minValue < lowerLimit.value) lowerLimit.value = minValue - 5;
        if (maxValue > upperLimit.value) upperLimit.value = maxValue + 5;

        sortedIndices.value = [];
        comparingIndices.value = [];
        swappingIndices.value = [];
        comparisons.value = 0;
        swaps.value = 0;
        executionTime.value = 0;

        statusMessage.value = `Arreglo importado: ${array.value.length} elementos`;
        statusTone.value = "success";
      } else {
        throw new Error("Formato de archivo inválido");
      }
    } catch (error) {
      statusMessage.value = "Error al importar: Archivo inválido";
      statusTone.value = "error";
    }
    setTimeout(() => {
      statusMessage.value = "";
    }, 2000);
  };

  reader.readAsText(file);
  event.target.value = "";
};

// Generadores de arreglos
const generateRandomArray = () => {
  const newArray = [];
  for (let i = 0; i < arraySize.value; i++) {
    const value =
      Math.floor(Math.random() * (upperLimit.value - lowerLimit.value + 1)) +
      lowerLimit.value;
    newArray.push(value);
  }
  array.value = newArray;
  sortedIndices.value = [];
  comparingIndices.value = [];
  swappingIndices.value = [];
  comparisons.value = 0;
  swaps.value = 0;
  executionTime.value = 0;
  statusMessage.value = `Arreglo aleatorio generado (rango: ${lowerLimit.value}-${upperLimit.value})`;
  statusTone.value = "success";
  setTimeout(() => {
    statusMessage.value = "";
  }, 2000);
};

const generateSortedArray = () => {
  const newArray = [];
  const step = (upperLimit.value - lowerLimit.value) / (arraySize.value - 1);
  for (let i = 0; i < arraySize.value; i++) {
    newArray.push(Math.round(lowerLimit.value + i * step));
  }
  array.value = newArray;
  sortedIndices.value = [];
  comparingIndices.value = [];
  swappingIndices.value = [];
  comparisons.value = 0;
  swaps.value = 0;
  executionTime.value = 0;
  statusMessage.value = "Arreglo ordenado generado";
  statusTone.value = "success";
  setTimeout(() => {
    statusMessage.value = "";
  }, 2000);
};

const generateReversedArray = () => {
  const newArray = [];
  const step = (upperLimit.value - lowerLimit.value) / (arraySize.value - 1);
  for (let i = 0; i < arraySize.value; i++) {
    newArray.push(Math.round(upperLimit.value - i * step));
  }
  array.value = newArray;
  sortedIndices.value = [];
  comparingIndices.value = [];
  swappingIndices.value = [];
  comparisons.value = 0;
  swaps.value = 0;
  executionTime.value = 0;
  statusMessage.value = "Arreglo inverso generado";
  statusTone.value = "success";
  setTimeout(() => {
    statusMessage.value = "";
  }, 2000);
};

const generatePartialArray = () => {
  const newArray = [];
  const step = (upperLimit.value - lowerLimit.value) / (arraySize.value - 1);
  for (let i = 0; i < arraySize.value; i++) {
    if (i < arraySize.value / 2) {
      newArray.push(Math.round(lowerLimit.value + i * step));
    } else {
      newArray.push(
        Math.floor(Math.random() * (upperLimit.value - lowerLimit.value + 1)) +
          lowerLimit.value,
      );
    }
  }
  array.value = newArray;
  sortedIndices.value = [];
  comparingIndices.value = [];
  swappingIndices.value = [];
  comparisons.value = 0;
  swaps.value = 0;
  executionTime.value = 0;
  statusMessage.value = "Arreglo parcialmente ordenado generado";
  statusTone.value = "success";
  setTimeout(() => {
    statusMessage.value = "";
  }, 2000);
};

const resetArray = () => {
  generateRandomArray();
};

const incrementSize = () => {
  if (arraySize.value < 50) {
    arraySize.value++;
    generateRandomArray();
  }
};

const decrementSize = () => {
  if (arraySize.value > 5) {
    arraySize.value--;
    generateRandomArray();
  }
};

const incrementLowerLimit = () => {
  if (lowerLimit.value < upperLimit.value - 1) {
    lowerLimit.value++;
    generateRandomArray();
  }
};

const decrementLowerLimit = () => {
  if (lowerLimit.value > 0) {
    lowerLimit.value--;
    generateRandomArray();
  }
};

const incrementUpperLimit = () => {
  if (upperLimit.value < 200) {
    upperLimit.value++;
    generateRandomArray();
  }
};

const decrementUpperLimit = () => {
  if (upperLimit.value > lowerLimit.value + 1) {
    upperLimit.value--;
    generateRandomArray();
  }
};

const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const delay = () => {
  return sleep(200 - speed.value);
};

// Bubble Sort
async function bubbleSort() {
  const arr = [...array.value];
  const n = arr.length;
  comparisons.value = 0;
  swaps.value = 0;
  sortedIndices.value = [];

  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      comparingIndices.value = [j, j + 1];
      await delay();

      comparisons.value++;

      if (arr[j] > arr[j + 1]) {
        swappingIndices.value = [j, j + 1];
        await delay();

        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        swaps.value++;
        array.value = [...arr];

        swappingIndices.value = [];
        await delay();
      }

      comparingIndices.value = [];
    }
    sortedIndices.value.push(n - i - 1);
    array.value = [...arr];
  }
  sortedIndices.value.push(0);
}

// Quick Sort
async function quickSort(arr, low, high) {
  if (low < high) {
    const pi = await partition(arr, low, high);
    await quickSort(arr, low, pi - 1);
    await quickSort(arr, pi + 1, high);
  }
}

async function partition(arr, low, high) {
  const pivot = arr[high];
  let i = low - 1;

  for (let j = low; j < high; j++) {
    comparingIndices.value = [j, high];
    await delay();
    comparisons.value++;

    if (arr[j] < pivot) {
      i++;
      swappingIndices.value = [i, j];
      await delay();

      [arr[i], arr[j]] = [arr[j], arr[i]];
      swaps.value++;
      array.value = [...arr];

      swappingIndices.value = [];
      await delay();
    }
    comparingIndices.value = [];
  }

  swappingIndices.value = [i + 1, high];
  await delay();
  [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
  swaps.value++;
  array.value = [...arr];
  swappingIndices.value = [];
  await delay();

  return i + 1;
}

async function quickSortWrapper() {
  const arr = [...array.value];
  comparisons.value = 0;
  swaps.value = 0;
  sortedIndices.value = [];
  await quickSort(arr, 0, arr.length - 1);
  for (let i = 0; i < arr.length; i++) {
    sortedIndices.value.push(i);
    array.value = [...arr];
    await delay();
  }
}

// Merge Sort
async function mergeSort(arr, l, r) {
  if (l < r) {
    const m = Math.floor((l + r) / 2);
    await mergeSort(arr, l, m);
    await mergeSort(arr, m + 1, r);
    await merge(arr, l, m, r);
  }
}

async function merge(arr, l, m, r) {
  const left = arr.slice(l, m + 1);
  const right = arr.slice(m + 1, r + 1);
  let i = 0,
    j = 0,
    k = l;

  while (i < left.length && j < right.length) {
    comparingIndices.value = [l + i, m + 1 + j];
    await delay();
    comparisons.value++;

    if (left[i] <= right[j]) {
      arr[k] = left[i];
      i++;
    } else {
      arr[k] = right[j];
      j++;
    }
    swaps.value++;
    array.value = [...arr];
    comparingIndices.value = [];
    await delay();
    k++;
  }

  while (i < left.length) {
    arr[k] = left[i];
    array.value = [...arr];
    await delay();
    i++;
    k++;
  }

  while (j < right.length) {
    arr[k] = right[j];
    array.value = [...arr];
    await delay();
    j++;
    k++;
  }
}

async function mergeSortWrapper() {
  const arr = [...array.value];
  comparisons.value = 0;
  swaps.value = 0;
  sortedIndices.value = [];
  await mergeSort(arr, 0, arr.length - 1);
  for (let i = 0; i < arr.length; i++) {
    sortedIndices.value.push(i);
    array.value = [...arr];
    await delay();
  }
}

// Iniciar ordenamiento
async function startSorting() {
  if (isSorting.value) return;
  if (array.value.length === 0) {
    statusMessage.value =
      "No hay elementos para ordenar. Genere un arreglo primero.";
    statusTone.value = "error";
    setTimeout(() => {
      statusMessage.value = "";
    }, 2000);
    return;
  }

  isSorting.value = true;
  sortedIndices.value = [];
  const startTime = performance.now();

  if (selectedAlgorithm.value === "bubble") {
    await bubbleSort();
  } else if (selectedAlgorithm.value === "quick") {
    await quickSortWrapper();
  } else if (selectedAlgorithm.value === "merge") {
    await mergeSortWrapper();
  }

  const endTime = performance.now();
  executionTime.value = Math.round(endTime - startTime);

  isSorting.value = false;

  statusMessage.value = "Ordenamiento completado";
  statusTone.value = "success";
  setTimeout(() => {
    statusMessage.value = "";
  }, 2000);
}

// Inicializar
generateRandomArray();

watch([arraySize, lowerLimit, upperLimit], () => {
  generateRandomArray();
});
</script>

<style scoped>
/* Mantener todos los estilos anteriores y agregar los nuevos */

/* Sección de Importar/Exportar */
.import-export-section {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #e0e0e0;
}

.file-name-input {
  margin-bottom: 12px;
}

.file-name-input label {
  display: block;
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 8px;
}

.file-name-field {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 10px;
  font-size: 0.9rem;
  transition: all 0.2s;
  background: white;
}

.file-name-field:focus {
  outline: none;
  border-color: #2a5298;
  box-shadow: 0 0 0 3px rgba(48, 180, 198, 0.1);
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
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
  font-size: 0.9rem;
}

.btn-export {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
}

.btn-export:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.btn-import {
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  color: white;
  display: inline-block;
}

.btn-import:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
  cursor: pointer;
}

/* Botones de acción principales */
.main-action-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.btn-execute {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #1e3c72, #2a5298);
  color: white;
  border: none;
  border-radius: 14px;
  font-weight: bold;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s;
}

.btn-execute:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(30, 60, 114, 0.3);
}

.btn-execute:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-clear {
  width: 100%;
  padding: 12px;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 14px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-clear:hover {
  background: #dc2626;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.btn-reset {
  width: 100%;
  padding: 12px;
  background: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 14px;
  cursor: pointer;
  font-weight: 600;
  color: #666;
  transition: all 0.2s;
}

.btn-reset:hover {
  background: #e0e0e0;
  transform: translateY(-2px);
}

.btn-help {
  width: 100%;
  padding: 12px;
  background: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 14px;
  cursor: pointer;
  font-weight: 600;
  color: #2a5298;
  transition: all 0.2s;
  margin-top: 8px;
}

.btn-help:hover {
  background: #2a5298;
  color: white;
  border-color: #2a5298;
  transform: translateY(-2px);
}

.execute-icon {
  font-size: 0.9rem;
}

/* Asegurar que los estilos existentes se mantengan */
* {
  box-sizing: border-box;
}

.sort-page {
  min-height: 100vh;
  padding: 32px;
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
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
  background: linear-gradient(135deg, #1e3c72, #2a8f98);
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

.badge-bubble {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

.badge-quick {
  background: linear-gradient(135deg, #ef4444, #dc2626);
}

.badge-merge {
  background: linear-gradient(135deg, #10b981, #059669);
}

.main-layout {
  display: grid;
  grid-template-columns: 320px 1fr;
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

.dimension-item {
  width: 100%;
}

.dimension-item.full-width {
  width: 100%;
}

.dimension-item label,
.range-item label {
  display: block;
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 8px;
}

.range-group {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.number-control {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #f5f5f5;
  border-radius: 12px;
  padding: 4px;
}

.num-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1.2rem;
  font-weight: bold;
  color: #2a5298;
  transition: all 0.2s;
}

.num-btn:hover {
  background: #2a5298;
  color: white;
  transform: scale(1.05);
}

.num-value {
  font-size: 1.2rem;
  font-weight: bold;
  min-width: 40px;
  text-align: center;
}

.algorithm-selector {
  display: flex;
  gap: 8px;
  flex-direction: column;
}

.algo-btn {
  padding: 10px;
  border: 2px solid #e0e0e0;
  background: white;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
}

.algo-btn.active {
  border-color: #2a5298;
  background: linear-gradient(135deg, #1e3c72, #2a5298);
  color: white;
}

.speed-control {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.speed-control label {
  font-size: 0.85rem;
  color: #666;
}

.speed-slider {
  flex: 1;
  height: 4px;
  border-radius: 2px;
  background: #e0e0e0;
  outline: none;
}

.speed-value {
  font-size: 0.85rem;
  font-weight: bold;
  color: #2a5298;
  min-width: 45px;
}

.action-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.btn-outline {
  flex: 1;
  min-width: 80px;
  padding: 8px 12px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 10px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s;
}

.btn-outline:hover {
  border-color: #2a5298;
  background: #f5f7fa;
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
  font-size: 1.1rem;
  font-weight: bold;
  color: #2a5298;
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

.array-hint {
  font-size: 0.8rem;
  color: #999;
}

.squares-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: flex-end;
  gap: 16px;
  min-height: 400px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 16px;
  margin-bottom: 20px;
}

.array-square-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.array-square {
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  font-weight: bold;
}

.square-value {
  font-weight: bold;
  color: white;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
  font-size: 14px;
}

.square-index {
  font-size: 12px;
  color: #666;
  font-weight: 500;
  background: rgba(0, 0, 0, 0.05);
  padding: 4px 8px;
  border-radius: 12px;
}

.comparing .array-square {
  animation: pulse 0.5s ease infinite;
  box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.4);
}

.swapping .array-square {
  animation: shake 0.3s ease;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.4);
}

.sorted .array-square {
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.3);
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-5px);
  }
  75% {
    transform: translateX(5px);
  }
}

.legend {
  display: flex;
  justify-content: center;
  gap: 24px;
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
  border-radius: 6px;
}

.comparing-color {
  background-color: #f59e0b;
}

.swapping-color {
  background-color: #ef4444;
}

.sorted-color {
  background-color: #10b981;
}

.default-color {
  background-color: #3b82f6;
}

/* Modal de ayuda */
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
  max-width: 800px;
  width: 90%;
  max-height: 85vh;
  overflow: hidden;
  animation: modalSlideIn 0.3s ease;
}

.modal-header {
  padding: 20px 24px;
  background: linear-gradient(135deg, #1e3c72, #2a5298);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
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
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.help-content-detailed {
  padding: 8px;
}

.help-section {
  margin-bottom: 24px;
}

.help-section h3 {
  color: #2a5298;
  font-size: 1.1rem;
  margin: 0 0 12px 0;
  padding-bottom: 6px;
  border-bottom: 2px solid #e0e0e0;
}

.help-section p {
  color: #555;
  line-height: 1.6;
  margin: 0 0 12px 0;
}

.steps-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.step-detail {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.step-num {
  width: 28px;
  height: 28px;
  background: linear-gradient(135deg, #1e3c72, #2a5298);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.85rem;
  flex-shrink: 0;
}

.step-text {
  flex: 1;
  color: #555;
  line-height: 1.5;
  font-size: 0.9rem;
}

.step-text strong {
  color: #333;
}

.help-section ul {
  margin: 8px 0;
  padding-left: 20px;
}

.help-section li {
  margin: 8px 0;
  color: #555;
  line-height: 1.5;
}

.help-note-box {
  margin-top: 20px;
  padding: 15px;
  background: #fef3c7;
  border-left: 4px solid #f59e0b;
  border-radius: 8px;
  color: #92400e;
  font-size: 0.9rem;
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

@keyframes modalSlideIn {
  from {
    transform: translateY(-50px);
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

  .range-group {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .sort-page {
    padding: 16px;
  }

  .hero-section {
    padding: 24px;
  }

  .hero-content h1 {
    font-size: 1.5rem;
  }

  .squares-container {
    min-height: 300px;
  }

  .square-value {
    font-size: 10px;
  }

  .square-index {
    font-size: 10px;
  }
}
</style>
