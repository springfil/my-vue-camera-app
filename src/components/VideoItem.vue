<template>
  <div class="video-item">
    <div class="thumbnail-container" @click="$emit('view', video)">
      <img :src="video.thumbnailUrl" alt="Video thumbnail" class="thumbnail" />
      <div class="video-duration">{{ formatDuration(video.duration) }}</div>
      <div class="play-overlay">▶️</div>
    </div>
    <div class="video-info">
      <span class="video-timestamp">{{ video.timestamp }}</span>
      <span class="video-title" v-if="video.title">{{ video.title }}</span>
      <div class="video-actions">
        <button @click="$emit('download', video)" class="action-button download-button" title="Скачать">
          💾
        </button>
        <button @click="$emit('delete', video.id)" class="action-button delete-button" title="Удалить">
          🗑️
        </button>
        <button @click="$emit('view', video)" class="action-button view-button" title="Просмотр">
          👁️
        </button>
        <button @click="$emit('upload', video)" class="action-button upload-button"
                :disabled="isUploading || video.uploadedToServer" title="Загрузить на сервер">
          ☁️
        </button>
      </div>
      <span v-if="video.uploadedToServer" class="uploaded-badge" title="Загружено на сервер">✓</span>
    </div>
  </div>
</template>

<script setup>
import { formatDuration } from '../utils/mediaUtils';

defineProps({
  video: {
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
.video-item {
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
  background-color: #f9f9f9;
  position: relative;
}

.thumbnail-container {
  position: relative;
  cursor: pointer;
}

.thumbnail {
  width: 100%;
  height: 120px;
  object-fit: cover;
  display: block;
}

.thumbnail:hover {
  opacity: 0.9;
}

.video-duration {
  position: absolute;
  bottom: 5px;
  right: 5px;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 2px 4px;
  border-radius: 2px;
  font-size: 0.7rem;
}

.play-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 2rem;
  opacity: 0.7;
  transition: opacity 0.3s;
}

.thumbnail-container:hover .play-overlay {
  opacity: 1;
}

.video-info {
  padding: 5px;
  font-size: 0.8rem;
}

.video-timestamp {
  display: block;
  margin-bottom: 5px;
  font-size: 0.7rem;
  color: #666;
}

.video-title {
  display: block;
  font-size: 0.7rem;
  margin-bottom: 5px;
  color: #444;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.video-actions {
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
