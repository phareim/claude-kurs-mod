# Hemmeligheter og hooks

Del 1 bygger opp øvelsen slik: lag appen, legg til innlogging, fyll inn en lokal hemmelighet selv, og test en hook som stopper direkte tilgang til `.env`.

## Et ferdig hook-eksempel

Eksempelet bruker Node.js uten ekstra pakker. Sjekk at `node --version` virker i terminalen. Har du valgt en annen teknologi, kan Claude lage samme kontroll i et språk du allerede har installert.

Lagre scriptet som `.claude/hooks/beskytt-env.cjs` i prosjektet. Det leser verktøykallet fra standard inn og svarer med en blokkering før verktøyet kjører. Det leser aldri `.env`.

```javascript
const fs = require('node:fs')

function avvis(grunn) {
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: 'deny',
      permissionDecisionReason: grunn,
    },
  }))
}

try {
  const kall = JSON.parse(fs.readFileSync(0, 'utf8'))
  const input = kall.tool_input ?? {}
  let blokker = false

  if (['Read', 'Edit', 'Write'].includes(kall.tool_name)) {
    if (typeof input.file_path !== 'string') {
      throw new Error('Missing file_path')
    }
    const navn = input.file_path.split(/[\\/]/).pop()
    blokker = navn !== '.env.example'
      && (navn === '.env' || navn.startsWith('.env.'))
  } else if (kall.tool_name === 'Bash') {
    if (typeof input.command !== 'string') {
      throw new Error('Missing command')
    }
    // A conservative text check, not a shell parser.
    blokker = input.command.includes('.env')
  }

  if (blokker) {
    avvis('Direkte tilgang til .env er blokkert. Bruk .env.example eller be brukeren gjøre endringen selv.')
  }
} catch {
  avvis('Hooken kunne ikke kontrollere verktøykallet og blokkerer det. Sjekk hook-scriptet.')
}
```

Legg inn følgende i `.claude/settings.json`. Har filen allerede innstillinger eller hooks, flett inn den nye `PreToolUse`-oppføringen. Bevar resten.

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Read|Edit|Write|Bash",
        "hooks": [
          {
            "type": "command",
            "command": "node \"$CLAUDE_PROJECT_DIR/.claude/hooks/beskytt-env.cjs\""
          }
        ]
      }
    ]
  }
}
```

Start Claude Code på nytt og sjekk `/hooks`. Hvis scriptet mangler eller Node ikke starter, har scriptet heller ikke fått gitt noen blokkering. Ikke regn beskyttelsen som aktiv før du har prøvd den.

## Test uten å vise en hemmelighet

Før du prøver i Claude, kan du sende et syntetisk verktøykall direkte til scriptet i din egen terminal:

```bash
printf '%s' '{"tool_name":"Read","tool_input":{"file_path":".env.kurstest"}}' | node .claude/hooks/beskytt-env.cjs
```

Du skal få JSON med `permissionDecision` satt til `deny`. Bytter du filnavnet til `.env.example`, skal scriptet være stille: det lar vanlig tillatelseskontroll avgjøre om kallet kan kjøre. Det gir ikke automatisk tillatelse.

Deretter gjør du testen i kursoppgaven: bruk en `.env.kurstest` med en ufarlig verdi, og prøv `Read`, `Edit`, `Write` og `Bash`. Kontroller selv at innholdet er uendret. Vanlige filer og `.env.example` skal fortsatt virke med filverktøyene.

## Hva beskytter dette mot?

Hooken avviser filverktøyene når målfilen heter `.env` eller begynner med `.env.`, bortsett fra `.env.example`. Terminalkontrollen avviser alle kommandoer som inneholder teksten `.env`, også kommandoer mot `.env.example`. Dette er en bevisst enkel og streng kontroll for øvelsen.

Den stopper ikke alle mulige veier til innholdet: et generelt søk med `Grep`, en symbolsk lenke med et annet navn, et MCP-verktøy eller `node les-konfig.cjs` som åpner `.env` inne i scriptet kan gå utenom. Ikke prøv dette med ekte hemmeligheter. En hook som bare kjenner igjen tekst i en kommando, kan ikke avgjøre hva alle programmer kommer til å gjøre.

For reelle hemmeligheter trenger du flere lag:

- Begrens fil- og søkeverktøy med `permissions.deny` i Claude Code.
- Bruk sandboxens `filesystem.denyRead` og `filesystem.denyWrite` for terminalprosesser, og unngå unntak som lar prosesser kjøre utenfor sandboxen. Kontroller at sandboxen er støttet og aktiv på maskinen din.
- Behold appens virkelige nøkler utenfor agentens tilgjengelige miljø. Start appen selv når den trenger nøkler som agenten ikke skal ha.

Har en nøkkel allerede blitt vist i en samtale, logg eller Git-historikk, må den byttes. Å legge på en hook eller kjøre `/clear` trekker ikke nøkkelen tilbake.

## Dokumentasjon

Anthropics dokumentasjon, lest 2026-10-10:

- [Hooks-veiledning](https://code.claude.com/docs/en/hooks-guide): oppsett og eksempler på blokkering.
- [Hooks-referanse](https://code.claude.com/docs/en/hooks): `PreToolUse`, JSON på standard inn og `permissionDecision`.
- [Tillatelser](https://code.claude.com/docs/en/permissions): regler for hvilke verktøy Claude får bruke.
- [Sandbox](https://code.claude.com/docs/en/sandboxing): begrensninger for terminalprosesser og beskyttelse av filsystemet.

Dette er en vanlig hook i prosjektinnstillingene. Kurs-pluginens egen hooks-modul er en mod som også tegner et panel; de to kan brukes sammen.
