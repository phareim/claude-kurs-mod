# Agent View

Agent View er en oversikt der du starter og følger flere Claude-sesjoner som går i bakgrunnen samtidig. Den passer for deg som synes oppgavene i kurset går for fort unna.

## Start

```bash
claude agents
```

Fra oversikten sender du ut nye sesjoner, ser hvilke som jobber og hvilke som venter på deg, og går inn i en sesjon for å svare eller se hva den har gjort. `claude agents --help` viser valgene, blant annet `--model` (standardmodell for sesjonene du sender ut) og `--cwd` (vis bare sesjoner startet under en bestemt mappe).

## Flere agenter i samme repo: git worktrees

To agenter som skriver i samme mappe, tråkker på hverandre. Gi hver agent sin egen arbeidskopi med git worktree:

```bash
git worktree add ../my-project-auth -b auth
git worktree add ../my-project-ui -b ui
```

Start så én sesjon i hver mappe. Når en agent er ferdig, ser du over endringene og merger branchen som vanlig.

## Forslag til kurset

- Del 1: la én agent sette opp prosjektet mens en annen skriver tester for det som finnes.
- Del 4: sammenlign en parallell research gjort med subagenter i én sesjon med den samme jobben fordelt på to sesjoner i Agent View. Hva ble raskest, og hvor havnet konteksten?
