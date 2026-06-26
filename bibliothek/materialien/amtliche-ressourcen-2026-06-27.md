# Amtliche Ressourcen / Materialien — P0-Grundlage (Soft-Law)

**Erstellt:** 27.6.2026 (Nacht-Session, Auftrag 5 «Materialien-Vollbau», ultracode-Fan-out, doppelt verifiziert).
**Stand der Quellen:** 27.6.2026 (Abrufdatum aller URLs).
**Status:** Erstrecherche, maschinell kuratiert — **fachlich NICHT durch David geprüft** (Abnahme-Zeitsperre bis 1.12.2026). Alle Einträge `verifiziert:false`, `kuratierung:'maschinell'`.

Grundlage der neuen Rubrik **«Materialien»** (`src/lib/materialien/`, `public/materialien/register.json`, Seiten `/materialien` + `/materialien/:key`). Materialien sind **Verwaltungsverordnungen / Behörden-Publikationen** (Kreisschreiben, Wegleitungen, Leitfäden, Rundschreiben, Praxismitteilungen): faktisch praxisleitendes **Soft-Law**, **kein Gesetzesrang** (§8 in der UI offengelegt). Massgeblich bleibt stets die amtliche Quelle.

## 1. Quelle + Stand

Sieben Bundesbehörden in P0, priorisiert nach Praxisrelevanz für eine CH-Allgemeinkanzlei (Rang = `BEHOERDEN`-Reihenfolge):

| Rang | Behörde | Verzeichnis-/Portal-URL (verifiziert erreichbar 27.6.) | Format |
|---|---|---|---|
| 1 | **ESTV** (Steuern) | `estv.admin.ch/de/kreisschreiben-direkten-bundessteuer`, `…/rundschreiben-verrechnungssteuer`, MWST-Portal `gate.estv.admin.ch/mwst-webpublikationen/public` | PDF + JS-Portal |
| 2 | **EDÖB** (Datenschutz) | `edoeb.admin.ch/de/dokumentation-datenschutz`, `…/datenschutz-folgenabschaetzung`, `…/dokumentation-taetigkeitsberichte` | PDF (DAM-Hash) |
| 3 | **SECO** (Arbeitsgesetz) | `seco.admin.ch/de/wegleitungen`, Merkblatt-Verzeichnis (`…/Merkblatter_und_Checklisten.html`) | PDF |
| 4 | **BSV** (Sozialvers.) | `sozialversicherungen.admin.ch/de/d/<ID>` (WML 6944, WSN 6954, WVP 6957) | PDF |
| 5 | **EHRA/BJ** (Handelsreg.) | `ehra.admin.ch/de/praxismitteilungen-ehra` | PDF |
| 6 | **FINMA** (Finanzmarkt) | `finma.ch/de/dokumentation/rundschreiben/` | PDF (Liste dynamisch) |
| 7 | **IGE** (Imm.-Güter) | `ige.ch/de/uebersicht-dienstleistungen/dokumente-und-links/{marken,patente}` | PDF |

**P0 = 28 Dokumente, alle `nur-live-link`.** Volltext-/PDF-Import bewusst NICHT über Nacht (Render-Risiko + still veraltende Kopien; die Behörden aktualisieren ohne festen Turnus → DAM-Hash wechselt). Die In-App-Detailseite zeigt nur bibliografische Metadaten + Live-Link (kein Normtext, §7).

**Beschaffungs-Regel pro Quelle (verifiziert):**
- Wo der Direkt-PDF-Pfad fragil ist (ESTV-DAM 502/Revision; EHRA; FINMA dynamische Liste; SECO-Merkblatt-Hash) → quelleUrl = **stabile amtliche Verzeichnis-/Slug-Seite**, Dokument über Nummer/Stand identifiziert (`hinweis` trägt das).
- Wo der Direkt-Link verifiziert stabil ist (EDÖB-Themenseiten, BSV-`d/<ID>`, IGE-fileadmin) → per-Dokument-URL.
- **Erreichbarkeit:** alle 16 distinkten quelleUrls am 27.6.2026 per HTTP geprüft (200). Die ursprüngliche `bj.admin.ch/.../praxismitteilungen.html` war 404 (Site-Umbau) → korrigiert auf `ehra.admin.ch/de/praxismitteilungen-ehra`.

