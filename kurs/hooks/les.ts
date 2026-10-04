// Reads one course part (deler/del-N.md) into sections the pane can draw.
//
// The markdown is the source: a part is frontmatter (del, tittel, tid) and
// `## ` sections. A section is a task when it carries `<!-- oppgave: id -->`
// (add `bonus` after the id for an optional one), and may carry one
// `<!-- hint: ... -->`. A fenced block marked `prompt` is an example prompt
// the pane can put in the prompt box.

export type Bit = { type: 'tekst' | 'prompt'; tekst: string }

export type Avsnitt = {
  tittel: string
  biter: Bit[]
  /** The task's full id (`1.start`), or null for a section that is only read. */
  oppgave: string | null
  erBonus: boolean
  hint: string | null
}

export type Del = { nr: number; tittel: string; tid: string; avsnitt: Avsnitt[] }

const OPPGAVE = /^<!--\s*oppgave:\s*([a-z0-9-]+)(\s+bonus)?\s*-->$/
const HINT = /^<!--\s*hint:\s*(.+?)\s*-->$/

export function lesDel(kilde: string): Del {
  const linjer = kilde.replace(/\r\n/g, '\n').split('\n')
  const hode: Record<string, string> = {}
  let i = 0

  if (linjer[0]?.trim() === '---') {
    i = 1

    while (i < linjer.length && linjer[i]?.trim() !== '---') {
      const felt = /^([a-z]+):\s*(.*)$/.exec(linjer[i] ?? '')

      if (felt?.[1] !== undefined) {
        hode[felt[1]] = (felt[2] ?? '').trim()
      }

      i += 1
    }

    i += 1
  }

  const nr = Number(hode.del ?? 0)
  const avsnitt: Avsnitt[] = []
  let aapent: Avsnitt | null = null
  let tekst: string[] = []
  let prompt: string[] | null = null
  let erIKodeblokk = false

  const lukkTekst = () => {
    const samlet = tekst.join('\n').trim()
    tekst = []

    if (aapent !== null && samlet !== '') {
      aapent.biter.push({ type: 'tekst', tekst: samlet })
    }
  }

  for (; i < linjer.length; i += 1) {
    const linje = linjer[i] ?? ''
    const erGjerde = linje.startsWith('```')

    if (prompt !== null) {
      if (erGjerde) {
        aapent?.biter.push({ type: 'prompt', tekst: prompt.join('\n').trim() })
        prompt = null
      } else {
        prompt.push(linje)
      }

      continue
    }

    if (erIKodeblokk) {
      tekst.push(linje)
      erIKodeblokk = !erGjerde

      continue
    }

    if (linje.startsWith('## ')) {
      lukkTekst()
      aapent = {
        tittel: linje.slice(3).trim(),
        biter: [],
        oppgave: null,
        erBonus: false,
        hint: null,
      }
      avsnitt.push(aapent)

      continue
    }

    if (aapent === null) {
      continue
    }

    const oppgave = OPPGAVE.exec(linje.trim())
    const hint = HINT.exec(linje.trim())

    if (oppgave?.[1] !== undefined) {
      aapent.oppgave = `${nr}.${oppgave[1]}`
      aapent.erBonus = oppgave[2] !== undefined
    } else if (hint?.[1] !== undefined) {
      aapent.hint = hint[1]
    } else if (linje.trim() === '```prompt') {
      lukkTekst()
      prompt = []
    } else {
      erIKodeblokk = erGjerde
      tekst.push(linje)
    }
  }

  lukkTekst()

  return { nr, tittel: hode.tittel ?? `Del ${nr}`, tid: hode.tid ?? '', avsnitt }
}

/** The section as markdown, example prompts shown as plain code blocks. */
export function somMarkdown(avsnitt: Avsnitt): string {
  return avsnitt.biter
    .map(bit => (bit.type === 'prompt' ? '```\n' + bit.tekst + '\n```' : bit.tekst))
    .join('\n\n')
}

export function prompter(avsnitt: Avsnitt): string[] {
  return avsnitt.biter.filter(bit => bit.type === 'prompt').map(bit => bit.tekst)
}

export function oppgaver(del: Del): Avsnitt[] {
  return del.avsnitt.filter(ett => ett.oppgave !== null)
}
