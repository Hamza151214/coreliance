import { DEMO_CAREER_CASES } from '../data/careerCases';

// Denne fil er det eneste sted i appen, der ved hvor career cases kommer fra.
// Skærmene kalder kun getCareerCases() og er ligeglade med,
// om data kommer fra demo-filen eller senere fra Supabase.

// Jeg omdanner alle cases til den samme model, så skærmene kan stole på,
// at lister altid er arrays og at manglende felter ikke får appen til at crashe.
function normalizeCareerCase(raw, isDemo) {
  return {
    id: String(raw.id),
    isDemo: isDemo,
    jobTitle: raw.jobTitle || '',
    field: raw.field || '',
    location: raw.location || '',
    outcome: raw.outcome || 'HIRED',
    university: raw.university || '',
    degree: raw.degree || '',
    nationality: raw.nationality || '',
    danishLevel: raw.danishLevel || '',
    previousExperience: Array.isArray(raw.previousExperience) ? raw.previousExperience : [],
    skills: Array.isArray(raw.skills) ? raw.skills : [],
    applications: raw.applications ?? null,
    interviews: raw.interviews ?? null,
    offers: raw.offers ?? null,
    jobRoute: raw.jobRoute || '',
    referral: raw.referral ?? null,
    advice: raw.advice || '',
  };
}

// Lige nu returnerer jeg demo-cases. Funktionen er allerede async,
// så den senere kan hente godkendte, anonymiserede cases fra Supabase
// uden at skærmene skal ændres (se INTEGRATION_HANDOFF.md).
export async function getCareerCases() {
  return DEMO_CAREER_CASES.map((careerCase) => normalizeCareerCase(careerCase, true));
}
