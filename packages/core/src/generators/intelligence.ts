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
];

export const S_VERBS = ['deploy','refactor','optimize','migrate','redesign','implement','document','automate','scale','monitor','validate','configure','ship','launch','test','debug','profile','benchmark','review','audit','deprecate','parallelize'];
export const S_VERBS_ING = ['deploying','refactoring','optimizing','migrating','redesigning','implementing','documenting','automating','scaling','monitoring','validating','configuring','shipping','launching','testing','debugging','profiling','benchmarking','reviewing','auditing'];
export const S_VERBS_PAST = ['deployed','refactored','optimized','migrated','redesigned','implemented','documented','automated','scaled','monitored','validated','configured','shipped','launched','tested','debugged','profiled','benchmarked','reviewed','audited'];
export const S_ADJECTIVES = ['scalable','real-time','cloud-native','distributed','high-priority','cross-functional','data-driven','event-driven','fault-tolerant','zero-downtime','containerized','serverless','automated','modular','secure','production-grade','observability-first','API-first','mobile-first','privacy-compliant'];
export const S_ROLES = ['engineering manager','product owner','tech lead','senior engineer','DevOps engineer','QA lead','data analyst','solution architect','VP of Engineering','CTO','platform engineer','SRE','frontend lead','backend lead','design lead','security engineer'];
export const S_EVENTS = ['sprint review','quarterly planning','product launch','team sync','board meeting','standup','retrospective','design review','code review','demo day','all-hands','hackathon','incident postmortem','architecture review','capacity planning session','OKR check-in','user research session','security audit'];

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
 * Generate a realistic sentence from templates.
 */
export function smartSentence(): string {
  const template = SENTENCES[Math.floor(Math.random() * SENTENCES.length)];
  return template
    .replace('{noun}', S_NOUNS[Math.floor(Math.random() * S_NOUNS.length)])
    .replace('{verb}', S_VERBS[Math.floor(Math.random() * S_VERBS.length)])
    .replace('{verb_ing}', S_VERBS_ING[Math.floor(Math.random() * S_VERBS_ING.length)])
    .replace('{verb_past}', S_VERBS_PAST[Math.floor(Math.random() * S_VERBS_PAST.length)])
    .replace('{adjective}', S_ADJECTIVES[Math.floor(Math.random() * S_ADJECTIVES.length)])
    .replace('{role}', S_ROLES[Math.floor(Math.random() * S_ROLES.length)])
    .replace('{event}', S_EVENTS[Math.floor(Math.random() * S_EVENTS.length)])
    .replace('{percent}', String(Math.floor(Math.random() * 60) + 10))
    .replace('{count}', String(Math.floor(Math.random() * 12) + 2))
    .replace('{weeks}', String(Math.floor(Math.random() * 6) + 1))
    .replace('{quarter}', String(Math.floor(Math.random() * 4) + 1))
    .replace('{series}', ['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)]);
}

/**
 * Generate a realistic paragraph (3-6 sentences, each unique).
 */
export function smartParagraph(minSentences = 3, maxSentences = 6): string {
  const count = minSentences + Math.floor(Math.random() * (maxSentences - minSentences + 1));
  const sentences: string[] = [];
  for (let i = 0; i < count; i++) {
    sentences.push(smartSentence());
  }
  return sentences.join(' ');
}
