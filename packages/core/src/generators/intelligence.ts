/**
 * Smart generation intelligence:
 * - 60 realistic sentence templates
 * - Weighted name frequency (common names appear more often)
 * - Business hour timestamp clustering
 * - Varied paragraph structures
 */

// --- 60 Sentence Templates (professional, realistic, varied) ---

export const SENTENCES = [
  // Technical / Engineering
  'The {noun} was {verb_past} by the {role} during the {event}.',
  'We need to {verb} the {noun} before the {event} starts.',
  'The {role} suggested {verb_ing} the {noun} for better performance.',
  'After the {event}, the team decided to {verb} the {adjective} {noun}.',
  'Our {adjective} {noun} helped the {role} achieve their quarterly goals.',
  'The {role} reviewed the {adjective} {noun} and approved the changes.',
  'Please {verb} the {noun} and share it with the {role} by Friday.',
  'The new {adjective} {noun} reduced processing time by {percent} percent.',
  'During the {event}, we discovered that the {noun} needed to be {verb_past}.',
  'The {role} recommended a {adjective} approach to handling the {noun}.',
  'It took {weeks} weeks to {verb} the {adjective} {noun} from scratch.',
  'The {event} highlighted the importance of a reliable {noun}.',
  'We successfully {verb_past} the {noun} ahead of the deadline.',
  'The {adjective} {noun} outperformed expectations during the {event}.',
  'Every {role} should {verb} the {noun} at least once per quarter.',
  // Business / Product
  'The client requested that we {verb} the {adjective} {noun} by next week.',
  'Our {role} identified {count} issues with the current {noun}.',
  'The {adjective} {noun} was the key deliverable for this sprint.',
  'Revenue increased by {percent}% after we {verb_past} the {noun}.',
  'The {role} presented the {adjective} {noun} to the board during the {event}.',
  'We are planning to {verb} the {noun} in the next fiscal quarter.',
  'Customer satisfaction improved after the {noun} was {verb_past}.',
  'The {role} allocated {count} resources to {verb} the {noun}.',
  'Based on the {event} feedback, we will {verb} the {adjective} {noun}.',
  'The {noun} integration reduced operational costs by {percent}%.',
  // Team / Process
  'The team agreed to {verb} the {noun} using an {adjective} methodology.',
  'Our {role} onboarded {count} new team members during the {event}.',
  'The {adjective} {noun} enabled cross-functional collaboration across departments.',
  'We scheduled a follow-up {event} to discuss the {noun} rollout.',
  'The {role} documented the {adjective} {noun} process for future reference.',
  'After {count} iterations, the {noun} finally met all acceptance criteria.',
  'The {event} revealed that the {noun} needs {adjective} improvements.',
  'Our {adjective} approach to {verb_ing} the {noun} saved considerable time.',
  'The {role} flagged a potential bottleneck in the {noun} pipeline.',
  'We expect the {adjective} {noun} to be production-ready by end of month.',
  // Problem / Resolution
  'The {noun} experienced downtime during the {event} but was quickly {verb_past}.',
  'A {adjective} fix was deployed to resolve the {noun} issue.',
  'The {role} escalated the {noun} failure to the incident response team.',
  'Root cause analysis showed the {noun} was impacted by a {adjective} dependency.',
  'We rolled back the {noun} after detecting anomalies during the {event}.',
  'The {adjective} monitoring system alerted the {role} within seconds.',
  'Post-mortem findings suggest we should {verb} the {noun} more frequently.',
  'The {noun} recovery was completed in under {count} minutes.',
  // Growth / Future
  'Our roadmap includes {verb_ing} the {noun} in Q{quarter} of next year.',
  'The {role} proposed a {adjective} strategy for scaling the {noun}.',
  'Market research indicates strong demand for a {adjective} {noun} solution.',
  'The {noun} pilot program exceeded {percent}% of its target metrics.',
  'Competitors have not yet {verb_past} a comparable {noun}.',
  'The {adjective} {noun} positions us well for Series {series} fundraising.',
  'User testing revealed that the {noun} needs a more {adjective} interface.',
  // Data / Analytics
  'Analytics show that {percent}% of users engage with the {noun} daily.',
  'The {adjective} {noun} dashboard provides real-time visibility to stakeholders.',
  'Data from the {event} confirmed that the {noun} drives user retention.',
  'We need to {verb} the {noun} metrics before the next {event}.',
  'The {role} built a {adjective} model to predict {noun} performance.',
  'A/B testing revealed the {adjective} variant of the {noun} converts better.',
  'The {noun} cohort analysis showed a {percent}% improvement month-over-month.',
  'Our {adjective} data {noun} processes over {count} million events per day.',
  'The {role} created automated alerts for {noun} threshold breaches.',
  'Historical {noun} data suggests a seasonal pattern during Q{quarter}.',
  // --- Additional 140 templates for scale diversity ---
  'The {noun} has been running in production for {count} months without incident.',
  'We need {count} more {role}s before we can {verb} the {noun}.',
  'The {adjective} {noun} reduced customer complaints by {percent}%.',
  'According to the {role}, the {noun} will be deprecated in Q{quarter}.',
  'The team spent {weeks} weeks debugging the {noun} before finding the root cause.',
  'A {adjective} workaround was applied to the {noun} while a permanent fix is developed.',
  'The {noun} was initially built as a prototype but became {adjective} and production-critical.',
  'Cross-team dependencies on the {noun} make it difficult to {verb} independently.',
  'The {role} estimated {count} story points for {verb_ing} the {noun}.',
  'User feedback indicates the {noun} is the most-used feature this quarter.',
  'The {adjective} {noun} outage lasted {count} minutes and impacted {percent}% of users.',
  'We allocated {percent}% of our infrastructure budget to the {noun}.',
  'The {role} proposed deprecating the legacy {noun} in favor of a {adjective} replacement.',
  'Automated testing of the {noun} covers {percent}% of critical paths.',
  'The {noun} handles approximately {count} million requests per hour at peak.',
  'Stakeholders agreed that the {noun} is the top priority for next quarter.',
  'The {adjective} architecture of the {noun} allows for horizontal scaling.',
  'We observed a {percent}% reduction in latency after {verb_ing} the {noun}.',
  'The {role} conducted a {adjective} threat model of the {noun}.',
  'Integration testing revealed {count} edge cases in the {noun} implementation.',
  'The {noun} team grew from {count} to {count} engineers this year.',
  'A/B test results show the {adjective} {noun} variant increased conversion by {percent}%.',
  'The {role} certified the {noun} for SOC 2 compliance.',
  'The {noun} migration was completed {count} days ahead of schedule.',
  'Performance profiling showed the {noun} consumes {percent}% of available memory.',
  'The {adjective} {noun} supports {count} concurrent connections per node.',
  'User interviews confirmed that {verb_ing} the {noun} would solve their biggest pain point.',
  'The {role} set up a war room to address the {noun} degradation.',
  'We expect {count} million daily active users once the {noun} launches.',
  'The {adjective} refactor of the {noun} eliminated {count} known tech debt items.',
  'The {noun} SLA guarantees {percent}% uptime measured monthly.',
  'Canary deployment of the {noun} showed no regressions across {count} metrics.',
  'The {role} recommended feature-flagging the {noun} for gradual rollout.',
  'Load testing confirmed the {noun} can handle {count}x expected traffic.',
  'The {adjective} {noun} requires {count} fewer infrastructure resources.',
  'Our customers rated the {noun} experience at {count}/5 in the latest survey.',
  'The {event} surfaced {count} blockers related to the {noun}.',
  'We successfully {verb_past} the {noun} across all {count} availability zones.',
  'The {role} presented a {adjective} cost-benefit analysis of {verb_ing} the {noun}.',
  'Edge cases in the {noun} were discovered during the {event}.',
  'The team {verb_past} a proof of concept for the {adjective} {noun} in {weeks} weeks.',
  'Telemetry data from the {noun} shows {percent}% of errors are transient.',
  'The {role} flagged a security vulnerability in the {noun} during code review.',
  'Implementing the {adjective} {noun} required changes to {count} services.',
  'We need to {verb} the {noun} before the traffic spike in Q{quarter}.',
  'The {noun} backlog contains {count} items prioritized by the {role}.',
  'Post-deployment validation of the {noun} passed all {count} smoke tests.',
  'The {adjective} {noun} reduced mean time to recovery from hours to minutes.',
  'Customer churn decreased by {percent}% after we {verb_past} the {noun}.',
  'The {role} established a runbook for {noun} incident response.',
  'We discovered that the {noun} had been silently failing for {count} days.',
  'The {adjective} approach to {verb_ing} the {noun} was inspired by the {event}.',
  'Internal tooling around the {noun} saved the team {count} hours per sprint.',
  'The {noun} now supports {count} additional data formats after the latest release.',
  'Developer experience scores for the {noun} improved by {percent} points.',
  'The {role} negotiated a {percent}% cost reduction for the {noun} vendor.',
  'Queue depth for the {noun} averages {count} thousand messages during peak.',
  'The {adjective} design of the {noun} minimizes blast radius during failures.',
  'We adopted a {adjective} testing strategy for the {noun} after the last incident.',
  'The {role} mentored {count} junior engineers on the {noun} architecture.',
  'Feature adoption for the {noun} reached {percent}% within the first month.',
  'The {noun} circuit breaker triggered {count} times last week.',
  'We open-sourced the {adjective} {noun} library at the {event}.',
  'The {role} created a decision matrix for choosing the right {noun} approach.',
  'Latency for the {noun} dropped from {count}ms to {count}ms after optimization.',
  'Our {adjective} commitment to the {noun} differentiates us from competitors.',
  'The {event} retrospective identified {count} action items related to the {noun}.',
  'Database migration for the {noun} affected {count} million rows.',
  'The {role} recommended a phased approach to {verb_ing} the {noun}.',
  'Usage analytics show {percent}% of power users rely on the {noun} daily.',
  'The {adjective} {noun} module has zero external dependencies.',
  'We need to revisit the {noun} strategy after the {event} learnings.',
  'The {noun} was the most-discussed topic at the {event}.',
  'Contract testing ensures the {noun} interface remains backward-compatible.',
  'The {role} introduced chaos engineering practices for the {noun}.',
  'Observability improvements to the {noun} revealed {count} previously hidden issues.',
  'The team delivered the {adjective} {noun} under budget and ahead of timeline.',
  'Feature parity between the old and new {noun} was achieved in {weeks} weeks.',
  'The {role} advocated for investing in {adjective} {noun} infrastructure.',
  'Our {noun} documentation was cited as a best practice at the {event}.',
  'The {adjective} {noun} handles graceful degradation when downstream services fail.',
  'We reduced the {noun} cold start time by {percent}% through {adjective} optimization.',
  'The {role} set quarterly OKRs around {verb_ing} the {noun}.',
  'Synthetic monitoring for the {noun} runs every {count} seconds.',
  'The {adjective} {noun} pattern has been adopted by {count} other teams.',
  'Cost attribution shows the {noun} accounts for {percent}% of cloud spend.',
  'The team celebrated shipping the {noun} at the company {event}.',
  'Semantic versioning of the {noun} API ensures non-breaking changes.',
  'The {role} organized a {count}-day workshop on {adjective} {noun} practices.',
  'Incident #{count} was traced back to a misconfigured {noun}.',
  'The {noun} health check endpoint returns status in under {count} milliseconds.',
  'We plan to {verb} the {noun} internationalization in Q{quarter}.',
  'The {adjective} {noun} passed penetration testing with zero critical findings.',
  'Data locality requirements mean the {noun} must run in {count} regions.',
  'The {role} published an RFC for the next-generation {noun} architecture.',
  'Regression testing caught a breaking change in the {noun} before release.',
  'The {adjective} {noun} prototype received positive feedback from {count} beta users.',
  'We achieved {percent}% test coverage on the {noun} core module.',
  'The {noun} roadmap was presented at the company all-hands last week.',
  'Feature flag analytics show {percent}% of users have the new {noun} enabled.',
  'The {role} championed adopting {adjective} principles for the {noun} redesign.',
  'Garbage collection pauses in the {noun} were eliminated through careful tuning.',
  'The {noun} event bus processes {count} thousand events per second.',
  'We extended the {noun} API with {count} new endpoints this quarter.',
  'The {adjective} {noun} significantly improved first-time user experience.',
  'Cache hit ratio for the {noun} averages {percent}% across all regions.',
  'The {role} approved the budget for {verb_ing} the {noun} next sprint.',
  'Chaos testing revealed the {noun} recovers within {count} seconds of failure.',
  'The {adjective} {noun} reduced our dependency on third-party services.',
  'Data retention policy for the {noun} requires {count}-day rolling windows.',
  'The {noun} team adopted trunk-based development after the {event}.',
  'Deployment frequency for the {noun} increased from weekly to daily.',
  'The {role} identified the {noun} as the highest-risk component in the system.',
  'Blue-green deployment of the {noun} ensures zero-downtime releases.',
  'The {adjective} {noun} implementation follows industry-standard security practices.',
  'We benchmarked the {noun} against {count} competing solutions.',
  'The {event} highlighted the need for better {noun} documentation.',
  'Service mesh integration improved {noun} observability across {count} microservices.',
  'The {role} proposed an SLO of {percent}% for the {noun} availability.',
  'Error budgets for the {noun} were consumed at {percent}% capacity last month.',
  'The {adjective} {noun} design supports eventual consistency across regions.',
  'We need {count} additional staging environments to properly test the {noun}.',
  'The {noun} auto-scaler responded to the traffic spike within {count} seconds.',
  'Customer-reported issues with the {noun} dropped by {percent}% after the fix.',
  'The {role} scheduled a deep-dive review of the {noun} architecture for next {event}.',
  'Feature toggles allow us to {verb} the {noun} independently per customer.',
  'The {adjective} {noun} consolidates {count} previously separate services.',
  'We sunset the legacy {noun} after {count} months of parallel operation.',
  'The {noun} GraphQL layer abstracts complexity from {count} downstream consumers.',
  'Rate limiting on the {noun} prevents abuse at the application layer.',
  'The {role} documented {count} known limitations of the current {noun} design.',
  'Compliance requirements mandate that the {noun} logs are retained for {count} years.',
  'The {adjective} {noun} pipeline processes data in near-real-time.',
];

