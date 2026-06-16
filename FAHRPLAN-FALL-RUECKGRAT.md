# FAHRPLAN — Fall-/Mandat-Rückgrat («Meine Fristen» als Praxis-Wirbelsäule)

**Stand:** 16.6.2026 · **Status:** Entwurf, ungepusht, NICHT committet (§9/§12) ·
**Herkunft:** Ultra-Workflow (4 Bestandsleser durch den realen Code → Design →
4 adversariale Linsen: CLAUDE.md-Treue · Solo-Machbarkeit · Praxistauglichkeit ·
Datenschutz/Krypto). Die Kritik-Befunde sind unten je Schritt eingearbeitet.

> **Nordstern:** Aus der Sammlung isolierter Rechner einen *Arbeitsplatz* machen,
> der den FALL als Organisationseinheit kennt — strikt clientseitig, kein
> Backend, berufsgeheimnis-treu. Drei Säulen, in Reihenfolge des Praxisnutzens:
> **(1)** ein wirklich benutztes **Fristenbuch** «Meine Fristen» (manuelle
> Erfassung als Default + aus Rechnern übernehmen, mit Vorfrist, Erledigt-Haken,
> Fälligkeits-Ampel), exportierbar als PDF/.ics; **(2)** verschlüsselter
> Fall-Export/-Import als lokale `.lexmetrik`-Datei (Persistenz/Multi-Device ohne
> Server); **(3)** wiederverwendbare Parteien/Stammdaten (zunächst nur lokales
> Autocomplete, URL-Transport erst später).

## Leitplanken (verbindlich)

- **§2 Determinismus:** «Heute» und Zeitstempel kommen an **genau einer Stelle**
  der Darstellungsschicht (`MeineFristen.tsx`) und werden als Argument an reine
  Helfer gereicht (`ampelStatus(eintrag, heuteISO)`). NIE in `fallSpeicher.ts`,
  in einen Button, in eine Mapping-Funktion — und **niemals** in golden-gegateten
  ICS-/PDF-Input. Die Fristberechnung bleibt allein Sache der Engines (SSoT).
- **§3 Schichtentrennung:** Der Fristenbuch-Layer ist Darstellung/Persistenz,
  **keine Rechtslogik**. Buttons/Export mappen nur fertige Engine-Outputs bzw.
  manuell erfasste Anzeigewerte — leiten keine Rechtsfolge ab.
- **§5 SSoT:** Ein Speichermodul (`src/lib/fall/fallSpeicher.ts`). Die Engine
  bleibt Wahrheit der Berechnung; gespeichert wird nur die fertige Frist-Zeile.
- **§6 Golden:** Bestehende Outputs (Engines, ICS-Einzel, PDF, Permalink) bleiben
  byte-identisch — alle neuen Module sind additiv und von nichts importiert.
  **Wichtig:** `golden:vergleich` vergleicht das GANZE Objekt — ein **neuer**
  Golden-Key ist NICHT «byte-gleich», sondern verlangt `npm run golden`
  (Re-Baseline) im selben Commit. Korrekte Beweis-Formel: «bestehende Keys
  unverändert (kein geändert/entfernt), neuer Key via `golden` eingefroren».
- **§12 Parallel-Sessions:** Alle neuen Dateien unter `src/lib/fall/` und
  `src/components/fall/` bündeln; Commits nur mit explizitem Pathspec.
- **§13 Berufsgeheimnis:** Gespeicherte Permalinks tragen **kein** `origin`/keine
  externe URL. `.lexmetrik` geht nie an ein Backend; `crypto.subtle` nur lokal,
  CSP `connect-src` unberührt.

## Korrekturen aus der Kritik (vor Baubeginn lesen)

1. **`lib/uid.ts` ist KEIN ID-Generator** — es validiert die Schweizer
   Unternehmens-UID (CHE-…, eCH-0097-Prüfziffer; `uidNormalisieren`/`uidGueltig`).
   Es gibt **keinen** ID-Generator im Repo. → Eigener Vorschritt **0.0**.
