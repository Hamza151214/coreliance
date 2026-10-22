import { ref, get } from 'firebase/database';

import { db } from '../database/firebase';

// Denne fil er det eneste sted i appen, der ved hvor career cases kommer fra.
// Casene ligger i Firebase Realtime Database under careerCases/<id>.
// Lige nu er alle cases fiktive demo-profiler (se seed/careerCases.json).

// Jeg omdanner alle cases til den samme model, så skærmene kan stole på,
// at lister altid er arrays og at manglende felter ikke får appen til at crashe.
function normalizeCareerCase(id, raw) {
  return {
    id: id,
    // Alt der ikke udtrykkeligt er markeret som rigtigt, behandles som fiktivt.
    isFictional: raw.fictional !== false,
    jobTitle: raw.jobTitle || '',
    employerType: raw.employerType || '',
    field: raw.field || '',
    location: raw.location || '',
    outcome: raw.outcome || 'HIRED',
    university: raw.university || '',
    degree: raw.degree || '',
    danishLevel: raw.danishLevel || '',
    previousExperience: Array.isArray(raw.previousExperience) ? raw.previousExperience : [],
    skills: Array.isArray(raw.skills) ? raw.skills : [],
    applications: raw.applications ?? null,
    interviews: raw.interviews ?? null,
    offers: raw.offers ?? null,
    monthsSearching: raw.monthsSearching ?? null,
    jobRoute: raw.jobRoute || '',
    referral: raw.referral ?? null,
    challenges: raw.challenges || '',
    strategy: raw.strategy || '',
    story: raw.story || '',
    advice: raw.advice || '',
  };
}

export async function getCareerCases() {
  const snapshot = await get(ref(db, 'careerCases'));
  const casesById = snapshot.val() || {};

  return Object.entries(casesById).map(([id, careerCase]) => normalizeCareerCase(id, careerCase));
}
