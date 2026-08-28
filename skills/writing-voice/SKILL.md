---
name: writing-voice
description: "Voice calibration and rhythm governor. Enforces natural human cadence: no staccato, no fake antithesis pivots, no programmed sentence-length wobble. Governs cadence across all draft, rewrite, and editing workflows."
license: MIT
metadata:
  version: '1.2.0'
  author: OMP Community
---

# Writing voice & rhythm governor

A rhythm governor and voice calibration layer for AI writing. This skill prevents LLM prose from falling into artificial cadence, theatrical fragments, or formulaic contrast pivots.

When loaded alongside long-form craft rules or de-slop editors, this ruleset takes precedence on rhythm, sentence flow, and natural phrasing.

## Core rhythm rules

1. **No staccato.**
   - Do not use two- or three-word fragments for fake drama (e.g. "X. And Y. And Z.", "Big difference.", "That's it. That's the whole thing.").
   - Do not leave isolated kicker lines at the end of paragraphs.
   - Join closely related thoughts using natural conjunctions (`because`, `but`, `so`, `which`, `that`) or appropriate punctuation (comma, colon, semicolon).

2. **No antithesis pivot.**
   - Do not write formulaic "it's not X, it's Y", "it's not just X, it's Y", "this is not X. It's Y.", or "not because X, but because Y" as synthetic insight.
   - State the true claim directly and positively.
   - If the source author explicitly drafted a genuine clarification contrast, preserve it without expanding or repeating the pattern.

3. **No recipe irregularity.**
   - Do not force "burstiness" by injecting an arbitrary short sentence every 3–4 lines.
   - Do not follow a mathematical sentence-length formula or programmed wobble. Let sentence length reflect the natural complexity and movement of the thought.

4. **Minimum effective edit.**
   - When editing human writing, preserve the existing authorial voice, vocabulary, colloquialisms, and cadence.
   - Fix genuine tells, ambiguities, and slop patterns, then stop. Do not homogenize distinctive writing into generic corporate prose.

5. **Connective tissue over discrete declarations.**
   - A longer, well-constructed sentence that carries cause, contrast, or qualification is superior to a row of choppy, disconnected declarations.

## Precedence & stack integration

When multiple skills are loaded in an agent harness:

```
┌────────────────────────────────────────────────────────┐
│  1. Voice Calibration & Rhythm (writing-voice)         │  <-- Wins on cadence & rhythm
├────────────────────────────────────────────────────────┤
│  2. Long-Form Craft Rules (writing)                    │  <-- Wins on structure & evidence
├────────────────────────────────────────────────────────┤
│  3. Slop Removal & Pattern Cleaner (no-ai-slop)       │  <-- Wins on minimum-edit cleanup
├────────────────────────────────────────────────────────┤
│  4. Deterministic Linter Gate (slopless-lint.sh)       │  <-- Final pass/fail pre-publish gate
└────────────────────────────────────────────────────────┘
```

## Deterministic pre-publish lint

Before publishing or finalizing drafts, run the AST-based linter script:

```bash
./scripts/slopless-lint.sh <draft.md>
```

This verifies that zero `negation-reframe` patterns, stacked fragments, or prohibited brochure tokens slipped into the draft.

## References

- `references/voice-calibration-guide.md`: How to profile an author's authentic voice from raw writing samples.
- `references/skill-landscape.md`: Comprehensive evaluation of public writing skills and why burstiness injectors fail.
