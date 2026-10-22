# Integration Handoff

Coreliance is a **local academic prototype**: an Expo app with AsyncStorage, a local dataset of 14
fictional career cases, and OpenAI matching through a minimal local Node.js server. There is no
cloud database, no user accounts and no hosting.

| Responsibility | Module | Interface |
|---|---|---|
| Profile storage | `services/profileService.js` | `loadProfile()`, `saveProfile(profile)`, `giveAiConsent(profile)` |
| Career cases | `services/careerCaseService.js` | `getCareerCases()` |
| Matching (client) | `services/matchingService.js` | `findMatches(profile)` → `POST /match` |
| Matching (server) | `server/index.js`, `server/matching.js` | `POST /match { profile }` → `{ model, matches }` |

## Job seeker profile

The fields are defined in `data/jobSeekerProfile.js` (`PROFILE_SECTIONS`, `EMPTY_PROFILE`,
`validateProfile`). The profile is stored as JSON under the AsyncStorage key
`coreliance:jobSeekerProfile`:

```js
{
  status, university, degree, danishLevel, experienceLevel, skills, background,
  desiredRoles, industries: string[], preferredLocation, lookingFor, biggestChallenge,
  updatedAt,   // set by saveProfile()
  aiConsentAt  // set by giveAiConsent(); required before matching
}
```

## Career cases

`data/careerCases.json` is the only source. It is an object keyed by `case01`–`case14`, and every
case has `fictional: true`. `normalizeCareerCase()` maps each case to the app model: `id, isFictional,
jobTitle, employerType, field, location, outcome, university, degree, danishLevel,
previousExperience[], skills[], applications, interviews, offers, monthsSearching, jobRoute,
referral, challenges, strategy, story, advice`. The model has no nationality. To use real data
later, replace the body of `getCareerCases()` and make the server read the same source.

## Matching

1. `PeopleLikeMeScreen` loads the profile. With no profile it shows the form link; without consent
   it shows the consent screen.
2. `findMatches(profile)` posts the profile to `API_URL/match`. The default is localhost, or
   `10.0.2.2` on the Android emulator; it can be overridden with `EXPO_PUBLIC_API_URL`.
3. The server whitelists the profile fields and sends them, together with the cases, to OpenAI Chat
   Completions using a strict JSON schema. The model defaults to `gpt-5-mini` and is set with
   `OPENAI_MODEL`.
4. The server drops matches with unknown or duplicate IDs or an invalid shape, and returns at most 5.
5. The client joins the IDs to case objects. `CareerCaseScreen` shows the explanation when it
   receives `match`.

Match format: `{ careerCaseId, careerCase, relevance, summary, similarities[], differences[], lessons[] }`.

The server returns these error codes, each shown to the user with a retry button:
- `missing_api_key` (500)
- `openai_error` (502)
- `invalid_ai_response` (502)
- `invalid_profile` (400)
- server unreachable or timeout (handled in the app)

There is no fallback that presents non-AI results as AI.

## Security and privacy

- The OpenAI key exists only in `server/.env`, which git ignores. It never appears in the app bundle.
- The server binds to `127.0.0.1` by default; `HOST=0.0.0.0` is only needed for a phone demo on the
  local network. CORS allows only localhost origins. Request bodies are capped at 20 KB.
- Profiles are never stored on the server; they are only sent to OpenAI after explicit consent.
- `ContributeScreen` is a local demo only.
- Not built: consent withdrawal or profile deletion in the UI, and rate limiting. That is acceptable
  for a local demo, but would be needed before any hosting.
