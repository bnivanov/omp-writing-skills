---
name: writing-pipeline
description: "End-to-end writing pipeline for AI agents: brief, draft in calibrated voice, minimum-edit de-slop with subagent isolation, deterministic AST linting, and final human sign-off."
license: MIT
metadata:
  version: '1.2.0'
  author: OMP Community
---

# Writing pipeline orchestrator

The operational orchestrator for producing human-grade prose within AI coding and agent harnesses. This skill sequences voice calibration, long-form craft rules, isolated minimum-edit de-slopping, and deterministic linting.

## Stack architecture

| Stage | Component | Role |
|---|---|---|
| **1. Voice & Rhythm** | `writing-voice` | Calibrates author tone, enforces anti-staccato and anti-antithesis rhythm rules. |
| **2. Long-Form Craft** | `writing` | Applies 15 core developmental craft rules, medium routing, and concrete anchor checks. |
| **3. De-Slop Pass** | `no-ai-slop` | Runs minimal effective edits to strip AI clichés without flattening distinctive voice. |
| **4. Lint Gate** | `slopless-lint.sh` | Deterministic AST-based validator for negation reframes and syntax tells. |
| **5. Human-in-the-Loop** | Approval Step | Presents the exact copy-pasteable draft for final user confirmation. |

```
               ┌────────────────────────┐
               │    1. Brief / Input    │
               └───────────┬────────────┘
                           │
                           ▼
               ┌────────────────────────┐
               │   2. Calibrated Draft  │ ◄── [writing-voice + writing]
               └───────────┬────────────┘
                           │ (isolated subagent)
                           ▼
               ┌────────────────────────┐
               │   3. De-Slop Pass      │ ◄── [no-ai-slop]
               └───────────┬────────────┘
                           │
                           ▼
               ┌────────────────────────┐
               │   4. Slopless Lint     │ ◄── [slopless AST gate]
               └───────────┬────────────┘
                           │ (Exit 0)
                           ▼
               ┌────────────────────────┐
               │  5. Human Final Review │
               └────────────────────────┘
```

## Step-by-step pipeline

### 1. Brief & fact inventory
- Identify the target medium (technical post, documentation, essay, social thread, report).
- Inventory supplied facts, architecture decisions, benchmarks, and quotes.
- **Rule:** If critical facts are missing, ask or write around the gap. Do not fabricate metrics, milestones, or benchmarks.

### 2. Draft with voice calibration
- Load `skill://writing-voice` and `skill://writing`.
- Draft prose tailored to the medium using concrete evidence anchors.
- Apply the core rhythm doctrine:
  - No two-word dramatic fragments (`X. And Y. And Z.`).
  - No fake antithesis pivots (`It's not X, it's Y`).
  - No programmed sentence-length wobble.
  - Connect ideas with real conjunctions (`because`, `although`, `so`, `which`).

### 3. Editor subagent isolation (De-slop pass)
- To prevent drafter self-evaluation bias, spawn a separate editor subagent for drafts exceeding ~300 words.
- The editor applies `skill://no-ai-slop` using the **minimum effective edit** principle:
  - Cut filler words and superficial `-ing` analysis clauses.
  - Remove colon reveals and importance puffery.
  - Leave strong sentences and unique authorial phrasing intact.

### 4. Deterministic AST lint gate
Run the deterministic linter across the draft file:

```bash
skills/writing-voice/scripts/slopless-lint.sh <draft.md>
```

- If findings occur (e.g. `negation-reframe` or prohibited brochure tokens), repair the specific lines and re-lint.
- **Rule:** Do not inject fake slang or typos to bypass the linter.

### 5. Final review & delivery
Present the complete, verbatim draft in chat with:
1. The exact copy-pasteable Markdown text.
2. A brief summary of medium and verified facts.
3. A direct prompt asking the user for approval or edits.

**Rule:** Never auto-publish to external platforms (GitHub, X, LinkedIn, blogs) without explicit user sign-off on the exact text.