2. **PDF-Determinismus-Falle:** `buildPdfModel(cfg, jetzt = new Date())` schreibt
   einen Zeitstempel in den Kopf. Für die Liste IMMER explizit `jetzt` (FIX-Wert
   wie in `src/tests/pdf.test.ts`) übergeben; PDF-Erstarrung lebt in `pdf.test.ts`,
   **nicht** in `golden-outputs.ts`.
3. **Origin-Leak:** `IcsExportButton` baut die URL **mit** `location.origin`.
   Der `FristMerkenButton` weicht hier bewusst ab und speichert nur
   `pathname+query()+hash`.
4. **Manuelle Erfassung war komplett vergessen** — sie ist der häufigste
   Praxisfall (Posteingangsfrist) und jetzt **Default** in Phase 1.
5. **Fristenbuch-Pflichtfelder:** Vorfrist als eigene Spalte/Filter, Erledigt-Haken
   (abhaken statt löschen — Sorgfaltspflicht verlangt den Nachweis der
   Fristwahrung), Notiz/Sachverhalt, Fälligkeits-Ampel — alle als
   §2-konforme Anzeige-Metadaten.

## Datenmodell

Drei `localStorage`-Schlüssel unter dem Konventions-Präfix `lexmetrik.<entität>.v1`
(Version im Key):

**(1) `lexmetrik.fristen.v1` — `FristenEintrag[]`:**
`{ id, erstelltISO, titel, endeISO (yyyy-MM-dd), endeText (dd.MM.yyyy), endePraefix?,
vorfristISO?, fristnatur?, status: 'offen'|'erledigt', erledigtISO?, notiz?,
mandatskuerzel?, partei?, gericht?, aktenzeichen?, normRef?, ergebnisSatz?,
permalink? (pathname+query+hash, OHNE origin), quelleRechner? }`.
Quelle entweder **manuelle Erfassung** (Default) oder **aus einem Rechner
übernommen**. KEINE Engine-Zustände/Rechenergebnisse — nur die fertige Zeile.

**(2) `lexmetrik.parteien.v1` — `Partei[]`:**
`{ id, kurzbez, name?, rolle?, adresseFrei?, kanton? }`.

**(3) `.lexmetrik`-Datei** = JSON-Umschlag
`{ v: 1, alg:'AES-GCM', kdf:'PBKDF2-SHA256', iter, salt, iv, ct }`,
Klartext-Innenobjekt `{ fristen, parteien, exportISO }`. AES-GCM-256 + PBKDF2 via
`crypto.subtle`, Passphrase nur im Speicher.

`FristenEintrag`/`Partei`-Typen + robuste Lese-/Schreib-/Normalisier-Helfer leben
in **`src/lib/fall/fallSpeicher.ts`** (try/catch→Default wie `useWizardState`,
korrupte Altstände werden bereinigt statt zu werfen). `Fristnatur` aus
`fristenspiegel/typen.ts`, `Kanton` aus `types/legal.ts` (keine Duplikate, §5).

---

## Phase 0 — Fundament (additiv, kein sichtbarer Effekt)

**0.0 ID-Strategie festlegen — `src/lib/fall/fallId.ts`** *(neu, war als
`lib/uid.ts` falsch angenommen).* Da die `id` **nie** in eine Engine oder einen
golden-gefrorenen Output fließt, ist `crypto.randomUUID()` hier §2-zulässig
(Identität ≠ Berechnungspfad; analog zur `exportISO`-Argumentation).
Alternative falls strikt deterministisch gewünscht: Inhalts-Hash (kurzHash-Muster
aus `icsExport.ts`) aus `endeISO+titel+aktenzeichen`. **→ David-Entscheid (s. u.).**
*§6-Beweis:* Additivmodul, von nichts importiert → bestehende Goldens unberührt;
Unit-Test Kollisionsarmut/Stabilität, kein `Date.now`/`Math.random` im Logikpfad.

