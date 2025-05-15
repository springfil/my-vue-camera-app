import { ref } from 'vue';
import { captureVideoFrame } from '../utils/mediaUtils';
import mediaService from '../services/mediaService';
import Photo from '../models/Photo';

/**
 * Хук для работы с камерой
 */
export function useCamera() {
  const isStreamActive = ref(false);
  const isFrontCamera = ref(true);
  const stream = ref(null);
  const errorMessage = ref('');
  
  /**
   * Включить или выключить камеру
   */
  async function toggleCamera() {
    try {
      const videoElement = document.getElementById('camera-stream');
      
      if (!isStreamActive.value) {
        // Start the camera
        stream.value = await navigator.mediaDevices.getUserMedia({ 
          video: {
            facingMode: isFrontCamera.value ? 'user' : 'environment'
          },
          audio: false 
        });
        
        videoElement.srcObject = stream.value;
        isStreamActive.value = true;
        errorMessage.value = '';
      } else {
        // Stop the camera
        if (stream.value) {
          const tracks = stream.value.getTracks();
          tracks.forEach(track => track.stop());
          videoElement.srcObject = null;
          stream.value = null;
        }
        
        isStreamActive.value = false;
      }
    } catch (error) {
      errorMessage.value = `Ошибка при доступе к камере: ${error.message}`;
      console.error('Ошибка доступа к камере:', error);
    }
  }
  
  /**
   * Переключить между фронтальной и задней камерой
   */
  async function switchCamera() {
    // Сначала останавливаем текущий поток
    if (stream.value) {
      const tracks = stream.value.getTracks();
      tracks.forEach(track => track.stop());
      stream.value = null;
    }
    
    // Переключаем флаг камеры
    isFrontCamera.value = !isFrontCamera.value;
    
    // Если камера была включена, перезапускаем её с новым выбором
    if (isStreamActive.value) {
      try {
        const videoElement = document.getElementById('camera-stream');
        
        stream.value = await navigator.mediaDevices.getUserMedia({ 
          video: {
            facingMode: isFrontCamera.value ? 'user' : 'environment'
          },
          audio: false 
        });
        
        videoElement.srcObject = stream.value;
        errorMessage.value = '';
      } catch (error) {
        errorMessage.value = `Ошибка при переключении камеры: ${error.message}`;
        console.error('Ошибка при переключении камеры:', error);
      }
    }
  }
  
  /**
   * Сделать снимок с камеры
   * @returns {Photo|null} Объект фотографии или null в случае ошибки
   */
  function takePhoto() {
    if (!isStreamActive.value) {
      errorMessage.value = 'Сначала включите камеру';
      return null;
    }
    
    try {
      const videoElement = document.getElementById('camera-stream');
      const photoDataUrl = captureVideoFrame(videoElement);
      
      // Создаем новый объект Photo
      const newPhoto = new Photo({
        dataUrl: photoDataUrl,
        thumbnailUrl: photoDataUrl,
      });
      
      errorMessage.value = '';
      return newPhoto;
    } catch (error) {
      errorMessage.value = `Ошибка при съемке фото: ${error.message}`;
      console.error('Ошибка при съемке фото:', error);
      return null;
    }
  }
  
  return {
    isStreamActive,
    isFrontCamera,
    errorMessage,
    toggleCamera,
    switchCamera,
    takePhoto
  };
}
