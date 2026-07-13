# Data Realism Audit — Issues & Fixes

## Executive Summary

A deep-dive audit of every data type generator. The goal: every generated row must look like it came from a real database, not a random number generator.

---

## Critical Issues Found

### 1. SENTENCES & TEXT — Random word soup (CRITICAL)
**Problem:** `sentence()` picks random words from a tech-only word list and joins them. Output: "The quick data stream cloud sync build deploy." — this is nonsensical.
**Fix:** Use pre-written realistic sentence templates with variable slots. E.g., "The {adjective} {noun} was {verb} by the {role}." producing "The quarterly report was reviewed by the manager."

### 2. EMAIL — Only one format: `firstName_lastName@domain` (MAJOR)
**Problem:** Real emails have dozens of patterns. Currently always `rahul_sharma42@gmail.com`. No variety.
**Fix:** Implement 10+ email patterns randomly selected:
- `rsharma@gmail.com` (initial + last)
- `rahul.s@outlook.com` (first + initial)
- `rahulsharma@company.com` (nospace)
- `sharma.rahul@proton.me` (reversed)
- `rahul2024@gmail.com` (first + year)
- `r.sharma42@yahoo.com` (initial.last + number)
- `therealrahul@gmail.com` (prefix + first)
- `rahul.sharma.dev@gmail.com` (first.last.suffix)

### 3. NAMES — No cultural coherence (MAJOR)
**Problem:** A row can have `firstName: "Rahul"` and `lastName: "Müller"` — Indian first name with German surname. Completely unrealistic.
**Fix:** Group names by cultural region. When a row picks "Indian" culture, both first and last names come from the Indian pool. Regions: Indian, East Asian, European, Latin American, Middle Eastern, African, Anglo.

### 4. PHONE — Not culturally aware (MEDIUM)
**Problem:** Always generates `+1 (###) ###-####` (US format) regardless of the country in context.
**Fix:** Phone format should adapt to the country in RowContext. India: `+91 #####-#####`, UK: `+44 #### ######`, etc.

### 5. COMPANY NAMES — "Sharma Inc" is not realistic (MEDIUM)
**Problem:** Company = `lastName + suffix`. Produces "Patel LLC" or "Kim Corp" — these aren't how real companies are named.
**Fix:** Use realistic company name patterns:
- `{Adjective}{Noun} Technologies` → "BrightPath Technologies"
- `{Name}{Suffix}` → "Atlas Group"  
- `{Word}{Word}` → "CloudForge", "DataMesh"
- Real-sounding combos, not just lastName + Corp

### 6. CITY/COUNTRY — Not correlated to names (MEDIUM)
**Problem:** An Indian name with city "Berlin" and country "Germany" — culturally mismatched.
**Fix:** RowContext should pick a cultural region first, then ALL fields (name, city, country, phone format, timezone) derive from that region.

### 7. JOB TITLES — Too formulaic (LOW)
**Problem:** Always `{Level} {Department} {Role}` → "Senior Engineering Manager". Sounds robotic.
**Fix:** Mix in realistic standalone titles: "Software Engineer", "Product Designer", "VP of Sales", "CTO", "Data Analyst", "DevOps Lead", "Full Stack Developer".

### 8. BIO — Lorem ipsum nonsense (LOW)
**Problem:** Bio uses the same random word generator as sentences. Not professional.
**Fix:** Use templates: "Passionate {role} with {N}+ years in {industry}. Specializing in {skill} and {skill}."

### 9. STREET ADDRESSES — US-only format (LOW)
**Problem:** Always generates "1234 Oak St" format. Doesn't match international addresses.
**Fix:** Adapt to cultural context. Indian: "A-42, Sector 18, Noida". UK: "14 Baker Street". Euro: "Hauptstraße 7".

### 10. USERNAME — Limited patterns (LOW)
**Problem:** Only 3 patterns. Real usernames are more varied.
**Fix:** Add: `thesharmarahul`, `rahul.dev`, `_rahul_s`, `rahulcodes`, `iamrahul`, etc.

### 11. PASSWORD — Not realistic looking (MINOR)
**Problem:** Pure random chars. Real passwords have patterns.
**Fix:** Mix styles: `Rahul@2024!`, `sunshine$42`, `Tr0ub4dor&3`, plus pure random.

### 12. AVATAR URL — DiceBear only (MINOR)
**Problem:** Always DiceBear initials URL.
**Fix:** Vary: `ui-avatars.com`, `robohash.org`, `i.pravatar.cc`, `picsum.photos`.

### 13. RELATED ROW IDENTITY (DESIGN ISSUE)
**Problem:** If phone is not marked unique, each row still gets a completely different person. User expectation: non-unique phone means SAME person appears in multiple rows (e.g., Rahul's brother Kishore Sharma sharing the family phone).
**Fix:** When phone is non-unique, implement "household" concept — related rows share surname, phone, address, but differ in firstName and age. Create a "family pool" that certain rows pull from.

---

## Architecture Changes Required

1. **Cultural Region System** — RowContext picks a region; all generators respect it.
2. **Name Pools by Region** — Separate first/last name arrays per culture.
3. **Sentence Templates** — Pre-written realistic sentences with variable substitution.
4. **Email Pattern Randomizer** — 10+ patterns weighted by probability.
5. **Household/Family Mode** — For non-unique identity fields, generate related persons.
6. **Company Name Generator** — Pattern-based, not `lastName + suffix`.
7. **Address Localization** — Format adapts to country/region.
8. **Phone Localization** — Format adapts to country.

---

## Fix Priority

| # | Issue | Impact | Effort |
|---|-------|--------|--------|
| 1 | Sentences nonsensical | HIGH | Medium |
| 2 | Email single format | HIGH | Low |
| 3 | Names not culturally coherent | HIGH | Medium |
| 4 | Phone not localized | MEDIUM | Low |
| 5 | Company names unrealistic | MEDIUM | Low |
| 6 | City/Country mismatch | MEDIUM | Low (tied to #3) |
| 7 | Job titles formulaic | LOW | Low |
| 8 | Bio lorem ipsum | LOW | Low |
| 9 | Street not localized | LOW | Medium |
| 10 | Username limited | LOW | Low |
| 13 | No family/household concept | LOW | High (V2) |

All except #13 will be fixed now. #13 (household mode) is a V2 feature requiring state across rows.