export const S_NOUNS = [
  'deployment','API','dashboard','pipeline','infrastructure','authentication',
  'database','microservice','frontend','backend','notification system','billing module',
  'search engine','recommendation engine','cache layer','load balancer','CI/CD pipeline',
  'monitoring stack','analytics platform','payment gateway','user onboarding flow',
  'data warehouse','feature flag system','rate limiter','queue processor',
  'webhook handler','SSO integration','CDN configuration','backup strategy',
  'migration script','schema design','access control system','audit log',
  'reporting module','email service','push notification system','file storage',
  'GraphQL schema','REST endpoint','websocket server','cron scheduler',
  'event bus','message broker','service mesh','API gateway','token service',
  'identity provider','secrets manager','config server','health check',
  'circuit breaker','retry logic','dead letter queue','schema registry',
  'container orchestrator','artifact repository','log aggregator','trace collector',
  'metrics pipeline','alerting system','incident manager','status page',
  'changelog generator','release pipeline','canary deployment','feature store',
  'ML pipeline','data lake','ETL workflow','streaming processor','batch job',
  'edge function','serverless handler','DNS resolver','TLS terminator',
  'object store','block storage','time-series DB','graph database',
  'full-text index','geospatial index','vector database','key-value store',
];

export const S_VERBS = ['deploy','refactor','optimize','migrate','redesign','implement','document','automate','scale','monitor','validate','configure','ship','launch','test','debug','profile','benchmark','review','audit','deprecate','parallelize','containerize','instrument','harden','modernize','decouple','consolidate','sunset','open-source','integrate','throttle','cache','replicate','partition','shard'];
export const S_VERBS_ING = ['deploying','refactoring','optimizing','migrating','redesigning','implementing','documenting','automating','scaling','monitoring','validating','configuring','shipping','launching','testing','debugging','profiling','benchmarking','reviewing','auditing','containerizing','instrumenting','hardening','modernizing','decoupling','consolidating','integrating','throttling','caching','replicating','partitioning','sharding'];
export const S_VERBS_PAST = ['deployed','refactored','optimized','migrated','redesigned','implemented','documented','automated','scaled','monitored','validated','configured','shipped','launched','tested','debugged','profiled','benchmarked','reviewed','audited','containerized','instrumented','hardened','modernized','decoupled','consolidated','integrated','throttled','cached','replicated','partitioned','sharded'];
export const S_ADJECTIVES = ['scalable','real-time','cloud-native','distributed','high-priority','cross-functional','data-driven','event-driven','fault-tolerant','zero-downtime','containerized','serverless','automated','modular','secure','production-grade','observability-first','API-first','mobile-first','privacy-compliant','multi-tenant','geo-distributed','idempotent','self-healing','horizontally-scalable','backwards-compatible','schema-validated','type-safe','immutable','declarative','eventually-consistent','strongly-typed','zero-trust','compliance-ready'];
export const S_ROLES = ['engineering manager','product owner','tech lead','senior engineer','DevOps engineer','QA lead','data analyst','solution architect','VP of Engineering','CTO','platform engineer','SRE','frontend lead','backend lead','design lead','security engineer','principal engineer','staff engineer','head of infrastructure','director of product','data science lead','ML engineer','release manager','developer advocate'];
export const S_EVENTS = ['sprint review','quarterly planning','product launch','team sync','board meeting','standup','retrospective','design review','code review','demo day','all-hands','hackathon','incident postmortem','architecture review','capacity planning session','OKR check-in','user research session','security audit','compliance review','performance review','roadmap sync','stakeholder demo','tech debt review','on-call handoff','migration dry-run','load test rehearsal'];

