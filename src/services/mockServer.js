/**
 * Мок-сервер для имитации работы с API
 */
import { generateMediaId } from '../utils/idUtils';
import { dataURLtoBlob } from '../utils/mediaUtils';

export default class MockServer {
  constructor() {
    this.photos = [];
    this.videos = [];
    this.lastId = 5000;
    
    // Настройки для ST Drive API
    this.stDriveEnabled = true; // По умолчанию включено
    this.stDriveToken = import.meta.env.VITE_ST_DRIVE_TOKEN || '';
    this.stDriveApiUrl = 'https://st-drive.t2.ru/api/files';
    
    // Проверяем наличие токена при инициализации
    if (this.stDriveEnabled && !this.stDriveToken) {
      console.warn('Внимание: ST Drive включен, но JWT токен не установлен в .env файле (VITE_ST_DRIVE_TOKEN)');
    }
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
    console.log('Добавление фото:', photo);
    // Имитация задержки сети
    await this._delay(1000);

    const id = ++this.lastId;
    
    const newPhoto = {
      ...photo,
      id,
      url: photo.dataUrl,
      thumbnailUrl: photo.dataUrl
    };
    
    // Результат запроса для возврата
    const result = {
      id: newPhoto.id,
      albumId: newPhoto.albumId,
      title: newPhoto.title,
      url: newPhoto.url,
      thumbnailUrl: newPhoto.thumbnailUrl
    };
    
    // Отправляем фото в ST Drive
    if (this.stDriveEnabled && photo.dataUrl) {
      try {
        // Генерируем уникальный ID файла для ST Drive
        const fileId = generateMediaId('PHOTO');
        
        // Отправляем фото в ST Drive
        const stDriveResult = await this._uploadToStDrive(photo.dataUrl, fileId);
        
        console.log(`Фото успешно отправлено в ST Drive с ID: ${fileId}`, stDriveResult);
        
        // Добавляем информацию о загрузке в ST Drive
        newPhoto.stDrive = {
          fileId: fileId,
          uploadTime: new Date().toISOString(),
          status: 'success'
        };
        
        // Добавляем информацию о ST Drive в результат
        result.stDrive = {
          success: true,
          fileId: fileId
        };
      } catch (error) {
        console.error('Ошибка при отправке фото в ST Drive:', error);
        
        // Добавляем информацию об ошибке
        newPhoto.stDrive = {
          error: error.message,
          status: 'failed'
        };
        
        // Добавляем информацию об ошибке в результат
        result.stDrive = {
          success: false,
          error: error.message
        };
      }
    }
    
    // Сохраняем фото в локальную коллекцию
    this.photos.push(newPhoto);
    
    return result;
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
   * Получение всех видео
   */
  async getVideos() {
    // Имитация задержки сети
    await this._delay(800);

    // Возвращаем демо-видео, если список пуст
    if (this.videos.length === 0) {
      this._generateDemoVideos();
    }

    return [...this.videos]; // Возвращаем копию массива
  }
  /**
   * Добавление нового видео
   */
  async addVideo(video) {
    console.log('Добавление видео:', video);
    // Имитация задержки сети
    await this._delay(1000);

    const id = ++this.lastId;
    
    const newVideo = {
      ...video,
      id,
      url: video.blobUrl || video.dataUrl || `https://via.placeholder.com/600/92c952?text=Video_${id}`,
      thumbnailUrl: video.thumbnailUrl || `https://via.placeholder.com/150/92c952?text=Video_${id}`
    };
    
    // Результат запроса для возврата
    const result = {
      id: newVideo.id,
      albumId: newVideo.albumId,
      title: newVideo.title,
      url: newVideo.url,
      thumbnailUrl: newVideo.thumbnailUrl,
      duration: newVideo.duration
    };
      // Отправляем видео в ST Drive, если есть blobUrl или dataUrl
    if (this.stDriveEnabled && (video.blobUrl || video.dataUrl)) {
      try {
        // Генерируем уникальный ID файла для ST Drive
        const fileId = generateMediaId('VIDEO');
        
        // Определяем источник видео (blobUrl или dataUrl)
        const videoSource = video.blobUrl || video.dataUrl;
        
        // Отправляем видео в ST Drive
        const stDriveResult = await this._uploadVideoToStDrive(videoSource, fileId, video);
        
        console.log(`Видео успешно отправлено в ST Drive с ID: ${fileId}`, stDriveResult);
        
        // Добавляем информацию о загрузке в ST Drive
        newVideo.stDrive = {
          fileId: fileId,
          uploadTime: new Date().toISOString(),
          status: 'success'
        };
        
        // Добавляем информацию о ST Drive в результат
        result.stDrive = {
          success: true,
          fileId: fileId
        };
      } catch (error) {
        console.error('Ошибка при отправке видео в ST Drive:', error);
        
        // Добавляем информацию об ошибке
        newVideo.stDrive = {
          error: error.message,
          status: 'failed'
        };
        
        // Добавляем информацию об ошибке в результат
        result.stDrive = {
          success: false,
          error: error.message
        };
      }
    }
    
    // Сохраняем видео в локальную коллекцию
    this.videos.push(newVideo);
    
    return result;
  }

  /**
   * Удаление видео по ID
   */
  async deleteVideo(id) {
    // Имитация задержки сети
    await this._delay(500);
    
    let index = this.videos.findIndex(v => v.id === id);
    if (index === -1) {
      // Пытаемся найти по remoteId, если не нашли по id
      index = this.videos.findIndex(v => v.remoteId === id);
    }
    
    if (index !== -1) {
      this.videos.splice(index, 1);
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
   * Приватный метод для генерации демо-видео
   */
  _generateDemoVideos() {
    // Создаем локальные демо-видео
    const demoVideos = [...Array(2)].map((_, i) => {
      // Создаем цветной квадрат как демо-изображение для превью
      const canvas = document.createElement('canvas');
      canvas.width = 600;
      canvas.height = 400;
      const ctx = canvas.getContext('2d');
      
      // Разные цвета для разных превью
      const colors = ['#9c27b0', '#3f51b5'];
      ctx.fillStyle = colors[i % colors.length];
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Добавляем текст на превью
      ctx.fillStyle = 'white';
      ctx.font = '30px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`Демо видео ${i + 1}`, canvas.width / 2, canvas.height / 2);
      
      const thumbnailUrl = canvas.toDataURL('image/jpeg');
      
      return {
        id: 1000 + i,
        albumId: 1,
        title: `Демо видео ${i + 1}`,
        url: "https://file-examples.com/storage/fe109025eed802ff04c0f1e/2017/04/file_example_MP4_640_3MG.mp4",
        thumbnailUrl: thumbnailUrl,
        duration: 15 * (i + 1)
      };
    });
    
    // Сохраняем демо видео в мок-сервер
    this.videos = demoVideos;
  }  /**
   * Вспомогательный метод для имитации задержки
   */
  _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  /**
   * Метод для отправки видео в ST Drive API
   * @param {string} videoSource - URL или Blob URL видео
   * @param {string} fileId - Идентификатор файла
   * @param {Object} videoData - Метаданные видео (длительность, заголовок и т.д.)
   * @returns {Promise<Object>} - Ответ от сервера
   * @private
   */
  async _uploadVideoToStDrive(videoSource, fileId, videoData) {
    if (!this.stDriveToken) {
      throw new Error('JWT токен не установлен. Проверьте переменную окружения VITE_ST_DRIVE_TOKEN.');
    }
    
    try {
      // Получаем blob из URL или dataUrl
      let blob;
      let contentType;
      
      if (videoSource.startsWith('blob:')) {
        // Если это Blob URL, получаем Blob через fetch
        const response = await fetch(videoSource);
        blob = await response.blob();
        contentType = blob.type || 'video/mp4';      } else if (videoSource.startsWith('data:')) {
        // Если это Data URL, используем функцию для преобразования
        blob = await dataURLtoBlob(videoSource);
        contentType = videoSource.split(',')[0].split(':')[1].split(';')[0];
      } else {
        throw new Error('Неподдерживаемый формат видео');
      }
      
      console.log(`Тип контента видео: ${contentType}`);
      console.log('Видео blob:', blob);
      
        // Заголовки запроса
      const headers = {
        'Authorization': `Bearer ${this.stDriveToken}`,
        'Content-Type': contentType,
        'X-FileTags': 'video,vue-app',
        'X-RequireAuthentication': 'false',
        'X-CompressionQuality': '75', // Для видео используем меньшее сжатие
      };
      
      console.log(`Отправка видео в ST Drive: ${fileId}`, {
        fileSize: blob.size,
        contentType,
        headers,
      });
        // Выполняем реальный запрос к API
      const url = `${this.stDriveApiUrl}/${fileId}`;
      
      // Для больших файлов может потребоваться более долгий таймаут
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: blob,
      });
      
      console.log('Ответ от ST Drive:', response);
      
      // Получаем статус ответа
      const status = response.status;
      
      // При статусе 201 (Created) обычно тело ответа может быть пустым
      // Формируем объект результата основываясь на статусе и URL
      const result = {
        success: status >= 200 && status < 300,
        status: status,
        statusText: response.statusText,
        data: {
          fileId: fileId,
          url: response.url,
          createdAt: new Date().toISOString()
        },
        headers: Object.fromEntries([...response.headers.entries()])
      };
      
      console.log(`Ответ от ST Drive для видео ${fileId}:`, result);
      
      return result;
    } catch (error) {
      console.error('Ошибка при отправке видео в ST Drive:', error);
      throw error;
    }
  }
  
  /**
   * @private
   * Метод для отправки данных в ST Drive API
   * @param {string} dataUrl - Data URL изображения
   * @param {string} fileId - Идентификатор файла
   * @returns {Promise<Object>} - Ответ от сервера
   */
  async _uploadToStDrive(dataUrl, fileId) {
    if (!this.stDriveToken) {
      throw new Error('JWT токен не установлен. Проверьте переменную окружения VITE_ST_DRIVE_TOKEN.');
    }    
    try {
      // Конвертируем dataUrl в Blob
      const blob = await dataURLtoBlob(dataUrl);
    
      // Получаем тип контента из dataUrl
      const contentType = dataUrl.split(',')[0].split(':')[1].split(';')[0];
      
        console.log(`Тип контента: ${contentType}`);
        console.log('blob', blob);


      // Текущая дата в формате YYYY-MM-DD
      const creationDate = new Date().toISOString().split('T')[0];
      
      // Заголовки запроса
      const headers = {
        'Authorization': `Bearer ${this.stDriveToken}`,
        'Content-Type': contentType,
        'X-FileTags': 'photo,vue-app',
        'X-RequireAuthentication': 'false',
        'X-CompressionQuality': '85',
        'X-FileCreationDate': creationDate
      };
        console.log(`Отправка файла в ST Drive: ${fileId}`, {
        fileSize: blob.size,
        contentType,
        headers
      });
      
      // Выполняем реальный запрос к API
      const url = `${this.stDriveApiUrl}/${fileId}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: blob
      });
          console.log('Ответ от ST Drive:', response);

      // Получаем статус ответа
      const status = response.status;
      
      // При статусе 201 (Created) обычно тело ответа может быть пустым
      // Формируем объект результата основываясь на статусе и URL
      const result = {
        success: status >= 200 && status < 300,
        status: status,
        statusText: response.statusText,
        data: {
          fileId: fileId,
          url: response.url,
          createdAt: new Date().toISOString()
        },
        headers: Object.fromEntries([...response.headers.entries()])
      };
      
      console.log(`Ответ от ST Drive для файла ${fileId}:`, result);
      
      return result;
    } catch (error) {      console.error('Ошибка при отправке файла в ST Drive:', error);
      throw error;
    }
  }
}
