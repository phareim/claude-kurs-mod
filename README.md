# claude-kurs-mod

Et praktisk Claude Code-kurs i fem deler, pakket som en plugin til Claude Code. Deltakeren installerer pluginen, skriver `/kurs`, og får kurset i et panel ved siden av samtalen:

- hver del med lesestoff og oppgaver, i rekkefølge
- eksempelprompter som legges i promptfeltet med ett trykk
- oppgaver som krysses av når kurset ser at de er gjort (25 av 28 oppgaver; tre merkes for hånd)
- fremdrift som huskes mellom økter og overlever `/clear`

| Del | Tema | Hands-on |
|---|---|---|
| 1 | Kom i gang med Claude Code | 20–30 min |
| 2 | CLAUDE.md – prosjektets hukommelse | 20 min |
| 3 | MCP – koble Claude til verktøyene dine | 25–35 min |
| 4 | Subagenter | 30–40 min |
| 5 | Agent Skills | 30–40 min |

Vurderingen av kurset og pakkingen står i [docs/vurdering.md](docs/vurdering.md).

## For deltakere

Du trenger Claude Code 2.1.289 eller nyere (`claude --version`).

```bash
git clone git@github.com:phareim/claude-kurs-mod.git
mkdir my-project && cd my-project
claude --plugin-dir ../claude-kurs-mod/kurs
```

Skriv `/kurs` i Claude. Da åpnes panelet. Klikk i panelet, eller trykk ctrl+x og så tab, for å bruke tastene der. Esc gir tastene tilbake til prompten.

| Kommando | Hva den gjør |
|---|---|
| `/kurs` | Åpner kurset der du er |
| `/kurs 1` … `/kurs 5` | Går til en del |
| `/kurs neste` | Neste oppgave som ikke er gjort |
| `/kurs hint` | Hint til oppgaven du står på |
| `/kurs prompt [n]` | Legger eksempelprompt n i promptfeltet |
| `/kurs ferdig`, `/kurs angre` | Merker oppgaven som gjort, eller angrer |
| `/kurs status` | Fremdriften i alle delene |
| `/kurs tekst` | Hele teksten til delen du er på |
| `/kurs ressurser [navn]` | Tips, Agent View, feilsøking |
| `/kurs panel` | Slår panelet av eller på. Av: kurset vises som tekst i samtalen |
| `/kurs veiledning` | Slår av eller på at Claude får vite hvor du er i kurset |
| `/kurs om` | Hva pluginen gjør og hvor den ligger |
| `/kurs nullstill ja` | Starter kurset på nytt |

Står du fast, spør Claude. Pluginen har en skill, `/kurs:veileder`, som leser kursteksten og hjelper deg videre, og en subagent, `kurs:kursgransker`, som gir tilbakemelding på `CLAUDE.md`, subagentene og skillene du lager.

Laster ikke panelet, virker resten likevel: delene er vanlig markdown i [`kurs/deler/`](kurs/deler/), og `/kurs:veileder` trenger ikke panelet.

## For kursholder

- **Prøv på en fremmed maskin først.** Hooks-modulen bygger på et API som er merket «early access» og kan endre seg mellom versjoner. Verifisert 2026-10-04 på Claude Code 2.1.289 i terminal, lastet med `--plugin-dir`.
- **Installasjon via marketplace** er satt opp (`.claude-plugin/marketplace.json`), men ikke prøvd ende til ende: `claude plugin marketplace add phareim/claude-kurs-mod`, så `claude plugin install kurs@claude-kurs`. Repoet er privat, så deltakerne må ha tilgang, eller repoet må gjøres offentlig.
- **Det kurset ser.** Kommandoer deltakeren kjører (`/init`, `/mcp`, `/clear` …), verktøy Claude bruker (Write, Bash, Agent, MCP-verktøy), skills som lastes, og filer i prosjektet (`CLAUDE.md`, `.claude/rules/`, `.claude/agents/`, `.claude/skills/`). Alt lagres lokalt hos deltakeren. Du har ingen samlet oversikt over gruppa.
- **Skjult merknad.** Når deltakeren bytter oppgave, får Claude én linje om hvilken del og oppgave det gjelder. Det gjør at «jeg står fast» gir et relevant svar. `/kurs veiledning` slår det av.
- **Tidsbruk.** Hands-on-delene summerer til 2–2¾ time. Resten av en femtimers dag er gjennomgang før hver del og pauser.

