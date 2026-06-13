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
