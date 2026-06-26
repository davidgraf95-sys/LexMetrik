# 🌍 HANDOFF — International-Volltext Ausbau (3. Agent, isoliert) · 27.6.2026

> **Für einen DRITTEN Agenten in einer EIGENEN Session.** Selbsttragend, kalt
> abarbeitbar. Es laufen aktuell **mehrere Sessions parallel** im selben Repo —
> Datei-Kollision hat hier laut CLAUDE.md §12 schon Arbeit zerstört. Darum gilt
> der Isolations-Vertrag §0 ZWINGEND, UND du startest mit einer
> **Koordinations-Prüfung §0a** (was arbeitet sonst gerade?).
>
> **AUSLÖSER:** Sagt David **«jetzt gehts los»**, ist das die Freigabe, dieses
> Briefing **vollständig + autonom bis «dry»** abzuarbeiten, ohne pro Schritt
> rückzufragen. Deploy bleibt gesperrt (§0.3).

---

## 0a. KOORDINATIONS-PRÜFUNG (ZUERST — «was arbeitet sonst gerade?»)

David führt mehrere Agenten gleichzeitig. Bevor du IRGENDETWAS anfasst,
verschaffe dir aktiv ein Bild und meide fremde File-Spaces:
1. `git worktree list` + `git branch --list 'worktree-*'` + `git branch --all`
   → welche Worktrees/Branches sind offen (= andere Sessions arbeiten dort).
2. Lies alle `HANDOFF-*.md` im Repo-Root (`HANDOFF-NACHT-MATERIALIEN.md` u.a.) +
   die obersten Session-Karten in `STRUKTUR.md` → welche Dateien besitzen die
   anderen Sessions gerade.
3. **Stand 27.6.2026 (verifiziere ihn selbst, er kann sich verschoben haben):**
   - **Rechtsprechungs-Session (Hauptsession):** besitzt `src/pages/Rechtsprechung.tsx`,
     `src/components/rechtsprechung/**`, `src/lib/rechtsprechung/**`,
     `scripts/normtext/adapter-entscheide.ts`, `scripts/normtext-entscheide.ts`,
     `scripts/normtext/entscheide-schreiben.ts`, `public/rechtsprechung/**`,
     `src/tests/entscheid-konsistenz.test.tsx`, `src/tests/rechtsprechung-browse.test.ts`.
   - **Materialien-Nacht-Session** (Worktree `.lexmetrik-wt-materialien`):
     besitzt `src/lib/materialien/**`, `src/pages/Materialien*.tsx`,
     `public/materialien/**` und editiert **additiv** die Integrationsdateien
     `src/App.tsx`, `src/lib/navigation.ts`, `src/lib/seo.ts`,
     `src/lib/seo-detail.ts`, `scripts/prerender.ts`, `vercel.json`,
     `src/lib/universalSuche.ts`, `src/components/suche/useUniversalSuche.ts`,
     `src/lib/normtext/werkzeuge.ts`, `src/tests/normtext-register.test.ts`,
     `package.json`.
4. **Konsequenz für dich:** Du arbeitest im **Bund-normtext-/International-Space**
   (frei — Lane G/Gesetze ist fertig+gemerged). Fass die oben gelisteten fremden
   Dateien NICHT an. Bei den **additiv geteilten Integrationsdateien** (`prerender.ts`,
   `seo*.ts`, `App.tsx`, `navigation.ts`, `vercel.json`) editiert die
   Materialien-Session parallel — berühre sie nur, wenn unvermeidbar, dann
   **streng additiv + minimal** und liste am Schluss jede Berührung, damit der
   Merge trivial bleibt. International-Rubrik/Nav existiert bereits → meist musst
   du dort gar nichts ändern.

---

## 0. Isolations-Vertrag (HART)
1. **Eigener git-Worktree, abgebrancht vom aktuellen `main`.**
2. **Commits nur mit explizitem Pathspec.** Kein `git stash` bei fremdem WIP,
   kein `git commit --amend`, kein Push, kein Deploy. Nach jedem Commit
   `git show --stat` gegen die eigene add-Liste prüfen.
3. **Deploy gesperrt.** David gibt am Ende EINE gebündelte §9-Freigabe für alle
   Sessions zusammen. Nie `vercel` drücken.
4. Siehst du fremde Commits/WIP, die nicht zu dir gehören: nichts daran tun.

---

## 1. Pflichtlektüre
- `CLAUDE.md` §1–§13 (bindend) — bes. §2 Determinismus, §5 SSoT, §6 Gate/Golden,
  **§7 Norm-Snapshots NUR über Generator** (a–d Zitat-Ausnahme + Vollabdeckung +
  geltende Fassung + Drift-Tor), §8 Live-Link-Fallback/Ehrlichkeit, §11 bibliothek,
  §13 Design.
- **`FAHRPLAN-INTERNATIONAL-VOLLTEXT.md`** — deine Detail-Spezifikation: die
  5-Touchpoint-Verdrahtung (fedlex-cache.sh Pins · fedlex.ts · register.ts
  bund()+`rechtsgebiet:'international'` · normtext-snapshot.ts ERLASS_MAP ·
  bund-stubs-generieren.ts LISTE), die ASCII-Key-Normalisierung, das §8-Fallback.
