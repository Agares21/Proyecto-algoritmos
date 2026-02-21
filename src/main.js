import { createApp } from "vue";
import App from "./App.vue";

// CORRECCIÓN: Agregamos '/index.js' al final para obligarlo a encontrar el archivo
import router from "./router/index.js";

const app = createApp(App);

app.use(router);

app.mount("#app");
