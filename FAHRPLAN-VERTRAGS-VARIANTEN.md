# FAHRPLAN VERTRAGS-VARIANTEN — Tiefe & Praxistauglichkeit (Ziel 1000 Vorlagen)

**Auftrag David 13.6.2026:** «verschiedene varianten von verträgen mit einfach
bis experte, auch untergruppen (Manager-Arbeitsvertrag, Lehrvertrag,
Handelsreisendenvertrag, Heimarbeitsvertrag …) und das gleiche bei allen
Vertragstypen. Ziel: 1000 Vertragsvorlagen. Mache Handlungsplan und setze ihn
um; melde dich erst, wenn alles abgeschlossen ist.» **Ultra-Modus** (maximale
Tiefe, Token kein Constraint).

**Architektur-Entscheid David (13.6.2026): «Voll modular».** Möglichst WENIGE
Katalog-Karten; alle Untertypen und Detailgrade leben als Varianten IM Wizard
der Basis-Vertragstypen. Distinkte OR-Regimes (Lehr-/Handelsreisenden-/
Heimarbeitsvertrag usw.) werden NICHT zu eigenen Karten, sondern zu
**regime-treuen internen Verzweigungen** (CLAUDE.md §4: interne Verzweigung,
nie Kollaps; §1: lieber Duplikat als eine Abstraktion, die zwei Fälle gleich
behandelt). Die «1000» ist die **kombinatorische Menge erzeugbarer Dokumente**
(Vertragstyp × Untertyp × Detailgrad × Module), nicht 1000 Karten.

## 0 · Leitplanken (für JEDE Phase, nicht verhandelbar)

- **§2 Determinismus:** jede Variante ist regelbasiert; kein LLM, keine
  Schätzung. Was Wertung wäre, wird offengelegt, nicht erzeugt.
- **§7 Normentreue:** jeder neue Untertyp-/Modul-Anker wird VOR der
  Implementierung am Fedlex-Cache verbatim verifiziert (`check:caches` →
  Extraktion → `check:zitate` 0 Befunde). Form-Zwänge (z. B. Schriftform
  Lehrvertrag Art. 344a, öffentliche Beurkundung Grundstückkauf/Bürgschaft
  > 2000) steuern `ausgabeArt` und damit die Export-Gates (§8).
- **§6 Golden:** Detailgrad-Default `standard` = byte-identischer Output zur
  heutigen Vorlage (jede Detailgrad-Einführung ist golden-bewiesen additiv).
  Neue Untertyp-/Experte-Fälle werden als eigene Golden-Fälle deklariert.
- **§4 Regime-Treue:** verschiedene OR-Regimes bleiben getrennte Schemas ODER
  klar getrennte interne `untertyp`-Zweige; gemeinsam nur fachneutrale
  Infrastruktur (engine, format, Datums-/CHF-Helfer, Detailgrad-Mechanik).
- **§5 SSoT / §3 Schichten:** Inhalt nur in `src/lib/vorlagen/`, Katalog nur in
  `startseiteConfig.ts`; der Detailgrad-/Untertyp-Schalter ist reine Darstellung.

## 1 · Framework (Rahmen ZUERST, §10) — verhaltensneutral, golden-bewiesen

Bevor Inhalte wachsen, wird der gemeinsame Rahmen gebaut (ein Commit,
Golden byte-gleich):

- **Detailgrad-Konvention:** Feld `detailgrad: 'einfach' | 'standard' | 'experte'`
  (Default `standard`). Bausteine erhalten `includeIf`-Bedingungen auf diesem
  Feld. `standard` reproduziert den heutigen Bestand byte-genau; `einfach`
  blendet Kür-Klauseln aus (Kernpflichten bleiben); `experte` ergänzt
  Zusatz-Module (Konkurrenzverbot, Pikett, IP/Arbeitsergebnisse, Spesen,
  Schiedsklausel, Gerichtsstand …).
- **Untertyp-Konvention:** Feld `untertyp` je Vertragstyp (z. B. Arbeitsvertrag:
  `einzel | kader | lehrvertrag | handelsreisender | heimarbeit`). Die Untertyp-
  Weiche schaltet regime-spezifische Pflicht-Bausteine + Form-Gates + Gates.
- **UI-Baustein `DetailgradSchalter`** (Wizard-Kopf, geteilt, §10): Segment-
  Schalter einfach/standard/experte; optional Untertyp-Wahl als Sub-Schalter.
