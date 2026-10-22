import AsyncStorage from '@react-native-async-storage/async-storage';

// Denne fil står for at gemme og hente jobsøgerens profil.
// Lige nu gemmes profilen kun lokalt på telefonen med AsyncStorage.
// Skærmene bruger kun loadProfile() og saveProfile(), så AsyncStorage
// senere kan erstattes af et kald til Supabase uden at ændre skærmene.
const PROFILE_KEY = 'coreliance:jobSeekerProfile';

// Returnerer den gemte profil eller null, hvis brugeren ikke har lavet en endnu.
// Hvis lageret fejler, kaster funktionen en fejl, som skærmen selv håndterer.
export async function loadProfile() {
  const json = await AsyncStorage.getItem(PROFILE_KEY);

  return json ? JSON.parse(json) : null;
}

// Jeg gemmer et tidsstempel sammen med profilen,
// så brugeren kan se hvornår den sidst blev opdateret.
export async function saveProfile(profile) {
  const savedProfile = {
    ...profile,
    updatedAt: new Date().toISOString(),
  };

  await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(savedProfile));

  return savedProfile;
}
