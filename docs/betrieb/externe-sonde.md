# Externe Uptime-Sonde — Konfig-Vorlage (G6, optional)

> FAHRPLAN-BASIS-AUSBAU §A5 (B-11), §B-Handschritt **G6** (optional). Der
> GitHub-Cron `prod-smoke.yml` läuft alle 6 h — aber **wenn GitHub selbst oder
> Vercel flächig ausfällt, meldet er nichts** (dieselbe Infrastruktur). Eine
> externe Gratis-Sonde schliesst diese Lücke. Diese Datei ist die fertige
> Vorlage; sie funktioniert **ohne Konto** als Dokumentation und wird scharf,
> sobald David ein Monitor-Konto anlegt (~5 Min).

## Was überwachen (Sonden-Ziele)

| Ziel-URL | Erwartung | Intervall | Keyword-Prüfung |
|---|---|---|---|
| `https://lexmetrik.vercel.app/` | HTTP 200 | 5 min | Antwort enthält `LexMetrik` |
| `https://lexmetrik.vercel.app/gesetze` | HTTP 200 | 5 min | — |
| `https://lexmetrik.vercel.app/api/suche?q=miete` | HTTP 200 **oder** 503 | 15 min | Content-Type `application/json` (kein HTML) |
| `https://lexmetrik.vercel.app/sitemap.xml` | HTTP 200 | 60 min | Antwort enthält `<sitemapindex` |

Nach der Domain-Registrierung (B-4 / Gate G3) die Basis-URL auf `lexmetrik.ch`
umstellen — an EINER Stelle, hier.

## Anbieter (Gratis-Tarife, Stand 17.7.2026 — vor Nutzung live prüfen)

- **UptimeRobot** — 50 Monitore gratis, 5-min-Intervall, Keyword-Monitor im
  Gratis-Tarif; E-Mail-Alarm. Empfohlener Default.
- **Better Stack (Uptime)** — 10 Monitore gratis, 3-min-Intervall.
- **Healthchecks.io** — eher für Cron-Pings (unser `prod-smoke.yml` könnte
  zusätzlich einen «Dead-Man»-Ping senden, wenn er grün durchläuft).

## Einrichtung (UptimeRobot, wenn G6 geöffnet wird)

1. Konto auf uptimerobot.com anlegen (gratis).
2. Je Zeile oben einen **HTTP(s)-Monitor** anlegen; bei `/` und `/api/suche` einen
   **Keyword-Monitor** (Alarm, wenn das Keyword FEHLT).
3. Für `/api/suche`: 503 nicht als Ausfall werten (Custom-HTTP-Statuses «200-299,
   503» als «up»), sonst meldet der Monitor den ehrlichen 503 fälschlich als down.
4. Alarm-Kontakt (E-Mail) hinterlegen.
5. Optional API-Read-Only-Key erzeugen und hier unten als Klartext-**Namen**
   (nicht Wert!) notieren; Werte in den Passwort-Nachlass (siehe env-inventar.md).

## Status

- [ ] G6 geöffnet (Monitor-Konto existiert)
- [ ] Monitore gemäss Tabelle angelegt
- [ ] Alarm-Kontakt hinterlegt

Solange alle Kästchen leer sind, ist der GitHub-Cron `prod-smoke.yml` die
alleinige (und ausreichende) Prod-Überwachung — die externe Sonde ist bewusst
optional (§B/G6).
