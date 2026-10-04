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
Create a new Next.js project with TypeScript and Tailwind CSS. Set up the basic project structure for a kanban board application.
```

```prompt
Initialize a React project with Vite. I want to build the smoothest todo list in existence, with animations and a clean UI.
```

```prompt
Set up a Python Flask API that fetches company data from the Brønnøysund public API (https://data.brreg.no/enhetsregisteret/api/enheter). Create a simple frontend that displays the results.
```

## Utforsk kommandoene
<!-- oppgave: snarveier -->
<!-- hint: Dette kan ikke kurset se. Prøv hver snarvei én gang og merk oppgaven som gjort selv med «/kurs ferdig». -->

Prøv de viktigste snarveiene mens du jobber:

- **Shift+Tab** bytter mellom moduser (normal, auto-accept, plan mode)
- **Esc** stopper Claude midt i en operasjon
- **Esc Esc** åpner rewind-menyen
- Skriv **?** i Claude for å se alle tastatursnarveier

## Bruk plan mode
<!-- oppgave: plan -->
<!-- hint: Trykk Shift+Tab til det står «plan mode» under prompten, og send en prompt. Oppgaven krysses av når du sender en prompt i plan mode, eller når Claude legger fram en plan. -->

Bytt til plan mode med Shift+Tab og be Claude analysere og planlegge før den implementerer. Dette er særlig nyttig for større endringer.

```prompt
I want to add user authentication to my app. Analyze the current codebase and create a plan for how to implement this.
```

## La Claude implementere
<!-- oppgave: implementer -->
<!-- hint: Bytt ut av plan mode med Shift+Tab og gi Claude en oppgave som endrer filer. Oppgaven krysses av når Claude skriver eller endrer en fil. -->

Bytt tilbake til normal modus og be Claude implementere basert på planen, eller gi den en ny oppgave.

```prompt
Implement the main page with a header, a list view, and a form for adding new items. Make it look clean and modern.
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
Write tests for the code you just created. Run them and fix any failures.
```

> **Tips fra Anthropic:** Å gi Claude verifiseringskriterier er det enkeltgrepet som forbedrer kvaliteten mest. Uten klare suksesskriterier er du den eneste feedback-loopen.
