<script setup lang="ts">
defineProps<{
  headers?: string[]
  rows: string[][]
  maxRows?: number
}>()
</script>

<template>
  <AtomsContentBox class="data-table-wrapper">
    <div class="table-scroll">
      <table class="data-table">
        <thead v-if="headers && headers.length > 0">
          <tr>
            <th v-for="(header, index) in headers" :key="index" class="table-header">
              {{ header }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(row, rowIndex) in rows.slice(0, maxRows || rows.length)"
            :key="rowIndex"
            class="table-row"
          >
            <td v-for="(cell, cellIndex) in row" :key="cellIndex" class="table-cell">
              {{ cell }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <p v-if="maxRows && rows.length > maxRows" class="table-footer">
      Showing {{ maxRows }} of {{ rows.length }} rows
    </p>
  </AtomsContentBox>
</template>

<style lang="postcss" scoped>
.data-table-wrapper {
  @apply bg-white/5 p-4;
}

.table-scroll {
  @apply overflow-x-auto;
}

.data-table {
  @apply w-full border-collapse;
}

.table-header {
  @apply border-b border-white/10 px-4 py-3 text-left text-sm font-semibold text-white;
  @apply bg-white/5;
}

.table-row {
  @apply border-b border-white/5 transition-colors;
  @apply hover:bg-white/5;
}

.table-cell {
  @apply px-4 py-3 text-sm text-white/80;
}

.table-footer {
  @apply mt-3 text-center text-xs text-white/50;
}
</style>
