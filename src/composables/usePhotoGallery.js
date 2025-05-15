import { ref } from 'vue';
import photoService from '../services/photoService';
import { dataURLtoBlob, downloadImage } from '../utils/imageUtils';
import Photo from '../models/Photo';

/**
 * Хук для работы с галереей фотографий
 */
export function usePhotoGallery() {
  const photos = ref([]);
  const selectedPhoto = ref(null);
  const isLoading = ref(false);
  const isUploading = ref(false);
  const statusMessage = ref('');
  const errorMessage = ref('');
  
  /**
   * Загрузить фотографии с сервера
   */
  async function loadPhotos() {
    try {
      isLoading.value = true;
      statusMessage.value = 'Загрузка фотографий с сервера...';
      
      const serverPhotos = await photoService.getPhotos();
      
      // Преобразуем полученные данные в формат, используемый нашим приложением
      photos.value = serverPhotos.map(photo => new Photo({
        id: photo.id,
        remoteId: photo.id,
        timestamp: new Date().toLocaleString(),
        serverUrl: photo.url,
        thumbnailUrl: photo.thumbnailUrl,
        uploadedToServer: true,
        title: photo.title
      }));
      
      statusMessage.value = 'Фотографии успешно загружены!';
      setTimeout(() => {
        statusMessage.value = '';
      }, 3000);
      
    } catch (error) {
      errorMessage.value = `Ошибка при загрузке фотографий: ${error.message}`;
      console.error('Ошибка при загрузке фотографий:', error);
      statusMessage.value = '';
    } finally {
      isLoading.value = false;
    }
  }
  
  /**
   * Добавить новое фото в галерею и загрузить на сервер
   */
  async function addPhoto(photo) {
    try {
      // Добавляем фото в локальную галерею
      photos.value.push(photo);
      
      // Загружаем фото на сервер
      await uploadPhoto(photo);
      
      return true;
    } catch (error) {
      errorMessage.value = `Ошибка при добавлении фото: ${error.message}`;
      return false;
    }
  }
  
  /**
   * Загрузить фото на сервер
   */
  async function uploadPhoto(photo) {
    if (!photo || !photo.dataUrl) {
      errorMessage.value = 'Нет фото для загрузки';
      return false;
    }
    
    try {
      isUploading.value = true;
      statusMessage.value = 'Загрузка фото на сервер...';
      
      // Преобразуем Data URL в Blob для загрузки
      const blob = await dataURLtoBlob(photo.dataUrl);
      
      // Отправляем запрос в сервис
      const result = await photoService.uploadPhoto({
        title: photo.title,
        albumId: photo.albumId,
        timestamp: photo.timestamp,
        dataUrl: photo.dataUrl
      });
      
      // Обновляем фото с информацией о загрузке и URL с сервера
      photo.uploadedToServer = true;
      photo.serverUrl = result.url;
      photo.thumbnailUrl = result.thumbnailUrl;
      photo.remoteId = result.id;
      
      statusMessage.value = 'Фото успешно загружено на сервер!';
      setTimeout(() => {
        statusMessage.value = '';
      }, 3000);
      
      return true;
    } catch (error) {
      errorMessage.value = `Ошибка при загрузке фото: ${error.message}`;
      console.error('Ошибка при загрузке фото:', error);
      statusMessage.value = '';
      return false;
    } finally {
      isUploading.value = false;
    }
  }
  
  /**
   * Удалить фото по ID
   */
  async function deletePhoto(photoId) {
    try {
      // Находим фото в локальном состоянии
      const photoToDelete = photos.value.find(p => p.id === photoId);
      
      if (!photoToDelete) {
        throw new Error('Фото не найдено');
      }
      
      // Используем remoteId (если есть) для удаления на сервере
      const idToDelete = photoToDelete.remoteId || photoId;
      await photoService.deletePhoto(idToDelete);
      
      // Удаляем из локального состояния
      photos.value = photos.value.filter(photo => photo.id !== photoId);
      
      statusMessage.value = 'Фото успешно удалено';
      setTimeout(() => {
        statusMessage.value = '';
      }, 2000);
      
      return true;
    } catch (error) {
      errorMessage.value = `Ошибка при удалении фото: ${error.message}`;
      console.error('Ошибка при удалении фото:', error);
      return false;
    }
  }
  
  /**
   * Выбрать фото для просмотра
   */
  function selectPhoto(photo) {
    selectedPhoto.value = photo;
  }
  
  /**
   * Закрыть просмотр выбранного фото
   */
  function closeSelectedPhoto() {
    selectedPhoto.value = null;
  }
  
  /**
   * Скачать фото
   */
  async function downloadPhoto(photo) {
    try {
      let imageUrl = photo.dataUrl;
      
      // Если есть serverUrl, но нет dataUrl
      if (!imageUrl && photo.serverUrl) {
        const response = await fetch(photo.serverUrl);
        if (!response.ok) throw new Error('Не удалось загрузить изображение');
        const blob = await response.blob();
        imageUrl = URL.createObjectURL(blob);
      }
      
      await downloadImage({ 
        url: imageUrl, 
        filename: `photo_${photo.id}.jpg` 
      });
      
      // Освобождаем objectURL, если он был создан
      if (!photo.dataUrl && imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
      
      return true;
    } catch (error) {
      errorMessage.value = `Ошибка при скачивании фото: ${error.message}`;
      console.error('Ошибка при скачивании фото:', error);
      return false;
    }
  }
  
  return {
    photos,
    selectedPhoto,
    isLoading,
    isUploading,
    statusMessage,
    errorMessage,
    loadPhotos,
    addPhoto,
    uploadPhoto,
    deletePhoto,
    selectPhoto,
    closeSelectedPhoto,
    downloadPhoto
  };
}
