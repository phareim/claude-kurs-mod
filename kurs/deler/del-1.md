---
del: 1
tittel: Kom i gang med Claude Code
tid: 40–60 minutter
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

## La Claude implementere
<!-- oppgave: implementer -->
<!-- hint: Gi Claude en oppgave som endrer filer i normal modus. Oppgaven krysses av når Claude skriver eller endrer en fil. -->

Få en første versjon av appen til å fungere før du legger til innlogging. Be Claude lage hovedsiden og prøv den i nettleseren.

```prompt
Lag hovedsiden med et toppfelt, en listevisning og et skjema for å legge til nye elementer. Gi den et ryddig og moderne utseende.
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
Jeg vil legge til innlogging og utlogging i appen min, og beskytte én side eller ett API-endepunkt. Analyser kodebasen og lag en plan med en etablert autentiseringsløsning som passer teknologien. Forklar hvilke hemmeligheter løsningen trenger, og hvordan vi kan teste at tilgangen faktisk er beskyttet.
```

## Legg til innlogging
<!-- oppgave: innlogging -->
<!-- hint: Bytt tilbake til normal modus og be Claude følge planen. Prøv både innlogging, utlogging og tilgang uten å være innlogget. Merk oppgaven med /kurs ferdig når det virker. -->

La Claude følge planen. Beskyttelsen må ligge på serveren; å skjule en knapp i nettleseren hindrer ikke noen i å kalle API-et direkte. Har du startet med bare en frontend, må planen også dekke en backend eller en autentiseringstjeneste.

```prompt
Implementer innlogging og utlogging etter planen, og beskytt siden eller API-endepunktet på serveren. Bruk plassholdere i .env.example for nødvendige miljøvariabler. Ikke opprett eller les .env, og ikke be meg lime inn hemmeligheter i samtalen. Gi meg en måte å teste både innlogget og uinnlogget tilgang på.
```

Du er ferdig når du kan logge inn og ut, og siden eller endepunktet avviser tilgang uten innlogging. Hvis løsningen trenger en hemmelighet før den kan startes, gjør neste oppgave først og kom tilbake hit.

## Lagre en hemmelighet lokalt
<!-- oppgave: hemmelighet -->
<!-- hint: Be Claude klargjøre .env.example og .gitignore. Opprett .env og fyll inn nøkkelen selv i editoren. Bruk bare en ny nøkkel for kursprosjektet. Merk oppgaven med /kurs ferdig etter at du har prøvd appen. -->

Innlogging kan trenge en nøkkel til å signere økter, for eksempel `SECRET_KEY` i Flask eller et annet navn i løsningen du valgte. Hemmeligheten skal brukes på serveren og skal ikke sendes til nettleseren. Variabler med navn som `NEXT_PUBLIC_…` eller `VITE_…` er beregnet for nettleseren og passer ikke til hemmeligheter.

```prompt
Klargjør appen til å lese hemmelighetene den trenger fra miljøvariabler på serveren. Lag .env.example med tomme plassholdere og korte forklaringer. Sørg for at .env og .env.* er ignorert av Git, mens .env.example kan deles. Ikke les eller skriv .env. Forklar hvordan jeg selv genererer en ny nøkkel og fyller den inn lokalt, uten å vise nøkkelen i samtalen eller i logger.
```

1. Generer en ny nøkkel i en egen terminal eller hent en testnøkkel fra tjenesten du bruker. Bruk aldri en produksjonsnøkkel i kurset.
2. Opprett `.env` selv i editoren og legg inn nøkkelen. Ikke be Claude gjøre dette eller kopier verdien inn i samtalen.
3. Start appen fra din egen terminal og prøv innloggingen. Dersom en kommende terminalbeskyttelse hindrer Claude i å starte appen, kan du fortsatt starte den selv.
4. Sjekk med `git check-ignore .env` at filen er ignorert, og med `git ls-files .env` at den ikke allerede er sporet. Den siste kommandoen skal ikke gi noe filnavn.

`.gitignore` hindrer at en usporet fil legges til i Git ved vanlig bruk. Den hindrer ikke Claude i å lese filen. En regel i `CLAUDE.md` er også bare en instruksjon. Nå skal du legge på en teknisk sperre.

## Beskytt .env med en hook
<!-- oppgave: hook -->
<!-- hint: Kjør /kurs ressurser sikkerhet for et ferdig eksempel. Legg hooken i prosjektets .claude/settings.json uten å overskrive andre innstillinger. Start Claude på nytt, sjekk /hooks og prøv blokkeringen med en ufarlig testfil. Merk oppgaven med /kurs ferdig når lesing og skriving stoppes og vanlige filer fortsatt virker. -->

En hook er kode som Claude Code kjører når en bestemt hendelse skjer. `PreToolUse` kjøres før et verktøy får gjøre jobben og kan avvise kallet. Her skal du stoppe direkte lesing og endring av `.env` og `.env.*`, og også direkte terminalkommandoer som `cat .env`. `.env.example` skal fortsatt kunne leses og redigeres med filverktøyene.

```prompt
Les eksempelet i sikkerhetsressursen til kurs-pluginen (mappen står i /kurs om). Lag en PreToolUse-hook i prosjektet som blokkerer Read, Edit og Write mot .env og .env.*, med unntak av .env.example, og Bash-kommandoer som nevner .env. Bevar eksisterende innstillinger og hooks. Gi en kort norsk begrunnelse når noe blokkeres. Test scriptet med syntetiske verktøykall, uten å lese den ekte .env-filen. Forklar hva hooken dekker og hvilke omveier den ikke kan stoppe.
```

Kjør `/hooks` og kontroller at hooken er aktiv etter at du har startet Claude på nytt. Opprett selv en `.env.kurstest` med `KURS_TEST=ufarlig`, og prøv:

```prompt
Test beskyttelsen uten å omgå den: prøv å lese .env.kurstest med Read, endre den med Edit og overskrive den med Write. Prøv også cat .env.kurstest via Bash. Rapporter hvilke kall som blir blokkert. Les deretter .env.example med Read som kontroll. Ikke endre eller les den ekte .env-filen, og ikke fjern hooken.
```

Du er ferdig når alle fire forsøk mot testfilen avvises, filen fortsatt er uendret når du sjekker den selv, og `.env.example` fortsatt kan leses. Slett testfilen selv etterpå.

**Grensen for øvelsen:** Hooken stopper disse direkte verktøykallene. Den er ikke en full sikkerhetsgrense: søk i hele prosjektet, andre verktøy eller et script som åpner filen uten å nevne `.env` i kommandoen kan gå utenom. For sterkere beskyttelse må også søkeverktøy og terminalprosesser begrenses med tillatelser og sandbox. Se `/kurs ressurser sikkerhet`. Bruk fortsatt bare ufarlige kursnøkler.

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
