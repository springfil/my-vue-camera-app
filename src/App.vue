<script setup>
import CameraApp from './components/CameraApp.vue'
</script>

<template>
  <div class="header">
    <h1>Vue Camera App</h1>
  </div>
  <CameraApp />
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}

.header {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

h1 {
  color: #42b983;
  text-align: center;
}
</style>
