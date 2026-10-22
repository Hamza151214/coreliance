import { httpsCallable } from 'firebase/functions';

import { functions } from '../database/firebase';
import { getCareerCases } from './careerCaseService';

// People Like Me-matching med OpenAI.
// Appen kalder Cloud Function'en "matchProfile" (functions/index.js). Den:
// 1. tjekker at brugeren er logget ind og har givet samtykke,
// 2. henter brugerens profil og de fiktive cases fra databasen,
// 3. spørger OpenAI og returnerer matches med forklaringer.
// OpenAI-nøglen ligger kun i backend.
const matchProfile = httpsCallable(functions, 'matchProfile', { timeout: 120000 });

// Venlige fejlbeskeder ud fra Firebase-fejlkoder.
const ERROR_MESSAGES = {
  'functions/resource-exhausted':
    'You have reached the matching limit. Please wait a moment or try again tomorrow.',
  'functions/failed-precondition': 'Please complete your profile and accept AI processing first.',
  'functions/unauthenticated': 'Please log in again.',
  'functions/not-found': 'The AI matching service is not deployed yet.',
};

// Output: en liste af matches i samme format som før, så PeopleLikeMeScreen
// og CareerCaseScreen kan bruges uændret:
// { careerCaseId, careerCase, relevance, summary, similarities, differences, lessons }
export async function findMatches() {
  try {
    const [response, careerCases] = await Promise.all([matchProfile(), getCareerCases()]);

    // Jeg kobler AI'ens case-id'er sammen med de rigtige case-objekter.
    return response.data.matches
      .map((match) => ({
        ...match,
        careerCase: careerCases.find((careerCase) => careerCase.id === match.careerCaseId),
      }))
      .filter((match) => match.careerCase);
  } catch (error) {
    throw new Error(ERROR_MESSAGES[error.code] || 'AI matching failed. Please try again later.');
  }
}
