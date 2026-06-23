# Darstellungs-Reglement Rechtsprechung — verbindliches Schriftbild der Entscheid-Anzeige

Stand: 23.6.2026. Geltungsbereich: die Rechtsprechungs-Rubrik (Übersicht
`/rechtsprechung` + Reader `/rechtsprechung/:key`). Schwester zu
`DESIGN-REGLEMENT-RECHNER.md` (Rechner-Seiten) und `DESIGN-REGLEMENT-VORLAGEN.md`
(Dokument-Outputs).

**Das Verbindliche ist der Code** (`src/pages/EntscheidLeser.tsx`,
`src/components/rechtsprechung/EntscheidBody.tsx`, `…/EntscheidKarte.tsx`,
`…/EntscheidFilter.tsx`); diese Notiz hält das *Warum* + die belegten Sollwerte
fest. Token-Quelle bleibt `tailwind.config.js` (Typo-Skala, `--font-serif/sans`,
`maxWidth.reading`) — dieses Reglement erfindet keine neuen Magic-Numbers,
sondern bindet an bestehende Tokens.

Leitidee: **Der Entscheid-Reader bildet die amtliche Gliderung treu ab
(Regeste → Sachverhalt → Erwägungen → Dispositiv), liest sich wie ein gutes
Buch und zitiert sich wie ein Kommentar.** Treue zur amtlichen Quelle (§7/§8)
schlägt jede Politur.

---

## Evidenzlage (worauf die Sollwerte fussen)

Recherche 23.6.2026, Primärquellen verifiziert. Zwei Befunde sind tragend:

1. **Die führenden Schweizer Anzeigen sind typografisch schwach.** bger.ch und
   entscheidsuche.ch (`/docs/`) rendern den amtlichen Rohtext in **Times, 16px,
   volle Fensterbreite, ohne Lesespalten-Begrenzung** — Zeilenlängen weit über
   dem lesbaren Mass. entscheidsuche.chs eigener Viewer (`/dok/`) nutzt Open
   Sans 16px/1.5; Weblaw/Lawsearch (frei über bvger.weblaw.ch) ist mit
   **Poppins 16px/1.75, ~545px Lesespalte, linksbündig** die mit Abstand
   beste Lesetypografie im CH-Feld. Schlussfolgerung: **eine bewusst gesetzte
   Lesespalte + ruhiger Body schlägt die amtlichen Anzeigen** — das ist der
   leicht erreichbare Vorsprung.
2. **Kein ECLI für Schweizer Gerichte.** ECLI ist ein EU-System; die Schweiz
   verwendet es amtlich nicht. Zitiert wird **BGE/ATF + Band + Teil (röm.) +
   Seite + E.** (`BGE 145 III 72 E. 2.3`), unpubliziert per Aktenzeichen
   (`BGer 6B_1293/2023 vom …`). **Nie eine ECLI:CH:BGER-Form erfinden.**
   (Quellen: corporate-law-club.ch, Wikipedia «Entscheidungen des
   Schweizerischen Bundesgerichts», Abwesenheit über bger.ch/entscheidsuche/
   Weblaw bestätigt.)

Lese-Typografie (Primärquellen, exakt verifiziert):
- **Lesespalte 50–75 Zeichen**, Ideal ~66 (Bringhurst via webtypography.net;
  Butterick 45–90; Baymard 50–75 / Ruder 50–60). WCAG 1.4.8 (AAA) kappt bei 80.
- **Body 16–20px** (Butterick 15–25px web).
- **Zeilenhöhe 1.5** — trifft den WCAG-1.4.12-Boden (line-height ≥ 1.5× ist
  Pflicht, damit Nutzer-Text-Overrides nicht brechen) und liegt am oberen Rand
  von Buttericks 120–145 %.
- **Absatzabstand ≥ 2× Schriftgrad** (WCAG 1.4.12).
- **Kontrast ≥ 4.5:1** (Body), ≥ 3:1 (grosse Schrift ≥ 24px / 18.5px bold);
  Werte NICHT runden (WCAG 1.4.3). **200 %-Zoom muss tragen** (WCAG 1.4.4).
- **Serif/Sans am HD-Bildschirm frei** — die alte Regel «Bildschirm = Sans» ist
  überholt (NN/g). Serif ist für langen Lesefluss legitim; Sans ist für
  Sehbehinderte minimal sicherer.