**0.1 `src/lib/fall/fallSpeicher.ts`** — Typen + Konstanten
(`SPEICHER_FRISTEN='lexmetrik.fristen.v1'`, `SPEICHER_PARTEIEN`), pure
Lese-/Schreib-Helfer + `normalisiere`-Funktion (Array-Filter, Enum-Validierung,
Drop korrupter Einträge). ID aus 0.0. **§8-Offenlegung verankern:** localStorage
ist Klartext und gerätegebunden (s. Krypto-Befund). *§6-Beweis:* von nichts
importiert → `golden:vergleich` byte-gleich; Test: Roundtrip idempotent, korrupte
JSON → bereinigte/leere Liste ohne `throw`, `setItem`-Wurf wird gefangen.

**0.2 `PARTEI_LINK_SPEC`** in `rechnerPermalinks.ts` deklarieren (disjunkter
Param-Namensraum, noch kein Konsument). *Hinweis Kritik:* Säule 3 ist
zurückgestellt — dieser Schritt kann mit Säule 3 warten. *§6-Beweis:*
`permalink.ts` unverändert → byte-gleich; Disjunktheits-Test gegen
ZPO/SCHKG/KSP/FSP/BGER-Specs **und** die hand-gerollten koPrefill-Keys.

## Phase 1 — Säule 1: «Meine Fristen» als benutztes Fristenbuch

**1.1a Reine Ansichtsseite** `src/pages/MeineFristen.tsx` + Route `/meine-fristen`
als **Sonderroute** in `App.tsx` (NICHT ins `ROUTEN_MANIFEST` — wie `/methodik`,
sonst bricht die Katalog↔Manifest-Bijektion). Liest `leseFristen()`, rendert
Tabelle, Leer-Zustand. *§6-Beweis:* `routenManifest.test.ts` + `check:sweep`
grün; Smoke-Render bei leerem Speicher; keine Engine berührt → byte-gleich.

**1.1b Navigation** (Header/Footer-Link) **separat** committen (sichtbarer,
globaler Diff isoliert halten). *§6-Beweis:* eigener Smoke; kein Katalog-/
Manifest-Eintrag → Gates grün.

**1.2 Manuelle Frist-Direkterfassung (DEFAULT-Pfad, Praxis-HOCH).** «Neue Frist
erfassen» auf `/meine-fristen`: Titel + Enddatum (Datepicker) + optional
Vorfrist/Mandatskürzel/Partei/Gericht/Aktenzeichen/Notiz → schreibt direkt einen
`FristenEintrag` (`endeISO` aus Datepicker, `endeText` via `formatDatum` — reines
Anzeige-Metadatum, kein Engine-Pfad). Fehlervalidierung erst nach erster Eingabe
(Daueranweisung David). *§6-Beweis:* nur Speicher+Seite → byte-gleich;
Render-Test CRUD-Roundtrip.

**1.3 Fälligkeits-Ampel + Vorfrist-Spalte + Erledigt-Haken (Praxis-HOCH).**
Default-Ansicht: offene Fristen, nächste Vorfrist zuoberst, überfällige rot oben;
Erledigte ausblendbar (abhaken **statt** löschen). «Heute» **einmal** in
`MeineFristen.tsx`, als Argument an reine Helfer. *§6-Beweis:* kein Engine-Pfad,
kein golden-gegateter Output berührt das «Heute» → byte-gleich; Test:
`ampelStatus(eintrag, heuteISO)` deterministisch.

**1.4 Sammel-Export** `src/components/fall/FristenListenExport.tsx`: (a) `.ics`
über bestehendes `icsSammel` (FristenEintrag→IcsFrist; **stabile UID je Frist**,
damit Outlook beim Re-Import *aktualisiert* statt dupliziert) und (b) PDF über
`pdfModel`/`PdfExportButton` mit **explizit gesetztem `jetzt`-FIX**.
*§6-Beweis:* `icsExport.ts`/`pdfModel.ts` nur aufgerufen, nicht editiert →
bestehende ICS-/PDF-Goldens byte-gleich; **neuer** Sammel-ICS-Golden über eine
**feste FristenEintrag-Matrix mit festen IDs + stabiler Sortierung** via
`npm run golden` (Re-Baseline) eingefroren; PDF-Snapshot mit FIX-Datum in
`pdf.test.ts`.

## Phase 2 — Säule 1 anschließen: «Frist merken» in die Fristenrechner