## 2. Regel deterministisch (Aufnahme → Manifest → Darstellung)

```
Eintrag = { key (URL-sicher), behoerde, doktyp, titel, nummer?, rechtsgebiet,
            sprache, status='nur-live-link', quelleUrl (http, Pflicht),
            stand (ISO), rang, normKeys[], hinweis? }
Manifest (public/materialien/register.json) = NUR über Generator
  `npm run materialien -- --datum=$(date +%F)` (Determinismus §2):
    → löst Behörde-/Doktyp-Labels auf, setzt sha256 über Identitätsfelder (Provenienz)
    → sortiert Behörde-rang → eigener rang → key
Tor `check:materialien` (offline, im gate): key eindeutig+URL-sicher · quelleUrl http
  · stand ISO & nicht-Zukunft · normKeys ⊆ ERLASS_REGISTER · committet==frischer Build
  · P0-Invariante alle nur-live-link.
Darstellung: Übersicht gruppiert nach Behörde (Filter Behörde/Doktyp/Suche);
  Detailseite = Metadaten + §8-Hinweis «kein Gesetzesrang» + Live-Link-Button
  + Verzahnung (normKeys → /gesetze + werkzeugeFuer). KEIN gespeicherter Inhalt.
```

**Verzahnung (Burggraben):** `normKeys` je Material → existierende Erlass-Keys. Inverse `materialienFuerNorm(key)` (in `werkzeugeFuer`/`werkzeuge.ts`, additiv) liefert «Materialien zu diesem Erlass» für den späteren Gesetze-Reader-Block / das B3-Kontext-Panel.

## 3. Geltungsbereich + Ausnahmen / unbestätigte Punkte

- **ESTV-DAM-Deeplinks** (#KS 5a/37, RS 219, AIA-Wegleitung) waren bei der Recherche transient 502 → bewusst auf Slug-Verzeichnis verlinkt; einzelne MWST-Info-Nummern via JS-SPA nicht serverseitig vollständig auszählbar.
- **EHRA-Praxismitteilung 2/24:** Quellen nennen widersprüchliche Daten (20.6./11.10.2024) → in P0 nicht aufgenommen (nur 1/26, 1/25).
- **SECO:** echte HTML-Einzelartikel der ArG-Wegleitung existieren **nicht** (nur PDF-pro-Artikel hinter HTML-Index) → Volltext-Import scheidet als saubere Quelle aus. VUV-Wegleitung gehört zu **EKAS/Suva**, nicht SECO (nicht aufgenommen).
- **EDÖB:** kein separates «Bearbeitungsverzeichnis»-Merkblatt; Art. 12 DSG ist im Gesamtleitfaden mitbehandelt.
- **SEM** (Migration, Praxisrelevanz-Rang 3) bewusst NICHT in P0: HTML-Kapitelbaum statt PDFs → eigener Resolver nötig; **BehoerdeId noch nicht angelegt** → P1. **BAG/IGE-Detail** ebenfalls P1.

## 4. Pflegebedarf (Verfallsregister-Kandidaten)

- **Jährlich:** ESTV-Zinssätze-Rundschreiben (RS 218/219), AIA-Wegleitung, SECO-ArG-Wegleitungen (jährliche Neuauflage), IGE-Richtlinien (jahresweise).
- **Ad-hoc (DAM-Hash-Drift):** EDÖB-Leitfäden, EHRA-Praxismitteilungen, FINMA-Rundschreiben — halbjährlicher Erreichbarkeits-/Stand-Recheck empfohlen (Live-Link-HEAD-Probe). Stand-Daten je Eintrag im Register.
- Beim Übergang `nur-live-link` → `pdf-embed`/`volltext`: zwingend §7-Zitat-Ausnahme (Stand/Quelle/Live-Link/**Drift-Tor**) + gehosteter Inhalt; der Status-Typ ist vorbereitet, aber `check:materialien` warnt, solange Inhalt fehlt.

## 5. Abnahme-Status

**Erstrecherche (doppelt verifiziert in der Fan-out-Session), fachlich offen.** Die Einordnung (rechtsgebiet, normKeys, Praxisrelevanz-Rang) ist eine maschinelle Kuratierung — David prüft Auswahl + Verzahnung in der Abnahme-Welle ab 1.12.2026. Keine Angabe ist als «geprüft» markiert.
