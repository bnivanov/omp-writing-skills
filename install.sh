#!/usr/bin/env bash
# Install the writing skill into ~/.omp/agent/skills (or Claude Code, Codex, Cursor, OpenCode).
# Bare invocation prints help and installs nothing.
#
#   ./install.sh install writing            install the skill + linter deps
#   ./install.sh install all                same (one skill in this repo)
#   ./install.sh update                     refresh if already installed
#   ./install.sh update --all               install or refresh, and remove retired skill dirs
#   ./install.sh list                       show install status
#   ./install.sh uninstall writing          remove the skill
#
# Target harnesses:
#   --omp         install to ~/.omp/agent/skills (default)
#   --claude      install to ~/.claude/skills
#   --codex       install to ~/.codex/skills
#   --cursor      install to ~/.cursor/skills
#   --opencode    install to ~/.config/opencode/skills
#   --dest <dir>  install to custom destination directory
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEFAULT_DEST="${HOME}/.omp/agent/skills"
DEST_DIR="$DEFAULT_DEST"

ALL_SKILLS=(writing)
RETIRED_SKILLS=(writing-pipeline writing-voice no-ai-slop unslop-file unslop-review)
# Old names still accepted on the CLI; they install `writing`.
ALIASES=(writing-pipeline writing-voice no-ai-slop unslop-file unslop-review)

CMD=""
UPDATE_ALL=0
SELECTED=()
TOUCHED=()

usage() {
  cat <<'EOF'
Usage:
  ./install.sh install writing|all      install the writing skill
  ./install.sh writing|all              legacy form — same as install
  ./install.sh update                   refresh if already installed
  ./install.sh update --all             refresh/add writing and remove retired skill dirs
  ./install.sh list                     show install status
  ./install.sh uninstall writing        remove the writing skill
  ./install.sh -h|--help                show this help

Skill:
  writing            skills/writing/  — draft, edit, detect, file-clean, review, lint
  all                same (this repo ships one skill)

Retired names (install writing, then remove the old dirs):
  writing-pipeline, writing-voice, no-ai-slop, unslop-file, unslop-review

Target harness flags (defaults to Oh My Pi):
  --omp              ~/.omp/agent/skills (default)
  --claude           ~/.claude/skills
  --codex            ~/.codex/skills
  --cursor           ~/.cursor/skills
  --opencode         ~/.config/opencode/skills
  --dest <dir>       custom destination directory

With no arguments this prints the help and installs nothing.
EOF
}

canonical_skill() {
  local s="$1" a
  if [[ "$s" == "writing" ]]; then
    echo "writing"
    return 0
  fi
  for a in "${ALIASES[@]}"; do
    if [[ "$s" == "$a" ]]; then
      echo "writing"
      return 0
    fi
  done
  return 1
}

is_known_skill() {
  canonical_skill "$1" >/dev/null
}

dest_skill_path() {
  echo "$DEST_DIR/$1"
}

repo_skill_path() {
  echo "$ROOT/skills/$1"
}

wants() {
  local needle="$1" s
  for s in "${TOUCHED[@]+"${TOUCHED[@]}"}"; do
    [[ "$s" == "$needle" ]] && return 0
  done
  return 1
}

mark_touched() {
  local s="$1" u seen=0
  for u in "${TOUCHED[@]+"${TOUCHED[@]}"}"; do
    [[ "$u" == "$s" ]] && seen=1 && break
  done
  [[ "$seen" -eq 0 ]] && TOUCHED+=("$s")
}

dirs_equal() {
  local d1="$1" d2="$2"
  if [[ ! -d "$d1" || ! -d "$d2" ]]; then
    return 1
  fi
  diff -rq -x 'node_modules' -x '.DS_Store' -x 'package-lock.json' "$d1" "$d2" >/dev/null 2>&1
}

copy_skill() {
  local name="$1"
  local verb_new="${2:-Installed}"
  local src dst
  src="$(repo_skill_path "$name")"
  dst="$(dest_skill_path "$name")"

  if [[ ! -d "$src" ]]; then
    echo "error: skills/$name not found in this repo" >&2
    exit 1
  fi

  mkdir -p "$DEST_DIR"

  if [[ -d "$dst" ]]; then
    if dirs_equal "$src" "$dst"; then
      echo "Unchanged skills/$name -> $dst"
      mark_touched "$name"
      return 0
    fi
    cp -R "$src/"* "$dst/"
    echo "Updated skills/$name -> $dst"
    mark_touched "$name"
    return 0
  fi

  mkdir -p "$dst"
  cp -R "$src/"* "$dst/"
  echo "${verb_new} skills/$name -> $dst"
  mark_touched "$name"
}

remove_retired_skills() {
  local name dst
  for name in "${RETIRED_SKILLS[@]}"; do
    dst="$(dest_skill_path "$name")"
    if [[ -d "$dst" ]]; then
      rm -rf "$dst"
      echo "Removed retired skill $name from $DEST_DIR (folded into writing)"
    fi
  done
}

setup_linter_deps() {
  local linter_scripts_dir="$DEST_DIR/writing/scripts"
  if [[ -d "$linter_scripts_dir" && -f "$linter_scripts_dir/package.json" ]]; then
    if command -v npm >/dev/null 2>&1; then
      echo "Setting up deterministic linter (slopless) in $linter_scripts_dir..."
      (cd "$linter_scripts_dir" && npm install --omit=dev --silent)
      echo "Linter ready."
    else
      echo "warning: npm not found in PATH. Install node/npm to run scripts/lint.sh" >&2
    fi
  fi
}

