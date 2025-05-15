<template>  <div class="camera-container">
    <button type="button" @click="toggleCamera" class="camera-button">
      {{ isStreamActive ? 'Выключить камеру' : 'Включить камеру' }}
    </button>
    
    <video id="camera-stream" autoplay playsinline class="camera-stream" 
           :class="{ active: isStreamActive }"></video>
    
    <div v-if="isStreamActive" class="camera-controls">
      <button type="button" @click="capturePhoto" class="control-button">
        <span class="camera-icon">📸</span> Сделать фото
      </button>
      
      <button type="button" v-if="!isRecording" @click="startVideoRecording" class="control-button video-button">
        <span class="camera-icon">🎥</span> Запись видео
      </button>
      
      <button type="button" v-if="isRecording" @click="stopVideoRecording" class="control-button video-stop-button">
        <span class="camera-icon">⏹️</span> Остановить запись ({{ recordingDuration }}с)
      </button>
      
      <button type="button" @click="switchCamera" class="control-button switch-camera-button" :disabled="isRecording">
        <span class="camera-icon">🔄</span> {{ isFrontCamera ? 'Задняя камера' : 'Фронтальная камера' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { useCamera } from '../composables/useCamera';
import { useVideoRecorder } from '../composables/useVideoRecorder';
import { watch, onUnmounted } from 'vue';

const props = defineProps({
  errorMessageCallback: {
    type: Function,
    default: () => {}
  }
});

const emit = defineEmits(['photo-captured', 'video-captured']);

const { 
  isStreamActive, 
  isFrontCamera, 
  errorMessage,
  toggleCamera,
  switchCamera,
  takePhoto
} = useCamera();

const { 
  isRecording,
  recordingDuration,
  errorMessage: videoErrorMessage,
  startRecording,
  stopRecording,
  cleanupVideoRecording
} = useVideoRecorder();

// Наблюдаем за изменениями сообщения об ошибке
watch(errorMessage, (newValue) => {
  if (newValue) {
    props.errorMessageCallback(newValue);
  }
});

// Наблюдаем за ошибками видеозаписи
watch(videoErrorMessage, (newValue) => {
  if (newValue) {
    props.errorMessageCallback(newValue);
  }
});

// Функция для захвата фото и передачи его родительскому компоненту
function capturePhoto() {
  const photo = takePhoto();
  if (photo) {
    emit('photo-captured', photo);
  }
}

// Функция для начала записи видео
async function startVideoRecording() {
  const result = await startRecording();
  if (!result) {
    props.errorMessageCallback('Не удалось начать запись видео.');
  }
}

// Функция для остановки записи видео и сохранения результата
async function stopVideoRecording() {
  const video = await stopRecording();
  if (video) {
    emit('video-captured', video);
  } else {
    props.errorMessageCallback('Не удалось сохранить видеозапись.');
  }
}

// Очистка ресурсов при уничтожении компонента
onUnmounted(() => {
  cleanupVideoRecording();
});
</script>

<style scoped>
.camera-container {
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.camera-button {
  margin-bottom: 10px;
  padding: 8px 16px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.camera-button:hover {
  background-color: #369a6e;
}

.camera-stream {
  width: 0;
  height: 0;
  border: 0;
  transition: all 0.3s ease-in-out;
}

.camera-stream.active {
  width: 100%;
  height: auto;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.camera-controls {
  display: flex;
  margin-top: 10px;
  justify-content: center;
  width: 100%;
}

.control-button {
  padding: 8px 16px;
  margin: 0 5px;
  background-color: #ff9800;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.control-button:hover {
  background-color: #f57c00;
}

.camera-icon {
  margin-right: 5px;
  font-size: 1.2em;
}

.switch-camera-button {
  background-color: #2196f3;
}

.switch-camera-button:hover {
  background-color: #0d8bf2;
}

.video-button {
  background-color: #e91e63;
}

.video-button:hover {
  background-color: #c2185b;
}

.video-stop-button {
  background-color: #f44336;
}

.video-stop-button:hover {
  background-color: #d32f2f;
}

.control-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