- **79 % scannen, ~20–28 % der Wörter werden gelesen; F-Muster** → linker
  Zeilenanfang + erste Zeilen bekommen die meiste Aufmerksamkeit (NN/g).

Randziffern/Marginalien:
- **Randnummern** sind die zitierfähige Einheit, am Rand «hervorgehoben»; sie
  sind seitenunabhängig stabiler als Seitenzahlen (Wikipedia «Randnummer»).
  Einschub-Konvention: Suffix-Buchstabe (`12a`) hält alte Zitate gültig.
- **Sidenotes/Marginalien sind am Web schneller zu erfassen** als
  Fuss-/Endnoten (gwern; Bringhurst). Tufte-CSS-Muster: Float am rechten Rand,
  **Kollaps bei ≤ 760px** zwingend (sonst verschwinden sie). Eine *kurze*
  Randziffer kollidiert nicht — der Float ist risikoarm, der Mobil-Fallback
  Pflicht.
- **`font-variant-numeric: tabular-nums`** richtet die Ziffernspalte aus (10,
  11 fluchten) — nicht eine Monospace-Klasse auf den ganzen Block (bräche den
  Fliesstext). Produktionsfont auf `tnum` prüfen.

Referenz-Anzeigen (DE/Intl): **BVerfG** = sauberstes amtliches Modell (Serif,
Leitsätze als Top-Block, durchlaufende Randnummern als Zitiereinheit, TOC
verankert auf Rn., je Entscheid PDF + EN-Übersetzung). **dejure.org** =
Goldstandard der Inline-Verlinkung (jede Norm + jedes Präjudiz inline verlinkt,
Norm-Überschrift im Tooltip — aber Body voll breit Verdana 13px, schwach).
**CourtListener** (Redesign 03/2025) = Reader-Vorbild: sticky «Jump To»-TOC,
**klick-/teilbare Seitenmarken am Rand** als Pin-Cite, `eyecite` verlinkt eine
Zitierung nur bei eindeutiger Auflösung, OCR-Provenienz offen ausgewiesen.
**vLex** = Reader-Steuerung (Schriftgrösse/Font/Ausrichtung, Reader-View) +
Treatment-Farben (grün/rot/grau). **Westlaw KeyCite / Lexis Shepard's** =
mentales Modell der Juristen für Status-Farben (rot/gelb/grün).

---

## R · Die Gestaltungsregeln (priorisiert)

Priorität: **P0** = Lesbarkeits-Fundament (sofort), **P1** = Zitier-/Navigations-
Handwerk, **P2** = Ausbau/Differenzierer. Jede Regel: Sollwert · Begründung/Quelle.

### P0 — Lese-Fundament

**R1 · Lesespalte 60–75 Zeichen (Body), nicht breiter.**
Body-Container auf eine Mass-begrenzte Spalte (~`38–42rem`, Ziel ~66 ch). Der
aktuelle Reader-Body steht auf `max-w-[56rem]` — **das ist zu breit** (≈
90–110 Zeichen bei 1.08rem Serif) und der einzige echte Lesbarkeitsfehler im
Bestand. Auf `max-w-reading` (40rem) oder eng darüber zurücknehmen.
*Quelle:* Bringhurst/Butterick/Baymard 50–75 ch; WCAG 1.4.8 Kappe 80.

**R2 · Body Serif, 1.08–1.125rem, Zeilenhöhe 1.7.**
Beibehalten (`font-serif text-[1.08rem] leading-[1.7]`). Serif ist für langen
juristischen Lesefluss legitim (NN/g: «Bildschirm = Sans» ist überholt) und
hebt den Reader gegen die Sans-lastigen Anbieter ab. 1.7 liegt über dem
WCAG-Boden 1.5. *Quelle:* NN/g Serif/Sans; WCAG 1.4.12; Butterick.

**R3 · Linksbündig, nicht Blocksatz.**
Kein `text-justify` (CSS-Blocksatz ohne Silbentrennung reisst Wortlücken auf).
Weblaw/Lawsearch — die beste CH-Anzeige — ist bewusst linksbündig.
*Quelle:* Weblaw-DOM; Lesetypografie-Konsens.

