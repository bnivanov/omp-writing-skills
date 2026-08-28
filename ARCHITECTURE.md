# Architecture & design doctrine

`omp-writing-skills` is a modular, agent-agnostic writing framework engineered to eliminate AI writing tells and generic chatbot cadence while preserving authentic human voice and technical precision.

## The core design problem

Most attempts to make LLMs write "human" fail because they approach the problem as a single monolithic prompt or a statistical trick:
1. **Prompt-only "Do Not" lists:** A list of 50 banned words does not give the model a positive model of sentence architecture or paragraph development.
2. **Burstiness injectors:** Forcing random sentence-length oscillation produces disjointed, choppy text with awkward fragments.
3. **Self-grading drafters:** When the same LLM prompt writes and reviews text in the same context turn, it rarely catches its own structural blindspots.
4. **Editor over-reach:** Poorly constrained editing prompts fabricate author stance, inject artificial slang, or flatten natural rough edges.

---

## System architecture

`omp-writing-skills` solves this through a 4-tier separation of concerns:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           1. Voice & Rhythm                             │
│                         (skills/writing-voice)                          │
│   • Anti-staccato governor                                              │
│   • Anti-antithesis pivot rule ("not X, but Y")                         │
│   • Natural connective syntax & clause coordination                     │
├─────────────────────────────────────────────────────────────────────────┤
│                         2. Long-Form Craft Rules                        │
│                            (skills/writing)                             │
│   • 15 Developmental craft rules (Anbeeld/WRITING.md v1.4.2)            │
│   • Medium routing (Technical docs, essays, social, PRs, UI)            │
│   • Concrete evidence anchors & factual verification                    │
├─────────────────────────────────────────────────────────────────────────┤
│                   3. Specialized Editing & Review Tools                 │
│                      (skills/no-ai-slop, unslop-file, unslop-review)     │
│   • Surgical pattern removal (petergyang/no-ai-slop v1.0.0)             │
│   • In-place doc cleaner with code immutability (unslop-file)           │
│   • Line-anchored concise PR comments (unslop-review)                   │
│   • Subagent isolation (editor agent separate from drafter)             │
│   • Never-Inject provenance guardrails                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                     4. Deterministic AST Lint Gate                      │
│                         (scripts/slopless-lint.sh)                      │
│   • Static AST evaluation via slopless (berelevant-ai/slopless v0.2.36) │
│   • Pre-publish pass/fail gate on negation reframes & stacked fragments │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Layer breakdown

### 1. Voice & rhythm layer (`writing-voice`)
The voice layer governs sentence acoustics and cadence. Its primary rules prevent common LLM degradation:
- **No Staccato:** Prohibits isolated fragments manufactured for punchiness.
- **No Antithesis Pivots:** Prohibits faux-insight negation structures (`"It's not X. It's Y."`, split-sentence negation, multi-negation countdowns).
- **No Programmed Wobble:** Disables artificial sentence-length variation algorithms.

### 2. Craft & developmental layer (`writing`)
Vendored from `Anbeeld/WRITING.md` (MIT), this layer provides the deep structural engine:
- **Concrete Anchors:** Requires every claim-bearing paragraph to feature verifiable numbers, named mechanisms, constraints, or direct observations.
- **Fact Discipline:** Prohibits unobservable system behavior claims, invented metrics, or vague authority appeals (`"experts say"`).
- **Medium Routing:** Dynamically adjusts register, structural density, and formatting for specific target media (specs vs. social vs. procedures).

### 3. De-slop, transformation & review layer

#### A. Minimum-edit cleaner (`no-ai-slop`)
Vendored from `petergyang/no-ai-slop` (MIT), this layer operates on the **minimum effective edit** principle:
- Detects and removes 20+ recognized AI slop patterns (colon reveals, superficial `-ing` clauses, importance puffery, synonym cycling).
- Does not homogenize rough or distinctive prose into corporate blandness.
- In multi-agent harnesses, runs inside an isolated editor subagent so the drafting model does not evaluate its own output.
- **Never-Inject Rule:** Strictly prohibits injecting unprompted personal anecdotes, artificial stakes, or forced contrarianism.

#### B. In-place documentation & memory cleaner (`unslop-file`)
Adapted from `MohamedAbdallah-14/unslop` (MIT), this tool enables safe in-place de-slopping:
- **Preservation Contract:** Guarantees that fenced code blocks, inline code, URLs, paths, commands, and headings remain 100% byte-for-byte untouched.
- Automatically writes `FILE.original.md` backups before in-place modifications.
- Strips negative-parallelism tricolons (`"No X, no Y, no Z"`).

#### C. Direct code reviewer (`unslop-review`)
Adapted from `MohamedAbdallah-14/unslop` (MIT), this tool generates human teammate code reviews:
- Enforces strict line-anchored formatting: `L<line>: <severity> <observation>. <fix>.`
- Uses explicit severity tags (`bug:`, `risk:`, `nit:`, `q:`).
- Strips corporate throat-clearing and performative polite padding.
### 4. Deterministic linter gate (`slopless`)
Powered by `berelevant-ai/slopless` (MIT), this layer provides non-probabilistic quality enforcement:
- Parses markdown AST to detect structural negation reframes and brochure tokens.
- Returns a hard exit code (`0` for clean, `1` for violations) before any draft can be delivered or published.

---

## MECE dispatching matrix

To prevent overlap and conflicting tool behavior, each task routes to exactly one primary owner:

| Task / Request Type | Input Form | Primary Skill | Execution & Preservation Contract |
|---|---|---|---|
| **In-place file de-slopping** | Existing file path (`CLAUDE.md`, docs, README) | `unslop-file` | Creates `FILE.original.md` backup; strictly preserves code blocks, frontmatter, directives, tables, and paths byte-for-byte; modifies file in-place. |
| **Draft text cleanup & tell detection** | Pasted draft snippet or chat text | `no-ai-slop` | Returns edited text + `What changed` or detect mode report; does not touch files on disk. |
| **PR / Code review feedback** | Git patch, PR diff, or review comment | `unslop-review` | Generates line-anchored comments (`L<line>: <severity> ...`); defers to harness review schema when present. |
| **End-to-end content drafting** | Topic, bullet notes, or brief | `writing-pipeline` | Executes 5-stage pipeline: Fact Brief $\rightarrow$ Voice Draft $\rightarrow$ Subagent Audit $\rightarrow$ AST Lint $\rightarrow$ Approval. |
| **Voice & rhythm enforcement** | Any conversational or user-facing prose | `writing-voice` | Enforces natural compound syntax, eliminates staccato fragments and rhetorical negation. |
| **Long-form developmental craft** | Essays, articles, formal technical specs | `writing` | Applies 15 craft rules, concrete anchors, and medium routing across formal genres. |

---

## Precedence and conflict resolution

When multiple skills interact, rules resolve in this strict order:
1. **Truth, safety, and platform constraints** (always non-negotiable).
2. **Explicit user instructions & harness output schemas** (e.g. structured JSON review formats take precedence over plain-text review conventions).
3. **Substrate preservation contract (`unslop-file`):** Immutable code blocks, frontmatter, directives, and technical identifiers win over all stylistic changes.
4. **Rhythm governor (`writing-voice`):** Prevents mechanical staccato or forced pivots across all drafted text.
5. **Developmental craft rules (`writing`):** Enforces concrete anchors and medium-specific routing.
6. **Stylistic de-slopping (`no-ai-slop` / `unslop-file`):** Strips residual slop under the minimum effective edit rule.
7. **Deterministic AST linter pass (`slopless`):** Validates deterministic compliance with a hard exit code.