## Endre kursinnholdet

Kursteksten er markdown i `kurs/deler/del-N.md`, og panelet leser filene når økten starter. En ny fil `del-6.md` blir en ny del uten kodeendring.

````markdown
---
del: 2
tittel: CLAUDE.md – prosjektets hukommelse
tid: 20 minutter
---

## Generer CLAUDE.md automatisk
<!-- oppgave: init -->
<!-- hint: Skriv /init i prompten. -->

Brødtekst i vanlig markdown.

```prompt
/init
```
````

- `## ` starter et avsnitt. Uten `oppgave`-linjen er avsnittet lesestoff.
- `<!-- oppgave: id -->` gjør avsnittet til en oppgave med id `<del>.<id>`. `<!-- oppgave: id bonus -->` gjør den valgfri.
- `<!-- hint: … -->` vises i panelet og med `/kurs hint`.
- En kodeblokk merket `prompt` får en «Lim inn»-knapp.

Reglene for automatisk avkryssing står i `kurs/hooks/sjekk.ts`, med oppgave-id som nøkkel. En oppgave uten regel merkes for hånd.

## Oppbygging

```
.claude-plugin/marketplace.json   repoet som marketplace
kurs/                             pluginen
  .claude-plugin/plugin.json
  deler/del-1.md … del-5.md       kursteksten
  ressurser/                      tips, Agent View, feilsøking
  hooks/register.tsx              panelet, /kurs, koblingen til Claude Code
  hooks/les.ts                    leser markdown til avsnitt og oppgaver
  hooks/sjekk.ts                  hva som krysser av hvilken oppgave
  hooks/kurs.test.tsx             tester
  types/index.d.ts                tilstanden panelet tegner fra
  skills/veileder/SKILL.md        /kurs:veileder
  agents/kursgransker.md          kurs:kursgransker
scripts/sjekk-innhold.mjs         sjekker at tekst og regler stemmer overens
docs/vurdering.md                 styrker, svakheter, forbedringer
```

## Utvikling

Anthropics dokumentasjon for mod-systemet kurset bygger på (lenker sjekket 2026-10-10):

- [Claude Code Mods – oversikt](https://code.claude.com/docs/en/plugins/mods/overview): hvordan mods fungerer og hvor de kan kjøre.
- [Lag en mod](https://code.claude.com/docs/en/plugins/mods/create): hooks-modul, lasting, validering og omlasting under utvikling.
- [Mods- og API-referanse](https://code.claude.com/docs/en/plugins/mods/reference): hendelser, API-metoder, UI-elementer og begrensninger.
- [Fullstendige TypeScript-deklarasjoner](https://github.com/anthropics/claude-code/blob/main/mods/types/claude-code.d.ts): typer og eksempler for hendelser, metoder og elementer.

```bash
claude plugin validate kurs       # manifest og hooks slik motoren leser dem
claude plugin test kurs           # testene
node scripts/sjekk-innhold.mjs    # oppgave-id-er i teksten mot reglene
tsc -p kurs                       # typesjekk; krever at pluginen er lastet én gang
```

Typene til API-et legger Claude Code selv i `kurs/.claude-plugin/types/` første gang pluginen lastes med `--plugin-dir`. Mappen er ikke sjekket inn. Deklarasjonene i `kurs/.claude-plugin/types/claude-code/index.d.ts` er fasiten for den installerte versjonen; dokumentasjonen og typene på GitHub kan gjelde en annen versjon.
