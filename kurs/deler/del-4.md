---
del: 4
tittel: Subagenter
tid: 30–40 minutter
---

## Hva du nettopp har lært

Subagenter er spesialiserte AI-assistenter som kjører i eget kontekstvindu, isolert fra hoveddialogen. De er nyttige for å holde konteksten ren, kjøre oppgaver parallelt og delegere avgrensede ansvarsområder.

Claude Code har flere innebygde subagenter, blant annet:

- **Explore** – rask utforskning uten skrivetilgang (bruker Haiku)
- **Plan** – research og planlegging, uten skrivetilgang
- **General-purpose** – tilgang til alle verktøy

Plugins kan legge til flere (f.eks. `code-reviewer`). Dette kurset er selv en plugin og har med subagenten `kurs:kursgransker`. Skriv `/agents` for å se hele listen og lage dine egne.

## Utforsk uten å forurense konteksten
<!-- oppgave: utforsk -->
<!-- hint: Be Claude uttrykkelig om å bruke en subagent. Oppgaven krysses av når Claude starter en subagent. -->

Har du bedt Claude lese mange filer og merket at den glemmer det dere snakket om i starten? Subagenter løser dette. Be Claude bruke en subagent til å utforske, og få bare oppsummeringen tilbake.

```prompt
Use a subagent to explore the entire src/ directory and give me a summary of the architecture and how the components are connected.
```

## Parallell research
<!-- oppgave: parallell -->
<!-- hint: Be om «separate subagents ... in parallel». Oppgaven krysses av når Claude starter minst to subagenter i samme tur. -->

Når du trenger å forstå flere deler av kodebasen samtidig, kan Claude utforske dem parallelt med hver sin subagent.

```prompt
Use separate subagents to explore the authentication module, the database layer, and the API routes in parallel. Summarize your findings.
```

## Kjør tester isolert
<!-- oppgave: tester -->
<!-- hint: Oppgaven krysses av når en subagent (ikke hoveddialogen) kjører en testkommando. -->

Testoutput kan være svært ordrik. En subagent kan kjøre testene og bare rapportere det som er relevant.

```prompt
Use a subagent to run all tests and report back only the failures with their error messages.
```

## Review av egne endringer
<!-- oppgave: review -->
<!-- hint: Oppgaven krysses av når en subagent kjører git diff. Har du ikke et git-repo ennå, be Claude kjøre git init og lage en første commit. -->

Be en subagent gå gjennom endringene du har gjort, uten at review-kommentarene fyller opp hoveddialogen.

```prompt
Use a subagent to review the changes I've made (git diff) and report any issues, grouped by severity.
```

## Lag din egen subagent
<!-- oppgave: egen -->
<!-- hint: Skriv /agents og velg «Create new agent». Oppgaven krysses av når det ligger en fil i .claude/agents/ i prosjektet. -->

Bruk `/agents` for å lage en subagent som passer prosjektet ditt. Noen ideer:

- **Code reviewer** – går gjennom kode for kvalitet, sikkerhet og beste praksis. Gi den bare lesetilgang (Read, Grep, Glob, Bash).
- **Test runner** – kjører tester og rapporterer feil. Kan bruke en billigere modell (Haiku).
- **Dokumentasjonsskriver** – leser koden og lager eller oppdaterer dokumentasjon.

```prompt
/agents
```

Velg «Create new agent», gi den et navn og en beskrivelse, og velg hvilke verktøy den skal ha tilgang til. Husk: `description`-feltet forteller Claude når den skal delegere til agenten på eget initiativ.

## Bonus: subagenter i kjede
<!-- oppgave: kjede bonus -->
<!-- hint: Oppgaven krysses av når Claude bruker en subagent du har laget selv (en som ligger i .claude/agents/). Nevn den gjerne ved navn i prompten. -->

Lag en subagent og be Claude bruke den i en kjede: først utforsker én subagent kodebasen, deretter bruker en annen resultatene til å implementere en endring.

```prompt
First, use a subagent to analyze the current state of the app and identify what's missing. Then use another subagent to implement the most important missing feature.
```

> **Tips fra Anthropic:** Parallell research med subagenter er en av de mest effektive måtene å spare kontekstplass på. Utforskning som ellers fyller opp konteksten, skjer i egne vinduer, og du får bare konklusjonene.
