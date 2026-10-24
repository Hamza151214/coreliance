# Coreliance

Coreliance hjælper internationale studerende og nyuddannede med at forstå,
hvordan andre internationale er kommet ind på det danske arbejdsmarked.

Dette er en **lokal akademisk prototype** (CBS INNT). Alle career cases er **fiktive demo-profiler**.

## Installation

Kræver Node.js 22.9 eller nyere.

```bash
npm install
```

## OpenAI-nøgle (.env)

AI-matchingen kører gennem en lille lokal server, som har OpenAI-nøglen. Appen kender aldrig nøglen.

1. Kopiér `server/.env.example` til `server/.env`.
2. Indsæt din egen nøgle: `OPENAI_API_KEY=sk-...`

`server/.env` er udelukket fra Git. Uden nøgle virker alt undtagen People Like Me, som viser en tydelig fejl.

## Start appen

```bash
npm run dev
```

Kommandoen starter både den lokale AI-server (port 3001) og Expo. Tryk `w` for web, `i` for
iOS-simulator, eller scan QR-koden med Expo Go. Stop begge med Ctrl+C.

**Fysisk telefon:** telefonen kan ikke nå `localhost` på computeren. Start i stedet med computerens
IP-adresse (vises i Expo som `exp://192.168.x.x:8081`):

```bash
HOST=0.0.0.0 EXPO_PUBLIC_API_URL=http://192.168.x.x:3001 npm run dev
```

Telefon og computer skal være på samme Wi-Fi. Serveren er kun tilgængelig på lokalnetværket.

Server-tests med en falsk OpenAI (ingen nøgle nødvendig): `npm test`.

## Navigation

Appen har fire tabs i bunden:

* **Explore**: de 14 fiktive career cases med filtre.
* **People Like Me**: personlige AI-matches baseret på din profil.
* **My Profile**: opret, se og rediger din jobsøgerprofil (12 spørgsmål i tre sektioner).
* **Contribute**: demo-formular for ansatte. Intet gemmes eller sendes.

**About** åbnes fra info-ikonet øverst til højre. **Career Case** er den samme detaljeside fra både
Explore og People Like Me, og tilbage-pilen fører altid tilbage til den tab, man kom fra.

## Data, AI og caching

* **AsyncStorage** gemmer to ting på enheden:
  * `coreliance:jobSeekerProfile`: profilen og tidspunktet for AI-samtykke.
  * `coreliance:matchCache`: de seneste AI-matches (case-ID'er, forklaringer og tidspunkt), en
    signatur af de profilsvar, der blev brugt, og versioner af matchinglogik og datasæt.
* **OpenAI kaldes kun, når brugeren trykker** på "Find my matches", "Update matches" eller
  "Refresh matches". At åbne People Like Me igen, navigere tilbage eller gemme profilen starter
  aldrig et nyt kald. De gemte matches vises i stedet med det samme, også efter genstart.
* Ændres de profilsvar, AI'en brugte, markeres matches som forældede med en "Update matches"-knap.
  Gemmes profilen uden ændringer, beholdes matches.
* Ændres career cases eller `MATCHING_VERSION` i `services/matchingService.js`, kasseres gamle matches.
* Fejler et AI-kald, beholdes de tidligere matches, og fejlen vises tydeligt. Der er ingen skjult
  "nød-matching".
* **Career cases** ligger i `data/careerCases.json`. Både appen og serveren læser den samme fil.
* **Serveren** sender kun de relevante profilfelter og de fiktive cases til OpenAI, beder om
  struktureret JSON og kontrollerer, at alle case-ID'er findes. Nationalitet og andre beskyttede
  karakteristika bruges ikke. Serveren gemmer intet.

## Projektstruktur

```
App.js                        Root med NavigationContainer
navigation/AppNavigator.js    Stack (tabs, Career Case, About) + fire bottom tabs
screens/                      Explore, CareerCase, PeopleLikeMe, JobSeekerProfile, About, Contribute
components/                   CareerCard, FormField
data/careerCases.json         14 fiktive career cases
data/jobSeekerProfile.js      Felter og validering for jobsøgerprofilen
services/careerCaseService.js Henter career cases
services/profileService.js    Gemmer/henter profil og samtykke med AsyncStorage
services/matchingService.js   Kalder den lokale AI-server og cacher matches
server/index.js               Lokal Node.js-server (POST /match)
server/matching.js            Prompt, OpenAI-kald og validering
server/matching.test.js       Tests med falsk OpenAI
scripts/dev.js                Starter server og Expo med én kommando
styles/styles.js              Alle styles og farver
```

## Demovideo

Link til demovideo (første iteration, **ny video skal indsættes**):

https://www.loom.com/share/7153c40e06de4f07829d83e080fae41b

## Teknologi

* React Native, Expo og JavaScript
* React Navigation
* AsyncStorage
* Node.js og OpenAI JavaScript SDK

## Udarbejdet af

Syed Ali Hamza Naqvi
