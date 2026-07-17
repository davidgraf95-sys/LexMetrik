# Env-Var-Inventar — Vercel-Projekt `lexmetrik`

> FAHRPLAN-BASIS-AUSBAU §A5 (B-11). Damit ein Rollback/Neuaufbau nicht an einer
> vergessenen Env-Var scheitert: die vollständige Liste dessen, was Prod zur
> Laufzeit erwartet. **Werte gehören nie ins Repo** — nur die Namen und wozu.

## Laufzeit (Vercel → Project → Settings → Environment Variables)

| Name | Nötig für | Fehlt sie → | Gate |
|---|---|---|---|
| `TURSO_DATABASE_URL` | Edge-Suche `api/suche.ts` (HOT-FTS über Turso-HTTP) | ehrlicher **503**, statischer Client-Suchindex bleibt Fallback (§8) — nichts vorgetäuscht | David-Handschritt **G5** (QS-DATA) |
| `TURSO_AUTH_TOKEN`  | dito (Bearer für den Turso-`/v2/pipeline`-Endpunkt) | dito | David-Handschritt **G5** |

Das sind — Stand B-11 — die **einzigen** Laufzeit-Variablen. Der Client ist eine
vollständig statische SPA ohne Backend-Secrets; alle Rechen-/Normdaten sind
Build-Zeit-Artefakte (`public/*`). Bricht `api/suche` ohne diese Vars, ist das
**by design** ein ehrlicher 503, kein Ausfall (FAHRPLAN-DATENHALTUNG §5 E2).

## Build/Deploy

- **Deploy** = Git-Push auf `main` (Vercel-Git-Integration, kein CI-Deploy-Gate).
- **Build-Command / Output**: Projekt-Default (Vite-Build + `scripts/prerender.ts`);
  keine Build-Env-Secrets. Die 7,5-GB-Massendaten laufen bewusst nie im Vercel-Build.

## GitHub Actions (CI + Monitore)

Laufen **kontolos** mit dem Repo (`github.token` genügt für Issue-Schreiben):
`ci.yml`, `normen-monitor.yml`, `prod-smoke.yml`. **Keine** zusätzlichen
Repo-Secrets erforderlich. Kämen später welche dazu (z. B. externe-Sonden-Token),
werden sie hier eingetragen.

## Zugänge (Werte NICHT hier — Passwort-Nachlass)

| Was | Wo |
|---|---|
| Vercel-Konto / CLI-Token | David; `~/Library/Application Support/com.vercel.cli/auth.json` |
| GitHub-Konto | David |
| Turso-Datenbank | David (Konsole app.turso.tech) |

Notfall-Hinterlegung an eine Zweitperson/Passwort-Nachlass bleibt offener Punkt
(BETRIEB.md §Hinterlegung).
