<script setup>
import { RouterView } from "vue-router";
import Header from "./components/layout/Header.vue";
</script>

<template>
  <div class="app-layout">
    <Header />

    <main>
      <RouterView />
    </main>
  </div>
</template>

<style>
/* Quitamos los márgenes por defecto del body para que el header toque los bordes */
body {
  margin: 0;
  padding: 0;
  font-family: sans-serif;
}
</style>
