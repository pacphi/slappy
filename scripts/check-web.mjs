import { spawn } from 'node:child_process'
import { setTimeout } from 'node:timers/promises'

const port = process.env.SLAPPY_TEST_PORT || '3117'
const env = { ...process.env, PORT: port, SLAPPY_SMOKE_URL: `http://127.0.0.1:${port}` }
const server = spawn(process.execPath, ['.output/server/index.mjs'], { env, stdio: 'inherit' })
async function run(script) {
  const child = spawn(process.execPath, [script], { env, stdio: 'inherit' })
  await new Promise((resolve, reject) => {
    child.once('error', reject)
    child.once('exit', code =>
      code === 0 ? resolve() : reject(new Error(`${script} failed (${code})`))
    )
  })
}
try {
  let ready = false
  for (let attempt = 0; attempt < 60; attempt++) {
    if (server.exitCode !== null) throw new Error('Production server exited before becoming ready')
    try {
      ready = (await fetch(env.SLAPPY_SMOKE_URL, { signal: AbortSignal.timeout(1000) })).ok
      if (ready) break
    } catch {
      /* Server is starting. */
    }
    await setTimeout(250)
  }
  if (!ready) throw new Error('Production server did not become ready')
  await run('scripts/smoke-deployment.mjs')
  await run('scripts/check-label-picker.mjs')
} finally {
  server.kill('SIGTERM')
}
