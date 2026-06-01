<template>
  <div class="transport-page">
    <!-- Header - MISMO DISEÑO QUE LOS OTROS ALGORITMOS -->
    <div class="hero-section">
      <div class="hero-content">
        <h1>Método de Transporte</h1>
        <p>Algoritmo de Minimización (Esquina Noroeste) y Maximización (Máxima Contribución)</p>
      </div>
      <div class="optimization-badge" :class="optimizationType === 'min' ? 'badge-min' : 'badge-max'">
        {{ optimizationType === 'min' ? 'Minimizar Costo' : 'Maximizar Beneficio' }}
      </div>
    </div>

    <div class="main-layout">
      <!-- Panel de configuración -->
      <div class="config-card">
        <div class="config-header">
          <h3>Configuración</h3>
        </div>

        <div class="config-group">
          <div class="dimension-controls">
            <div class="dimension-item">
              <label>Orígenes</label>
              <div class="number-control">
                <button @click="decrementRows" class="num-btn">−</button>
                <span class="num-value">{{ rowCount }}</span>
                <button @click="incrementRows" class="num-btn">+</button>
              </div>
            </div>
            <div class="dimension-item">
              <label>Destinos</label>
              <div class="number-control">
                <button @click="decrementCols" class="num-btn">−</button>
                <span class="num-value">{{ colCount }}</span>
                <button @click="incrementCols" class="num-btn">+</button>
              </div>
            </div>
          </div>

          <div class="optimization-toggle">
            <button 
              @click="optimizationType = 'min'" 
              class="toggle-btn" 
              :class="{ active: optimizationType === 'min' }">
              Minimizar Costo
            </button>
            <button 
              @click="optimizationType = 'max'" 
              class="toggle-btn" 
              :class="{ active: optimizationType === 'max' }">
              Maximizar Beneficio
            </button>
          </div>

          <label class="balance-check">
            <input type="checkbox" v-model="autoBalance">
            <span>Balancear automáticamente</span>
          </label>

          <div class="totals-display">
            <div class="total-item">
              <span class="total-label">Oferta total</span>
              <span class="total-value supply-total">{{ totalSupply }}</span>
            </div>
            <div class="total-item">
              <span class="total-label">Demanda total</span>
              <span class="total-value demand-total">{{ totalDemand }}</span>
            </div>
          </div>

          <div class="action-buttons">
            <button @click="resizeTable" class="btn-outline">Actualizar</button>
            <button @click="loadExample" class="btn-outline">Ejemplo</button>
            <button @click="resetData" class="btn-outline">Limpiar</button>
            <button @click="triggerImport" class="btn-outline">Importar</button>
            <div class="export-group">
              <input 
                type="text" 
                v-model="exportFileName" 
                class="export-name-input" 
                placeholder="nombre_archivo">
              <button @click="exportData" class="btn-outline export-btn">Exportar</button>
            </div>
          </div>

          <button @click="runAlgorithm" class="btn-execute" :disabled="isExecuting">
            <span class="execute-icon">▶</span>
            {{ isExecuting ? 'Calculando...' : 'Ejecutar Algoritmo' }}
          </button>

          <button @click="showHelpModal = true" class="btn-help">Ayuda</button>
        </div>

        <p v-if="statusMessage" class="status-message" :class="statusTone">
          {{ statusMessage }}
        </p>
      </div>

      <!-- Matriz principal -->
      <div class="matrix-card">
        <div class="matrix-header">
          <h3>Matriz de {{ optimizationType === 'min' ? 'Costos' : 'Beneficios' }}</h3>
          <span class="matrix-hint">Complete los valores en cada celda</span>
        </div>
        
        <div class="matrix-container">
          <table class="beautiful-table">
            <thead>
              <tr>
                <th></th>
                <th v-for="j in colCount" :key="'d'+j">
                  <div class="dest-badge">D{{ j }}</div>
                </th>
                <th><div class="supply-badge">OFERTA</div></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="i in rowCount" :key="'o'+i">
                <th><div class="origin-badge">O{{ i }}</div></th>
                <td v-for="j in colCount" :key="'c'+i+j">
                  <input 
                    v-model.number="costs[i-1][j-1]" 
                    type="number"
                    class="cost-input"
                    placeholder="0">
                </td>
                <td>
                  <input 
                    v-model.number="supply[i-1]" 
                    type="number"
                    class="supply-input"
                    placeholder="0">
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <th>DEMANDA</th>
                <td v-for="j in colCount" :key="'dem'+j">
                  <input 
                    v-model.number="demand[j-1]" 
                    type="number"
                    class="demand-input"
                    placeholder="0">
                </td>
                <td class="total-footer">{{ totalDemand }}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal de resultados -->
    <Teleport to="body">
      <div v-if="showResultModal" class="modal-overlay" @click.self="closeModal">
        <div class="result-modal">
          <div class="modal-header">
            <div class="modal-title">
              <h2>Solución - {{ optimizationType === 'min' ? 'Minimización' : 'Maximización' }}</h2>
            </div>
            <button class="close-modal" @click="closeModal">✕</button>
          </div>

          <div class="modal-body">
            <div class="steps-navigation">
              <div class="step-progress">
                <div class="progress-bar" :style="{ width: ((currentStepIndex + 1) / (result?.stepMatrices.length || 1) * 100) + '%' }"></div>
              </div>
              <div class="nav-controls">
                <button @click="previousStep" :disabled="currentStepIndex <= 0" class="nav-btn">◀ Anterior</button>
                <div class="step-indicator">
                  <span class="step-current">{{ currentStepIndex + 1 }}</span>
                  <span class="step-total">/ {{ result?.stepMatrices.length }}</span>
                </div>
                <button @click="nextStep" :disabled="currentStepIndex >= (result?.stepMatrices.length || 1) - 1" class="nav-btn">Siguiente ▶</button>
                <button @click="resetSteps" class="nav-btn reset-btn">⟳ Reiniciar</button>
              </div>
            </div>

            <div class="split-layout">
              <div class="half-section matrix-section">
                <div class="section-header">
                  <h3>Paso {{ currentStepIndex + 1 }}</h3>
                  <p class="step-description">{{ result?.stepMatrices[currentStepIndex]?.description }}</p>
                </div>
                <div class="matrix-wrapper">
                  <table class="solution-table">
                    <thead>
                      <tr>
                        <th></th>
                        <th v-for="j in result?.destinations.length" :key="'s-d'+j">{{ result?.destinations[j-1] }}</th>
                        <th>Oferta</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(row, i) in result?.stepMatrices[currentStepIndex]?.allocation" :key="'s-r'+i">
                        <th class="origin-col">{{ result?.origins[i] }}</th>
                        <td 
                          v-for="(cell, j) in row" 
                          :key="'s-c'+i+j"
                          :class="{
                            'allocated': cell > 0,
                            'current-highlight': result?.stepMatrices[currentStepIndex]?.currentCell?.row === i && 
                                                result?.stepMatrices[currentStepIndex]?.currentCell?.col === j
                          }">
                          <div class="table-cell">
                            <span class="alloc-value">{{ cell }}</span>
                            <span class="cost-value">{{ result?.stepMatrices[currentStepIndex]?.costs[i][j] }}</span>
                          </div>
                        </td>
                        <td class="remaining-value">{{ result?.stepMatrices[currentStepIndex]?.remainingSupply[i] }}</td>
                      </tr>
                    </tbody>
                    <tfoot>
                      <tr>
                        <th>Demanda</th>
                        <td v-for="(_, j) in result?.stepMatrices[currentStepIndex]?.allocation[0]" :key="'s-dm'+j" class="demand-foot">
                          {{ result?.stepMatrices[currentStepIndex]?.remainingDemand[j] }}
                        </td>
                        <td class="total-footer"></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
                
                <div class="total-value-under-matrix" :class="optimizationType === 'min' ? 'value-min' : 'value-max'">
                  <span class="value-label">{{ optimizationType === 'min' ? 'Costo Total' : 'Beneficio Total' }}</span>
                  <span class="value-number">{{ result?.totalValue.toLocaleString() }}</span>
                </div>
                
                <div v-if="result?.stepMatrices[currentStepIndex]?.mathDetails" class="math-info">
                  <strong>Operación:</strong> {{ result?.stepMatrices[currentStepIndex]?.mathDetails.operation }}
                  <div class="math-result">{{ result?.stepMatrices[currentStepIndex]?.mathDetails.result }}</div>
                </div>
              </div>

              <div class="half-section timeline-section">
                <div class="section-header">
                  <h3>Historial de Pasos</h3>
                </div>
                <div class="timeline-container">
                  <div 
                    v-for="(step, index) in result?.steps" 
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

    <!-- Modal de ayuda -->
    <Teleport to="body">
      <div v-if="showHelpModal" class="modal-overlay" @click.self="showHelpModal = false">
        <div class="help-modal">
          <div class="modal-header">
            <h2>Guía del Algoritmo de Transporte</h2>
            <button class="close-modal" @click="showHelpModal = false">✕</button>
          </div>
          <div class="modal-body">
            <div class="help-content-detailed">
              <div class="help-section">
                <h3>Minimización vs Maximización</h3>
                <ul>
                  <li><strong>Minimizar Costo:</strong> Usa el método de la Esquina Noroeste - comienza en la celda (0,0) y asigna sin considerar costos.</li>
                  <li><strong>Maximizar Beneficio:</strong> Usa el método de Máxima Contribución - elige la celda con mayor beneficio en cada paso.</li>
                </ul>
              </div>
              <div class="help-section">
                <h3>Pasos para usar</h3>
                <div class="steps-list">
                  <div class="step-detail"><div class="step-num">1</div><div class="step-text"><strong>Definir dimensiones:</strong> Establezca orígenes y destinos</div></div>
                  <div class="step-detail"><div class="step-num">2</div><div class="step-text"><strong>Completar matriz:</strong> Ingrese costos o beneficios</div></div>
                  <div class="step-detail"><div class="step-num">3</div><div class="step-text"><strong>Seleccionar objetivo:</strong> Minimizar o Maximizar</div></div>
                  <div class="step-detail"><div class="step-num">4</div><div class="step-text"><strong>Ejecutar:</strong> Presione el botón para calcular</div></div>
                </div>
              </div>
              <div class="help-note-box">
                <strong>Nota:</strong> Maximización usa el criterio de mayor beneficio primero, no la esquina noroeste.
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <input ref="importInputRef" type="file" accept=".json" class="hidden-input" @change="importData">
  </div>