**R4 · Kontrast ≥ 4.5:1, 200 %-Zoom tragfähig.**
Body-Ink gegen Paper ≥ 4.5:1, gedämpfte Meta/Randziffern ≥ 4.5:1 (nicht nur
«sieht grau genug aus»). Layout muss 200 % Zoom + Nutzer-Text-Spacing
(line-height 1.5, Wortabstand) überstehen — keine festen Höhen, die clippen.
*Quelle:* WCAG 1.4.3 / 1.4.4 / 1.4.12 (normativ, Werte nicht runden).

**R5 · Absatzabstand ≥ 2× Schriftgrad.**
Zwischen Blöcken/Absätzen sichtbarer Abstand (aktuell `space-y-4` ≈ 1rem — bei
1.08rem Body grenzwertig; auf ~1.4–1.6rem zwischen Erwägungs-Blöcken gehen).
*Quelle:* WCAG 1.4.12.

### P1 — Zitier- & Navigations-Handwerk

**R6 · Erwägungs-Ziffern als Randmarke links, `tabular-nums`, hierarchisch eingerückt.**
Beibehalten + härten: Grid `[5rem_minmax(0,1fr)]`, Marke rechtsbündig im Gutter,
`num`/`tabular-nums`, Einrückung nach Tiefe. Die Marke ist die **amtliche
Zitiereinheit** (`E. 2.3`) — sie muss fluchten und stabil sein. Auf Mobil
(< `lg`) kollabiert sie vor den Absatz (bereits so) — Tufte-konformer
Pflicht-Fallback. *Quelle:* Wikipedia «Randnummer»; BVerfG-Konvention; Tufte-CSS
≤ 760px-Kollaps; `tabular-nums` (MDN).

**R7 · Jede Erwägung ist ein Anker + Pin-Cite-Permalink.**
Jeder Erwägungs-Block bekommt eine stabile `id` (z. B. `e-2-3`) und einen
kopierbaren Permalink (Hover-§-Symbol → `…/:key#e-2-3`). Das ist der Pin-Cite,
den Juristen erwarten (CourtListener-Seitenmarken; BVerfG-Rn.; «pincite = Rn.»).
**Stabilität ist Pflicht:** Nummerierung folgt der amtlichen Erwägung, nie einer
selbst gezählten Reihenfolge (openjur-Offset-Falle). *Quelle:* CourtListener
2025; tarlton.law «pincites»; openjur-Kritik.

**R8 · Regeste als abgesetzter Block, Serif 1.1rem/1.7, mit Quellennennung.**
Beibehalten (`lc-highlight`, `font-serif text-[1.1rem] leading-[1.7]`,
Quellenzeile). Die Regeste ist redaktioneller Leitsatz, optisch klar vom
Urteilstext getrennt — wie BVerfG (Top-Block) und juris (Leitsatz vs.
Orientierungssatz). Quelle der Regeste IMMER ausweisen (§8). *Quelle:* BVerfG;
juris; bger.ch `id="regeste"`.

**R9 · Sticky Sprung-Navigation = amtliche Gliederung.**
Beibehalten: sticky Chip-Leiste Regeste · Sachverhalt · Erwägungen · Dispositiv,
nur tatsächlich vorhandene Ziele, `scroll-mt`/`scroll-margin-top` gegen
Verdeckung. *Quelle:* CourtListener `#opinion-toc`; BVerfG-Inhaltsverzeichnis;
NN/g In-Page-Links (sticky braucht scroll-margin).

**R10 · Zitierung im Kopf, BGE/BGer-Form, `num`/`tabular-nums`, KEIN ECLI.**
H1 = amtliche Zitierung (`BGE 145 III 72` bzw. `BGer 6B_1293/2023`),
Datum/Band als `num`. **Keine ECLI:CH-Form** generieren oder anzeigen.
*Quelle:* corporate-law-club.ch; Wikipedia BGE; ECLI-Abwesenheit CH.

**R11 · Genannte Bundesnormen inline verlinkt, nur bei eindeutiger Auflösung.**
Beibehalten (`NormText` → Gesetzessammlung). Regel wie dejure/eyecite: **Link
nur, wenn das Ziel existiert** — kein Link ins Leere. Norm-Kurzinfo im
`title`/Tooltip ist der dejure-Mehrwert (P2). *Quelle:* dejure «Vernetzung»;
eyecite `annotate()` bei eindeutiger Auflösung.

