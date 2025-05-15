<template>
  <div class="video-gallery">
    <h3>Видеозаписи ({{ videos.length }})</h3>
    
    <div class="videos-grid">
      <VideoItem
        v-for="video in videos"
        :key="video.id"
        :video="video"
        :isUploading="isUploading"
        @view="onViewVideo"
        @download="onDownloadVideo"
        @delete="onDeleteVideo"
        @upload="onUploadVideo"
      />
    </div>
    
    <VideoModal
      :selectedVideo="selectedVideo"
      :isUploading="isUploading"
      @close="closeVideoModal"
      @download="onDownloadVideo"
      @upload="onUploadVideo"
    />
  </div>
</template>

<script setup>
import { onMounted, watch } from 'vue';
import VideoItem from './VideoItem.vue';
import VideoModal from './VideoModal.vue';
import { useVideoGallery } from '../composables/useVideoGallery';

const props = defineProps({
  errorMessageCallback: {
    type: Function,
    default: () => {}
  },
  statusMessageCallback: {
    type: Function,
    default: () => {}
  }
});

const {
  videos,
  selectedVideo,
  isLoading,
  isUploading,
  statusMessage,
  errorMessage,
  loadVideos,
  uploadVideo,
  deleteVideo,
  selectVideo,
  closeSelectedVideo,
  downloadVideoFile
} = useVideoGallery();

// Наблюдаем за изменениями сообщений
watch([errorMessage, statusMessage], ([newError, newStatus]) => {
  if (newError) props.errorMessageCallback(newError);
  if (newStatus) props.statusMessageCallback(newStatus);
});

// Обработчики событий
function onViewVideo(video) {
  selectVideo(video);
}

function closeVideoModal() {
  closeSelectedVideo();
}

function onDownloadVideo(video) {
  downloadVideoFile(video);
}

function onDeleteVideo(videoId) {
  deleteVideo(videoId);
}

function onUploadVideo(video) {
  uploadVideo(video);
}

// Методы для внешнего взаимодействия
defineExpose({
  loadVideos,
  addVideo: async (video) => {
    videos.value.push(video);
    await uploadVideo(video);
  }
});

// Инициализация
onMounted(() => {
  loadVideos();
});
</script>

<style scoped>
.video-gallery {
  margin-top: 20px;
  width: 100%;
}

h3 {
  margin-bottom: 10px;
  color: #333;
}

.videos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  grid-gap: 10px;
  margin-top: 10px;
}
</style>