</template>

<script setup>
import { computed, ref } from "vue";

const createMatrix = (rows, cols, fill = 0) =>
  Array.from({ length: rows }, () => Array.from({ length: cols }, () => fill));

const rowCount = ref(3);
const colCount = ref(4);
const autoBalance = ref(true);
const optimizationType = ref('min');
const isExecuting = ref(false);
const showResultModal = ref(false);
const costs = ref([
  [2, 3, 11, 7],
  [1, 0, 6, 1],
  [5, 8, 15, 9],
]);
const supply = ref([6, 1, 10]);
const demand = ref([7, 5, 3, 2]);
const result = ref(null);
const statusMessage = ref("");
const statusTone = ref("");
const showHelpModal = ref(false);
const importInputRef = ref(null);
const currentStepIndex = ref(0);
const exportFileName = ref("transporte");

const totalSupply = computed(() =>
  supply.value.reduce((sum, value) => sum + normalizeNumber(value), 0),
);
const totalDemand = computed(() =>
  demand.value.reduce((sum, value) => sum + normalizeNumber(value), 0),
);

function normalizeNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

function incrementRows() {
  if (rowCount.value < 10) {
    rowCount.value++;
    resizeTable();
  }
}

function decrementRows() {
  if (rowCount.value > 1) {
    rowCount.value--;
    resizeTable();
  }
}

