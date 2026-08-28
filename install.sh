#!/usr/bin/env bash
# Install omp-writing-skills into ~/.omp/agent/skills (or Claude Code, Codex, Cursor, OpenCode).
# You pick which skills to install; bare invocation prints help and installs nothing.
#
#   ./install.sh install writing-pipeline   install writing-pipeline only
#   ./install.sh install all                install all skills and install slopless linter
#   ./install.sh update                     refresh only skills already installed
#   ./install.sh update --all               converge destination to the full repo set
#   ./install.sh list                       show install status for every repo skill
#   ./install.sh uninstall no-ai-slop       remove a previously installed skill
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

ALL_SKILLS=(writing-pipeline writing writing-voice no-ai-slop unslop-file unslop-review)

CMD=""
UPDATE_ALL=0
SELECTED=()
TOUCHED=()

usage() {
  cat <<'EOF'
Usage:
  ./install.sh install <skill>...|all   install selected skills (or every skill)
  ./install.sh <skill>...|all           legacy form — same as install
  ./install.sh update [skill...]        refresh only skills already present in destination
  ./install.sh update --all             refresh installed skills and add any missing repo skills
  ./install.sh list                     show every repo skill and whether it is installed / outdated
  ./install.sh uninstall <skill>...     remove named skills from the destination
  ./install.sh -h|--help                show this help

Skills (pick one or more):
  writing-pipeline   writing-pipeline/  — end-to-end multi-stage drafting & editing orchestrator
  writing            writing/           — 15 developmental craft rules, concrete anchors, medium routing
  writing-voice      writing-voice/     — cadence governor (anti-staccato, anti-antithesis) & linter gate
  no-ai-slop         no-ai-slop/        — surgical minimum-edit de-slop editor and AI-tell detector
  unslop-file        unslop-file/       — in-place doc & memory file cleaner with code-block immutability
  unslop-review      unslop-review/     — line-anchored direct code review comments without throat-clearing
  all                all of the above (recommended)

Target Harness Flags (defaults to Oh My Pi):
  --omp              ~/.omp/agent/skills (default)
  --claude           ~/.claude/skills
  --codex            ~/.codex/skills
  --cursor           ~/.cursor/skills
  --opencode         ~/.config/opencode/skills
  --dest <dir>       custom destination directory

With no arguments this prints the help and installs nothing.
EOF
}

is_known_skill() {
  local s
  for s in "${ALL_SKILLS[@]}"; do
    [[ "$s" == "$1" ]] && return 0
  done
  return 1
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

# Recursively compare two directories
dirs_equal() {
  local d1="$1" d2="$2"
  if [[ ! -d "$d1" || ! -d "$d2" ]]; then
    return 1
  fi
  # Compare diff ignoring node_modules or .DS_Store
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

setup_linter_deps() {
  local linter_scripts_dir="$DEST_DIR/writing-voice/scripts"
  if [[ -d "$linter_scripts_dir" && -f "$linter_scripts_dir/package.json" ]]; then
    if command -v npm >/dev/null 2>&1; then
      echo "Setting up deterministic linter (slopless) in $linter_scripts_dir..."
      (cd "$linter_scripts_dir" && npm install --omit=dev --silent)
      echo "Linter ready."
    else
      echo "warning: npm not found in PATH. Install node/npm to run scripts/slopless-lint.sh" >&2
    fi
  fi
}

cmd_list() {
  local name src dst status
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
    echo "error: install requires at least one skill name or 'all'" >&2
    usage >&2
    exit 1
  fi
  for name in "${SELECTED[@]}"; do
    copy_tool "$name" "Installed" 2>/dev/null || copy_skill "$name" "Installed"
  done
  if wants "writing-voice" || wants "all"; then
    setup_linter_deps
  fi
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
    if wants "writing-voice"; then
      setup_linter_deps
    fi
    return 0
  fi

  for name in "${ALL_SKILLS[@]}"; do
    if [[ -d "$(dest_skill_path "$name")" ]]; then
      installed+=("$name")
    fi
  done

  if [[ "${#installed[@]}" -eq 0 ]]; then
    echo "nothing installed yet in $DEST_DIR — use 'install <skill>...' or 'install all'"
    exit 0
  fi

  for name in "${installed[@]}"; do
    copy_skill "$name" "Updated"
  done
  if wants "writing-voice"; then
    setup_linter_deps
  fi
}

print_epilogue() {
  local action_label="$1"
  if [[ "${#TOUCHED[@]}" -eq 0 ]]; then
    return 0
  fi

  echo
  echo "Summary:"
  echo "  Skills ${action_label} into: $DEST_DIR"
  echo
  echo "Next steps:"
  echo "  1. In chat, invoke directly:"
  echo "       \"Run writing-pipeline to draft an article on ...\""
  echo "       \"Run no-ai-slop on my draft in docs/rfc.md\""
  echo "       \"Check my draft against writing ruleset\""
  echo "  2. Pre-publish deterministic lint:"
  if [[ -f "$DEST_DIR/writing-voice/scripts/slopless-lint.sh" ]]; then
    echo "       $DEST_DIR/writing-voice/scripts/slopless-lint.sh draft.md"
  else
    echo "       ./skills/writing-voice/scripts/slopless-lint.sh draft.md"
  fi
  echo
  echo "Documentation & guides: ARCHITECTURE.md, RESEARCH-LANDSCAPE.md, docs/pipeline-workflow.md"
}

# --- argument parsing ---
if [[ "$#" -eq 0 ]]; then
  usage
  exit 0
fi

while [[ "$#" -gt 0 ]]; do
  case "$1" in
    install|update|list|uninstall)
      CMD="$1"
      shift
      ;;
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
      shift
      if [[ "$#" -eq 0 ]]; then
        echo "error: --dest requires a directory path" >&2
        exit 1
      fi
      DEST_DIR="$1"
      shift
      ;;
    --all)
      if [[ "$CMD" != "update" ]]; then
        echo "error: --all is only valid with 'update'" >&2
        usage >&2
        exit 1
      fi
      UPDATE_ALL=1
      shift
      ;;
    all)
      if [[ "$CMD" == "uninstall" ]]; then
        echo "error: 'all' is not valid with uninstall — name skills explicitly" >&2
        exit 1
      fi
      if [[ "$CMD" == "update" ]]; then
        UPDATE_ALL=1
      else
        SELECTED=("${ALL_SKILLS[@]}")
      fi
      shift
      ;;
    *)
      if is_known_skill "$1"; then
        SELECTED+=("$1")
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
    print_epilogue "installed"
    ;;
  update)
    cmd_update
    if [[ "$UPDATE_ALL" -eq 1 ]]; then
      print_epilogue "updated/added"
    else
      print_epilogue "updated"
    fi
    ;;
esac
