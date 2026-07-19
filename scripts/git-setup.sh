#!/usr/bin/env bash
# scripts/git-setup.sh — Lokale git-Config für die Konflikt-Entschärfung (§12).
#
# Verdrahtet als npm "prepare" → läuft nach jedem `npm install` in JEDEM Clone/
# Worktree. Rein lokal, idempotent, netz-frei, harmlos in CI. Setzt NUR
# Client-Config (kein Repo-Inhalt), darum kein Pathspec/Commit nötig.
#
# 1) Custom-Merge-Treiber `regen` (siehe .gitattributes): behält bei Konflikt in
#    generierten Dateien die eigene Seite (Treiber `true` = No-op, Exit 0, kein
#    Konfliktmarker). Danach MUSS der Generator neu laufen — das CI-Tor erzwingt es.
#    Der `union`-Treiber ist in git eingebaut und braucht keine Registrierung.
# 2) rerere: merkt sich manuelle Konfliktauflösungen und spielt sie bei der
#    nächsten identischen Kollision automatisch wieder ein (autoUpdate = staged).
#
# `|| true`, damit ein fehlendes git (z. B. exotisches CI) den install nie bricht.
set -u

if ! command -v git >/dev/null 2>&1; then
  exit 0
fi
if ! git rev-parse --git-dir >/dev/null 2>&1; then
  # Kein git-Repo (z. B. Tarball-Install) — nichts zu tun.
  exit 0
fi

git config merge.regen.name  "Generierte Datei: eigene Seite behalten, danach Generator neu laufen (.gitattributes)" || true
git config merge.regen.driver "true" || true

git config rerere.enabled    true || true
git config rerere.autoUpdate  true || true

exit 0
