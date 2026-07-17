# FAHRPLAN — Basis-Ausbau LexMetrik (Fundament-Handlungsplan, Stand 17.7.2026)

> **Detailquelle zum ROADMAP-Querschnitt `QS-BASIS`** (§14.1) — nie zweiter Einstieg, immer
> nur verlinkte Detailquelle.

**Plan-Prinzip (Daueranweisung David, 17.7.2026, wörtlich):** «bauplan soll so aufgebaut sein,
dass handlungsschritte von meiner seite erst am schluss kommen und du alles baust was du kannst
ohne mich.»

**Umsetzung des Prinzips:** Dieser Plan ist in **zwei Blöcke** gegliedert — **§A Agent-baubar
ohne David** (die Bau-Reihenfolge, komplett autonom, terminkritischer Teil zuerst) und **§B
David-Schlussblock** (alle Beschaffungs-/Freigabe-Handschritte gebündelt ans Ende). Teilbare
Einheiten sind explizit gesplittet: der **baubare Anteil** (Dossier / Entwurf / Skript / Tor /
Vorbereitung) liegt in §A und wird jetzt gebaut; nur der **Handschritt** (Bestellung / Freigabe /
Kauf) wandert nach §B und wird am Schluss in ~30–45 Min in EINEM Block erledigt. Je Gate ist
notiert, **was danach noch zu VERDRAHTEN** bleibt (der kleine Rest-Bau nach dem Handschritt).

**Auftrag David (17.7.2026, wörtlich):** «überleg dir mit ultrathink und ultracode was ich
an der basis von lexmetrik verbessern kann offen und erstelle daraus handlungsplan».

**Methodik:** 5 Miner-Agenten (Vertrauen · Praxis · Burggraben · Ingenieur · Infra-Bestand,
read-only Repo-/Live-Erhebung 17.7.2026) → 3 Fable-Strategen (Wirkung÷Aufwand aus drei
Linsen) → **Fable-Judge** (Deduplikation gegen den Plan-Bestand nach §14, Priorisierung,
Verwerfung). Jede Kernaussage ist im Bestands-Anhang (§Quellen) belegt. Die Einordnung
folgt strikt §14: bereits geplante Flächen werden **nur referenziert, nie dupliziert**;
neu sind ausschliesslich die Fundament-Lücken ohne bestehende Schritt-ID.

**Leitplanke (Zeitsperre):** Alle Trust-/Nachweis-Posten bleiben **maschinell geprüft**,
nie «fachlich geprüft» — David hat bis ≥1.12.2026 keine Abnahme-Zeit
(`FAHRPLAN-LERNPHASE-2026.md`, Default-Abnahmewelle Feb 2027). Kein Posten fordert Fachzeit;
die David-Gates sind reine Beschaffungs-/Freigabe-Handschritte (fachzeit-arm).

---

# §A — Agent-baubar OHNE David (Bau-Reihenfolge, autonom)

Diese Kette wird **jetzt** gebaut, in genau dieser Reihenfolge, je Einheit eigener Worktree + PR +
Auto-Merge. Terminkritisches zuerst (B-3 vor dem 1.8.-Berg). Kein Posten hier wartet auf David.

| Rang | Einheit (baubarer Anteil) | Warum hier | Handschritt-Rest → §B |
|---|---|---|---|
| A1 | **B-3** Bund-Currency-Kette prüfen/schliessen | **terminkritisch 1.8.** | — (kein Gate) |
| A2 | **B-5-Dossier** VPS-Bestell-Dossier + ROADMAP-Blocker-Zeile | entsperrt E3/E4-Beschaffung | Bestellung → G4 |
| A3 | **B-6** Stand-Ausweis in jeder Kopie/Export | reiner Trust-Fix, Rohstoff da | — |
| A4 | **B-8** Kantons-Currency-Wachhund + FR/IT-Label-Fix | Voraussetzung 26×-Glaubwürdigkeit | — |
| A5 | **B-11-Cron-Teil** Prod-Smoke + PR #244 + Rollback-Runbook | Prod heute unüberwacht | externe Sonde → G6 (opt.) |
| A6 | **B-1-Entwurf** DS-/Impressums-ENTWURF mit `[PLATZHALTER]` | volle Text-/Routing-Arbeit vorab | Name/Adresse → G1 |
| A7 | **B-2-Vorbereitung** Backup-Skript + Restore-Doku (Ziel offen) | existenzielles Skript vorab | Ziel/Zahlmittel → G2 |
| A8 | **B-10-Vorbereitung** ID-Inventar + Redirect-Tor + `/zitieren` | domain-neutral baubar | URL-Freeze nach Domain → G3 |
| A9 | **B-7** Determinismus-Nachweis auf `/methodik` | **nach B-3** (sonst Loch beweisen) | — |
| A10 | **B-9-Design** append-only Fassungs-Archiv (Mechanik) | Rohstoff-Sammlung ab heute | Scharfstellen nach B-2-Ziel → G2 |
| A11 | **B-12-Vorbereitung** Merge-Queue-Konfig vorbereiten | **nach QS-OPT O-3.2/O-3.3** | Aktivierung (G7 Kenntnisnahme) |

