<template>
  <div class="photo-gallery">
    <h3>Фотографии ({{ photos.length }})</h3>
    
    <div class="photos-grid">
      <PhotoItem
        v-for="photo in photos"
        :key="photo.id"
        :photo="photo"
        :isUploading="isUploading"
        @view="onViewPhoto"
        @download="onDownloadPhoto"
        @delete="onDeletePhoto"
        @upload="onUploadPhoto"
      />
    </div>
    
    <PhotoModal
      :selectedPhoto="selectedPhoto"
      :isUploading="isUploading"
      @close="closePhotoModal"
      @download="onDownloadPhoto"
      @upload="onUploadPhoto"
    />
  </div>
</template>

<script setup>
import { onMounted, watch } from 'vue';
import PhotoItem from './PhotoItem.vue';
import PhotoModal from './PhotoModal.vue';
import { usePhotoGallery } from '../composables/usePhotoGallery';

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
  photos,
  selectedPhoto,
  isLoading,
  isUploading,
  statusMessage,
  errorMessage,
  loadPhotos,
  uploadPhoto,
  deletePhoto,
  selectPhoto,
  closeSelectedPhoto,
  downloadPhoto
} = usePhotoGallery();

// Наблюдаем за изменениями сообщений
watch([errorMessage, statusMessage], ([newError, newStatus]) => {
  if (newError) props.errorMessageCallback(newError);
  if (newStatus) props.statusMessageCallback(newStatus);
});

// Обработчики событий
function onViewPhoto(photo) {
  selectPhoto(photo);
}

function closePhotoModal() {
  closeSelectedPhoto();
}

function onDownloadPhoto(photo) {
  downloadPhoto(photo);
}

function onDeletePhoto(photoId) {
  deletePhoto(photoId);
}

function onUploadPhoto(photo) {
  uploadPhoto(photo);
}

// Методы для внешнего взаимодействия
defineExpose({
  loadPhotos,
  addPhoto: async (photo) => {
    photos.value.push(photo);
    await uploadPhoto(photo);
  }
});

// Инициализация
onMounted(() => {
  loadPhotos();
});
</script>

<style scoped>
.photo-gallery {
  margin-top: 20px;
  width: 100%;
}

h3 {
  margin-bottom: 10px;
  color: #333;
}

.photos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  grid-gap: 10px;
  margin-top: 10px;
}
</style>
