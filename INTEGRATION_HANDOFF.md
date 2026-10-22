# Integration Handoff

Coreliance now runs on **Firebase** (Authentication + Realtime Database + Cloud Functions) with
**OpenAI matching** behind a Cloud Function. It is an academic demonstration. All career cases are
fictional.

| Responsibility | Module | Public interface | Backed by |
|---|---|---|---|
| Firebase setup | `database/firebase.js` | `auth`, `db`, `functions` | Firebase JS SDK |
| Login | `screens/AuthScreen.js`, `App.js` | email/password signup, login; `onAuthStateChanged` gate | Firebase Auth |
| Profile persistence | `services/profileService.js` | `loadProfile()`, `saveProfile(profile)`, `giveAiConsent()` | RTDB `jobSeekerProfiles/<uid>` |
| Career case retrieval | `services/careerCaseService.js` | `getCareerCases()` | RTDB `careerCases/<id>` |
| Matching | `services/matchingService.js` → `functions/index.js` | `findMatches()` → callable `matchProfile` | Cloud Function + OpenAI |

---

## 1. Job Seeker Profile

**Fields** are defined in `data/jobSeekerProfile.js` → `PROFILE_SECTIONS`. There are 12 questions in
3 sections: 8 choice/short fields, 1 multiselect and 2 longer free-text fields. The form,
`EMPTY_PROFILE` and `validateProfile()` are all derived from this list.

**Stored at** `jobSeekerProfiles/<uid>`:

```js
{
  status, university, degree, danishLevel,          // About you
  experienceLevel, skills, background,              // Your experience (background = free text)
  desiredRoles, industries: string[], preferredLocation,
  lookingFor, biggestChallenge,                     // What you are looking for (lookingFor = free text)
  updatedAt,    // ISO string, set by saveProfile()
  aiConsentAt   // ISO string, set by giveAiConsent(); required by the backend
}
```

`saveProfile()` uses `update()` so an existing `aiConsentAt` survives edits. RTDB does not store
empty arrays, so `loadProfile()` merges with `EMPTY_PROFILE`.

## 2. Career Cases

**Source:** `seed/careerCases.json` (14 fictional cases, keys `case01`–`case14`, all `fictional: true`).
Upload it with `npm run seed:cases`. It writes to the fixed keys, so re-running overwrites instead of
duplicating. The app has no local copy; it only reads from RTDB.

**Internal model** (`normalizeCareerCase()` in `careerCaseService.js`): `id, isFictional, jobTitle,
employerType, field, location, outcome, university, degree, danishLevel, previousExperience[],
skills[], applications, interviews, offers, monthsSearching, jobRoute, referral, challenges,
strategy, story, advice`. Missing fields become `''`, `[]` or `null`, and the UI hides them. The
model has no nationality.

**Real data later:** write approved anonymised cases to the same path, or another path read in
`getCareerCases()`, with `fictional: false`. Raw submissions and CVs must never be readable by
clients.

## 3. People Like Me (OpenAI)

**Flow:** `PeopleLikeMeScreen` → (no profile → form) → (no `aiConsentAt` → consent screen) →
`findMatches()` → callable `matchProfile` (region `europe-west1`).

**The function** (`functions/index.js`):
1. Rejects unauthenticated calls (`request.auth`).
2. Loads the caller's own profile by UID, plus all career cases, with the Admin SDK.
3. Requires `aiConsentAt`.
4. Applies a rate limit of 10 calls per user per day, at least 20 seconds apart, stored in
   `matchUsage/<uid>`. That path is closed to clients.
5. Sends only whitelisted profile and case fields (no email, UID or nationality) to OpenAI Chat
   Completions with a strict JSON schema. The model defaults to `gpt-5-mini` and can be overridden
   with the `OPENAI_MODEL` param.
6. Drops matches with unknown ids and returns at most 5.

**Output** (unchanged contract with the screens):
`{ careerCaseId, careerCase, relevance: 'Strong match'|'Possible match', summary, similarities[], differences[], lessons[] }`.
`CareerCaseScreen` shows the explanation when it gets `match` in its route params.

The prompt forbids protected characteristics, invented facts and claims about hiring chances.
"AI-powered matching" is only shown on results returned by the function.

## 4. Security

- **Database rules** (`database.rules.json`): `careerCases` are readable by logged-in users and not
  writable from the client. `jobSeekerProfiles/$uid` can only be read and written by that user.
  Everything else is denied.
- The **OpenAI key** is a Firebase secret (`OPENAI_API_KEY`). It is never in the app or the repo.
- The **Firebase web config** in `database/firebase.js` is public by design; access is controlled
  by the rules.
- **Consent:** the user is told what is sent to OpenAI and must actively agree before the first
  call. The backend enforces this too.
- **Not yet built:** email verification, password reset, profile deletion and consent withdrawal in
  the UI, and App Check.

## 5. Setup commands (reference)

```bash
npx firebase-tools login
npx firebase-tools use <project-id>
npm run deploy:rules
npm run seed:cases
npx firebase-tools functions:secrets:set OPENAI_API_KEY   # paste key when prompted
cd functions && npm install && cd ..
npm run deploy:functions                                   # requires the Blaze plan
```

The `ContributeScreen` remains a local demo for employed respondents and is not connected to
Firebase.
