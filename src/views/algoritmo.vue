<script setup>
// Aquí iría la lógica JavaScript si la necesitaras en el futuro
</script>

<template>
  <div class="inicio-page">
    <header class="hero">
      <h1>Introducción al Pensamiento Algorítmico</h1>
      <p>
        Aprende cómo las instrucciones paso a paso dominan el mundo de la
        tecnología.
      </p>
    </header>

    <div class="container">
      <section id="definicion">
        <h2>¿Qué es un Algoritmo?</h2>
        <p>
          Un algoritmo no es más que una
          <strong>secuencia ordenada y finita de instrucciones</strong> que se
          siguen para resolver un problema o realizar una tarea. No es magia, es
          lógica pura.
        </p>
        <br />
        <p>Todo algoritmo debe tener tres partes fundamentales:</p>
        <ul class="lista-partes">
          <li><strong>Entrada (Input):</strong> Los datos que recibe.</li>
          <li>
            <strong>Proceso:</strong> Los pasos lógicos para transformar esos
            datos.
          </li>
          <li><strong>Salida (Output):</strong> El resultado final.</li>
        </ul>
      </section>

      <section id="ejemplos">
        <h2>Ejemplos Prácticos</h2>
        <div class="examples-grid">
          <article class="card">
            <h3>1. La Vida Real: Una Receta</h3>
            <p>Imagina que quieres hacer un café. El algoritmo sería:</p>
            <ol class="lista-receta">
              <li>Hervir agua.</li>
              <li>Poner café en la taza.</li>
              <li>Verter el agua caliente.</li>
              <li>Añadir azúcar (si/no).</li>
              <li>Mezclar.</li>
            </ol>
            <p class="nota">
              <em
                >Si te saltas un paso (como hervir el agua), el resultado
                falla.</em
              >
            </p>
          </article>

          <article class="card">
            <h3>2. En Código: Sumar Números</h3>
            <p>
              Así se ve un algoritmo simple para sumar dos números en
              pseudocódigo:
            </p>
            <div class="code-block">
              INICIO<br />
              &nbsp;&nbsp;Leer numero_A<br />
              &nbsp;&nbsp;Leer numero_B<br />
              &nbsp;&nbsp;resultado = numero_A + numero_B<br />
              &nbsp;&nbsp;Mostrar resultado<br />
              FIN
            </div>
          </article>
        </div>
      </section>

      <section id="videos">
        <h2>Aprende con Videos</h2>
        <p class="video-intro">
          Aquí tienes dos recursos excelentes para entender el concepto
          visualmente:
        </p>

        <h3>¿Qué es un algoritmo? (Explicación Simple)</h3>
        <div class="video-container">
          <iframe
            src="https://www.youtube.com/embed/YWWwrcpv9qg"
            title="Qué es un algoritmo"
            frameborder="0"
            allow="
              accelerometer;
              autoplay;
              clipboard-write;
              encrypted-media;
              gyroscope;
              picture-in-picture;
            "
            allowfullscreen
          ></iframe>
        </div>

        <h3>Algortimos y Pensamiento</h3>
        <div class="video-container">
          <iframe
            src="https://www.youtube.com/embed/eAWXty3XXxE"
            title="Algoritmos y Pensamiento"
            frameborder="0"
            allow="
              accelerometer;
              autoplay;
              clipboard-write;
              encrypted-media;
              gyroscope;
              picture-in-picture;
            "
            allowfullscreen
          ></iframe>
        </div>
      </section>
    </div>

    <footer>
      <p>&copy; 2026 Clase de Fundamentos de Programación.</p>
    </footer>
  </div>
</template>

<style scoped>
/* --- VARIABLES Y RESET --- */
:root {
  --primary: #2563eb;
  --secondary: #1e293b;
  --text-light: #f8fafc;
  --text-dark: #334155;
  --bg-light: #f1f5f9;
}

.inicio-page {
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  line-height: 1.6;
  color: #334155;
  background-color: #f1f5f9;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* --- HEADER / HERO --- */
.hero {
  background: linear-gradient(135deg, #1e293b, #2563eb);
  color: #f8fafc;
  padding: 3rem 1.5rem; /* Menos padding en móviles */
  text-align: center;
}

.hero h1 {
  font-size: 2rem; /* Fuente base más pequeña para móvil */
  margin-bottom: 1rem;
  line-height: 1.2;
}

.hero p {
  font-size: 1rem;
  opacity: 0.9;
  max-width: 600px;
  margin: 0 auto;
}

/* --- CONTENEDOR PRINCIPAL --- */
.container {
  width: 100%; /* Ocupa todo el ancho disponible */
  max-width: 1000px; /* Pero no te pases de 1000px */
  margin: 0 auto;
  padding: 1.5rem; /* Espacio a los lados */
  flex: 1; /* Empuja el footer hacia abajo si hay poco contenido */
}

/* --- SECCIONES --- */
section {
  margin-bottom: 2rem;
  background: white;
  padding: 1.5rem; /* Padding interno más cómodo */
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  overflow: hidden; /* Evita que contenido grande rompa el diseño */
}

h2 {
  color: #2563eb;
  border-bottom: 2px solid #2563eb;
  padding-bottom: 0.5rem;
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
}

/* --- LISTAS Y TEXTO --- */
.lista-partes,
.lista-receta {
  margin-left: 1.2rem; /* Menos sangría para aprovechar espacio */
  margin-top: 10px;
}

.nota {
  margin-top: 10px;
  font-size: 0.9rem;
  color: #64748b;
}

/* --- GRID RESPONSIVO (La magia ocurre aquí) --- */
.examples-grid {
  display: grid;
  /* Esto crea columnas automáticas. Si la pantalla es menor a 280px, se pone en 1 columna */
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.card {
  background: #f8fafc;
  padding: 1.25rem;
  border-radius: 8px;
  border-left: 5px solid #2563eb;
  border: 1px solid #e2e8f0; /* Borde sutil */
  border-left-width: 5px; /* Mantenemos el borde grueso a la izquierda */
}

/* BLOQUE DE CÓDIGO (Para que no rompa el móvil) */
.code-block {
  background: #1e293b;
  color: #50fa7b;
  padding: 1rem;
  border-radius: 6px;
  font-family: "Courier New", Courier, monospace;
  font-size: 0.85rem; /* Letra un poco más pequeña */
  overflow-x: auto; /* IMPORTANTE: Permite scroll horizontal si el código es largo */
  margin-top: 1rem;
  white-space: pre; /* Mantiene el formato del código */
}

/* --- VIDEOS (Responsive 16:9) --- */
.video-intro {
  margin-bottom: 1.5rem;
}

.video-container {
  position: relative;
  padding-bottom: 56.25%; /* Ratio 16:9 perfecto */
  height: 0;
  overflow: hidden;
  margin-bottom: 2rem;
  border-radius: 8px;
  background: #000; /* Fondo negro mientras carga */
}

.video-container iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

footer {
  text-align: center;
  padding: 1.5rem;
  background-color: #1e293b;
  color: #f8fafc;
  margin-top: auto;
  font-size: 0.9rem;
}

/* --- MEDIA QUERIES (Ajustes finos para pantallas grandes) --- */
@media (min-width: 768px) {
  /* Cuando la pantalla es de PC o Tablet grande: */
  .hero {
    padding: 4rem 2rem;
  }
  .hero h1 {
    font-size: 3rem;
  }
  .container {
    padding: 2rem;
  }
  section {
    padding: 2.5rem;
    margin-bottom: 4rem;
  }
  h2 {
    font-size: 2rem;
  }
}
</style>
