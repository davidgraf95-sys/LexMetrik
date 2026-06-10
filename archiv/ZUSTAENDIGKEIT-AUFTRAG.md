# Auftrag — Zuständigkeitsengine mit Vorlagen-Weiterleitung

**Stand:** 5. Juni 2026 · **Status:** Spezifikation (kein Code)
**Normbasis verifiziert gegen:** Fedlex-Filestore-HTML SR 272 ZPO,
Konsolidierung **20250101** (in Kraft, Revision «Verbesserung der
Praxistauglichkeit und der Rechtsdurchsetzung» per 1.1.2025) — empirisch
abgerufen 5.6.2026, nicht aus dem Gedächtnis (CLAUDE.md §7).
**Abnahme:** alles `entwurf` / `verified: false` bis zur Wort-für-Wort-
Prüfung durch David.

> Dieser Auftrag spezifiziert den Entscheidbaum so, dass die Engine eine
> **direkte Übersetzung** ist. Bundesrecht ist verifiziert (§3/§4); die
> Kantonsschicht (§6) ist datierte Parameter-Arbeit pro Kanton, beginnend
> mit BS. Die im prä-Session genannte Zahl «Urteilsvorschlag bis 5'000» war
> falsch — die Revision 2025 hat das auf **Entscheidvorschlag bis 10'000**
> geändert (Art. 210). Genau dafür §7.

---

## §1 Zweck

Der Nutzer klickt sich durch **Streitsache → Streitwert → Ort/Parteien** und
erhält:
1. die **zuständige Stelle** (Schlichtungsbehörde bzw. Gericht) mit Adresse,
2. **Verfahrensart** und **Schlichtungspflicht** mit Rechenweg + Norm-Pills,
3. einen CTA **«Weiter zur passenden Eingabe»**, der die Ziel-Vorlage
   (zunächst: Schlichtungsgesuch) vorbefüllt öffnet.

Reine deterministische Engine (§2 LexMetrik), eigene Engine ohne Fusion (§4),
kantonale Daten als datierte Parameter mit `stand`/`quelle` (§5/§7).

---

## §2 Scope MVP (Vorschlag — von David bestätigen/ändern)

| Achse | MVP-Festlegung | Begründung |
|---|---|---|
| **Streitsachen** | (a) Geldforderung / vermögensrechtlich allgemein · (b) Miete & Pacht Wohn-/Geschäftsräume · (c) Arbeitsrecht | klare Spezialgerichtsstände (Art. 33/34), eigene Schlichtungs-/Verfahrensregeln, passen zu vorhandenen/geplanten Vorlagen |
| **Kantone** | **BS zuerst** (Stammdaten existieren in `behoerden.ts`), dann verifizierte Zentral-Kantone | BS ist der Pilot des Schlichtungsgesuchs |
| **Ziel-Vorlage** | **Schlichtungsgesuch** — BS-Pilot generalisieren, BS-Daten zuerst | erstes Dokument im Verfahren ist fast immer das Schlichtungsgesuch |
| **Streitwert** | Nutzereingabe + **Plausibilitätshinweise**, keine Berechnung | Streitwertberechnung ist wertend → bewusst ausgeklammert (§12) |
| **Datenmodell** | Verzeichnis (Kanton → Stellentyp → konkrete Stelle + Adresse) + Zuständigkeitsregel | Engine-Ausgabeschicht; Wiederverwendung `behoerden.ts` |

---

## §3 Normbasis — VERIFIZIERT (ZPO, Konsolidierung 20250101)

Wortlaut empirisch gegen Fedlex-Filestore geprüft. Anker via `fedlex.ts`
(`eli/cc/2010/262/de#art_<n>`).

### 3.1 Sachliche / funktionelle Zuständigkeit
- **Art. 4** — kantonales Recht regelt sachliche/funktionelle Zuständigkeit;
  Streitwertberechnung nach ZPO. → *Kantonsschicht zwingend nötig.*
- **Art. 5** — einzige kantonale Instanz (IP, Kartell, Firma, UWG > 30'000,
  Klagen gegen Bund > 30'000, Sonderuntersuchung 697c–h OR, Kollektivanlagen,
  u. a.). *MVP: meist ausserhalb; als Weiche/Hinweis.*
