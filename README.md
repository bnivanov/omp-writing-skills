# OMP Writing Skills (`omp-writing-skills`)

> Production-grade, anti-slop AI writing suite for agent harnesses. Combines voice calibration, developmental craft rules, minimum-edit de-slopping, and deterministic AST linting.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Upstream: Anbeeld/WRITING.md](https://img.shields.io/badge/upstream-Anbeeld%2FWRITING.md-green)](https://github.com/Anbeeld/WRITING.md)
[![Upstream: petergyang/no-ai-slop](https://img.shields.io/badge/upstream-petergyang%2Fno--ai--slop-green)](https://github.com/petergyang/no-ai-slop)
[![Upstream: berelevant-ai/slopless](https://img.shields.io/badge/linter-berelevant--ai%2Fslopless-green)](https://github.com/berelevant-ai/slopless)

---

## Core philosophy: why generic humanizers fail

Most AI writing tools either dump 50 banned words into a prompt or attempt to trick AI detectors by artificially forcing choppy, 3-word sentences ("burstiness injection"). Both approaches fail because they replace generic corporate prose with bizarre, staccato theater.

`omp-writing-skills` uses a **4-layer decoupled architecture**:

```
┌────────────────────────────────────────────────────────┐
│  1. Voice Calibration (writing-voice)                  │  <-- Anti-staccato, anti-antithesis
├────────────────────────────────────────────────────────┤
│  2. Long-Form Craft Rules (writing)                    │  <-- Concrete anchors & medium routing
├────────────────────────────────────────────────────────┤
│  3. Minimum-Edit De-Slop (no-ai-slop)                 │  <-- Surgical cliches cleaner
├────────────────────────────────────────────────────────┤
│  4. Deterministic AST Linter (slopless)               │  <-- Non-probabilistic pass/fail gate
└────────────────────────────────────────────────────────┘
```

---

## Skills in this suite

### 1. `writing-pipeline` (orchestrator)
Orchestrates the entire writing workflow: brief scoping, calibrated drafting, subagent editor isolation, deterministic linting, and final human sign-off.
- Path: [`skills/writing-pipeline/SKILL.md`](skills/writing-pipeline/SKILL.md)

### 2. `writing-voice` (rhythm governor & voice calibration)
Enforces natural human cadence. Prohibits dramatic staccato fragments (`"X. And Y. And Z."`), faux-insight antithesis pivots (`"It's not X, it's Y"`), and programmed sentence-length wobble.
- Path: [`skills/writing-voice/SKILL.md`](skills/writing-voice/SKILL.md)
- References: [`skills/writing-voice/references/voice-calibration-guide.md`](skills/writing-voice/references/voice-calibration-guide.md)
- Public landscape: [`skills/writing-voice/references/skill-landscape.md`](skills/writing-voice/references/skill-landscape.md)

### 3. `writing` (long-form craft ruleset)
Vendored from [Anbeeld/WRITING.md](https://github.com/Anbeeld/WRITING.md) (MIT, v1.4.2). Enforces 15 developmental craft rules, concrete anchors, fact discipline, and comprehensive medium routing (from technical specs to social posts).
- Path: [`skills/writing/SKILL.md`](skills/writing/SKILL.md)
- References: [`skills/writing/references/`](skills/writing/references/)

### 4. `no-ai-slop` (surgical de-slop editor & detector)
Vendored from [petergyang/no-ai-slop](https://github.com/petergyang/no-ai-slop) (MIT, v1.0.0). Performs minimum effective edits to remove colon reveals, superficial `-ing` clauses, importance puffery, and corporate fluff without destroying the author's personality.
- Path: [`skills/no-ai-slop/SKILL.md`](skills/no-ai-slop/SKILL.md)
- Eval suite: [`skills/no-ai-slop/eval.md`](skills/no-ai-slop/eval.md)

### 5. `slopless-lint.sh` (deterministic pre-publish gate)
Powered by [berelevant-ai/slopless](https://github.com/berelevant-ai/slopless) (MIT). Parses Markdown AST to catch structural AI patterns (`negation-reframe`, stacked fragments) before publication.
- Path: [`skills/writing-voice/scripts/slopless-lint.sh`](skills/writing-voice/scripts/slopless-lint.sh)

---

## Installation

### For Oh My Pi (OMP)
Copy the skills into your OMP skills directory:

```bash
mkdir -p ~/.omp/agent/skills
cp -r skills/* ~/.omp/agent/skills/

# Install the deterministic linter gate dependencies
cd ~/.omp/agent/skills/writing-voice/scripts && npm install --omit=dev
```

### For Claude Code / Codex / Cursor / OpenCode
Copy any individual skill directory (e.g. `skills/writing`, `skills/no-ai-slop`, `skills/writing-voice`) to your global skills folder:

```bash
# Claude Code
cp -r skills/writing ~/.claude/skills/

# Codex
cp -r skills/writing ~/.codex/skills/

# Cursor
cp -r skills/writing ~/.cursor/skills/

# OpenCode
cp -r skills/writing ~/.config/opencode/skills/
```

---

## Quick usage

### Full pipeline run
In your agent session:
```text
Run the writing-pipeline skill to draft an article on database compaction techniques.
```

### De-slop an existing draft
```text
Run no-ai-slop on my draft in docs/rfc.md with minimum effective edits.
```

### Audit for AI tells (detection mode)
```text
Run no-ai-slop in detect mode on draft.md. Do not rewrite.
```

### Pre-publish lint
```bash
./skills/writing-voice/scripts/slopless-lint.sh draft.md
```

---

## Research & documentation

- [Architecture & design doctrine](ARCHITECTURE.md)
- [Research landscape & genesis](RESEARCH-LANDSCAPE.md)
- [Pipeline workflow guide](docs/pipeline-workflow.md)
- [Anti-patterns & pitfalls](docs/anti-patterns.md)

---

## Upstream credits & licenses

- **`writing` ruleset:** Created by [Anbeeld](https://github.com/Anbeeld/WRITING.md) (MIT License).
- **`no-ai-slop` skill:** Created by [Peter Yang](https://github.com/petergyang/no-ai-slop) (MIT License).
- **`slopless` linter:** Created by [berelevant-ai](https://github.com/berelevant-ai/slopless) (MIT License).
- Orchestration, voice calibration governor, research landscape, and integration by Bozhidar Ivanov & OMP Contributors (MIT License).