### A1 · B-3 · Bund-Currency-Kette vor dem 1.8.-Verfall-Berg  · **TERMINKRITISCH vor 1.8.** · kein Gate
**Kern:** Die fertige, ungemergte Bau-Einheit P1a/b (18 Pins überholt + Regex-Loch) macht «immer geltender
Stand» ggf. zum §8-Schein-Versprechen; zugleich werden per 1.8. Bundeserlasse fällig und `check:verfall`
ist rot-nah = Deploy-Hindernis für ALLE Arbeit.
> **Prämissen-Abgleich (17.7.):** Laut `FAHRPLAN-OPTIMIERUNG-2026-07.md` ist P1-a/b bereits als
> **QS-CURRENCY Paket 1 ✅ (PR #195, 0 stale)** gemergt — falls beim Bau bestätigt, verliert dieser Posten
> den akuten Merge-Teil und schrumpft auf den terminierten **Batch-Re-Pin (O-2.1)**. **Erste Aktion beim
> Bau: `check:fedlex-versionen` + `check:verfall` real laufen lassen und den Ist-Stand festnageln**, dann
> nur den offenen Teil bauen (nicht doppelt re-pinnen).
**Mechanik-Skizze:** P1a/b rebasen + mergen (falls noch offen) · dann `fedlex-repin-batch` (**O-2.1**, in
PR #259 unterwegs — Merge-Stand prüfen) mit Deadline ~25.7. ausführen — Reihenfolge zwingend, sonst
doppelte Re-Pin-Arbeit. Falls alles grün: **Beweis-Vermerk statt Blindbau**.
**Aufwand:** S–M + M · **Wirkung:** hoch · **Abhängigkeit:** terminkritisch vor 1.8.; Opus (Risikopfad);
Skill `scraping-swiss-official-sources`.
**DoD:** `check:fedlex-versionen` Exit 0 (0 stale); 1.8.-Fälle re-gepinnt; `check:verfall` grün mit Vorlauf.
Risiko-Pfad (Extraktion/Currency) → **`check:gegenpruefung` `bestanden`** verlangt.

### A2 · B-5-Dossier · VPS-Bestell-Dossier + expliziter Blocker-Schritt in ROADMAP  · **Handschritt → §B (G4)**
**Kern:** E3 (195k Entscheide) + E4 (8,7 Mio Zitat-Kanten) sind seit 3.7. lokal fertig und doppelt geprüft —
der einzige Blocker ist die VPS-Bestellung, die nur als Memory-Notiz lebt; VZUI-V2 «Zitiert-von» und die
gesamte Verzahnungs-Tiefe hängen daran. **Serving-Bau selbst ist QS-DATA** (E3/E4) — hier nur das Dossier.
**§A-Anteil (jetzt bauen):** fertiges Anbieter-Dossier (Hetzner/netcup/OVH gegen §6.3: ≥350 GB NVMe/≥32 GB
RAM, live-verifizierte Preise/Links, Setup-Plan OS/Sicherung/rsync-Ziel, Schritt-für-Schritt-Bestellanleitung)
· ROADMAP-Zeile «BLOCKER: VPS-Bestellung (David)» unter QS-DATA. **Synergie:** derselbe VPS kann
Backup-Zweitziel (B-2) sein.
**§B-Anteil (Handschritt G4):** David bestellt den VPS (~15 Min).
**Aufwand:** S · **Wirkung:** hoch (entsperrt 3 Baustränge) · **Abhängigkeit:** keine.
**DoD:** Dossier liegt (≥2–3 Anbieter gegen §6.3 verglichen, Bestell-Links); Blocker-Zeile in ROADMAP/QS-DATA
sichtbar. E3-Serving bleibt QS-DATA, kein Duplikat hier.

### A3 · B-6 · Stand-Ausweis in JEDER Kopie und JEDEM Export  · kein Gate
**Kern:** Die Zitat-Kopie (`ArtikelBody`/`EntscheidBody`) liefert «Art. X Abs. Y OR» ohne Fassungs-/Abrufdatum
— anwaltlich unvollständig und bei der nächsten Revision eine Falle in der eigenen Akte.
**Mechanik-Skizze:** Zitat-Kopie, Print-Kopf und Rechner-PDF um «Fassung vom [fassungsToken] · abgerufen am
[Datum] · Permalink» ergänzen; Rohstoff (`currency.json`, Register-Stand) liegt vollständig vor. Bereitet
**M16 datenseitig vor** statt es zu duplizieren (kein M16-Vorgriff auf die Darstellung).
**Aufwand:** S · **Wirkung:** hoch · **Abhängigkeit:** keine (Permalink-Teil profitiert von B-4).
**DoD:** jede Kopie/jeder Export trägt Fassung + Abrufdatum + Permalink; golden byte-gleich (§6); da die
Kopie-Fläche an den Norm-/Tarif-Pfad grenzt → **`check:gegenpruefung`** prüfen, ob der Diff Risiko-Globs trifft.

### A4 · B-8 · Kantons-Datenwahrheit: Currency-Wachhund für 1231 Erlasse + FR/IT-Sprach-Label-Korrektur  · kein Gate
**Kern:** `currency.json` deckt exakt die 227 Bund-Kürzel — kantonale Revisionen (inkl. BS mit 859 Erlassen =
Kernbestand) veralten still ohne je rot zu werden; zusätzlich sind GE/VD/TI/JU/NE-Erlasse falsch als sprache
«de» getaggt (de=1467, fr=2) — für jeden Romandie-Anwalt ein sofortiger Glaubwürdigkeitsbruch.
**Mechanik-Skizze:** `geprueftAm`/`version_uid`-Mechanik analog Bund (BS+AR tief, Rest Sonde) in
`normen-monitor.yml` · Label-Prüfung je betroffenem Erlass · Register-Tor gegen künftiges Fehl-Labeling ·
ehrlicher `/abdeckung`-Ausweis. **Tranchen-schonend, LexWork-API-freundlich.**
**Aufwand:** M (+S) · **Wirkung:** hoch (Voraussetzung 26×-Glaubwürdigkeit) · **Abhängigkeit:** keine;
Vorbedingung für jeden weiteren Kantons-Ausbau.
**DoD:** kantonale Staleness wird rot; Sprach-Labels je betroffenem Erlass korrekt; Register-Tor fängt
künftiges Fehl-Labeling. Daten-/Extraktions-Nähe → Skill `scraping-swiss-official-sources` + `check:gegenpruefung` prüfen.

### A5 · B-11-Cron-Teil · Prod-Watchdog: Synthetic-Smoke + PR #244 + Rollback-Runbook  · **externe Sonde → §B (G6, optional)**
**Kern:** `normen-monitor` überwacht die QUELLEN, niemand überwacht die eigene PROD — Runtime-Fehler sind
unsichtbar, der CSP-Fresser (`entscheidsuche.ch` fehlt in `connect-src`) liegt verifiziert noch OPEN in PR #244,
und ein Rückweg für kaputte Prod-Stände ist nirgends dokumentiert.
**§A-Anteil (jetzt bauen):** GitHub-Cron-Workflow nach `normen-monitor`-Muster (Kernrouten 200+Inhalt,
`api/suche`-Status, CSP-Deckung, Sitemap; Issue bei Rot) · externe-Sonde-**Vorbereitung** (Konfig-Datei/Doku,
läuft auch ohne Konto) · PR #244 mergen · Rollback-Runbook (`vercel rollback`) + Env-Var-Inventar in
`docs/betrieb/` bzw. `BETRIEB.md`. **PR-#244-Bestand nutzen, nicht duplizieren.**
**§B-Anteil (Handschritt G6, optional):** externes Gratis-Monitor-Konto (UptimeRobot o. ä.).
> **Abgleich:** überlappt mit QS-OPT **O-1** (Prod-Smoke, CSP-Fix, `/api/fehler` = O-1.9). **Nicht daneben
> bauen:** prüfen, was O-1 abgedeckt hat, nur Delta ergänzen. `/api/fehler` (O-1.9) hängt später hier ein.
**Aufwand:** S · **Wirkung:** mittel–hoch · **Abhängigkeit:** keine.
**DoD:** Prod-Smoke-Cron meldet Rot als Issue; externe Sonde vorbereitet (aktiv oder dokumentiert entfallen);
PR #244 gemergt (CSP-Loch zu); Rollback-Runbook + Env-Inventar dokumentiert.

### A6 · B-1-Entwurf · Datenschutz-/Impressums-ENTWURF mit `[PLATZHALTER]`  · **Freigabe → §B (G1)**
**Kern:** Live und indexierbar steht «[Name und Adresse … wird ergänzt]» in der Datenschutzerklärung,
und es gibt keine Impressums-Route — die Seite hat keine benannte verantwortliche Stelle. Billigster,
höchstwirksamer Trust-Fix im ganzen Bestand.
**§A-Anteil (jetzt bauen):** vollständiger DS-/Impressums-ENTWURF mit `[PLATZHALTER Name/Adresse]`-Markern ·
Vercel-AVV-Absatz finalisieren (Agent-Recherche, kein Fachrecht) · Route vorbereitet, aber **unverlinkt oder
mit «Entwurf»-Banner**; §8-Status `entwurf`.
**§B-Anteil (Handschritt G1):** David gibt Name/Zustelladresse frei + wählt Impressums-Form.
**Was danach zu VERDRAHTEN:** Platzhalter durch echten Namen ersetzen, Banner entfernen, Route verlinken (~5 Min Rest-Bau).
**Aufwand:** S · **Wirkung:** hoch. Reine Text-/Routing-Änderung, kein Risiko-Pfad → `Gegenpruefung: n/a`.
**DoD (§A):** Entwurf vollständig, Platzhalter klar markiert, §6-/§9-Tore grün, keine falsche «benannte Stelle»
suggeriert (Banner). Kein Platzhalter-freier Live-Stand ohne G1.

### A7 · B-2-Vorbereitung · Off-site-Backup-Skript + Restore-Probe-Anleitung  · **Ziel/Zahlmittel → §B (G2)** · Verankerungs-Kandidat #1
**Kern:** Der gesamte Rohdaten-Steinbruch (`bger.parquet` 785 MB, `normtext.db` 173 MB, alle DBs)
existiert exakt einmal auf Davids Mac — gitignored, null Backup-Treffer in DATENHALTUNG/BETRIEB; ein
SSD-Tod vernichtet Monate E3/E4-Arbeit, und der Rebuild-Pfad hängt selbst an den ungesicherten Parquets.
**§A-Anteil (jetzt bauen):** Backup-Skript (restic/rclone verschlüsselt, Ziel als **`[GATE-2]`-Konfig-
Platzhalter**) · launchd-Wochenjob-Vorlage · Restore-Proben-Anleitung in `BETRIEB.md` · **lokales
Sofort-Backup auf zweite lokale Platte FALLS vorhanden** (prüfen, nicht annehmen).
**§B-Anteil (Handschritt G2):** David wählt Backup-Ziel + hinterlegt Zahlmittel (B2/Hetzner Storage Box).
**Was danach zu VERDRAHTEN:** Ziel-Konfig eintragen, EINE Restore-Übung real ausführen + protokollieren (~15 Min).
**Aufwand:** S–M · **Wirkung:** existenziell · **Abhängigkeit:** keine (Skript sofort; Scharfstellung nach G2).
**DoD (§A):** Skript + Restore-Anleitung liegen; Ziel als Platzhalter; lokales Zweitplatten-Backup geprüft/ausgeführt
falls Platte da. Betriebs-Skript, kein Rechts-/Rechen-Pfad.

### A8 · B-10-Vorbereitung · Permalink-Beständigkeits-Vertrag + Daten-Contract (domain-neutral)  · **URL-Freeze nach Domain → §B (G3)**
**Kern:** Zitierfähigkeit ist technisch stark gebaut, aber ohne dokumentiertes Beständigkeits-VERSPRECHEN ist
ein Link für den Anwalt kein Zitat sondern ein Risiko; wer zuerst stabile dokumentierte CH-Rechts-IDs (ELI-treu,
BGE-Keys) anbietet, wird Referenz-Infrastruktur.
**§A-Anteil (jetzt bauen):** stabile-ID-Inventar · URL-/ID-Schema als eingefrorenes Commitment dokumentieren ·
`schemaVersion` in Registern · Tor `check:permalink-stabilitaet` (Golden-URL-Liste → 200/301, Alt-Pfad→Neu-Pfad-
Redirect-Testinfrastruktur) · kurze **domain-neutrale** `/zitieren`-Seite. **KEIN API-Server** (wäre Feature, VPS-gegated).
**§B-Anteil (Handschritt G3):** Domain `lexmetrik.ch` registrieren (B-4).
**Was danach zu VERDRAHTEN:** finalen Host in die eingefrorene URL-Basis eintragen; der eigentliche URL-Umzug
bleibt **SEO-A11Y W3.4** (dort gebaut, nicht hier duplizieren).
**Aufwand:** S–M · **Wirkung:** hoch (langfristig stärkste Distributions-Achse) · **Abhängigkeit:** URL-Freeze NACH B-4.
**DoD (§A):** ID-/URL-Schema dokumentiert; `schemaVersion` in Registern; Redirect-Tor grün; `/zitieren`-Seite live
(domain-neutral).

### A9 · B-7 · Öffentlicher Qualitäts-/Determinismus-Nachweis («Prüfstand»-Block auf `/methodik`)  · kein Gate · **nach B-3**
**Kern:** Golden-Gates, `check:gegenpruefung` und Manifest-SHAs sind nirgends nutzer-sichtbar — `/methodik`
behauptet Determinismus nur qualitativ, und weil «geprüft»-Badges bis Feb 2027 leer bleiben MÜSSEN, ist der
maschinelle Beleg die einzige jetzt auszahlbare Vertrauens-Währung.
**Mechanik-Skizze:** build-generierter Block «X Golden-Fälle byte-identisch · Y Tore grün · Z Erlasse gegen
Fedlex-Version geprüft am [Datum]» — bewusst **«maschinell geprüft», nie «fachlich geprüft»** (zeitsperren-konform).
**Aufwand:** S–M · **Wirkung:** hoch (Differenzierung ggü. jedem LLM-Produkt, G1-Gespräche) ·
**Abhängigkeit:** **nach B-3** (sonst beweist man ein Loch).
**DoD:** Block auf `/methodik` zeigt build-aktuelle Zahlen; Wortlaut «maschinell geprüft»; golden byte-gleich.

### A10 · B-9-Design · Fassungs-Archiv ab sofort (append-only), besonders Kantone  · kein Gate · **NACH B-2-Ziel scharf**
**Kern:** M16 (Point-in-Time-Darstellung) ist geplant und gegated, aber der ROHSTOFF entsteht nur durch
Sammeln ab heute — Bund ist via Fedlex-ELI rekonstruierbar, kantonale Alt-Fassungen sind es oft NICHT; jeder
Monat ohne Archiv ist unwiederbringlich verlorene Historie = reinstes unbackfillbares Burggraben-Asset.
**Mechanik-Skizze:** bei jedem Monitor-Lauf/Re-Pin die alte Fassung datiert nach `daten/archiv/` legen
(gitignored, via B-2 gesichert) — **kein UI, keine Darstellung** (dupliziert M16 NICHT).
**Aufwand:** M · **Wirkung:** hoch (zeitbasiertes Asset, physisch nicht nachholbar) · **Abhängigkeit:**
Design/Mechanik jetzt baubar; **scharf NACH B-2-Ziel** (sonst archiviert man auf denselben Single-Point-of-Failure); Synergie mit B-8.
**DoD:** jeder Re-Pin/Monitor-Lauf legt die abgelöste Fassung datiert nach `daten/archiv/`; von B-2 mitgesichert;
keine Darstellungsänderung.

### A11 · B-12-Vorbereitung · GitHub Merge Queue vorbereiten  · **Aktivierung G7 (Kenntnisnahme)** · **ZULETZT, nach O-3.x**
**Kern:** Parallel-Agenten-Sessions sind der Arbeitsmodus, aber es gibt nur Auto-merge ohne serialisiertes
Gating — `strict=false` heisst: PRs mergen gegen veralteten `main`, Race-Merges können still Semantik brechen
(Memory-Lektion git/Parallel-Sessions); die Queue ist der Multiplikator der Agenten-Fabrik.
**§A-Anteil (jetzt vorbereiten):** Queue-Konfig + Required-Check-Zuordnung dokumentieren/skripten; Kompatibilität
`gh pr merge --auto` belegen; QS-TOK-Kopplung (CI-Läufe/Kosten) notieren. Erhöht CI-Läufe pro Merge → **bewusst LETZTER Posten**.
**§B-Anteil (G7, Kenntnisnahme):** Aktivierung per `gh api` — Davids OK genügt.
**Abhängigkeit:** **NACH QS-OPT O-3.2 (Flake-Wurzel) + O-3.3 (Sharding)** — sonst verstopft die Queue.
**DoD:** Konfig vorbereitet + O-3.2/O-3.3 als Voraussetzung belegt; Aktivierung wartet auf grüne O-3.x + G7.

---

# §B — David-Schlussblock (alle Handschritte gebündelt, ans Ende)

**NUR David, fachzeit-arm, empfohlen als EIN gebündelter ~30–45-Min-Block.** Alles Beschaffung/Freigabe,
**keine fachliche Abnahme.** Jeder §A-Baustein oben ist so gebaut, dass er OHNE diese Schritte fertig und
grün ist; die Gates schalten nur den jeweils letzten Verdrahtungs-Rest scharf.

| # | Handschritt | Aufwand | entsperrt §A-Einheit | danach noch zu VERDRAHTEN (Rest-Bau) |
|---|---|---|---|---|
| G1 | **Name/Zustelladresse für Datenschutzerklärung freigeben + Impressums-Form wählen** (eigene Seite oder in `/ueber` konsolidiert) | ~2 Min | B-1-Entwurf (A6) | Platzhalter→echter Name, «Entwurf»-Banner weg, Route verlinken (~5 Min) |
| G2 | **Backup-Speicherziel wählen + Zahlmittel hinterlegen** (Backblaze B2 oder Hetzner Storage Box, ~1–6 €/Mt; Alt. externe SSD) | einmalig ~15 Min | B-2-Vorbereitung (A7) + B-9-Design (A10) | Ziel-Konfig eintragen, EINE Restore-Übung real + protokollieren, Archiv-Ziel scharf (~15 Min) |
| G3 | **Domain `lexmetrik.ch` registrieren** (~15 CHF/Jahr) + Vercel-DNS bestätigen (F1.1; `BETRIEB.md` «NOCH NICHT registriert») | ~15 Min | B-10-Vorbereitung (A8) → dann B-4 | finalen Host in URL-Basis eintragen; URL-Umzug = SEO-A11Y W3.4 (dort) |
| G4 | **VPS bestellen** (≥350 GB NVMe / ≥32 GB RAM, ~25–50 €/Mt, Hetzner/netcup/OVH; Dossier aus A2 liegt vor) | ~15 Min | B-5-Dossier (A2) | E3-Serving-Bau = QS-DATA (dort); kann Backup-Zweitziel (G2) sein |
| G5 | **Turso-Env-Vars in Vercel setzen** (`TURSO_DATABASE_URL` + `TURSO_AUTH_TOKEN`; bestehendes Gate QS-DATA) | ~10 Min | fertige Edge-Suche `api/suche` (55k Artikel + 342 BGE), heute ehrlicher 503 | — (Suche schaltet sofort live) |
| G6 | *(Optional)* **Monitor-Konto anlegen** (UptimeRobot o. ä., gratis) für externe Uptime-Sonde | ~5 Min | externe-Sonde-Teil von B-11 (A5) | Sonden-URL/Token in vorbereitete Konfig (~5 Min); GitHub-Cron läuft auch ohne |
| G7 | *(Nur Kenntnisnahme)* **Merge-Queue-Aktivierung auf `main`** (B-12) — Setting per `gh api`, Davids OK genügt | 0 | B-12-Vorbereitung (A11) | Aktivierungs-`gh api` ausführen (nach grünem O-3.2/O-3.3) |

Spätere Gates (nicht in diesem Panel): Kantonswahl Pilot-Ausbau (default-bar ZH) · Bezahl-Tiers/Login
(geparkt, Markt-Thema) · fachliche Abnahme-Welle (zeitgesperrt bis ≥1.12.2026, Default Feb 2027 — nicht drängen).

---

## §Verworfen (mit Grund)

### Schon geplant mit ID — nur referenzieren, NICHT neu aufnehmen (§14)
- **E3/E4-Serving-Architektur** → QS-DATA / W2·6-DATA; hier nur der Beschaffungs-Entscheid als B-5.
- **CI-Sharding** → QS-OPT O-3.3; **e2e-Flake-Wurzel / `waitForTimeout`-Abbau** → O-3.2 (harte Reihenfolge).
- **M15 (DE/FR/IT-Verlinkung) + M16 (Point-in-Time-Darstellung)** → `FAHRPLAN-NORMTEXT-DARSTELLUNG.md` B3,
  AKN-gegated; B-6/B-8/B-9 sind bewusst nur die S/M-grossen **Vorstufen** ohne Duplikat.
- **SEO-A11Y-Ausbau** → eigener Schritt SEO-A11Y (Domain-UMZUG dort als W3.4; B-4 ist nur der Registrierungs-Entscheid).
- **Fall-Rückgrat / Fristenbuch / Mandat / Arbeitsmappe** → `FAHRPLAN-FALL-RUECKGRAT.md`, strategisch geparkt
  bis ≥1.12.2026 — nicht vorziehen (die Unverzichtbarkeits-Schicht, aber Parkung auf Nutzerfeedback vertretbar,
  solange B-1…B-10 stehen).
- **`/api/fehler`-Rückkanal** → O-1.9 offen; nur Anhebung, hängt in B-11 ein statt Neu-Posten.
- **Turso-Live-Paritäts-Sonde** → O-1.6 · **Live-API-Vertragstests** → O-1.8 · **BGE-Currency-Sonde** → O-2.3 (alle geplant).
- **Turso-Env-Vars** → existiert bereits als David-Handschritt (QS-DATA) — kein neuer Posten, nur ins
  David-Gates-Bündel (G5) aufgenommen.
- **`fedlex-repin-batch`** → O-2.1 existiert; in B-3 nur terminlich angehoben, kein Duplikat.
- **Redesign-zurückgestellt** → in W2·5c/STARTSEITE-V3 aufgegangen (done); Memory-Status überholt.

### Inhaltlich verworfen
- **CI-Auto-Rerun-Workflow** — maskiert Flake-Symptome und konkurrenziert die geplante Wurzelheilung
  O-3.2/O-3.3; Brücke bleibt das dokumentierte manuelle `gh run rerun --failed`, Aufwand fliesst besser in O-3.2.
- **Main-Härtung `enforce_admins`/`strict=true`** — `strict=true` kollidiert mit der Starvation-Lage bis
  O-3.x/B-12; der werthaltige Teil (Rollback-Runbook + Env-Inventar) ist in B-11 aufgegangen.
- **Hosting-Limit-Erhebung + Payload-Budget-Tor** — erst vor dem nächsten Kantons-Breiten-Ausbau
  entscheidungsrelevant; kein solcher Ausbau aktiv geplant, S-Erhebung dann als Vorschritt dort.
- **Kantons-Extraktions-Schablone / Pilotkanton ZH** — L-Aufwand mit Ausbau-Charakter, nicht Basis; erst NACH
  B-8 (Currency) + B-9 (Archiv) sinnvoll, dann eigener ROADMAP-Schritt mit David-Kantonswahl.
- **Änderungs-Feed «Was hat sich geändert»** — Distributions-Feature, nicht Fundament; billiges Abfallprodukt
  ERST wenn B-8 (Kanton-Wachhund) steht, dann eigene Initiative.
- **Kantons-Ausbau in der Breite** — Content/Feature, nicht Basis (Praxis-Linse bestätigt).

---

## Bau-Go-Status

**§A wird autonom gebaut** (Prinzip oben: alles ohne David zuerst), je Einheit eigener Worktree + PR +
Auto-Merge, in der §A-Reihenfolge A1→A11. **§B ist Davids Schlussblock** (G1–G7, ein ~30–45-Min-Beschaffungs-/
Freigabe-Bündel am Ende) — jede §A-Einheit ist so gebaut, dass sie ohne ihr Gate fertig und grün ist; das Gate
schaltet nur den letzten Verdrahtungs-Rest scharf. Risiko-Pfade (B-3 Currency/Extraktion, B-6/B-8 wo Norm-/
Kopie-Fläche berührt) IMMER Opus + `check:gegenpruefung`.

---

## §Quellen (Bestands-Anhang — read-only erhoben 17.7.2026, zusammengefasst)

Belegbasis der Miner-Erhebung (Repo `~/Developer/LexMetrik`, branch `main`). Kein Wortlaut, nur die tragenden Befunde:

**Hosting/Betrieb (Infra-Miner):** Vercel-Projekt «lexmetrik», Deploy = Git-Push auf `main` (kein CI-Deploy-Gate).
**Keine eigene Domain** im Repo — Prod unter `lexmetrik.vercel.app` (→ B-4). Genau EINE Edge-Function `api/suche.ts`
(dependency-frei, Turso-HTTP), **heute inaktiv** mangels Env-Vars → ehrlicher 503, Fallback statischer Client-Index
(→ G5). CSP `default-src 'self'` solide, aber **LiveSuche POSTet auf `entscheidsuche.ch`, das nicht in `connect-src`
steht** → «CSP frisst Feature», gefixt in **PR #244 (Merge-Status offen)** (→ B-11). Build-Payload dist/ 251 MB /
public/ 197 MB, innerhalb Vercel-Static-Limits; die 7,5-GB-Massendaten laufen bewusst nie im Vercel-Build.

**CI (Infra-Miner):** EIN Monolith-Job «Tore» auf 2-Kern-Free-Runner, 16 Schritte sequenziell, kein Sharding/
Merge-Queue. `concurrency` pro Ref (nicht global) → parallele PRs konkurrieren um dieselben Runner. e2e 39 Specs,
auf CI seriell (`workers:1`) wegen CPU-Aushungerung; **live belegt** (gh run list 16./17.7.): nahezu jeder Code-PR-
Lauf FAILURE bei 20–36 min, No-op-Doku-Zwilling grün in ~40–60 s = flaky Starvation (→ O-3.2/O-3.3 vorausgesetzt für
B-12). `normen-monitor.yml` wöchentlich, prüft Quellen, legt Issue bei Rot — überwacht aber **nie die eigene Prod** (→ B-11).

**Lokale Daten-Risiken (Infra-Miner — höchstes Einzelrisiko):** `daten/` gitignored → alle DBs existieren **nur auf
Davids Mac**. Bestand lokal 6,9 GB (`normtext.db` 173 MB / 55 822 Artikel / 1458 Erlasse, `rechtsprechung.db` 39 MB,
`daten/poc/` 6,7 GB inkl. `bger.parquet` 785 MB / `bge.parquet` 140 MB / `citations.parquet` 49 MB). `masse.db` (E3)
aktuell **nicht mehr als fertige DB lokal** — reproduzierbar aus poc/-Parquet, aber die Parquets selbst sind
**ungesichert**. **Kein Backup-Konzept in DATENHALTUNG/BETRIEB** (→ B-2, B-9).

**Vertrauen/Praxis/Burggraben (Strategen-Linsen):** Datenschutzerklärung mit Live-Platzhalter «[Name und Adresse …
wird ergänzt]», kein Impressum (→ B-1). `currency.json` deckt nur die 227 Bund-Kürzel, kantonale Staleness unsichtbar +
FR/IT-Erlasse als «de» fehl-getaggt (de=1467, fr=2) (→ B-8). Golden-/Determinismus-Nachweise nicht nutzer-sichtbar (→ B-7).
Zitat-Kopie ohne Fassungs-/Abrufdatum (→ B-6). Permalink technisch stark, aber ohne Beständigkeits-Versprechen (→ B-10).
E3/E4 seit 3.7. lokal fertig, einziger Blocker VPS-Bestellung als blosse Memory-Notiz (→ B-5).
</content>
