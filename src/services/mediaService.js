import MockServer from './mockServer';

/**
 * Сервис для работы с медиа (фото и видео)
 * Использует мок-сервер для имитации API
 */
class MediaService {
  constructor() {
    this.mockServer = new MockServer();
  }

  /**
   * Получить все фотографии
   */
  async getPhotos() {
    try {
      const photos = await this.mockServer.getPhotos();
      return photos;
    } catch (error) {
      console.error('Ошибка при загрузке фотографий:', error);
      throw error;
    }
  }

  /**
   * Загрузить фотографию на сервер
   */
  async uploadPhoto(photo) {
    try {
      const result = await this.mockServer.addPhoto(photo);
      return result;
    } catch (error) {
      console.error('Ошибка при загрузке фото:', error);
      throw error;
    }
  }

  /**
   * Удалить фото по ID
   */
  async deletePhoto(photoId) {
    try {
      const result = await this.mockServer.deletePhoto(photoId);
      return result;
    } catch (error) {
      console.error('Ошибка при удалении фото:', error);
      throw error;
    }
  }

  /**
   * Получить все видеозаписи
   */
  async getVideos() {
    try {
      const videos = await this.mockServer.getVideos();
      return videos;
    } catch (error) {
      console.error('Ошибка при загрузке видеозаписей:', error);
      throw error;
    }
  }

  /**
   * Загрузить видеозапись на сервер
   */
  async uploadVideo(video) {
    try {
      const result = await this.mockServer.addVideo(video);
      return result;
    } catch (error) {
      console.error('Ошибка при загрузке видео:', error);
      throw error;
    }
  }

  /**
   * Удалить видео по ID
   */
  async deleteVideo(videoId) {
    try {
      const result = await this.mockServer.deleteVideo(videoId);
      return result;
    } catch (error) {
      console.error('Ошибка при удалении видео:', error);
      throw error;
    }
  }
}

// Создаем и экспортируем экземпляр сервиса (singleton)
export default new MediaService();