- **Zähl-/Inventar-Konvention:** ein neues, maschinelles `variantenInventar`
  zählt die erzeugbaren Dokumente (Untertyp × Detailgrad × Pflicht-/Wahlmodule)
  je Karte und summiert sie → fortlaufender Fortschritt gegen das 1000-Ziel,
  als Test fixiert (kein stiller Schwund).

## 2 · Vertragstypen-Landkarte (Bau-Reihenfolge nach Praxiswert)

Jeder Basis-Typ bekommt: Untertypen (regime-treu) × Detailgrad (3) × Wahlmodule.
**Fett = in dieser Programm-Phase zu bauen; (E) = Engine existiert bereits.**

### Feld A — Arbeit & Personal (höchster Praxiswert, Flaggschiff)
- **Arbeitsvertrag (E)** → Untertypen: Einzel · **Kader/Manager** · **Lehrvertrag
  (Art. 344 ff., Schriftform!)** · **Handelsreisender (Art. 347 ff.)** ·
  **Heimarbeit (Art. 351 ff.)** · Teilzeit · befristet. Detailgrad einfach/
  standard/experte. Module: Probezeit, Überstunden/-zeit, Konkurrenzverbot
  (340 ff.), Geheimhaltung, IP/Arbeitsergebnisse, Spesen, Pikett, Homeoffice,
  Lohnfortzahlung/KTG, 13. ML, Boni.
- Aufhebungsvereinbarung (geplant) → Detailgrad + Saldoklausel-Module.

### Feld B — Auftrag & Dienstleistung
- **Auftrag (E)** → Untertypen Beratung/Treuhand/Inkasso/Mandat allgemein
  (bereits Module) + Detailgrad; Experte: Haftungsregelung, Substitution,
  Interessenkonflikt, Datenschutz/ADV-Modul.
- Mäklervertrag (412 ff.) · Agenturvertrag (418a ff.) · Kommission (425) —
  je eigene Engine (eigene Regimes).

### Feld C — Werk & Bau
- **Werkvertrag (E)** → Untertypen beweglich/unbeweglich (vorhanden) +
  Detailgrad; Experte: Zahlungsplan, Bauhandwerkerpfand-Hinweis, SIA-Bezug
  (nur Hinweis), Pönale, Abnahmeprotokoll-Modul.

### Feld D — Kauf & Übertragung
- Kaufvertrag (184 ff.) → Untertypen Fahrnis/Gebrauchtwagen/Tier/Grundstück
  (Beurkundung!)/Eigentumsvorbehalt/Sukzessivlieferung; Detailgrad.
- Tausch (237) · Schenkung (239 ff., Form-Weiche Hand/Versprechen).

### Feld E — Gebrauchsüberlassung
- Mietvertrag (E) → Detailgrad + Untertypen Wohn/Geschäft/Untermiete/Parkplatz/
  Möbliert. · Pacht (275 ff., Sach-/Landwirtschaft). · Gebrauchsleihe (305).

### Feld F — Geld, Kredit & Sicherheiten
- Darlehen (312 ff., geplant) → zins/zinslos, Konsum (KKG-Hinweis). · Bürgschaft
  (492 ff., Form-Weiche, Höchstbetrag) → einfach/solidarisch. · Schuld-
  anerkennung (geplant) · Zession (E) · Garantievertrag (111).

### Feld G — Zusammenarbeit & Immaterialgüter
- **NDA (E)** → Detailgrad + Untertyp Personal/M&A/IT. · Lizenzvertrag
  (innominat) · Kooperations-/JV (einfache Gesellschaft 530 ff.) · Franchise.

### Feld H — Familie & Vorsorge
- **Konkubinat (E)** → Detailgrad + Module. · Ehevertrag (geplant, Beurkundung,
  immer `entwurf`). · (Erbvertrag → Sektion Nachlass).

### Feld I — Gesellschaft
- Einfache Gesellschaft (530 ff.) · Aktionärbindungsvertrag (V6, geplant).

## 3 · Detailgrad-Inhaltsmatrix (Beispiel Arbeitsvertrag, Norm-verankert)

| Klausel | einfach | standard | experte |
|---|---|---|---|
| Parteien, Funktion, Beginn, Lohn, Pensum | ✓ | ✓ | ✓ |
| Probezeit, Kündigungsfristen (335 ff.) | ✓ | ✓ | ✓ |
| Ferien (329a), Lohnfortzahlung (324a) | – | ✓ | ✓ |
| Überstunden/Überzeit (321c), Spesen (327a) | – | ✓ | ✓ |
| 13. ML, Boni-Abgrenzung (322d) | – | ✓ | ✓ |
| Konkurrenzverbot (340 ff., Gates vorhanden) | – | opt | ✓ |
| Geheimhaltung, IP/Arbeitsergebnisse | – | – | ✓ |
| Pikett, Homeoffice, Nebenbeschäftigung | – | – | ✓ |
| Gerichtsstand/Schiedsklausel-Hinweis | – | – | ✓ |

