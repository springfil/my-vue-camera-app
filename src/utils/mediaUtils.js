/**
 * Утилиты для работы с медиа-файлами (изображениями и видео)
 */

/**
 * Преобразовать Data URL в Blob
 * @param {string} dataURL - Data URL изображения
 * @returns {Promise<Blob>} - Promise с Blob-объектом
 */
export function dataURLtoBlob(dataURL) {
  return new Promise((resolve) => {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    
    resolve(new Blob([u8arr], { type: mime }));
  });
}

/**
 * Создать Data URL из элемента video
 * @param {HTMLVideoElement} videoElement - Элемент video
 * @returns {string} - Data URL изображения
 */
export function captureVideoFrame(videoElement) {
  const canvas = document.createElement('canvas');
  canvas.width = videoElement.videoWidth;
  canvas.height = videoElement.videoHeight;
  
  const ctx = canvas.getContext('2d');
  ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
  
  return canvas.toDataURL('image/jpeg');
}

/**
 * Создать миниатюру из элемента video для превью видео
 * @param {HTMLVideoElement} videoElement - Элемент video
 * @returns {Promise<string>} - Promise с Data URL миниатюры
 */
export function createVideoThumbnail(videoElement) {
  return new Promise((resolve, reject) => {
    // Добавим обработку события loadedmetadata
    const handleLoadedMetadata = () => {
      try {
        // Удаляем слушатель после однократного срабатывания
        videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
        
        // Установим время воспроизведения на безопасное значение
        let seekTime = 0.1;
        if (!isNaN(videoElement.duration) && isFinite(videoElement.duration)) {
          seekTime = videoElement.duration > 1 ? videoElement.duration / 2 : 0.1;
        }
        videoElement.currentTime = seekTime;
      } catch (error) {
        console.error('Ошибка при установке currentTime:', error);
        // Если не удалось установить время, попробуем всё равно создать превью
        captureFrame();
      }
    };
    
    // Слушаем событие seeked, которое возникнет, когда видео перемотается на указанное время
    const handleSeeked = () => {
      videoElement.removeEventListener('seeked', handleSeeked);
      captureFrame();
    };
    
    // Функция для захвата кадра
    const captureFrame = () => {
      try {
        const canvas = document.createElement('canvas');
        // Проверка на валидные размеры видео
        canvas.width = videoElement.videoWidth || 320;
        canvas.height = videoElement.videoHeight || 240;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
        
        const thumbnailUrl = canvas.toDataURL('image/jpeg');
        resolve(thumbnailUrl);
      } catch (error) {
        console.error('Ошибка при создании миниатюры:', error);
        // Создаем базовое изображение-заглушку
        createPlaceholderThumbnail().then(resolve).catch(reject);
      }
    };

    // Обработчик ошибок
    const handleError = (error) => {
      console.error('Ошибка загрузки видео для миниатюры:', error);
      videoElement.removeEventListener('error', handleError);
      createPlaceholderThumbnail().then(resolve).catch(reject);
    };
    
    // Добавляем слушатели событий
    videoElement.addEventListener('loadedmetadata', handleLoadedMetadata);
    videoElement.addEventListener('seeked', handleSeeked);
    videoElement.addEventListener('error', handleError);
    
    // Если метаданные уже загружены, запускаем обработчик
    if (videoElement.readyState >= 2) {
      handleLoadedMetadata();
    }
  });
}

/**
 * Создать изображение-заглушку для миниатюры видео
 * @returns {Promise<string>} - Promise с Data URL миниатюры
 */
function createPlaceholderThumbnail() {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 240;
    
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#3f51b5';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = 'white';
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Видеозапись', canvas.width / 2, canvas.height / 2);
    
    const thumbnailUrl = canvas.toDataURL('image/jpeg');
    resolve(thumbnailUrl);
  });
}

/**
 * Скачать изображение по URL или Data URL
 * @param {Object} options - Параметры
 * @param {string} options.url - URL изображения
 * @param {string} options.filename - Имя файла
 * @returns {Promise<boolean>}
 */
export async function downloadImage({ url, filename }) {
  try {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    return true;
  } catch (error) {
    console.error('Ошибка при скачивании изображения:', error);
    throw error;
  }
}

/**
 * Скачать видео по URL или Blob URL
 * @param {Object} options - Параметры
 * @param {string} options.url - URL видео
 * @param {string} options.filename - Имя файла
 * @returns {Promise<boolean>}
 */
export async function downloadVideo({ url, filename }) {
  try {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || 'video.webm';
    link.click();
    return true;
  } catch (error) {
    console.error('Ошибка при скачивании видео:', error);
    throw error;
  }
}

/**
 * Получить длительность видео-файла
 * @param {File|Blob} videoFile - Видео-файл или Blob
 * @returns {Promise<number>} - Длительность в секундах
 */
export function getVideoDuration(videoFile) {
  return new Promise((resolve, reject) => {
    // Проверка переданного параметра
    if (!videoFile || !(videoFile instanceof Blob)) {
      console.warn('getVideoDuration: параметр не является Blob', videoFile);
      resolve(0);
      return;
    }
    
    // Создаем временный URL для доступа к файлу
    const url = URL.createObjectURL(videoFile);
    const video = document.createElement('video');
    
    // Устанавливаем таймаут для защиты от зависания
    const timeout = setTimeout(() => {
      URL.revokeObjectURL(url);
      console.warn('Превышено время ожидания при получении длительности видео');
      resolve(0);
    }, 10000); // 10 секунд ожидания максимум
    
    video.onloadedmetadata = () => {
      clearTimeout(timeout);
      URL.revokeObjectURL(url);
      // Проверяем валидность длительности
      const duration = isNaN(video.duration) || !isFinite(video.duration) ? 0 : video.duration;
      resolve(duration);
    };
    
    video.onerror = (error) => {
      clearTimeout(timeout);
      URL.revokeObjectURL(url);
      console.error('Ошибка при получении длительности видео:', error);
      // В случае ошибки возвращаем 0 вместо отклонения Promise
      resolve(0);
    };
    
    video.src = url;
  });
}

/**
 * Форматирует длительность в формат MM:SS
 * @param {number} seconds - Длительность в секундах
 * @returns {string} - Форматированная строка длительности
 */
export function formatDuration(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}
