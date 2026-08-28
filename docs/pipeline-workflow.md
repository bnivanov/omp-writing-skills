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
For drafts longer than ~300 words, isolate the editor role:
- Spawn a dedicated subagent with `skills/no-ai-slop/SKILL.md`.
- Task: Apply the **minimum effective edit**.
- The editor scans for:
  - Binary contrasts (`not X, but Y`)
  - Colon reveals (`The reason: it works`)
  - Superficial `-ing` clauses (`highlighting the team's commitment`)
  - Importance puffery (`stands as a testament`)
  - Empty adverbs (`crucially`, `fundamentally`, `simply`)

### Stage 4: Deterministic AST linting
Execute the lint script:

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
