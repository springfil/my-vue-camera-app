<template>
  <div class="card">
    <h2>Vue.js Camera App</h2>
    <p class="api-info">Медиа файлы хранятся на локальном мок-сервере</p>
    
    <div class="app-container">
      <CameraView
        @photo-captured="onPhotoCaptured"
        @video-captured="onVideoCaptured"
        :errorMessageCallback="setErrorMessage"
      />
      
      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
      <p v-if="statusMessage" class="status-message">{{ statusMessage }}</p>
      
      <div class="tabs">
        <button 
          class="tab-button" 
          :class="{ active: activeTab === 'photos' }" 
          @click="activeTab = 'photos'"
        >
          <span class="tab-icon">📷</span> Фотографии
        </button>
        <button 
          class="tab-button" 
          :class="{ active: activeTab === 'videos' }" 
          @click="activeTab = 'videos'"
        >
          <span class="tab-icon">🎬</span> Видеозаписи
        </button>
      </div>
      
      <button type="button" @click="refreshGallery" class="refresh-button" :disabled="isLoading">
        <span class="button-icon">🔄</span> {{ isLoading ? 'Загрузка...' : 'Обновить галерею' }}
      </button>
      
      <PhotoGallery
        v-show="activeTab === 'photos'"
        ref="photoGallery"
        :errorMessageCallback="setErrorMessage"
        :statusMessageCallback="setStatusMessage"
      />
      
      <VideoGallery
        v-show="activeTab === 'videos'"
        ref="videoGallery"
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
import VideoGallery from './VideoGallery.vue';

// Состояние компонента
const errorMessage = ref('');
const statusMessage = ref('');
const photoGallery = ref(null);
const videoGallery = ref(null);
const isLoading = ref(false);
const activeTab = ref('photos');

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
  if (photoGallery.value) {
    await photoGallery.value.addPhoto(photo);
    // Автоматически переключаемся на вкладку фотогалереи
    activeTab.value = 'photos';
  }
}

// Обработчик события захвата видео
async function onVideoCaptured(video) {
  if (videoGallery.value) {
    await videoGallery.value.addVideo(video);
    // Автоматически переключаемся на вкладку видеогалереи
    activeTab.value = 'videos';
  }
}

// Обновление активной галереи
async function refreshGallery() {
  isLoading.value = true;
  
  if (activeTab.value === 'photos' && photoGallery.value) {
    await photoGallery.value.loadPhotos();
  } else if (activeTab.value === 'videos' && videoGallery.value) {
    await videoGallery.value.loadVideos();
  }
  
  isLoading.value = false;
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

.tabs {
  display: flex;
  justify-content: center;
  margin: 20px 0;
  border-bottom: 1px solid #ddd;
}

.tab-button {
  padding: 10px 15px;
  margin: 0 5px;
  border: none;
  background-color: transparent;
  cursor: pointer;
  font-size: 1rem;
  color: #333;
  position: relative;
  transition: all 0.3s;
}

.tab-button:hover {
  color: #42b983;
}

.tab-button.active {
  color: #42b983;
  font-weight: bold;
}

.tab-button.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 100%;
  height: 3px;
  background-color: #42b983;
}

.tab-icon {
  margin-right: 5px;
}
</style>
