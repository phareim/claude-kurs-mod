// Checks that the course text and the ticking rules agree:
// every task sjekk.ts can tick exists in deler/, and lists the tasks that
// are marked by hand. Run: node scripts/sjekk-innhold.mjs
import { readdirSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import { lesDel, oppgaver } from '../kurs/hooks/les.ts'
import { AUTOMATISKE } from '../kurs/hooks/sjekk.ts'

const mappe = fileURLToPath(new URL('../kurs/deler/', import.meta.url))
const deler = readdirSync(mappe)
  .filter(navn => /^del-\d+\.md$/.test(navn))
  .sort()
  .map(navn => lesDel(readFileSync(mappe + navn, 'utf8')))
const ider = deler.flatMap(del => oppgaver(del).map(ett => ett.oppgave))
const mangler = AUTOMATISKE.filter(id => !ider.includes(id))
const dobble = ider.filter((id, i) => ider.indexOf(id) !== i)
const utenHint = deler.flatMap(del => oppgaver(del).filter(ett => ett.hint === null).map(ett => ett.oppgave))

for (const del of deler) {
  const alle = oppgaver(del)
  console.log(`Del ${del.nr} · ${del.tittel} (${del.tid}): ${del.avsnitt.length} avsnitt, ${alle.length} oppgaver, ${alle.filter(ett => ett.erBonus).length} bonus`)
}

console.log(`Merkes for hånd: ${ider.filter(id => !AUTOMATISKE.includes(id)).join(', ') || 'ingen'}`)

if (mangler.length + dobble.length + utenHint.length > 0) {
  console.error(`sjekk.ts krysser av oppgaver som ikke finnes i deler/: ${mangler.join(', ') || 'ingen'}`)
  console.error(`Oppgave-id brukt to ganger: ${dobble.join(', ') || 'ingen'}`)
  console.error(`Oppgaver uten hint: ${utenHint.join(', ') || 'ingen'}`)
  process.exit(1)
}

console.log('Innhold og regler stemmer overens.')
