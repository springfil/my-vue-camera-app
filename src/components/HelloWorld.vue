<script setup>
import { ref, onMounted } from 'vue'

defineProps({
  msg: String,
})

// Initialize count with 0, will be updated from localStorage if available
const count = ref(0)
const isStreamActive = ref(false)
const errorMessage = ref('')
const capturedPhotos = ref([]) // Массив для хранения сделанных фотографий
const stream = ref(null) // Хранение потока для доступа в разных функциях
const selectedPhoto = ref(null) // Для просмотра фото в полный размер
const uploadStatus = ref('') // Статус загрузки фото на сервер
const isUploading = ref(false) // Индикатор процесса загрузки

// Load the saved count from localStorage when the component is mounted
onMounted(() => {
  const savedCount = localStorage.getItem('count')
  if (savedCount !== null) {
    count.value = parseInt(savedCount)
  }
  
  // Загружаем ранее сохраненные фото при загрузке компонента
  const savedPhotos = localStorage.getItem('capturedPhotos')
  if (savedPhotos) {
    capturedPhotos.value = JSON.parse(savedPhotos)
  }
})

// Function to increment counter and save to localStorage
function incrementCounter() {
  count.value++
  localStorage.setItem('count', count.value.toString())
}

// Function to toggle camera stream
async function toggleCamera() {
  try {
    const videoElement = document.getElementById('camera-stream')
    
    if (!isStreamActive.value) {
      // Start the camera
      stream.value = await navigator.mediaDevices.getUserMedia({ 
        video: true,
        audio: false 
      })
      
      videoElement.srcObject = stream.value
      isStreamActive.value = true
      errorMessage.value = ''
    } else {
      // Stop the camera
      if (stream.value) {
        const tracks = stream.value.getTracks()
        tracks.forEach(track => track.stop())
        videoElement.srcObject = null
        stream.value = null
      }
      
      isStreamActive.value = false
    }
  } catch (error) {
    errorMessage.value = `Ошибка при доступе к камере: ${error.message}`
    console.error('Ошибка доступа к камере:', error)
  }
}

// Функция для съемки фото
function capturePhoto() {
  if (!isStreamActive.value) {
    errorMessage.value = 'Сначала включите камеру'
    return
  }
  
  try {
    // Создаем canvas для захвата кадра из видеопотока
    const videoElement = document.getElementById('camera-stream')
    const canvas = document.createElement('canvas')
    canvas.width = videoElement.videoWidth
    canvas.height = videoElement.videoHeight
    
    // Рисуем текущий кадр на canvas
    const ctx = canvas.getContext('2d')
    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height)
    
    // Получаем изображение в формате base64
    const photoDataUrl = canvas.toDataURL('image/jpeg')
    
    console.log(canvas)
    console.log(ctx)

    // Добавляем фото в массив с временной меткой
    const newPhoto = {
      id: Date.now(),
      dataUrl: photoDataUrl,
      timestamp: new Date().toLocaleString()
    }
    
    capturedPhotos.value.push(newPhoto)
    
    // Сохраняем обновленный массив фотографий в localStorage
    localStorage.setItem('capturedPhotos', JSON.stringify(capturedPhotos.value))
    
    errorMessage.value = ''
  } catch (error) {
    errorMessage.value = `Ошибка при съемке фото: ${error.message}`
    console.error('Ошибка при съемке фото:', error)
  }
}

// Функция для скачивания фото
function downloadPhoto(photo) {
  const link = document.createElement('a')
  link.href = photo.dataUrl
  link.download = `photo_${photo.id}.jpg`
  link.click()
}

// Функция для удаления фото
function deletePhoto(photoId) {
  capturedPhotos.value = capturedPhotos.value.filter(photo => photo.id !== photoId)
  localStorage.setItem('capturedPhotos', JSON.stringify(capturedPhotos.value))
}

// Функция для просмотра оригинала фото
function viewOriginalPhoto(photo) {
  selectedPhoto.value = photo
}

// Функция для закрытия модального окна с оригиналом фото
function closePhotoModal() {
  selectedPhoto.value = null
}

// Функция для отправки фото на сервер
async function uploadPhotoToServer(photo) {
  if (!photo || !photo.dataUrl) {
    errorMessage.value = 'Нет фото для загрузки'
    return
  }
  
  try {
    isUploading.value = true
    uploadStatus.value = 'Загрузка фото на сервер...'
    
    // Создаем объект FormData для отправки файла
    const formData = new FormData()
    
    // Преобразуем Data URL в Blob
    const blob = await dataURLtoBlob(photo.dataUrl)
    
    // Добавляем Blob как файл в FormData
    formData.append('photo', blob, `photo_${photo.id}.jpg`)
    
    // Добавляем метаданные фотографии
    formData.append('photoId', photo.id.toString())
    formData.append('timestamp', photo.timestamp)
    
    console.log('Форма данных для загрузки:', formData)

    // URL вашего API-эндпоинта для загрузки фото
    const serverUrl = 'https://your-api-server.com/upload-photo'
    
    // Отправляем запрос на сервер
    const response = await fetch(serverUrl, {
      method: 'POST',
      body: formData,
    })
    
    if (!response.ok) {
      throw new Error(`Ошибка сервера: ${response.status} ${response.statusText}`)
    }
    
    const result = await response.json()
    
    // Обновляем фото с информацией о загрузке
    photo.uploadedToServer = true
    photo.serverUrl = result.url // Если сервер возвращает URL загруженного фото
    
    // Обновляем локальное хранилище
    localStorage.setItem('capturedPhotos', JSON.stringify(capturedPhotos.value))
    
    uploadStatus.value = 'Фото успешно загружено на сервер!'
    setTimeout(() => {
      uploadStatus.value = ''
    }, 3000)
    
    return result
    
  } catch (error) {
    errorMessage.value = `Ошибка при загрузке фото: ${error.message}`
    console.error('Ошибка при загрузке фото:', error)
    uploadStatus.value = ''
    return null
  } finally {
    isUploading.value = false
  }
}

