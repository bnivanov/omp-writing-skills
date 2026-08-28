# omp-writing-skills

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

| Skill | Directory | What it does | Upstream / Engine |
|---|---|---|---|
| **`writing-pipeline`** | [`skills/writing-pipeline`](skills/writing-pipeline) | End-to-end orchestrator: brief scoping $\rightarrow$ voice drafting $\rightarrow$ subagent-isolated de-slop $\rightarrow$ AST lint gate $\rightarrow$ human approval. | OMP / Multi-Stage Workflow |
| **`writing-voice`** | [`skills/writing-voice`](skills/writing-voice) | Rhythm governor: enforces natural human cadence, bans staccato fragments (`"X. And Y. And Z."`), faux-insight pivots (`"not X, but Y"`), and programmed wobble. Includes deterministic pre-publish linter script. | OMP Voice Framework & [`slopless`](https://github.com/berelevant-ai/slopless) |
| **`writing`** | [`skills/writing`](skills/writing) | 15 developmental craft rules, concrete anchors, fact discipline, and medium routing across technical specs, docs, essays, and social. | [`Anbeeld/WRITING.md`](https://github.com/Anbeeld/WRITING.md) (MIT, v1.4.2) |
| **`no-ai-slop`** | [`skills/no-ai-slop`](skills/no-ai-slop) | Surgical minimum-effective-edit cleaner targeting 20+ specific AI slop patterns (colon reveals, superficial `-ing` clauses, puffery) without flattening author personality. | [`petergyang/no-ai-slop`](https://github.com/petergyang/no-ai-slop) (MIT, v1.0.0) |

---

## Install

Clone the repository and run the interactive installer:

```bash
git clone https://github.com/bnivanov/omp-writing-skills
cd omp-writing-skills

./install.sh install all                     # install all skills + setup linter (recommended)
./install.sh install writing-pipeline        # install orchestrator only
./install.sh install no-ai-slop writing      # install specific skills
./install.sh                                 # prints help, installs nothing
```

### Target different agent harnesses

By default, `./install.sh` installs to `~/.omp/agent/skills` (Oh My Pi). You can target other coding agents with harness flags:

```bash
./install.sh install all --claude            # install to ~/.claude/skills (Claude Code)
./install.sh install all --codex             # install to ~/.codex/skills (Codex)
./install.sh install all --cursor            # install to ~/.cursor/skills (Cursor)
./install.sh install all --opencode          # install to ~/.config/opencode/skills (OpenCode)
./install.sh install all --dest ./my-skills  # install to custom directory
```

### Keeping skills current

Skill directories are **copied**, not symlinked, so a `git pull` does not automatically overwrite what your agent loads. Use `update` to keep installed skills refreshed:

```bash
./install.sh list                            # show install status: not installed / installed (up to date) / installed (outdated)
./install.sh update                          # refresh ONLY the skills already installed in your destination
./install.sh update writing                  # refresh one specific skill
./install.sh update --all                    # refresh installed skills AND add any missing repo skills
./install.sh uninstall no-ai-slop            # remove a skill from destination
```

`list` compares file contents, not timestamps, so `outdated` means the files actually differ.

---

## Quick usage

### In chat (human requests)

Just ask in chat — the agent loads the relevant skill on demand:

- **Draft a technical article:**
  ```text
  "Run the writing-pipeline skill to draft an article on database compaction techniques."
  ```
- **Clean up an existing draft (minimum-edit de-slop):**
  ```text
  "Run no-ai-slop on docs/architecture.md with minimum effective edits."
  ```
- **Audit a draft for AI tells without rewriting:**
  ```text
  "Run no-ai-slop in detect mode on draft.md. Do not rewrite, quote the lines."
  ```
- **Calibrate personal voice & rhythm:**
  ```text
  "Apply the writing-voice rules to make sure this reply avoids staccato and antithesis pivots."
  ```

### Pre-publish AST lint gate

Run the deterministic AST linter on any Markdown file before publishing:

```bash
./skills/writing-voice/scripts/slopless-lint.sh path/to/draft.md
```

- **Exit code `0`:** Clean (no negation reframes, no stacked fragments, clean syntax).
- **Exit code `1`:** Findings reported with line and column numbers.

---

## Architecture & documentation

- [Architecture & design doctrine](ARCHITECTURE.md) — Comprehensive breakdown of the 4-layer stack, precedence, and subagent isolation.
- [Research landscape & genesis](RESEARCH-LANDSCAPE.md) — Benchmark evaluation of public writing tools (`blader/humanizer`, `harshaneel/humanize`, `slopless`, etc.) and why burstiness injectors fail.
- [Pipeline workflow guide](docs/pipeline-workflow.md) — Stage-by-stage instructions for running multi-agent drafting pipelines.
- [Anti-patterns & pitfalls](docs/anti-patterns.md) — Detailed catalog of 6 core AI writing failure modes and their fixes.
- [Voice calibration guide](skills/writing-voice/references/voice-calibration-guide.md) — How to extract an authentic author profile across 6 linguistic dimensions without baking in personal data.

---

## Upstream credits & licenses

- **`writing` ruleset:** Created by [Anbeeld](https://github.com/Anbeeld/WRITING.md) (MIT License).
- **`no-ai-slop` skill:** Created by [Peter Yang](https://github.com/petergyang/no-ai-slop) (MIT License).
- **`slopless` linter:** Created by [berelevant-ai](https://github.com/berelevant-ai/slopless) (MIT License).
- Orchestration, voice calibration governor, installer, research landscape, and integration by Bozhidar Ivanov & OMP Contributors (MIT License).
