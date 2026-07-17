# FAHRPLAN — Basis-Ausbau LexMetrik (Fundament-Handlungsplan, Stand 17.7.2026)

> **Nur Plan, kein Bau.** Detailquelle zum ROADMAP-Querschnitt **`QS-BASIS`** (§14.1) —
> nie zweiter Einstieg, immer nur verlinkte Detailquelle. Bau je B-Einheit nach Priorität
> (Wellen unten) bzw. **nach Davids Signal, wo gegated** (David-Gates getrennt markiert).

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

## David-Gates — kompakte Handschritt-Liste (NUR David, fachzeit-arm, empfohlen als EIN gebündelter ~30–45-Min-Block)

Getrennt vom autonom baubaren Rest. Alles Beschaffung/Freigabe, **keine fachliche Abnahme**.

| # | Handschritt | Aufwand | entsperrt |
|---|---|---|---|
| G1 | **Name/Zustelladresse für Datenschutzerklärung freigeben + Impressums-Form wählen** (eigene Seite oder in `/ueber` konsolidiert) | ~2 Min | B-1 (benannte verantwortliche Stelle) |
| G2 | **Backup-Speicherziel wählen + Zahlmittel hinterlegen** (Backblaze B2 oder Hetzner Storage Box, ~1–6 €/Mt; Alternative externe SSD) | einmalig ~15 Min | B-2 (existenziell) + B-9 |
| G3 | **Domain `lexmetrik.ch` registrieren** (~15 CHF/Jahr) + Vercel-DNS bestätigen (F1.1-Entscheid; `BETRIEB.md` «NOCH NICHT registriert») | ~15 Min | B-4 → damit B-10 |
| G4 | **VPS bestellen** (≥350 GB NVMe / ≥32 GB RAM, ~25–50 €/Mt, Hetzner/netcup/OVH; Agent liefert vorab Bestell-Dossier per B-5) | ~15 Min | E3-Serving (195k Entscheide), E4-Zitatgraph, VZUI-V2 «Zitiert-von»; kann Backup-Zweitziel sein |
| G5 | **Turso-Env-Vars in Vercel setzen** (`TURSO_DATABASE_URL` + `TURSO_AUTH_TOKEN`; bestehendes Gate ROADMAP-QS-DATA) | ~10 Min | fertige Edge-Suche `api/suche` (55k Artikel + 342 BGE), heute ehrlicher 503 |
| G6 | *(Optional)* **Monitor-Konto anlegen** (UptimeRobot o. ä., gratis) für externe Uptime-Sonde | ~5 Min | externe Sonde in B-11 (GitHub-Cron-Teil läuft auch ohne) |
| G7 | *(Nur Kenntnisnahme)* **Merge-Queue-Aktivierung auf `main`** (B-12) — Setting per `gh api`, Davids OK genügt | 0 | B-12 |

Spätere Gates (nicht in diesem Panel): Kantonswahl Pilot-Ausbau (default-bar ZH) · Bezahl-Tiers/Login
(geparkt, Markt-Thema) · fachliche Abnahme-Welle (zeitgesperrt bis ≥1.12.2026, Default Feb 2027 — nicht drängen).

---

## Ausführungs-Wellen (Priorität)

1. **Sofort:** B-1 · B-2 · B-3 *(Termin 1.8.!)* + David-Gates-Bündel (G1–G5, ein 30-Min-Block).
2. **Danach:** B-6 · B-7 · B-11.
3. **Asset-Aufbau (zeitbasiert, nicht nachholbar):** B-8 · B-9 · B-10.
4. **Zuletzt (nach QS-OPT O-3.2/O-3.3):** B-12.

---

## B-Einheiten

### B-1 · Betreiber-Identität schliessen (DS-Platzhalter + Impressums-Entscheid)  · **David-Gate: JA (G1)**
**Kern:** Live und indexierbar steht «[Name und Adresse … wird ergänzt]» in der Datenschutzerklärung,
und es gibt keine Impressums-Route — die Seite hat keine benannte verantwortliche Stelle. Billigster,
höchstwirksamer Trust-Fix im ganzen Bestand.
**Mechanik-Skizze:** Verantwortliche Stelle (Name/Zustelladresse) eintragen · Vercel-AVV-Absatz
finalisieren (Agent-Recherche, kein Fachrecht) · Impressums-Form umsetzen (eigene Route ODER Konsolidierung
in `/ueber`).
**Aufwand:** S · **Wirkung:** hoch · **Abhängigkeit:** keine (nur G1).
**DoD:** kein Platzhalter mehr in der ausgelieferten Datenschutzerklärung; benannte verantwortliche Stelle
sichtbar; §6-/§9-Tore grün. Reine Text-/Routing-Änderung, kein Risiko-Pfad → `Gegenpruefung: n/a`.

