# Coreliance

Coreliance hjælper internationale studerende og nyuddannede med at forstå,
hvordan andre internationale er kommet ind på det danske arbejdsmarked.

## Sådan køres projektet

1. Åbn projektmappen i terminalen.

2. Installer dependencies:

npm install

3. Start projektet med Expo:

npx expo start

4. Scan QR-koden med Expo Go på mobilen eller åbn projektet i webversion.

## Funktioner

* **Login** – opret konto, log ind og log ud med Firebase Authentication.
* **Explore** – fiktive career cases hentet fra Firebase Realtime Database, med filtre og detaljeside.
* **My Profile** – kort jobsøgerprofil (12 spørgsmål, primært valgknapper og to fritekstfelter),
  gemt i Realtime Database under brugerens UID og kan redigeres senere.
* **People Like Me** – efter eksplicit samtykke sendes profilen og de fiktive cases til OpenAI via en
  sikker Firebase Cloud Function, som returnerer matches med forklaringer.
* **About** – kort forklaring af idéen bag Coreliance samt log ud.
* **Contribute** – demo-formular til personer, der allerede har fået job.
  Indholdet sendes ikke nogen steder.

Flow: Login → Explore → People Like Me → My Profile → samtykke → AI-matches → Career Case.

## Vigtigt om data

* Dette er en **akademisk demonstration** (CBS INNT).
* Alle career cases er **fiktive demo-profiler** (`seed/careerCases.json`).
* OpenAI-nøglen ligger kun som secret i Firebase og aldrig i appen.

## Firebase-opsætning (én gang)

Se `INTEGRATION_HANDOFF.md`, afsnit 5. Kort fortalt: opret projektet, slå Email/Password-login til,
opret Realtime Database (Belgium), og kør derefter `npm run deploy:rules`, `npm run seed:cases` og
`npm run deploy:functions`. Det sidste kræver Blaze-planen og en OpenAI-nøgle.

## Projektstruktur

```
App.js                        Viser login eller appen ud fra Firebase Auth
database/firebase.js          Firebase-konfiguration (auth, database, functions)
navigation/AppNavigator.js    Bottom tabs + Explore-stak
screens/                      Auth, Explore, CareerCase, PeopleLikeMe, JobSeekerProfile, About, Contribute
components/                   CareerCard, FormField (genbruges af alle formularer)
data/jobSeekerProfile.js      Felter og validering for jobsøgerprofilen
services/careerCaseService.js Henter career cases fra Firebase
services/profileService.js    Gemmer/henter profil og AI-samtykke i Firebase
services/matchingService.js   Kalder Cloud Function'en for AI-matching
functions/index.js            Cloud Function: login-tjek, samtykke, rate limit, OpenAI-kald
database.rules.json           Database-regler (kun egen profil)
seed/careerCases.json         14 fiktive career cases til databasen
styles/styles.js              Alle styles og farver
```

## Demovideo

Link til demovideo (første iteration):

https://www.loom.com/share/7153c40e06de4f07829d83e080fae41b

## Teknologi

* React Native
* Expo
* JavaScript
* React Navigation
* Firebase (Authentication, Realtime Database, Cloud Functions)
* OpenAI API (via Cloud Functions)

## Udarbejdet af

Syed Ali Hamza Naqvi
