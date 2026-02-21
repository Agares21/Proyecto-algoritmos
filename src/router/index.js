// src/router/index.js
import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/Homeview.vue";
import EditorView from "../views/Editorview.vue";
import algoritmo from "@/views/algoritmo.vue";
import acercaview from "@/views/acercaview.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
    },
    {
      path: "/editor",
      name: "editor",
      component: EditorView,
    },
    {
      path: "/algoritmo",
      name: "/algortimo",
      component: algoritmo,
    },

    {
      path: "/acerca",
      name: "/acerca",
      component: acercaview,
    },
  ],
});

export default router;
