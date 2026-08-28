# Pipeline workflow guide

Detailed guide for running the end-to-end writing pipeline across agent harnesses (Oh My Pi, Claude Code, Codex, Cursor, OpenCode).

## Pipeline stages

### Stage 1: Briefing & fact inventory
Before any drafting begins, collect and verify:
1. **Target medium:** (e.g. Technical blog, Architectural Decision Record, LinkedIn post, X post, Documentation).
2. **Target audience & reader need:** What must the reader understand, decide, or execute?
3. **Fact inventory:** Numbers, names, commit hashes, latency metrics, pricing tiers, observed logs.
4. **Non-goals & gaps:** Explicitly note unverified facts. If a fact cannot be verified, write around it or flag it with a placeholder.

### Stage 2: Drafting with voice & craft rules
Load `writing-voice` and `writing`.

Key drafting directives:
- **Lead with substance:** Start where the answer starts.
- **Anchor paragraphs:** Every claim-bearing paragraph must contain a verifiable mechanism, metric, or observed consequence.
- **Rhythm control:** Ensure sentences flow naturally with real causal conjunctions (`because`, `although`, `when`, `if`, `so`). Zero staccato fragments.

### Stage 3: Subagent isolation (de-slop pass)
For drafts longer than ~300 words, isolate the editor role to eliminate self-grading bias:
- Spawn a dedicated editor subagent with `skills/no-ai-slop/SKILL.md`.
- Task: Apply the **minimum effective edit**.
- The editor scans for:
  - Binary contrasts (`not X, but Y`, split-sentence negations, multi-negation countdowns)
  - Colon reveals (`The reason: it works`)
  - Superficial `-ing` clauses (`highlighting the team's commitment`)
  - Importance puffery (`stands as a testament`)
  - Empty adverbs (`crucially`, `fundamentally`, `simply`)

### Stage 4: Deterministic AST linting
Execute the deterministic lint script:

```bash
skills/writing-voice/scripts/slopless-lint.sh path/to/draft.md
```

If the script returns exit code `1`:
- Inspect flagged lines (e.g. `negation-reframe` violations).
- Rewrite into direct, positive claims.
- Re-run until the script exits with code `0`.

### Stage 5: Human sign-off
- Present the exact, complete Markdown in chat.
- Ask the user for approval or edits.
- Never auto-publish to external channels without explicit approval.

---

## Operational modes & MECE dispatching

Choose the operational flow matching your input:

1. **Full content creation (Notes $\rightarrow$ Final Draft):** Run `writing-pipeline` (Stages 1–5).
2. **Pasted text cleanup / Tell detection:** Load `no-ai-slop` on the provided text snippet.
3. **In-place memory/doc cleanup (`CLAUDE.md`, README):** Run `unslop-file` on the target file path (preserves code blocks and creates `.original.md` backup).
4. **PR / Code review feedback:** Run `unslop-review` on diffs or patches for line-anchored comments.
5. **Conversational voice guard:** Load `writing-voice` for user-facing chat answers.
---

## Context tolerance matrix

Strictness levels adjust across mediums to ensure high readability without breaking standard domain norms:

| Context Profile | Negation Strictness | Fragment Tolerance | Bullet / List Policy | Technical Jargon Carve-outs |
|---|---|---|---|---|
| **Technical Blog** | High (ban all rhetorical negation) | Low (full syntax required) | Moderate (only for discrete steps) | Allowed (e.g., *latency*, *idempotency*, *cache invalidation*) |
| **System Docs & API** | High (direct imperative instructions) | Strict (no fragments) | High (structured parameter tables & steps) | Full technical vocabulary preserved |
| **Executive / ADR / RFC**| High (ban marketing pivots) | Strict (zero staccato) | Moderate (decision records, pros/cons) | Standard architectural terms (*resilience*, *throughput*) |
| **Social / Short Post** | High (ban generic "It's not X" hooks) | Low (conversational cadence) | Low (prefer flowing narrative blocks) | Domain-specific acronyms permitted |
| **Casual Chat / Email** | Moderate (natural spoken syntax) | Moderate (natural spoken pacing) | Low (prose by default) | Informal colloquialisms allowed |

---

## The "Never-inject" editor guardrails

When editing or humanizing content, the editor must adhere to strict provenance rules:
1. **Never inject fake first-person:** Do not add `"I think"`, `"In my experience"`, or personal anecdotes unless present in the author's original draft.
2. **Never inject artificial stakes:** Avoid opening with `"In an era of relentless disruption..."` or `"Now more than ever..."`.
3. **Never inject forced contrarianism:** Do not fabricate disagreement or dramatize routine engineering choices.
4. **Subtraction over decoration:** Sharpen claims, delete filler words, and clarify syntax. Never "add soul" by inserting slang or superficial idiosyncrasies.