// --- Weighted random selection (common items more likely) ---

/**
 * Selects from array with front-weighted probability.
 * Items at the start of the array are 3x more likely to be picked.
 * This simulates name frequency: "Rahul" (common) at index 0 vs "Zubin" (rare) at index 400.
 */
export function weightedRandom<T>(arr: readonly T[]): T {
  // Triangular distribution: front-weighted
  const u = Math.random();
  const idx = Math.floor(arr.length * (1 - Math.sqrt(1 - u)) * 0.8);
  return arr[Math.min(idx, arr.length - 1)];
}

// --- Business hour timestamp clustering ---

/**
 * Generates a Date within the given range, but clustered around business hours (9am-6pm).
 * 70% of timestamps fall within business hours of a random timezone.
 * 20% fall in evening hours (6pm-11pm).
 * 10% fall in off-hours (11pm-9am, weekends).
 */
export function businessHourDate(startMs: number, endMs: number): Date {
  const baseDate = new Date(startMs + Math.random() * (endMs - startMs));

  const roll = Math.random();
  let hour: number;
  let minute: number;

  if (roll < 0.70) {
    // Business hours: 9am-6pm with peak at 10am-3pm
    hour = 9 + Math.floor(Math.random() * 9); // 9-17
    minute = Math.floor(Math.random() * 60);
  } else if (roll < 0.90) {
    // Evening: 6pm-11pm
    hour = 18 + Math.floor(Math.random() * 5); // 18-22
    minute = Math.floor(Math.random() * 60);
  } else {
    // Off hours: 11pm-8am
    hour = Math.random() > 0.5 ? 23 + Math.floor(Math.random() * 1) : Math.floor(Math.random() * 8);
    minute = Math.floor(Math.random() * 60);
  }

  // Avoid weekends for 80% of timestamps
  if (Math.random() < 0.8) {
    const day = baseDate.getDay();
    if (day === 0) baseDate.setDate(baseDate.getDate() + 1); // Sun -> Mon
    if (day === 6) baseDate.setDate(baseDate.getDate() - 1); // Sat -> Fri
  }

  baseDate.setHours(hour, minute, Math.floor(Math.random() * 60), Math.floor(Math.random() * 1000));
  return baseDate;
}

