/**
 * Утилиты для работы с изображениями
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
 * Скачать изображение по URL или Data URL
 * @param {Object} options - Параметры
 * @param {string} options.url - URL изображения
 * @param {string} options.filename - Имя файла
 * @returns {Promise<void>}
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
