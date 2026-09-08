<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  headers?: string[]
  rows: string[][]
  maxRows?: number
}>()

// Transform data for UTable
const columns = computed(() => {
  const width = props.rows.reduce(
    (count, row) => Math.max(count, row.length),
    props.headers?.length ?? 0
  )
  return Array.from({ length: width }, (_, index) => ({
    accessorKey: `col${index}`,
    header: props.headers?.[index] ?? `Column ${index + 1}`,
  }))
})

const data = computed(() => {
  const displayRows = props.rows.slice(0, props.maxRows ?? props.rows.length)
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
      <UTable
        :columns="columns"
        :data="data"
        tabindex="0"
        role="region"
        aria-label="Data preview"
      />
      <p
        v-if="maxRows !== undefined && rows.length > maxRows"
        class="mt-3 text-center text-xs opacity-50"
      >
        Showing {{ maxRows }} of {{ rows.length }} rows
      </p>
    </template>
  </div>
</template>
