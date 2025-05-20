/**
 * Модель данных фотографии
 */
import { generateMediaId } from '../utils/idUtils';

export default class Photo {
  constructor({
    id = generateMediaId('PHOTO'),
    remoteId = null,
    dataUrl = null,
    thumbnailUrl = null,
    serverUrl = null,
    timestamp = new Date().toLocaleString(),
    title = `Фото от ${new Date().toLocaleString()}`,
    albumId = 1,
    uploadedToServer = false
  } = {}) {
    this.id = id;
    this.remoteId = remoteId;
    this.dataUrl = dataUrl;
    this.thumbnailUrl = thumbnailUrl || dataUrl;
    this.serverUrl = serverUrl;
    this.timestamp = timestamp;
    this.title = title;
    this.albumId = albumId;
    this.uploadedToServer = uploadedToServer;
  }

  // Создание фото из объекта данных
  static fromData(data) {
    return new Photo(data);
  }

  // Преобразование в объект для отправки на сервер
  toServerData() {
    return {
      id: this.id,
      albumId: this.albumId,
      title: this.title,
      timestamp: this.timestamp,
      dataUrl: this.dataUrl
    };
  }
}
