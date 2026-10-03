/** Parse only HTTPS quick-tunnel hosts, never dashboard or documentation links. */
export function findPreviewUrl(line) {
  return line.match(
    /https:\/\/[a-z0-9]+(?:-[a-z0-9]+)*\.trycloudflare\.com(?=[\s/]|$)/i,
  )?.[0];
}