- **Art. 6** — **Handelsgericht** (Kantone *können*; real: ZH/BE/AG/SG).
  Handelsrechtlich, wenn kumulativ: (a) geschäftliche Tätigkeit ≥ 1 Partei;
  (b) Streitwert **> 30'000** oder nicht vermögensrechtlich; (c) **beide**
  Parteien im HR (CH oder vergleichbar ausländisch); (d) **nicht** Arbeit/
  AVG/GlG/**Miete & Pacht Wohn-/Geschäftsräume**/landw. Pacht. → Miete und
  Arbeit sind **immer HG-ausgeschlossen**. Ist **nur die beklagte** Partei
  im HR → **Kläger wählt** HG ↔ ordentliches Gericht. Abs. 4 (Option):
  Streitwert ≥ 100'000 + geschäftlich + Zustimmung beider + internationaler
  Bezug → HG wählbar.
- **Art. 7** — Zusatzversicherungen zur soz. Krankenversicherung (einzige
  kant. Instanz, Kantone *können*). *MVP: ausserhalb.*
- **Art. 8** — direkte Klage oberes Gericht bei Streitwert **≥ 100'000** +
  Zustimmung Beklagte (2. Satz neu seit 1.1.2025). *MVP: Weiche/Hinweis.*
- **Art. 9** — Gerichtsstand nur zwingend, wenn das Gesetz es **ausdrücklich**
  vorschreibt; sonst (teil-)dispositiv.

### 3.2 Örtliche Zuständigkeit
- **Art. 10** (Fassung 1.1.2025) — Grundsatz: **Wohnsitz** (natürliche P.) /
  **Sitz** (juristische P.) der **beklagten** Partei.
- **Art. 32** — Konsumentenvertrag: Klage des **Konsumenten** → Gericht am
  Wohnsitz/Sitz **einer** Partei; Klage des **Anbieters** → Wohnsitz Beklagte.
- **Art. 33** — Miete/Pacht **unbeweglicher** Sachen → Gericht am **Ort der
  gelegenen Sache**.
- **Art. 34** — Arbeitsrecht → Wohnsitz/Sitz Beklagte **oder** Ort, an dem
  gewöhnlich gearbeitet wird (**Wahlgerichtsstand des Klägers**).
- **Art. 35** — **Verzichtsverbot (teilzwingend)** für Konsument, Mieter/
  Pächter von **Wohn-/Geschäftsräumen**, landw. Pächter, Arbeitnehmer/
  Stellensuchende: kein Verzicht zum Voraus / durch Einlassung. GSV erst
  **nach Entstehung** der Streitigkeit zulässig.

### 3.3 Schlichtungsverfahren
- **Art. 197** — Grundsatz: Schlichtungsversuch geht dem Entscheidverfahren
  voraus.
- **Art. 198** — Schlichtung **entfällt** u. a. bei: summarischem Verfahren
  (lit. a); Gewaltschutz 28b/28c ZGB; Personenstand; Kindesunterhalt;
  Scheidung; Auflösung eingetr. Partnerschaft; **SchKG-Klagen** (Aberkennung,
  Feststellung 85a, Widerspruch, Anschluss, Aussonderung, Kollokation, neues
  Vermögen 265a, Retention 284); Art. 7-Streitigkeiten; **Widerklage/
  Hauptintervention/Streitverkündung**; **gerichtlich gesetzte Klagefrist**;
  Bundespatentgericht.
- **Art. 199** — **Verzicht**: gemeinsam bei Streitwert **≥ 100'000**
  (Abs. 1); **einseitig** durch Kläger, wenn Beklagte Ausland/unbekannt oder
  GlG-Streit (Abs. 2); **Abs. 3 NEU (1.1.2025):** bei Art. 5/6/8 (einzige
  Instanz / HG) **Klage direkt beim Gericht**.
- **Art. 200** — **paritätische** Schlichtungsbehörde bei Miete/Pacht Wohn-/
  Geschäftsräume (Abs. 1) und bei GlG (Abs. 2).

### 3.4 Entscheidkompetenz der Schlichtungsbehörde
- **Art. 210** — **Entscheidvorschlag** (Terminologie Revision 2025): bei
  GlG; Miete/Pacht (Hinterlegung, Missbrauchsschutz, Kündigungsschutz,
  Erstreckung); übrige vermögensrechtliche **bis 10'000** (Abs. 1 lit. c —
  *vorher 5'000*).
- **Art. 212** — **Entscheid** der Behörde bei vermögensrechtlich **bis
  2'000**, auf Antrag des Klägers; mündliches Verfahren.

### 3.5 Verfahrensart
- **Art. 243** — **vereinfachtes Verfahren**: vermögensrechtlich **bis
  30'000** (Abs. 1); **streitwertunabhängig** (Abs. 2) u. a. GlG; Gewalt-
  schutz; **Miete/Pacht** (Hinterlegung/Missbrauch/Kündigungsschutz/
  Erstreckung); DSG-Auskunft Art. 25; Mitwirkungsgesetz; Zusatzversicherungen
  KVG. **Nicht** vor Art. 5/8-Instanz und Handelsgericht (Abs. 3).
