<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  headers?: string[]
  rows: string[][]
  maxRows?: number
}>()

// Transform data for UTable
const columns = computed(() => {
  if (!props.headers || props.headers.length === 0) {
    // Generate column headers if none provided
    const firstRow = props.rows[0] || []
    return firstRow.map((_, index) => ({
      accessorKey: `col${index}`,
      header: `Column ${index + 1}`,
    }))
  }

  return props.headers.map((header, index) => ({
    accessorKey: `col${index}`,
    header: header,
  }))
})

const data = computed(() => {
  const displayRows = props.rows.slice(0, props.maxRows || props.rows.length)
  return displayRows.map(row => {
    const rowData: Record<string, string> = {}
    row.forEach((cell, index) => {
      rowData[`col${index}`] = cell
    })
    return rowData
  })
})
</script>

<template>
  <div>
    <!-- m4: Empty state for zero-row CSV -->
    <div v-if="rows.length === 0" class="flex flex-col items-center gap-3 py-12 text-center">
      <UIcon name="i-heroicons-table-cells" class="h-12 w-12 opacity-20" />
      <p class="text-lg font-semibold opacity-70">No data to preview</p>
      <p class="max-w-md text-sm opacity-50">
        Your CSV file only contains headers. Please upload a file with data rows.
      </p>
    </div>

    <!-- Table with data -->
    <template v-else>
      <UTable :columns="columns" :data="data" />
      <p v-if="maxRows && rows.length > maxRows" class="mt-3 text-center text-xs opacity-50">
        Showing {{ maxRows }} of {{ rows.length }} rows
      </p>
    </template>
  </div>
</template>
