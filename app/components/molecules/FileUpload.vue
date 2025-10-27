<script setup lang="ts">
const emit = defineEmits<{
  fileSelected: [file: File]
  error: [message: string]
}>()

defineProps<{
  loading?: boolean
}>()

// C3 + C4: File validation
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

interface ValidationResult {
  valid: boolean
  error?: string
}

const validateFile = (file: File): ValidationResult => {
  // Check file extension (more reliable than MIME type)
  if (!file.name.toLowerCase().endsWith('.csv')) {
    return {
      valid: false,
      error: 'Please upload a CSV file (.csv extension required)',
    }
  }

  // Check MIME type (when available)
  if (file.type && file.type !== 'text/csv' && file.type !== 'application/csv') {
    return {
      valid: false,
      error: 'Please upload a CSV file',
    }
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    const sizeMB = (file.size / 1024 / 1024).toFixed(1)
    return {
      valid: false,
      error: `File size (${sizeMB}MB) exceeds the 5MB limit. Please use a smaller file or split your data.`,
    }
  }

  return { valid: true }
}

const handleFileChange = (files: File[] | File | null) => {
  if (!files) return

  // Handle both array and single file
  const file = Array.isArray(files) ? files[0] : files
  if (!file) return

  const validation = validateFile(file)

  if (!validation.valid && validation.error) {
    emit('error', validation.error)
    return
  }

  emit('fileSelected', file)
}
</script>

<template>
  <div class="file-upload-wrapper">
    <!-- M4: Loading overlay -->
    <div v-if="loading" class="loading-overlay">
      <UIcon name="i-heroicons-arrow-path" class="h-8 w-8 animate-spin" />
      <p class="mt-4 text-lg font-medium">Processing CSV file...</p>
      <p class="mt-2 text-sm opacity-60">This may take a few seconds for large files</p>
    </div>

    <!-- File upload component -->
    <UFileUpload
      v-else
      variant="area"
      accept=".csv"
      label="Drag & drop your CSV file here"
      description="or click to browse"
      icon="i-heroicons-arrow-up-tray"
      class="min-h-[200px]"
      @update:model-value="handleFileChange"
    />
  </div>
</template>

<style lang="postcss" scoped>
.file-upload-wrapper {
  @apply relative min-h-[200px];
}

.loading-overlay {
  @apply flex flex-col items-center justify-center py-16;
}
</style>
