<template>
  <div class="card">
    <h2>Vue.js Camera App</h2>
    <p class="api-info">Фотографии хранятся на локальном мок-сервере</p>
    
    <div class="app-container">
      <CameraView
        @photo-captured="onPhotoCaptured"
        :errorMessageCallback="setErrorMessage"
      />
      
      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
      <p v-if="statusMessage" class="status-message">{{ statusMessage }}</p>
      
      <button type="button" @click="refreshGallery" class="refresh-button" :disabled="isLoading">
        <span class="button-icon">🔄</span> {{ isLoading ? 'Загрузка...' : 'Обновить галерею' }}
      </button>
      
      <PhotoGallery
        ref="gallery"
        :errorMessageCallback="setErrorMessage"
        :statusMessageCallback="setStatusMessage"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import CameraView from './CameraView.vue';
import PhotoGallery from './PhotoGallery.vue';

// Состояние компонента
const errorMessage = ref('');
const statusMessage = ref('');
const gallery = ref(null);
const isLoading = ref(false);

// Установка сообщений
function setErrorMessage(message) {
  errorMessage.value = message;
  // Автоматическое очищение сообщения об ошибке через некоторое время
  if (message) {
    setTimeout(() => {
      errorMessage.value = '';
    }, 5000);
  }
}

function setStatusMessage(message) {
  statusMessage.value = message;
}

// Обработчик события захвата фотографии
async function onPhotoCaptured(photo) {
  if (gallery.value) {
    await gallery.value.addPhoto(photo);
  }
}

// Обновление галереи
async function refreshGallery() {
  if (gallery.value) {
    isLoading.value = true;
    await gallery.value.loadPhotos();
    isLoading.value = false;
  }
}
</script>

<style scoped>
.card {
  padding: 20px;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

h2 {
  margin-bottom: 8px;
  color: #42b983;
}

.api-info {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 15px;
}

.app-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.error-message {
  color: #ff4d4f;
  margin: 10px 0;
}

.status-message {
  color: #1890ff;
  margin: 10px 0;
  font-weight: bold;
}

.refresh-button {
  margin: 15px 0;
  padding: 8px 16px;
  background-color: #673ab7;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.refresh-button:hover {
  background-color: #5e35b1;
}

.refresh-button:disabled {
  background-color: #9e9e9e;
  cursor: not-allowed;
}

.button-icon {
  margin-right: 8px;
}
</style>
