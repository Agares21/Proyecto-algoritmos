import { createRouter, createWebHistory } from "vue-router";
import EditorView from "../views/Editorview.vue";
import IntroduccionView from "../views/IntroduccionView.vue";
import AcercaView from "../views/acercaview.vue";
import AyudaView from "../views/AyudaView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: IntroduccionView,
    },
    {
      path: "/introduccion",
      name: "introduccion",
      component: IntroduccionView,
    },
    {
      path: "/editor",
      name: "editor",
      component: EditorView,
    },
    {
      path: "/ayuda",
      name: "ayuda",
      component: AyudaView,
    },
    {
      path: "/acerca",
      name: "acerca",
      component: AcercaView,
    },
  ],
});

export default router;