«opt» = abwählbares Modul. Default `standard` = heutiger Output (golden-Beweis).

## 4 · Zähl-Methodik «1000» (transparent, kein Schaufenster-Schwindel)

Erzeugbare Dokumente je Karte = Σ über Untertypen von (Detailgrade ×
sinnvolle Pflicht-/Wahlmodul-Kombinationen, NUR rechtlich kohärente). Das
`variantenInventar` weist je Karte die Zahl aus; die Summe ist der ehrliche
Fortschrittsbalken. Beispiel-Schätzung Arbeitsvertrag: 5 Untertypen × 3
Detailgrade × Ø ~6 kohärente Modulprofile ≈ 90 Dokumente aus EINER Karte.
~15 ausgebaute Basistypen × Ø ~60 ≈ 900–1100. Ziel 1000 ist damit über die
ausgebauten Basistypen erreichbar, OHNE Karten-Flut.

## 5 · Phasen (jede Phase: V0-Norm → Schema-Zweige → Wizard → Golden/Gate → Commit)

- **P0 Framework** (§1) — Detailgrad-/Untertyp-Konvention + `DetailgradSchalter`
  + `variantenInventar` + Test. Golden byte-gleich.
- **P1 Arbeitsvertrag Vollausbau** (Flaggschiff) — 5 Untertypen inkl. der drei
  OR-Sonderregimes + Kader, Detailgrad, Module. Höchster Praxiswert, härteste
  Normlage (Schriftform Lehrvertrag, Provisions-/Saisonregeln Handelsreisender,
  Mängel-/Probezeit-Regeln Heimarbeit).
- **P2 Auftrag + Werkvertrag + NDA + Konkubinat** (E) — Detailgrad + Untertypen
  auf die vier frisch gebauten Karten.
- **P3 Kauf/Schenkung/Tausch** + **Miete/Pacht/Leihe** — Detailgrad + Untertypen.
- **P4 Geld & Sicherheiten** (Darlehen/Bürgschaft/Schuldanerkennung/Garantie).
- **P5 Dienstleistungs-Nebentypen** (Mäkler/Agentur/Kommission) + **Lizenz/
  Kooperation/Franchise**.
- **P6 Ehevertrag/Gesellschaft** + Lückenschluss bis zur 1000-Zählmarke.

**Realismus (offengelegt, §8):** Das ist ein MEHR-SESSION-Programm. Die
1000-er-Zählmarke wird über mehrere Sessions erreicht; jede Session liefert
fertig getestete, committete Inkremente (nie 1000 halbfertige Dateien). §1
(Korrektheit) hat IMMER Vorrang vor der Stückzahl.

## 6 · Push/Deploy

Unverändert §9: NUR auf Davids frisches Ja. Diese Programm-Phase baut lokal,
committet inkrementell; kein Push ohne ausdrückliche Freigabe.

## Abarbeitungs-Stand 13.6.2026 (Session «Vertrags-Varianten Start»)

**ERLEDIGT + committet (Gate je grün, Standard golden-neutral bewiesen):**
- **P0 Framework** (`7a475c3`): `lib/vorlagen/detailgrad.ts` (Feld + Helfer
  AB_STANDARD/NUR_EXPERTE), geteilter Kopf-Schalter `VariantenKopf`, optionaler
  `kopfSchalter`-Slot im Wizard-Rahmen. **Pilot Auftrag** (einfach blendet
  Umfang/Vollmacht aus; experte ergänzt Geheimhaltung 398 II / Haftung mit
  Schranke 100 I / Gerichtsstand).
- **P2-Teil** (`c6d832d`): Detailgrad einfach/standard/experte auf
  **Werkvertrag, NDA, Konkubinat** verdrahtet (VariantenKopf in allen
  Wizards). «Einfach bis experte» damit bei ALLEN vier V3-Vertragstypen real.

**NÄCHSTE SCHRITTE (Programm läuft weiter):**
- **P1 Arbeitsvertrag-Vollausbau (Flaggschiff, höchste Priorität):** Untertyp-
  Weiche Einzel/**Kader-Manager**/**Lehrvertrag (Art. 344 ff., SCHRIFTFORM
  344a → Form-Gate!)**/**Handelsreisender (347 ff.)**/**Heimarbeit (351 ff.)**
  als regime-treue interne Verzweigungen + Detailgrad. Norm-Anker bereits
  verifiziert (Session-Notiz). Der bestehende AV ist schon stark modular
  (probezeit/lohn/überstunden/GAV/konkurrenzverbot) — Untertyp + Detailgrad
  additiv aufsetzen, Standard/Einzel golden-neutral halten.
