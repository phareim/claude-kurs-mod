---
del: 5
tittel: Agent Skills
tid: 30–40 minutter
---

## Hva du nettopp har lært

Agent Skills er mapper med instruksjoner som Claude kan laste ved behov. De kan startes som slash-kommandoer (f.eks. `/commit`, `/review`) og fungerer som gjenbrukbare arbeidsflyter. Som standard kjører en skill i hoveddialogen og har tilgang til hele konteksten.

Skills lagres som `SKILL.md`-filer, enten personlig (`~/.claude/skills/`) eller i prosjektet (`.claude/skills/`).

> Beslektet konsept: hooks (settes opp i `settings.json`) gir lignende automatisering, men utløses av verktøyet selv på hendelser som verktøybruk, ikke av modellen.

## Når er skills nyttige?

- **Gjentakende oppgaver.** Committer du ofte kode, kjører en deploy eller skriver release notes, kan en skill gjøre det med én kommando: `/commit`, `/deploy`, `/release-notes`.
- **Kodestandarder og konvensjoner.** En skill kan inneholde prosjektets kodestandarder, og Claude følger dem uten at du ber om det.
- **Onboarding.** Skills som forklarer arkitekturen, vanlige oppgaver og konvensjoner hjelper nye utviklere raskere i gang.

Merker du at du ofte ber Claude om det samme, er det et tegn på at det bør bli en skill.

## Finn og installer skills
<!-- oppgave: finn -->
<!-- hint: Åpne skills.sh i nettleseren, velg en skill og kjør installasjonskommandoen i en egen terminal. Oppgaven krysses av når Claude kjører «npx skills add», ellers merker du den som gjort selv. -->

