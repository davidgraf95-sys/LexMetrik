#!/usr/bin/env bash
# scripts/ci/playwright-install.sh — robuste Playwright-Browser-Installation
# für CI (e2e-Shard-Job UND Perf-Budget-Job, §5 Single Source of Truth statt
# Duplikat-Block je Job).
#
# Anlass (Lauf 34241159277, Job 102112456997, 8.9.2026): Versuch 1 lief ins
# 5-min-Limit; das per sudo (eigene PTY-Session) von Playwright gestartete
# `apt-get` überlebte als Waise und hielt /var/lib/dpkg/lock-frontend.
# Versuch 2 scheiterte binnen 3 s mit Exit 100 — der Retry war strukturell
# wirkungslos.
#
# Nachbesserung PR #785 (September 2026), drei Punkte:
#  1. Ein per KILL beendeter apt-get/dpkg kann dpkg halb konfiguriert
#     zurücklassen ("dpkg was interrupted, you must manually run
#     'dpkg --configure -a'"); daher vor jedem WEITEREN Versuch
#     `dpkg --configure -a` (Exit-Code nur gewarnt, nie fatal).
#  2. Wartezeit auf die dpkg-Sperre von 240 s auf 120 s gesenkt — nach dem
#     Prozessgruppen-Kill ist die Sperre ohnehin sofort frei. Worst case
#     damit 2 × (120 s Warten + 300 s Install + 15 s Kill-Kulanz) = 870 s
#     ≈ 14,5 min — nur im Störfall (beide Versuche brauchen die volle Zeit);
#     im Regelfall (Sperre frei, Install durch) ist der Schritt in unter
#     einer Minute fertig.
#  3. Der Schleifen-Block steht jetzt genau einmal hier; e2e-Shard-Job UND
#     Perf-Budget-Job rufen `bash scripts/ci/playwright-install.sh` auf und
#     bekommen denselben Schutz.
#
# Testmodus für lokale Beweise (kein echtes CI, kein sudo nötig):
#   LEXMETRIK_SPERRE_TEST=<pfad>   sperre_belegt() prüft "Datei existiert"
#                                  statt `sudo fuser`; alle Sudo-Aufrufe
#                                  (dpkg --configure, pkill) werden dann nur
#                                  echot, nicht ausgeführt.
#   LEXMETRIK_INSTALL_CMD=<cmd>    ersetzt den Playwright-Install-Aufruf
#                                  (Default: "npx playwright install --with-deps chromium")
#   LEXMETRIK_SPERRE_MAX=<s>       überschreibt die 120-s-Wartegrenze
#   LEXMETRIK_INSTALL_TIMEOUT=<s>  überschreibt die 300-s-Versuchsdauer
#
# Portabilität: kein externes `timeout`/`setsid`-Binary vorausgesetzt (macOS
# hat weder das eine noch das andere) — `laufe_mit_wache` unten implementiert
# Zeitlimit und Gruppen-Kill selbst; wo `setsid` verfügbar ist (Ubuntu/CI),
# wird es für eine sauber isolierte Prozessgruppe genutzt, sonst
# `bash -c 'set -m; exec …'` (Job-Control-PGID reicht für den Gruppen-Kill).
set -euo pipefail

sperre_max="${LEXMETRIK_SPERRE_MAX:-120}"
install_timeout="${LEXMETRIK_INSTALL_TIMEOUT:-300}"
install_cmd="${LEXMETRIK_INSTALL_CMD:-npx playwright install --with-deps chromium}"

testmodus=0
if [ -n "${LEXMETRIK_SPERRE_TEST:-}" ]; then
  testmodus=1
fi

fuehre_sudo_aus() {
  if [ "$testmodus" -eq 1 ]; then
    echo "(testmodus) uebersprungen: sudo $*"
  else
    sudo "$@"
  fi
}

sperre_belegt() {
  if [ "$testmodus" -eq 1 ]; then
    [ -e "$LEXMETRIK_SPERRE_TEST" ]
  else
    sudo fuser /var/lib/dpkg/lock-frontend /var/lib/dpkg/lock /var/lib/apt/lists/lock >/dev/null 2>&1
  fi
}

