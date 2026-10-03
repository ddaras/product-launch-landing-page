export type AnalyticsEvent = 'page_view' | 'primary_cta_click';

/**
 * Local-only integration seam. No network requests, cookies, or storage.
 * Add an approved provider and consent handling here before collecting data.
 */
export function track(event: AnalyticsEvent): void {
  if (import.meta.env.PUBLIC_ANALYTICS_ENABLED !== 'true') return;
  if (navigator.doNotTrack === '1') return;

  window.dispatchEvent(
    new CustomEvent('launch:analytics', {
      detail: { event, path: window.location.pathname },
    }),
  );
}

export function initAnalytics(): void {
  if (import.meta.env.PUBLIC_ANALYTICS_ENABLED !== 'true') return;
  track('page_view');
  document
    .querySelector('[data-analytics="explore-launch"]')
    ?.addEventListener('click', () => {
      track('primary_cta_click');
    });
}
