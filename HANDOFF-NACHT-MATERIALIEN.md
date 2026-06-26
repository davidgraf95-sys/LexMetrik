# 🌙 HANDOFF — Nacht-Session (parallel, isoliert) · Stand 27.6.2026

> **Für einen zweiten Agenten in einer EIGENEN Session.** Diese Datei ist
> selbsttragend: kalt abarbeitbar. David lässt parallel eine andere Session (=
> diese hier) an Lane R/G der Rechtsprechung + Gesetze laufen. Damit nichts
> zerstört wird (CLAUDE.md §12 — parallele Sessions haben hier schon Arbeit
> stumm überschrieben), gilt der **Isolations-Vertrag** unten ZWINGEND.
>
> **AUSLÖSER:** Sagt David **«jetzt los»**, ist das die Freigabe, dieses Briefing
> **vollständig + autonom bis «dry»** abzuarbeiten (Paket A + Paket B), ohne pro
> Schritt rückzufragen. Deploy bleibt gesperrt (§0.3).

---

## 0. Isolations-Vertrag (HART — zuerst lesen, sonst nicht starten)

1. **Eigener git-Worktree, abgebrancht vom aktuellen `main`.** Nie im geteilten
   Arbeitsverzeichnis Struktur-Arbeit machen. (`git worktree add …` bzw. native
   Worktree-Isolation.)
2. **Commits nur mit explizitem Pathspec** (`git commit -m … -- <dateien>`).
   **Kein `git stash`, kein `git commit --amend`, kein Push, kein Deploy.**
   Nach jedem Commit `git show --stat` gegen die eigene add-Liste prüfen.
3. **Deploy ist gesperrt.** David gibt am Ende EINE gebündelte §9-Freigabe für
   beide Sessions zusammen. Du baust nur deploybaren Stand, drückst NIE
   `vercel`.
4. **VERBOTENE Dateien (die andere Session besitzt sie — NICHT anfassen):**
   - Rechtsprechung: `src/pages/Rechtsprechung.tsx`, `src/components/rechtsprechung/**`,
     `src/lib/rechtsprechung/**`, `scripts/normtext/adapter-entscheide.ts`,
     `scripts/normtext-entscheide.ts`, `scripts/normtext/entscheide-schreiben.ts`,
     `src/tests/entscheid-konsistenz.test.tsx`.
   - Gesetze: `src/pages/GesetzLeser.tsx`, `src/lib/normtext/darstellung.ts`,
     `scripts/normtext/struktur-*.ts`.
   - **`src/lib/normtext/browse.ts` ist absolut tabu** (beide Lanes editieren es
     live). Du klonst die Browse-Logik in deinen EIGENEN neuen Namespace
     `src/lib/materialien/browse.ts` — kopieren/adaptieren, das Original nie
     editieren.
5. **ERLAUBTE additive Integrationsdateien** (du DARFST sie ergänzen, aber nur
   **additiv**, klar abgegrenzt — keine Umstrukturierung, keine Zeilen
   verschieben; jede Berührung am Schluss listen, damit der Merge trivial
   bleibt): `src/App.tsx` (lazy-Import + Route), `src/lib/navigation.ts`,
   `src/lib/seo.ts`, `src/lib/seo-detail.ts`, `scripts/prerender.ts`,
   `vercel.json`, `src/lib/universalSuche.ts`,
   `src/components/suche/useUniversalSuche.ts`, `src/lib/normtext/werkzeuge.ts`,
   `src/tests/normtext-register.test.ts`, `package.json` (ein npm-Script).
6. **Wenn du fremden WIP/fremde Commits in `git status` siehst, die nicht zu
   deinem Auftrag gehören: nichts daran tun**, nur deine eigenen Dateien
   committen.

---

## 1. Pflichtlektüre (Repo)

- `CLAUDE.md` §1–§13 vollständig (bindend). Bes. §1 Korrektheit, §2 Determinismus,
  §3 Logik≠Darstellung, §5 Single Source of Truth, §6 Gate/Golden, §7 Norm-
  Snapshot-Regeln (a–d + Build-Regel: Snapshots NUR über Generator), §8
  Ehrlichkeit/Status-Marker, §11 bibliothek+INDEX, §13 Design-Reglement.
