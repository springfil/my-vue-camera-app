/**
 * Класс для представления видеозаписей
 */
import { generateMediaId } from '../utils/idUtils';

export default class Video {
  constructor(data = {}) {
    this.id = data.id || generateMediaId('VIDEO');
    this.albumId = data.albumId || 1;
    this.remoteId = data.remoteId || null;
    this.title = data.title || `Видео ${new Date().toLocaleDateString()}`;
    this.url = data.url || data.serverUrl || null;
    this.serverUrl = data.serverUrl || null;
    this.thumbnailUrl = data.thumbnailUrl || null;
    this.dataUrl = data.dataUrl || null;
    this.blobUrl = data.blobUrl || null;
    this.mimeType = data.mimeType || 'video/webm';
    this.blob = data.blob || null;
    this.duration = data.duration || 0;
    this.timestamp = data.timestamp || new Date().toLocaleString();
    this.uploadedToServer = data.uploadedToServer || false;
  }
  /**
   * Создание объекта Video из данных сервера
   * @param {Object} serverData - Данные от сервера
   * @returns {Video} Новый объект Video
   */
  static fromServerData(serverData) {
    return new Video({
      id: `server_${serverData.id}`,
      remoteId: serverData.id,
      albumId: serverData.albumId,
      title: serverData.title,
      serverUrl: serverData.url,
      thumbnailUrl: serverData.thumbnailUrl,
      uploadedToServer: true,
      timestamp: new Date().toLocaleString(),
      duration: serverData.duration || 0
    });
  }

  /**
   * Преобразование объекта Video в формат для отправки на сервер
   * @returns {Object} Объект для отправки на сервер
   */
  toServerData() {
    return {
      albumId: this.albumId,
      title: this.title,
      url: this.dataUrl || this.blobUrl, 
      thumbnailUrl: this.thumbnailUrl,
      duration: this.duration
    };
  }
}
