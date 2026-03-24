<template>
  <div class="asignacion-wrapper">
    <div class="asignacion-header">
      <h2>🎯 Algoritmo de Asignación (Método Húngaro)</h2>
      <p>Optimización de asignación de tareas - Minimización de costos / Maximización de beneficios</p>
    </div>

    <div class="asignacion-layout">
      <div class="control-section">
        <div class="config-group">
          <label>Tipo de problema:</label>
          <div class="type-toggle">
            <button 
              @click="problemType = 'min'" 
              :class="{ active: problemType === 'min' }"
              class="min-btn"
            >
              📉 Minimizar Costos
            </button>
            <button 
              @click="problemType = 'max'" 
              :class="{ active: problemType === 'max' }"
              class="max-btn"
            >
              📈 Maximizar Beneficios
            </button>
          </div>
        </div>

        <div class="config-group">
          <label>Tamaño de la matriz:</label>
          <div class="size-buttons">
            <button 
              v-for="n in [2, 3, 4, 5]" 
              :key="n"
              @click="setMatrixSize(n)"
              :class="{ active: matrixSize === n }"
            >
              {{ n }}x{{ n }}
            </button>
          </div>
        </div>

        <div class="matrix-input-group">
          <label>Matriz de {{ problemType === 'min' ? 'costos' : 'beneficios' }}:</label>
          <div class="matrix-scroll">
            <table class="editable-matrix">
              <thead>
                <tr>
                  <th></th>
                  <th v-for="j in matrixSize" :key="'col' + j">Tarea {{ j }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="i in matrixSize" :key="'row' + i">
                  <th>Agente {{ i }}</th>
                  <td v-for="j in matrixSize" :key="'cell' + i + j">
                    <input 
                      type="number" 
                      v-model.number="matrix[i-1][j-1]"
                      @change="resetAlgorithm"
                      class="matrix-cell"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <button @click="runHungarian" class="execute-btn" :disabled="running">
          {{ running ? '⚙️ Calculando...' : '🚀 Ejecutar Algoritmo' }}
        </button>
        
        <button @click="loadExample" class="example-btn">
          📋 Cargar Ejemplo
        </button>
      </div>

      <div class="results-section">
        <div v-if="steps.length > 0" class="steps-view">
          <h3>📋 Proceso del Algoritmo Húngaro</h3>
          
          <div class="steps-timeline">
            <div v-for="(step, idx) in steps" :key="idx" class="step-item">
              <div class="step-indicator">
                <div class="step-number">{{ idx + 1 }}</div>
                <div class="step-line" v-if="idx < steps.length - 1"></div>
              </div>
              <div class="step-card">
                <div class="step-title">{{ step.title }}</div>
                <div class="step-desc">{{ step.description }}</div>
                
                <div v-if="step.matrix" class="step-matrix-container">
                  <table class="step-matrix">
                    <thead>
                      <tr>
                        <th></th>
                        <th v-for="j in matrixSize" :key="'step-col' + j">T{{ j }}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(row, i) in step.matrix" :key="'step-row' + i">
                        <th>A{{ i+1 }}</th>
                        <td v-for="(cell, j) in row" :key="'step-cell' + i + j" 
                            :class="{
                              'selected-cell': step.selection && step.selection.some(s => s.row === i && s.col === j)
                            }">
                          {{ cell }}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <div v-if="result" class="final-result">
            <div class="result-header" :class="problemType === 'min' ? 'min-result' : 'max-result'">
              <span class="result-icon">{{ problemType === 'min' ? '📉' : '📈' }}</span>
              <span>{{ problemType === 'min' ? 'Costo Mínimo Total' : 'Beneficio Máximo Total' }}</span>
              <span class="result-value">{{ result.totalValue }}</span>
            </div>
            
            <div class="assignments-list">
              <h4>Asignaciones Óptimas:</h4>
              <div class="assignment-grid">
                <div v-for="(assignment, idx) in result.assignments" :key="idx" class="assignment-item">
                  <span class="assignment-agent">Agente {{ assignment.agent }}</span>
                  <span class="assignment-arrow">→</span>
                  <span class="assignment-task">Tarea {{ assignment.task }}</span>
                  <span class="assignment-value">{{ assignment.value }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="empty-state">
          <div class="empty-icon">🎯</div>
          <h3>Listo para ejecutar</h3>
          <p>Configura la matriz y haz clic en "Ejecutar Algoritmo"</p>
          <p class="example-hint">💡 Prueba con el ejemplo: Agente 1: 10, 15, 8 | Agente 2: 12, 9, 14 | Agente 3: 11, 13, 10</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const matrixSize = ref(3);
const problemType = ref('min');
const running = ref(false);
const steps = ref([]);
const result = ref(null);

// Matriz inicial con valores de ejemplo funcionales
const matrix = ref([
  [10, 15, 8],
  [12, 9, 14],
  [11, 13, 10]
]);

const setMatrixSize = (size) => {
  matrixSize.value = size;
  const newMatrix = Array(size).fill().map(() => Array(size).fill(0));
  
  for (let i = 0; i < Math.min(size, matrix.value.length); i++) {
    for (let j = 0; j < Math.min(size, matrix.value[i].length); j++) {
      newMatrix[i][j] = matrix.value[i][j];
    }
  }
  
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      if (newMatrix[i][j] === 0) {
        newMatrix[i][j] = Math.floor(Math.random() * 15) + 5;
      }
    }
  }
  
  matrix.value = newMatrix;
  resetAlgorithm();
};

