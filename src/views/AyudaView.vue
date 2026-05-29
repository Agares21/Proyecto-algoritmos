<template>
  <div class="help-page">
    <section class="hero">
      <div class="hero-copy">
        <span class="eyebrow">Centro de ayuda</span>
        <h1>Guía de uso de la plataforma</h1>
        <p>
          Esta plataforma permite visualizar y optimizar la distribución de recursos
          desde el Gobierno Central de Bolivia hacia las gobernaciones departamentales.
        </p>
      </div>
    </section>

    <section class="help-grid">
      <article class="help-card">
        <h2>Introducción</h2>
        <p>
          La página de inicio presenta el contexto del problema: distribución de recursos
          desde La Paz (Gobierno Central) a los 9 departamentos de Bolivia.
        </p>
      </article>

      <article class="help-card">
        <h2>Editor de Grafos</h2>
        <p>
          Permite dibujar nodos (departamentos) y aristas (rutas) con sus respectivos
          costos o recursos. Puedes mover nodos, agregar nuevos y editar pesos.
        </p>
      </article>

      <article class="help-card">
        <h2>Algoritmo de Dijkstra</h2>
        <p>
          Encuentra la ruta más económica desde el Gobierno Central (La Paz) hasta
          cualquier gobernación, minimizando el costo total de transporte.
        </p>
      </article>

      <article class="help-card">
        <h2>Algoritmo de Kruskal</h2>
        <p>
          Construye la red de distribución más eficiente que conecte todas las
          gobernaciones con el mínimo costo total de infraestructura.
        </p>
      </article>
    </section>

    <section class="detail-section">
      <div class="section-heading">
        <h2>Herramientas principales</h2>
        <p>
          Estas son las acciones que más se usan dentro del editor de grafos:
        </p>
      </div>

      <div class="feature-list">
        <article class="feature-item">
          <h3>Mover</h3>
          <p>Reubica los departamentos en el mapa para una mejor visualización.</p>
        </article>

        <article class="feature-item">
          <h3>Nodo</h3>
          <p>Crea nuevos departamentos o puntos de distribución.</p>
        </article>

        <article class="feature-item">
          <h3>Arista</h3>
          <p>Conecta departamentos y asigna un costo o recurso a cada ruta.</p>
        </article>

        <article class="feature-item">
          <h3>Borrar</h3>
          <p>Elimina departamentos o rutas que ya no son necesarios.</p>
        </article>

        <article class="feature-item">
          <h3>Exportar e importar</h3>
          <p>Guarda tu trabajo en un archivo JSON y vuelve a cargarlo después.</p>
        </article>
      </div>
    </section>

    <section class="detail-section">
      <div class="section-heading">
        <h2>Flujo de trabajo</h2>
        <p>Pasos recomendados para utilizar la plataforma:</p>
      </div>

      <div class="workflow">
        <article class="workflow-step">
          <span class="step-number">1</span>
          <div>
            <h3>Conocer el contexto</h3>
            <p>Lee la introducción para entender el problema de distribución.</p>
          </div>
        </article>

        <article class="workflow-step">
          <span class="step-number">2</span>
          <div>
            <h3>Dibujar el grafo</h3>
            <p>En el editor, coloca los departamentos y las rutas con sus costos.</p>
          </div>
        </article>

        <article class="workflow-step">
          <span class="step-number">3</span>
          <div>
            <h3>Ejecutar Dijkstra</h3>
            <p>Encuentra la ruta más económica desde La Paz a cualquier destino.</p>
          </div>
        </article>

        <article class="workflow-step">
          <span class="step-number">4</span>
          <div>
            <h3>Ejecutar Kruskal</h3>
            <p>Construye la red de distribución óptima para todo el país.</p>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>

<style scoped>
.help-page {
  min-height: 100vh;
  padding: 3rem 1.5rem 4rem;
  background: linear-gradient(135deg, #f8fafc, #eef2ff);
  color: #1e293b;
}

.hero {
  max-width: 1100px;
  margin: 0 auto 2rem;
}

.hero-copy {
  background: rgba(255, 255, 255, 0.88);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 24px;
  padding: 2rem;
  box-shadow: 0 18px 45px rgba(15, 23, 42, 0.08);
}

.eyebrow {
  display: inline-block;
  margin-bottom: 0.75rem;
  padding: 0.35rem 0.8rem;
  border-radius: 999px;
  background: rgba(66, 184, 131, 0.12);
  color: #15803d;
  font-weight: 700;
  font-size: 0.85rem;
}

.hero h1 {
  margin: 0 0 1rem;
  font-size: clamp(2rem, 3vw, 3.2rem);
}

.hero p {
  margin: 0;
  max-width: 760px;
  line-height: 1.7;
  color: #475569;
  font-size: 1.05rem;
}

.help-grid,
.feature-list {
  max-width: 1100px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.2rem;
}

.help-card,
.feature-item,
.workflow-step {
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 20px;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.06);
}

.help-card {
  padding: 1.4rem;
}

.help-card h2 {
  margin-top: 0;
}

.help-card p {
  color: #475569;
  line-height: 1.65;
}

.detail-section {
  max-width: 1100px;
  margin: 2rem auto 0;
}

.section-heading {
  margin-bottom: 1.2rem;
}

.section-heading h2 {
  margin-bottom: 0.5rem;
  font-size: 1.9rem;
}

.feature-item {
  padding: 1.35rem;
}

.workflow {
  display: grid;
  gap: 1rem;
}

.workflow-step {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 1rem;
  align-items: start;
  padding: 1.35rem;
}

.step-number {
  width: 2.1rem;
  height: 2.1rem;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
}

.workflow-step h3 {
  margin-top: 0;
}

.workflow-step p {
  color: #475569;
  line-height: 1.65;
}

@media (max-width: 768px) {
  .help-page {
    padding: 1.5rem 1rem 3rem;
  }

  .hero-copy {
    padding: 1.5rem;
  }
}
</style>