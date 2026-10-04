// The course mod: a pane with the five parts, example prompts one press away,
// and tasks that tick themselves from what happens in the session.
//
// The course text is the markdown in ../deler (les.ts reads it), the rules for
// ticking a task are in sjekk.ts, and this file is the glue to the engine.

import { atom, read, update } from 'claude-code'
import type { CommandRunResult, EngineInterface, Register } from 'claude-code'

import type { Sted } from '../types'
import { lesDel, oppgaver, prompter, somMarkdown } from './les'
import type { Avsnitt, Del } from './les'
import { AUTOMATISKE, TOMT_PROSJEKT, sjekk } from './sjekk'
import type { Prosjektfiler, Signal, Tur } from './sjekk'

type Motor = EngineInterface

const PANE = 'kurs'
const TITTEL = 'Kurs'
const START: Sted = { del: 0, avsnitt: -1 }
const ferdig = atom({ plugin: 'kurs', key: 'ferdig' } as const, [])
const sted = atom({ plugin: 'kurs', key: 'sted' } as const, START)

const HJELP = [
  '**Kommandoer i kurset**',
  '',
  '- `/kurs` – åpne kurset der du er',
  '- `/kurs 1` … `/kurs 5` – gå til en del',
  '- `/kurs neste` – neste oppgave som ikke er gjort',
  '- `/kurs hint` – hint til oppgaven du står på',
  '- `/kurs prompt [n]` – legg eksempelprompt n i promptfeltet',
  '- `/kurs ferdig` og `/kurs angre` – merk oppgaven som gjort, eller angre',
  '- `/kurs status` – fremdriften i alle delene',
  '- `/kurs tekst` – hele teksten til delen du er på',
  '- `/kurs ressurser [navn]` – tips og ekstrastoff',
  '- `/kurs panel` – slå panelet av eller på',
  '- `/kurs veiledning` – slå av eller på at Claude får vite hvor du er i kurset',
  '- `/kurs om` – hva pluginen gjør og hvor den ligger',
  '- `/kurs nullstill` – start kurset på nytt',
].join('\n')

let innhold: Promise<Del[]> | null = null
let prosjekt: Prosjektfiler = TOMT_PROSJEKT
let tur: Tur = { agenter: 0, mcp: [] }
let sistNotat = ''
// Nothing is ticked before the participant has opened the course with /kurs.
let erStartet = false

// --- the course text -------------------------------------------------------

async function lastDeler($: Motor): Promise<Del[]> {
  const mappe = `${$.plugin.root}/deler`
  const navn = (await $.fs.list(mappe))
    .map(fil => fil.name)
    .filter(ett => /^del-\d+\.md$/.test(ett))
  const deler = await Promise.all(
    navn.map(async ett => lesDel(await $.fs.read(`${mappe}/${ett}`))),
  )

  return deler.sort((a, b) => a.nr - b.nr)
}

function hentDeler($: Motor): Promise<Del[]> {
  innhold ??= lastDeler($).catch(() => {
    innhold = null

    return []
  })

  return innhold
}

function finnOppgave(deler: readonly Del[], id: string): { del: Del; indeks: number; avsnitt: Avsnitt } | undefined {
  for (const del of deler) {
    const indeks = del.avsnitt.findIndex(ett => ett.oppgave === id)
    const avsnitt = del.avsnitt[indeks]

    if (avsnitt !== undefined) {
      return { del, indeks, avsnitt }
    }
  }

  return undefined
}

function telling(del: Del, gjort: readonly string[]): { faste: number; fasteGjort: number; bonus: number; bonusGjort: number } {
  const alle = oppgaver(del)
  const erGjort = (ett: Avsnitt) => gjort.includes(ett.oppgave ?? '')
  const faste = alle.filter(ett => !ett.erBonus)
  const bonus = alle.filter(ett => ett.erBonus)

  return {
    faste: faste.length,
    fasteGjort: faste.filter(erGjort).length,
    bonus: bonus.length,
    bonusGjort: bonus.filter(erGjort).length,
  }
}

function soyle(gjort: number, av: number): string {
  return '▰'.repeat(gjort) + '▱'.repeat(Math.max(0, av - gjort))
}