- **Art. 247** — soziale Untersuchungsmaxime (von Amtes wegen) in 243-II-
  Sachen und — **bis 30'000** — in übriger Miete/Pacht und übrigen
  arbeitsrechtlichen Streitigkeiten.
- **Art. 248 ff.** — summarisches Verfahren (klare Fälle, vorsorgliche
  Massnahmen, freiwillige Gerichtsbarkeit). *MVP: nur als Negativ-Weiche
  (entfällt Schlichtung, Art. 198 lit. a).*

---

## §4 Entscheidbaum (Bundesrecht, kantonsunabhängig)

Reihenfolge der reinen Engine. Jeder Schritt liefert Ergebnisfelder +
Rechenweg-Zeilen + Norm-Pills + ggf. Warnungen/Weichen.

**A · Verfahrensart** (Art. 243/247/248)
- Miete-Schutzmaterie (Hinterlegung/Missbrauch/Kündigung/Erstreckung) →
  vereinfacht (streitwertunabhängig).
- sonst vermögensrechtlich & Streitwert ≤ 30'000 → vereinfacht.
- sonst → ordentlich. *(summarisch nur als Hinweis, ausserhalb MVP)*

**B · Schlichtungspflicht** (Art. 197–199)
- Grundsatz: obligatorisch.
- entfällt, wenn 198 greift (MVP-relevant: Widerklage, gesetzte Klagefrist,
  summarisch — alle als Weiche/Frage).
- Verzicht: gemeinsam ab 100'000; einseitig bei Ausland/unbekannt/GlG;
  direkt ans Gericht bei Art. 5/6/8.

**C · Schlichtungsbehörde-Typ** (Art. 200)
- Miete Wohn-/Geschäftsräume → **paritätische** Schlichtungsbehörde Miete.
- GlG → paritätische (Weiche, falls Arbeit + GlG).
- sonst → ordentliche Schlichtungsbehörde (Friedensrichter/Vermittleramt/
  Schlichtungsbehörde — **kantonaler Name**, §6).

**D · Entscheidkompetenz Schlichtung** (Art. 210/212)
- vermögensrechtlich ≤ 2'000 → Entscheid auf Antrag möglich.
- Entscheidvorschlag möglich: GlG; Miete-Schutzmaterie; übrige
  vermögensrechtliche ≤ 10'000.

**E · Örtliche Zuständigkeit** (Art. 9/10/32–35)
- Geldforderung: Konsumentenvertrag → Art. 32; sonst Grundsatz Art. 10
  (Erfüllungsort Art. 31 als spätere Erweiterung).
- Miete unbewegliche Sache → Art. 33 (Ort der Sache); teilzwingend (Art. 35).
- Arbeit → Art. 34 (Beklagtensitz **oder** Arbeitsort, Klägerwahl);
  teilzwingend (Art. 35).
- GSV nur nach Entstehung der Streitigkeit (Weiche + Hinweis).
- → Ergebnis: **Ort** → Auflösung zur konkreten Stelle in §6.

**F · Sachlich-funktionelle Zuständigkeit** (Art. 4/5/6/8) — **Kantonsschicht**
- Handelsgericht-Prüfung (nur HG-Kantone; Miete/Arbeit ausgeschlossen;
  «nur Beklagte im HR»→Klägerwahl als Weiche; Abs.-4-Option als Weiche).
- einzige Instanz Art. 5 / direkte Klage Art. 8 → Weiche/Hinweis.
- sonst erstinstanzliches Gericht; Einzelgericht ↔ Kollegium nach
  **kantonaler** Streitwertgrenze (§6).

---

## §5 Engine-Vertrag (Skizze — früh fixieren, dann stabil)

