import AsyncStorage from '@react-native-async-storage/async-storage';

import { EMPTY_PROFILE } from '../data/jobSeekerProfile';

// Denne fil står for at gemme og hente jobsøgerens profil med AsyncStorage.
// Profilen ligger kun på enheden. Skærmene bruger kun funktionerne herunder
// og ved ikke selv, hvordan profilen bliver gemt.
const PROFILE_KEY = 'coreliance:jobSeekerProfile';

// Returnerer den gemte profil eller null, hvis brugeren ikke har lavet en endnu.
// Jeg fletter med EMPTY_PROFILE, så alle felter altid findes.
// Hvis lageret fejler, kaster funktionen en fejl, som skærmen selv håndterer.
export async function loadProfile() {
  const json = await AsyncStorage.getItem(PROFILE_KEY);

  return json ? { ...EMPTY_PROFILE, ...JSON.parse(json) } : null;
}

// Gemmer formularens felter. Jeg tager kun de felter med, der findes i formularen,
// og henter et eventuelt AI-samtykke fra den gemte profil, så det ikke går tabt,
// hvis formularen blev åbnet, før samtykket blev givet.
export async function saveProfile(form) {
  const existingProfile = await loadProfile();
  const fields = Object.fromEntries(Object.keys(EMPTY_PROFILE).map((key) => [key, form[key]]));
  const savedProfile = {
    ...fields,
    aiConsentAt: existingProfile?.aiConsentAt,
    updatedAt: new Date().toISOString(),
  };

  await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(savedProfile));

  return savedProfile;
}

// Gemmer tidspunktet for brugerens samtykke til, at profilen sendes til OpenAI.
export async function giveAiConsent(profile) {
  const consentedProfile = { ...profile, aiConsentAt: new Date().toISOString() };

  await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(consentedProfile));

  return consentedProfile;
}