function merke(avsnitt: Avsnitt, gjort: readonly string[]): string {
  if (avsnitt.oppgave === null) return '·'
  if (gjort.includes(avsnitt.oppgave)) return avsnitt.erBonus ? '★' : '✓'

  return avsnitt.erBonus ? '☆' : '○'
}

function hvordanKryssesDenAv(avsnitt: Avsnitt): string {
  return AUTOMATISKE.includes(avsnitt.oppgave ?? '')
    ? 'Krysses av automatisk når kurset ser at det er gjort.'
    : 'Kurset kan ikke se denne. Merk den som gjort selv.'
}

// --- progress: $.state for the drawing, $.store between sessions ------------

function erSted(verdi: unknown): verdi is Sted {
  if (typeof verdi !== 'object' || verdi === null) return false

  const { del, avsnitt } = verdi as Record<string, unknown>

  return typeof del === 'number' && typeof avsnitt === 'number'
}

async function lastInn($: Motor): Promise<void> {
  const lagret = await $.store.get('ferdig')
  const liste = Array.isArray(lagret)
    ? lagret.filter((ett): ett is string => typeof ett === 'string')
    : []
  const lagretSted = await $.store.get('sted')

  erStartet = (await $.store.get('startet')) === true
  await update($, ferdig, () => liste)
  await update($, sted, () => (erSted(lagretSted) ? lagretSted : START))
}

async function erPaa($: Motor, valg: 'panel' | 'veiledning'): Promise<boolean> {
  return (await $.store.get(valg)) !== false
}

async function gaaTil($: Motor, del: number, avsnitt: number): Promise<void> {
  const nytt: Sted = { del, avsnitt }

  await update($, sted, () => nytt)
  await $.store.set('sted', nytt)
}

async function merk($: Motor, ider: readonly string[], erStille = false): Promise<void> {
  if (ider.length === 0 || !erStartet) return

  const deler = await hentDeler($)
  const foer = await read($, ferdig)
  const nye = ider.filter(id => !foer.includes(id) && finnOppgave(deler, id) !== undefined)

  if (nye.length === 0) return

  await update($, ferdig, liste => [...new Set([...liste, ...nye])])
  const etter = await read($, ferdig)
  await $.store.set('ferdig', etter)

  if (erStille) return

  for (const id of nye) {
    const funn = finnOppgave(deler, id)

    if (funn === undefined) continue

    const t = telling(funn.del, etter)
    const erSisteFaste = !funn.avsnitt.erBonus && t.fasteGjort === t.faste

    $.ui.toast(
      erSisteFaste
        ? `✓ ${funn.avsnitt.tittel}. Del ${funn.del.nr} er ferdig!`
        : `✓ ${funn.avsnitt.tittel}`,
      { timeoutMs: 6000 },
    )
  }
}

async function angre($: Motor, id: string): Promise<void> {
  await update($, ferdig, liste => liste.filter(ett => ett !== id))
  await $.store.set('ferdig', await read($, ferdig))
}

async function signal($: Motor, hendelse: Signal): Promise<void> {
  await merk($, sjekk(hendelse, tur, prosjekt))
}

// --- what lies in the project: CLAUDE.md, rules, subagents, skills ----------