**R12 · «Kopieren mit Fundstelle».**
Knopf, der markierten Text + automatische, korrekte CH-Zitierung
(`… , E. 2.3, in: LexMetrik`) liefert; pro Erwägung «Fundstelle kopieren».
Auto-Zitat NICHT blind vertrauen — Norm/Stelle bleibt verifizier-/editierbar
(Davids «Norm + Link + Stand»). *Quelle:* Westlaw «Copy with Reference»; Lexis;
citeblog (Auto-Zitate unzuverlässig).

**R13 · Amtliche Seitenmarken inline erhalten (wenn in der Quelle).**
Liegt im Rohtext eine Seitenmarke (`BGE 142 III 210 S. 211`), inline als kleine,
gedämpfte Marke erhalten — sie ist der klassische Pin-Cite der amtlichen
Sammlung. *Quelle:* bger.ch (verifiziert); CourtListener Star-Pagination.

### P1 — Übersicht (Karten + Filter)

**R14 · Entscheid-Karte: Anker · Gericht · Datum · Sachgebiet · Kurzregeste · Status-Chip.**
Beibehalten + ergänzen: BGE-Referenz/Aktenzeichen als Anker (`num`), Gericht,
Datum, Sachgebiet, Kurzregeste (`line-clamp-3`), Norm-Chips. Ergänzen:
**Status-/Treatment-Chip** (s. R16) und sichtbar, ob maschinell erfasst (§8).
*Quelle:* entscheidsuche-Felder (court/canton/date/abstract); vLex-Karte.

**R15 · Facetten: Kanton → Gericht (Hierarchie) + Datum + Sprache + Sachgebiet, mit Trefferzahl.**
Filter als Hierarchie (entscheidsuche-Modell), **Trefferzahl je Facette**
(verhindert Null-Treffer-Klicks), jargonfreie Labels (Kanton/Gericht/
Sachgebiet/Jahr). Sachgebiet auf kontrolliertem Vokabular (Jurivoc-nah), da die
freie Quelle keine Rechtsgebiet-Facette mitliefert. Mobil: Filter-Tray über den
Resultaten. *Quelle:* entscheidsuche-API; NN/g Faceted Search; Jurivoc (bger.ch).

### P2 — Ausbau / Differenzierer

**R16 · Status-Farben nach KeyCite/Shepard's-Schema.**
Falls Entscheid-Status erfasst wird (bestätigt/relativiert/überholt):
**grün = good law, gelb = negative Behandlung, rot = überholt/aufgehoben** —
das mentale Modell, das Juristen schon haben. Farbe NIE allein tragend (A11y):
immer Text-Label dazu. *Quelle:* law.uc.edu KeyCite-Markings; vLex; WCAG (Farbe
nicht allein).

**R17 · Reader-Steuerung: Schriftgrösse + ruhige Lesesicht.**
Klein gehaltener Umschalter (Schriftgrad A−/A+, optional Serif/Sans), Wert im
Modul-Store (analog `ausgabeStil.ts`, `useSyncExternalStore` + localStorage).
*Quelle:* vLex «Text options» / Reader view.

**R18 · «Maschinell erfasst»-Provenienz offen, nicht versteckt.**
Bei automatisch extrahierten Texten/Regesten Status-Badge + Fuss-Disclaimer
(bereits angelegt). Fehlt die Gliederung, ehrlich ausweisen statt Struktur
vortäuschen (`EntscheidBody`-Fallback). *Quelle:* CourtListener OCR-Disclaimer;
§8; Davids Status-Marker-Direktive.

**R19 · Provenienz-Fuss: massgebliche Fassung verlinkt + URG-Hinweis.**
Beibehalten: Link zur amtlichen Quelle, «ersetzt amtliche Fassung nicht»,
Art. 5 URG (Urteil gemeinfrei, Regeste redaktionell). *Quelle:* §7/§8; URG.

**R20 · Back-to-Top erst > ~4 Bildschirme, unten rechts, mit Label.**
Bei langen Entscheiden ein ruhiger «Nach oben», nicht früher. *Quelle:* NN/g
Back-to-Top.

**R21 · Mobil: keine Querscrollung, Body 16px/1.5+ erhalten, Randziffer inline.**
< `lg`: Randziffer vor den Absatz, Sprung-Chips horizontal scrollbar (beides
vorhanden), kein horizontaler Scroll, Spalte ~minus Gutter. *Quelle:* Tufte
≤ 760px; WCAG Reflow 1.4.10; Weblaw-Mobiltest.

