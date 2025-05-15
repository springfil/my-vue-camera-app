<template>
  <div class="photo-item">
    <img :src="photo.thumbnailUrl || photo.dataUrl" alt="Photo" class="thumbnail" 
         @click="$emit('view', photo)" />
    <div class="photo-info">
      <span class="photo-timestamp">{{ photo.timestamp }}</span>
      <span class="photo-title" v-if="photo.title">{{ photo.title }}</span>
      <div class="photo-actions">
        <button @click="$emit('download', photo)" class="action-button download-button" title="Скачать">
          💾
        </button>
        <button @click="$emit('delete', photo.id)" class="action-button delete-button" title="Удалить">
          🗑️
        </button>
        <button @click="$emit('view', photo)" class="action-button view-button" title="Просмотр">
          👁️
        </button>
        <button @click="$emit('upload', photo)" class="action-button upload-button"
                :disabled="isUploading || photo.uploadedToServer" title="Загрузить на сервер">
          ☁️
        </button>
      </div>
      <span v-if="photo.uploadedToServer" class="uploaded-badge" title="Загружено на сервер">✓</span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  photo: {
    type: Object,
    required: true
  },
  isUploading: {
    type: Boolean,
    default: false
  }
});

defineEmits(['view', 'download', 'delete', 'upload']);
</script>

<style scoped>
.photo-item {
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
  background-color: #f9f9f9;
  position: relative;
}

.thumbnail {
  width: 100%;
  height: 120px;
  object-fit: cover;
  display: block;
  cursor: pointer; /* Показывает, что на фото можно кликнуть */
}

.thumbnail:hover {
  opacity: 0.9;
}

.photo-info {
  padding: 5px;
  font-size: 0.8rem;
}

.photo-timestamp {
  display: block;
  margin-bottom: 5px;
  font-size: 0.7rem;
  color: #666;
}

.photo-title {
  display: block;
  font-size: 0.7rem;
  margin-bottom: 5px;
  color: #444;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.photo-actions {
  display: flex;
  justify-content: space-between;
}

.action-button {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 2px;
}

.delete-button:hover {
  color: #ff4d4f;
}

.download-button:hover {
  color: #1890ff;
}

.view-button:hover {
  color: #52c41a;
}

.upload-button {
  color: #1890ff;
}

.upload-button:hover {
  color: #40a9ff;
}

.upload-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.uploaded-badge {
  position: absolute;
  top: 5px;
  right: 5px;
  background-color: #52c41a;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}
</style>
