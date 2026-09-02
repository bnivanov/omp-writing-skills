# omp-writing-skills

> One writing skill for agent harnesses: voice/rhythm, craft rules, minimum-edit de-slop, in-place doc cleanup, review comments, and a deterministic lint gate that includes Simon Willison's LLM cliché detectors.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Upstream: Anbeeld/WRITING.md](https://img.shields.io/badge/upstream-Anbeeld%2FWRITING.md-green)](https://github.com/Anbeeld/WRITING.md)
[![Upstream: petergyang/no-ai-slop](https://img.shields.io/badge/upstream-petergyang%2Fno--ai--slop-green)](https://github.com/petergyang/no-ai-slop)
[![Upstream: berelevant-ai/slopless](https://img.shields.io/badge/linter-berelevant--ai%2Fslopless-green)](https://github.com/berelevant-ai/slopless)
[![Clichés: simonw/tools](https://img.shields.io/badge/clichés-simonw%2Ftools-orange)](https://github.com/simonw/tools/blob/main/llm-cliche-highlighter.html)

---

## Why one skill

Six overlapping skills (`writing-pipeline`, `writing-voice`, `writing`, `no-ai-slop`, `unslop-file`, `unslop-review`) fought over the same draft. v2 is a single skill, `writing`, with modes. Old names still match the description and the installer.

Generic humanizers fail because they swap corporate slop for staccato theatre. This stack does not inject burstiness.

```
┌────────────────────────────────────────────────────────┐
│  1. Rhythm (always on)                                 │
├────────────────────────────────────────────────────────┤
│  2. Craft + medium routing (draft / long-form)         │
├────────────────────────────────────────────────────────┤
│  3. Minimum-edit de-slop, file clean, or review        │
├────────────────────────────────────────────────────────┤
│  4. Lint: slopless AST + Willison cliché detectors     │
└────────────────────────────────────────────────────────┘
```

## Skill

| Skill | Directory | Modes |
|---|---|---|
| **`writing`** | [`skills/writing`](skills/writing) | `draft` `/write` · `edit` (de-slop) · `detect` (highlight, no rewrite) · `file` (in-place docs) · `review` (line-anchored PR comments) · `chat` |

## Install

```bash
git clone https://github.com/bnivanov/omp-writing-skills
cd omp-writing-skills

./install.sh install writing                 # recommended
./install.sh install all                     # same (one skill)
./install.sh                                 # prints help, installs nothing
```

Harness flags:

```bash
./install.sh install writing --claude
./install.sh install writing --codex
./install.sh install writing --cursor
./install.sh install writing --opencode
./install.sh install writing --dest ./my-skills
```

`update --all` refreshes `writing` and **removes** the retired skill directories if they are still on disk.

```bash
./install.sh list
./install.sh update --all
./install.sh uninstall writing
```

## Usage

- **Draft:** `Run the writing skill to draft an article on database compaction.`
- **De-slop:** `Edit this draft with writing in edit mode. Minimum effective edits.`
- **Detect only:** `Audit draft.md for LLM clichés. Do not rewrite.`
- **In-place docs:** `Clean AGENTS.md in place (file mode).`
- **Review:** `Write line-anchored review comments for this diff.`

Lint:

```bash
./skills/writing/scripts/lint.sh path/to/draft.md
./skills/writing/scripts/cliche-lint.mjs --self-test
./skills/writing/scripts/cliche-lint.mjs --list
./skills/writing/scripts/cliche-lint.mjs --off colon-triple draft.md
```

- **Exit 0:** clean
- **Exit 1:** findings (slopless and/or cliché hits)
- **Exit 2:** usage / tool error

`cliche-lint.mjs` ports the 38 detectors from [tools.simonwillison.net/llm-cliche-highlighter](https://tools.simonwillison.net/llm-cliche-highlighter). It is a CLI, not a paste-and-highlight page. Code fences and inline code are masked.

## Docs

- [Architecture](ARCHITECTURE.md)
- [Research landscape](RESEARCH-LANDSCAPE.md)
- [Pipeline workflow](docs/pipeline-workflow.md)
- [Anti-patterns](docs/anti-patterns.md)
- [Cliché catalog](skills/writing/references/cliches.md)
- [Voice calibration](skills/writing/references/voice-calibration-guide.md)

## Credits

- Craft rules: [Anbeeld/WRITING.md](https://github.com/Anbeeld/WRITING.md) (MIT)
- De-slop editor: [petergyang/no-ai-slop](https://github.com/petergyang/no-ai-slop) (MIT)
- AST linter: [berelevant-ai/slopless](https://github.com/berelevant-ai/slopless) (MIT)
- File/review modes: [MohamedAbdallah-14/unslop](https://github.com/MohamedAbdallah-14/unslop) (MIT)
- Cliché detectors: [Simon Willison / simonw/tools](https://github.com/simonw/tools/blob/main/llm-cliche-highlighter.html) (Apache-2.0) — see [NOTICE](NOTICE)
- Orchestration and installer: Bozhidar Ivanov & OMP Contributors (MIT)
