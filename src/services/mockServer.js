/**
 * Мок-сервер для имитации работы с API
 */
export default class MockServer {
  constructor() {
    this.photos = [];
    this.lastId = 5000;
  }

  /**
   * Получение всех фотографий
   */
  async getPhotos() {
    // Имитация задержки сети
    await this._delay(800);

    // Возвращаем демо-фотографии, если список пуст
    if (this.photos.length === 0) {
      this._generateDemoPhotos();
    }

    return [...this.photos]; // Возвращаем копию массива
  }

  /**
   * Добавление новой фотографии
   */
  async addPhoto(photo) {
    // Имитация задержки сети
    await this._delay(1000);

    const id = ++this.lastId;
    
    const newPhoto = {
      ...photo,
      id,
      url: photo.dataUrl || `https://via.placeholder.com/600/92c952?text=Photo_${id}`,
      thumbnailUrl: photo.dataUrl
    };
    
    this.photos.push(newPhoto);
    
    // Возвращаем объект с id и url как это делал бы реальный API
    return {
      id: newPhoto.id,
      albumId: newPhoto.albumId,
      title: newPhoto.title,
      url: newPhoto.url,
      thumbnailUrl: newPhoto.thumbnailUrl
    };
  }

  /**
   * Удаление фотографии по ID
   */
  async deletePhoto(id) {
    // Имитация задержки сети
    await this._delay(500);
    
    let index = this.photos.findIndex(p => p.id === id);
    if (index === -1) {
      // Пытаемся найти по remoteId, если не нашли по id
      index = this.photos.findIndex(p => p.remoteId === id);
    }
    
    if (index !== -1) {
      this.photos.splice(index, 1);
      return true;
    }
    
    // Если ничего не нашли, просто возвращаем успех,
    // чтобы пользовательский интерфейс мог продолжить удаление
    return true;
  }

  /**
   * Приватный метод для генерации демо-фотографий
   */
  _generateDemoPhotos() {
    // Создаем локальные демо-изображения
    const demoPhotos = [...Array(4)].map((_, i) => {
      // Создаем цветной квадрат как демо-изображение
      const canvas = document.createElement('canvas');
      canvas.width = 600;
      canvas.height = 400;
      const ctx = canvas.getContext('2d');
      
      // Разные цвета для разных фото
      const colors = ['#ff9800', '#2196f3', '#4caf50', '#e91e63'];
      ctx.fillStyle = colors[i % colors.length];
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Добавляем текст на изображение
      ctx.fillStyle = 'white';
      ctx.font = '30px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`Демо фото ${i + 1}`, canvas.width / 2, canvas.height / 2);
      
      const dataUrl = canvas.toDataURL('image/jpeg');
      
      return {
        id: i + 1,
        albumId: 1,
        title: `Демо фото ${i + 1}`,
        url: dataUrl,
        thumbnailUrl: dataUrl
      };
    });
    
    // Сохраняем демо фото в мок-сервер
    this.photos = demoPhotos;
  }

  /**
   * Вспомогательный метод для имитации задержки
   */
  _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
