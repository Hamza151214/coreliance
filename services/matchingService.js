import { Platform } from 'react-native';

import { getCareerCases } from './careerCaseService';

// People Like Me-matching med OpenAI gennem den lokale server (server/index.js).
// Appen kender ikke OpenAI-nøglen; den ligger kun i server/.env.
//
// Adressen på serveren:
// - Web og iOS-simulator: localhost
// - Android-emulator: 10.0.2.2 (emulatorens adresse til computeren)
// - Fysisk telefon: start appen med EXPO_PUBLIC_API_URL=http://<computerens-IP>:3001 (se README)
const API_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  (Platform.OS === 'android' ? 'http://10.0.2.2:3001' : 'http://localhost:3001');

const TIMEOUT_MS = 60000;

// Forståelige fejlbeskeder ud fra serverens fejlkoder.
const ERROR_MESSAGES = {
  missing_api_key: 'The AI server has no OpenAI API key. Add it to server/.env and restart the server.',
  openai_error: 'OpenAI could not be reached or returned an error. Please try again.',
  invalid_ai_response: 'The AI returned an invalid answer. Please try again.',
  invalid_profile: 'Your profile is incomplete. Please check your desired roles and goals.',
};

// Input: den gemte jobsøgerprofil.
// Output: en liste af matches i samme format, som PeopleLikeMeScreen og CareerCaseScreen bruger:
// { careerCaseId, careerCase, relevance, summary, similarities, differences, lessons }
export async function findMatches(profile) {
  // AbortController stopper kaldet, hvis serveren ikke svarer inden for tidsgrænsen.
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  let response;

  try {
    response = await fetch(`${API_URL}/match`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile }),
      signal: controller.signal,
    });
  } catch (error) {
    throw new Error(
      error.name === 'AbortError'
        ? 'The AI server took too long to answer. Please try again.'
        : 'Could not reach the local AI server. Make sure it is running with "npm run dev".'
    );
  } finally {
    clearTimeout(timeout);
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(ERROR_MESSAGES[data.error] || 'AI matching failed. Please try again.');
  }

  // Jeg kobler AI'ens case-id'er sammen med de rigtige case-objekter.
  const careerCases = await getCareerCases();

  return data.matches
    .map((match) => ({
      ...match,
      careerCase: careerCases.find((careerCase) => careerCase.id === match.careerCaseId),
    }))
    .filter((match) => match.careerCase);
}
