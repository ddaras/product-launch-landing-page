import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { createServer } from 'node:net';
import { dirname, resolve } from 'node:path';
import { createInterface } from 'node:readline';
import { setTimeout as delay } from 'node:timers/promises';
import { bin, install } from 'cloudflared';
import { findPreviewUrl } from './preview-url.mjs';

const require = createRequire(import.meta.url);
const origin = 'http://127.0.0.1:4321';
const children = new Set();
let stopping = false;
let tunnelDeadline;

function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  clearTimeout(tunnelDeadline);
  for (const child of children) child.kill('SIGTERM');
  // Bound shutdown even if an external binary refuses to exit.
  const deadline = setTimeout(() => {
    for (const child of children) child.kill('SIGKILL');
    process.exit(code);
  }, 4000);
  deadline.unref();
  process.exitCode = code;
}

function launch(command, args, label, stdio) {
  // The preview processes have no reason to inherit repository credentials.
  const env = { ...process.env };
  delete env.GITHUB_TOKEN;
  const child = spawn(command, args, { stdio, env });
  children.add(child);
  child.on('error', (error) => {
    console.error(`${label} could not start: ${error.message}`);
    children.delete(child);
    stop(1);
  });
  child.on('exit', (code, signal) => {
    children.delete(child);
    if (!stopping) {
      console.error(`${label} stopped (${signal ?? code}). Closing preview.`);
      stop(code || 1);
    }
  });
  return child;
}

async function assertPortAvailable() {
  await new Promise((resolvePort, reject) => {
    const server = createServer();
    server.once('error', () =>
      reject(
        new Error(
          'Port 4321 is already in use. Stop the existing process before starting this preview.',
        ),
      ),
    );
    server.listen(4321, '127.0.0.1', () => server.close(resolvePort));
  });
}

async function waitForAstro() {
  for (let attempt = 0; attempt < 120 && !stopping; attempt++) {
    try {
      const response = await fetch(origin, {
        signal: AbortSignal.timeout(1500),
      });
      await response.body?.cancel();
      if (response.ok) return;
    } catch {
      /* Astro is still starting. */
    }
    await delay(250);
  }
  if (!stopping)
    throw new Error('Astro did not become ready; no tunnel was opened.');
}

process.once('SIGINT', () => stop(0));
process.once('SIGTERM', () => stop(0));

try {
  await assertPortAvailable();
  if (!existsSync(bin)) {
    console.log('Installing the project cloudflared binary…');
    await install(bin);
  }
  if (!stopping) {
    const astroBin = resolve(
      dirname(require.resolve('astro/package.json')),
      'bin/astro.mjs',
    );
    launch(
      process.execPath,
      [astroBin, 'dev', '--host', '127.0.0.1', '--port', '4321'],
      'Astro',
      'inherit',
    );
    await waitForAstro();
  }
  if (!stopping) {
    console.log('Opening a temporary public HTTPS preview…');
    const tunnel = launch(bin, ['tunnel', '--url', origin], 'cloudflared', [
      'ignore',
      'pipe',
      'pipe',
    ]);
    let announced = false;
    tunnelDeadline = setTimeout(() => {
      console.error(
        'cloudflared did not return a public URL within 90 seconds. Check network access and try again.',
      );
      stop(1);
    }, 90_000);

    // readline handles URLs split across chunks on either output stream.
    for (const stream of [tunnel.stdout, tunnel.stderr]) {
      createInterface({ input: stream }).on('line', (line) => {
        console.log(`[cloudflared] ${line}`);
        const url = findPreviewUrl(line);
        if (url && !announced) {
          announced = true;
          clearTimeout(tunnelDeadline);
          console.log(`\nPublic preview: ${url}\n`);
          console.log(
            'Temporary preview; keep this process running. Ctrl+C stops both services.',
          );
        }
      });
    }
  }
} catch (error) {
  console.error(
    error instanceof Error ? error.message : 'Preview failed to start.',
  );
  stop(1);
}
