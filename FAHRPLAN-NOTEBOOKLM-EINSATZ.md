# FAHRPLAN-NOTEBOOKLM-EINSATZ (Plan-Entwurf)

**Status:** Entwurf · Stand 6.7.2026 · nur Plan, kein Code
**Heimat:** ROADMAP Querschnitt-Band (QS-Werkzeuge) · Schwester zu `[[werkzeuge-zuerst-pruefen]]`
**Leitprinzip:** ehrliche Machbarkeit vor Feature-Wunsch; kein ToS-Bruch auf Davids privatem Google-Konto
**Herkunft:** ultracode-Recherche 6.7.2026 (6 Recherche-Winkel + 4 adversariale Faktenprüfungen); der tragende Befund (Drive-Auto-Sync-Einschränkung) wurde von der Verifikation gegen die Erstrecherche korrigiert.

---

## 1. Ziel & zwei getrennte Nutzungsarten

NotebookLM soll **den LexMetrik-Doku-Korpus** (FAHRPLÄNE, ROADMAP, Register, Dossiers) als durchsuchbaren, zitatgestützten Wissensspeicher erschliessen. Zwei sauber getrennte Nutzungsarten:

**(A) Mensch David — Recall/Recherche + Audio-Overview.**
Realistisch und bestätigt. NotebookLM beantwortet Fragen über den Korpus mit **Quellenzitat je Antwort**, erzeugt Briefing-Doc, FAQ, Mind-Map und einen **deutschsprachigen Audio-Overview** (Deutsch offiziell bestätigt, 80+ Sprachen). Genau der Menschen-Nutzen: unterwegs anhören (Mobile-App spielt Audio ab), am Desktop visuell navigieren (Mind-Map nur Web).
Quellen: <https://blog.google/innovation-and-ai/models-and-research/google-labs/notebooklm-audio-overviews-50-languages/> · <https://support.google.com/notebooklm/answer/16261963?hl=en>

**(B) Assistent-seitig — ehrliches Urteil.**
Kann der Assistent (Claude Code) NotebookLM als Wissensquelle *in der Session* nutzen? **Nein.** NotebookLM hängt nicht im Session-Kontext und ersetzt die `STRUKTUR.md`-Navigation **nicht**. Es gibt **keinen offiziellen, ToS-konformen Consumer-API** zum programmatischen Abfragen oder Bespielen von Davids Gratis-Notebook. Der Assistent kann NotebookLM daher **nur mittelbar füttern** (Docs nach Drive schreiben), nicht abfragen.
Quellen: <https://autocontentapi.com/blog/does-notebooklm-have-an-api> · <https://web-clipper-for-notebooklm.com/blog/notebooklm-api>

---

## 2. Machbarkeits-Matrix der Integrationswege

