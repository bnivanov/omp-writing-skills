# Architecture & design doctrine

`omp-writing-skills` ships **one** agent skill, `writing`. Modes inside that skill replace the old six-skill split.

## The core design problem

1. **Prompt-only "Do Not" lists** do not give the model a positive sentence architecture.
2. **Burstiness injectors** produce choppy fragments.
3. **Self-grading drafters** miss their own tells.
4. **Overlapping skills** (`writing-pipeline` vs `writing-voice` vs `no-ai-slop` vs `unslop-file`) applied conflicting edits to the same draft.
5. **Editor over-reach** fabricates stance or slang.

## System architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│  skills/writing/SKILL.md                                                │
│  Mode dispatch: draft | edit | detect | file | review | chat            │
├─────────────────────────────────────────────────────────────────────────┤
│  1. Rhythm (always)                                                     │
│     No staccato, no antithesis pivot, no programmed wobble              │
├─────────────────────────────────────────────────────────────────────────┤
│  2. Craft (draft / long-form)                                           │
│     references/craft.md  — Anbeeld/WRITING.md v1.4.2                    │
│     references/medium-routing.md                                        │
├─────────────────────────────────────────────────────────────────────────┤
│  3. Transform                                                           │
│     edit   → references/edit.md   (petergyang/no-ai-slop)               │
│     file   → references/file.md   (unslop, code-safe in-place)          │
│     review → references/review.md (line-anchored comments)              │
│     detect → lint only, no rewrite                                      │
├─────────────────────────────────────────────────────────────────────────┤
│  4. Deterministic lint  scripts/lint.sh                                 │
│     slopless AST  +  cliche-lint.mjs (Willison 38-pattern port)         │
└─────────────────────────────────────────────────────────────────────────┘
```

Retired directories (`writing-pipeline`, `writing-voice`, `no-ai-slop`, `unslop-file`, `unslop-review`) are aliases in the installer. `update --all` deletes them from the destination.

## Mode matrix

| Request | Mode | Contract |
|---|---|---|
| Notes → publishable draft | `draft` | Brief → draft → isolated edit subagent if long → lint → human approval. Never auto-publish. |
| Pasted draft cleanup | `edit` | Minimum effective edit; `eval.md` checks; What changed. |
| Audit / highlight clichés | `detect` | Quote hits from `lint.sh`. No rewrite, no authorship claim. |
| Existing `AGENTS.md` / README | `file` | `FILE.original.md` backup; code/paths/commands byte-exact. |
| PR diff comments | `review` | `L<line>: <severity> …` unless the harness schema wins. |
| Short chat | `chat` | Rhythm only. No lint, no subagent. |

## Lint gate

`scripts/lint.sh` runs:

1. **slopless** (MIT) — markdown AST; negation-reframe; stacked fragments.
2. **cliche-lint.mjs** — Apache-2.0 derivative of [Simon Willison's highlighter](https://github.com/simonw/tools/blob/main/llm-cliche-highlighter.html). Same finders (`makeChainFinder`, echo runs, anaphora, Wikipedia vocabulary). CLI additions: fenced/inline code masking, `file:line:col` output, `--off`, `--json`, `--self-test`.

`--off colon-triple` is the usual docs carve-out (colon+triple is common in parameter lists).

## Precedence

1. Truth, safety, platform, harness output schema
2. Explicit user instructions
3. File-mode preservation contract
4. Rhythm
5. Craft
6. De-slop
7. Lint gate

## Never-inject

Editors do not add first-person experience, manufactured stakes, or forced slang. Subtractive editing only.

## Drafter / editor split

Drafts roughly longer than 300 words: spawn a separate editor subagent with `references/edit.md` only. The drafting context does not grade itself.
