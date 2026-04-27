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

          <div class="algorithm-selector">
            <button 
              @click="selectedAlgorithm = 'bubble'" 
              class="algo-btn" 
              :class="{ active: selectedAlgorithm === 'bubble' }">
              Bubble Sort
            </button>
            <button 
              @click="selectedAlgorithm = 'quick'" 
              class="algo-btn" 
              :class="{ active: selectedAlgorithm === 'quick' }">
              Quick Sort
            </button>
            <button 
              @click="selectedAlgorithm = 'merge'" 
              class="algo-btn" 
              :class="{ active: selectedAlgorithm === 'merge' }">
              Merge Sort
            </button>
          </div>

          <div class="speed-control">
            <label>Velocidad de visualización</label>
            <input type="range" v-model="speed" min="1" max="100" class="speed-slider">
            <span class="speed-value">{{ speed }}%</span>
          </div>

          <div class="action-buttons">
            <button @click="generateRandomArray" class="btn-outline">🎲 Aleatorio</button>
            <button @click="generateSortedArray" class="btn-outline">✓ Ordenado</button>
            <button @click="generateReversedArray" class="btn-outline">↺ Inverso</button>
            <button @click="generatePartialArray" class="btn-outline">⚠ Parcial</button>
          </div>

          <button @click="startSorting" class="btn-execute" :disabled="isSorting">
            <span class="execute-icon">▶</span>
            {{ isSorting ? 'Ordenando...' : 'Iniciar Ordenamiento' }}
          </button>

          <button @click="resetArray" class="btn-reset">
            ⟳ Reiniciar
          </button>

          <!-- Botón de ayuda -->
          <button @click="showHelpModal = true" class="btn-help">
            Ayuda
          </button>
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

      <!-- Visualización del arreglo -->
      <div class="visualization-card">
        <div class="visualization-header">
          <h3>Visualización del Arreglo</h3>
          <span class="array-hint">{{ array.length }} elementos</span>
        </div>
        
        <div class="array-container">
          <div 
            v-for="(value, index) in array" 
            :key="index"
            class="array-bar"
            :style="{
              height: `${(value / maxValue) * 100}%`,
              backgroundColor: getBarColor(index)
            }"
            :class="{ 
              'comparing': comparingIndices.includes(index),
              'swapping': swappingIndices.includes(index),
              'sorted': sortedIndices.includes(index)
            }">
            <span class="bar-value">{{ value }}</span>
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

    <!-- Modal de resultados con 50/50 -->
    <Teleport to="body">
      <div v-if="showResultModal" class="modal-overlay" @click.self="closeModal">
        <div class="result-modal">
          <div class="modal-header">
            <div class="modal-title">
              <h2>Resultado del Ordenamiento</h2>
            </div>
            <button class="close-modal" @click="closeModal">✕</button>
          </div>

          <div class="modal-body">
            <!-- Resumen del ordenamiento -->
            <div class="summary-card" :class="getAlgorithmClass()">
              <div class="summary-stats">
                <div class="summary-stat">
                  <span class="stat-label">Algoritmo</span>
                  <span class="stat-value">{{ getAlgorithmName() }}</span>
                </div>
                <div class="summary-stat">
                  <span class="stat-label">Tamaño</span>
                  <span class="stat-value">{{ arraySize }}</span>
                </div>
                <div class="summary-stat">
                  <span class="stat-label">Comparaciones</span>
                  <span class="stat-value">{{ comparisons }}</span>
                </div>
                <div class="summary-stat">
                  <span class="stat-label">Intercambios</span>
                  <span class="stat-value">{{ swaps }}</span>
                </div>
                <div class="summary-stat">
                  <span class="stat-label">Tiempo</span>
                  <span class="stat-value">{{ executionTime }}ms</span>
                </div>
              </div>
            </div>

            <!-- Layout 50/50 -->
            <div class="split-layout">
              <!-- Mitad izquierda: Arreglo ordenado -->
              <div class="half-section array-section">
                <div class="section-header">
                  <h3>Arreglo Ordenado</h3>
                  <p class="step-description">El arreglo ha sido ordenado de forma {{ isAscending ? 'ascendente' : 'descendente' }}</p>
                </div>
                <div class="sorted-array-container">
                  <div 
                    v-for="(value, index) in sortedArray" 
                    :key="index"
                    class="sorted-bar"
                    :style="{
                      height: `${(value / maxValue) * 100}%`,
                      backgroundColor: '#10b981'
                    }">
                    <span class="bar-value">{{ value }}</span>
                  </div>
                </div>
                <div class="array-values">
                  [{{ sortedArray.join(', ') }}]
                </div>
              </div>

              <!-- Mitad derecha: Historial de pasos -->
              <div class="half-section timeline-section">
                <div class="section-header">
                  <h3>Historial de Pasos</h3>
                </div>
                <div class="timeline-container">
                  <div 
                    v-for="(step, index) in steps" 
                    :key="index"
                    class="timeline-entry"
                    :class="{ 'active-entry': index === currentStepIndex }"
                    @click="jumpToStep(index)">
                    <div class="entry-marker">
                      <span class="marker-circle">{{ index + 1 }}</span>
                    </div>
                    <div class="entry-content">
                      <h4>{{ step.title }}</h4>
                      <p>{{ step.description }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button @click="closeModal" class="close-btn">Cerrar</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal de ayuda detallada -->
    <Teleport to="body">
      <div v-if="showHelpModal" class="modal-overlay" @click.self="showHelpModal = false">
        <div class="help-modal">
          <div class="modal-header">
            <h2>Guía de Algoritmos de Ordenamiento</h2>
            <button class="close-modal" @click="showHelpModal = false">✕</button>
          </div>
          <div class="modal-body">
            <div class="help-content-detailed">
              <div class="help-section">
                <h3>¿Qué son los algoritmos de ordenamiento?</h3>
                <p>Los algoritmos de ordenamiento son métodos para reorganizar los elementos de una lista o arreglo en un orden específico (generalmente ascendente o descendente). Son fundamentales en ciencias de la computación por su eficiencia y aplicaciones prácticas.</p>
              </div>

              <div class="help-section">
                <h3>Algoritmos disponibles:</h3>
                <div class="steps-list">
                  <div class="step-detail">
                    <div class="step-num">1</div>
                    <div class="step-text">
                      <strong>Bubble Sort (Ordenamiento de Burbuja):</strong> Compara elementos adyacentes y los intercambia si están en el orden incorrecto. Es simple pero ineficiente para grandes conjuntos de datos. Complejidad: O(n²).
                    </div>
                  </div>
                  <div class="step-detail">
                    <div class="step-num">2</div>
                    <div class="step-text">
                      <strong>Quick Sort (Ordenamiento Rápido):</strong> Divide y vencerás. Selecciona un pivote y particiona el arreglo en elementos menores y mayores que él. Muy eficiente. Complejidad: O(n log n) promedio.
                    </div>
                  </div>
                  <div class="step-detail">
                    <div class="step-num">3</div>
                    <div class="step-text">
                      <strong>Merge Sort (Ordenamiento por Mezcla):</strong> Divide el arreglo en mitades, ordena recursivamente cada mitad y luego las mezcla. Estable y eficiente. Complejidad: O(n log n).
                    </div>
                  </div>
                </div>
              </div>

              <div class="help-section">
                <h3>Cómo usar la herramienta:</h3>
                <ul>
                  <li><strong>Configurar tamaño:</strong> Ajuste el número de elementos del arreglo</li>
                  <li><strong>Generar datos:</strong> Use los botones para crear arreglos aleatorios, ordenados, inversos o parciales</li>
                  <li><strong>Seleccionar algoritmo:</strong> Elija entre Bubble, Quick o Merge Sort</li>
                  <li><strong>Ajustar velocidad:</strong> Controle qué tan rápido se visualiza el ordenamiento</li>
                  <li><strong>Iniciar:</strong> Presione "Iniciar Ordenamiento" para ver el proceso</li>
                </ul>
              </div>

              <div class="help-section">
                <h3>Interpretación visual:</h3>
                <ul>
                  <li><span style="color: #f59e0b;">Amarillo:</span> Elementos siendo comparados</li>
                  <li><span style="color: #ef4444;">Rojo:</span> Elementos siendo intercambiados</li>
                  <li><span style="color: #10b981;">Verde:</span> Elementos ya ordenados</li>
                  <li><span style="color: #3b82f6;">Azul:</span> Elementos pendientes</li>
                </ul>
              </div>

              <div class="help-note-box">
                <strong>Nota importante:</strong> La velocidad de visualización afecta el tiempo real de ejecución. Para arreglos grandes (>30 elementos), se recomienda usar velocidad más alta.
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

// Estado
const arraySize = ref(15);
const selectedAlgorithm = ref('bubble');
const speed = ref(50);
const isSorting = ref(false);
const showResultModal = ref(false);
const showHelpModal = ref(false);
const statusMessage = ref('');
const statusTone = ref('');
const array = ref([]);
const sortedArray = ref([]);
const steps = ref([]);
const currentStepIndex = ref(0);
const comparisons = ref(0);
const swaps = ref(0);
const executionTime = ref(0);
const comparingIndices = ref([]);
const swappingIndices = ref([]);
const sortedIndices = ref([]);
const isAscending = ref(true);

let sortingInterval = null;
let maxValue = ref(100);

// Métodos
const getAlgorithmName = () => {
  const names = {
    bubble: 'Bubble Sort',
    quick: 'Quick Sort',
    merge: 'Merge Sort'
  };
  return names[selectedAlgorithm.value];
};

const getAlgorithmClass = () => {
  const classes = {
    bubble: 'badge-bubble',
    quick: 'badge-quick',
    merge: 'badge-merge'
  };
  return classes[selectedAlgorithm.value];
};

const getBarColor = (index) => {
  if (comparingIndices.value.includes(index)) return '#f59e0b';
  if (swappingIndices.value.includes(index)) return '#ef4444';
  if (sortedIndices.value.includes(index)) return '#10b981';
  return '#3b82f6';
};

const generateRandomArray = () => {
  const newArray = [];
  for (let i = 0; i < arraySize.value; i++) {
    newArray.push(Math.floor(Math.random() * 90) + 10);
  }
  array.value = newArray;
  maxValue.value = Math.max(...newArray);
  statusMessage.value = 'Arreglo aleatorio generado';
  statusTone.value = 'success';
  setTimeout(() => { statusMessage.value = ''; }, 2000);
};

const generateSortedArray = () => {
  const newArray = [];
  for (let i = 0; i < arraySize.value; i++) {
    newArray.push(10 + Math.floor(i * (90 / arraySize.value)));
  }
  array.value = newArray;
  maxValue.value = Math.max(...newArray);
  statusMessage.value = 'Arreglo ordenado generado';
  statusTone.value = 'success';
  setTimeout(() => { statusMessage.value = ''; }, 2000);
};

const generateReversedArray = () => {
  const newArray = [];
  for (let i = 0; i < arraySize.value; i++) {
    newArray.push(100 - Math.floor(i * (90 / arraySize.value)));
  }
  array.value = newArray;
  maxValue.value = Math.max(...newArray);
  statusMessage.value = 'Arreglo inverso generado';
  statusTone.value = 'success';
  setTimeout(() => { statusMessage.value = ''; }, 2000);
};

const generatePartialArray = () => {
  const newArray = [];
  for (let i = 0; i < arraySize.value; i++) {
    if (i < arraySize.value / 2) {
      newArray.push(10 + Math.floor(i * (90 / arraySize.value)));
    } else {
      newArray.push(Math.floor(Math.random() * 90) + 10);
    }
  }
  array.value = newArray;
  maxValue.value = Math.max(...newArray);
  statusMessage.value = 'Arreglo parcialmente ordenado generado';
  statusTone.value = 'success';
  setTimeout(() => { statusMessage.value = ''; }, 2000);
};

const resetArray = () => {
  generateRandomArray();
  sortedIndices.value = [];
  comparingIndices.value = [];
  swappingIndices.value = [];
  comparisons.value = 0;
  swaps.value = 0;
  executionTime.value = 0;
  steps.value = [];
  statusMessage.value = 'Arreglo reiniciado';
  statusTone.value = 'neutral';
  setTimeout(() => { statusMessage.value = ''; }, 2000);
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

const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

const delay = () => {
  return sleep(200 - speed.value);
};

// Bubble Sort
async function bubbleSort() {
  const arr = [...array.value];
  const n = arr.length;
  steps.value = [];
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
  steps.value = [];
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
  let i = 0, j = 0, k = l;
  
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
  steps.value = [];
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
  
  isSorting.value = true;
  sortedIndices.value = [];
  const startTime = performance.now();
  
  if (selectedAlgorithm.value === 'bubble') {
    await bubbleSort();
  } else if (selectedAlgorithm.value === 'quick') {
    await quickSortWrapper();
  } else if (selectedAlgorithm.value === 'merge') {
    await mergeSortWrapper();
  }
  
  const endTime = performance.now();
  executionTime.value = Math.round(endTime - startTime);
  
  sortedArray.value = [...array.value];
  steps.value = generateSteps();
  currentStepIndex.value = 0;
  
  isSorting.value = false;
  showResultModal.value = true;
  
  statusMessage.value = 'Ordenamiento completado';
  statusTone.value = 'success';
  setTimeout(() => { statusMessage.value = ''; }, 2000);
}

const generateSteps = () => {
  const stepsList = [
    {
      title: 'Inicio del ordenamiento',
      description: `Se inicia el algoritmo ${getAlgorithmName()} con un arreglo de ${arraySize.value} elementos.`
    },
    {
      title: 'Proceso de comparación',
      description: `Se realizaron ${comparisons.value} comparaciones entre elementos.`
    },
    {
      title: 'Intercambios realizados',
      description: `Se ejecutaron ${swaps.value} intercambios para ordenar el arreglo.`
    },
    {
      title: 'Ordenamiento completado',
      description: `El arreglo fue ordenado exitosamente en ${executionTime.value} milisegundos.`
    }
  ];
  return stepsList;
};

const jumpToStep = (index) => {
  currentStepIndex.value = index;
};

const closeModal = () => {
  showResultModal.value = false;
};

// Inicializar
generateRandomArray();

watch(arraySize, () => {
  generateRandomArray();
});
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.sort-page {
  min-height: 100vh;
  padding: 32px;
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  position: relative;
}

/* Hero Section */
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
  background: linear-gradient(135deg, #1e3c72, #2a5298);
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

/* Main Layout */
.main-layout {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 24px;
}

/* Config Card */
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

.dimension-item label {
  display: block;
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 8px;
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

/* Visualization Card */
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
}

.visualization-header h3 {
  margin: 0;
  color: #333;
}

.array-hint {
  font-size: 0.8rem;
  color: #999;
}

.array-container {
  height: 400px;
  display: flex;
  align-items: flex-end;
  gap: 4px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 16px;
  margin-bottom: 20px;
}

.array-bar {
  flex: 1;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  transition: all 0.3s ease;
  border-radius: 4px 4px 0 0;
  position: relative;
  min-width: 30px;
}

.bar-value {
  position: absolute;
  top: -20px;
  font-size: 10px;
  font-weight: bold;
  color: #333;
}

.comparing {
  background-color: #f59e0b !important;
  transform: scaleY(1.05);
}

.swapping {
  background-color: #ef4444 !important;
  animation: shake 0.3s ease;
}

.sorted {
  background-color: #10b981 !important;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
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
  border-radius: 4px;
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

/* Modal de Resultados */
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

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.result-modal {
  background: white;
  border-radius: 32px;
  width: 95%;
  max-width: 1400px;
  height: 85vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: slideUp 0.4s ease;
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
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  justify-content: flex-end;
}

.close-btn {
  padding: 10px 24px;
  background: #2a5298;
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #1e3c72;
  transform: translateY(-2px);
}

/* Summary Card */
.summary-card {
  background: white;
  padding: 20px;
  border-radius: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.summary-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
}

.summary-stat {
  text-align: center;
}

.summary-stat .stat-label {
  font-size: 0.75rem;
  color: #666;
  margin-bottom: 4px;
}

.summary-stat .stat-value {
  font-size: 1.2rem;
  font-weight: bold;
}

/* Split Layout */
.split-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  min-height: 400px;
}

.half-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow: hidden;
}

.section-header h3 {
  margin: 0 0 4px 0;
  font-size: 1rem;
  color: #333;
}

.section-header p {
  margin: 0;
  font-size: 0.8rem;
  color: #666;
}

/* Array Section */
.array-section {
  border-right: 1px solid #e0e0e0;
  padding-right: 20px;
}

.sorted-array-container {
  height: 300px;
  display: flex;
  align-items: flex-end;
  gap: 4px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 16px;
}

.sorted-bar {
  flex: 1;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  transition: all 0.3s ease;
  border-radius: 4px 4px 0 0;
  position: relative;
  min-width: 30px;
}

.array-values {
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  font-size: 0.8rem;
  font-family: monospace;
  overflow-x: auto;
  white-space: nowrap;
}

/* Timeline Section */
.timeline-section {
  padding-left: 20px;
}

.timeline-container {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 400px;
}

.timeline-entry {
  display: flex;
  gap: 12px;
  padding: 10px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  background: white;
  border: 1px solid #e8e8e8;
}

.timeline-entry:hover {
  background: #e0e7ff;
  transform: translateX(4px);
}

.active-entry {
  background: linear-gradient(135deg, #e0e7ff, #c7d2fe);
  border-left: 3px solid #2a5298;
}

.entry-marker {
  flex-shrink: 0;
}

.marker-circle {
  display: inline-flex;
  width: 28px;
  height: 28px;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1e3c72, #2a5298);
  color: white;
  border-radius: 50%;
  font-weight: bold;
  font-size: 0.75rem;
}

.entry-content {
  flex: 1;
}

.entry-content h4 {
  margin: 0 0 4px 0;
  font-size: 0.85rem;
  color: #333;
}

.entry-content p {
  margin: 0;
  font-size: 0.75rem;
  color: #666;
  line-height: 1.3;
}

/* Help Modal */
.help-modal {
  background: white;
  border-radius: 32px;
  max-width: 800px;
  width: 90%;
  max-height: 85vh;
  overflow: hidden;
  animation: modalSlideIn 0.3s ease;
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
  
  .split-layout {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .array-section {
    border-right: none;
    padding-right: 0;
  }
  
  .timeline-section {
    padding-left: 0;
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
  
  .result-modal {
    width: 98%;
    height: 95vh;
  }
  
  .array-container, .sorted-array-container {
    height: 250px;
  }
  
  .bar-value {
    font-size: 8px;
    top: -16px;
  }
}
</style>