import { useEffect } from 'react';
import { PAGE_SEO, SITE_NAME, SITE_OG_IMAGE, SITE_URL } from '@/lib/site';

type AppStep = keyof typeof PAGE_SEO;

function setMeta(name: string, content: string, attribute: 'name' | 'property' = 'name') {
  let el = document.querySelector(`meta[${attribute}="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attribute, name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setCanonical(url: string) {
  let el = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement('link');
    el.rel = 'canonical';
    document.head.appendChild(el);
  }
  el.href = url;
}

/**
 * Updates document title, meta description, Open Graph, Twitter, and canonical URL per app step.
 */
export function usePageSeo(step: AppStep) {
  useEffect(() => {
    const seo = PAGE_SEO[step];
    const canonical = `${SITE_URL}${window.location.pathname}`;

    document.title = seo.title;
    setMeta('description', seo.description);
    setMeta('og:title', seo.title, 'property');
    setMeta('og:description', seo.description, 'property');
    setMeta('og:url', canonical, 'property');
    setMeta('twitter:title', seo.title);
    setMeta('twitter:description', seo.description);
    setMeta('twitter:image', SITE_OG_IMAGE);
    setMeta('og:image', SITE_OG_IMAGE, 'property');
    setMeta('og:site_name', SITE_NAME, 'property');
    setCanonical(canonical);
  }, [step]);
}
