<template>
  <footer>
    <div class="container">
      <BackgroundParticles />

      <div class="footer-grid">
        <!-- Sobre la empresa -->
        <div class="footer-col">
          <h3>TINW</h3>
          <p>
            Somos tu aliado en desarrollo web, proyectos digitales y soluciones
            tecnológicas. Creamos experiencias digitales únicas y ofrecemos
            soporte integral para impulsar tu negocio en el mundo digital.
          </p>
          <p><em>Innovación y tecnología a tu alcance</em></p>
        </div>

        <!-- Contacto -->
        <div class="footer-col">
          <h3>Contacto</h3>
          <ul>
            <li>
              <i class="fas fa-map-marker-alt"></i> {{ contactInfo.location }}
            </li>
            <li><i class="fas fa-phone"></i> {{ contactInfo.phone }}</li>
            <li><i class="fas fa-envelope"></i> {{ contactInfo.email }}</li>
            <li>
              <i class="fab fa-whatsapp"></i>
              <a :href="contactInfo.whatsappLink" target="_blank"
                >Chat WhatsApp</a
              >
            </li>
            <li><strong>Horario:</strong> {{ contactInfo.schedule }}</li>
          </ul>
        </div>

        <!-- Redes Sociales -->
        <div class="footer-col">
          <h3>Síguenos</h3>
          <p>Mantente actualizado con nuestras innovaciones</p>
          <div class="social-links">
            <a
              v-for="social in socialLinks"
              :key="social.name"
              :href="social.url"
              :aria-label="social.name"
            >
              <i :class="social.icon"></i>
            </a>
          </div>
        </div>
      </div>

      <div class="footer-bottom">
        <p>&copy; {{ currentYear }} TINW. Todos los derechos reservados.</p>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  name: "Footer",

  data() {
    return {
      currentYear: new Date().getFullYear(),
      contactInfo: {
        location: "La Paz, Bolivia",
        phone: "+591 70000000",
        email: "contacto@tinw.com",
        whatsappLink: "https://wa.me/59170000000",
        schedule: "Lunes - Viernes, 9:00 - 18:00",
      },
      socialLinks: [
        { name: "Facebook", icon: "fab fa-facebook-f", url: "#" },
        { name: "Instagram", icon: "fab fa-instagram", url: "#" },
        { name: "LinkedIn", icon: "fab fa-linkedin-in", url: "#" },
        { name: "Twitter", icon: "fab fa-twitter", url: "#" },
        { name: "YouTube", icon: "fab fa-youtube", url: "#" },
      ],
    };
  },
};
</script>
