<template>
  <div class="home-container">
    <header class="hero">
      <div class="logo-wrapper">
        <div class="main-logo">
          <img
            src="/img/ucb.png"
            alt="Logo Análisis de Algoritmos"
            class="logo-image"
          />
        </div>
        <h1>Análisis de Algoritmos</h1>
        <p class="subtitle">
          Visualiza, aprende y experimenta con grafos en tiempo real
        </p>
      </div>

      <router-link to="/algoritmo" class="cta-button">
        Comenzar Experimentación
      </router-link>
    </header>
  </div>
</template>

<style scoped>
.home-container {
  font-family: "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

.hero {
  background: radial-gradient(circle at center, #764ba2 0%, #667eea 100%);
  color: white;
  min-height: 100vh; /* Pantalla completa */
  padding: 20px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.logo-wrapper {
  margin-bottom: 40px;
}

/* --- CAMBIOS AQUÍ --- */

/* 1. El contenedor circular */
.main-logo {
  /* CAMBIO CLAVE: Ponemos un fondo oscuro y semi-transparente */
  /* Esto hará que tu logo BLANCO resalte */
  background: rgba(0, 0, 0, 0.4);

  width: 180px; /* Lo hice un poco más grande (antes 160px) */
  height: 180px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 25px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  /* Un pequeño relleno para que el logo no toque los bordes exactos */
  padding: 15px;
}

/* 2. Tu imagen PNG blanca */
.logo-image {
  /* CAMBIO CLAVE: Hacemos que ocupe todo el espacio disponible del círculo */
  width: 100%;
  height: 100%;
  /* 'contain' asegura que se vea toda la imagen sin cortarse */
  object-fit: contain;
}

/* -------------------- */

.hero h1 {
  margin: 0;
  font-size: 3.5rem;
  letter-spacing: -1px;
  font-weight: 800;
}

.subtitle {
  font-size: 1.4rem;
  opacity: 0.9;
  margin-top: 10px;
}

.cta-button {
  background: #00cec9;
  color: white;
  padding: 18px 40px;
  text-decoration: none;
  font-weight: bold;
  font-size: 1.1rem;
  border-radius: 50px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  margin-top: 30px; /* Un poco más de espacio arriba del botón */
  display: inline-block; /* Asegura que el padding funcione bien */
}

.cta-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
  background: #01b8b4;
}
</style>
