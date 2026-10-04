---
del: 3
tittel: MCP – koble Claude til verktøyene dine
tid: 25–35 minutter
---

## Hva du nettopp har lært

MCP (Model Context Protocol) lar Claude snakke med eksterne verktøy og systemer. Med MCP-servere kan Claude lese issues, spørre databaser, hente dokumentasjon og mye mer, uten at du trenger å kopiere og lime inn manuelt.

## Se status på MCP-serverne dine
<!-- oppgave: status -->
<!-- hint: Skriv /mcp i prompten. Oppgaven krysses av når du åpner /mcp. -->

Fra terminalen kan du skrive `claude mcp list`:

```bash
claude mcp list
Checking MCP server health...

context7: https://mcp.context7.com/mcp (HTTP) - ✓ Connected
linear: https://mcp.linear.app/mcp (HTTP) - ✓ Connected
```

Eller skriv `/mcp` inne i Claude. Da ser du serverne gruppert etter hvor de er satt opp: i prosjektet (`.mcp.json`), lokalt for deg i dette prosjektet, og globalt for brukeren din.

```prompt
/mcp
```

## Context7 – oppdatert dokumentasjon
<!-- oppgave: context7 -->
<!-- hint: Installer serveren fra terminalen med kommandoen under, start Claude på nytt og be om dokumentasjon for et bibliotek du bruker. Oppgaven krysses av når Claude kaller et Context7-verktøy. -->

Context7 gir Claude tilgang til oppdatert dokumentasjon for biblioteker og rammeverk. Nyttig hvis du bruker Next.js, React, Flask eller lignende. [Les mer om Context7](https://context7.com/).

```bash
claude mcp add --scope user context7 -- npx -y @upstash/context7-mcp
```

> Med `--scope user` blir MCP-serveren tilgjengelig globalt, ikke bare i prosjektet du installerte den i.

Start Claude og skriv `/context`. Da ser du at den nye MCP-serveren er lastet inn. Nå kan du bruke den med naturlig språk:

```prompt
Gi meg dokumentasjonen til useMemo.
```

**Hvorfor er dette nyttig?** Språkmodeller trenes ikke daglig og kan ha utdatert kunnskap. Context7 er en samling oppdatert dokumentasjon som Claude kan hente ved behov.

Vil du fjerne serveren igjen? `claude mcp remove context7`

## Linear eller Notion – prosjektstyring
<!-- oppgave: prosjektstyring -->
<!-- hint: Skriv /plugin, installer Notion eller Linear, kjør /reload-plugins og autentiser serveren under /mcp. Oppgaven krysses av når Claude kaller et Linear- eller Notion-verktøy. -->

Koble Claude til Linear eller Notion for å hente og oppdatere issues, se prosjektstatus og håndtere oppgaver. MCP-servere kan installeres fra CLI, som over. Claude Code har også en samling ferdige plugins du finner med `/plugin`:

1. Bruk `/plugin` til å installere Notion eller Linear.
2. Start Claude på nytt eller kjør `/reload-plugins`, og skriv `/mcp`. Velg den nye serveren for å autentisere den. Du må ha en gratis konto hos Notion eller Linear.
3. Be Claude lage et nytt prosjekt i tjenesten du valgte, med en kort intro om hva du bygger.
4. Åpne dashboardet til Linear eller Notion og se at prosjektet er opprettet. Claude gir deg som regel en direkte lenke.

## Sett MCP-serverne i bruk
<!-- oppgave: bruk -->
<!-- hint: Lag en issue, kjør /clear, og be Claude gjøre jobben ut fra issuen. Merk oppgaven som gjort selv når issuen har fått ny status. -->

Når serveren er installert, snakker du med den på naturlig språk. Claude velger riktig verktøy selv.

```prompt
Create a new issue in Linear/Notion for adding dark mode support to the app.
```

Kjør `/clear`, og la Claude finne oppgaven igjen på egen hånd:

```prompt
We have a task related to implementing dark mode. Read the issue, do the work, and update the issue status when done.
```

Bruk også MCP-serveren til noe som er relevant for prosjektet du bygger: hent dokumentasjon for et bibliotek du bruker, lag issues for oppgaver du vil gjøre, eller les designnotater fra Notion.

## Bonus: to servere i én prompt
<!-- oppgave: kombiner bonus -->
<!-- hint: Skriv én prompt som trenger både dokumentasjon og en issue. Oppgaven krysses av når Claude kaller verktøy fra to ulike MCP-servere i samme tur. -->

Installer to MCP-servere og bruk dem sammen i en enkelt prompt. For eksempel: hent dokumentasjon med Context7 og lag en issue i Linear eller Notion ut fra det du finner.

```prompt
Use Context7 to check if there's a better way to handle state management in my React app, and create an issue with your recommendations.
```
