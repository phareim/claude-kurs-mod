# Vurdering: kurset og pakkingen som mod

Skrevet 2026-10-04, etter første bygg. Gjelder kursinnholdet slik det ble levert (fem deler) og pluginen i `kurs/`.

Oppdatert 2026-10-10: Del 1 har nå en sammenhengende øvelse med app, innlogging, lokal hemmelighet og en `PreToolUse`-hook mot direkte tilgang til `.env`. Sikkerhetsressursen forklarer begrensningene og peker videre til tillatelser og sandbox. Kurset har nå 31 oppgaver, hvorav 25 krysses av automatisk. Vurderingen under beskriver fortsatt førsteutgaven fra 2026-10-04.

## Kursinnholdet

### Styrker

- **Rekkefølgen bygger på seg selv.** Verktøyet, så hukommelsen, så integrasjoner, så delegering, så gjenbruk. Hver del bruker det forrige.
- **Deltakeren bygger sitt eget prosjekt hele veien.** Det gir egen motivasjon og ekte kontekst for delene om CLAUDE.md, subagenter og skills.
- **Konkrete eksempelprompter** til nesten hver oppgave, og en bonusoppgave per del for dem som er raske.
- **Riktige hovedpoeng:** gi Claude noe å verifisere mot, hold konteksten ren, `description` styrer når subagenter og skills brukes.

### Svakheter

- **Tiden går ikke opp.** Hands-on summerer til 2–2¾ time. Et femtimerskurs trenger gjennomgangene mellom delene, og de finnes ikke i materialet.
- **Ingen læringsmål eller «ferdig»-kriterier.** «Forslag til ting å prøve» sier ikke hva deltakeren skal kunne etterpå. Pluginen har innført avkryssing, men kriteriene er mine.
- **Promptene forutsetter en kodebase som ikke finnes.** Del 4 ber om å utforske «authentication module, database layer and API routes» og kjøre tester, i et prosjekt som er 40 minutter gammelt. Del 5 sin `/commit` krever et git-repo som kurset aldri oppretter.
- **Del 3 er den skjøreste.** Den avhenger av kontoer hos Linear eller Notion, OAuth i nettleser, Node for `npx` og nettet på kursstedet. Én treg innlogging tar ti minutter fra en del på tretti.
- **Sikkerhet er nesten fraværende.** Tillatelser og moduser nevnes så vidt, MCP-servere og tredjeparts skills fra skills.sh installeres med én setning om risiko.
- **Hooks og plugins får én bisetning hver**, selv om kurset bruker begge deler.
- **Påstander som bør sjekkes før bruk** (jeg har ikke verifisert dem): at Explore bruker Haiku, og listen over innebygde subagenter. Originalens skjermbilde av `/mcp` viste en privat filsti; den er fjernet.

### Forslag

1. **Felles startrepo.** Et lite prosjekt med auth, database, API og noen tester som feiler, som alle kloner i del 1. Da treffer promptene i del 3–5, og `git diff` og `/commit` virker. Eget prosjekt kan være et valg for de raske.
2. **Tre læringsmål per del**, og én oppgave per mål. Bruk dem som avkryssingsliste i panelet.
3. **En MCP-oppgave uten konto.** Context7 dekker dette delvis. Legg Linear/Notion som bonus, eller del ut en ferdig testkonto.
4. **Del 6: tillatelser, hooks og plugins.** 20 minutter: `/permissions`, en hook i `settings.json` som blokkerer redigering av `.env`, og «åpne kurs-pluginen og endre den».
5. **Avslutning i egen kodebase.** Siste halvtime: ta CLAUDE.md, én subagent og én skill med inn i et repo deltakeren jobber i til daglig.
6. **Del «Claude» fra «Claude Code».** Skal kurset også dekke chat-appen (Projects, artifacts, research), må det undervises utenfor pluginen. Den lever bare i Claude Code.

## Pakkingen som mod

### Styrker

- **Kurset er der arbeidet skjer.** Ingen veksling mellom nettleserfane og terminal. Eksempelprompter legges i promptfeltet med ett trykk.
- **Oppgavene krysser seg av** for 25 av 28 oppgaver, ut fra kommandoer, verktøykall og filer i prosjektet.
- **Tåler at panelet mangler.** Alt går an med `/kurs`-kommandoer som tekst, og delene er vanlig markdown som kan leses på GitHub.
- **Innholdet er skilt fra koden.** Kursholder redigerer markdown. En ny `del-6.md` blir en ny del.
- **Formen underviser stoffet.** Pluginen har selv en skill, en subagent og hooks, og siste avsnitt i del 5 ber deltakeren åpne den.
- **Verifisert i ekte økt** (2.1.289, terminal): panel bredt og smalt, promptutfylling, avkryssing ved prompt, Write, `/mcp`, `/clear` og filer i `.claude/skills/`, og at fremdriften overlever omstart og `/clear`.

### Svakheter

- **API-et er «early access».** Hooks-modulen kan slutte å virke ved en oppdatering av Claude Code. Det er den største risikoen for en kursdag.
- **Bare prøvd med `--plugin-dir`.** Installasjon via marketplace, andre kontotyper, bedriftspolicy og Windows er ikke prøvd. Desktop-appen er bare dekket av testsettet, ikke sett.
- **Avkryssingen er skjønn.** Den kan krysse av for tidlig (en `CLAUDE.md` som lå der fra før) og for sent (arbeid gjort i en annen terminal eller editor). Tre oppgaver kan ikke ses i det hele tatt.
- **Ingen oversikt for kursholder.** Fremdriften ligger lokalt hos hver deltaker.
- **Panelet tar plass.** I et vindu under 144 kolonner legger det seg over prompten når det åpnes.
- **Den skjulte merknaden endrer Claudes kontekst litt.** Én linje per oppgavebytte. Den kan slås av, men den er på som standard.
- **Tastaturbruk i panelet krever fokusbytte** (ctrl+x tab eller klikk). Det må sies høyt i starten av kurset.

### Forslag

1. **Generalprøve på en ren maskin** med samme installasjonsvei som deltakerne får, og lås minsteversjon av Claude Code i invitasjonen.
2. **`/kurs sjekk` som del 0:** versjon av Claude Code, git, Node, nettilgang til MCP-serverne. Fanger installasjonsproblemer før del 1.
3. **Frivillig gruppeoversikt.** Deltakeren skriver en kurskode, og pluginen sender bare tall (del, antall gjort) til en liten tjeneste kursholder ser på. Av som standard.
4. **Refleksjon per del.** Ett spørsmål deltakeren svarer på med egne ord, vurdert av modellen (`$.model.complete`). Det måler forståelse, der avkryssingen måler aktivitet.
5. **Tempo.** Vis anslått tid igjen i delen, og la kursholder sette «vi er nå på del 3».
6. **Presisere avkryssingen** der den er svakest: grunnlinje av filer ved kursstart, så bare nye filer teller.
