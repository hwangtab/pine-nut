declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

// Track custom events
export function trackEvent(action: string, category: string, label?: string, value?: number) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
}

// Predefined events for the funnel
export const events = {
  // Awareness
  pageView: (page: string) => trackEvent('page_view', 'navigation', page),

  // Engagement
  scrollDepth: (depth: number) => trackEvent('scroll_depth', 'engagement', `${depth}%`),
  videoPlay: () => trackEvent('video_play', 'engagement', 'youtube_embed'),
  timelineExpand: (event: string) => trackEvent('timeline_expand', 'engagement', event),

  // Action
  signatureStart: () => trackEvent('signature_start', 'conversion', 'form_focus'),
  signatureComplete: () => trackEvent('signature_complete', 'conversion', 'form_submit'),
  donateClick: () => trackEvent('donate_click', 'conversion', 'external_link'),

  // Advocacy
  shareClick: (platform: string) => trackEvent('share_click', 'advocacy', platform),
  cardNewsDownload: (card: string) => trackEvent('cardnews_download', 'advocacy', card),

  // Press
  pressKitDownload: (item: string) => trackEvent('presskit_download', 'press', item),
};
