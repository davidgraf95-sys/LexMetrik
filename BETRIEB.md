# BETRIEB.md — Runbook LexMetrik

**Zweck (STRATEGIE-PLATTFORM.md F1.3, Bus-Faktor 1):** Alles, was eine
übernehmende Person zum Weiterbetrieb braucht und was NICHT aus dem Code
hervorgeht. Fachliche Arbeitsweise: `CLAUDE.md` · Stand: `STRUKTUR.md` ·
Vorgehen: `HANDLUNGSPLAN.md` + `STRATEGIE-PLATTFORM.md`.

## Konten & Infrastruktur

| Was | Wo | Zugang |
|---|---|---|
| Produktion | https://lexmetrik.vercel.app (Vercel-Projekt `lexmetrik`; `legal-calc.vercel.app` = 308-Redirect) | Vercel-Konto David; CLI-Token in `~/Library/Application Support/com.vercel.cli/auth.json` |
| Repository | github.com/davidgraf95-sys/LegalCalc | GitHub-Konto David |
| Domain | **lexmetrik.ch — NOCH NICHT registriert** (Entscheid offen, STRATEGIE F1.1) | — |
| CI | GitHub Actions (`.github/workflows/ci.yml` je Push · `normen-monitor.yml` wöchentlich Mo 05:17 UTC) | läuft kontolos mit dem Repo |
| Zahlung/Backend | existiert nicht (bewusst — vollständig clientseitige SPA) | — |

**Hinterlegung für den Notfall:** Zugänge (GitHub, Vercel, später Registrar)
gehören zusätzlich an eine Zweitperson/Passwort-Nachlass — Stand 7.6.2026
NICHT erledigt, offener Punkt.

## Deploy

1. Tore lokal: `npx tsc -b` · `npm test` · `npm run lint` (volle Ausgabe,
   nie `tail`!) · `npm run build` · `npm run check`.
2. §9: Bug-Check (unabhängige Review-Agents) — und **Push/Deploy nur nach
   explizitem Ja von David.**
3. Prod: `npx vercel --prod` (im Repo-Root). Danach Live-Verifikation
   (Asset-Hash der ausgelieferten index.html gegen `dist/`).

## Periodische Pflege (maschinell überwacht durch `npm run check:verfall`)

| Rhythmus | Aufgabe | Werkzeug |
|---|---|---|
| wöchentlich (automatisch) | Normen-Monitor: Caches + Zitate + neue Konsolidierungen | GitHub Action `normen-monitor.yml`; rot → §7-Verifikation fällig |
| monatlich | LIK-Reihe nach BFS-Publikation | `scripts/lik-reihe-generieren.py` (Anleitung im Skript-Kopf) |
| quartalsweise | Hypothekarischer Referenzzins | referenzzinssatz.admin.ch → `mietvertrag.ts` (`MV_PARAMETER`) |
| jährlich + terminiert | alles Weitere | SSoT: `bibliothek/register/parameter-verfall.md` |

## Regenerier-Anleitungen (reproduzierbar)

- **Fedlex-Caches (nach /tmp):** `npm run check:caches` — Pins (ELI +
  Konsolidierung) stehen IN `scripts/fedlex-cache.sh`; Stände dokumentiert in
  `bibliothek/register/quellen-register.md`. Neu pinnen = fachliche Änderung
  (§7: Anker + tragende Wortlaute neu verifizieren, Register nachführen).
- **Norm-Zitate:** `npm run check:zitate` (braucht die Caches).
- **Neuere Konsolidierungen erkennen:** `npm run check:fedlex-versionen`
  (SPARQL gegen fedlex.data.admin.ch).
- **PLZ→Amt-Daten:** `npx vite-node scripts/plz-generieren.ts`
  (amtliches swisstopo/BFS-Register, Quellen im Skript).
- **BGE-Register:** `npx vite-node scripts/bge-register-generieren.ts`
  (bei neuen Rechtsprechungs-Zitaten mitlaufen lassen).
- **Golden-Protokoll (Refactorings, §6):** `npm run golden` vorher,
  `npm run golden:vergleich` nachher — Stand liegt in `/tmp/lexmetrik-golden.json`
  (lokal, bewusst nicht committet).
- **PDF-Sichtprüfung:** `npx vite-node .scratch/pdf-beispiele.ts` + qlmanage.

## Abnahme-Status (das Nadelöhr)

`verified: true` / Status «geprüft» setzt ein Abnahme-Protokoll in
`abnahme/` voraus (Schema dort; maschinell erzwungen durch
`src/tests/abnahmeGate.test.ts`). Abnahmeberechtigt: David (fachkundige
Person) — Erweiterung des Kreises ist §14-Entwurf in STRATEGIE F5.

## Notfall

- **App offline nehmen:** Vercel-Dashboard → Projekt `lexmetrik` →
  Deployment löschen/überschreiben, oder `npx vercel rollback`.
- **Fachlicher Fehler in einer «geprüft»-Engine:** Status sofort zurück auf
  `entwurf` (startseiteConfig) + Protokoll-Vermerk + Deploy — kein stiller
  Weiterbetrieb (§8).
- **Fedlex-Filestore-Formatwechsel** (Anker brechen plötzlich):
  `norm-zitate-pruefen` schlägt aus; Anker-Abstraktion liegt zentral in
  `src/lib/fedlex.ts` — dort reparieren, nirgends verstreut.