// Вспомогательная функция для преобразования Data URL в Blob
function dataURLtoBlob(dataURL) {
  return new Promise((resolve) => {
    const arr = dataURL.split(',')
    const mime = arr[0].match(/:(.*?);/)[1]
    const bstr = atob(arr[1])
    let n = bstr.length
    const u8arr = new Uint8Array(n)
    
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n)
    }
    
    resolve(new Blob([u8arr], { type: mime }))
  })
}
</script>

<template>
  <div class="card">
    <button type="button" @click="incrementCounter">count is {{ count }}</button>
    
    <div class="camera-container">
      <button type="button" @click="toggleCamera" class="camera-button">
        {{ isStreamActive ? 'Выключить камеру' : 'Включить камеру' }}
      </button>
      
      <video id="camera-stream" autoplay playsinline class="camera-stream" 
             :class="{ active: isStreamActive }"></video>
      
      <div v-if="isStreamActive" class="camera-controls">
        <button type="button" @click="capturePhoto" class="control-button">
          <span class="camera-icon">📸</span> Сделать фото
        </button>
      </div>
      
      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
      <p v-if="uploadStatus" class="upload-status">{{ uploadStatus }}</p>
      
      <!-- Галерея фотографий -->
      <div v-if="capturedPhotos.length > 0" class="photo-gallery">
        <h3>Сохраненные фотографии ({{ capturedPhotos.length }})</h3>
        
        <div class="photos-grid">
          <div v-for="photo in capturedPhotos" :key="photo.id" class="photo-item">
            <img :src="photo.dataUrl" alt="Captured photo" class="thumbnail" 
                 @click="viewOriginalPhoto(photo)" />
            <div class="photo-info">
              <span class="photo-timestamp">{{ photo.timestamp }}</span>
              <div class="photo-actions">
                <button @click="downloadPhoto(photo)" class="action-button download-button">
                  💾
                </button>
                <button @click="deletePhoto(photo.id)" class="action-button delete-button">
                  🗑️
                </button>
                <button @click="viewOriginalPhoto(photo)" class="action-button view-button">
                  👁️
                </button>
                <button @click="uploadPhotoToServer(photo)" class="action-button upload-button"
                        :disabled="isUploading">
                  ☁️
                </button>
              </div>
              <span v-if="photo.uploadedToServer" class="uploaded-badge">✓</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Модальное окно для просмотра оригинала фото -->
      <div v-if="selectedPhoto" class="photo-modal" @click="closePhotoModal">
        <div class="modal-content" @click.stop>
          <img :src="selectedPhoto.dataUrl" alt="Original photo" class="original-photo" />
          <div class="modal-footer">
            <span class="modal-timestamp">{{ selectedPhoto.timestamp }}</span>
            <div class="modal-actions">
              <button @click="downloadPhoto(selectedPhoto)" class="modal-button">
                <span class="button-icon">💾</span> Скачать
              </button>
              <button @click="uploadPhotoToServer(selectedPhoto)" class="modal-button upload-button"
                      :disabled="isUploading">
                <span class="button-icon">☁️</span> Загрузить на сервер
              </button>
              <button @click="closePhotoModal" class="modal-button close-button">
                <span class="button-icon">✖️</span> Закрыть
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.read-the-docs {
  color: #888;
}

.camera-container {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 600px;
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
  max-width: 400px;
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

.error-message {
  color: #ff4d4f;
  margin-top: 10px;
}

.photo-gallery {
  margin-top: 20px;
  width: 100%;
}

.photos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  grid-gap: 10px;
  margin-top: 10px;
}

.photo-item {
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
  background-color: #f9f9f9;
  position: relative;
}

.thumbnail {
  width: 100%;
  height: 120px;
  object-fit: cover;
  display: block;
  cursor: pointer; /* Показывает, что на фото можно кликнуть */
}

.thumbnail:hover {
  opacity: 0.9;
}

.photo-info {
  padding: 5px;
  font-size: 0.8rem;
}

.photo-timestamp {
  display: block;
  margin-bottom: 5px;
  font-size: 0.7rem;
  color: #666;
}

.photo-actions {
  display: flex;
  justify-content: space-between;
}

.action-button {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 2px;
}

.delete-button:hover {
  color: #ff4d4f;
}

.download-button:hover {
  color: #1890ff;
}

.view-button:hover {
  color: #52c41a;
}

.upload-button {
  color: #1890ff;
}

.upload-button:hover {
  color: #40a9ff;
}

.uploaded-badge {
  position: absolute;
  top: 5px;
  right: 5px;
  background-color: #52c41a;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

/* Стили для модального окна */
.photo-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  max-width: 90%;
  max-height: 90%;
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
}

.original-photo {
  max-width: 100%;
  max-height: calc(90vh - 60px); /* Оставляем место для footer */
  object-fit: contain;
}

.modal-footer {
  padding: 10px 15px;
  background-color: #f9f9f9;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-timestamp {
  color: #666;
  font-size: 0.9rem;
}

.modal-actions {
  display: flex;
  gap: 10px;
}

.modal-button {
  display: flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  background-color: #f0f0f0;
  color: #333;
  font-size: 0.9rem;
}

.modal-button:hover {
  background-color: #e0e0e0;
}

.close-button {
  background-color: #ff4d4f;
  color: white;
}

.close-button:hover {
  background-color: #cf1322;
}

.button-icon {
  margin-right: 5px;
}

.upload-status {
  color: #1890ff;
  margin-top: 10px;
  font-weight: bold;
}
</style>
