<template>
  <div class="northwest-page">
    <section class="hero-card">
      <div>
        <p class="eyebrow">Metodo de transporte</p>
        <h2>Algoritmo de la Esquina Noroeste</h2>
        <p class="hero-copy">
          Genera una solucion inicial factible a partir de una matriz de costos, oferta y demanda.
        </p>
      </div>
      <div class="hero-badges">
        <span class="badge">{{ rowCount }} origenes</span>
        <span class="badge">{{ colCount }} destinos</span>
      </div>
    </section>

    <div class="northwest-layout">
      <section class="panel controls-panel">
        <h3>Configuracion</h3>

        <div class="field-grid">
          <label class="field">
            <span>Origenes</span>
            <input v-model.number="rowCount" type="number" min="1" max="10" />
          </label>

          <label class="field">
            <span>Destinos</span>
            <input v-model.number="colCount" type="number" min="1" max="10" />
          </label>
        </div>

        <div class="actions">
          <button class="btn btn-primary" @click="resizeTable">Actualizar matriz</button>
          <button class="btn btn-secondary" @click="loadExample">Cargar ejemplo</button>
          <button class="btn btn-ghost" @click="resetData">Limpiar</button>
        </div>

        <label class="checkbox-row">
          <input v-model="autoBalance" type="checkbox" />
          <span>Balancear automaticamente si oferta y demanda no coinciden</span>
        </label>

        <div class="totals-card">
          <div>
            <span class="totals-label">Oferta total</span>
            <strong>{{ totalSupply }}</strong>
          </div>
          <div>
            <span class="totals-label">Demanda total</span>
            <strong>{{ totalDemand }}</strong>
          </div>
        </div>

        <button class="btn btn-accent" @click="runNorthwest">
          Ejecutar esquina noroeste
        </button>

        <p v-if="statusMessage" class="status" :class="statusTone">
          {{ statusMessage }}
        </p>
      </section>

      <section class="panel matrix-panel">
        <div class="panel-header">
          <h3>Matriz de costos</h3>
          <p>Llena los costos unitarios, la oferta por origen y la demanda por destino.</p>
        </div>

        <div class="table-wrapper">
          <table class="matrix-table editable">
            <thead>
              <tr>
                <th></th>
                <th v-for="(_, colIndex) in costs[0]" :key="'head-' + colIndex">
                  D{{ colIndex + 1 }}
                </th>
                <th>Oferta</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, rowIndex) in costs" :key="'row-' + rowIndex">
                <th>O{{ rowIndex + 1 }}</th>
                <td v-for="(_, colIndex) in row" :key="'cell-' + rowIndex + '-' + colIndex">
                  <input
                    v-model.number="costs[rowIndex][colIndex]"
                    type="number"
                    min="0"
                    class="table-input"
                  />
                </td>
                <td>
                  <input
                    v-model.number="supply[rowIndex]"
                    type="number"
                    min="0"
                    class="table-input supply-input"
                  />
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <th>Demanda</th>
                <td v-for="(_, colIndex) in costs[0]" :key="'demand-' + colIndex">
                  <input
                    v-model.number="demand[colIndex]"
                    type="number"
                    min="0"
                    class="table-input demand-input"
                  />
                </td>
                <td class="total-cell">{{ totalDemand }}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>
    </div>

    <section v-if="result" class="panel result-panel">
      <div class="result-header">
        <div>
          <h3>Solucion inicial</h3>
          <p>
            Se asignaron unidades siguiendo la regla de la esquina noroeste,
            avanzando por filas y columnas segun se agotaba oferta o demanda.
          </p>
        </div>
        <div class="cost-card">
          <span>Costo total</span>
          <strong>{{ result.totalCost }}</strong>
        </div>
      </div>

      <div class="result-grid">
        <div class="table-wrapper">
          <table class="matrix-table">
            <thead>
              <tr>
                <th></th>
                <th v-for="destination in result.destinations" :key="destination">
                  {{ destination }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, rowIndex) in result.allocationMatrix" :key="'alloc-' + rowIndex">
                <th>{{ result.origins[rowIndex] }}</th>
                <td
                  v-for="(cell, colIndex) in row"
                  :key="'alloc-cell-' + rowIndex + '-' + colIndex"
                  :class="{ allocated: cell > 0 }"
                >
                  <span class="allocation">{{ cell }}</span>
                  <small class="unit-cost">c={{ result.costMatrix[rowIndex][colIndex] }}</small>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="steps-card">
          <h4>Pasos</h4>
          <div v-for="(step, index) in result.steps" :key="'step-' + index" class="step-item">
            <span class="step-index">{{ index + 1 }}</span>
            <div>
              <p class="step-title">{{ step.title }}</p>
              <p class="step-copy">{{ step.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";

const createMatrix = (rows, cols, fill = 0) =>
  Array.from({ length: rows }, () => Array.from({ length: cols }, () => fill));

const rowCount = ref(3);
const colCount = ref(4);
const autoBalance = ref(true);
const costs = ref([
  [2, 3, 11, 7],
  [1, 0, 6, 1],
  [5, 8, 15, 9],
]);
const supply = ref([6, 1, 10]);
const demand = ref([7, 5, 3, 2]);
const result = ref(null);
const statusMessage = ref("");
const statusTone = ref("neutral");

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

function resizeTable() {
  const rows = Math.min(Math.max(normalizeNumber(rowCount.value), 1), 10);
  const cols = Math.min(Math.max(normalizeNumber(colCount.value), 1), 10);

  rowCount.value = rows;
  colCount.value = cols;

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
  statusMessage.value = "Matriz actualizada.";
  statusTone.value = "neutral";
}

function loadExample() {
  rowCount.value = 3;
  colCount.value = 4;
  costs.value = [
    [2, 3, 11, 7],
    [1, 0, 6, 1],
    [5, 8, 15, 9],
  ];
  supply.value = [6, 1, 10];
  demand.value = [7, 5, 3, 2];
  result.value = null;
  statusMessage.value = "Ejemplo cargado.";
  statusTone.value = "success";
}

function resetData() {
  costs.value = createMatrix(rowCount.value, colCount.value);
  supply.value = Array.from({ length: rowCount.value }, () => 0);
  demand.value = Array.from({ length: colCount.value }, () => 0);
  result.value = null;
  statusMessage.value = "Datos reiniciados.";
  statusTone.value = "neutral";
}

function runNorthwest() {
  const prepared = prepareProblem();
  if (!prepared.ok) {
    statusMessage.value = prepared.message;
    statusTone.value = "error";
    result.value = null;
    return;
  }

  const { balancedCosts, balancedSupply, balancedDemand, origins, destinations, notes } =
    prepared;

  const allocationMatrix = createMatrix(balancedSupply.length, balancedDemand.length);
  const steps = [...notes];
  const remainingSupply = [...balancedSupply];
  const remainingDemand = [...balancedDemand];

  let i = 0;
  let j = 0;

  while (i < remainingSupply.length && j < remainingDemand.length) {
    const amount = Math.min(remainingSupply[i], remainingDemand[j]);
    allocationMatrix[i][j] = amount;

    steps.push({
      title: `Asignar ${amount} a ${origins[i]} -> ${destinations[j]}`,
      description: `Se toma la celda superior izquierda disponible. Oferta restante: ${
        remainingSupply[i] - amount
      }, demanda restante: ${remainingDemand[j] - amount}.`,
    });

    remainingSupply[i] -= amount;
    remainingDemand[j] -= amount;

    const supplyExhausted = remainingSupply[i] === 0;
    const demandExhausted = remainingDemand[j] === 0;

    if (supplyExhausted && demandExhausted) {
      i += 1;
      j += 1;
    } else if (supplyExhausted) {
      i += 1;
    } else {
      j += 1;
    }
  }

  const totalCost = allocationMatrix.reduce(
    (sum, row, rowIndex) =>
      sum +
      row.reduce(
        (rowSum, allocation, colIndex) =>
          rowSum + allocation * balancedCosts[rowIndex][colIndex],
        0,
      ),
    0,
  );

  result.value = {
    origins,
    destinations,
    costMatrix: balancedCosts,
    allocationMatrix,
    totalCost,
    steps,
  };
  statusMessage.value = "Solucion inicial calculada correctamente.";
  statusTone.value = "success";
}

function prepareProblem() {
  resizeTable();

  const normalizedCosts = costs.value.map((row) => row.map((value) => normalizeNumber(value)));
  const normalizedSupply = supply.value.map((value) => normalizeNumber(value));
  const normalizedDemand = demand.value.map((value) => normalizeNumber(value));

  const supplyTotal = normalizedSupply.reduce((sum, value) => sum + value, 0);
  const demandTotal = normalizedDemand.reduce((sum, value) => sum + value, 0);

  if (supplyTotal === 0 || demandTotal === 0) {
    return {
      ok: false,
      message: "La oferta total y la demanda total deben ser mayores que cero.",
    };
  }

  const balancedCosts = normalizedCosts.map((row) => [...row]);
  const balancedSupply = [...normalizedSupply];
  const balancedDemand = [...normalizedDemand];
  const origins = balancedSupply.map((_, index) => `O${index + 1}`);
  const destinations = balancedDemand.map((_, index) => `D${index + 1}`);
  const notes = [];

  if (supplyTotal !== demandTotal) {
    if (!autoBalance.value) {
      return {
        ok: false,
        message: "La oferta total debe coincidir con la demanda total, o activa el balanceo automatico.",
      };
    }

    if (supplyTotal < demandTotal) {
      const extra = demandTotal - supplyTotal;
      balancedSupply.push(extra);
      balancedCosts.push(Array.from({ length: balancedDemand.length }, () => 0));
      origins.push(`O${balancedSupply.length}`);
      notes.push({
        title: "Balanceo automatico",
        description: `Se agrego un origen ficticio con oferta ${extra} y costo 0 para equilibrar el problema.`,
      });
    } else {
      const extra = supplyTotal - demandTotal;
      balancedDemand.push(extra);
      balancedCosts.forEach((row) => row.push(0));
      destinations.push(`D${balancedDemand.length}`);
      notes.push({
        title: "Balanceo automatico",
        description: `Se agrego un destino ficticio con demanda ${extra} y costo 0 para equilibrar el problema.`,
      });
    }
  }

  notes.unshift({
    title: "Datos listos",
    description: `Se trabajara con una matriz de ${balancedSupply.length} x ${balancedDemand.length}.`,
  });

  return {
    ok: true,
    balancedCosts,
    balancedSupply,
    balancedDemand,
    origins,
    destinations,
    notes,
  };
}
</script>

<style scoped>
.northwest-page {
  min-height: 100%;
  padding: 24px;
  background:
    radial-gradient(circle at top left, rgba(45, 212, 191, 0.25), transparent 32%),
    linear-gradient(180deg, #ecfeff 0%, #f8fafc 55%, #f0fdfa 100%);
  color: #0f172a;
}

.hero-card,
.panel {
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(148, 163, 184, 0.25);
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.08);
  backdrop-filter: blur(10px);
}

.hero-card {
  border-radius: 28px;
  padding: 28px;
  display: flex;
  justify-content: space-between;
  gap: 20px;
  align-items: center;
  margin-bottom: 24px;
}

.eyebrow {
  margin: 0 0 8px;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  font-size: 0.74rem;
  font-weight: 700;
  color: #0f766e;
}

.hero-card h2 {
  margin: 0 0 10px;
  font-size: 2rem;
}

.hero-copy {
  margin: 0;
  color: #475569;
  max-width: 620px;
}

.hero-badges {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.badge {
  padding: 10px 14px;
  border-radius: 999px;
  background: #ccfbf1;
  color: #115e59;
  font-weight: 700;
}

.northwest-layout {
  display: grid;
  grid-template-columns: 340px minmax(0, 1fr);
  gap: 24px;
}

.panel {
  border-radius: 24px;
  padding: 24px;
}

.controls-panel h3,
.matrix-panel h3,
.result-panel h3 {
  margin: 0 0 16px;
  font-size: 1.15rem;
}

.field-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 0.9rem;
  color: #334155;
}

.field input,
.table-input {
  width: 100%;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  padding: 10px 12px;
  background: #fff;
  color: #0f172a;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 16px;
}

.btn {
  border: none;
  border-radius: 14px;
  padding: 12px 16px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.btn:hover {
  transform: translateY(-1px);
}

.btn-primary {
  background: linear-gradient(135deg, #14b8a6, #0f766e);
  color: #f8fafc;
  box-shadow: 0 10px 24px rgba(15, 118, 110, 0.2);
}

.btn-secondary {
  background: #e2e8f0;
  color: #0f172a;
}

.btn-ghost {
  background: #f8fafc;
  color: #475569;
  border: 1px solid #cbd5e1;
}

.btn-accent {
  width: 100%;
  margin-top: 10px;
  background: linear-gradient(135deg, #0f172a, #164e63);
  color: #f8fafc;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.2);
}

.checkbox-row {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  font-size: 0.9rem;
  color: #475569;
  margin-bottom: 16px;
}

.totals-card {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  padding: 14px;
}

.totals-label {
  display: block;
  font-size: 0.78rem;
  color: #64748b;
  margin-bottom: 4px;
}

.status {
  margin: 14px 0 0;
  padding: 12px 14px;
  border-radius: 14px;
  font-size: 0.9rem;
}

.status.success {
  background: #dcfce7;
  color: #166534;
}

.status.error {
  background: #fee2e2;
  color: #991b1b;
}

.status.neutral {
  background: #e0f2fe;
  color: #0c4a6e;
}

.panel-header p,
.result-header p {
  margin: 0;
  color: #64748b;
}

.table-wrapper {
  overflow-x: auto;
}

.matrix-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 640px;
}

.matrix-table th,
.matrix-table td {
  border: 1px solid #dbe4ee;
  padding: 10px;
  text-align: center;
}

.matrix-table th {
  background: #f8fafc;
  color: #334155;
}

.editable .matrix-table td,
.editable td {
  background: #ffffff;
}

.table-input {
  min-width: 76px;
  text-align: center;
}

.total-cell {
  font-weight: 700;
  background: #ecfeff;
  color: #115e59;
}

.result-panel {
  margin-top: 24px;
}

.result-header {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  align-items: flex-start;
  margin-bottom: 20px;
}

.cost-card {
  min-width: 160px;
  padding: 16px 18px;
  border-radius: 18px;
  background: linear-gradient(135deg, #ccfbf1, #99f6e4);
  color: #134e4a;
}

.cost-card span {
  display: block;
  font-size: 0.82rem;
  margin-bottom: 6px;
}

.cost-card strong {
  font-size: 1.5rem;
}

.result-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(280px, 1fr);
  gap: 20px;
}

.allocated {
  background: #ccfbf1;
}

.allocation {
  display: block;
  font-weight: 700;
  color: #115e59;
}

.unit-cost {
  color: #64748b;
}

.steps-card {
  border: 1px solid #dbe4ee;
  border-radius: 20px;
  padding: 18px;
  background: #f8fafc;
}

.steps-card h4 {
  margin: 0 0 14px;
  font-size: 1rem;
}

.step-item {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.step-item + .step-item {
  margin-top: 14px;
}

.step-index {
  width: 28px;
  height: 28px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #0f766e;
  color: white;
  font-size: 0.78rem;
  font-weight: 700;
  flex-shrink: 0;
}

.step-title {
  margin: 0 0 4px;
  font-weight: 700;
  color: #0f172a;
}

.step-copy {
  margin: 0;
  color: #64748b;
  font-size: 0.9rem;
}

@media (max-width: 1100px) {
  .northwest-layout,
  .result-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 700px) {
  .northwest-page {
    padding: 16px;
  }

  .hero-card,
  .panel {
    padding: 18px;
    border-radius: 20px;
  }

  .hero-card,
  .result-header {
    flex-direction: column;
  }

  .field-grid,
  .totals-card {
    grid-template-columns: 1fr;
  }
}
</style>