- `JETZT-MACHEN.md` **§8** (Auftrag 5, 12-Punkt-Andock-Liste) und **§6** (Auftrag 9
  ultracode-Recherche) — deine Detail-Spezifikation mit Code-Ankern.
- `STRUKTUR.md` oben (aktueller Stand) + `FAHRPLAN-RECHTSPRECHUNG.md`,
  `FAHRPLAN-INTERNATIONAL-VOLLTEXT.md`.
- **Verifiziere alle `file:line` selbst** am Repo (Zeilen verschieben sich durch
  Parallel-Arbeit).
- **Abnahme-Zeitsperre bis 1.12.2026:** nichts juristisch „geprüft" markieren;
  alles `verifiziert:false` / `kuratierung:'maschinell'` / `status:'recherche'`
  + `TODO(David)`.

---

## PAKET A — Auftrag 5: „Amtliche Ressourcen / Materialien" (Vollbau, ultracode)

Neue Top-Kategorie: ESTV-Kreisschreiben, EDÖB-Publikationen, Wegleitungen,
Praxisfestlegungen u.ä. **Eigener Namespace, klont das normtext-Trio.**

### A.1 — ultracode-Design ZUERST (Recherche + Entscheid, vor Code)
Fan-out-Recherche (Memory: immer `model:'opus'`, doppelt verifizieren, jede
Angabe mit Quelle+Stand):
- **Welche Behörden** kommen in P0 rein (ESTV, EDÖB, SECO, BJ, …)? Priorisiere
  nach Praxisrelevanz für eine CH-Kanzlei.
- **Welche Dokumenttypen** je Behörde (Kreisschreiben, Wegleitung,
  Praxisfestlegung, Merkblatt, …).
- **Datenbeschaffungs-Strategie:** überwiegend PDFs. Entscheide pro Quelle:
  `status:'nur-live-link'` (International-Klon, kein Detail-Reader) ODER
  Volltext (Rechtsprechung-Klon). **P0-Default: `nur-live-link`/`pdf-embed`,
  Volltext später** — kein riskanter Massen-PDF-Extrakt über Nacht.
- **Einordnung + Verzahnung** mit Erlassen/Rechnern über `normKeys`.
- Ergebnis als **geordnete bibliothek-Liste** (`bibliothek/materialien/…md` +
  `bibliothek/INDEX.md`-Eintrag, §11-Struktur: Quelle+Stand / Regel
  deterministisch / Geltungsbereich / Pflegebedarf / Abnahme-Status).

### A.2 — Bau (12-Punkt-Andock-Liste, Quelle JETZT-MACHEN.md §8)
Alles im EIGENEN Namespace; Shared-Files nur additiv (siehe §0.5):
1. `src/lib/materialien/register.ts` + `…/typen.ts` + `…/browse.ts`
   (normtext-Trio klonen; Register-Shape an `ErlassRegistereintrag` orientieren,
   Status-Feld wie Erlass-Register). **Original `src/lib/normtext/*` nicht
   editieren.**
2. `public/materialien/register.json` + Generator `scripts/materialien/material-manifest*.ts`
   + npm-Script in `package.json` (Muster: die `entscheide`/`normtext`-Scripts).
   **Determinismus §2 / Build-Regel §7:** Manifest nur über den Generator, nie
   von Hand; Provenienz je Eintrag (Stand, quelleUrl, fassungs-/Drift-Token).
3. `src/pages/Materialien.tsx` (Übersicht) + `MaterialLeser.tsx` (Reader).
   Bei `nur-live-link`: kein Detail-Reader, sichtbarer Live-Link (§7 a–d, §8).
4. `src/App.tsx`: lazy-Import + `<Route>` (additiv).
5. `src/lib/navigation.ts`: `MATERIALIEN_KINDER` + ein `NAVIGATION`-Eintrag.
6. `src/lib/seo.ts`: `STATISCHE_SEITEN['/materialien']`.
7. `src/lib/seo-detail.ts`: `metaFuerMaterial` / (`materialVolltextHtml` nur bei
   Volltext) / `jsonLdFuerMaterial`.
8. `scripts/prerender.ts`: `ERWARTETE_ROUTEN` bumpen, Manifest-Read,
   Detail-Write-Loop, Floor-Const, Teil-Sitemap.
