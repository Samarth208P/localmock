# LocalMock SEO Roadmap

## Next SEO Sprint

1. Add more public social/entity profiles when they exist.
   - Added LinkedIn to `sameAs` and removed private GitHub from schema.
   - Added `support@localmock.dev` as the organization support email.
   - Candidate profiles: X/Twitter, Product Hunt, public GitHub, relevant directories.
   - Add only canonical profile URLs that return `200`.

2. Create dedicated landing pages for high-intent searches. Completed 2026-07-15.
   - `/tools/csv-test-data-generator`
   - `/tools/json-mock-data-generator`
   - `/tools/sql-seed-data-generator`
   - `/mockaroo-alternative`
   - `/templates/users`
   - `/templates/products`
   - `/templates/orders`
   - `/templates/invoices`
   - `/templates/api-logs`

3. Link new pages from the homepage and navigation. Completed 2026-07-15.
   - Add contextual homepage links to top tool/template pages.
   - Add footer links for templates, comparisons, and major export formats.
   - Keep anchor text descriptive and varied.

4. Update `sitemap.xml`. Completed 2026-07-15.
   - Include every new indexable page.
   - Set accurate `lastmod` values during deploy.

5. Add page-specific schema. Completed 2026-07-15.
   - Use `BreadcrumbList` on subpages.
   - Use `WebApplication` or `SoftwareApplication` only where the page represents the tool.
   - Avoid `FAQPage` and `HowTo` schema.

6. Measure performance after deploy.
   - Rerun the SEO report on `https://localmock.dev/`.
   - Run PageSpeed with an API key or Lighthouse to collect LCP, INP, and CLS.
   - Fix any measured Core Web Vitals issues before expanding page count.

## Target Outcome

- Short term after removing private `sameAs`: 87-89 SEO score.
- After public profiles and stronger internal links: 90-93.
- After dedicated pages, sitemap updates, and breadcrumb schema: 92-95.
- With passing Core Web Vitals and stronger public entity signals: 94-97.
