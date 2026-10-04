// Which tasks a thing the participant (or Claude) just did completes.
//
// Pure: register.tsx turns engine events into signals, this file answers the
// task ids. The ids are the ones the markdown in deler/ declares.

export type Prosjektfiler = {
  harClaudeMd: boolean
  /** Files in .claude/rules/. */
  regler: number
  /** Names of the subagents in .claude/agents/. */
  agenter: string[]
  /** How many of those have a `skills:` field. */
  agenterMedSkills: number
  /** Names of the skills in .claude/skills/. */
  skills: string[]
  harFork: boolean
  harDynamisk: boolean
}

export const TOMT_PROSJEKT: Prosjektfiler = {
  harClaudeMd: false,
  regler: 0,
  agenter: [],
  agenterMedSkills: 0,
  skills: [],
  harFork: false,
  harDynamisk: false,
}

/** What one turn has done so far: reset when the participant sends a prompt. */
export type Tur = { agenter: number; mcp: string[] }

export type Signal =
  | { type: 'prompt'; tekst: string; modus?: string }
  | { type: 'kommando'; navn: string }
  | { type: 'verktoy'; verktoy: string; input: Readonly<Record<string, unknown>>; erISubagent: boolean }
  | { type: 'skill'; navn: string }
  | { type: 'filer' }

/** Every task this file can tick; the rest are marked by hand. */
export const AUTOMATISKE: readonly string[] = [
  '1.start',
  '1.plan',
  '1.implementer',
  '1.kontekst',
  '1.tester',
  '2.init',
  '2.tilpass',
  '2.regler',
  '3.status',
  '3.context7',
  '3.prosjektstyring',
  '3.kombiner',
  '4.utforsk',
  '4.parallell',
  '4.tester',
  '4.review',
  '4.egen',
  '4.kjede',
  '5.finn',
  '5.bruk',
  '5.egen',
  '5.kjor',
  '5.fork',
  '5.dynamisk',
  '5.sammen',
]

const TESTKOMMANDO =
  /\b(vitest|jest|pytest|playwright|unittest|rspec|phpunit)\b|\b(npm|pnpm|yarn|bun)\s+(run\s+)?test\b|\b(go|cargo|deno|dotnet|mvn|gradle)\w*\s+test\b|\bnpx\s+\S*test/
const KONTEKSTKOMMANDOER = ['clear', 'compact', 'rewind']
const SKRIVEVERKTOY = ['Write', 'Edit', 'NotebookEdit']
const AGENTVERKTOY = ['Agent', 'Task']

function tekstfelt(input: Readonly<Record<string, unknown>>, felt: string): string {
  const verdi = input[felt]

  return typeof verdi === 'string' ? verdi : ''
}

/** `mcp__context7__resolve-library-id` → `context7`; undefined for other tools. */
export function mcpServer(verktoy: string): string | undefined {
  const deler = verktoy.split('__')

  return deler[0] === 'mcp' && deler.length >= 3 ? deler[1] : undefined
}

function forVerktoy(
  signal: Extract<Signal, { type: 'verktoy' }>,
  tur: Tur,
  prosjekt: Prosjektfiler,
): string[] {
  const { verktoy, input, erISubagent } = signal
  const funn: string[] = []

  if (verktoy === 'ExitPlanMode') {
    funn.push('1.plan')
  }

  if (SKRIVEVERKTOY.includes(verktoy)) {
    const sti = tekstfelt(input, 'file_path')
    funn.push('1.implementer')

    if (/(^|\/)CLAUDE\.md$/.test(sti)) {
      funn.push(verktoy === 'Write' && !prosjekt.harClaudeMd ? '2.init' : '2.tilpass')
    }
  }

  if (verktoy === 'Bash') {
    const kommando = tekstfelt(input, 'command')

    if (TESTKOMMANDO.test(kommando)) {
      funn.push(erISubagent ? '4.tester' : '1.tester')
    }

    if (erISubagent && /\bgit\s+(diff|show|log)\b/.test(kommando)) {
      funn.push('4.review')
    }

    if (/\bskills\s+add\b/.test(kommando)) {
      funn.push('5.finn')
    }

    if (/\bclaude\s+mcp\s+list\b/.test(kommando)) {
      funn.push('3.status')
    }
  }

  if (AGENTVERKTOY.includes(verktoy)) {
    tur.agenter += 1
    funn.push('4.utforsk')

    if (tur.agenter >= 2) {
      funn.push('4.parallell')
    }

    if (prosjekt.agenter.includes(tekstfelt(input, 'subagent_type'))) {
      funn.push('4.kjede')
    }
  }

  const server = mcpServer(verktoy)

  if (server !== undefined && server !== 'kurs') {
    if (!tur.mcp.includes(server)) {
      tur.mcp.push(server)
    }

    if (/context7/i.test(server)) {
      funn.push('3.context7')
    }

    if (/linear|notion/i.test(server)) {
      funn.push('3.prosjektstyring')
    }

    if (tur.mcp.length >= 2) {
      funn.push('3.kombiner')
    }
  }

  return funn
}

function forFiler(prosjekt: Prosjektfiler): string[] {
  const funn: string[] = []

  if (prosjekt.harClaudeMd) funn.push('2.init')
  if (prosjekt.regler > 0) funn.push('2.regler')
  if (prosjekt.agenter.length > 0) funn.push('4.egen')
  if (prosjekt.skills.length > 0) funn.push('5.egen')
  if (prosjekt.harFork) funn.push('5.fork')
  if (prosjekt.harDynamisk) funn.push('5.dynamisk')
  if (prosjekt.agenterMedSkills > 0) funn.push('5.sammen')

  return funn
}

export function sjekk(signal: Signal, tur: Tur, prosjekt: Prosjektfiler): string[] {
  switch (signal.type) {
    case 'prompt': {
      const funn: string[] = []

      if (signal.tekst.trim() !== '' && !signal.tekst.startsWith('/')) funn.push('1.start')
      if (signal.modus === 'plan') funn.push('1.plan')

      return funn
    }

    case 'kommando': {
      if (KONTEKSTKOMMANDOER.includes(signal.navn)) return ['1.kontekst']
      if (signal.navn === 'init') return ['2.init']
      if (signal.navn === 'mcp') return ['3.status']

      return []
    }

    case 'verktoy':
      return forVerktoy(signal, tur, prosjekt)

    case 'skill': {
      if (signal.navn.startsWith('kurs:')) return []

      return prosjekt.skills.includes(signal.navn) ? ['5.bruk', '5.kjor'] : ['5.bruk']
    }

    case 'filer':
      return forFiler(prosjekt)
  }
}