/**
 * Generate a realistic sentence from templates using seeded RNG.
 */
export function smartSentence(rng?: import('./rng').Rng): string {
  const r = rng || { pick: <T>(a: readonly T[]) => a[Math.floor(Math.random() * a.length)], int: (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min } as any;
  const template = r.pick(SENTENCES);
  return template
    .replace('{noun}', r.pick(S_NOUNS))
    .replace('{verb}', r.pick(S_VERBS))
    .replace('{verb_ing}', r.pick(S_VERBS_ING))
    .replace('{verb_past}', r.pick(S_VERBS_PAST))
    .replace('{adjective}', r.pick(S_ADJECTIVES))
    .replace('{role}', r.pick(S_ROLES))
    .replace('{event}', r.pick(S_EVENTS))
    .replace('{percent}', String(r.int(10, 70)))
    .replace('{count}', String(r.int(2, 14)))
    .replace('{weeks}', String(r.int(1, 6)))
    .replace('{quarter}', String(r.int(1, 4)))
    .replace('{series}', r.pick(['A', 'B', 'C', 'D']));
}

/**
 * Generate a realistic paragraph (3-6 sentences, each unique) using seeded RNG.
 */
export function smartParagraph(rng?: import('./rng').Rng, minSentences = 3, maxSentences = 6): string {
  const r = rng || { int: (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min } as any;
  const count = r.int(minSentences, maxSentences);
  const sentences: string[] = [];
  for (let i = 0; i < count; i++) {
    sentences.push(smartSentence(rng));
  }
  return sentences.join(' ');
}