warte_auf_dpkg_sperre() {
  local gewartet=0
  while sperre_belegt; do
    if [ "$gewartet" -ge "$sperre_max" ]; then
      echo "::error::dpkg-Sperre nach ${sperre_max}s nicht freigegeben — Blockade haelt an, Abbruch."
      return 1
    fi
    if [ "$testmodus" -eq 1 ]; then
      echo "warte auf dpkg-Sperre (Testdatei ${LEXMETRIK_SPERRE_TEST}), ${gewartet}s/${sperre_max}s"
    else
      haltende_pid=$(sudo fuser /var/lib/dpkg/lock-frontend /var/lib/dpkg/lock /var/lib/apt/lists/lock 2>&1 | tr -s ' \t' ' ' | awk '{print $NF}')
      echo "warte auf dpkg-Sperre (PID ${haltende_pid:-?}), ${gewartet}s/${sperre_max}s"
    fi
    sleep 5
    gewartet=$((gewartet + 5))
  done
  return 0
}

# Startet "$2..$n" in einer eigenen Prozessgruppe und wacht bis zu $1
# Sekunden; danach TERM an die Gruppe, nach 15 s Kulanz KILL. Gibt 124
# zurück, wenn das Zeitlimit griff, sonst den Exit-Code des Kommandos.
laufe_mit_wache() {
  local budget_s="$1"
  shift
  if command -v setsid >/dev/null 2>&1; then
    setsid "$@" &
  else
    ( set -m; exec "$@" ) &
  fi
  local pid=$!
  local gewartet=0
  while kill -0 "$pid" 2>/dev/null; do
    if [ "$gewartet" -ge "$budget_s" ]; then
      kill -TERM -- "-${pid}" 2>/dev/null || kill -TERM "$pid" 2>/dev/null || true
      sleep 15
      kill -KILL -- "-${pid}" 2>/dev/null || kill -KILL "$pid" 2>/dev/null || true
      wait "$pid" 2>/dev/null || true
      return 124
    fi
    sleep 1
    gewartet=$((gewartet + 1))
  done
  wait "$pid"
}

if [ "$testmodus" -eq 0 ]; then
  echo 'Acquire::Retries "3"; Acquire::http::Timeout "30"; Acquire::https::Timeout "30";' \
    | sudo tee /etc/apt/apt.conf.d/99-lexmetrik-geduld > /dev/null
fi

for versuch in 1 2; do
  if [ "$versuch" -gt 1 ]; then
    fuehre_sudo_aus dpkg --configure -a || echo "::warning::dpkg --configure -a nicht sauber (Exit $?) — Versuch trotzdem"
  fi

  warte_auf_dpkg_sperre || exit 1

  read -ra cmd_arr <<< "$install_cmd"
  # NICHT `if laufe_mit_wache …; then … fi; status=$?` — bei nicht
  # ausgeführtem then-Zweig liefert die if-Konstruktion laut POSIX/Bash
  # immer Exit 0 zurück, der echte Fehlercode ginge verloren. Mit `||`
  # bleibt der Aufruf unter `set -e` unkritisch UND der Code landet in
  # $status.
  status=0
  laufe_mit_wache "$install_timeout" "${cmd_arr[@]}" || status=$?
  if [ "$status" -eq 0 ]; then
    echo "playwright install: Versuch ${versuch}/2 durch."
    exit 0
  fi

  echo "::warning::playwright install: Versuch ${versuch}/2 nach spätestens ${install_timeout}s abgebrochen oder fehlgeschlagen (Exit ${status}) — räume verwaiste apt/dpkg-Prozesse auf, dann Wiederholung."
  fuehre_sudo_aus pkill -9 -f 'apt-get|dpkg' 2>/dev/null || true
done

echo "::error::playwright install kam in zwei Versuchen nicht durch — Paketspiegel gestört, Shard rot (nicht still übersprungen)."
exit 1