- **P2-Rest:** Detailgrad auf Mietvertrag/Arbeitsvertrag (bestehende grosse
  Engines).
- **P3–P6:** neue Basistypen (Kauf/Schenkung/Pacht/Leihe/Darlehen/Bürgschaft/
  Mäkler/Agentur/Lizenz/Gesellschaft …) je mit Untertyp × Detailgrad.
- **variantenInventar** (Zähl-Modul + Test) einführen, sobald die erste Karte
  mehrere Untertypen × Detailgrade trägt (P1) — ehrlicher Fortschrittsbalken
  Richtung 1000.

**ACHTUNG §12:** Während dieser Session lief eine PARALLEL-SESSION (legte
`FAHRPLAN-FUNDAMENT-UMBAU.md` an, untracked — Architektur-Umbau-Vorschlag, von
David noch nicht abgenommen). Künftige Commits strikt pathspec; deren WIP nicht
anfassen.

---

## 7 · P1 — Detail-Handlungsplan (14.6.2026, Auftrag «mache es wirklich gut»)

**Recherche-Grundlage (§11):** `bibliothek/recherche/arbeitsvertrag-untertypen.md`
— alle Sonderregime-Artikel 344–354 OR verbatim am Fedlex-Cache 20260101
verifiziert (Anker 27/27 OK, 14.6.2026).

**Architektur-Entscheid (§4, im Dossier begründet):** EINE Karte
`arbeitsvertrag`. **Einzel + Kader** = dasselbe 319-ff-Regime → bleiben in
`arbeitsvertrag.ts` (untertyp/detailgrad-gegatete Bausteine, golden-neutral für
einzel/standard). **Lehrvertrag / Handelsreisender / Heimarbeit** = je
distinktes Sonderregime → **eigene Schemas** (`lehrvertrag.ts`,
`handelsreisendenvertrag.ts`, `heimarbeitsvertrag.ts`) mit eigener Antworten-
Struktur, Gates, Tests; die AV-Seite dispatcht über `untertyp`. Lieber Duplikat
als kollabierende Abstraktion (§1), Regimes einzeln testbar (§4).

**Sub-Phasen (jede: V0-Norm verifiziert → Schema/Gates → Wizard → Test → Golden
deklariert → `gate:schnell` grün → eigener pathspec-Commit):**

- **P1a — Detailgrad auf Einzel + VariantenKopf** *(golden-neutral)*. Felder
  `detailgrad` (Default `standard`) + `untertyp` (Default `einzel`) in
  `AvAntworten`/`AV_DEFAULTS`. `einfach` blendet die rein deklaratorischen
  Klauseln (Treuepflicht-Wiedergabe A10, Datenschutz A11) aus; `experte`
  ergänzt IP/Arbeitsergebnisse (332 OR/17 URG), Nebenbeschäftigung (321a III),
  Recht & Gerichtsstand (Vorbehalt 34 ZPO). VariantenKopf in die Seite.
  Golden: `einzel`+`standard` byte-identisch (bestehende `vorl:av*`-Fälle),
  neue Fälle `av-einfach`/`av-experte` deklariert.
- **P1b — Untertyp Kader/Manager** *(gleiches Regime)*. untertyp=`kader`:
  leitende Stellung / ArG-Ausnahme (3 lit. d ArG, deklaratorisch offengelegt),
  variable Vergütung / Bonus-Abgrenzung (322d), Freistellung bei Kündigung.
  Golden neue Fälle.
- **P1c — Lehrvertrag** (`lehrvertrag.ts`, neues Schema). Schriftform =
  Gültigkeit (344a I) → `ausgabeArt`; Pflichtinhalt Art/Dauer/Lohn/Probezeit/
  Arbeitszeit/Ferien (344a II) als Pflicht-Felder + Gates; Probezeit 1–3 Mt.,
  Default 3 (344a III); KEIN nachvertragliches Konkurrenzverbot (344a VI,
  Blocker); Fachkraft/Schulzeit/5-Wochen-Ferien (345a); Kündigung regime-eigen
  (346: Probezeit 7 Tage, sonst fristlos 337); Zeugnis (346a); BBG-14-
  Genehmigungs-Hinweis. Unterschrift gesetzl. Vertretung bei Minderjährigkeit.