9. `vercel.json`: `/materialien/(.*)` Header-Block.
10. `src/lib/universalSuche.ts` + `src/components/suche/useUniversalSuche.ts`:
    `material`-Suchgruppe.
11. `src/lib/normtext/werkzeuge.ts`: Materialien↔Rechner/Erlasse-Brücke über
    `normKeys` (Muster: `werkzeugeFuerEntscheid(normKeys)` Z.~54). **Nur
    additiv** (neue Funktion/Eintrag), bestehende Logik nicht ändern.
12. Tests: `src/tests/normtext-register.test.ts`-Muster spiegeln (Register ⊇
    Snapshots; committed JSON == frischer Build) + Dead-Link-Nav-Test.

### A.3 — Constraints + Gate
- §13 Design: Tokens statt Magic-Numbers, WCAG-Kontrast/Fokus, volle
  Zustands-Matrix; Verdikt-zuerst, Lesespalte `max-w-reading`.
- **§6-Gate grün** vorher und am Schluss: `npm run gate` (volle Ausgabe).
  Golden byte-gleich (`npm run golden:vergleich`) — du fügst nur Neues hinzu.
  Neue Drift-/Vollständigkeits-Checks ins `check`-Ziel verdrahten (Muster der
  `check:normtext`/`check:entscheide`-Scripts).
- Iterativer Bug-/Logik-Check nach jedem Teilschritt + adversarialer
  Schlussdurchgang (tote Links? Manifest==Build? Live-Links erreichbar/§7?).
- Visuell: Playwright **via Bash** (nicht MCP) — Übersicht + ein Material
  hell/dunkel/mobil.

---

## PAKET B — Auftrag 9: Recherche-Dossier (READ-ONLY, null Code-Kollision)

BVGer / BStGer / BPatGer. **Nur Recherche + Regel-Synthese**, KEIN
Produktiv-Code, KEIN Pipeline-Eingriff (der Code-Bau passiert in der anderen
Session nach Landung von A2/mehrsprachig). Liefert das Dossier, das den
späteren Bau steuert.

Je Gericht ein Recherche-Strang (Memory `model:'opus'`, doppelt verifizieren):
- **Publikationsart:** BVGE / TPF / eigene Entscheidsammlungen; amtlich vs.
  nicht-amtlich; Regeste-Praxis.
- **Volltext-Portale + Metadaten:** wo abrufbar, Format, Lizenz/Art.5 URG.
- **Geschäftsnummern-Schema** je Gericht (Regex-fähig dokumentieren).
- **Sprachen** (BVGer/BStGer publizieren stark FR/IT → bestätigt den A2-Bedarf).
- **Regel-Synthese je Gericht:** Aufnahme → Verarbeitung → Darstellung,
  **orientiert am BGer-Muster** und dessen Darstellung; verbindlich formuliert
  (decision-tree-fähig, §11).
- Kandidaten-Liste: je Instanz die **4–5 neuesten** Urteile mit Geschäftsnummer
  + Quelle (für die spätere Bestückung; noch nicht importieren).

Ablage: `bibliothek/rechtsprechung/neue-gerichte-dossier-2026-06-27.md` +
`bibliothek/INDEX.md`-Eintrag. Alles `verifiziert:false` / Abnahme David offen.

---

## 2. Abschluss-Report (an David / die andere Session)
1. Worktree-Pfad + Branch · `git log --oneline` + `git diff --stat main...HEAD`.
2. §6-Gate-Resultat (grün/rot + Ausgabe), Golden byte-gleich ja/nein.
3. **Liste JEDER berührten Shared-Integrationsdatei** (§0.5) mit Stichwort, was
   additiv ergänzt wurde — für den deterministischen Merge.
4. Paket A: welche Behörden/Doktypen in P0, welche `nur-live-link` vs. Volltext,
   wie viele Materialien im Manifest, bibliothek-Pfad.
5. Paket B: Dossier-Pfad + Kurz-Summary je Gericht (Schema, Sprachen,
   Kandidaten).
6. Offene Risiken / `TODO(David)`. **Nicht deployen.** Session-Karte in
   `STRUKTUR.md` nachziehen (additiv, oben).
