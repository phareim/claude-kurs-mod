# AGENTS.md

A hands-on Claude Code course in five parts, packaged as a Claude Code plugin (`kurs/`) whose hooks module draws the course in a pane, fills example prompts into the prompt box and ticks tasks from what happens in the session. Layout and usage: `README.md`. Assessment of the course and the packaging: `docs/vurdering.md`.

## Commands

- `claude plugin validate kurs`: manifest and hooks as the engine reads them
- `claude plugin test kurs`: the tests in `kurs/hooks/*.test.tsx`
- `node scripts/sjekk-innhold.mjs`: every task id `sjekk.ts` ticks exists in `kurs/deler/`, and every task has a hint
- `heavy -- tsc -p kurs`: typecheck (on Sleeper through `heavy`); needs `kurs/.claude-plugin/types/`, which Claude Code writes when the plugin loads once with `claude --plugin-dir kurs`
- Try it for real: `claude --plugin-dir ~/github/claude-kurs-mod/kurs` in a scratch folder, then `/kurs`

## Rules

- Norwegian (bokmål) for everything a participant reads: course text, pane, command output, toasts. English in code comments.
- The course text is the markdown in `kurs/deler/`. The format (frontmatter, `<!-- oppgave: id -->`, `<!-- hint: -->`, ```` ```prompt ```` blocks) is described in `README.md` and read by `kurs/hooks/les.ts`. Change text there, never in the TypeScript.
- A task id is `<del>.<id>`. Renaming one means changing `kurs/hooks/sjekk.ts` in the same commit; `scripts/sjekk-innhold.mjs` fails when they disagree.
- `les.ts` and `sjekk.ts` stay pure (no `$`, no imports from the engine) so the tests and the Node check can import them.
- The hooks API is early access and changes between Claude Code releases. The declaration file Claude Code writes (`kurs/.claude-plugin/types/claude-code/index.d.ts`) is the authority; the `plugin-authoring` skill is the map. After a Claude Code update: validate, test, and load it once for real.
- Everything the pane can do must also work as a `/kurs` subcommand, so the course runs in a narrow terminal and with the pane off.
- The mod stores progress with `$.store` on the participant's machine and sends nothing anywhere. Keep it that way unless Petter decides otherwise.
- Date claims about what was verified on which Claude Code version (`README.md` → For kursholder).
