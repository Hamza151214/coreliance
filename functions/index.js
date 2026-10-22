const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { defineSecret, defineString } = require('firebase-functions/params');
const admin = require('firebase-admin');

admin.initializeApp();

// OpenAI-nøglen gemmes som Firebase secret og når aldrig mobilappen.
// Den sættes med: firebase functions:secrets:set OPENAI_API_KEY
const OPENAI_API_KEY = defineSecret('OPENAI_API_KEY');
const OPENAI_MODEL = defineString('OPENAI_MODEL', { default: 'gpt-5-mini' });

// Begrænsninger, så endpointet ikke kan misbruges eller blive dyrt.
const MAX_CALLS_PER_DAY = 10;
const MIN_SECONDS_BETWEEN_CALLS = 20;
const MAX_MATCHES = 5;

// Kun disse profilfelter sendes til OpenAI. E-mail, UID og samtykke-tidspunkt sendes ikke.
const PROFILE_FIELDS = [
  'status', 'university', 'degree', 'danishLevel', 'experienceLevel', 'skills',
  'background', 'desiredRoles', 'industries', 'lookingFor', 'biggestChallenge', 'preferredLocation',
];

// Kun disse case-felter sendes. Der findes ingen nationalitet i datamodellen.
const CASE_FIELDS = [
  'jobTitle', 'employerType', 'field', 'location', 'university', 'degree', 'danishLevel',
  'previousExperience', 'skills', 'applications', 'interviews', 'monthsSearching', 'jobRoute',
  'referral', 'challenges', 'strategy', 'story', 'advice',
];

const SYSTEM_PROMPT = `You are the matching assistant in Coreliance, an academic demonstration app that helps international students and graduates learn from people who found jobs in Denmark. All career cases are fictional demonstration profiles.

Given one job seeker profile and a list of career cases, choose up to ${MAX_MATCHES} cases the job seeker can learn the most from.

Rules:
- Weigh skills, goals, experience, transferable qualifications and similar challenges. A different degree or job title can still be a strong match if the journey is relevant.
- Never use nationality, country of origin, ethnicity, gender, age, religion, disability or any other protected characteristic.
- Only state facts that appear in the profile or the case. Do not invent details.
- Never estimate hiring chances, employability or salaries.
- Address the job seeker as "you" and the case person as "they". Plain English, each bullet under 30 words.
- Return an empty list if no case is meaningfully relevant.`;

// JSON-skema, så OpenAI altid svarer i det format, appen forventer.
const RESPONSE_FORMAT = {
  type: 'json_schema',
  json_schema: {
    name: 'career_matches',
    strict: true,
    schema: {
      type: 'object',
      additionalProperties: false,
      required: ['matches'],
      properties: {
        matches: {
          type: 'array',
          items: {
            type: 'object',
            additionalProperties: false,
            required: ['careerCaseId', 'relevance', 'summary', 'similarities', 'differences', 'lessons'],
            properties: {
              careerCaseId: { type: 'string' },
              relevance: { type: 'string', enum: ['Strong match', 'Possible match'] },
              summary: { type: 'string' },
              similarities: { type: 'array', items: { type: 'string' } },
              differences: { type: 'array', items: { type: 'string' } },
              lessons: { type: 'array', items: { type: 'string' } },
            },
          },
        },
      },
    },
  },
};

function pick(object, fields) {
  return Object.fromEntries(fields.filter((field) => object[field] !== undefined).map((field) => [field, object[field]]));
}

// Tæller kald pr. bruger pr. dag i databasen (stien er lukket for klienter i reglerne).
async function checkRateLimit(uid) {
  const today = new Date().toISOString().slice(0, 10);
  const now = Date.now();
  let rejected = false;

  const result = await admin.database().ref(`matchUsage/${uid}`).transaction((usage) => {
    const current = usage && usage.day === today ? usage : { day: today, count: 0, lastCallAt: 0 };

    if (current.count >= MAX_CALLS_PER_DAY || now - current.lastCallAt < MIN_SECONDS_BETWEEN_CALLS * 1000) {
      rejected = true;
      return undefined;
    }

    rejected = false;
    return { day: today, count: current.count + 1, lastCallAt: now };
  });

  if (rejected || !result.committed) {
    throw new HttpsError('resource-exhausted', 'Matching limit reached. Please try again later.');
  }
}

async function askOpenAI(profile, careerCases) {
  const model = OPENAI_MODEL.value();
  const body = {
    model,
    response_format: RESPONSE_FORMAT,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: JSON.stringify({ jobSeekerProfile: profile, careerCases }) },
    ],
  };

  // Reasoning-modeller (gpt-5, o-serien) skal ikke tænke længe til denne opgave.
  if (/^(gpt-5|o\d)/.test(model)) {
    body.reasoning_effort = 'low';
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY.value()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    console.error('OpenAI error', response.status, await response.text());
    throw new HttpsError('unavailable', 'The AI service is not available right now.');
  }

  const data = await response.json();
  return { model: data.model, result: JSON.parse(data.choices[0].message.content) };
}

exports.matchProfile = onCall(
  { region: 'europe-west1', secrets: [OPENAI_API_KEY], maxInstances: 2, timeoutSeconds: 120 },
  async (request) => {
    // onCall verificerer Firebase-login-tokenet. Uden login: ingen adgang.
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Please log in first.');
    }

    const uid = request.auth.uid;
    const db = admin.database();

    // Profilen hentes fra databasen ud fra brugerens UID, så man kun kan matche sin egen profil.
    const [profileSnapshot, casesSnapshot] = await Promise.all([
      db.ref(`jobSeekerProfiles/${uid}`).get(),
      db.ref('careerCases').get(),
    ]);

    if (!profileSnapshot.exists()) {
      throw new HttpsError('failed-precondition', 'Please create your profile first.');
    }

    const storedProfile = profileSnapshot.val();

    if (!storedProfile.aiConsentAt) {
      throw new HttpsError('failed-precondition', 'Please accept AI processing first.');
    }

    await checkRateLimit(uid);

    const casesById = casesSnapshot.val() || {};
    const careerCases = Object.entries(casesById).map(([id, careerCase]) => ({
      careerCaseId: id,
      ...pick(careerCase, CASE_FIELDS),
    }));

    const { model, result } = await askOpenAI(pick(storedProfile, PROFILE_FIELDS), careerCases);

    // Jeg smider matches væk, der peger på cases, som ikke findes.
    const matches = (result.matches || [])
      .filter((match) => casesById[match.careerCaseId])
      .slice(0, MAX_MATCHES);

    return { matches, model };
  }
);
