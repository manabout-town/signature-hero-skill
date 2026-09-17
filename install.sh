#!/usr/bin/env bash
# signature-hero 스킬 설치 → ~/.claude/skills/signature-hero
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p ~/.claude/skills
rm -rf ~/.claude/skills/signature-hero
cp -R skill/signature-hero ~/.claude/skills/
echo "✓ 설치 끝: ~/.claude/skills/signature-hero"