Vercel har en liste over de mest populære agent skills på [skills.sh](https://skills.sh).

> Skills kan gjøre mye og kan utsette deg for prompt injection. Sjekk hvem som har laget en skill før du tar den i bruk.

1. Finn noen populære skills som du tror er nyttige i arbeidshverdagen din eller i prosjektet du bygger nå.
2. Installer dem, og sjekk at de dukker opp når du skriver `/` i Claude.

Den mest populære skillen heter `find-skills`. Med den kan Claude selv finne en passende skill ut fra et behov:

```prompt
Use /find-skills to help me find a skill to build diagrams
```

## Bruk en skill
<!-- oppgave: bruk -->
<!-- hint: Skriv / og velg en skill, eller be Claude bruke den ved navn. Oppgaven krysses av når en skill lastes (kursets egne skills teller ikke). -->

Bruk en skill du har installert i prosjektet ditt, for eksempel:

```prompt
Use the /frontend-design skill to suggest visual improvements to my application
```

## Lag din første skill
<!-- oppgave: egen -->
<!-- hint: Lag .claude/skills/commit/SKILL.md med innholdet under, eller be Claude lage den. Oppgaven krysses av når det ligger en SKILL.md i en mappe under .claude/skills/ i prosjektet. -->

Du kan be Claude lage en skill ut fra en beskrivelse. Her er oppsettet for hånd, for i korte trekk er en skill en mappe med en markdown-fil.

Opprett mappen `.claude/skills/<navn>/` i prosjektet ditt med en `SKILL.md` inni:

```bash
mkdir -p .claude/skills/commit
```

En skill må ha et navn (`name`). Det brukes når du vil kjøre skillen selv, her med `/commit`. Det andre påkrevde feltet er `description`, der du forklarer Claude hva skillen gjør og når den skal brukes. Beskrivelsen er det Claude bruker for å avgjøre om den skal kjøre skillen på eget initiativ.

Den øverste delen står mellom to linjer med tre streker (frontmatter). Alt under er vanlig markdown. Som med `CLAUDE.md` bør instruksjonene være korte og konsise.

Innholdet i `.claude/skills/commit/SKILL.md`:

```markdown
---
name: commit
description: Create a well-structured git commit message.
disable-model-invocation: true
---

Create a git commit for the current changes:

1. Run git status and git diff to understand what changed
2. Choose a commit type: feat / fix / docs / refactor / test / chore
3. Write a concise commit message (max 72 chars first line)
4. Stage relevant files and commit
```

Feltet `disable-model-invocation: true` hindrer Claude i å kjøre skillen på eget initiativ. Da kan bare du starte den, med `/commit`.

```prompt
Create a project skill in .claude/skills/commit/SKILL.md that writes a well-structured git commit for the current changes. Only I should be able to invoke it.
```

## Kjør skillen din
<!-- oppgave: kjor -->
<!-- hint: Skriv / etterfulgt av navnet på skillen du laget. Oppgaven krysses av når en skill fra .claude/skills/ i prosjektet lastes. Dukker den ikke opp, start Claude på nytt. -->

Etter at du har lagret filen, kan du bruke skillen direkte:

```prompt
/commit
```

Flere ideer til skills du kan lage:

- **Review** – går gjennom koden og gir tilbakemelding på kvalitet, sikkerhet og lesbarhet
- **Refactor** – analyserer en fil eller modul og foreslår forbedringer
- **Dokumentasjon** – lager eller oppdaterer README ut fra koden
- **Test** – skriver tester for en fil eller funksjon, kjører dem og fikser feil
- **Oversettelse** – oversetter brukersynlig tekst i appen til andre språk

## Avansert: context: fork
<!-- oppgave: fork bonus -->
<!-- hint: Legg «context: fork» i frontmatter på en skill i prosjektet. Oppgaven krysses av når en SKILL.md under .claude/skills/ inneholder den linjen. -->

Vil du at en skill skal kjøre i en isolert subagent, uten å fylle hoveddialogen, bruker du `context: fork` i `SKILL.md`:

```markdown
---
name: codebase-analysis
description: Deep analysis of the codebase architecture
context: fork
agent: Explore
---

Analyze the codebase thoroughly and report:
1. Overall architecture
2. Key patterns and conventions
3. Potential improvements

$ARGUMENTS
```

Her er agenten satt til `Explore`, som ikke kan endre kode.

`$ARGUMENTS` er teksten du skriver etter skill-navnet. Skriver du «Use the /codebase-analysis skill, but only on the auth module», blir «but only on the auth module» tilgjengelig som `$ARGUMENTS` inne i skillen.

## Avansert: dynamisk kontekst
<!-- oppgave: dynamisk bonus -->
<!-- hint: Legg en linje med utropstegn og en kommando i backticks i en SKILL.md, slik som i eksempelet. Oppgaven krysses av når en skill i prosjektet inneholder en slik linje. -->

Skills kan kjøre shell-kommandoer og sette resultatet inn i prompten. Det gir Claude fersk kontekst:

```markdown
---
name: pr-review
description: Review the current pull request
context: fork
agent: general-purpose
---

## Current changes
- Diff: !`git diff main...HEAD`
- Changed files: !`git diff --name-only main...HEAD`

Review these changes and provide feedback on code quality, potential bugs, and improvements.
```

## Bonus: skill og subagent sammen
<!-- oppgave: sammen bonus -->
<!-- hint: Lag .claude/agents/reviewer.md med et «skills:»-felt i frontmatter. Oppgaven krysses av når en subagent i prosjektet har det feltet. -->

Lag en skill og en subagent som jobber sammen. For eksempel en subagent som har review-skillen over lastet på forhånd, slik at den følger prosjektets kvalitetskrav hver gang.

I subagent-definisjonen (`.claude/agents/reviewer.md`):

```yaml
---
name: reviewer
description: Reviews code changes for quality and security. Use after making changes.
tools: Read, Grep, Glob, Bash
model: sonnet
skills:
  - pr-review
---

You are a senior code reviewer. Follow the review guidelines loaded from the `pr-review` skill.
Report findings grouped by severity: critical, warning, suggestion.
```

Nå kan du be Claude kjøre subagenten med naturlig språk:

```prompt
Run the reviewer agent.
```

## Veien videre

Skills kan vokse til kraftige arbeidsflyter: et Python-skript i skill-mappen som skal kjøres, MCP-servere og mer. Alt lever i en mappe som er lett å dele.

Dette kurset er pakket på samme måte. Det er en plugin med en skill (`/kurs:veileder`), en subagent (`kurs:kursgransker`) og en hooks-modul som tegner panelet og krysser av oppgavene. Vil du se hvordan det er bygget, spør Claude:

```prompt
Les gjennom kurs-pluginen (mappen står i /kurs om) og forklar hvordan den er bygget: skill, subagent og hooks-modul.
```