- **P1d — Handelsreisendenvertrag** (`handelsreisendenvertrag.ts`). Schriftform
  Soll (347a); Vollmacht Vermittlung/Abschluss (348b); Delkredere-Schranke ¼ +
  Provision (348a); Lohn fest ± Provision (349a), Ausschliesslichkeit/Provision
  Gebiet (349/349b), Auslagenersatz zwingend (349d), Retentionsrecht (349e),
  Saison-Kündigung (350), Provision bei Beendigung (350a). Gates für die
  Nichtigkeits-Schranken.
- **P1e — Heimarbeitsvertrag** (`heimarbeitsvertrag.ts`). Schriftliche
  Lohn-/Materialangabe vor Ausgabe (351a); Pflichten/Mängelhaftung
  Selbstkosten (352/352a); Prüfung 1 Woche (353); Lohn halbmonatlich +
  schriftliche Abrechnung (353a), Annahmeverzug/Verhinderung 324/324a (353b);
  Dauer/Probe-Vermutung (354).
- **P1f — `variantenInventar`** (Zähl-Modul + Test): zählt je Karte die
  erzeugbaren Dokumente (Untertyp × Detailgrad × kohärente Modulprofile),
  summiert → ehrlicher Fortschrittsbalken Richtung 1000; als Test fixiert.

**Leitplanken bleiben:** §1 Korrektheit vor Stückzahl · §6 jede Detailgrad-/
Untertyp-Einführung golden-bewiesen additiv · §7 jeder Anker am Cache
verifiziert · §12 pathspec-Commits, kein `git add -A`. Mehr-Session-Programm;
fertig getestete Inkremente, kein Push ohne Davids frisches Ja (§9).

### Abarbeitungs-Stand P1 (14.6.2026) — VOLLSTÄNDIG, ungepusht

**P1a–f erledigt + committet** (`52771cc`, `1b6baab`, `08405c2`, `67ca355`,
`0dc99eb`, `fba6475`; je Gate grün, golden additiv bewiesen, §7-Zitate 0 Befunde):

- **P1a** (`52771cc`): Detailgrad einfach/standard/experte auf den Einzelarbeits-
  vertrag (VariantenKopf); experte = Nebenbeschäftigung (321a III), Erfindungen/
  Arbeitsergebnisse (332 OR/17 URG), Recht & Gerichtsstand (34 f. ZPO).
- **P1b** (`1b6baab`): Untertyp Kader/Manager — leitende Stellung (3 lit. d ArG),
  Bonus (322d), Freistellung (324 II, experte).
- **P1c** (`08405c2`): Lehrvertrag (344–346a) als eigenes Schema + Dispatcher
  (EINE Karte, Vertragstyp-Wahl schaltet das Regime). Schriftform-Gültigkeit,
  Pflichtinhalt, Probezeit 1–3/Default 3, 5 Wochen Ferien, gesetzl. Vertretung,
  Zeugnis, BBG-14-Hinweis, kein Konkurrenzverbot (344a VI).
- **P1d** (`67ca355`): Handelsreisendenvertrag (347–350a) — Vollmacht, Provision/
  Lohn, Delkredere-Schranke, Auslagenersatz, Saison-Kündigung, Retention.
- **P1e** (`0dc99eb`): Heimarbeitsvertrag (351–354) — 351a-Schriftangabe, 352a-
  Haftungsschranke, 353-Wochenfrist, 353a/b-Lohn, 354-Dauer.
- **P1f** (`fba6475`): `variantenInventar` (test-fixiert): Arbeitsvertrag-Karte
  78 erzeugbare Dokumente, gesamt 120 = 12 % des 1000-Ziels.

**Gesamtstand nach P1:** alle 1481 Tests grün, Golden 185 byte-gleich,
check:zitate 837/0, Sweep widerspruchsfrei, Smoke (4 Regime-Seiten) ok. Normen
344–354 OR verbatim am Cache 20260101 verifiziert; Recherche in
`bibliothek/recherche/arbeitsvertrag-untertypen.md`. Fachliche Abnahme durch
David ausstehend (bewusst zurückgestellt, Ausbau-Direktive 14.6.2026).

**NÄCHSTE SCHRITTE (P2-Rest / P3):** Detailgrad auf Mietvertrag (grosse Engine);
neue Basistypen Kauf/Schenkung/Pacht/Leihe/Darlehen/Bürgschaft je mit Untertyp ×
Detailgrad; `variantenInventar` beim Ausbau jeder Karte nachführen.