`src/components/fall/FristMerkenButton.tsx` (neben bestehendem
`IcsExportButton`/`LinkTeilenButton`). **Speichert nur `pathname+query()+hash`
— bewusst OHNE `location.origin`** (Abweichung vom IcsExportButton-Muster, §13).
Pro Rechner **ein** Schritt/Commit:

- **2.1 Pilot ZPO** (`ZpoFristenForm.tsx`). *§6-Beweis:* `zpoFristen.ts`
  unberührt → ZPO-Goldens byte-gleich; E2E: berechnen → merken → `/meine-fristen`
  zeigt Eintrag mit Datum/Norm; **Berufsgeheimnis-Assertion** (Permalink enthält
  kein `http`/origin), ausgedehnt auf die spätere `.lexmetrik`-Serialisierung.
- **2.2 SchKG** (`SchkgFristenForm.tsx`; Wartefrist-Präfix «frühestens ab»/Folgetag
  Art. 88 I korrekt übernehmen).
- **2.3a/2.3b/2.3c** je **einzeln**: `AllgemeineFristForm` · `EinfacheFristForm` ·
  `ErbFristenForm` (Erb prüfen: liefert ein Lauf **eine** oder mehrere datierte
  Fristen? Falls mehrere, Single-Zeilen-Annahme anpassen).
- **2.4 Fristenspiegel:** «Alle Fristen merken» aus `FristenspiegelErgebnis.zeilen`;
  nur `berechnet`/`bedingt` mit Datum, `ausgeschlossen`/`hinweis` übersprungen (§8).

Rechner ohne echte Frist (Beurkundung/Grundbuch/Zuständigkeit) bleiben außen vor (§8).

## Phase 3 — Säule 2: verschlüsselter Fall-Export/-Import (`.lexmetrik`)

**3.0 WebCrypto-in-vitest verifizieren** (trivialer `crypto.subtle.digest`-Test;
ggf. vitest-Env/Setup anpassen) — eigener Vorschritt, damit Krypto-Tests nicht
grau «skippen». *§6-Beweis:* additiv, keine Engine → byte-gleich.

**3.1 `src/lib/fall/fallCrypto.ts`** — AES-GCM-256 + **PBKDF2-HMAC-SHA256**
(bewusste native Wahl: kein WASM, CSP-rein, deterministisch; weniger speicher-hart
als Argon2 → durch hohe Iterationszahl kompensiert). **Härtungen aus der
Krypto-Linse (Pflicht):**
- Iterationen als **Konstante mit Floor 600 000** (OWASP 2023), nicht als freier
  Datei-/David-Wert; beim Entschlüsseln `iter` aus der Datei gegen `MIN_ITER`
  **hart ablehnen**, wenn darunter.
- **Decrypt-Allowlist:** nur `v===1 && alg==='AES-GCM' && kdf==='PBKDF2-SHA256'`,
  sonst kontrolliert ablehnen; `v>1` → «Datei aus neuerer Version».
- **AAD-Bindung** der Umschlag-Header ans GCM-Auth-Tag (Header sonst
  unauthentifiziert manipulierbar).
- **Chunked Base64** für große `ArrayBuffer` (kein `btoa`/Spread-Stackoverflow).
*§6-Beweis:* additiv → byte-gleich; Test: Roundtrip == Original; falsche
Passphrase wirft (kein stiller Klartext); `ct` ≠ Klartext-JSON; manipulierter
`alg`/`kdf`/`v`/`iter` abgelehnt; **Anti-Determinismus**: zwei Exports desselben
Inputs haben verschiedene `iv`/`salt`/`ct` (IV-Frische pro Aufruf).
**`.lexmetrik` ist bewusst NICHT golden-gegated** (per Design nicht-deterministisch).

**3.2 Export-UI** auf `/meine-fristen`: «Fall sichern (.lexmetrik)» mit
Passphrase-Dialog (**Pflicht-Hinweis: kein Backend, keine Wiederherstellung —
Passphrase verloren = Datei unbrauchbar**; Passphrase-Bestätigungsfeld gegen
Tippfehler — §8-Sichtbarkeit, kein Abnahme-Thema). `exportISO` nur an der
Schreibgrenze. *§6-Beweis:* nur Seite/Module → byte-gleich; E2E: Datei nicht leer,
Umschlag-Marker; leere Passphrase blockiert.

