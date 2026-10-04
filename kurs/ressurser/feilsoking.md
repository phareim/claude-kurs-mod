# Når kurset ikke oppfører seg

## Panelet vises ikke

- Skriv `/kurs`. Panelet åpnes først når du ber om det.
- Står panelet av? `/kurs panel` slår det på igjen.
- I et smalt terminalvindu ligger panelet over prompten i stedet for ved siden av. Gjør vinduet bredere, eller bruk kurset som tekst med `/kurs panel` (av) og `/kurs neste`.

## Knappene i panelet reagerer ikke på tastaturet

Tastene går til prompten til du flytter fokus. Klikk i panelet, eller trykk ctrl+x og deretter tab. Esc gir tastene tilbake til prompten. Alt panelet kan, går også an med `/kurs`-kommandoer.

## En oppgave blir ikke krysset av

Kurset ser bare det som skjer inne i Claude Code-sesjonen. Gjorde du oppgaven i en annen terminal eller i en editor, merk den selv: åpne oppgaven og skriv `/kurs ferdig`. `/kurs hint` sier hva kurset ser etter.

## /kurs finnes ikke

Da er ikke hooks-modulen lastet. Kursteksten og veilederen virker likevel: skriv `/kurs:veileder`, eller les delene som markdown i `deler/` i pluginens mappe. Se README i repoet for installasjon.
