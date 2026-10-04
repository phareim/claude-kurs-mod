# Tips som gjør Claude Code bedre

## Gi Claude noe å sjekke mot

Det enkeltgrepet som forbedrer resultatet mest, er å si hvordan Claude kan se at jobben er gjort: en test som skal passere, en kommando som skal gi et bestemt svar, et skjermbilde som skal ligne en skisse. Uten det er du den eneste som kan si om det ble riktig.

```
Write a function that validates Norwegian organisation numbers. Add tests for 974760673 (valid) and 123456789 (invalid), run them, and fix any failures.
```

## Utforsk, planlegg, bygg

For alt som er større enn en liten endring: la Claude først lese koden, så lage en plan (plan mode, Shift+Tab), og først deretter skrive kode. En plan du har lest og rettet, er billigere enn en implementasjon du må forkaste.

## Hold konteksten ren

- `/clear` når du bytter oppgave. Gammel kontekst gjør svarene dårligere.
- `/compact` når samtalen er lang, men du vil fortsette på det samme.
- `/rewind` (eller Esc Esc) når Claude har gått i feil retning. Det er bedre å gå tilbake enn å rette oppå.
- Bruk subagenter til utforskning som krever mye lesing. Da kommer bare konklusjonen tilbake.

## Vær konkret

Pek på filer (`@src/auth/login.ts`), nevn mønstre som finnes fra før («slik som i `HeaderWidget`»), og si hva som ikke skal røres. Lim inn feilmeldinger og skjermbilder i stedet for å beskrive dem.

## Moduser

Shift+Tab bytter mellom normal modus (Claude spør før den endrer filer), auto-accept (endringer godtas uten spørsmål) og plan mode (Claude leser og planlegger, men endrer ingenting).

## Nyttige kommandoer

| Kommando | Hva den gjør |
|---|---|
| `/help` | Alle kommandoer |
| `/context` | Hva som fyller kontekstvinduet nå |
| `/model` | Bytt modell |
| `/mcp` | MCP-servere og status |
| `/agents` | Subagenter |
| `/plugin` | Plugins og marketplaces |
| `!kommando` | Kjør en shell-kommando uten å gå via Claude |
| `@fil` | Legg en fil ved prompten |