| Weg | Wie | Verifizierter Status | Aufwand | Fragilität |
|---|---|---|---|---|
| **(a) rein manuell** | David lädt `.md` direkt hoch (NotebookLM nimmt `.md` 1:1 an, keine Konvertierung) | **CONFIRMED** — Dateityp-Liste offiziell inkl. Markdown | niedrig je Upload, aber wiederkehrend | tief technisch, hoch operativ (Re-Upload bei jeder Änderung, kein Auto-Refresh) |
| **(b) Google-Drive-Brücke** | Repo-Docs via Drive-MCP nach Drive schreiben → einmalig als NotebookLM-Quelle verknüpfen → Auto-Sync alle paar Minuten | **CONFIRMED mit tragender Einschränkung**: Auto-Sync gilt **nur für native Google Docs/Sheets/Slides**, **NICHT** für rohe `.md` in Drive | mittel (Konvertierung `.md`→Google Doc nötig) | mittel — Google-vorgesehener Pfad, aber Konvertierungsschritt zwingend |
| **(c) Browser-Automation via Chrome-MCP** | Chrome-MCP klickt die Web-UI durch | **Grauzone** — formal "automated means", ToS untersagt Automatisierung | mittel | hoch — UI-Bruch + ToS-Risiko (Kontosperre); Mensch-im-Loop-Toleranz *nicht* verifiziert |
| **(d) offizielle/Enterprise-API** | `notebooks.sources.batchCreate` / `uploadFile` über `discoveryengine.googleapis.com/v1alpha` | **EXISTIERT (CONFIRMED)**, aber v1alpha/**Pre-GA**, **nur Gemini-Enterprise/Agentspace** (kostenpflichtig), **kein Consumer-Self-Service** | hoch (GCP-Projekt, Abo) | mittel technisch, aber Preview-Status + Kostenhürde |

Zusatz: reverse-engineerte Community-Tools (`teng-lin/notebooklm-py`, `roomi-fields/notebooklm-mcp`) existieren real, sind aber **explizit unofficial, bruchanfällig und ToS-widrig** ("Use at Your Own Risk", dediziertes Wegwerf-Konto empfohlen). **Nicht** für eine dauerhafte, unbeaufsichtigte Routine geeignet.
Quellen: <https://support.google.com/notebooklm/answer/16215270?hl=en> · <https://workspaceupdates.googleblog.com/2026/05/keep-your-sources-up-to-date-with-automatic-Drive-syncing-in-NotebookLM.html> · <https://docs.cloud.google.com/gemini/enterprise/notebooklm-enterprise/docs/api-notebooks-sources>

---

## 3. Empfohlene Architektur

**Primär-Weg: Google-Drive-Brücke (b), weil Drive-MCP real verfügbar ist** (`mcp__claude_ai_Google_Drive__create_file` u. a.) und der Drive→NotebookLM-Sync ein **offiziell vorgesehener, ToS-konformer** Pfad ist — kein Bot, kein Automatisierungsverstoss.

**Tragende Design-Korrektur (aus der Verifikation):** Eine rohe `.md`-Datei in Drive ist **keine** native Workspace-Datei und aktualisiert sich **nicht** automatisch. Der Auto-Refresh greift **ausschliesslich** für Google Docs/Sheets/Slides. Deshalb muss die Brücke die Docs als **native Google Docs** anlegen (Drive-API/-MCP kann beim Erstellen nach Google-Docs-Format konvertieren), nicht als `.md` ablegen.

**Datenfluss:**

```
Repo (Markdown-Korpus)
   │  Wrap-up-Skill / /schedule  (Delta stabiler Docs)
   ▼
Google Drive  ──  Drive-MCP: create_file / update  (als NATIVE Google Doc, nicht .md)
   │  Auto-Sync „alle paar Minuten" (nur native Workspace-Dateien)
   ▼
NotebookLM-Quelle  ──  einmalig manuell von David als Quelle verknüpft
   │
   ▼
David:  Chat mit Zitat · Briefing/FAQ/Mind-Map · deutscher Audio-Overview
```

Kernvorteil: Der Wrap-up-Skill pflegt **nur Drive**, nie NotebookLM direkt. Das Verknüpfen bleibt ein **einmaliger** manueller Schritt pro Doc (Ganz-Ordner-Import wird nicht unterstützt), danach hält Google die Quelle selbst frisch.

---

## 4. Die „Wrap-up"-Mechanik konkret

**Trigger — real vorhandene Primitive:**
- **Nicht** pro Commit (der Korpus churnt ~52 Commits/Tag — das wäre Lärm).
- Bevorzugt eine **`/schedule`-Routine** (Cron-Skill vorhanden) mit ruhiger Kadenz, z. B. **1× täglich abends** oder **je Batch-Abschluss**.
- Alternativ ein **Stop-Hook** *mit Debounce* (nur feuern, wenn seit letztem Sync ein stabiles Doc geändert wurde) — konservativer wegen Rausch-Gefahr; `/schedule` ist sauberer. (Anschlusspunkt: es existiert bereits ein Stop-Hook-Muster im Repo.)

**Was der Trigger tut:**
1. **Stabiles Doc-Set bestimmen** — Whitelist der *stabilen* Steuer-Docs (ROADMAP, `FAHRPLAN-*`, Register-Kernindizes), **nicht** täglich churnende Dossiers/Commit-Artefakte.
2. **Delta bilden** — nur geänderte Whitelist-Docs seit letztem Sync.
3. **Nach Drive schreiben via Drive-MCP** — Delta als **native Google Docs** anlegen/aktualisieren (nicht `.md`), damit Auto-Sync greift.
4. **NotebookLM refresht sich selbst** — Auto-Sync „alle paar Minuten"; bei Bedarf drückt David den manuellen „Click to sync"-Override.

**Kadenz:** täglich / je Batch — **nie pro Commit**. Der Drive-Auto-Sync ist erst seit 26.5.2026 live; ein heute neu angelegtes Notebook hat ihn.
Quellen: <https://support.google.com/notebooklm/answer/16215270?hl=en&co=GENIE.Platform%3DDesktop> · <https://workspaceupdates.googleblog.com/2026/05/keep-your-sources-up-to-date-with-automatic-Drive-syncing-in-NotebookLM.html>

---

## 5. Quell-Set & Datenschutz

**Rein (empfohlene Whitelist — stabil, unkritisch):** ROADMAP, `FAHRPLAN-*`, `bibliothek/register/`-Kernindizes (u. a. `engine-map.md`), Struktur-Übersichten. Reines Markdown → keine Konvertierungshürde beim Inhalt, nur der Docs-Format-Schritt (s. §3/§4).

**Raus (bewusst ausklammern):** live `STRUKTUR.md` (churnt), täglich wechselnde Dossiers, Commit-Artefakte — und **interne Strategie-Docs** (`STRATEGIE-PLATTFORM`, `WACHSTUM-REGLEMENT`).

**Datenschutz — Davids Entscheidung.** Jeder Sync (ob Drive, Chrome-MCP oder API) lädt die Docs **zu Google** hoch und Google verarbeitet sie. Zugriffsstufen (`chat-only` vs. `full access`) begrenzen nur das **Teilen an Dritte**, **nicht** die Google-seitige Verarbeitung. Empfehlung: **nur öffentlich-unkritische Steuer-/Struktur-Docs syncen, interne Strategie draussen lassen.**
Quelle: <https://workspaceupdates.googleblog.com/2025/03/new-features-available-in-notebooklm.html>

---

## 6. Phasen/Aufwand

- **P0 — manueller Erstbefüllungs-Test** *(≈ ½ Session).* David lädt eine Handvoll stabiler `.md` **direkt** hoch (kein Drive nötig), prüft: Chat-Zitatqualität, deutscher Audio-Overview, Mind-Map/Briefing. Beweist den **Menschen-Nutzen** ohne Automatik. Klärt Tier-Frage (Free/50 reicht für den *ganzen* Korpus **nicht** → kuratierte Whitelist oder Plus/100).
- **P1 — Drive-Brücke halbautomatisch** *(≈ 1 Session).* Dedizierter Drive-Ordner; Whitelist-Docs via Drive-MCP als **native Google Docs** ablegen; David verknüpft **einmalig** als NotebookLM-Quellen; Auto-Sync verifizieren (inkl. `.md`-vs-Google-Doc-Fallstrick real testen).
- **P2 — Wrap-up-Trigger** *(≈ 1 Session).* `/schedule`-Routine (oder debounced Stop-Hook): Delta stabiler Docs → Drive-MCP-Update. Kadenz täglich/je Batch. Idempotenz + „nichts geändert = kein Schreiben".
- **P3 — optional: Audio-Overview-Routine für David** *(≈ ½ Session).* Regelmässiger deutscher Audio-Overview über ROADMAP/FAHRPLAN-Stand zum Anhören; ggf. Custom-Prompt auf Fokusthemen. Längen-Presets (Shorter/Default/Longer) für **Deutsch** evtl. eingeschränkt — Sprache selbst voll unterstützt. Verwandt: `[[hoerbuch-pipeline]]`.

---

## 7. Offene Entscheidungen für David

1. **Tier:** Free/50 (kuratierte Whitelist) vs. NotebookLM Plus/100 (~7.99 USD/Mt.) für breiteren Korpus? *(Tier-Zahlen medium confidence — Sekundärquellen.)*
2. **Datenschutz-Whitelist:** Strategie-Docs (`STRATEGIE-PLATTFORM`, `WACHSTUM-REGLEMENT`) rein oder raus? (Google verarbeitet Uploads.)
3. **Konvertierung akzeptiert?** Docs müssen als **native Google Docs** in Drive liegen (nicht `.md`), damit Auto-Sync greift — Format-Drift ggü. Repo-Markdown ok?
4. **Trigger-Modell:** `/schedule` täglich vs. debounced Stop-Hook je Batch?
5. **Enterprise-API überhaupt Thema?** Nur falls David ohnehin Gemini Enterprise/Agentspace nähme — sonst nein.

---

## 8. Risiken/Grenzen

- **Staleness ohne native Docs:** Rohe `.md` in Drive **refresht nicht** — wird die Konvertierung nach Google Docs vergessen, zeigt NotebookLM veraltete Snapshots, ohne Warnung. Tragendster Fallstrick.
- **Kein sauberer Consumer-API:** Programmatisches Abfragen/Bespielen von Davids Gratis-Notebook geht **nicht** ToS-konform. Der Assistent kann NotebookLM **nicht in der Session lesen**.
- **ToS/Kontosperre:** Chrome-MCP-Automation und Community-Tools sind „automated means" → **ToS-Verstoss**, Risiko Sperre des privaten Google-Kontos. Community-Tools brechen zudem bei jeder Google-UI-Änderung → untauglich für unbeaufsichtigte Routine.
- **Enterprise-API-Status unsicher:** v1alpha/Pre-GA; GA-Status vor jeder Kaufentscheidung direkt bei Google verifizieren.
- **Grenzen der Plattform:** Per-Quelle-Deckel 500k Wörter / 200 MB (auf keinem Tier erhöhbar; LexMetrik-Einzeldateien unkritisch klein). Ganz-Ordner-Import wird **nicht** unterstützt → Verknüpfen bleibt manuell je Doc. Mind-Map fehlt in der Mobile-App (unterwegs nur Audio + Chat). Tier-Staffelung nur medium confidence (Sekundärquellen; nur Per-Quelle-Deckel + Dateityp-Liste offiziell Google-belegt).
- **Was NICHT geht:** NotebookLM ersetzt `STRUKTUR.md`/Session-Kontext nicht; kein Live-Zugriff des Assistenten; kein automatischer Ganz-Korpus-Sync ohne manuelles Erst-Verknüpfen.

Quellen: <https://docs.cloud.google.com/gemini/enterprise/notebooklm-enterprise/docs/api-notebooks-sources> · <https://support.google.com/notebooklm/answer/16215270?hl=en> · <https://workspaceupdates.googleblog.com/2026/05/keep-your-sources-up-to-date-with-automatic-Drive-syncing-in-NotebookLM.html> · <https://github.com/roomi-fields/notebooklm-mcp>
