<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  fileSelected: [file: File]
}>()

const isDragging = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)

const handleDragOver = (e: DragEvent) => {
  e.preventDefault()
  isDragging.value = true
}

const handleDragLeave = () => {
  isDragging.value = false
}

const handleDrop = (e: DragEvent) => {
  e.preventDefault()
  isDragging.value = false

  const files = e.dataTransfer?.files
  if (files && files.length > 0 && files[0].type === 'text/csv') {
    emit('fileSelected', files[0])
  }
}

const handleFileInput = (e: Event) => {
  const input = e.target as HTMLInputElement
  if (input.files && input.files.length > 0) {
    emit('fileSelected', input.files[0])
  }
}

const openFilePicker = () => {
  fileInputRef.value?.click()
}
</script>

<template>
  <AtomsContentBox
    class="file-upload"
    :class="{ 'is-dragging': isDragging }"
    @dragover="handleDragOver"
    @dragleave="handleDragLeave"
    @drop="handleDrop"
    @click="openFilePicker"
  >
    <input ref="fileInputRef" type="file" accept=".csv" class="hidden" @change="handleFileInput" />

    <div class="upload-content">
      <UIcon name="i-heroicons-arrow-up-tray" class="upload-icon" />
      <p class="upload-text">
        {{ isDragging ? 'Drop your CSV file here' : 'Drag & drop your CSV file here' }}
      </p>
      <p class="upload-subtext">or click to browse</p>
    </div>
  </AtomsContentBox>
</template>

<style lang="postcss" scoped>
.file-upload {
  @apply cursor-pointer border-2 border-dashed border-white/10 bg-white/5 p-16 text-center transition-all;
  @apply hover:border-purple-500/50 hover:bg-white/10;

  &.is-dragging {
    @apply scale-[1.01] border-purple-500 bg-purple-500/10;
  }
}

.upload-content {
  @apply flex flex-col items-center gap-4;
}

.upload-icon {
  @apply h-16 w-16 text-purple-500 transition-transform;

  .file-upload:hover & {
    @apply scale-110;
  }
}

.upload-text {
  @apply text-lg font-semibold text-white;
}

.upload-subtext {
  @apply text-sm text-white/70;
}
</style>