**R22 · Reading-Progress-Bar: NICHT einbauen (höchstens A/B).**
Evidenz gemischt, kein etablierter Best-Practice. Weglassen. *Quelle:* uxdesign
Pros/Cons; NN/g.

---

## Gliederung «Darstellungs-Reglement Rechtsprechung» (Repo-Gerüst)

Falls dieses Dokument später formalisiert/erweitert wird, diese Abschnitte:

```markdown
# Darstellungs-Reglement Rechtsprechung
## 0 · Geltungsbereich & Verhältnis zu den anderen Reglementen
## 1 · Evidenzlage (Primärquellen, Stand) — CH-Anbieter, DE/Intl-Referenz, Lese-Typografie, A11y
## 2 · Amtliche Anatomie eines Entscheids (Rubrum/Regeste/Sachverhalt/Erwägungen/Dispositiv) + Zitiergrammatik (BGE/BGer, E., kein ECLI)
## 3 · Lese-Fundament (Spalte/Body/Zeilenhöhe/Ausrichtung/Kontrast/Zoom)   ← R1–R5
## 4 · Erwägungs-Darstellung (Randziffer, Einrückung, Anker, Pin-Cite)     ← R6, R7, R13
## 5 · Regeste & Kopf (abgesetzte Box, Zitierung, Quelle)                  ← R8, R10
## 6 · Navigation im Dokument (Sprungleiste, scroll-margin, Back-to-Top)   ← R9, R20
## 7 · Verlinkung & Zitierexport (Norm-/Präjudiz-Links, Copy-with-Cite)    ← R11, R12
## 8 · Übersicht: Karten & Facetten (Felder, Hierarchie, Trefferzahl)      ← R14, R15
## 9 · Status- & Treatment-Farben (KeyCite/Shepard's-Modell, A11y)         ← R16
## 10 · Reader-Steuerung & Personalisierung                                ← R17
## 11 · Ehrlichkeit & Provenienz (§7/§8: maschinell erfasst, URG, Quelle)  ← R18, R19
## 12 · Mobil & Responsiveness                                             ← R21
## 13 · Bewusst NICHT (ECLI erfinden, Blocksatz, Progress-Bar, zu breite Spalte) ← R22 u.a.
## 14 · Token-Bindung (tailwind.config.js: maxWidth.reading, --font-serif, fontSize-Skala)
## 15 · Prüf-Checkliste vor Commit
```

---

## Quick Wins (grösster Lesbarkeits-Effekt sofort)

1. **Lesespalte schmaler (R1):** `max-w-[56rem]` → `max-w-reading` (40rem) am
   Reader-Body. Einzeiliger Change, grösster Einzeleffekt — bringt den Reader
   sofort vor bger.ch/entscheidsuche (die unbegrenzt breit rendern).
2. **Absatzluft erhöhen (R5):** Erwägungs-Block-Abstand `space-y-4` → ~`space-y-6`;
   trennt nummerierte Absätze sichtbar, trifft WCAG 1.4.12.
3. **Pin-Cite-Anker je Erwägung (R7):** stabile `id` + Hover-§-Permalink — macht
   den Reader auf einen Schlag «kanzleitauglich zitierbar».
4. **Kontrast der gedämpften Elemente prüfen (R4):** Randziffern/Meta/Quellzeile
   mit echtem Tool gegen Paper messen (≥ 4.5:1), nicht nach Augenmass.
5. **`tabular-nums` auf der Randziffer sicherstellen (R6):** Produktionsfont auf
   `tnum` testen; sonst jittert die Ziffernspalte (10/11).

---

## Prüfung (Checkliste vor Commit)

1. Lesespalte gemessen 60–75 Zeichen bei Standardgrad (Desktop).
2. Kontrast Body + alle gedämpften Elemente ≥ 4.5:1 (Tool, nicht Augenmass);
   200 %-Zoom + Text-Spacing-Override ohne Clipping/Querscroll.
3. Erwägungs-Anker stabil + Permalink kopierbar; Nummerierung = amtliche
   Erwägung (kein Eigen-Zählwerk).
4. Mobil 390px: Randziffer inline, Sprung-Chips scrollbar, kein Querscroll,
   Body bleibt ≥ 16px/1.5.
5. Norm-Links nur bei eindeutiger Auflösung (kein toter Link); Regeste-Quelle
   ausgewiesen; «maschinell erfasst» sichtbar (§8).
