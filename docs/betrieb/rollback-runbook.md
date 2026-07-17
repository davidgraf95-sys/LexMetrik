# Rollback-Runbook — Prod zurückdrehen

> FAHRPLAN-BASIS-AUSBAU §A5 (B-11). Ein Rückweg für kaputte Prod-Stände war
> nirgends dokumentiert. Dies ist der schnellste Weg zurück auf einen grünen
> Stand — für die übernehmende Person (Bus-Faktor 1, STRATEGIE F1.3).

## Wann rollen

- **Prod-Smoke rot** (GitHub-Issue «🔴 Prod-Smoke rot …», Workflow `prod-smoke.yml`)
  und die Ursache ist ein frischer Deploy, nicht eine externe Quelle.
- Sichtbarer Fehler auf der Live-Site (weisse Seite, Runtime-Error, Normtext weg),
  der im letzten Merge nach `main` entstanden ist.
- **Fachlicher Fehler in einer «geprüft»-Engine** → zusätzlich Status zurück auf
  `entwurf` (BETRIEB.md §Notfall), nicht nur rollen.

Merke: `main` = Prod (§9 «Merge = Deploy-Entscheid»). Ein Rollback macht den
Fehler NICHT im Code rückgängig — es stellt nur eine ältere Auslieferung wieder
her. Der eigentliche Fix kommt anschliessend als regulärer PR nach `main`.

## Weg A — Vercel-CLI (schnellster Rückweg)

```bash
# 1. Letzte Deployments ansehen (jüngste zuerst)
npx vercel ls lexmetrik

# 2. Auf das letzte GRÜNE Deployment zurückrollen (interaktiv das Ziel wählen)
npx vercel rollback            # ohne Argument: Auswahlliste
#   oder gezielt:
npx vercel rollback <deployment-url>

# 3. Verifizieren: Prod-Smoke lokal gegen die Live-URL
npm run smoke:prod
```

Zugang: Vercel-Konto David; CLI-Token in
`~/Library/Application Support/com.vercel.cli/auth.json` (BETRIEB.md §Konten).

## Weg B — Vercel-Dashboard (ohne CLI)

1. vercel.com → Projekt **lexmetrik** → Tab **Deployments**.
2. Letztes grünes Deployment → **⋯ → Promote to Production** (bzw. **Instant Rollback**).
3. Prod-Smoke prüfen: `npm run smoke:prod` oder Workflow `prod-smoke.yml` manuell
   (Actions → Prod-Smoke → **Run workflow**).

## Weg C — Git-Revert (wenn der Fix klar ist)

Wenn der schädliche Commit bekannt ist und ein sauberer Rückbau schneller als ein
Deploy-Rollback ist:

```bash
git revert <sha>          # erzeugt einen Revert-Commit
# → PR nach main, Tore grün abwarten, Auto-Merge = Re-Deploy auf den heilen Stand
```

Weg A/B sind sofort wirksam (Sekunden), Weg C durchläuft die volle Gate-Kette
(Minuten), ist dafür aber der saubere, in der History nachvollziehbare Rückbau.

## App ganz offline nehmen (Notbremse)

Vercel-Dashboard → Projekt `lexmetrik` → Deployment löschen/überschreiben, oder
`npx vercel rollback` auf einen bekannt-guten Stand (BETRIEB.md §Notfall).

## Nach dem Rollback

- Grund im Prod-Smoke-Issue vermerken und das Issue schliessen, wenn grün.
- Root-Cause als eigenen Fix-PR (nicht direkt auf `main` hacken, §9/§12).
- Env-Var-Ursachen? → `docs/betrieb/env-inventar.md` gegenprüfen.