- Memory-Lektion (Repo-Doku): der SPARQL/ELI-Resolver kann eine **veraltete**
  Fassung liefern → jede Pin **vor** Gebrauch via `scripts/fedlex-cache.sh` +
  `npm run check:fedlex-versionen` gegenverifizieren (date-geordnete
  Taxonomie-Abfrage als Arbiter). Filestore-HTML-Gehalt prüfen, BEVOR promoviert
  wird (sonst leere Shell → §8-Live-Link statt vermeintlichem Volltext).

---

## 2. Scope (bis «dry»)

### A — P2-Rest: weitere SR-0.* als Volltext («viel mehr», FAHRPLAN-Mandat)
Erweitere den International-Volltext-Korpus (aktuell 18) um weitere praxisrelevante
Staatsverträge über die **bewährte 5-Touchpoint-Pipeline**. Kandidaten (FAHRPLAN):
weitere Haager Übk. (`0.211.221.*`, `0.211.231.*`), Rechtshilfe Strafsachen
(`0.351.*`), Doppelbesteuerungs-Muster, weitere Bilaterale CH–EU. Pro Vertrag:
1. ELI via `npm run fedlex:eli` auflösen → **gegenverifizieren** (s.o.).
2. Filestore-HTML-Gehalt prüfen: hat die geltende Konsolidierung echte
   `<article id="art_*">`-Anker? **Nein → NICHT promovieren, §8-Live-Link lassen**
   (ehrlich dokumentieren). **Bekannt unmöglich, NICHT erneut versuchen:** EMRK
   (`0.101`) und NYÜ Schiedssprüche (`0.277.12`) — alle Konsolidierungen leer.
3. Ja → 5 Touch-Points verdrahten (ASCII-Keys konsistent!), dann
   `npm run normtext -- --nur=bund --datum=$(date +%F)`.
4. Verifizieren: `check:normtext`, `check:fedlex-versionen`, **adversarial**
   (Snapshot-art-IDs == Fedlex `<article id="art_`, Vollabdeckung §7-Build-Regel,
   keine abgeschnittenen Aufzählungen).
- Priorisiere nach Kanzlei-Praxisrelevanz; nimm so viele auf, wie sauber durch
  das Gehalt-Tor gehen. Status-Marker je Eintrag (`verifiziert:false` bis Davids
  Abnahme; §8 Live-Link bei Tor-Ablehnung).
- Erkenntnisse geordnet in `bibliothek/normen/` ablegen (+ INDEX, §11).

### B — P3 verifizieren (/gesetze-Redesign)
Das Doc ist widersprüchlich (oben «erledigt», unten «OFFEN»). **Prüfe den echten
Stand** von `src/pages/Gesetze.tsx`: sind Bund / Kantone / **International**
gleichwertige, scanbare Einstiege? Falls NEIN → umbauen (reine Darstellung §3,
§13-Tokens). Falls schon erledigt → nur in der Session-Karte festhalten, kein
Code. **`Gesetze.tsx`/International-Render gehört NICHT zur Rechtsprechungs- oder
Materialien-Session** — hier bist du frei.

---

## 3. Constraints (hart)
- **§2/§7:** Snapshots nur über den Generator, nie Hand-Edit; geltende Fassung,
  Vollabdeckung, Provenienz+Drift-Token je Eintrag. Neue Drift-Checks bleiben im
  `check`/`check:netz`-Ziel grün.
- **§6-Gate** vorher grün, am Schluss grün: `npm run gate` (volle Ausgabe).
  **Golden:** neue Volltexte ändern Snapshots → `golden` deklariert re-baselinen
  (wie bei P1/P2 dokumentiert), NICHT stillschweigend; im Report ausweisen.
- **§13:** falls P3-Umbau, Tokens/Kontrast/Fokus/Zustands-Matrix, Hell+Dunkel+mobil.
- **Abnahme-Zeitsperre bis 1.12.2026:** nichts «geprüft» markieren.
- **Iterativer Bug-/Logik-Check** nach jedem Vertrag + **adversarialer
  Schlussdurchgang** (Anker-Gleichheit, Vollabdeckung, kein Leak, ASCII-Key
  konsistent über alle 5 Touch-Points).
- **§12:** Pathspec-Commits (sinnvoll je Vertrags-Batch / je Teil), kein
  Push/Deploy/`--amend`. Commit-Fuss:
  `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`.
- **`model:'opus'`** durchgängig (auch Sub-Agenten). Visuell (Playwright via Bash,
  nicht MCP): ein neuer Vertrag im Reader + /international + ggf. /gesetze.

---

## 4. Abschluss-Report (an David / die anderen Sessions)
1. Worktree-Pfad + Branch · `git log --oneline` + `git diff --stat main...HEAD`.
2. §6-Gate-Resultat; Golden re-baselined ja/nein (+ wie viele Snapshots neu).
3. **Welche Verträge** als Volltext aufgenommen (mit SR-Nr/ELI/Kons), welche per
   §8-Live-Link abgelehnt (mit Grund), International-Volltext-Gesamtzahl neu.
4. P3-Befund (war's offen? was getan?).
5. **Liste JEDER berührten geteilten Integrationsdatei** (§0a.4) — für den Merge.
6. bibliothek-Pfad · offene Risiken/`TODO(David)`. **Nicht deployen.** Session-
   Karte in `STRUKTUR.md` nachziehen (additiv, oben).