6. Kein ECLI; Zitierung in BGE/BGer-Form; Blocksatz aus; keine Progress-Bar.
7. `npm run gate` + `npm run build` grün; visuelle Sichtprüfung Desktop 1280 /
   Mobile 390 in hell und dunkel.
8. Kein Push/Deploy ohne Davids ausdrückliches Ja (§9); fachliche Abnahme der
   Optik durch David selbst.

---

## Umsetzungs-Entscheide (Stand 23.6.2026)

- **Erwägungs-Darstellung (R6/R7 — angepasst auf Davids Wunsch):** Statt reiner
  Randziffer wird die **amtliche BGer-Form** umgesetzt — die Erwägungs-Ziffer
  (`E. 2.3`) steht als eigene **Kopfzeile** über ihrem Absatz, Erwägungen oberster
  Ebene sind durch **Haarlinie + Abstand ABGETRENNT**, Unter-Erwägungen nach Tiefe
  eingerückt. Pin-Cite-Anker/Permalink (`#e-2-3`) + `tabular-nums` bleiben erhalten.
- **`/structure paragraph_excerpt_chars`:** OCL-Maximum ist **5000** (höher → HTTP
  422 → kein Strukturtext). Längere Erwägungen werden bei 5000 Zeichen gekappt
  (selten; ehrliche Minor-Truncation, sonst Fliesstext-Fallback).
- **Kantonale Gerichte:** `/structure` ist Bund-only → kantonal greift der
  Fliesstext-Fallback mit sichtbarem §8-Hinweis «Gliederung nicht verfügbar».
  Eigener Pfad `public/rechtsprechung/kanton/<KT>/`.
- **Übersicht:** klare **Bund/Kanton-Trennung** — Segment (Alle · Bundesgericht ·
  Kantone) + beschriftete Abschnitte.
- **Amtlicher Link** (relevancy.bger.ch) auf JEDER Karte (Fuss) + im Reader.

### Fix-Runde 2 (Stand 23.6.2026, 3-Agenten-Audit: visuell/Konsistenz/Textqualität)

- **Fliesstext-Bereinigung** (`bereinigeFliesstext`, register.ts): OCL-Markdown-Links
  → Text, eingestreute Zitat-Zeilenumbrüche → Leerzeichen (kein Zeilenbruch je Zitat
  mehr), echte Absätze (`\n\n`) erhalten, **Silbentrennung am Umbruch geheilt**
  („wer-\\nden" → „werden", Komposita „Justiz- und" bleiben), freistehende `<URL>`
  entfernt. Unit-getestet.
- **Inline-Links dezent (R11):** `.rsp-prose a` (index.css, unlayered) nimmt im
  Lese-Fliesstext die Tailwind-`underline`-Utility von `NormText` zurück → ruhige
  Bottom-Border statt bunter Unterstrich-Flut; hell/dunkel über Tokens.
- **Einheitlichkeit Kantone:** lesbare Zitierung + `gerichtName` aus
  `gerichtAnzeigename` (statt rohem Court-Code „GR_GERICHTE…"); kantonale
  Aktenzeichen-Präfixe → Sachgebiet (`kantonalSachgebiet`); `ABK_REGISTER` um
  Sozialversicherungs-Erlasse (ATSG/IVG/UVG/ELG/AVIG/BVG…) erweitert.
- **Regeste:** OCL-Suffix „ | <Rechtsgebiet>" abgeschnitten (redundant zum Sachgebiet).
- **Karten:** gleiche Höhe (`flex h-full`, Fuss `mt-auto`); ohne Regeste **kein**
  wiederholter Zitat-Text, sondern gedämpfter Hinweis; „lesen →" auch mobil sichtbar.
- **Dispositiv:** bewusst EIN Block (OCL `dispositiv_orders` zerteilt unzuverlässig an
  Datumsangaben „2. Dezember" → §1 kein Falsch-Split).
- **Sub-Erwägungen** kräftiger (ink-700 statt brass) + linke Randlinie zur Tiefe;
  Sektions-Overline ohne die ins Leere laufende Volllinie.
- **Offen/bewusst später:** Dispositiv-Liste (sichere Split-Heuristik), Sachverhalt-
  Sublabel-Absätze, Status-/Treatment-Farben (R16), Reader-Steuerung (R17), Facetten-
  Trefferzahlen + CH-Datumsformat im Filter (R15), Datums-Plausibilität (1 GR-Zukunftsdatum).
