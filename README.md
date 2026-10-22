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
iOS-simulator, eller scan QR-koden med Expo Go.

**Fysisk telefon:** telefonen kan ikke nå `localhost` på computeren. Start i stedet med computerens
IP-adresse (vises i Expo som `exp://192.168.x.x:8081`):

```bash
HOST=0.0.0.0 EXPO_PUBLIC_API_URL=http://192.168.x.x:3001 npm run dev
```

Telefon og computer skal være på samme Wi-Fi. Serveren er kun tilgængelig på lokalnetværket.

Server-tests med en falsk OpenAI (ingen nøgle nødvendig): `npm test`.

## Funktioner

* **Explore**: de 14 fiktive career cases med filtre og detaljeside.
* **My Profile**: kort jobsøgerprofil (12 spørgsmål i tre sektioner, primært valgknapper og to
  fritekstfelter) med validering. Profilen kan redigeres senere.
* **People Like Me**: efter samtykke sendes profilen til den lokale server, som spørger OpenAI og
  returnerer de mest relevante cases med ligheder, forskelle og læringspointer.
* **Career Case**: detaljesiden, som bruges fra både Explore og People Like Me.
* **About**: kort forklaring af idéen.
* **Contribute**: lokal demo-formular for ansatte. Intet gemmes eller sendes.

## Data og AI

* **AsyncStorage** gemmer kun jobsøgerens profil og tidspunktet for AI-samtykke på enheden
  (nøglen `coreliance:jobSeekerProfile`).
* **Career cases** ligger i `data/careerCases.json`. Både appen og serveren læser den samme fil.
* **OpenAI-matching**: serveren sender kun de relevante profilfelter og de fiktive cases til OpenAI,
  beder om struktureret JSON og kontrollerer, at alle case-ID'er findes. Nationalitet og andre
  beskyttede karakteristika bruges ikke. Hvis OpenAI fejler, vises fejlen. Der er ingen skjult
  "nød-matching".

## Projektstruktur

```
App.js                        Root med NavigationContainer
navigation/AppNavigator.js    Bottom tabs + Explore-stak
screens/                      Explore, CareerCase, PeopleLikeMe, JobSeekerProfile, About, Contribute
components/                   CareerCard, FormField
data/careerCases.json         14 fiktive career cases
data/jobSeekerProfile.js      Felter og validering for jobsøgerprofilen
services/careerCaseService.js Henter career cases
services/profileService.js    Gemmer/henter profil og samtykke med AsyncStorage
services/matchingService.js   Kalder den lokale AI-server
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
