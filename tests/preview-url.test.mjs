import assert from 'node:assert/strict';
import { test } from 'node:test';
import { findPreviewUrl } from '../scripts/preview-url.mjs';

test('extracts a public HTTPS quick-tunnel URL from Cloudflare output', () => {
  assert.equal(
    findPreviewUrl('2026 INF | https://quiet-green-sun.trycloudflare.com  |'),
    'https://quiet-green-sun.trycloudflare.com',
  );
});

test('accepts URL-only output and ignores paths', () => {
  assert.equal(
    findPreviewUrl('https://preview123.trycloudflare.com'),
    'https://preview123.trycloudflare.com',
  );
  assert.equal(
    findPreviewUrl('Visit https://quiet-green.trycloudflare.com/ now'),
    'https://quiet-green.trycloudflare.com',
  );
});

test('rejects non-preview, insecure, malformed, and lookalike URLs', () => {
  for (const line of [
    'https://dash.cloudflare.com',
    'http://quiet-green.trycloudflare.com',
    'https://quiet-green.trycloudflare.com.evil.example',
    'https://quiet-green.trycloudflare.com@evil.example',
    'https://-bad.trycloudflare.com',
    'https://bad-.trycloudflare.com',
    'https://quiet-green.trycloudflare.co',
    'Waiting for a connection',
  ])
    assert.equal(findPreviewUrl(line), undefined);
});
