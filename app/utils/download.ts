/** Download a generated artifact, releasing the temporary object URL even if clicking fails. */
export function downloadBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob)
  try {
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
  } finally {
    window.URL.revokeObjectURL(url)
  }
}
