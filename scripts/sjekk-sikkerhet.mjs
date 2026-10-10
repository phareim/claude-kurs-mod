// Exercises the exact hook example shipped in the security resource.
// Synthetic inputs only: no secret file is created, opened or changed.
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'

const tekst = readFileSync(new URL('../kurs/ressurser/sikkerhet.md', import.meta.url), 'utf8')
const script = /```javascript\n([\s\S]*?)\n```/.exec(tekst)?.[1]
const config = JSON.parse(/```json\n([\s\S]*?)\n```/.exec(tekst)?.[1] ?? 'null')
assert.ok(script, 'Hook-eksempelet mangler')
const hook = config.hooks.PreToolUse[0]
assert.equal(hook.matcher, 'Read|Edit|Write|Bash')
assert.equal(hook.hooks[0].command, 'node "$CLAUDE_PROJECT_DIR/.claude/hooks/beskytt-env.cjs"')

let antall = 0
function sjekk(input, blokkeres) {
  const resultat = spawnSync(process.execPath, ['-e', script], {
    input: typeof input === 'string' ? input : JSON.stringify(input),
    encoding: 'utf8',
  })
  assert.equal(resultat.status, 0, resultat.stderr)
  assert.equal(resultat.stderr, '')
  if (blokkeres) {
    const svar = JSON.parse(resultat.stdout).hookSpecificOutput
    assert.equal(svar.hookEventName, 'PreToolUse')
    assert.equal(svar.permissionDecision, 'deny')
    assert.ok(svar.permissionDecisionReason)
  } else {
    assert.equal(resultat.stdout, '')
  }
  antall += 1
}

for (const tool_name of ['Read', 'Edit', 'Write']) {
  for (const file_path of ['.env', '.env.local', '/prosjekt/.env', 'config/.env.kurstest', 'C:\\prosjekt\\.env', '.env.example.local']) {
    sjekk({ tool_name, tool_input: { file_path } }, true)
  }
  for (const file_path of ['.env.example', '/prosjekt/.env.example', 'README.md', 'src/env.ts']) {
    sjekk({ tool_name, tool_input: { file_path } }, false)
  }
  sjekk({ tool_name, tool_input: {} }, true)
}
for (const command of ['cat .env', 'printf ufarlig > .env.kurstest', 'rm .env.local', 'cat .env.example']) {
  sjekk({ tool_name: 'Bash', tool_input: { command } }, true)
}
for (const command of ['npm test', 'git status', 'node --version']) {
  sjekk({ tool_name: 'Bash', tool_input: { command } }, false)
}
sjekk({ tool_name: 'Bash', tool_input: {} }, true)
sjekk('{', true)

// These are documented limitations, not protected access paths.
sjekk({ tool_name: 'Bash', tool_input: { command: 'node les-konfig.cjs' } }, false)
sjekk({ tool_name: 'Grep', tool_input: { pattern: 'SECRET_KEY', path: '.' } }, false)

console.log(`Sikkerhetseksempelet: ${antall} kontroller bestått. Ingen hemmelighetsfiler lest.`)
