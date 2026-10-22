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

* **Explore** – liste over anonymiserede career cases med filtre og detaljeside.
* **People Like Me** – jobsøgeren opretter en profil og ser career cases fra
  personer med lignende baggrund, mål og udfordringer, inkl. forklaring på hvert match.
* **My Profile** – omfattende jobsøgerprofil (uddannelse, erfaring, karriereinteresser
  og personlig kontekst) med validering. Profilen gemmes lokalt med AsyncStorage og
  er der stadig, når appen åbnes igen.
* **About** – kort forklaring af idéen bag Coreliance.
* **Contribute** – demo-formular til personer, der allerede har fået job.
  Indholdet sendes ikke nogen steder.

Flow: Explore → People Like Me → (My Profile, hvis der ikke er en profil) → Matches → Career Case.

## Vigtigt om data

* Alle career cases i appen er **opdigtede demo-cases** (`data/careerCases.js`).
* Matching er en **simpel lokal sammenligning**, ikke AI.
* Jobsøgerprofilen gemmes **kun på enheden** og sendes ikke til Supabase eller andre tjenester.

Se `INTEGRATION_HANDOFF.md` for hvordan Supabase og OpenAI skal kobles på senere.

## Projektstruktur

```
App.js                        Root med NavigationContainer
navigation/AppNavigator.js    Bottom tabs + Explore-stak
screens/                      Explore, CareerCase, PeopleLikeMe, JobSeekerProfile, About, Contribute
components/                   CareerCard, FormField (genbruges af begge formularer)
data/careerCases.js           Demo-cases
data/jobSeekerProfile.js      Felter og validering for jobsøgerprofilen
services/careerCaseService.js Henter career cases (demo nu, Supabase senere)
services/profileService.js    Gemmer/henter profilen (AsyncStorage nu, Supabase senere)
services/matchingService.js   People Like Me-matching (lokal nu, OpenAI-backend senere)
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
* AsyncStorage

## Udarbejdet af

Syed Ali Hamza Naqvi
