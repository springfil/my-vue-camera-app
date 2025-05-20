import { ref } from 'vue';
import { createVideoThumbnail, getVideoDuration } from '../utils/mediaUtils';
import Video from '../models/Video';

/**
 * Хук для работы с записью видео
 */
export function useVideoRecorder() {
  const isRecording = ref(false);
  const isStreamActive = ref(false);
  const stream = ref(null);
  const recorder = ref(null);
  const recordedChunks = ref([]);
  const errorMessage = ref('');
  const recordingDuration = ref(0);
  const recordingTimer = ref(null);
  
  // Инициализация медиа-потока для записи видео
  async function initializeStream() {
    try {
      if (isStreamActive.value) return true;
      
      // Здесь мы используем существующий stream из useCamera, если он есть
      const videoElement = document.getElementById('camera-stream');
      
      if (videoElement && videoElement.srcObject) {
        stream.value = videoElement.srcObject;
      } else {        // Если нет существующего потока, создаем новый с настройками для iOS
        const constraints = {
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            // Для iOS рекомендуется указать диапазон frameRate
            frameRate: { min: 15, ideal: 30, max: 30 }
          },
          audio: {
            // Настройка аудио для улучшения совместимости
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        };
        
        // Проверка на iPhone/iPad
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        if (isIOS) {
          console.log('Запрос медиа на iOS устройстве');
        }
        
        stream.value = await navigator.mediaDevices.getUserMedia(constraints);
        
        if (videoElement) {
          videoElement.srcObject = stream.value;
        }
      }
      
      isStreamActive.value = true;
      errorMessage.value = '';
      return true;
    } catch (error) {
      errorMessage.value = `Ошибка при доступе к камере: ${error.message}`;
      console.error('Ошибка при доступе к камере:', error);
      return false;
    }
  }
  
  // Запуск записи видео
  async function startRecording() {
    try {
      // Сначала инициализируем поток
      const initialized = await initializeStream();
      if (!initialized) return false;
      
      // Очищаем предыдущие записанные чанки
      recordedChunks.value = [];
      recordingDuration.value = 0;
        // Определяем поддерживаемый формат записи
      let options = {};
      
      // Проверяем поддерживаемые форматы для разных браузеров
      const mimeTypes = [
        'video/webm;codecs=vp9',
        'video/webm;codecs=vp8',
        'video/webm',
        'video/mp4',
        'video/mp4;codecs=h264',
        ''  // Пустая строка означает дефолтный формат
      ];
      
      // Находим первый поддерживаемый формат
      for (const mimeType of mimeTypes) {
        if (mimeType === '' || MediaRecorder.isTypeSupported(mimeType)) {
          options = mimeType ? { mimeType } : {};
          console.log(`Используется формат записи: ${mimeType || 'дефолтный'}`);
          break;
        }
      }
      
      // Создаем рекордер с определенным выше форматом
      recorder.value = new MediaRecorder(stream.value, options);
      
      // Слушаем события рекордера
      recorder.value.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunks.value.push(event.data);
        }
      };
        // Начинаем запись
      // На iOS таймслайс записи должен быть достаточно большим
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
      
      if (isIOS) {
        // Для iOS подаем данные каждые 500мс
        recorder.value.start(500);
        console.log('Запись на iOS устройстве');
      } else {
        // Для других устройств подаем данные каждые 100мс
        recorder.value.start(100);
      }
      isRecording.value = true;
      
      // Запускаем таймер для отслеживания длительности записи
      recordingTimer.value = setInterval(() => {
        recordingDuration.value += 1;
      }, 1000);
      
      return true;
    } catch (error) {
      errorMessage.value = `Ошибка при начале записи: ${error.message}`;
      console.error('Ошибка при начале записи:', error);
      return false;
    }
  }
  
  // Остановка записи видео
  async function stopRecording() {
    if (!isRecording.value || !recorder.value) {
      return null;
    }
    
    try {
      // Создаем Promise для ожидания окончания записи
      const videoPromise = new Promise((resolve) => {
        recorder.value.onstop = async () => {
          // Очищаем таймер
          clearInterval(recordingTimer.value);
            // Определяем тип MIME для создаваемого Blob
          let mimeType = 'video/webm';
          
          // Берем тип из рекордера, если он был установлен
          if (recorder.value && recorder.value.mimeType) {
            mimeType = recorder.value.mimeType;
          } else if (recordedChunks.value.length > 0 && recordedChunks.value[0].type) {
            // Иначе пробуем взять из первого чанка
            mimeType = recordedChunks.value[0].type;
          }
          
          console.log('Используем MIME тип для Blob:', mimeType);
          
          // Создаем Blob из записанных чанков
          const blob = new Blob(recordedChunks.value, { type: mimeType });
          const blobUrl = URL.createObjectURL(blob);
          
          // Получаем превью из первого кадра
          let thumbnailUrl = '';
          
          // Создаем временный video элемент для получения превью
          const videoElement = document.createElement('video');
          videoElement.src = blobUrl;
          videoElement.muted = true;
            videoElement.onloadedmetadata = async () => {
            try {
              // Воспроизводим видео, чтобы включить все события
              videoElement.play().catch(() => {
                // Игнорируем ошибки воспроизведения, так как нам нужны только метаданные
                console.log('Автовоспроизведение не разрешено, но это не критично для создания миниатюр');
              });
              
              // Получаем длительность
              const duration = await getVideoDuration(blob);
              
              // Получаем превью-кадр из видео
              thumbnailUrl = await createVideoThumbnail(videoElement);
              
              // Останавливаем воспроизведение, если оно началось
              videoElement.pause();
              
              // Создаем объект Video
              const newVideo = new Video({
                blobUrl,
                blob,
                thumbnailUrl,
                title: `Запись от ${new Date().toLocaleString()}`,
                timestamp: new Date().toLocaleString(),
                duration,
                mimeType: 'video/webm'
              });
              
              resolve(newVideo);
            } catch (err) {
              console.error('Ошибка при создании превью:', err);
              // Если не удалось создать превью, все равно возвращаем видео с заглушкой
              // Создаем заглушку для превью
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
              
              const placeholderThumbnail = canvas.toDataURL('image/jpeg');
              
              const newVideo = new Video({
                blobUrl,
                blob,
                thumbnailUrl: placeholderThumbnail,
                title: `Запись от ${new Date().toLocaleString()}`,
                timestamp: new Date().toLocaleString(),
                duration: recordingDuration.value,
                mimeType: 'video/webm'
              });
              resolve(newVideo);
            }
          };
        };
      });
        // Проверяем, нужно ли дополнительно запросить данные
      // (для Safari на iOS это может потребоваться)
      if (recorder.value.state === 'recording') {
        recorder.value.requestData(); // Запрашиваем доступные данные
      }
      
      // Останавливаем запись
      recorder.value.stop();
      isRecording.value = false;
      
      // Ждем результата
      return await videoPromise;
    } catch (error) {
      errorMessage.value = `Ошибка при остановке записи: ${error.message}`;
      console.error('Ошибка при остановке записи:', error);
      isRecording.value = false;
      clearInterval(recordingTimer.value);
      return null;
    }
  }
  
  // Очистка ресурсов
  function cleanupVideoRecording() {
    if (recordingTimer.value) {
      clearInterval(recordingTimer.value);
    }
    
    if (recorder.value) {
      if (isRecording.value) {
        try {
          recorder.value.stop();
        } catch (e) {
          // Игнорируем ошибки при остановке
        }
      }
      recorder.value = null;
    }
    
    // Очищаем URL-ы для предотвращения утечек памяти
    recordedChunks.value.forEach(chunk => {
      if (chunk.url) {
        URL.revokeObjectURL(chunk.url);
      }
    });
    
    recordedChunks.value = [];
    isRecording.value = false;
  }
  
  return {
    isRecording,
    recordingDuration,
    errorMessage,
    startRecording,
    stopRecording,
    cleanupVideoRecording, 
  };
}
