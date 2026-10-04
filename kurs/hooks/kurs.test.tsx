import { expect, mock, test } from 'claude-code/testing'
import type { On } from 'claude-code'

import { lesDel, oppgaver, prompter } from './les'
import { TOMT_PROSJEKT, mcpServer, sjekk } from './sjekk'
import type { Tur } from './sjekk'

const DEL_1 = `---
del: 1
tittel: Kom i gang
tid: 20 minutter
---

## Hva du nettopp har lært

Litt lesestoff.

## Start prosjektet ditt
<!-- oppgave: start -->
<!-- hint: Send en prompt. -->

Be Claude sette opp prosjektet.

\`\`\`prompt
Create a new Next.js project.
\`\`\`

\`\`\`markdown
## Dette er kode, ikke en overskrift
\`\`\`

## Bonus: tester
<!-- oppgave: tester bonus -->

\`\`\`prompt
Write tests.
\`\`\`
`

const DEL_2 = `---
del: 2
tittel: CLAUDE.md
tid: 20 minutter
---

## Generer CLAUDE.md
<!-- oppgave: init -->

Skriv /init.
`

const FILER: Record<string, string> = { 'del-1.md': DEL_1, 'del-2.md': DEL_2 }
const nyTur = (): Tur => ({ agenter: 0, mcp: [] })
const PANE = {
  component: 'Pane',
  requestId: 'kurs',
  props: { title: 'Kurs', isFocused: false, bodyColumns: 60, placement: 'dock', scroll: { offset: 0, bodyRows: 40 }, view: {} },
} as const

/** The world beneath the mod: the course's files, an empty project, a quiet interface. */
function verden(on: On): { toasts: string[]; fylt: string[] } {
  const toasts: string[] = []
  const fylt: string[] = []

  mock.store(on)
  on('fs.list', (_, e) => ({
    value: String(e.path).endsWith('/deler')
      ? Object.keys(FILER).map(name => ({ name, kind: 'file' as const, size: 1, mtimeMs: 0, isLink: false }))
      : [],
  }))
  on('fs.read', (_, e) => {
    const navn = String(e.path).split('/').pop() ?? ''

    return { value: FILER[navn] ?? '' }
  })
  on('fs.exists', () => ({ value: false }))
  on('command.register', (_, e) => ({ value: { command: e.name } }))
  on('ui.open', () => ({ value: { isPlaced: true } }))
  on('ui.close', () => ({ value: undefined }))
  on('ui.toast', (_, e) => {
    toasts.push(String(e.text))

    return { value: undefined }
  })
  on('prompt.fill', (_, e) => {
    fylt.push(e.text)

    return { isFilled: true }
  })
  on('session.start', (_, e) => e)
  on('tool.call', () => ({ result: {}, text: '' }))

  return { toasts, fylt }
}

test('les: sections, tasks, hints and example prompts', () => {
  const del = lesDel(DEL_1)

  expect(del.nr).toBe(1)
  expect(del.tittel).toBe('Kom i gang')
  expect(del.avsnitt.map(ett => ett.tittel)).toEqual(['Hva du nettopp har lært', 'Start prosjektet ditt', 'Bonus: tester'])
  expect(oppgaver(del).map(ett => ett.oppgave)).toEqual(['1.start', '1.tester'])
  expect(del.avsnitt[1]?.hint).toBe('Send en prompt.')
  expect(del.avsnitt[2]?.erBonus).toBe(true)
  expect(prompter(del.avsnitt[1]!)).toEqual(['Create a new Next.js project.'])
})

test('sjekk: what each signal ticks', () => {
  const tur = nyTur()
  const bash = (command: string, erISubagent = false) =>
    sjekk({ type: 'verktoy', verktoy: 'Bash', input: { command }, erISubagent }, tur, TOMT_PROSJEKT)

  expect(sjekk({ type: 'prompt', tekst: 'Lag en app' }, tur, TOMT_PROSJEKT)).toEqual(['1.start'])
  expect(sjekk({ type: 'prompt', tekst: '', modus: 'plan' }, tur, TOMT_PROSJEKT)).toEqual(['1.plan'])
  expect(sjekk({ type: 'kommando', navn: 'compact' }, tur, TOMT_PROSJEKT)).toEqual(['1.kontekst'])
  expect(sjekk({ type: 'kommando', navn: 'init' }, tur, TOMT_PROSJEKT)).toEqual(['2.init'])
  expect(bash('npm test')).toEqual(['1.tester'])
  expect(bash('npx vitest run', true)).toEqual(['4.tester'])
  expect(bash('git diff', true)).toEqual(['4.review'])
  expect(bash('git diff')).toEqual([])
  expect(bash('ls -la')).toEqual([])
})

