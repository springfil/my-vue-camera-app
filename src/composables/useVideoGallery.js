import { ref } from 'vue';
import mediaService from '../services/mediaService';
import { downloadVideo } from '../utils/mediaUtils';
import Video from '../models/Video';

/**
 * Хук для работы с галереей видеозаписей
 */
export function useVideoGallery() {
  const videos = ref([]);
  const selectedVideo = ref(null);
  const isLoading = ref(false);
  const isUploading = ref(false);
  const statusMessage = ref('');
  const errorMessage = ref('');
  
  /**
   * Загрузить видеозаписи с сервера
   */
  async function loadVideos() {
    try {
      isLoading.value = true;
      statusMessage.value = 'Загрузка видеозаписей с сервера...';
      
      const serverVideos = await mediaService.getVideos();
      
      // Преобразуем полученные данные в формат, используемый нашим приложением
      videos.value = serverVideos.map(video => new Video({
        id: video.id,
        remoteId: video.id,
        timestamp: new Date().toLocaleString(),
        serverUrl: video.url,
        thumbnailUrl: video.thumbnailUrl,
        uploadedToServer: true,
        title: video.title,
        duration: video.duration
      }));
      
      statusMessage.value = 'Видеозаписи успешно загружены!';
      setTimeout(() => {
        statusMessage.value = '';
      }, 3000);
      
    } catch (error) {
      errorMessage.value = `Ошибка при загрузке видеозаписей: ${error.message}`;
      console.error('Ошибка при загрузке видеозаписей:', error);
      statusMessage.value = '';
    } finally {
      isLoading.value = false;
    }
  }
  
  /**
   * Добавить новое видео в галерею и загрузить на сервер
   */
  async function addVideo(video) {
    try {
      // Добавляем видео в локальную галерею
      videos.value.push(video);
      
      // Загружаем видео на сервер
      await uploadVideo(video);
      
      return true;
    } catch (error) {
      errorMessage.value = `Ошибка при добавлении видео: ${error.message}`;
      return false;
    }
  }
  
  /**
   * Загрузить видео на сервер
   */
  async function uploadVideo(video) {
    if (!video || (!video.blobUrl && !video.dataUrl)) {
      errorMessage.value = 'Нет видео для загрузки';
      return false;
    }
    
    try {
      isUploading.value = true;
      statusMessage.value = 'Загрузка видео на сервер...';
      
      // Отправляем запрос в сервис
      const result = await mediaService.uploadVideo({
        title: video.title,
        albumId: video.albumId,
        timestamp: video.timestamp,
        dataUrl: video.dataUrl,
        blobUrl: video.blobUrl,
        thumbnailUrl: video.thumbnailUrl,
        duration: video.duration
      });
      
      // Обновляем видео с информацией о загрузке и URL с сервера
      video.uploadedToServer = true;
      video.serverUrl = result.url;
      video.thumbnailUrl = result.thumbnailUrl || video.thumbnailUrl;
      video.remoteId = result.id;
      
      statusMessage.value = 'Видео успешно загружено на сервер!';
      setTimeout(() => {
        statusMessage.value = '';
      }, 3000);
      
      return true;
    } catch (error) {
      errorMessage.value = `Ошибка при загрузке видео: ${error.message}`;
      console.error('Ошибка при загрузке видео:', error);
      statusMessage.value = '';
      return false;
    } finally {
      isUploading.value = false;
    }
  }
  
  /**
   * Удалить видео по ID
   */
  async function deleteVideo(videoId) {
    try {
      // Находим видео в локальном состоянии
      const videoToDelete = videos.value.find(v => v.id === videoId);
      
      if (!videoToDelete) {
        throw new Error('Видео не найдено');
      }
      
      // Используем remoteId (если есть) для удаления на сервере
      const idToDelete = videoToDelete.remoteId || videoId;
      await mediaService.deleteVideo(idToDelete);
      
      // Удаляем из локального состояния
      videos.value = videos.value.filter(video => video.id !== videoId);
      
      // Очищаем Blob URL для предотвращения утечек памяти
      if (videoToDelete.blobUrl) {
        URL.revokeObjectURL(videoToDelete.blobUrl);
      }
      
      statusMessage.value = 'Видео успешно удалено';
      setTimeout(() => {
        statusMessage.value = '';
      }, 2000);
      
      return true;
    } catch (error) {
      errorMessage.value = `Ошибка при удалении видео: ${error.message}`;
      console.error('Ошибка при удалении видео:', error);
      return false;
    }
  }
  
  /**
   * Выбрать видео для просмотра
   */
  function selectVideo(video) {
    selectedVideo.value = video;
  }
  
  /**
   * Закрыть просмотр выбранного видео
   */
  function closeSelectedVideo() {
    selectedVideo.value = null;
  }
  
  /**
   * Скачать видео
   */
  async function downloadVideoFile(video) {
    try {
      let videoUrl = video.blobUrl;
      
      // Если есть serverUrl, но нет blobUrl
      if (!videoUrl && video.serverUrl) {
        videoUrl = video.serverUrl;
      }
      
      await downloadVideo({ 
        url: videoUrl, 
        filename: `video_${video.id}.webm` 
      });
      
      return true;
    } catch (error) {
      errorMessage.value = `Ошибка при скачивании видео: ${error.message}`;
      console.error('Ошибка при скачивании видео:', error);
      return false;
    }
  }
  
  return {
    videos,
    selectedVideo,
    isLoading,
    isUploading,
    statusMessage,
    errorMessage,
    loadVideos,
    addVideo,
    uploadVideo,
    deleteVideo,
    selectVideo,
    closeSelectedVideo,
    downloadVideoFile
  };
}
