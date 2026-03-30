import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/Homeview.vue";
import EditorView from "../views/Editorview.vue";
import AlgoritmoView from "@/views/algoritmo.vue";
import AcercaView from "@/views/acercaview.vue";

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
      name: "algoritmo",
      component: AlgoritmoView,
    },
    {
      path: "/acerca",
      name: "acerca",
      component: AcercaView,
    },
  ],
});

export default router;