test('sjekk: subagents and MCP servers are counted per turn', () => {
  const tur = nyTur()
  const egne = { ...TOMT_PROSJEKT, agenter: ['reviewer'], skills: ['commit'] }
  const agent = (subagent_type: string) =>
    sjekk({ type: 'verktoy', verktoy: 'Agent', input: { subagent_type }, erISubagent: false }, tur, egne)
  const mcp = (verktoy: string) => sjekk({ type: 'verktoy', verktoy, input: {}, erISubagent: false }, tur, egne)

  expect(agent('Explore')).toEqual(['4.utforsk'])
  expect(agent('reviewer')).toEqual(['4.utforsk', '4.parallell', '4.kjede'])
  expect(mcpServer('mcp__context7__resolve-library-id')).toBe('context7')
  expect(mcpServer('Bash')).toBe(undefined)
  expect(mcp('mcp__context7__resolve-library-id')).toEqual(['3.context7'])
  expect(mcp('mcp__linear__create_issue')).toEqual(['3.prosjektstyring', '3.kombiner'])
  expect(sjekk({ type: 'skill', navn: 'commit' }, tur, egne)).toEqual(['5.bruk', '5.kjor'])
  expect(sjekk({ type: 'skill', navn: 'kurs:veileder' }, tur, egne)).toEqual([])
})

test('the command moves through the course and a tool call ticks a task', async ($, on) => {
  const { toasts } = verden(on)
  const kurs = (args: string) =>
    $.command.run({ command: 'kurs', args, origin: { kind: 'composer' }, presentation: { isFullscreen: true, columns: 160 } })

  await $.session.start({ cwd: '/prosjekt', surface: 'terminal', isInteractive: true })

  // Nothing is ticked before the participant has opened the course.
  await $.tool.call({ tool: 'Bash', tool_use_id: 't0', command: 'npm test' })
  expect(toasts.filter(ett => ett.startsWith('✓'))).toEqual([])

  expect((await kurs('1')).text).toBe('Del 1 · Kom i gang')
  expect((await kurs('neste')).text).toBe('Del 1 · Start prosjektet ditt')
  expect((await kurs('hint')).text).toContain('Send en prompt.')
  expect((await kurs('9')).text).toContain('Kurset har ikke del 9')

  await $.tool.call({ tool: 'Bash', tool_use_id: 't1', command: 'npm test' })
  expect(toasts).toContain('✓ Bonus: tester')
  expect((await kurs('status')).text).toContain('bonus 1/1')

  await kurs('ferdig')
  expect((await kurs('status')).text).toContain('Del 1 · Kom i gang: ▰ 1/1')
})

test('the pane draws the course and its buttons work on every surface with buttons', async ($, on) => {
  const { fylt } = verden(on)

  await $.session.start({ cwd: '/prosjekt', surface: 'terminal', isInteractive: true })

  for (const surface of ['terminal', 'desktop'] as const) {
    const ui = await $.ui.mount({ plugin: 'kurs', surface, ...PANE })

    await ui.press({ key: 'oversikt' }).catch(() => undefined)
    expect(await ui.find({ type: 'Text', text: 'Claude Code-kurset' })).toBeDefined()

    await ui.press({ key: 'del1' })
    expect(await ui.find({ key: 'avsnitt1', text: /Start prosjektet ditt/ })).toBeDefined()

    await ui.press({ key: 'avsnitt1' })
    await ui.press({ key: 'prompt1' })
    expect(fylt.at(-1)).toBe('Create a new Next.js project.')

    await ui.press({ key: 'merk' })
    expect(await ui.find({ key: 'angre' })).toBeDefined()
    await ui.press({ key: 'angre' })
    await ui.press({ key: 'tilDel' })
    await ui.press({ key: 'oversikt' })
    await ui.unmount()
  }
})
