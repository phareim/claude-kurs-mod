---
del: 4
tittel: Subagenter
tid: 30–40 minutter
---

## Hva du nettopp har lært

Subagenter er spesialiserte AI-assistenter som kjører i eget kontekstvindu, isolert fra hoveddialogen. De er nyttige for å holde konteksten ren, kjøre oppgaver parallelt og delegere avgrensede ansvarsområder.

Claude Code har flere innebygde subagenter, blant annet:

- **Explore** – rask utforskning uten skrivetilgang (bruker Haiku)
- **Plan** – undersøkelser og planlegging, uten skrivetilgang
- **General-purpose** – tilgang til alle verktøy

Plugins kan legge til flere (f.eks. `code-reviewer`). Dette kurset er selv en plugin og har med subagenten `kurs:kursgransker`. Skriv `/agents` for å se hele listen og lage dine egne.

## Utforsk uten å forurense konteksten
<!-- oppgave: utforsk -->
<!-- hint: Be Claude uttrykkelig om å bruke en subagent. Oppgaven krysses av når Claude starter en subagent. -->

Har du bedt Claude lese mange filer og merket at den glemmer det dere snakket om i starten? Subagenter løser dette. Be Claude bruke en subagent til å utforske, og få bare oppsummeringen tilbake.

```prompt
Bruk en subagent til å utforske hele src/-mappen. Gi meg en oppsummering av arkitekturen og hvordan komponentene henger sammen.
```

## Parallelle undersøkelser
<!-- oppgave: parallell -->
<!-- hint: Be Claude bruke separate subagenter parallelt. Oppgaven krysses av når Claude starter minst to subagenter i samme tur. -->

Når du trenger å forstå flere deler av kodebasen samtidig, kan Claude utforske dem parallelt med hver sin subagent.

```prompt
Bruk separate subagenter til å utforske autentiseringsmodulen, databaselaget og API-rutene parallelt. Oppsummer det dere finner.
```

## Kjør tester isolert
<!-- oppgave: tester -->
<!-- hint: Oppgaven krysses av når en subagent (ikke hoveddialogen) kjører en testkommando. -->

Resultater fra testkjøring kan ta mye plass. En subagent kan kjøre testene og bare rapportere det som er relevant.

```prompt
Bruk en subagent til å kjøre alle testene. Rapporter bare testene som feiler, med feilmeldingene.
```

## Gjennomgang av egne endringer
<!-- oppgave: review -->
<!-- hint: Oppgaven krysses av når en subagent kjører git diff. Har du ikke et git-repo ennå, be Claude kjøre git init og lage en første commit. -->

Be en subagent gå gjennom endringene du har gjort, uten at kommentarene fra gjennomgangen fyller opp hoveddialogen.

```prompt
Bruk en subagent til å gå gjennom endringene jeg har gjort (git diff). Rapporter eventuelle problemer, gruppert etter alvorlighetsgrad.
```

## Lag din egen subagent
<!-- oppgave: egen -->
<!-- hint: Skriv /agents og velg «Create new agent» (opprett ny agent). Oppgaven krysses av når det ligger en fil i .claude/agents/ i prosjektet. -->

Bruk `/agents` for å lage en subagent som passer prosjektet ditt. Noen ideer:

- **Kodegransker** – går gjennom kode for kvalitet, sikkerhet og beste praksis. Gi den bare lesetilgang (Read, Grep, Glob, Bash).
- **Testkjører** – kjører tester og rapporterer feil. Kan bruke en billigere modell (Haiku).
- **Dokumentasjonsskriver** – leser koden og lager eller oppdaterer dokumentasjon.

```prompt
/agents
```

Velg «Create new agent» (opprett ny agent), gi den et navn og en beskrivelse, og velg hvilke verktøy den skal ha tilgang til. Husk: `description`-feltet forteller Claude når den skal delegere til agenten på eget initiativ.

## Bonus: subagenter i kjede
<!-- oppgave: kjede bonus -->
<!-- hint: Oppgaven krysses av når Claude bruker en subagent du har laget selv (en som ligger i .claude/agents/). Nevn den gjerne ved navn i prompten. -->

Lag en subagent og be Claude bruke den i en kjede: først utforsker én subagent kodebasen, deretter bruker en annen resultatene til å implementere en endring.

```prompt
Bruk først en subagent til å analysere appen slik den er nå og finne ut hva som mangler. Bruk deretter en annen subagent til å implementere den viktigste funksjonen som mangler.
```

> **Tips fra Anthropic:** Parallelle undersøkelser med subagenter er en av de mest effektive måtene å spare kontekstplass på. Utforskning som ellers fyller opp konteksten, skjer i egne vinduer, og du får bare konklusjonene.
