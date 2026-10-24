import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { getCareerCases } from './careerCaseService';
import { EMPTY_PROFILE } from '../data/jobSeekerProfile';

// People Like Me-matching med OpenAI gennem den lokale server (server/index.js).
// Appen kender ikke OpenAI-nøglen; den ligger kun i server/.env.
//
// Resultaterne gemmes med AsyncStorage, så et OpenAI-kald kun sker,
// når brugeren selv beder om nye matches.
//
// Adressen på serveren:
// - Web og iOS-simulator: localhost
// - Android-emulator: 10.0.2.2 (emulatorens adresse til computeren)
// - Fysisk telefon: start appen med EXPO_PUBLIC_API_URL=http://<computerens-IP>:3001 (se README)
const API_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  (Platform.OS === 'android' ? 'http://10.0.2.2:3001' : 'http://localhost:3001');

const TIMEOUT_MS = 60000;
const CACHE_KEY = 'coreliance:matchCache';

// Jeg hæver dette tal, hvis prompten eller valideringen i server/matching.js ændres.
// Så bliver gamle matches ikke vist, som om de var lavet med den nye logik.
const MATCHING_VERSION = 1;

// Forståelige fejlbeskeder ud fra serverens fejlkoder.
const ERROR_MESSAGES = {
  missing_api_key: 'The AI server has no OpenAI API key. Add it to server/.env and restart the server.',
  openai_error: 'OpenAI could not be reached or returned an error. Please try again.',
  invalid_ai_response: 'The AI returned an invalid answer. Please try again.',
  invalid_profile: 'Your profile is incomplete. Please check your desired roles and goals.',
};

// Gør en lang tekst til en kort kode. Den samme tekst giver altid den samme kode,
// så jeg let kan se, om profilen eller datasættet har ændret sig.
function simpleHash(text) {
  let hash = 0;

  for (let i = 0; i < text.length; i++) {
    hash = (hash * 31 + text.charCodeAt(i)) | 0;
  }

  return String(hash);
}

// Signatur af de profilfelter, som sendes til AI'en.
// updatedAt og aiConsentAt er ikke med, så de ikke gør matches forældede.
export function getProfileSignature(profile) {
  return simpleHash(JSON.stringify(Object.keys(EMPTY_PROFILE).map((key) => profile[key])));
}

// Ændres en career case, ændres versionen også, og gamle matches kasseres.
async function getDatasetVersion() {
  return simpleHash(JSON.stringify(await getCareerCases()));
}

// Kobler AI'ens case-id'er sammen med de rigtige case-objekter.
async function attachCareerCases(matches) {
  const careerCases = await getCareerCases();

  return matches
    .map((match) => ({
      ...match,
      careerCase: careerCases.find((careerCase) => careerCase.id === match.careerCaseId),
    }))
    .filter((match) => match.careerCase);
}

// Henter de gemte matches uden at kalde OpenAI.
// Returnerer null, hvis der ingen er, eller hvis de er lavet med en anden
// matchinglogik eller et andet datasæt.
export async function loadCachedMatches() {
  const json = await AsyncStorage.getItem(CACHE_KEY);

  if (!json) {
    return null;
  }

  const cache = JSON.parse(json);

  if (cache.matchingVersion !== MATCHING_VERSION || cache.datasetVersion !== (await getDatasetVersion())) {
    return null;
  }

  return { ...cache, matches: await attachCareerCases(cache.matches) };
}

// Spørger AI-serveren om nye matches og gemmer dem.
// Kaldes kun, når brugeren selv trykker på "Find my matches" eller "Refresh matches".
export async function requestMatches(profile) {
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

  // Jeg gemmer kun det, der skal bruges for at vise resultaterne igen:
  // case-id'er, forklaringer, tidspunkt og de versioner, der afgør om de stadig gælder.
  const cache = {
    matchingVersion: MATCHING_VERSION,
    datasetVersion: await getDatasetVersion(),
    profileSignature: getProfileSignature(profile),
    createdAt: new Date().toISOString(),
    matches: data.matches,
  };

  await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(cache));

  return { ...cache, matches: await attachCareerCases(cache.matches) };
}