```ts
// src/lib/zustaendigkeit.ts  (rein, deterministisch)
type Streitsache = 'geldforderung' | 'miete_wohn_geschaeft' | 'arbeit';
type Parteirolle = 'klaeger_geschuetzt' | 'klaeger_anbieter' | 'sonstige';

interface ZustaendigkeitInput {
  streitsache: Streitsache;
  unterfall?: string;            // z. B. Miete: kuendigungsschutz | mietzins | ...
  streitwertCHF: number | null;  // null = nicht vermögensrechtlich
  vermoegensrechtlich: boolean;
  beklagteImHR: boolean;
  klaegerImHR: boolean;
  beklagteAuslandOderUnbekannt: boolean;
  gsvNachEntstehung?: boolean;
  // Orts-Eingaben (→ Kantonsschicht): PLZ/Gemeinde
  beklagtenOrt?: string; lageOrt?: string; arbeitsort?: string;
  kantonForum: string;           // abgeleitet aus gewähltem Gerichtsstand
}

interface ZustaendigkeitErgebnis {
  verfahrensart: 'vereinfacht' | 'ordentlich' | 'summarisch';
  schlichtung: { obligatorisch: boolean; entfaelltGrund?: string;
                 verzichtGemeinsam: boolean; verzichtEinseitig: boolean;
                 behoerdeTyp: 'ordentlich' | 'paritaetisch_miete' | 'paritaetisch_glg' };
  entscheidkompetenz: { entscheidAufAntrag: boolean; entscheidvorschlag: boolean };
  oertlich: { gerichtsstand: string; teilzwingend: boolean; normen: Normverweis[] };
  stelle?: KantonStelle;         // aus §6 aufgelöst (Adresse)
  rechenweg: Rechenschritt[];
  warnungen: string[];
  weichen: string[];             // offengelegte Ermessens-/Wahlfragen
  zielVorlage?: { schemaId: string; prefill: Record<string,string> };
}
```

**Bundes-Schwellen zentral** (`ZPO_SCHWELLEN`): `VEREINFACHT = 30000`,
`ENTSCHEIDVORSCHLAG = 10000`, `ENTSCHEID_AUF_ANTRAG = 2000`,
`VERZICHT_GEMEINSAM = 100000`, `HANDELSGERICHT_MIN = 30000`,
`HG_OPTION_MIN = 100000`, `DIREKTKLAGE_MIN = 100000`.

---

## §6 Kantonsschicht — Datenmodell (BS als Muster)

Datierte Parameter-Datei `src/data/zustaendigkeitKantone.ts` (Pflege wie
`AV_MINDESTLOEHNE`: `stand` + `quelle` + Rhythmus «bei GOG-Revision»).

```ts
interface KantonZustaendigkeit {
  kanton: string; stand: string; quelle: string;
  handelsgericht: boolean;                 // Art. 6 umgesetzt?
  einzelgerichtBisCHF: number | null;      // Schwelle Einzel ↔ Kollegium (kant.)
  schlichtungOrdentlich: StellenRef;       // Friedensrichter/Vermittleramt/SB
  schlichtungMiete: StellenRef;            // paritätische SB Miete (Art. 200)
  erstinstanz: StellenRef;                 // Zivilgericht/Bezirksgericht
  obereInstanz: StellenRef;                // Appellations-/Obergericht (Art. 8)
  // geografische Auflösung Gemeinde/PLZ → Bezirk/Kreis → konkrete Stelle
  ortAufloesung: (plzOderGemeinde: string) => StellenRef | null;
}
```

`StellenRef` verweist auf **bestehende** `behoerden.ts`-Adressen (kein
Zweitbestand, §5). **Nicht erfasster Kanton** → ehrliches «noch nicht
erfasst» + manuelle Adresseingabe (Muster existiert).

**BS (Muster, Daten vorhanden):** kein Handelsgericht; Zivilgericht
Basel-Stadt als Erstinstanz; staatliche Schlichtungsbehörde + Mietschlichtung;
Appellationsgericht als obere Instanz; Gemeinden Basel/Riehen/Bettingen.
*Kantonale §§ (GOG/EG ZPO) sind offene Verifikation, §11.*

---

## §7 SSoT-Konsolidierung mit dem BS-Piloten (wichtig)

Die Bundes-Schwellen liegen **heute** in `schlichtungsgesuchBs.ts`
(`SG_SCHWELLEN`: ENTSCHEIDVORSCHLAG 10000, ENTSCHEID_AUF_ANTRAG 2000,
VERZICHT_GEMEINSAM 100000 — alle korrekt). Beim Bau der Engine:
**`ZPO_SCHWELLEN` wird die Single Source**, und `schlichtungsgesuchBs.ts`
**importiert** daraus, statt sie zweitzudefinieren (§5). Verhaltensneutral:
Werte sind identisch → Golden-Outputs des Schlichtungsgesuchs müssen vor/
nach gleich bleiben (§6 Beweisprotokoll).

---

## §8 Weiterleitung in die Vorlage

Query-Prefill nach dem bestehenden Muster (`fristQueryKodieren` im
Tagerechner). Die Engine übergibt `{kanton, behoerde, streitwert,
streitsache, parteirollen}`; die Ziel-Vorlage (Schlichtungsgesuch) übernimmt
sie als **Vorbelegung**, voll editierbar. CTA **nur**, wenn Ziel-Vorlage
existiert **und** Stelle erfasst — sonst ehrlich ausgeblendet.

