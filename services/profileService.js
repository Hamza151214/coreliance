import { ref, get, update } from 'firebase/database';

import { auth, db } from '../database/firebase';
import { EMPTY_PROFILE } from '../data/jobSeekerProfile';

// Denne fil står for at gemme og hente jobsøgerens profil i Firebase Realtime Database.
// Profilen ligger under jobSeekerProfiles/<UID>, og database-reglerne sikrer,
// at en bruger kun kan læse og ændre sin egen profil.
function profileRef() {
  const user = auth.currentUser;

  if (!user) {
    throw new Error('You need to be logged in.');
  }

  return ref(db, `jobSeekerProfiles/${user.uid}`);
}

// Returnerer den gemte profil eller null, hvis brugeren ikke har lavet en endnu.
// Firebase gemmer ikke tomme arrays, så jeg fletter med EMPTY_PROFILE.
export async function loadProfile() {
  const snapshot = await get(profileRef());

  return snapshot.exists() ? { ...EMPTY_PROFILE, ...snapshot.val() } : null;
}

// Jeg bruger update i stedet for set, så et tidligere givet AI-samtykke ikke slettes,
// når brugeren redigerer sin profil.
export async function saveProfile(profile) {
  const fields = Object.fromEntries(Object.keys(EMPTY_PROFILE).map((key) => [key, profile[key]]));
  const savedProfile = { ...fields, updatedAt: new Date().toISOString() };

  await update(profileRef(), savedProfile);

  return savedProfile;
}

// Gemmer tidspunktet for brugerens samtykke til, at profilen sendes til OpenAI.
// Backend tjekker selv dette felt, før den kalder OpenAI.
export async function giveAiConsent() {
  await update(profileRef(), { aiConsentAt: new Date().toISOString() });
}
