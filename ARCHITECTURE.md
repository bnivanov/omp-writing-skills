# Architecture & design doctrine

`omp-writing-skills` is a modular, agent-agnostic writing framework engineered to eliminate AI writing tells and generic chatbot cadence while preserving authentic human voice and technical precision.

## The core design problem

Most attempts to make LLMs write "human" fail because they approach the problem as a single monolithic prompt or a statistical trick:
1. **Prompt-only "Do Not" lists:** A list of 50 banned words does not give the model a positive model of sentence architecture or paragraph development.
2. **Burstiness injectors:** Forcing random sentence-length oscillation produces disjointed, choppy text with awkward fragments.
3. **Self-grading drafters:** When the same LLM prompt writes and reviews text in the same context turn, it rarely catches its own structural blindspots.

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
│                      3. Minimum-Edit De-Slop Pass                       │
│                          (skills/no-ai-slop)                            │
│   • Surgical pattern removal (petergyang/no-ai-slop v1.0.0)             │
│   • Subagent isolation (editor agent separate from drafter)             │
│   • Preservation of author quirks, humor, and bluntness                 │
├─────────────────────────────────────────────────────────────────────────┤
│                     4. Deterministic AST Lint Gate                      │
│                         (scripts/slopless-lint.sh)                      │
│   • Static AST evaluation via slopless (berelevant-ai/slopless v0.2.36) │
│   • Pre-publish pass/fail gate on negation reframes & stacked fragments │
└─────────────────────────────────────────────────────────────────────────┘
```

## Layer breakdown

### 1. Voice & rhythm layer (`writing-voice`)
The voice layer governs sentence acoustics and cadence. Its primary rules prevent common LLM degradation:
- **No Staccato:** Prohibits isolated fragments manufactured for punchiness.
- **No Antithesis Pivots:** Prohibits faux-insight negation structures (`"It's not X. It's Y."`).
- **No Programmed Wobble:** Disables artificial sentence-length variation algorithms.

### 2. Craft & developmental layer (`writing`)
Vendored from `Anbeeld/WRITING.md` (MIT), this layer provides the deep structural engine:
- **Concrete Anchors:** Requires every claim-bearing paragraph to feature verifiable numbers, named mechanisms, constraints, or direct observations.
- **Fact Discipline:** Prohibits unobservable system behavior claims, invented metrics, or vague authority appeals (`"experts say"`).
- **Medium Routing:** Dynamically adjusts register, structural density, and formatting for specific target media (specs vs. social vs. procedures).

### 3. De-slop & editing layer (`no-ai-slop`)
Vendored from `petergyang/no-ai-slop` (MIT), this layer operates on the **minimum effective edit** principle:
- Detects and removes 20+ recognized AI slop patterns (colon reveals, superficial `-ing` clauses, importance puffery, synonym cycling).
- Does not homogenize rough or distinctive prose into corporate blandness.
- In multi-agent harnesses, runs inside an isolated editor subagent so the drafting model does not evaluate its own output.

### 4. Deterministic linter gate (`slopless`)
Powered by `berelevant-ai/slopless` (MIT), this layer provides non-probabilistic quality enforcement:
- Parses markdown AST to detect structural negation reframes and brochure tokens.
- Returns a hard exit code (`0` for clean, `1` for violations) before any draft can be delivered or published.

## Precedence and conflict resolution

When rules across layers interact, they resolve in this strict order:
1. **Factual truth and safety constraints** (always non-negotiable).
2. **Explicit user brief and medium requirements.**
3. **Rhythm governor (`writing-voice`):** Prevents mechanical staccato or forced pivots.
4. **Developmental rules (`writing`):** Enforces evidence and structure.
5. **Editing rules (`no-ai-slop`):** Strips residual slop.
6. **Linter pass (`slopless`):** Validates deterministic compliance.