function navnFra(tekst: string, reserve: string): string {
  return /^name:\s*["']?([^\s"']+)/m.exec(tekst)?.[1] ?? reserve
}

async function lesProsjekt($: Motor): Promise<Prosjektfiler> {
  const liste = (mappe: string) => $.fs.list(mappe).catch(() => [])
  const les = (sti: string) => $.fs.read(sti).catch(() => '')
  const finnes = (sti: string) => $.fs.exists(sti).catch(() => false)

  const regler = (await liste('.claude/rules')).filter(fil => fil.name.endsWith('.md'))
  const agentfiler = (await liste('.claude/agents'))
    .filter(fil => fil.kind === 'file' && fil.name.endsWith('.md'))
    .slice(0, 20)
  const agenttekster = await Promise.all(agentfiler.map(fil => les(`.claude/agents/${fil.name}`)))
  // Only real folders: a skill installed with `npx skills add` is a link.
  const skillmapper = (await liste('.claude/skills')).filter(fil => fil.kind === 'dir').slice(0, 20)
  const skilltekster = await Promise.all(
    skillmapper.map(fil => les(`.claude/skills/${fil.name}/SKILL.md`)),
  )
  const egne = skillmapper
    .map((fil, i) => ({ navn: fil.name, tekst: skilltekster[i] ?? '' }))
    .filter(ett => ett.tekst !== '')

  return {
    harClaudeMd: (await finnes('CLAUDE.md')) || (await finnes('.claude/CLAUDE.md')),
    regler: regler.length,
    agenter: agentfiler.map((fil, i) => navnFra(agenttekster[i] ?? '', fil.name.replace(/\.md$/, ''))),
    agenterMedSkills: agenttekster.filter(tekst => /^skills:/m.test(tekst)).length,
    skills: egne.map(ett => navnFra(ett.tekst, ett.navn)),
    harFork: egne.some(ett => /^context:\s*fork\b/m.test(ett.tekst)),
    harDynamisk: egne.some(ett => /!`[^`\n]+`/.test(ett.tekst)),
  }
}

async function sjekkFiler($: Motor, erStille = false): Promise<void> {
  prosjekt = await lesProsjekt($)
  await merk($, sjekk({ type: 'filer' }, tur, prosjekt), erStille)
}

/** The participant has opened the course: from here on tasks are ticked. */
async function start($: Motor): Promise<void> {
  if (erStartet) return

  erStartet = true
  await $.store.set('startet', true)
  await sjekkFiler($, true)
}

async function merkSelv($: Motor, id: string): Promise<void> {
  await start($)
  await merk($, [id], true)
}

// --- text for the transcript, where no pane is shown -----------------------

function tekstOversikt(deler: readonly Del[], gjort: readonly string[]): string {
  const linjer = deler.map(del => {
    const t = telling(del, gjort)

    return `${del.nr}. **${del.tittel}** – ${t.fasteGjort}/${t.faste} gjort (${del.tid})`
  })

  return ['**Claude Code-kurset**', '', ...linjer, '', 'Skriv `/kurs 1` for å åpne en del, eller `/kurs neste` for neste oppgave.'].join('\n')
}

function tekstDel(del: Del, gjort: readonly string[]): string {
  const linjer = del.avsnitt.map(ett => `- ${merke(ett, gjort)} ${ett.tittel}`)

  return [`**Del ${del.nr} · ${del.tittel}** (${del.tid})`, '', ...linjer, '', '`/kurs neste` åpner neste oppgave. `/kurs tekst` viser hele teksten.'].join('\n')
}

function tekstAvsnitt(del: Del, avsnitt: Avsnitt, gjort: readonly string[]): string {
  const hode = `**Del ${del.nr} · ${avsnitt.tittel}** ${avsnitt.oppgave === null ? '' : merke(avsnitt, gjort)}`.trim()
  const fot = avsnitt.oppgave === null ? [] : ['', `_${hvordanKryssesDenAv(avsnitt)}_`]

  return [hode, '', somMarkdown(avsnitt), ...fot].join('\n')
}

async function tekstHer($: Motor): Promise<string> {
  const deler = await hentDeler($)
  const gjort = await read($, ferdig)
  const her = await read($, sted)
  const del = deler.find(ett => ett.nr === her.del)
  const avsnitt = del?.avsnitt[her.avsnitt]

  if (deler.length === 0) return `Fant ikke kursinnholdet i ${$.plugin.root}/deler.`
  if (del === undefined) return tekstOversikt(deler, gjort)
  if (avsnitt === undefined) return tekstDel(del, gjort)

  return tekstAvsnitt(del, avsnitt, gjort)
}

/** The task a bare `/kurs hint`, `ferdig` or `prompt` means. */
async function aktiv($: Motor): Promise<{ del: Del; indeks: number; avsnitt: Avsnitt } | undefined> {
  const deler = await hentDeler($)
  const gjort = await read($, ferdig)
  const her = await read($, sted)
  const del = deler.find(ett => ett.nr === her.del) ?? deler[0]
  const valgt = del?.avsnitt[her.avsnitt]

  if (del === undefined) return undefined
  if (valgt !== undefined) return { del, indeks: her.avsnitt, avsnitt: valgt }

  const indeks = del.avsnitt.findIndex(ett => ett.oppgave !== null && !gjort.includes(ett.oppgave))
  const neste = del.avsnitt[indeks]

  return neste === undefined ? undefined : { del, indeks, avsnitt: neste }
}

async function finnNeste($: Motor): Promise<{ del: Del; indeks: number } | undefined> {
  const deler = await hentDeler($)
  const gjort = await read($, ferdig)
  const her = await read($, sted)
  const fraHer = [...deler.filter(del => del.nr >= her.del), ...deler.filter(del => del.nr < her.del)]

  for (const medBonus of [false, true]) {
    for (const del of fraHer) {
      const indeks = del.avsnitt.findIndex(
        ett => ett.oppgave !== null && ett.erBonus === medBonus && !gjort.includes(ett.oppgave),
      )

      if (indeks >= 0) return { del, indeks }
    }
  }

  return undefined
}

async function notat($: Motor): Promise<string | undefined> {
  const deler = await hentDeler($)
  const her = await read($, sted)
  const del = deler.find(ett => ett.nr === her.del)
  const avsnitt = del?.avsnitt[her.avsnitt]

  if (del === undefined) return undefined

  const hvor = avsnitt === undefined ? '' : `, avsnittet «${avsnitt.tittel}»`

  return `[kurs] Brukeren tar et praktisk Claude Code-kurs (pluginen «kurs») og er nå på del ${del.nr} «${del.tittel}»${hvor}. Kursteksten ligger i ${$.plugin.root}/deler/del-${del.nr}.md. Dette er bakgrunn: gjør det brukeren ber om, og nevn kurset bare når det hjelper.`
}

// --- the /kurs command ------------------------------------------------------

/** Shows the place in the pane, or as text in the transcript where no pane is. */
async function vis($: Motor, kort: string): Promise<CommandRunResult> {
  const full = await tekstHer($)

  if (await erPaa($, 'panel')) {
    const aapnet = await $.ui.open({ id: PANE, title: TITTEL })

    if (aapnet.isPlaced) {
      const skalVeilede = await erPaa($, 'veiledning')
      sistNotat = (await notat($)) ?? ''

      return skalVeilede ? { text: kort, context: [full] } : { text: kort }
    }
  }

  return { text: full }
}

async function ressurser($: Motor, navn: string): Promise<CommandRunResult> {
  const mappe = `${$.plugin.root}/ressurser`
  const filer = (await $.fs.list(mappe).catch(() => []))
    .map(fil => fil.name)
    .filter(ett => ett.endsWith('.md'))
    .sort()
  const valgt = filer.find(ett => ett === `${navn}.md`)

  if (valgt !== undefined) {
    return { text: await $.fs.read(`${mappe}/${valgt}`) }
  }

  const linjer = await Promise.all(
    filer.map(async fil => {
      const tittel = /^#\s+(.+)$/m.exec(await $.fs.read(`${mappe}/${fil}`))?.[1] ?? fil
      const kort = fil.replace(/\.md$/, '')

      return `- \`/kurs ressurser ${kort}\` – ${tittel}`
    }),
  )

  return { text: ['**Ressurser**', '', ...linjer].join('\n') }
}

