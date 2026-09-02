---
name: writing
description: "Draft, revise, audit, de-slop, or lint human-facing prose; clean docs in place; write line-anchored PR comments. Use for /write, writing-pipeline, writing-voice, no-ai-slop, unslop-file, unslop-review, LLM cliché highlighter, AI slop, antithesis pivots, and staccato fragments. Excludes code comments, commit messages, and private notes."
license: MIT
metadata:
  version: "2.0.0"
  author: OMP Community
---

# Writing

One skill. Rhythm first, then craft, then a minimum-edit cleanup, then a deterministic lint gate.

Do not load humanizer or burstiness injectors. They ban "it's not X, it's Y" and then teach staccato fragments.

## Mode

Pick one owner. Do not run two rewrite modes on the same pass.

| Request | Mode | Load next |
|---|---|---|
| Draft, `/write`, article, essay, recap, X/LinkedIn | `draft` | `references/craft.md`, `references/medium-routing.md` |
| Cleanup, de-slop, humanize, make this less AI | `edit` | `references/edit.md`, then `eval.md` |
| Detect / audit / highlight clichés, no rewrite | `detect` | Run `scripts/lint.sh`; quote hits |
| In-place `CLAUDE.md`, `AGENTS.md`, README, memory file | `file` | `references/file.md` |
| PR / diff review comments | `review` | `references/review.md` |
| Short user-facing chat | `chat` | This file only |

If the user names an old skill (`writing-pipeline`, `writing-voice`, `no-ai-slop`, `unslop-file`, `unslop-review`), use the matching row above.

## Rhythm (always)

1. **No staccato.** No two- or three-word fragments for drama. No "X. And Y. And Z." No isolated kicker. Join related thoughts with because / but / so / which / that, or a comma / colon / semicolon.
2. **No antithesis pivot.** Do not write "it's not X, it's Y", "it's not just X, it's Y", or "not X but Y" as fake insight. State the true thing. Keep a contrast the author already wrote if it is a real clarification.
3. **No recipe irregularity.** Do not inject a short sentence every few lines. Do not force burstiness or programmed length wobble.
4. **Minimum edit.** If the source already has a voice, fix tells and stop. Do not sand it into a new persona.
5. **Connective tissue.** A longer sentence that shows cause, contrast, or qualification beats a row of crisp declarations.

## Draft pipeline

1. **Brief.** Medium, audience, task mode, facts actually supplied. Ask if a missing fact would change the piece. Do not invent numbers, quotes, or anecdotes. Write drafts longer than a few paragraphs to a file so lint has a path.
2. **Draft.** Read `references/craft.md` and the medium-routing rows that apply. Apply rhythm. For a personal/brand voice, also read `references/voice-calibration-guide.md`.
3. **Edit pass.** For drafts roughly >300 words, spawn a **separate** editor subagent that only receives the draft plus `references/edit.md`. The drafter does not grade its own work. Minimum effective edit. Return What changed only if the user asked for an edit, not for a clean publishable post.
4. **Lint.**

   ```bash
   skills/writing/scripts/lint.sh path/to/draft.md
   ```

   Fix `negation-reframe`, stacked fragments, and flagged clichés. Do not add slang or fake typos to silence the linter.
5. **Hand to the user.** Full exact text. Ask: post as-is, edit, or split? Do not publish.

## Detect

Run the linter. Name each hit with file, line, pattern id, and a quoted span. Do not rewrite unless asked. Do not claim AI authorship; named patterns are evidence.

## Never-inject

Do not add first-person experience, folksy slang, manufactured stakes, or unprompted contrarianism. Subtractive editing only.

## Precedence

1. Truth, safety, platform, harness output schema
2. Explicit user instructions
3. File-mode preservation contract (`references/file.md`) — code, paths, commands, front matter stay byte-exact
4. Rhythm rules above
5. Craft (`references/craft.md`)
6. De-slop (`references/edit.md` / `references/file.md`)
7. Lint gate (`scripts/lint.sh`)

## Lint details

`lint.sh` runs two deterministic passes:

- `slopless` — AST gate for negation-reframe and stacked fragments ([berelevant-ai/slopless](https://github.com/berelevant-ai/slopless))
- `cliche-lint.mjs` — Simon Willison's LLM cliché detectors ([simonw/tools](https://github.com/simonw/tools/blob/main/llm-cliche-highlighter.html), Apache-2.0), plus fenced-code masking

```bash
skills/writing/scripts/cliche-lint.mjs --list
skills/writing/scripts/cliche-lint.mjs --off colon-triple draft.md
```

Exit 0 = clean. Exit 1 = findings. Exit 2 = usage/tool error.

## References

- `references/craft.md` — 15 developmental rules (Anbeeld/WRITING.md)
- `references/edit.md` — minimum-edit de-slop (petergyang/no-ai-slop)
- `references/file.md` — in-place doc cleaner (unslop)
- `references/review.md` — line-anchored review comments (unslop)
- `references/cliches.md` — cliché pattern catalog
- `references/medium-routing.md`, `editing-integrity.md`, `required-checks.md` — load before delivery on long-form
- `references/voice-calibration.md` — only when asked to match a personal or brand voice
- `eval.md` — post-edit checks for `edit` mode
