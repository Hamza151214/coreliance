const OpenAI = require('openai');

const CAREER_CASES = require('../data/careerCases.json');

// Selve AI-matchingen. Filen er adskilt fra HTTP-serveren (index.js),
// så logikken kan testes uden at starte en server.

const MAX_MATCHES = 5;
const MAX_TEXT_LENGTH = 1000;

// Kun disse profilfelter sendes til OpenAI. Alt andet (fx tidsstempler) ignoreres.
const PROFILE_FIELDS = [
  'status', 'university', 'degree', 'danishLevel', 'experienceLevel', 'skills', 'background',
  'desiredRoles', 'industries', 'preferredLocation', 'lookingFor', 'biggestChallenge',
];

// Kun disse case-felter sendes. Datamodellen indeholder ingen nationalitet.
const CASE_FIELDS = [
  'jobTitle', 'employerType', 'field', 'location', 'university', 'degree', 'danishLevel',
  'previousExperience', 'skills', 'applications', 'interviews', 'monthsSearching', 'jobRoute',
  'referral', 'challenges', 'strategy', 'story', 'advice',
];

const SYSTEM_PROMPT = `You are the matching assistant in Coreliance, an academic demonstration app that helps international students and graduates learn from people who found jobs in Denmark. All career cases are fictional demonstration profiles.

Given one job seeker profile and a list of career cases, choose up to ${MAX_MATCHES} cases the job seeker can learn the most from, best match first.

Rules:
- Weigh skills, goals, experience, transferable qualifications and similar challenges. A different degree or job title can still be a strong match if the journey is relevant.
- Never use nationality, country of origin, ethnicity, gender, age, religion, disability or any other protected characteristic.
- Only state facts that appear in the profile or the case. Do not invent details.
- Never estimate hiring chances, employability or salaries.
- Address the job seeker as "you" and the case person as "they". Plain English, each bullet under 30 words.
- Give 2-4 similarities, 1-3 differences and 1-3 concrete lessons per match.
- Return an empty list if no case is meaningfully relevant.`;

// JSON-skema til struktureret output, så OpenAI altid svarer i det format, appen forventer.
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

// En fejl med en kode, som index.js kan oversætte til en HTTP-status.
class MatchingError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

// Jeg tager kun de tilladte felter med og forkorter for lange tekster,
// så appen ikke kan sende vilkårlige eller meget store data videre til OpenAI.
function cleanProfile(profile) {
  if (!profile || typeof profile !== 'object') {
    throw new MatchingError('invalid_profile', 'The request did not contain a profile.');
  }

  const cleaned = {};

  PROFILE_FIELDS.forEach((field) => {
    const value = profile[field];

    if (Array.isArray(value)) {
      cleaned[field] = value.filter((item) => typeof item === 'string').map((item) => item.slice(0, 100));
    } else if (typeof value === 'string' && value.trim() !== '') {
      cleaned[field] = value.slice(0, MAX_TEXT_LENGTH);
    }
  });

  if (!cleaned.desiredRoles || !cleaned.lookingFor) {
    throw new MatchingError('invalid_profile', 'The profile is missing desired roles or goals.');
  }

  return cleaned;
}

function casesForPrompt() {
  return Object.entries(CAREER_CASES).map(([id, careerCase]) => ({
    careerCaseId: id,
    ...Object.fromEntries(CASE_FIELDS.map((field) => [field, careerCase[field]])),
  }));
}

const isStringList = (value) => Array.isArray(value) && value.every((item) => typeof item === 'string');

// Jeg stoler ikke blindt på AI'ens svar: kun matches med gyldig struktur
// og et case-ID, der faktisk findes, kommer videre til appen. Dubletter fjernes.
function validateMatches(result) {
  if (!result || !Array.isArray(result.matches)) {
    throw new MatchingError('invalid_ai_response', 'The AI returned an invalid response.');
  }

  const seenIds = new Set();

  return result.matches
    .filter((match) => {
      const isValid =
        match &&
        CAREER_CASES[match.careerCaseId] &&
        !seenIds.has(match.careerCaseId) &&
        ['Strong match', 'Possible match'].includes(match.relevance) &&
        typeof match.summary === 'string' &&
        isStringList(match.similarities) &&
        isStringList(match.differences) &&
        isStringList(match.lessons);

      if (isValid) {
        seenIds.add(match.careerCaseId);
      }

      return isValid;
    })
    .slice(0, MAX_MATCHES)
    .map(({ careerCaseId, relevance, summary, similarities, differences, lessons }) => ({
      careerCaseId,
      relevance,
      summary,
      similarities,
      differences,
      lessons,
    }));
}

// Sender profilen og de fiktive cases til OpenAI og returnerer validerede matches.
async function matchProfile(profile) {
  if (!process.env.OPENAI_API_KEY) {
    throw new MatchingError('missing_api_key', 'OPENAI_API_KEY is missing in server/.env.');
  }

  const model = process.env.OPENAI_MODEL || 'gpt-5-mini';
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, timeout: 60000 });

  const request = {
    model,
    response_format: RESPONSE_FORMAT,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: JSON.stringify({ jobSeekerProfile: cleanProfile(profile), careerCases: casesForPrompt() }) },
    ],
  };

  // Reasoning-modeller (gpt-5, o-serien) skal ikke tænke længe til denne opgave.
  if (/^(gpt-5|o\d)/.test(model)) {
    request.reasoning_effort = 'low';
  }

  let completion;

  try {
    completion = await client.chat.completions.create(request);
  } catch (error) {
    console.error('OpenAI error:', error.status, error.message);
    throw new MatchingError('openai_error', 'The OpenAI request failed.');
  }

  let result;

  try {
    result = JSON.parse(completion.choices[0].message.content);
  } catch (error) {
    throw new MatchingError('invalid_ai_response', 'The AI returned an invalid response.');
  }

  return { model: completion.model, matches: validateMatches(result) };
}

module.exports = { matchProfile, validateMatches, cleanProfile, MatchingError };