async function kommando($: Motor, args: string): Promise<CommandRunResult> {
  await start($)

  const [ord = '', ...rest] = args.split(/\s+/)
  const deler = await hentDeler($)
  const gjort = await read($, ferdig)
  const her = await read($, sted)

  if (ord === '') {
    return vis($, her.del === 0 ? 'Kurset er åpent. Velg en del i panelet, eller skriv `/kurs 1`.' : 'Kurset er åpent i panelet.')
  }

  if (/^\d+$/.test(ord)) {
    const del = deler.find(ett => ett.nr === Number(ord))

    if (del === undefined) return { text: `Kurset har ikke del ${ord}. Delene er 1–${deler.length}.` }

    await gaaTil($, del.nr, -1)

    return vis($, `Del ${del.nr} · ${del.tittel}`)
  }

  switch (ord) {
    case 'oversikt': {
      await gaaTil($, 0, -1)

      return vis($, 'Oversikten over delene er åpen i panelet.')
    }

    case 'neste': {
      const neste = await finnNeste($)

      if (neste === undefined) return { text: 'Alle oppgavene er gjort. Gratulerer!' }

      await gaaTil($, neste.del.nr, neste.indeks)

      return vis($, `Del ${neste.del.nr} · ${neste.del.avsnitt[neste.indeks]?.tittel ?? ''}`)
    }

    case 'hint': {
      const naa = await aktiv($)

      if (naa === undefined) return { text: 'Det er ingen åpen oppgave her. Prøv `/kurs neste`.' }

      return { text: `**Hint – ${naa.avsnitt.tittel}**\n\n${naa.avsnitt.hint ?? 'Denne oppgaven har ikke noe hint.'}` }
    }

    case 'prompt': {
      const naa = await aktiv($)
      const valg = naa === undefined ? [] : prompter(naa.avsnitt)
      const tekst = valg[Number(rest[0] ?? 1) - 1]

      if (tekst === undefined) {
        return { text: valg.length === 0 ? 'Avsnittet du står på har ingen eksempelprompter.' : `Avsnittet har ${valg.length} eksempelprompter. Skriv \`/kurs prompt 1\`.` }
      }

      await $.prompt.fill({ text: tekst })

      return { text: 'Eksempelprompten ligger i promptfeltet. Rediger den, og trykk Enter.' }
    }

    case 'ferdig':
    case 'angre': {
      const naa = her.avsnitt >= 0 ? await aktiv($) : undefined
      const id = naa?.avsnitt.oppgave

      if (naa === undefined || id === null || id === undefined) {
        return { text: 'Åpne oppgaven først (`/kurs neste`, eller velg den i panelet), og prøv igjen.' }
      }

      if (ord === 'angre') {
        await angre($, id)

        return { text: `Krysset er fjernet: ${naa.avsnitt.tittel}` }
      }

      await merkSelv($, id)

      return { text: `✓ ${naa.avsnitt.tittel}` }
    }

    case 'status': {
      const linjer = deler.map(del => {
        const t = telling(del, gjort)
        const bonus = t.bonus === 0 ? '' : ` · bonus ${t.bonusGjort}/${t.bonus}`

        return `- Del ${del.nr} · ${del.tittel}: ${soyle(t.fasteGjort, t.faste)} ${t.fasteGjort}/${t.faste}${bonus}`
      })

      return { text: ['**Fremdrift**', '', ...linjer].join('\n') }
    }

    case 'tekst': {
      const del = deler.find(ett => ett.nr === her.del) ?? deler[0]

      if (del === undefined) return { text: `Fant ikke kursinnholdet i ${$.plugin.root}/deler.` }

      return { text: [`# Del ${del.nr} · ${del.tittel}`, ...del.avsnitt.map(ett => `## ${ett.tittel}\n\n${somMarkdown(ett)}`)].join('\n\n') }
    }

    case 'ressurser':
      return ressurser($, rest[0] ?? '')

    case 'panel': {
      const skalPaa = !(await erPaa($, 'panel'))
      await $.store.set('panel', skalPaa)

      if (skalPaa) return vis($, 'Panelet er på.')

      await $.ui.close({ id: PANE })

      return { text: 'Panelet er av. Kurset vises som tekst her i samtalen. `/kurs panel` slår det på igjen.' }
    }

    case 'veiledning': {
      const skalPaa = !(await erPaa($, 'veiledning'))
      await $.store.set('veiledning', skalPaa)
      sistNotat = ''

      return { text: skalPaa ? 'Claude får nå en kort merknad om hvilken oppgave du er på.' : 'Claude får ikke lenger vite hvor du er i kurset.' }
    }

    case 'om':
      return {
        text: [
          '**Kurs-pluginen**',
          '',
          `Mappe: \`${$.plugin.root}\``,
          '',
          '- Kursteksten er markdown i `deler/`. Panelet tegnes av hooks-modulen i `hooks/`.',
          '- Oppgaver krysses av ut fra det som skjer i sesjonen: kommandoer du kjører, verktøy Claude bruker, og filer i `.claude/` og `CLAUDE.md` i prosjektet.',
          '- Fremdriften lagres lokalt på maskinen din. Ingenting sendes ut.',
          '- Claude får en kort, skjult merknad om hvilken oppgave du er på. `/kurs veiledning` slår den av.',
          '- Pluginen har også en skill (`/kurs:veileder`) og en subagent (`kurs:kursgransker`).',
        ].join('\n'),
      }

    case 'nullstill': {
      if (rest[0] !== 'ja') return { text: 'Dette sletter fremdriften din. Skriv `/kurs nullstill ja` for å bekrefte.' }

      await update($, ferdig, () => [])
      await $.store.set('ferdig', [])
      await gaaTil($, 0, -1)

      return { text: 'Kurset er nullstilt.' }
    }

    case 'lukk': {
      await $.ui.close({ id: PANE })

      return { text: 'Panelet er lukket. `/kurs` åpner det igjen.' }
    }

    default:
      return { text: HJELP }
  }
}

