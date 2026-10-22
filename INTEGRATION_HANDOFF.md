# Integration Handoff

This app currently runs fully offline: **demo career cases**, **local profile storage** and
**local (non-AI) matching**. Each of these sits behind one small module, so connecting Supabase
and OpenAI means replacing the inside of three functions. Screens should not need changes.

| Responsibility | Module | Public interface | Today | Later |
|---|---|---|---|---|
| Profile persistence | `services/profileService.js` | `loadProfile()`, `saveProfile(profile)` | AsyncStorage | Supabase (authenticated) |
| Career case retrieval | `services/careerCaseService.js` | `getCareerCases()` | `data/careerCases.js` (demo) | Approved anonymised Supabase records |
| Matching | `services/matchingService.js` | `findMatches(profile)`, `MATCHING_IS_DEMO` | Local word-overlap scoring | Secure backend (e.g. Supabase Edge Function → OpenAI) |

All three functions are already `async`, so swapping the implementation does not change the call sites.

---

## 1. Job Seeker Profile

**Form fields:** `data/jobSeekerProfile.js` → `PROFILE_SECTIONS`. Each field is
`{ key, label, required?, options?, multiline?, list?, placeholder?, hint?, keyboardType?, maxLength? }`.
`JobSeekerProfileScreen` renders the form from this list via `components/FormField.js`.
To add a question, add it here; `EMPTY_PROFILE` and `validateProfile()` pick it up automatically.

**Profile shape** (flat object, all values are strings as typed):

```js
{
  // A. Education & background
  status,            // 'Student' | 'Recent Graduate' | 'Other Job Seeker'   (required)
  university,        // (required)
  degree,            // degree and field of study (required)
  graduationYear,    // 'YYYY' (required, validated)
  countryOfOrigin,   // optional – NEVER used for matching
  danishLevel,       // 'No Danish' | 'A1' … 'C1' | 'Native' (required)
  englishLevel,      // 'Basic' | 'Intermediate' | 'Fluent' | 'Native'
  // B. Professional background
  workExperience, studentJobs, professionalBackground, standOut,  // free text
  skills,                // comma-separated list (required)
  previousIndustries,    // comma-separated list
  employmentSituation,   // option
  // C. Career interests
  desiredRoles,          // comma-separated list (required)
  industriesOfInterest,  // comma-separated list
  preferredLocation, employmentType,
  lookingFor,            // free text (required, ≥ 20 chars)
  careerDirection, workInterests,  // free text
  // D. Personal context
  biggestChallenge,      // free text (required)
  beyondApplication, wantToLearn,  // free text
  updatedAt              // ISO string, set by saveProfile()
}
```

List fields are stored as the typed string. Use `toList()` from `data/jobSeekerProfile.js` to
convert to an array (e.g. when writing to a Postgres `text[]` column).

**Current storage:** `profileService.js` stores the JSON under AsyncStorage key
`coreliance:jobSeekerProfile`. `loadProfile()` returns `null` when no profile exists and
**throws** on storage errors. Both screens catch the error and show a message or a retry button.

**Connecting Supabase:** replace the bodies of `loadProfile()` / `saveProfile()`:
- `loadProfile()` → select the signed-in user's job seeker row. Return `null` if none exists,
  and map the columns to the shape above.
- `saveProfile(profile)` → upsert the row for the signed-in user. Return the saved profile.
- Optionally keep AsyncStorage as an offline cache or draft store.
- The schema is intentionally **not** defined here. Map the column names in this one file.

Still missing: authentication (no user identity exists in the app yet), an explicit consent step
before the profile leaves the device, and "delete my profile" / data export controls.

---

## 2. Career Cases

**Internal model** (produced by `normalizeCareerCase()` in `careerCaseService.js`; every screen
and the matcher rely on this):

```js
{
  id: string, isDemo: boolean,
  jobTitle, field, location, outcome,        // strings ('' if missing; outcome defaults to 'HIRED')
  university, degree, nationality, danishLevel,
  previousExperience: string[], skills: string[],   // always arrays
  applications, interviews, offers,          // number | null
  jobRoute: string, referral: boolean | null, advice: string
}
```

Missing fields are tolerated: `CareerCard` and `CareerCaseScreen` hide empty rows, and the matcher
skips them.

