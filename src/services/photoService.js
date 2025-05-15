import MockServer from './mockServer';

/**
 * Сервис для работы с фотографиями
 * Использует мок-сервер для имитации API
 */
class PhotoService {
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
}

// Создаем и экспортируем экземпляр сервиса (singleton)
export default new PhotoService();