// --- the hooks ---------------------------------------------------------------

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'kurs',
      description: 'Claude Code-kurset: åpne panelet, gå til en del, få hint',
      argumentHint: '[1-5 | neste | hint | status | hjelp]',
    })
    await lastInn($)
    await sjekkFiler($, true)

    if (e.isInteractive) {
      const harStartet = (await read($, sted)).del > 0 || (await read($, ferdig)).length > 0

      if (!harStartet) {
        $.ui.toast('Kurset er klart. Skriv /kurs for å starte.', { timeoutMs: 10000 })
      } else if (await erPaa($, 'panel')) {
        void $.ui.open({ id: PANE, title: TITTEL })
      }
    }

    return next(e)
  })

  on('command.run', async ($, e, next) => {
    if (e.command === 'kurs') {
      return kommando($, e.args.trim())
    }

    await signal($, { type: 'kommando', navn: e.command })
    const svar = await next(e)

    // A /clear starts a new conversation: put the progress back where it was.
    if (e.command === 'clear') {
      await lastInn($)
    }

    await sjekkFiler($)

    return svar
  })

  on('prompt.submit', async ($, e, next) => {
    if (e.origin.kind !== 'composer') {
      return next(e)
    }

    tur = { agenter: 0, mcp: [] }
    await signal($, { type: 'prompt', tekst: e.text })

    const merknad = (await erPaa($, 'veiledning')) ? await notat($) : undefined

    if (merknad === undefined || merknad === sistNotat) {
      return next(e)
    }

    sistNotat = merknad

    return next({ ...e, context: [...(e.context ?? []), merknad] })
  })

  on('classic.UserPromptSubmit', async ($, e, next) => {
    await signal($, { type: 'prompt', tekst: '', modus: e.permission_mode })

    return next(e)
  })

  on('tool.call', async ($, e, next) => {
    await signal($, {
      type: 'verktoy',
      verktoy: String(e.tool),
      input: e as unknown as Readonly<Record<string, unknown>>,
      erISubagent: e.agentId !== undefined,
    })

    return next(e)
  })

  on('skill.prompt', async ($, e, next) => {
    await signal($, { type: 'skill', navn: e.skill })

    return next(e)
  })

  on('turn.complete', async ($, e, next) => {
    if (e.agentId === undefined) {
      await sjekkFiler($)
    }

    return next(e)
  })

  on('ui.render', { component: 'CommandOutput', props: { command: 'kurs' } }, ($, e) => {
    const { Markdown } = $.ui.resolve(e)

    return <Markdown text={e.props.text} />
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const { Box, Button, Markdown, Text } = $.ui.resolve(e)
    const deler = await hentDeler($)
    const gjort = await read($, ferdig)
    const her = await read($, sted)
    const del = deler.find(ett => ett.nr === her.del)
    const avsnitt = del?.avsnitt[her.avsnitt]

    if (deler.length === 0) {
      return <Text>Fant ikke kursinnholdet i {$.plugin.root}/deler.</Text>
    }

    if (del === undefined) {
      return (
        <Box flexDirection="column" gap={1}>
          <Box flexDirection="column">
            <Text bold>Claude Code-kurset</Text>
            <Text dimColor>Velg en del. Oppgavene krysser seg av mens du jobber.</Text>
          </Box>
          <Box flexDirection="column">
            {deler.map(ett => {
              const t = telling(ett, gjort)

              return (
                <Box flexDirection="column">
                  <Button
                    key={`del${ett.nr}`}
                    plain
                    hotkey={String(ett.nr)}
                    label={ett.tittel}
                    onPress={() => gaaTil($, ett.nr, -1)}
                  />
                  <Text dimColor>
                    {'   '}
                    {soyle(t.fasteGjort, t.faste)} {t.fasteGjort}/{t.faste} · {ett.tid}
                  </Text>
                </Box>
              )
            })}
          </Box>
          <Text dimColor>/kurs hjelp viser kommandoene.</Text>
        </Box>
      )
    }

    if (avsnitt === undefined) {
      const t = telling(del, gjort)
      const neste = deler.find(ett => ett.nr === del.nr + 1)

      return (
        <Box flexDirection="column" gap={1}>
          <Box flexDirection="column">
            <Text dimColor>
              Del {del.nr} av {deler.length} · {del.tid}
            </Text>
            <Text bold>{del.tittel}</Text>
            <Text dimColor>
              {soyle(t.fasteGjort, t.faste)} {t.fasteGjort}/{t.faste}
              {t.bonus === 0 ? '' : ` · bonus ${t.bonusGjort}/${t.bonus}`}
            </Text>
          </Box>
          <Box flexDirection="column">
            {del.avsnitt.map((ett, i) => (
              <Button
                key={`avsnitt${i}`}
                plain
                hotkey={i < 9 ? String(i + 1) : undefined}
                dimColor={ett.oppgave === null || gjort.includes(ett.oppgave)}
                label={`${merke(ett, gjort)} ${ett.tittel}`}
                onPress={() => gaaTil($, del.nr, i)}
              />
            ))}
          </Box>
          <Box gap={1}>
            <Button key="oversikt" hotkey="o" label="Oversikt" onPress={() => gaaTil($, 0, -1)} />
            {neste !== undefined && (
              <Button key="nesteDel" hotkey="n" label={`Del ${neste.nr}`} onPress={() => gaaTil($, neste.nr, -1)} />
            )}
          </Box>
        </Box>
      )
    }

    const id = avsnitt.oppgave
    const erGjort = id !== null && gjort.includes(id)
    const harForrige = her.avsnitt > 0
    const harNeste = her.avsnitt < del.avsnitt.length - 1
    let promptNr = 0

    return (
      <Box flexDirection="column" gap={1}>
        <Box flexDirection="column">
          <Text dimColor>
            Del {del.nr} · {her.avsnitt + 1} av {del.avsnitt.length}
            {avsnitt.erBonus ? ' · bonus' : ''}
          </Text>
          <Text bold>
            {id === null ? '' : `${merke(avsnitt, gjort)} `}
            {avsnitt.tittel}
          </Text>
        </Box>
        {avsnitt.biter.map(bit => {
          if (bit.type === 'tekst') {
            return <Markdown text={bit.tekst} />
          }

          promptNr += 1
          const nr = promptNr

          return (
            <Box flexDirection="column" borderStyle="round" borderDimColor paddingX={1}>
              <Text>{bit.tekst}</Text>
              <Button
                key={`prompt${nr}`}
                hotkey={nr === 1 ? 'p' : undefined}
                label="Lim inn i promptfeltet"
                onPress={() => $.prompt.fill({ text: bit.tekst })}
              />
            </Box>
          )
        })}
        {id !== null && (
          <Box flexDirection="column">
            {avsnitt.hint !== null && <Text dimColor>Hint: {avsnitt.hint}</Text>}
            <Box gap={1} marginTop={1}>
              {erGjort ? (
                <Button key="angre" label="Angre krysset" onPress={() => angre($, id)} />
              ) : (
                <Button key="merk" hotkey="m" variant="primary" label="Merk som gjort" onPress={() => merkSelv($, id)} />
              )}
              <Text dimColor>{erGjort ? 'Gjort.' : hvordanKryssesDenAv(avsnitt)}</Text>
            </Box>
          </Box>
        )}
        <Box gap={1}>
          <Button key="tilDel" hotkey="o" label={`Del ${del.nr}`} onPress={() => gaaTil($, del.nr, -1)} />
          {harForrige && (
            <Button key="forrige" hotkey="f" label="Forrige" onPress={() => gaaTil($, del.nr, her.avsnitt - 1)} />
          )}
          {harNeste && (
            <Button key="neste" hotkey="n" label="Neste" onPress={() => gaaTil($, del.nr, her.avsnitt + 1)} />
          )}
        </Box>
      </Box>
    )
  })
}