function incrementCols() {
  if (colCount.value < 10) {
    colCount.value++;
    resizeTable();
  }
}

function decrementCols() {
  if (colCount.value > 1) {
    colCount.value--;
    resizeTable();
  }
}

function resizeTable() {
  const rows = rowCount.value;
  const cols = colCount.value;

  const nextCosts = createMatrix(rows, cols);
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      nextCosts[i][j] = normalizeNumber(costs.value[i]?.[j]);
    }
  }

  costs.value = nextCosts;
  supply.value = Array.from({ length: rows }, (_, i) => normalizeNumber(supply.value[i]));
  demand.value = Array.from({ length: cols }, (_, j) => normalizeNumber(demand.value[j]));
  result.value = null;
  currentStepIndex.value = 0;
  showStatus("Matriz actualizada", "success");
}

function loadExample() {
  rowCount.value = 3;
  colCount.value = 4;
  optimizationType.value = 'min';
  costs.value = [
    [2, 3, 11, 7],
    [1, 0, 6, 1],
    [5, 8, 15, 9],
  ];
  supply.value = [6, 1, 10];
  demand.value = [7, 5, 3, 2];
  result.value = null;
  currentStepIndex.value = 0;
  showStatus("Ejemplo cargado", "success");
}

function resetData() {
  costs.value = createMatrix(rowCount.value, colCount.value);
  supply.value = Array.from({ length: rowCount.value }, () => 0);
  demand.value = Array.from({ length: colCount.value }, () => 0);
  result.value = null;
  currentStepIndex.value = 0;
  showStatus("Datos reiniciados", "neutral");
}

