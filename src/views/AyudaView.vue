<template>
  <div class="help-page">
    <section class="hero">
      <div class="hero-copy">
        <span class="eyebrow">Centro de ayuda</span>
        <h1>Guia de uso de la plataforma</h1>
        <p>
          Esta pagina web permite aprender, construir y analizar grafos de forma
          visual. Aqui puedes revisar que hace cada modulo y como aprovechar las
          herramientas disponibles.
        </p>
      </div>
    </section>

    <section class="help-grid">
      <article class="help-card">
        <h2>Inicio</h2>
        <p>
          Es la puerta principal de la plataforma. Presenta el proyecto y te da
          acceso rapido para comenzar a experimentar con los algoritmos.
        </p>
      </article>

      <article class="help-card">
        <h2>Algoritmo</h2>
        <p>
          Reune los modulos de trabajo para resolver problemas con grafos. Desde
          aqui puedes entrar a las vistas donde se calculan recorridos,
          asignaciones y otros analisis visuales.
        </p>
      </article>

      <article class="help-card">
        <h2>Crea tu Grafo</h2>
        <p>
          Es el editor interactivo. Permite dibujar nodos y aristas, moverlos,
          borrar elementos y construir el grafo base que luego usan los demas
          modulos.
        </p>
      </article>

      <article class="help-card">
        <h2>Acerca de</h2>
        <p>
          Muestra informacion general del proyecto, la materia y el equipo de
          trabajo que desarrollo la aplicacion.
        </p>
      </article>
    </section>

    <section class="detail-section">
      <div class="section-heading">
        <h2>Herramientas principales</h2>
        <p>
          Estas son las acciones que mas se usan dentro del editor de grafos y
          los modulos conectados a el.
        </p>
      </div>

      <div class="feature-list">
        <article class="feature-item">
          <h3>Mover</h3>
          <p>Sirve para reposicionar nodos y acomodar el grafo en pantalla.</p>
        </article>

        <article class="feature-item">
          <h3>Nodo</h3>
          <p>
            Crea nuevos nodos. Al insertarlos, la aplicacion puede solicitar un
            nombre para identificarlos mejor.
          </p>
        </article>

        <article class="feature-item">
          <h3>Arista</h3>
          <p>
            Conecta nodos y asigna pesos para representar costos, distancias o
            relaciones entre ellos.
          </p>
        </article>

        <article class="feature-item">
          <h3>Borrar</h3>
          <p>Elimina nodos o aristas que ya no forman parte del grafo.</p>
        </article>

        <article class="feature-item">
          <h3>Exportar e importar</h3>
          <p>
            Permiten guardar el trabajo en un archivo y volver a cargarlo mas
            tarde para seguir editando.
          </p>
        </article>

        <article class="feature-item">
          <h3>Limpiar grafo</h3>
          <p>
            Reinicia por completo el dibujo actual para comenzar otro ejemplo
            desde cero.
          </p>
        </article>
      </div>
    </section>

    <section class="detail-section">
      <div class="section-heading">
        <h2>Que puedes hacer en la web</h2>
        <p>
          La aplicacion esta pensada para practicar de forma visual y entender
          mejor los resultados de cada algoritmo.
        </p>
      </div>

      <div class="workflow">
        <article class="workflow-step">
          <span class="step-number">1</span>
          <div>
            <h3>Construir el grafo</h3>
            <p>
              Dibuja nodos y conexiones en el editor para representar tu problema.
            </p>
          </div>
        </article>

        <article class="workflow-step">
          <span class="step-number">2</span>
          <div>
            <h3>Asignar pesos</h3>
            <p>
              Define los valores en las aristas para modelar costos, tiempos o
              distancias.
            </p>
          </div>
        </article>

        <article class="workflow-step">
          <span class="step-number">3</span>
          <div>
            <h3>Aplicar el modulo correspondiente</h3>
            <p>
              Usa la vista de algoritmo o asignacion segun el tipo de analisis que
              necesites realizar.
            </p>
          </div>
        </article>

        <article class="workflow-step">
          <span class="step-number">4</span>
          <div>
            <h3>Interpretar el resultado</h3>
            <p>
              Observa la ruta, la matriz o la solucion destacada directamente sobre
              el grafo y valida tu ejercicio.
            </p>
          </div>
        </article>
      </div>
    </section>

    <section class="detail-section faq">
      <div class="section-heading">
        <h2>Recomendaciones de uso</h2>
      </div>

      <ul class="tips-list">
        <li>Nombra los nodos de forma clara para identificar mejor cada proceso.</li>
        <li>Verifica la direccion de las aristas antes de ejecutar un algoritmo.</li>
        <li>Usa exportar para guardar ejemplos o ejercicios ya terminados.</li>
        <li>Si una matriz no se genera, revisa que el grafo tenga la estructura esperada.</li>
        <li>Organiza visualmente el grafo para que los resultados se lean con facilidad.</li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
.help-page {
  min-height: 100vh;
  padding: 3rem 1.5rem 4rem;
  background:
    radial-gradient(circle at top, rgba(102, 126, 234, 0.12), transparent 35%),
    linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%);
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
.workflow-step,
.faq {
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 20px;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.06);
}

.help-card {
  padding: 1.4rem;
}

.help-card h2,
.section-heading h2,
.feature-item h3,
.workflow-step h3 {
  margin-top: 0;
}

.help-card p,
.feature-item p,
.workflow-step p,
.section-heading p,
.tips-list li {
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

.faq {
  padding: 1.5rem;
}

.tips-list {
  margin: 0;
  padding-left: 1.2rem;
}

.tips-list li + li {
  margin-top: 0.75rem;
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