const resetAlgorithm = () => {
  steps.value = [];
  result.value = null;
};

const loadExample = () => {
  if (matrixSize.value === 3) {
    matrix.value = [
      [10, 15, 8],
      [12, 9, 14],
      [11, 13, 10]
    ];
  } else if (matrixSize.value === 4) {
    matrix.value = [
      [12, 8, 14, 10],
      [9, 11, 13, 15],
      [14, 10, 12, 8],
      [11, 13, 9, 14]
    ];
  }
  resetAlgorithm();
};

const runHungarian = async () => {
  running.value = true;
  steps.value = [];
  
  try {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    let currentMatrix = matrix.value.map(row => [...row]);
    
    steps.value.push({
      title: 'Matriz Original',
      description: `Matriz de ${problemType.value === 'min' ? 'costos' : 'beneficios'} inicial`,
      matrix: currentMatrix.map(row => [...row])
    });
    
    // Si es maximización, convertir a minimización
    if (problemType.value === 'max') {
      const maxVal = Math.max(...currentMatrix.flat());
      currentMatrix = currentMatrix.map(row => 
        row.map(cell => maxVal - cell)
      );
      steps.value.push({
        title: 'Conversión a Minimización',
        description: `Para maximizar, convertimos la matriz restando cada valor del máximo (${maxVal})`,
        matrix: currentMatrix.map(row => [...row])
      });
    }
    
    // Reducción por filas
    const rowMins = currentMatrix.map(row => Math.min(...row));
    currentMatrix = currentMatrix.map((row, i) => 
      row.map(cell => cell - rowMins[i])
    );
    steps.value.push({
      title: 'Reducción por Filas',
      description: `Restamos el mínimo de cada fila: [${rowMins.join(', ')}]`,
      matrix: currentMatrix.map(row => [...row])
    });
    
    // Reducción por columnas
    const colMins = [];
    for (let j = 0; j < matrixSize.value; j++) {
      let minCol = Infinity;
      for (let i = 0; i < matrixSize.value; i++) {
        minCol = Math.min(minCol, currentMatrix[i][j]);
      }
      colMins.push(minCol);
    }
    currentMatrix = currentMatrix.map(row => 
      row.map((cell, j) => cell - colMins[j])
    );
    steps.value.push({
      title: 'Reducción por Columnas',
      description: `Restamos el mínimo de cada columna: [${colMins.join(', ')}]`,
      matrix: currentMatrix.map(row => [...row])
    });
    
    // Encontrar asignación óptima usando el algoritmo húngaro
    const assignment = hungarianAlgorithm(currentMatrix);
    
    // Calcular valor total original
    let totalValue = 0;
    const assignments = [];
    for (let i = 0; i < assignment.length; i++) {
      const row = i;
      const col = assignment[i];
      const originalValue = matrix.value[row][col];
      totalValue += originalValue;
      assignments.push({
        agent: row + 1,
        task: col + 1,
        value: originalValue
      });
    }
    
    steps.value.push({
      title: 'Asignación Óptima',
      description: `Se encontró la asignación óptima con ${problemType.value === 'min' ? 'costo mínimo' : 'beneficio máximo'}`,
      matrix: currentMatrix.map(row => [...row]),
      selection: assignments.map(a => ({ row: a.agent - 1, col: a.task - 1 }))
    });
    
    result.value = {
      assignments,
      totalValue
    };
    
  } catch (error) {
    console.error('Error:', error);
    steps.value.push({
      title: 'Error',
      description: 'No se pudo completar el algoritmo. Verifica que todos los valores sean números positivos.'
    });
  } finally {
    running.value = false;
  }
};

// Implementación mejorada del algoritmo húngaro
const hungarianAlgorithm = (costMatrix) => {
  const n = costMatrix.length;
  const u = Array(n + 1).fill(0);
  const v = Array(n + 1).fill(0);
  const p = Array(n + 1).fill(0);
  const way = Array(n + 1).fill(0);
  
  for (let i = 1; i <= n; i++) {
    p[0] = i;
    let j0 = 0;
    const minv = Array(n + 1).fill(Infinity);
    const used = Array(n + 1).fill(false);
    
    do {
      used[j0] = true;
      const i0 = p[j0];
      let delta = Infinity;
      let j1 = 0;
      
      for (let j = 1; j <= n; j++) {
        if (!used[j]) {
          const cur = costMatrix[i0 - 1][j - 1] - u[i0] - v[j];
          if (cur < minv[j]) {
            minv[j] = cur;
            way[j] = j0;
          }
          if (minv[j] < delta) {
            delta = minv[j];
            j1 = j;
          }
        }
      }
      
      for (let j = 0; j <= n; j++) {
        if (used[j]) {
          u[p[j]] += delta;
          v[j] -= delta;
        } else {
          minv[j] -= delta;
        }
      }
      j0 = j1;
    } while (p[j0] !== 0);
    
    do {
      const j1 = way[j0];
      p[j0] = p[j1];
      j0 = j1;
    } while (j0 !== 0);
  }
  
  const assignment = Array(n).fill(-1);
  for (let j = 1; j <= n; j++) {
    if (p[j] !== 0) {
      assignment[p[j] - 1] = j - 1;
    }
  }
  
  return assignment;
};
</script>

