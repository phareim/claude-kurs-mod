---
del: 1
tittel: Kom i gang med Claude Code
tid: 20–30 minutter
---

## Hva du nettopp har lært

Du har fått en innføring i hva Claude Code er, hvordan det fungerer, og hvilke kommandoer og moduser som finnes. Før du går i gang, se på ressursene i `ressurser/` (`/kurs ressurser`) for tips som er nyttige underveis i kurset.

> **Blir oppgavene for enkle?** Prøv å gjøre dem i Agent View med parallelle agenter og git worktrees. Start slik: `claude agents`. Mer om funksjonen står i ressursen «Agent View».

## Kom i gang

Åpne terminalen, gå til en mappe der du vil opprette prosjektet ditt, og start Claude Code.

```bash
mkdir my-project && cd my-project
claude
```

Hvis du ikke har installert Claude Code ennå:

```bash
curl -fsSL https://claude.ai/install.sh | bash
```

> Claude Code finnes også som desktop-app, i nettleseren på claude.ai/code, og som IDE-utvidelse i VS Code og JetBrains. I dette kurset bruker vi terminalversjonen.

## Start prosjektet ditt
<!-- oppgave: start -->
<!-- hint: Skriv en prompt som sier hva du vil lage og hvilken teknologi du vil bruke. Oppgaven krysses av når du har sendt din første prompt. -->

Be Claude sette opp prosjektet for deg. Beskriv hva du ønsker å lage og hvilken teknologi du vil bruke, og la Claude ta seg av resten. Jo mer kontekst du gir, desto bedre blir resultatet.

Noen eksempler på prompter:

```prompt
Opprett et nytt Next.js-prosjekt med TypeScript og Tailwind CSS. Sett opp den grunnleggende prosjektstrukturen for en app med en kanban-tavle.
```

```prompt
Opprett et React-prosjekt med Vite. Jeg vil lage verdens smidigste gjøremålsliste, med animasjoner og et ryddig brukergrensesnitt.
```

```prompt
Sett opp et API med Python og Flask som henter bedriftsdata fra Brønnøysundregistrenes offentlige API (https://data.brreg.no/enhetsregisteret/api/enheter). Lag et enkelt brukergrensesnitt som viser resultatene.
```

## Utforsk kommandoene
<!-- oppgave: snarveier -->
<!-- hint: Dette kan ikke kurset se. Prøv hver snarvei én gang og merk oppgaven som gjort selv med «/kurs ferdig». -->

Prøv de viktigste snarveiene mens du jobber:

- **Shift+Tab** bytter mellom moduser (normal modus, automatisk godkjenning og planleggingsmodus)
- **Esc** stopper Claude midt i en operasjon
- **Esc Esc** åpner menyen for å gå tilbake til et tidligere punkt
- Skriv **?** i Claude for å se alle tastatursnarveier

## Bruk planleggingsmodus
<!-- oppgave: plan -->
<!-- hint: Trykk Shift+Tab til det står «plan mode» under prompten, og send en prompt. Oppgaven krysses av når du sender en prompt i planleggingsmodus, eller når Claude legger fram en plan. -->

Bytt til planleggingsmodus («plan mode») med Shift+Tab og be Claude analysere og planlegge før den implementerer. Dette er særlig nyttig for større endringer.

```prompt
Jeg vil legge til brukerautentisering i appen min. Analyser kodebasen og lag en plan for hvordan dette kan implementeres.
```

## La Claude implementere
<!-- oppgave: implementer -->
<!-- hint: Bytt ut av planleggingsmodus med Shift+Tab og gi Claude en oppgave som endrer filer. Oppgaven krysses av når Claude skriver eller endrer en fil. -->

Bytt tilbake til normal modus og be Claude implementere basert på planen, eller gi den en ny oppgave.

```prompt
Lag hovedsiden med et toppfelt, en listevisning og et skjema for å legge til nye elementer. Gi den et ryddig og moderne utseende.
```

## Kontekststyring
<!-- oppgave: kontekst -->
<!-- hint: Skriv /compact, /clear eller /rewind i prompten. Oppgaven krysses av når du har brukt én av dem. Kurspanelet husker hvor du er selv etter /clear. -->

Prøv `/clear`, `/compact` og `/rewind` underveis:

- `/clear` tømmer kontekstvinduet når du starter på noe nytt
- `/compact` komprimerer samtalen for å frigjøre plass
- `/rewind` går tilbake til et tidligere punkt hvis noe gikk galt

## Bonus: tester i samme sesjon
<!-- oppgave: tester bonus -->
<!-- hint: Be Claude skrive og kjøre tester. Oppgaven krysses av når Claude kjører en testkommando (npm test, vitest, pytest og lignende). -->

Be Claude generere tester for koden den har skrevet, kjøre dem, og fikse eventuelle feil. Alt i samme sesjon.

```prompt
Skriv tester for koden du nettopp laget. Kjør dem og rett eventuelle feil.
```

> **Tips fra Anthropic:** Å gi Claude verifiseringskriterier er det enkeltgrepet som forbedrer kvaliteten mest. Uten klare suksesskriterier er det bare du som kan gi tilbakemelding på om resultatet er riktig.