**Demo source:** `data/careerCases.js` (`DEMO_CAREER_CASES`, 8 fictional cases). Only
`careerCaseService.js` imports it. The UI labels these cases as demonstration data via `isDemo`.

**Replacing with Supabase:** in `getCareerCases()`, fetch rows from an **approved, anonymised**
view or table and map each one through `normalizeCareerCase(row, false)`. If the source column names
differ from the model, adapt them in that mapping. Fields that will need explicit mapping from
the respondent platform: job title, field/industry, location, university, degree, Danish level,
previous experience (likely free text → array), skills (→ array), application/interview/offer
counts, how the job was obtained, referral, advice. Keep the demo source available (e.g. behind a
flag) until real data is live.

Never expose raw employment submissions or uploaded documents (CVs) to the client. The app should
only ever be able to read the anonymised projection. Enforce this with RLS or a dedicated view,
not in app code.

Consider whether `nationality` should be shown at all in real records. It is displayed today
(original prototype behaviour) but is never used for matching.

---

## 3. People Like Me

**Where:** `services/matchingService.js` → `findMatches(profile)`. The screen is
`screens/PeopleLikeMeScreen.js`.

**Input:** the saved profile object (shape above).
**Output:** a sorted array (max 5, may be empty):

```js
{
  careerCaseId: string,
  careerCase: CareerCase,     // internal model above
  score: number,              // ranking only – never shown as a probability
  relevance: 'Strong match' | 'Possible match',
  similarities: string[],     // why it is relevant (background, skills, experience…)
  differences: string[],      // meaningful differences
  lessons: string[]           // what the job seeker could learn from this person's search
}
```

**Current algorithm:** deterministic overlap of desired roles vs. job title, interests vs. field
(with a small keyword list), shared skills, degree/university, previous experience, and free-text
answers vs. the case's own text. Danish level and location have low weight. A case needs at least
one career-related overlap to be shown. Explanations only cite fields the case actually contains.
`countryOfOrigin` and `nationality` are never used.

**Replacing with OpenAI:**
1. Create a backend endpoint (e.g. Supabase Edge Function `match-profile`) that holds the OpenAI key,
   loads the approved anonymised cases server-side, and asks the model for ranked matches.
2. In `findMatches(profile)`, call that endpoint instead of the local scorer. Resolve the returned
   ids to case objects via `getCareerCases()` (or let the endpoint return them), and return the same
   output shape. Validate that every returned id exists, and drop any explanation that references a
   case that does not exist.
3. Set `MATCHING_IS_DEMO = false` (this hides the "demo matching" disclaimer). Replace it with an
   appropriate AI disclaimer.
4. Keep the local scorer as a fallback if the endpoint fails, or show the existing error state.

Prompt constraints for the model: no hiring-probability or employability claims; no use of
nationality, country of origin, gender, age, religion or other protected characteristics; only
reference facts present in the case data.

**Connection to Career Case screen:** results navigate with
`navigation.navigate('CareerCase', { careerCase, match })`. `CareerCaseScreen` shows a
"Why this case was suggested" section when `match` is present. The same screen is used from Explore
(without `match`).

---

## 4. Security & privacy checklist

Missing backend pieces: user authentication, a Supabase table for job seeker profiles with RLS
(owner-only access), an anonymised career case view, the matching Edge Function, consent capture,
and delete/export of a user's profile.

Must stay private: raw respondent submissions, uploaded documents/CVs, any identifying details
(names, employers if identifying, emails), Supabase service-role keys, and the OpenAI API key.
No secret key may ever be added to this React Native app or to `app.json`. Only the Supabase
anon key, protected by RLS, belongs in the client.

May be sent to the future matching endpoint: the job seeker's profile fields, **excluding**
`countryOfOrigin`. Strip it before sending. Only the anonymised case fields listed above.
Send only after the user has given explicit consent to processing by an AI provider.

Consent and auth to implement: a consent screen or checkbox before the first upload/match
(stored with a timestamp), a privacy notice explaining AI processing, sign-in so that profiles are
tied to the correct user, and the ability to withdraw consent and delete the profile.

The `ContributeScreen` is a local demo for employed respondents and must **not** be wired to
Supabase. Real submissions happen on the separate Coreliance platform.
