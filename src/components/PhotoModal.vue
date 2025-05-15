<template>
  <div v-if="selectedPhoto" class="photo-modal" @click="close">
    <div class="modal-content" @click.stop>
      <img :src="selectedPhoto.serverUrl || selectedPhoto.dataUrl" alt="Original photo" class="original-photo" />
      <div class="modal-footer">
        <span class="modal-timestamp">{{ selectedPhoto.timestamp }}</span>
        <div class="modal-actions">
          <button @click="$emit('download', selectedPhoto)" class="modal-button">
            <span class="button-icon">💾</span> Скачать
          </button>
          <button @click="$emit('upload', selectedPhoto)" class="modal-button upload-button"
                  :disabled="isUploading">
            <span class="button-icon">☁️</span> Загрузить на сервер
          </button>
          <button @click="close" class="modal-button close-button">
            <span class="button-icon">✖️</span> Закрыть
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  selectedPhoto: {
    type: Object,
    default: null
  },
  isUploading: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close', 'download', 'upload']);

function close() {
  emit('close');
}
</script>

<style scoped>
.photo-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  max-width: 90%;
  max-height: 90%;
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
}

.original-photo {
  max-width: 100%;
  max-height: calc(90vh - 60px); /* Оставляем место для footer */
  object-fit: contain;
}

.modal-footer {
  padding: 10px 15px;
  background-color: #f9f9f9;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-timestamp {
  color: #666;
  font-size: 0.9rem;
}

.modal-actions {
  display: flex;
  gap: 10px;
}

.modal-button {
  display: flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  background-color: #f0f0f0;
  color: #333;
  font-size: 0.9rem;
}

.modal-button:hover {
  background-color: #e0e0e0;
}

.close-button {
  background-color: #ff4d4f;
  color: white;
}

.close-button:hover {
  background-color: #cf1322;
}

.button-icon {
  margin-right: 5px;
}

.upload-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
