# Pipeline workflow guide

End-to-end flow for the single `writing` skill (Oh My Pi, Claude Code, Codex, Cursor, OpenCode).

## Modes

1. **Draft** (notes → final text): stages 1–5 below.
2. **Edit:** load `references/edit.md` on the pasted draft. Minimum effective edit.
3. **Detect:** run `scripts/lint.sh`. Quote hits. No rewrite.
4. **File:** `references/file.md` on an existing path. Backup + code-safe.
5. **Review:** `references/review.md` on a diff.
6. **Chat:** rhythm rules only.

## Draft stages

### Stage 1: Brief

Medium, audience, fact inventory, gaps. Do not invent metrics.

### Stage 2: Draft

Load `references/craft.md` and relevant `medium-routing.md` rows. Rhythm: no staccato, no antithesis pivot, no programmed wobble.

### Stage 3: Isolated edit

For drafts longer than ~300 words, spawn a dedicated editor with `references/edit.md` only.

### Stage 4: Lint

```bash
skills/writing/scripts/lint.sh path/to/draft.md
```

Exit 1: fix the flagged lines (slopless `negation-reframe` and/or `cliche-lint.mjs` pattern ids). Re-run until exit 0. Do not inject slang to dodge the matcher.

Docs-heavy files: `cliche-lint.mjs --off colon-triple,fits-in-your-head`.

### Stage 5: Human sign-off

Exact Markdown in chat. No auto-publish.

## Context tolerance

| Context | Negation | Fragments | Lists | Jargon |
|---|---|---|---|---|
| Technical blog | High | Low | Discrete steps only | latency, idempotency, … |
| System docs & API | High | None | Tables and steps OK | Full vocab |
| ADR / RFC | High | None | Decision records OK | throughput, … |
| Social | High | Conversational | Prefer prose | Domain acronyms OK |
| Chat / email | Moderate | Spoken pacing | Prose default | Colloquialisms OK |

## Never-inject

No fake first-person, no “in an era of…”, no forced contrarianism. Subtractive editing only.