function triggerImport() {
  importInputRef.value?.click();
}

function exportData() {
  const payload = {
    rowCount: rowCount.value,
    colCount: colCount.value,
    autoBalance: autoBalance.value,
    optimizationType: optimizationType.value,
    costs: costs.value,
    supply: supply.value,
    demand: demand.value,
    exportDate: new Date().toISOString(),
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  const fileName = exportFileName.value.trim() || "transporte";
  link.download = `${fileName}.json`;
  link.click();
  URL.revokeObjectURL(url);
  showStatus(`Datos exportados como ${fileName}.json`, "success");
}

async function importData(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  try {
    const text = await file.text();
    const parsed = JSON.parse(text);
    rowCount.value = Math.min(Math.max(parsed.rowCount, 1), 10);
    colCount.value = Math.min(Math.max(parsed.colCount, 1), 10);
    autoBalance.value = Boolean(parsed.autoBalance);
    optimizationType.value = parsed.optimizationType === 'max' ? 'max' : 'min';
    costs.value = parsed.costs || createMatrix(rowCount.value, colCount.value);
    supply.value = parsed.supply || Array(rowCount.value).fill(0);
    demand.value = parsed.demand || Array(colCount.value).fill(0);
    
    const baseName = file.name.replace('.json', '');
    exportFileName.value = baseName;
    
    result.value = null;
    showStatus("Datos importados", "success");
  } catch (error) {
    showStatus("Error al importar archivo", "error");
  } finally {
    event.target.value = "";
  }
}

function showStatus(msg, tone) {
  statusMessage.value = msg;
  statusTone.value = tone;
  setTimeout(() => {
    if (statusMessage.value === msg) {
      statusMessage.value = "";
    }
  }, 3000);
}

function previousStep() {
  if (currentStepIndex.value > 0) {
    currentStepIndex.value--;
  }
}

function nextStep() {
  if (result.value && currentStepIndex.value < result.value.stepMatrices.length - 1) {
    currentStepIndex.value++;
  }
}

function resetSteps() {
  currentStepIndex.value = 0;
}

function jumpToStep(index) {
  if (result.value && index >= 0 && index < result.value.stepMatrices.length) {
    currentStepIndex.value = index;
  }
}

function closeModal() {
  showResultModal.value = false;
}

async function runAlgorithm() {
  isExecuting.value = true;
  
  await new Promise(resolve => setTimeout(resolve, 100));

  const prepared = prepareProblem();
  if (!prepared.ok) {
    showStatus(prepared.message, "error");
    isExecuting.value = false;
    return;
  }

  const { balancedCosts, balancedSupply, balancedDemand, origins, destinations, notes } = prepared;

  const allocationMatrix = createMatrix(balancedSupply.length, balancedDemand.length);
  const steps = [...notes];
  const stepMatrices = [];
  const remainingSupply = [...balancedSupply];
  const remainingDemand = [...balancedDemand];
  
  if (optimizationType.value === 'min') {
    stepMatrices.push({
      allocation: allocationMatrix.map(row => [...row]),
      costs: balancedCosts.map(row => [...row]),
      remainingSupply: [...remainingSupply],
      remainingDemand: [...remainingDemand],
      description: "Estado inicial: Comenzamos el algoritmo desde la esquina superior izquierda",
      currentCell: null,
      mathDetails: null
    });

    let i = 0, j = 0;

    while (i < remainingSupply.length && j < remainingDemand.length) {
      const amount = Math.min(remainingSupply[i], remainingDemand[j]);
      allocationMatrix[i][j] = amount;

      const operation = `min(${remainingSupply[i]}, ${remainingDemand[j]}) = ${amount}`;
      const resultText = `Se asignan ${amount} unidades de ${origins[i]} a ${destinations[j]} (costo unitario: ${balancedCosts[i][j]})`;
      
      steps.push({
        title: `Asignar ${amount} unidades`,
        description: `${resultText}. Oferta restante: ${remainingSupply[i] - amount}, Demanda restante: ${remainingDemand[j] - amount}.`,
      });

      stepMatrices.push({
        allocation: allocationMatrix.map(row => [...row]),
        costs: balancedCosts.map(row => [...row]),
        remainingSupply: [...remainingSupply],
        remainingDemand: [...remainingDemand],
        description: `${resultText}. Se toma la cantidad mínima entre la oferta disponible y la demanda disponible.`,
        currentCell: { row: i, col: j },
        mathDetails: { operation, result: resultText }
      });

      remainingSupply[i] -= amount;
      remainingDemand[j] -= amount;

      if (remainingSupply[i] === 0 && remainingDemand[j] === 0) {
        i++;
        j++;
      } else if (remainingSupply[i] === 0) {
        i++;
      } else {
        j++;
      }
    }
  } else {
    stepMatrices.push({
      allocation: allocationMatrix.map(row => [...row]),
      costs: balancedCosts.map(row => [...row]),
      remainingSupply: [...remainingSupply],
      remainingDemand: [...remainingDemand],
      description: "Estado inicial: Comenzamos asignando en la celda con MAYOR beneficio",
      currentCell: null,
      mathDetails: null
    });

    let stepNumber = 1;
    
    while (true) {
      let supplyRemaining = false;
      let demandRemaining = false;
      
      for (let i = 0; i < remainingSupply.length; i++) {
        if (remainingSupply[i] > 0) supplyRemaining = true;
      }
      for (let j = 0; j < remainingDemand.length; j++) {
        if (remainingDemand[j] > 0) demandRemaining = true;
      }
      
      if (!supplyRemaining || !demandRemaining) break;
      
      let maxBenefit = -Infinity;
      let maxI = -1, maxJ = -1;
      
      for (let i = 0; i < remainingSupply.length; i++) {
        if (remainingSupply[i] === 0) continue;
        for (let j = 0; j < remainingDemand.length; j++) {
          if (remainingDemand[j] === 0) continue;
          if (balancedCosts[i][j] > maxBenefit) {
            maxBenefit = balancedCosts[i][j];
            maxI = i;
            maxJ = j;
          }
        }
      }
      
      if (maxI === -1) break;
      
      const amount = Math.min(remainingSupply[maxI], remainingDemand[maxJ]);
      allocationMatrix[maxI][maxJ] = amount;
      
      const operation = `min(${remainingSupply[maxI]}, ${remainingDemand[maxJ]}) = ${amount}`;
      const resultText = `Se asignan ${amount} unidades de ${origins[maxI]} a ${destinations[maxJ]} (beneficio unitario: ${maxBenefit})`;
      
      steps.push({
        title: `Paso ${stepNumber}: Asignar ${amount} unidades (máximo beneficio)`,
        description: `${resultText}. Oferta restante: ${remainingSupply[maxI] - amount}, Demanda restante: ${remainingDemand[maxJ] - amount}.`
      });
      
      stepMatrices.push({
        allocation: allocationMatrix.map(row => [...row]),
        costs: balancedCosts.map(row => [...row]),
        remainingSupply: [...remainingSupply],
        remainingDemand: [...remainingDemand],
        description: `${resultText}. Se selecciona la celda con mayor beneficio (${maxBenefit}) entre las disponibles.`,
        currentCell: { row: maxI, col: maxJ },
        mathDetails: { operation, result: resultText }
      });
      
      remainingSupply[maxI] -= amount;
      remainingDemand[maxJ] -= amount;
      stepNumber++;
    }
  }

  let totalValue = 0;
  for (let rowIndex = 0; rowIndex < allocationMatrix.length; rowIndex++) {
    for (let colIndex = 0; colIndex < allocationMatrix[rowIndex].length; colIndex++) {
      const alloc = allocationMatrix[rowIndex][colIndex];
      const value = balancedCosts[rowIndex][colIndex];
      totalValue += alloc * value;
    }
  }

  result.value = {
    origins,
    destinations,
    costMatrix: balancedCosts,
    allocationMatrix,
    totalValue,
    steps,
    stepMatrices,
  };
  
  currentStepIndex.value = 0;
  showResultModal.value = true;
  const typeText = optimizationType.value === 'min' ? 'costo' : 'beneficio';
  showStatus(`Solución calculada exitosamente (${typeText} total: ${totalValue})`, "success");
  isExecuting.value = false;
}

function prepareProblem() {
  const normalizedCosts = costs.value.map(row => row.map(v => normalizeNumber(v)));
  const normalizedSupply = supply.value.map(v => normalizeNumber(v));
  const normalizedDemand = demand.value.map(v => normalizeNumber(v));

  const supplyTotal = normalizedSupply.reduce((a, b) => a + b, 0);
  const demandTotal = normalizedDemand.reduce((a, b) => a + b, 0);

  if (supplyTotal === 0 || demandTotal === 0) {
    return { ok: false, message: "La oferta y demanda deben ser mayores que cero" };
  }

  const balancedCosts = normalizedCosts.map(row => [...row]);
  const balancedSupply = [...normalizedSupply];
  const balancedDemand = [...normalizedDemand];
  const origins = balancedSupply.map((_, i) => `O${i + 1}`);
  const destinations = balancedDemand.map((_, i) => `D${i + 1}`);
  const notes = [];

  if (supplyTotal !== demandTotal) {
    if (!autoBalance.value) {
      return { ok: false, message: "La oferta y demanda no coinciden. Activa el balanceo automático." };
    }

    if (supplyTotal < demandTotal) {
      const extra = demandTotal - supplyTotal;
      balancedSupply.push(extra);
      balancedCosts.push(Array(balancedDemand.length).fill(0));
      origins.push(`O${balancedSupply.length}`);
      notes.push({
        title: "Balanceo automático",
        description: `Se agregó origen ficticio con oferta ${extra} y costo 0`
      });
    } else {
      const extra = supplyTotal - demandTotal;
      balancedDemand.push(extra);
      balancedCosts.forEach(row => row.push(0));
      destinations.push(`D${balancedDemand.length}`);
      notes.push({
        title: "Balanceo automático",
        description: `Se agregó destino ficticio con demanda ${extra} y costo 0`
      });
    }
  }

  notes.unshift({
    title: "Problema balanceado",
    description: `Matriz de ${balancedSupply.length} × ${balancedDemand.length}`
  });

  return { ok: true, balancedCosts, balancedSupply, balancedDemand, origins, destinations, notes };
}
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.transport-page {
  min-height: 100vh;
  padding: 32px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
}

/* Hero Section - MISMO ESTILO QUE ASIGNACIÓN */
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
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-content p {
  color: #666;
  margin: 0;
}

.optimization-badge {
  padding: 12px 28px;
  border-radius: 40px;
  font-weight: bold;
  font-size: 1rem;
  color: white;
}

.badge-min {
  background: linear-gradient(135deg, #667eea, #764ba2);
}

.badge-max {
  background: linear-gradient(135deg, #f093fb, #f5576c);
}

/* Main Layout */
.main-layout {
  display: grid;
  grid-template-columns: 340px 1fr;
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

.dimension-controls {
  display: flex;
  gap: 16px;
}

.dimension-item {
  flex: 1;
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
  color: #667eea;
  transition: all 0.2s;
}

.num-btn:hover {
  background: #667eea;
  color: white;
  transform: scale(1.05);
}

.num-value {
  font-size: 1.2rem;
  font-weight: bold;
  min-width: 40px;
  text-align: center;
}

.optimization-toggle {
  display: flex;
  gap: 12px;
}

.toggle-btn {
  flex: 1;
  padding: 10px;
  border: 2px solid #e0e0e0;
  background: white;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
}

.toggle-btn.active {
  border-color: #667eea;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.balance-check {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  color: #555;
  font-size: 0.9rem;
}

.totals-display {
  display: flex;
  gap: 16px;
  padding: 16px;
  background: linear-gradient(135deg, #f5f7fa, #c3cfe2);
  border-radius: 16px;
}

.total-item {
  flex: 1;
  text-align: center;
}

.total-label {
  display: block;
  font-size: 0.75rem;
  color: #666;
  margin-bottom: 4px;
}

.total-value {
  display: block;
  font-size: 1.5rem;
  font-weight: bold;
}

.supply-total {
  color: #667eea;
}

.demand-total {
  color: #f093fb;
}

.action-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.btn-outline {
  flex: 1;
  min-width: 70px;
  padding: 8px 12px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 10px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s;
}

.btn-outline:hover {
  border-color: #667eea;
  background: #f5f7fa;
  transform: translateY(-2px);
}

.export-group {
  display: flex;
  flex: 1;
  gap: 4px;
}

.export-name-input {
  flex: 1;
  padding: 8px 10px;
  border: 1px solid #ddd;
  border-radius: 10px;
  font-size: 0.8rem;
  transition: all 0.2s;
  min-width: 80px;
}

.export-name-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.export-btn {
  flex-shrink: 0;
}

.btn-execute {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s;
}

.btn-execute:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
}

.btn-execute:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-help {
  width: 100%;
  padding: 10px;
  background: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  color: #667eea;
  transition: all 0.2s;
  margin-top: 8px;
}

.btn-help:hover {
  background: #667eea;
  color: white;
  border-color: #667eea;
  transform: translateY(-2px);
}

.execute-icon {
  font-size: 0.9rem;
}

.status-message {
  margin-top: 16px;
  padding: 10px;
  border-radius: 12px;
  text-align: center;
  font-size: 0.8rem;
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

/* Matrix Card */
.matrix-card {
  background: white;
  border-radius: 24px;
  padding: 24px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.matrix-header {
  margin-bottom: 20px;
}

.matrix-header h3 {
  margin: 0 0 4px 0;
  color: #333;
}

.matrix-hint {
  font-size: 0.8rem;
  color: #999;
}

.matrix-container {
  overflow-x: auto;
}

.beautiful-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.beautiful-table th,
.beautiful-table td {
  border: 1px solid #e0e0e0;
  padding: 12px;
  text-align: center;
}

.beautiful-table th {
  background: #f8f9fa;
  font-weight: 600;
}

.origin-badge, .dest-badge {
  font-weight: bold;
  color: #667eea;
}

.supply-badge {
  font-weight: bold;
  color: #f093fb;
}

.cost-input, .supply-input, .demand-input {
  width: 80px;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 8px;
  text-align: center;
  transition: all 0.2s;
}

.cost-input:focus, .supply-input:focus, .demand-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.total-footer {
  background: #f8f9fa;
  font-weight: bold;
  color: #667eea;
}

/* Modal */
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
  from { transform: translateY(50px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.modal-header {
  padding: 20px 24px;
  background: linear-gradient(135deg, #667eea, #764ba2);
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
  background: #667eea;
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #5a67d8;
  transform: translateY(-2px);
}

.steps-navigation {
  background: #f8f9fa;
  border-radius: 16px;
  padding: 12px 16px;
}

.step-progress {
  height: 6px;
  background: #e0e0e0;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 12px;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  transition: width 0.3s ease;
}

.nav-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.nav-btn {
  padding: 6px 14px;
  border: none;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.85rem;
  transition: all 0.2s;
}

.nav-btn:hover:not(:disabled) {
  background: #667eea;
  color: white;
  transform: translateY(-2px);
}

.nav-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.reset-btn {
  background: #f0f0f0;
}

.step-indicator {
  font-size: 0.9rem;
  font-weight: bold;
}

.step-current {
  color: #667eea;
  font-size: 1.1rem;
}

.step-total {
  color: #999;
}

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

.matrix-section {
  border-right: 1px solid #e0e0e0;
  padding-right: 20px;
}

.matrix-wrapper {
  overflow-x: auto;
  flex: 1;
}

.solution-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.8rem;
}

.solution-table th,
.solution-table td {
  border: 1px solid #e0e0e0;
  padding: 6px;
  text-align: center;
}

.solution-table th {
  background: #f8f9fa;
  font-weight: 600;
}

.origin-col {
  font-weight: bold;
  color: #667eea;
  background: #f8f9fa;
}

.table-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.alloc-value {
  font-weight: bold;
  font-size: 0.9rem;
}

.cost-value {
  font-size: 0.65rem;
  color: #999;
}

.allocated {
  background: linear-gradient(135deg, #d4fc79, #96e6a1);
}

.current-highlight {
  background: linear-gradient(135deg, #ffe259, #ffa751);
  animation: pulse 0.5s ease;
  position: relative;
}

.current-highlight::before {
  content: '⭐';
  position: absolute;
  top: -8px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 10px;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
}

.remaining-value, .demand-foot {
  font-weight: bold;
  background: #f8f9fa;
}

.total-value-under-matrix {
  padding: 12px;
  border-radius: 12px;
  text-align: center;
  margin-top: 8px;
}

.value-min {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.value-max {
  background: linear-gradient(135deg, #f093fb, #f5576c);
  color: white;
}

.value-label {
  display: block;
  font-size: 0.75rem;
  opacity: 0.9;
  margin-bottom: 4px;
}

.value-number {
  display: block;
  font-size: 1.5rem;
  font-weight: bold;
}

.math-info {
  padding: 8px;
  background: linear-gradient(135deg, #f5f7fa, #c3cfe2);
  border-radius: 8px;
  font-size: 0.75rem;
}

.math-result {
  margin-top: 4px;
  font-weight: bold;
  color: #667eea;
}

.timeline-section {
  padding-left: 20px;
}

.timeline-container {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 450px;
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
  border-left: 3px solid #667eea;
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
  background: linear-gradient(135deg, #667eea, #764ba2);
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
  from { transform: translateY(-50px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.help-content-detailed {
  padding: 8px;
}

.help-section {
  margin-bottom: 24px;
}

.help-section h3 {
  color: #667eea;
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
  background: linear-gradient(135deg, #667eea, #764ba2);
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

.hidden-input {
  display: none;
}

@keyframes slideIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
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
  }
  .matrix-section {
    border-right: none;
    padding-right: 0;
  }
  .timeline-section {
    padding-left: 0;
  }
}

@media (max-width: 768px) {
  .transport-page {
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
  .export-group {
    flex-direction: column;
  }
  .export-name-input {
    width: 100%;
  }
}
</style>