cmd_list() {
  local name src dst status retired
  printf '%-20s %-32s %s\n' "SKILL" "DESTINATION" "STATUS"
  printf '%-20s %-32s %s\n' "-----" "-----------" "------"
  for name in "${ALL_SKILLS[@]}"; do
    src="$(repo_skill_path "$name")"
    dst="$(dest_skill_path "$name")"
    if [[ ! -d "$dst" ]]; then
      status="not installed"
    elif dirs_equal "$src" "$dst"; then
      status="installed (up to date)"
    else
      status="installed (outdated)"
    fi
    printf '%-20s %-32s %s\n' "$name" "$dst" "$status"
  done
  for retired in "${RETIRED_SKILLS[@]}"; do
    dst="$(dest_skill_path "$retired")"
    if [[ -d "$dst" ]]; then
      printf '%-20s %-32s %s\n' "$retired" "$dst" "retired (run update --all to remove)"
    fi
  done
}

cmd_uninstall() {
  local name dst any=0
  if [[ "${#SELECTED[@]}" -eq 0 ]]; then
    echo "error: uninstall requires at least one skill name" >&2
    usage >&2
    exit 1
  fi
  for name in "${SELECTED[@]}"; do
    dst="$(dest_skill_path "$name")"
    if [[ ! -d "$dst" ]]; then
      echo "error: $name is not installed ($dst)" >&2
      exit 1
    fi
    rm -rf "$dst"
    echo "Uninstalled $name from $DEST_DIR"
    any=1
  done
  [[ "$any" -eq 1 ]]
}

cmd_install() {
  local name
  if [[ "${#SELECTED[@]}" -eq 0 ]]; then
    echo "error: install requires writing or all" >&2
    usage >&2
    exit 1
  fi
  for name in "${SELECTED[@]}"; do
    copy_skill "$name" "Installed"
  done
  remove_retired_skills
  setup_linter_deps
}

cmd_update() {
  local name installed=()
  if [[ "$UPDATE_ALL" -eq 1 ]]; then
    for name in "${ALL_SKILLS[@]}"; do
      if [[ -d "$(dest_skill_path "$name")" ]]; then
        copy_skill "$name" "Updated"
      else
        copy_skill "$name" "Added"
      fi
    done
    remove_retired_skills
    setup_linter_deps
    return 0
  fi

  if [[ "${#SELECTED[@]}" -gt 0 ]]; then
    for name in "${SELECTED[@]}"; do
      if [[ ! -d "$(dest_skill_path "$name")" ]]; then
        echo "error: $name is not installed — use 'install $name' to add it" >&2
        exit 1
      fi
      copy_skill "$name" "Updated"
    done
    setup_linter_deps
    return 0
  fi

  for name in "${ALL_SKILLS[@]}"; do
    if [[ -d "$(dest_skill_path "$name")" ]]; then
      installed+=("$name")
    fi
  done

  if [[ "${#installed[@]}" -eq 0 ]]; then
    echo "nothing installed yet in $DEST_DIR — use 'install writing' or 'install all'"
    exit 0
  fi

  for name in "${installed[@]}"; do
    copy_skill "$name" "Updated"
  done
  setup_linter_deps
}

print_epilogue() {
  local action_label="$1"
  if [[ "${#TOUCHED[@]}" -eq 0 ]]; then
    return 0
  fi
  echo
  echo "${action_label}."
  echo "  Load in chat:  writing   (also matches /write, no-ai-slop, unslop-file, …)"
  echo "  Lint a draft:"
  echo "       $DEST_DIR/writing/scripts/lint.sh draft.md"
  echo
  echo "Documentation: README.md, ARCHITECTURE.md, RESEARCH-LANDSCAPE.md"
}

if [[ "$#" -eq 0 ]]; then
  usage
  exit 0
fi

while [[ "$#" -gt 0 ]]; do
  case "$1" in
    -h|--help)
      usage
      exit 0
      ;;
    --omp)
      DEST_DIR="${HOME}/.omp/agent/skills"
      shift
      ;;
    --claude)
      DEST_DIR="${HOME}/.claude/skills"
      shift
      ;;
    --codex)
      DEST_DIR="${HOME}/.codex/skills"
      shift
      ;;
    --cursor)
      DEST_DIR="${HOME}/.cursor/skills"
      shift
      ;;
    --opencode)
      DEST_DIR="${HOME}/.config/opencode/skills"
      shift
      ;;
    --dest)
      if [[ "$#" -lt 2 ]]; then
        echo "error: --dest requires a directory" >&2
        exit 1
      fi
      DEST_DIR="$2"
      shift 2
      ;;
    --all)
      UPDATE_ALL=1
      shift
      ;;
    install|update|list|uninstall)
      if [[ -n "$CMD" ]]; then
        echo "error: multiple commands" >&2
        exit 1
      fi
      CMD="$1"
      shift
      ;;
    all)
      SELECTED=("${ALL_SKILLS[@]}")
      shift
      ;;
    *)
      if canonical_skill "$1" >/dev/null; then
        SELECTED+=("$(canonical_skill "$1")")
        if [[ "$1" != "writing" ]]; then
          echo "note: $1 is now the writing skill" >&2
        fi
        shift
      else
        echo "error: unknown argument: $1" >&2
        usage >&2
        exit 1
      fi
      ;;
  esac
done

if [[ -z "$CMD" ]]; then
  CMD="install"
fi

case "$CMD" in
  list)
    cmd_list
    ;;
  uninstall)
    cmd_uninstall
    ;;
  install)
    cmd_install
    print_epilogue "Installed"
    ;;
  update)
    cmd_update
    print_epilogue "Updated"
    ;;
  *)
    echo "error: unknown command: $CMD" >&2
    exit 1
    ;;
esac