### B-2 · Off-site-Backup + Restore-Probe für `daten/` (6,9 GB)  · **David-Gate: JA (G2)** · Verankerungs-Kandidat #1
**Kern:** Der gesamte Rohdaten-Steinbruch (`bger.parquet` 785 MB, `normtext.db` 173 MB, alle DBs)
existiert exakt einmal auf Davids Mac — gitignored, null Backup-Treffer in DATENHALTUNG/BETRIEB; ein
SSD-Tod vernichtet Monate E3/E4-Arbeit, und der Rebuild-Pfad hängt selbst an den ungesicherten Parquets.
**Mechanik-Skizze:** restic/rclone verschlüsselt → B2/Hetzner Storage Box · launchd-Wochenjob · RPO ≤7 Tage ·
**EINE geprobte Restore-Übung** dokumentiert in `BETRIEB.md`.
**Aufwand:** S–M · **Wirkung:** existenziell · **Abhängigkeit:** keine (sofort nach G2).
**DoD:** verschlüsseltes Off-site-Backup läuft automatisch; Restore einmal real geprobt + in `BETRIEB.md`
protokolliert; RPO ≤7 Tage belegt. Betriebs-Skript, kein Rechts-/Rechen-Pfad.

### B-3 · Bund-Currency-Kette vor dem 1.8.-Verfall-Berg (Fedlex-P1a/b mergen + O-2.1 terminieren)  · David-Gate: nein · **TERMINKRITISCH vor 1.8.**
**Kern:** Die fertige, ungemergte Bau-Einheit P1a/b (18 Pins überholt + Regex-Loch) macht «immer geltender
Stand» derzeit zum §8-Schein-Versprechen; zugleich werden per 1.8. zehn Bundeserlasse fällig und
`check:verfall` ist rot-nah = Deploy-Hindernis für ALLE Arbeit.
> **Prämissen-Abgleich (17.7.):** Laut `FAHRPLAN-OPTIMIERUNG-2026-07.md` ist P1-a/b bereits als
> **QS-CURRENCY Paket 1 ✅ (PR #195, 0 stale)** gemergt — falls beim Bau bestätigt, verliert dieser Posten
> den akuten Merge-Teil und schrumpft auf den terminierten **Batch-Re-Pin (O-2.1)**. **Erste Aktion beim
> Bau: `check:fedlex-versionen` + `check:verfall` real laufen lassen und den Ist-Stand festnageln**, dann
> nur den offenen Teil bauen (nicht doppelt re-pinnen).
**Mechanik-Skizze:** P1a/b rebasen + mergen (falls noch offen) · dann `fedlex-repin-batch` (**O-2.1**, geplant,
untermininiert) mit Deadline ~25.7. ausführen — Reihenfolge zwingend, sonst doppelte Re-Pin-Arbeit.
**Aufwand:** S–M + M · **Wirkung:** hoch (hält Deploy-Fähigkeit + schliesst Currency-Loch) ·
**Abhängigkeit:** terminkritisch vor 1.8.; Opus-Bau (Risikopfad); Skill `scraping-swiss-official-sources`.
**DoD:** `check:fedlex-versionen` Exit 0 (0 stale); 1.8.-Fälle re-gepinnt; `check:verfall` grün mit Vorlauf.
Risiko-Pfad (Extraktion/Currency) → **`check:gegenpruefung` `bestanden`** verlangt.

### B-4 · Domain `lexmetrik.ch` registrieren — jetzt, vor weiterer Zitat-Verbreitung  · **David-Gate: JA (G3)**
**Kern:** Jeder Permalink in Rechtsschriften/Kanzlei-Wikis zeigt heute auf `lexmetrik.vercel.app` — Akten
leben 10+ Jahre, jeder Monat Verzug erhöht die künftige Bruchmasse und baut SEO-Equity auf eine fremde
Domain. **Kein Bau-Duplikat:** der Umzug ist geplant (SEO-A11Y W3.4, 1 Konstante + DNS); hier wird nur der
**Beschaffungs-Entscheid** erzwungen und als ROADMAP-Zeile sichtbar gemacht.
**Mechanik-Skizze:** Registrierung (G3) → Vercel-DNS → der eigentliche URL-Umzug bleibt **SEO-A11Y W3.4**
(dort gebaut, nicht hier duplizieren).
**Aufwand:** S · **Wirkung:** hoch (kumulativ zeitkritisch) · **Abhängigkeit:** Vorbedingung für B-10.
**DoD:** Domain registriert + DNS bestätigt; ROADMAP-Zeile sichtbar; Umzug an SEO-A11Y W3.4 übergeben.

### B-5 · VPS-Bestell-Dossier + expliziter Blocker-Schritt in ROADMAP  · **David-Gate: JA (G4)**
**Kern:** E3 (195k Entscheide) + E4 (8,7 Mio Zitat-Kanten) sind seit 3.7. lokal fertig und doppelt geprüft —
der einzige Blocker ist die VPS-Bestellung, die nur als Memory-Notiz lebt; VZUI-V2 «Zitiert-von» und die
gesamte Verzahnungs-Tiefe hängen daran. **Serving-Bau selbst ist QS-DATA** (E3/E4) — hier nur Beschaffung.
**Mechanik-Skizze:** fertiges Anbieter-Dossier (Hetzner/netcup/OVH gegen §6.3: ≥350 GB NVMe/≥32 GB RAM,
Kosten-POC, Bestell-Links) · ROADMAP-Zeile «BLOCKER: VPS-Bestellung (David)» unter QS-DATA → Handschritt
schrumpft auf ~15 Min. **Synergie:** derselbe VPS kann Backup-Zweitziel (B-2) sein.
**Aufwand:** S (Dossier + Verankerung) · **Wirkung:** hoch (entsperrt 3 Baustränge) · **Abhängigkeit:** keine.
**DoD:** Dossier liegt (3 Anbieter gegen §6.3 verglichen, Bestell-Links); Blocker-Zeile in ROADMAP/QS-DATA
sichtbar. E3-Serving bleibt QS-DATA, kein Duplikat hier.

### B-6 · Stand-Ausweis in JEDER Kopie und JEDEM Export  · David-Gate: nein
**Kern:** Die Zitat-Kopie (`ArtikelBody`/`EntscheidBody`) liefert «Art. X Abs. Y OR» ohne Fassungs-/Abrufdatum
— anwaltlich unvollständig und bei der nächsten Revision eine Falle in der eigenen Akte.
**Mechanik-Skizze:** Zitat-Kopie, Print-Kopf und Rechner-PDF um «Fassung vom [fassungsToken] · abgerufen am
[Datum] · Permalink» ergänzen; Rohstoff (`currency.json`, Register-Stand) liegt vollständig vor. Bereitet
**M16 datenseitig vor** statt es zu duplizieren (kein M16-Vorgriff auf die Darstellung).
**Aufwand:** S · **Wirkung:** hoch · **Abhängigkeit:** keine (Permalink-Teil profitiert von B-4).
**DoD:** jede Kopie/jeder Export trägt Fassung + Abrufdatum + Permalink; golden byte-gleich (§6); da die
Kopie-Fläche an den Norm-/Tarif-Pfad grenzt → **`check:gegenpruefung`** prüfen, ob der Diff Risiko-Globs trifft.

### B-7 · Öffentlicher Qualitäts-/Determinismus-Nachweis («Prüfstand»-Block auf `/methodik`)  · David-Gate: nein
**Kern:** Golden-Gates, `check:gegenpruefung` und Manifest-SHAs sind nirgends nutzer-sichtbar — `/methodik`
behauptet Determinismus nur qualitativ, und weil «geprüft»-Badges bis Feb 2027 leer bleiben MÜSSEN, ist der
maschinelle Beleg die einzige jetzt auszahlbare Vertrauens-Währung.
**Mechanik-Skizze:** build-generierter Block «X Golden-Fälle byte-identisch · Y Tore grün · Z Erlasse gegen
Fedlex-Version geprüft am [Datum]» — bewusst **«maschinell geprüft», nie «fachlich geprüft»** (zeitsperren-konform).
**Aufwand:** S–M · **Wirkung:** hoch (Differenzierung ggü. jedem LLM-Produkt, G1-Gespräche) ·
**Abhängigkeit:** **nach B-3** (sonst beweist man ein Loch).
**DoD:** Block auf `/methodik` zeigt build-aktuelle Zahlen; Wortlaut «maschinell geprüft»; golden byte-gleich.

### B-8 · Kantons-Datenwahrheit: Currency-Wachhund für 1231 Erlasse + FR/IT-Sprach-Label-Korrektur  · David-Gate: nein
**Kern:** `currency.json` deckt exakt die 227 Bund-Kürzel — kantonale Revisionen (inkl. BS mit 859 Erlassen =
Kernbestand) veralten still ohne je rot zu werden; zusätzlich sind GE/VD/TI/JU/NE-Erlasse falsch als sprache
«de» getaggt (de=1467, fr=2) — für jeden Romandie-Anwalt ein sofortiger Glaubwürdigkeitsbruch.
**Mechanik-Skizze:** `geprueftAm`/`version_uid`-Mechanik analog Bund (BS+AR tief, Rest Sonde) in
`normen-monitor.yml` · Label-Prüfung je betroffenem Erlass · Register-Tor gegen künftiges Fehl-Labeling ·
ehrlicher `/abdeckung`-Ausweis.
**Aufwand:** M (+S) · **Wirkung:** hoch (Voraussetzung 26×-Glaubwürdigkeit) · **Abhängigkeit:** keine;
Vorbedingung für jeden weiteren Kantons-Ausbau.
**DoD:** kantonale Staleness wird rot; Sprach-Labels je betroffenem Erlass korrekt; Register-Tor fängt
künftiges Fehl-Labeling. Daten-/Extraktions-Nähe → Skill `scraping-swiss-official-sources` + `check:gegenpruefung` prüfen.

### B-9 · Fassungs-Archiv ab sofort (append-only), besonders Kantone  · David-Gate: nein
**Kern:** M16 (Point-in-Time-Darstellung) ist geplant und gegated, aber der ROHSTOFF entsteht nur durch
Sammeln ab heute — Bund ist via Fedlex-ELI rekonstruierbar, kantonale Alt-Fassungen sind es oft NICHT; jeder
Monat ohne Archiv ist unwiederbringlich verlorene Historie = reinstes unbackfillbares Burggraben-Asset.
**Mechanik-Skizze:** bei jedem Monitor-Lauf/Re-Pin die alte Fassung datiert nach `daten/archiv/` legen
(gitignored, via B-2 gesichert) — **kein UI, keine Darstellung** (dupliziert M16 NICHT).
**Aufwand:** M · **Wirkung:** hoch (zeitbasiertes Asset, physisch nicht nachholbar) · **Abhängigkeit:**
**NACH B-2** (sonst archiviert man auf denselben Single-Point-of-Failure); Synergie mit B-8.
**DoD:** jeder Re-Pin/Monitor-Lauf legt die abgelöste Fassung datiert nach `daten/archiv/`; von B-2 mitgesichert;
keine Darstellungsänderung.

### B-10 · Permalink-Beständigkeits-Vertrag + Daten-Contract  · David-Gate: nein
**Kern:** Zitierfähigkeit ist technisch stark gebaut, aber ohne dokumentiertes Beständigkeits-VERSPRECHEN ist
ein Link für den Anwalt kein Zitat sondern ein Risiko; wer zuerst stabile dokumentierte CH-Rechts-IDs (ELI-treu,
BGE-Keys) anbietet, wird Referenz-Infrastruktur.
**Mechanik-Skizze:** URL-/ID-Schema als eingefrorenes Commitment dokumentieren · `schemaVersion` in Registern ·
Tor `check:permalink-stabilitaet` (Golden-URL-Liste → 200/301) · kurze `/zitieren`-Seite. **KEIN API-Server**
(wäre Feature, VPS-gegated).
**Aufwand:** S–M · **Wirkung:** hoch (langfristig stärkste Distributions-Achse) · **Abhängigkeit:** **NACH B-4**
(sonst garantiert man die falsche URL).
**DoD:** ID-/URL-Schema dokumentiert + eingefroren; `schemaVersion` in Registern; Golden-URL-Tor grün;
`/zitieren`-Seite live.

### B-11 · Prod-Watchdog-Paket: externe Uptime-Sonde + Synthetic-Smoke + PR #244 + Rollback-Runbook  · David-Gate: optional (G6)
**Kern:** `normen-monitor` überwacht die QUELLEN, niemand überwacht die eigene PROD — Runtime-Fehler sind
unsichtbar, der CSP-Fresser (`entscheidsuche.ch` fehlt in `connect-src`) liegt verifiziert noch OPEN in PR #244,
und ein Rückweg für kaputte Prod-Stände ist nirgends dokumentiert.
**Mechanik-Skizze:** Cron-Workflow nach `normen-monitor`-Muster (Kernrouten 200+Inhalt, `api/suche`-Status,
CSP-Deckung, Sitemap; Issue bei Rot) · externe Gratis-Sonde (G6) · PR #244 mergen · Rollback-Runbook
(`vercel rollback`) + Env-Var-Inventar in `BETRIEB.md`.
> **Abgleich:** überlappt mit QS-OPT **O-1** (Prod-Smoke, CSP-Fix, `/api/fehler` = O-1.9). **Nicht daneben
> bauen:** beim Bau prüfen, ob O-1 schon Teile abgedeckt hat, und nur die Delta-Posten (externe Sonde +
> Rollback-Runbook + Env-Inventar) ergänzen. `/api/fehler` (O-1.9) hängt später hier ein.
**Aufwand:** S · **Wirkung:** mittel–hoch · **Abhängigkeit:** keine.
**DoD:** Prod-Smoke-Cron meldet Rot als Issue; externe Sonde aktiv (oder ohne G6 dokumentiert entfallen);
PR #244 gemergt (CSP-Loch zu); Rollback-Runbook + Env-Inventar in `BETRIEB.md`.

### B-12 · GitHub Merge Queue aktivieren (Repo public → kostenlos)  · David-Gate: nein (G7 Kenntnisnahme) · **ZULETZT**
**Kern:** Parallel-Agenten-Sessions sind der Arbeitsmodus, aber es gibt nur Auto-merge ohne serialisiertes
Gating — `strict=false` heisst: PRs mergen gegen veralteten `main`, Race-Merges können still Semantik brechen
(Memory-Lektion git/Parallel-Sessions); die Queue ist der Multiplikator der Agenten-Fabrik.
**Mechanik-Skizze:** Merge Queue auf `main` (Required Check «Tore» läuft auf dem Merge-Ergebnis) ·
`gh pr merge --auto` bleibt kompatibel. Erhöht CI-Läufe pro Merge → **bewusst LETZTER Posten**.
**Aufwand:** S–M · **Wirkung:** mittel direkt / hoch als Multiplikator · **Abhängigkeit:** **NACH QS-OPT
O-3.2 (Flake-Wurzel) + O-3.3 (Sharding)** — sonst verstopft die Queue; QS-TOK-Kopplung (CI-Läufe/Kosten)
dokumentieren.
**DoD:** Merge Queue aktiv, `gh pr merge --auto` funktioniert weiter; Voraussetzung O-3.2/O-3.3 belegt grün;
QS-TOK-Kopplung notiert. Setting per `gh api` (G7 = Kenntnisnahme).

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

**NUR PLAN — kein Bau in diesem Schritt.** Bau je B-Einheit nach der Wellen-Priorität oben bzw. **nach Davids
Signal, wo gegated**. Autonom baubar ohne Gate: B-3, B-6, B-7, B-8, B-9, B-10, B-11 (Delta), B-12 (nach O-3.x).
Gegated (Davids Handschritt zuerst): B-1 (G1), B-2 (G2), B-4 (G3), B-5→Serving (G4), G5 aktiviert die Edge-Suche.
Risiko-Pfade (B-3 Currency/Extraktion, B-6/B-8 wo Norm-/Kopie-Fläche berührt) IMMER Opus + `check:gegenpruefung`.

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