**3.3a Import (einfachste Strategie):** `.lexmetrik` laden → Passphrase →
entschlüsseln → `normalisiere` → Merge per `id` «vorhandenen behalten», atomar
(kein Teil-Import), Fehlerbox. **Still gedroppte Einträge sichtbar melden**
(«X von Y übernommen, Z verworfen») — ein verschluckter Fristeintrag ist ein
Fristversäumnis-Risiko, kein Kosmetik-Fehler (§8). *§6-Beweis:* kein Engine-Pfad;
Test Atomarität + Roundtrip Export→Import == normalisierte Liste.

**3.3b Wählbare Konflikt-Strategie** (behalten/überschreiben/zusammenführen) —
erst **nachdem** David den Default bestätigt hat.

## Phase 4 — Säule 3: Parteien/Stammdaten *(zurückgestellt, Praxis-MITTEL)*

Der Hebel pro Aufwand ist klein (ein Anwalt tippt ein Mandatskürzel schneller, als
er Stammdaten pflegt und per Sprung-Link transportiert). **Erst bauen, wenn
Säule 1 praxis-vollständig ist.** Pragmatischer Erst-Ersatz: **lokales
Autocomplete** für Mandatskürzel/Gericht aus bisher getippten Werten (rein lokal,
kein URL-Transport) — deckt ~90 % des Nutzens. Der ursprüngliche URL-Transport-
Weg (`PARTEI_LINK_SPEC` → `VorlagenSprung` → schwache Defaults, Priorität
Spec > Partei > Default; koPrefill nicht anfassen) bleibt als spätere Option.

## Phase 5 — Verzahnung & Gate-Vervollständigung

**5.1 Entdeckbarkeit** vertiefen (dezenter Zähler offener/fälliger Fristen). KEINE
Katalog-Karte (Bijektion). **5.2 Golden/Determinismus-Matrix** abschließen: feste
FristenEintrag/Partei-Matrix für Sammel-ICS (in `golden-outputs.ts`) und
Listen-PDF (Snapshot **in `pdf.test.ts` mit FIX**, NICHT in `golden-outputs.ts`);
Disjunktheits-Assertions Partei-Spec vs. bestehende Specs.

---

## Offene David-Entscheide

1. **ID-Mechanismus (0.0):** `crypto.randomUUID()` (pragmatisch, §2-zulässig weil
   außerhalb jeder Engine) **oder** Inhalts-Hash (strikt deterministisch)?
2. **«Heute»/Ampel:** Bestätigung, dass Fälligkeits-Ampel + Sortierung als reines
   Darstellungs-Metadatum (nie in einer Engine/golden-Output) ok ist (§2-Grenze).
3. **`.lexmetrik`-Import-Konflikt:** Default «behalten», «überschreiben» oder
   «zusammenführen»?
4. **localStorage-Klartext (§8):** Sollen sensible Freitext-Adressen überhaupt im
   Klartext-localStorage liegen — oder nur in der verschlüsselten Datei? Reicht ein
   UI-Hinweis + «Alle löschen» als Wipe?
5. **Sichtbarkeit** «Meine Fristen»: Header+Footer vs. zusätzlich Startseiten-Hinweis.

## Risiken (Kurz)

- §2: «Heute»/`exportISO`/Ampel **nie** in Berechnung oder golden-Input.
- §6: `icsExport`/`pdfModel`/`permalink` nur aufrufen; neuer Golden = Re-Baseline,
  nicht «byte-gleich».
- §13: kein `origin` im Permalink; `.lexmetrik` nie an ein Backend.
- §12: gebündelte Pfade (`src/lib/fall/`, `src/components/fall/`), Pathspec-Commits.
- Krypto: KDF-Floor + Decrypt-Allowlist + AAD; localStorage-Klartext ehrlich
  offenlegen; stille Eintrags-Drops beim Import sichtbar melden.
