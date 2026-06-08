<script setup>
const equipo = [
  { id: 1, nombre: "Natalia Novillo"},
  { id: 2, nombre: "Luzmila Mamani",},
  { id: 3, nombre: "Alejandro Arce" },
  { id: 5, nombre: "Sergio Trigo"},
];

const datosProyecto = [
  { etiqueta: "Materia", valor: "Análisis de Algoritmos" },
  { etiqueta: "Semestre", valor: "1-2026" },
  { etiqueta: "Enfoque", valor: "Visualización y práctica interactiva" },
];

const caracteristicas = [
  "Editor visual para construir grafos.",
  "Módulos para rutas, árboles, transporte, asignación y ordenamiento.",
  "Resultados representados de forma gráfica para facilitar el análisis.",
];
</script>

<template>
  <main class="acerca-page">
    <section class="hero-section">
      <span class="eyebrow">Proyecto académico</span>
      <h1>Acerca de la plataforma</h1>
      <p>
        Esta aplicación fue desarrollada para apoyar el aprendizaje de Análisis
        de Algoritmos mediante herramientas visuales, ejercicios interactivos y
        resultados fáciles de interpretar.
      </p>
    </section>

    <section class="project-panel">
      <div class="panel-copy">
        <h2>¿Qué buscamos?</h2>
        <p>
          Convertir conceptos abstractos en experiencias prácticas: construir un
          grafo, ejecutar un algoritmo, observar el resultado y comprender el
          proceso detrás de la solución.
        </p>
      </div>

      <div class="data-grid">
        <article
          v-for="dato in datosProyecto"
          :key="dato.etiqueta"
          class="data-card"
        >
          <span>{{ dato.etiqueta }}</span>
          <strong>{{ dato.valor }}</strong>
        </article>
      </div>
    </section>

    <section class="content-grid">
      <article class="info-block">
        <h2>Características</h2>
        <ul>
          <li v-for="item in caracteristicas" :key="item">{{ item }}</li>
        </ul>
      </article>

      <article class="info-block">
        <h2>Herramientas usadas</h2>
        <div class="tag-list">
          <span>Vue</span>
          <span>Vite</span>
          <span>JavaScript</span>
          <span>CSS</span>
          <span>Grafos</span>
        </div>
      </article>
    </section>

    <section class="team-section">
      <div class="section-heading">
        <span class="eyebrow">Nuestro equipo</span>
        <h2>Integrantes</h2>
      </div>

      <div class="team-grid">
        <article
          v-for="miembro in equipo"
          :key="miembro.id"
          class="profile-card"
        >
          <div class="avatar" aria-hidden="true">{{ miembro.iniciales }}</div>
          <h3>{{ miembro.nombre }}</h3>
          <p>Desarrollo y documentación del proyecto</p>
        </article>
      </div>
    </section>
  </main>
</template>

<style scoped>
.acerca-page {
  min-height: 100vh;
  padding: 3rem 1.5rem 4rem;
  background:
    radial-gradient(circle at top left, rgba(66, 184, 131, 0.16), transparent 32%),
    linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%);
  color: #1e293b;
}

.hero-section,
.project-panel,
.content-grid,
.team-section {
  max-width: 1100px;
  margin: 0 auto;
}

.hero-section {
  padding: 2.5rem 0 2rem;
}

.eyebrow {
  display: inline-flex;
  margin-bottom: 0.8rem;
  padding: 0.35rem 0.8rem;
  border-radius: 999px;
  background: rgba(66, 184, 131, 0.14);
  color: #15803d;
  font-size: 0.85rem;
  font-weight: 800;
  text-transform: uppercase;
}

.hero-section h1 {
  max-width: 780px;
  margin: 0 0 1rem;
  font-size: clamp(2.2rem, 5vw, 4.4rem);
  line-height: 1.05;
}

.hero-section p,
.panel-copy p,
.profile-card p,
.info-block li {
  color: #475569;
  line-height: 1.7;
}

.hero-section p {
  max-width: 760px;
  margin: 0;
  font-size: 1.1rem;
}

.project-panel {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(280px, 420px);
  gap: 1.5rem;
  align-items: stretch;
  margin-top: 1rem;
}

.panel-copy,
.data-card,
.info-block,
.profile-card {
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 8px;
  box-shadow: 0 14px 35px rgba(15, 23, 42, 0.07);
}

.panel-copy {
  padding: 1.8rem;
}

.panel-copy h2,
.info-block h2,
.section-heading h2 {
  margin: 0 0 0.8rem;
}

.panel-copy p {
  margin: 0;
}

.data-grid {
  display: grid;
  gap: 0.9rem;
}

.data-card {
  padding: 1.2rem;
}

.data-card span {
  display: block;
  margin-bottom: 0.35rem;
  color: #64748b;
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
}

.data-card strong {
  font-size: 1.05rem;
}

.content-grid {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 1.5rem;
  margin-top: 1.5rem;
}

.info-block {
  padding: 1.6rem;
}

.info-block ul {
  margin: 0;
  padding-left: 1.2rem;
}

.info-block li + li {
  margin-top: 0.65rem;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.7rem;
}

.tag-list span {
  padding: 0.55rem 0.8rem;
  border: 1px solid rgba(37, 99, 235, 0.18);
  border-radius: 999px;
  background: #eff6ff;
  color: #1d4ed8;
  font-weight: 700;
}

.team-section {
  margin-top: 2.5rem;
}

.section-heading {
  margin-bottom: 1.2rem;
}

.section-heading h2 {
  font-size: 2rem;
}

.team-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: 1rem;
}

.profile-card {
  padding: 1.4rem;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.profile-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.1);
}

.avatar {
  width: 3.4rem;
  height: 3.4rem;
  margin-bottom: 1rem;
  border-radius: 50%;
  background: linear-gradient(135deg, #1e293b, #2563eb);
  color: white;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  letter-spacing: 0;
}

.profile-card h3 {
  margin: 0 0 0.45rem;
  font-size: 1.15rem;
}

.profile-card p {
  margin: 0;
  font-size: 0.95rem;
}

@media (max-width: 820px) {
  .acerca-page {
    padding: 2rem 1rem 3rem;
  }

  .project-panel,
  .content-grid {
    grid-template-columns: 1fr;
  }
}
</style>
