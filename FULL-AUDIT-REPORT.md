# Full Audit Report

- URL: `https://localmock.dev/`
- Generated: `2026-07-15T12:45:16.151929`
- Overall score: `81/100`
- Score confidence: `Medium`
- Scoring version: `1`

## Score Card

| Category | Weight | Score |
| --- | ---: | ---: |
| Security Headers | 8 | 85 |
| Social Meta | 5 | 85 |
| Robots and Crawlers | 8 | 90 |
| Broken Links | 10 | 100 |
| Internal Links | 8 | 80 |
| Redirects | 3 | 100 |
| AI Search | 5 | 70 |
| Performance and Core Web Vitals | 13 | 0 |
| On-Page SEO | 10 | 100 |
| Readability | 8 | 84 |
| Entity SEO | 5 | 0 |
| Link Profile | 7 | 55 |
| Hreflang | 5 | 0 |
| Content Uniqueness | 5 | 100 |

## Findings

| Severity | Area | Finding | Evidence | Fix |
| --- | --- | --- | --- | --- |
| Critical | Schema | No Organization/Person entity found in JSON-LD. |  | Add Organization or Person schema with name, url, logo, and sameAs properties. |
| Warning | Schema | FAQPage schema is restricted for this site type. | `parse_html.py` detected `FAQPage` and marked status `restricted`; FAQ rich results are limited to government/health authority sites. | Remove FAQPage JSON-LD or replace with eligible JSON-LD such as WebSite, WebApplication, SoftwareApplication, Organization, and BreadcrumbList where applicable. |
| Critical | link_profile | Average internal links per page is only 1.0 (target: 5-10). |  | Increase internal linking by adding contextual links within content. |
| Warning | environment | 1 security headers missing | Missing headers reduce trust and can expose the site to browser/security risks. | Set missing security headers at web server or CDN layer. |
| Warning | internal_links | ⚠️ 2 page(s) have fewer than 3 internal links |  |  |
| Warning | readability | ⚠️ 25.9% complex words (3+ syllables) — consider simplifying |  |  |
| Warning | readability | ⚠️ Thin content (27 words) — may rank poorly |  |  |
| Warning | robots | ⚠️ 6 AI crawlers not explicitly managed: Applebot-Extended, Bytespider, CCBot, anthropic-ai, FacebookBot |  |  |
| Warning | security | ⚠️ HSTS missing includeSubDomains directive |  |  |
| Warning | security | ⚠️ 1 security header(s) missing |  |  |
| Info | Wikidata | No Wikidata entry found for 'LocalMock'. |  | If the entity meets Wikidata notability guidelines, create or improve an item with accurate third-party references. Do not create one solely for SEO. |
| Info | Wikipedia | No Wikipedia article found for 'LocalMock'. |  | Only pursue Wikipedia if the entity meets independent notability standards. Otherwise, strengthen official schema, sameAs profiles, citations, and About/Contact signals. |
| info | article | article measurement incomplete | [article_seo.py] Traceback (most recent call last): File "C:\Users\samar\.codex\skills\agentic-seo-skill\scripts\article_seo.py", line 637, in <module> main() ~~~~^^ File "C:\Users\samar\.codex\skills\agentic-seo-skill\scripts\article_seo.py", line 537, in main structured_data = extract_structured_data(soup) File "C:\Users\samar\.codex\skills\agentic-seo-skill\scripts\article_seo.py", line 272, in extract_structured_data if schema_type in DEPRECATED_SCHEMA: ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ TypeError: unhashable type: 'list' | Rerun this check after resolving the environment/API/network limitation. |
| Info | environment | Performance measurement incomplete | PageSpeed API returned an error, so CWV recommendations are less reliable. | Set `PAGESPEED_API_KEY` in your environment or `.env` file (see `.env.example`), then rerun. The CLI also accepts `--api-key`. Prioritize LCP/INP/CLS fixes from that output. |
| info | pagespeed | pagespeed measurement incomplete | Rate limited by Google API. Wait a few minutes or add an API key. | Rerun this check after resolving the environment/API/network limitation. |
| Info | readability | ℹ️ Content readability is moderate (Flesch: 50.4) — suitable for educated audience |  |  |
| Info | sameAs | Missing sameAs link to Wikipedia (Primary KG signal). |  | Add the existing official 'wikipedia.org' URL to sameAs; do not create this profile solely for SEO. |
| Info | sameAs | Missing sameAs link to Wikidata (Primary KG signal). |  | Add the existing official 'wikidata.org' URL to sameAs; do not create this profile solely for SEO. |
| Info | sameAs | Missing sameAs link to LinkedIn (Strong KG signal). |  | Add 'linkedin.com' profile URL to sameAs array in your entity schema. |
| Info | sameAs | Missing sameAs link to Twitter/X (Strong KG signal). |  | Add 'x.com' profile URL to sameAs array in your entity schema. |

## Measurement Notes

2 checks returned errors or incomplete measurements; treat affected scores as directional.
