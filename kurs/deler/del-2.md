---
del: 2
tittel: CLAUDE.md – prosjektets hukommelse
tid: 20 minutter
---

## Hva du nettopp har lært

`CLAUDE.md` er prosjektets hukommelse. Den lastes inn ved starten av hver sesjon og gir Claude kontekst om prosjektet ditt, slik at den ikke trenger å gjette seg fram. Med en god `CLAUDE.md` får du bedre og mer konsistente resultater fra første forsøk.

## Generer CLAUDE.md automatisk
<!-- oppgave: init -->
<!-- hint: Skriv /init i prompten. Oppgaven krysses av når du kjører /init, eller når det ligger en CLAUDE.md i prosjektmappen. -->

Start med å la Claude analysere prosjektet ditt og generere en `CLAUDE.md`:

```prompt
/init
```

Claude analyserer katalogstrukturen, filene og koden din, og lager en `CLAUDE.md` tilpasset prosjektet. Åpne filen etterpå og se hva den inneholder.

## Tilpass CLAUDE.md
<!-- oppgave: tilpass -->
<!-- hint: Be Claude endre CLAUDE.md, eller rediger den selv. Oppgaven krysses av når Claude endrer filen. Redigerer du den i en editor, merker du oppgaven som gjort selv. -->

Den genererte filen er et godt utgangspunkt, men du kjenner prosjektet best. Legg til det Claude ikke kan gjette fra koden alene. Be gjerne Claude om hjelp:

```prompt
Les CLAUDE.md og foreslå forbedringer. Du skal vite at vi bruker norsk i all brukersynlig tekst, og at vi foretrekker funksjonskomponenter med hooks fremfor klassekomponenter.
```

Ting som er nyttige å ha med:

- Kommandoer for bygging, testing og linting
- Arkitekturbeslutninger (f.eks. «REST, ikke GraphQL»)
- Kodestil som avviker fra standard
- Ting som typisk går galt i prosjektet

## Test effekten
<!-- oppgave: test -->
<!-- hint: Legg en lett synlig regel i CLAUDE.md, kjør /clear, og gi Claude en oppgave. Følger den regelen? Merk oppgaven som gjort selv når du har sett effekten. -->

Gi Claude en oppgave og se om resultatet følger reglene du la inn i `CLAUDE.md`. La du inn at brukersynlig tekst skal være på norsk, be Claude lage en ny komponent og se om den følger regelen.

```prompt
Legg til en innstillingsside i appen med skjemafelt for brukerens preferanser.
```

Vil du være sikker på at endringene faktisk gjør noe? Legg til en regel som denne:

> Start hver melding med «Hei, unge padawan.»

Kjør `/clear` for at endringene skal ta effekt.

## Modulære regler
<!-- oppgave: regler bonus -->
<!-- hint: Lag en fil i .claude/rules/, for eksempel .claude/rules/frontend.md, og si i den når regelen gjelder. Oppgaven krysses av når det ligger en regelfil der. -->

I større prosjekter kan du dele opp `CLAUDE.md` i filer du legger i `.claude/rules/`. I et monorepo med både frontend og backend og ulike testrammeverk kan du lage én regelfil for hver, og fortelle Claude når den skal se på hvilken.

```prompt
Del opp instruksjonene om brukergrensesnitt og testing i CLAUDE.md i separate regelfiler under .claude/rules/. Oppgi i hver fil hvilke filstier reglene gjelder for.
```

Med en god `CLAUDE.md` kjenner Claude prosjektets regler uten at du trenger å forklare dem på nytt.