---

## §9 Phasen-Bauplan

Jede Phase: Status `entwurf`, §6-Gate (`tsc -b` · `npm test` · `npm run lint`
· `npm run build` · SSR-Smoke), Golden-Outputs wo Text/Bericht entsteht;
kein Push/Deploy ohne Davids Ja (§9 CLAUDE.md).

| Phase | Deliverable | Definition of Done |
|---|---|---|
| **0** | dieser Auftrag + Anker-Verifikation | Bundes-Anker build-verifiziert (erledigt: 20250101); Davids Scope-Ja |
| **1** | `zustaendigkeit.ts` + Typen + `ZPO_SCHWELLEN` (Bundesrecht, **ohne** konkrete Stelle) | Entscheidbaum-Gitter grün; Norm-Pills via `fedlex.ts` (`verified:false`) |
| **2** | `zustaendigkeitKantone.ts` (BS), Auflösung Ort→Stelle via `behoerden.ts`; SG_SCHWELLEN→Engine heben (§7) | BS end-to-end; SG-Golden-Outputs unverändert |
| **3** | `RechnerZustaendigkeit.tsx` auf generischem Wizard; Katalog-Eintrag; PDF-Bericht (`zuordnung`) | SSR-Smoke; Ergebnis-Karte mit Rechenweg/Weichen/Warnungen |
| **4** | Weiterleitung → Schlichtungsgesuch (Prefill) | BS + Geldforderung + Schlichtungsgesuch durchklickbar |
| **5** | weitere Kantone / Streitsachen / Ziel-Vorlagen | gestuft (§10 CLAUDE.md) |

**MVP-Schnitt:** Phase 1–4 mit **BS + Geldforderung + Schlichtungsgesuch**
end-to-end, dann verbreitern.

---

## §10 Teststrategie

- **Entscheidbaum-Gitter** (Phase 1): Streitsache × Streitwert an den
  **Schwellen** (1'999/2'000/2'001 · 9'999/10'000 · 29'999/30'000/30'001 ·
  99'999/100'000) × Gerichtsstand-Konstellationen × HR-Eintrag (für HG).
- **Negativfälle:** Schlichtung entfällt (Widerklage, gesetzte Frist,
  summarisch); nicht vermögensrechtlich (Streitwert null).
- **Kantons-Tests** (Phase 2): je Kanton ein Satz; BS-Auflösung
  Gemeinde→Stelle; nicht erfasster Kanton → Fallback.
- **Regression SG-Pilot:** Golden-Outputs vor/nach §7-Konsolidierung gleich.

---

## §11 Offene Verifikationen (in der UI offenlegen)

- **Kantonale §§** (GOG / EG ZPO je Kanton): Einzelgericht-Schwelle,
  Stellennamen, Bezirks-/Kreiseinteilung — **pro Kanton einzeln** gegen das
  kantonale Recht zu verifizieren (wie SG-Pilot bei BS).
- **HG-Kantone** (ZH/BE/AG/SG) und deren Zusatz-Zuständigkeiten (Art. 6
  Abs. 3/4) — kantonal bestätigen.
- **BS-Stammdaten** (Adressen/PLZ 4001/4051) — bereits offene Verifikation
  des SG-Piloten; übernehmen.

---

## §12 Bewusst ausgeklammert (sonst unseriös, §2/§8 LexMetrik)

Internationale Sachverhalte (IPRG/LugÜ) · **Streitwertberechnung** selbst
(Nutzer gibt ein; nur Plausibilitätshinweise) · Gerichtsstandsvereinbarung
(nur Weiche «liegt vor? → Hinweis», Art. 35) · Schiedsklauseln · Erfüllungs-
ort Art. 31 (spätere Erweiterung) · alle Ermessens-Grenzfragen («geschäftlich»
i. S. v. Art. 6, Konsumentenvertrags-Qualifikation) → **offengelegte Weiche
mit Warnung, nie stille Subsumtion**.

---

## §13 Ehrlichkeit & Status

Alle Norm-Pills `verified: false`; Eintrag `entwurf` (oranger Rand) bis zu
Davids fachlicher Abnahme. Die Engine sagt, **was** sie kann und **was
nicht** (nicht erfasste Kantone, ausgeklammerte Fälle, Weichen). Keine
Rechtsberatung; Ausgabe ist regelbasierte Orientierung mit Norm-Verweis.

---

*Erstellt 5.6.2026. Bundesrechts-Anker (ZPO 20250101) empirisch gegen
Fedlex-Filestore verifiziert; ersetzt keine fachliche Abnahme.*
