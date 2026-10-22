import AsyncStorage from '@react-native-async-storage/async-storage';

import { EMPTY_PROFILE } from '../data/jobSeekerProfile';

// Denne fil står for at gemme og hente jobsøgerens profil med AsyncStorage.
// Profilen ligger kun på enheden. Skærmene bruger kun funktionerne herunder
// og ved ikke selv, hvordan profilen bliver gemt.
const PROFILE_KEY = 'coreliance:jobSeekerProfile';

// Returnerer den gemte profil eller null, hvis brugeren ikke har lavet en endnu.
// Jeg fletter med EMPTY_PROFILE, så nye felter altid findes, også i ældre profiler.
// Hvis lageret fejler, kaster funktionen en fejl, som skærmen selv håndterer.
export async function loadProfile() {
  const json = await AsyncStorage.getItem(PROFILE_KEY);

  return json ? { ...EMPTY_PROFILE, ...JSON.parse(json) } : null;
}

// Gemmer profilen sammen med et tidsstempel. Et tidligere AI-samtykke bevares,
// når brugeren redigerer sin profil.
export async function saveProfile(profile) {
  const savedProfile = { ...profile, updatedAt: new Date().toISOString() };

  await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(savedProfile));

  return savedProfile;
}

// Gemmer tidspunktet for brugerens samtykke til, at profilen sendes til OpenAI.
// updatedAt ændres bevidst ikke, da selve profilen ikke er ændret.
export async function giveAiConsent(profile) {
  const consentedProfile = { ...profile, aiConsentAt: new Date().toISOString() };

  await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(consentedProfile));

  return consentedProfile;
}
