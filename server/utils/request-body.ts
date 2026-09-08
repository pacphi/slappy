import { createError, getHeader, type H3Event } from 'h3'
import { MAX_CSV_BYTES } from '../../shared/limits'

// Allow a small envelope for mapping JSON and multipart boundaries.
export const MAX_REQUEST_BYTES = MAX_CSV_BYTES + 64 * 1024

export async function readBoundedBody(event: H3Event): Promise<Buffer> {
  const length = Number(getHeader(event, 'content-length'))
  if (length > MAX_REQUEST_BYTES) {
    throw createError({ statusCode: 413, message: 'Request body is too large' })
  }
  return new Promise((resolve, reject) => {
    const request = event.node.req
    const chunks: Buffer[] = []
    let size = 0
    const cleanup = () => {
      clearTimeout(timer)
      request.off('data', onData)
      request.off('end', onEnd)
      request.off('error', onError)
      request.off('aborted', onAborted)
    }
    const fail = (statusCode: number, message: string) => {
      cleanup()
      request.resume()
      reject(createError({ statusCode, message }))
    }
    const onData = (chunk: Buffer) => {
      size += chunk.length
      if (size > MAX_REQUEST_BYTES) return fail(413, 'Request body is too large')
      chunks.push(chunk)
    }
    const onEnd = () => {
      cleanup()
      resolve(Buffer.concat(chunks))
    }
    const onError = () => fail(400, 'Unable to read request body')
    const onAborted = () => fail(400, 'Request aborted')
    const timer = setTimeout(() => fail(408, 'Request body timed out'), 15_000)
    request.on('data', onData)
    request.once('end', onEnd)
    request.once('error', onError)
    request.once('aborted', onAborted)
  })
}

export async function readBoundedJSON(event: H3Event): Promise<unknown> {
  const buffer = await readBoundedBody(event)
  try {
    return JSON.parse(buffer.toString('utf8'))
  } catch {
    throw createError({ statusCode: 400, message: 'Invalid JSON body' })
  }
}

export function invalidInput(error: unknown): never {
  throw createError({
    statusCode: error instanceof RangeError ? 413 : 400,
    message: error instanceof Error ? error.message : 'Invalid input',
  })
}