<style scoped>
.asignacion-wrapper {
  width: 100%;
  min-height: 600px;
  background: white;
}

.asignacion-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 24px;
  text-align: center;
  color: white;
}

.asignacion-header h2 {
  margin: 0 0 8px 0;
  font-size: 1.5rem;
}

.asignacion-header p {
  margin: 0;
  opacity: 0.9;
  font-size: 0.9rem;
}

.asignacion-layout {
  display: flex;
  gap: 24px;
  padding: 24px;
}

.control-section {
  width: 380px;
  flex-shrink: 0;
  background: #f8fafc;
  border-radius: 16px;
  padding: 20px;
}

.config-group {
  margin-bottom: 24px;
}

.config-group label {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  color: #475569;
  margin-bottom: 8px;
}

.type-toggle {
  display: flex;
  gap: 12px;
}

.type-toggle button {
  flex: 1;
  padding: 10px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.type-toggle button:hover {
  transform: translateY(-1px);
}

.min-btn.active {
  background: #10b981;
  border-color: #10b981;
  color: white;
}

.max-btn.active {
  background: #ef4444;
  border-color: #ef4444;
  color: white;
}

.size-buttons {
  display: flex;
  gap: 8px;
}

.size-buttons button {
  flex: 1;
  padding: 8px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.size-buttons button.active {
  background: #3b82f6;
  border-color: #3b82f6;
  color: white;
}

.matrix-input-group {
  margin-bottom: 16px;
}

.matrix-scroll {
  overflow-x: auto;
}

.editable-matrix {
  border-collapse: collapse;
  width: 100%;
  background: white;
  border-radius: 8px;
  overflow: hidden;
}

.editable-matrix th,
.editable-matrix td {
  border: 1px solid #e2e8f0;
  padding: 8px;
  text-align: center;
}

.editable-matrix th {
  background: #f1f5f9;
  font-weight: 600;
}

.matrix-cell {
  width: 60px;
  padding: 6px;
  text-align: center;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
}

.execute-btn {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 12px;
}

.execute-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.example-btn {
  width: 100%;
  padding: 12px;
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.example-btn:hover {
  background: #e2e8f0;
}

.results-section {
  flex: 1;
  background: #f8fafc;
  border-radius: 16px;
  padding: 20px;
  overflow-y: auto;
  max-height: 600px;
}

.steps-view h3 {
  margin: 0 0 20px 0;
  color: #1e293b;
}

.steps-timeline {
  position: relative;
}

.step-item {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.step-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 40px;
}

.step-number {
  width: 32px;
  height: 32px;
  background: #3b82f6;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  z-index: 1;
}

.step-line {
  width: 2px;
  flex: 1;
  background: #cbd5e1;
  margin: 8px 0;
}

.step-card {
  flex: 1;
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.step-title {
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 8px;
}

.step-desc {
  font-size: 0.85rem;
  color: #64748b;
  margin-bottom: 12px;
}

.step-matrix-container {
  overflow-x: auto;
}

.step-matrix {
  border-collapse: collapse;
  font-size: 12px;
}

.step-matrix th,
.step-matrix td {
  border: 1px solid #e2e8f0;
  padding: 6px 8px;
  text-align: center;
  min-width: 40px;
}

.selected-cell {
  background: #fde047;
  font-weight: bold;
}

.final-result {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 2px solid #e2e8f0;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 20px;
  font-weight: bold;
}

.min-result {
  background: #dcfce7;
  color: #166534;
}

.max-result {
  background: #fee2e2;
  color: #991b1b;
}

.result-value {
  font-size: 1.5rem;
  font-weight: bold;
}

.assignments-list h4 {
  margin: 0 0 12px 0;
  color: #475569;
}

.assignment-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.assignment-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.assignment-agent {
  font-weight: 600;
  color: #3b82f6;
}

.assignment-arrow {
  color: #94a3b8;
}

.assignment-task {
  font-weight: 600;
  color: #f59e0b;
}

.assignment-value {
  margin-left: auto;
  font-weight: bold;
  padding: 2px 8px;
  border-radius: 12px;
  background: #f1f5f9;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #64748b;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 16px;
}

.example-hint {
  margin-top: 16px;
  font-size: 0.8rem;
  background: #e2e8f0;
  padding: 8px;
  border-radius: 8px;
}

@media (max-width: 768px) {
  .asignacion-layout {
    flex-direction: column;
  }
  
  .control-section {
    width: 100%;
  }
}
</style>