# AG-Gründung — Zwei-Kategorien-Kapitalmodell (Stimmrechts-/Vorzugsaktien · Partizipationsscheine)

**Erstellt:** 7.6.2026 (Auftrag David, HANDLUNGSPLAN AG-6 — «Deep Research vor
Bau») · **Baut auf:** [ag-gruendung.md](ag-gruendung.md) (Tabelle 1.2 bedingt
notwendiger Statuteninhalt — 693/654/656a dort als Anker gelistet),
[gruendungsdokumente-wortlaute.md](gruendungsdokumente-wortlaute.md) (Baustein A11:
Stimmrechtsaktien bisher **explizit als Backlog**),
[ag-gruendung-amtliche-vorlagen.md](ag-gruendung-amtliche-vorlagen.md) (ZH-Suite),
[ag-qualifizierte-gruendung.md](ag-qualifizierte-gruendung.md) (Liberierungs-/
Belege-Muster) — Inhalte dort **nicht dupliziert** (§5).

**Wortlaut-Quellen (Norm-Anker empirisch geprüft, §7):**
- **OR** `/tmp/or.html` @ 1.1.2026 (konsolidiert, Aktienrechtsrevision 19.6.2020
  in Kraft seit 1.1.2023): Art. **621, 622, 629, 630, 632, 654, 656, 656a–656g,
  657, 692, 693** — alle verbatim gezogen. *Anker-Hinweis:* Die Filestore-HTML
  trägt für 656a–656g **keinen eigenen `id="art_656X"`-Anker** (Gruppen-Anker
  bei `art_656`); Verifikation erfolgte über Textposition zwischen `art_656`
  und `art_657` — Wortlaut vollständig (nicht abgeschnitten).
- **HRegV** `/tmp/hregv.html` (ELI `cc/2007/686` @ 1.1.2025): Art. **43, 44, 45**
  verbatim (45 lit. h/i/j/k = Kategorien-Eintragung).

**Status: ERSTRECHERCHE (Cache-Wortlaut zweifach: extrahiert + gegen die
bestehenden Dossiers/ZH-Muster gespiegelt).** Fachliche Abnahme David
ausstehend. **Bau-Entscheid-Punkte am Schluss markiert (§8).**

> **Befund vorab (Scope-Abgrenzung):** Die heutige AG-Engine
> (`gruendungAgDokumente.ts`) ist ein **Ein-Kategorien-Modell**
> (`aktienkapitalChf`/`anzahlAktien`/`nennwertChf`/`liberierungProzent`/
> `ausgabebetragChf` + Boolean `inhaberaktien`). Stimmrechts-, Vorzugsaktien und
> Partizipationsscheine sind **noch nicht abgebildet** — A11 im Wortlaute-Dossier
> nennt Stimmrechtsaktien ausdrücklich «(Spezialgestaltung, Backlog)». Das
> **amtliche ZH-Urkunden-Muster sieht die Kategorie aber bereits vor**
> (Zeichnungssatz: «… eingeteilt in [Anzahl, **Art der Aktien sowie
> gegebenenfalls Aktien-Kategorie**] zu je CHF [Nennwert] …») — die Engine bildet
> diese Musterspalte heute nicht ab.

---

# §11-1 · Stimmrechtsaktien (Art. 693 OR)

## Quelle + Stand
OR Art. 693 @ 1.1.2026, Cache verbatim (Fassung Aktienrechtsrevision, in Kraft
1.1.2023). Default-Stimmrecht = Art. 692 I (nach **Nennwert**).

## Wortlaut (verbatim, Cache)
> **Art. 693**
> ¹ Die Statuten können das Stimmrecht unabhängig vom Nennwert nach der Zahl der
> jedem Aktionär gehörenden Aktien festsetzen, so dass auf jede Aktie eine Stimme
> entfällt.
> ² In diesem Falle können Aktien, die einen kleineren Nennwert als andere Aktien
> der Gesellschaft haben, nur als Namenaktien ausgegeben werden und müssen voll
> liberiert sein. Der Nennwert der übrigen Aktien darf das Zehnfache des
> Nennwertes der Stimmrechtsaktien nicht übersteigen.
> ³ Die Bemessung des Stimmrechts nach der Zahl der Aktien ist nicht anwendbar
> für: 1. die Wahl der Revisionsstelle; 2. die Ernennung von Sachverständigen zur
> Prüfung der Geschäftsführung oder einzelner Teile; 3. die Beschlussfassung über
> die Einleitung einer Sonderuntersuchung; 4. die Beschlussfassung über die
> Erhebung einer Verantwortlichkeitsklage.

## Regel deterministisch (Eingabe → Ausgabe)
Begriff: **Stimmrechtsaktien = die Aktien mit dem kleineren Nennwert.** Das
Privileg entsteht NICHT durch eine eigene «Aktienart», sondern dadurch, dass die
Statuten *Stimmrecht-nach-Aktienzahl* festsetzen UND zwei Nennwerte bestehen.

Gates bei der Gründung (alle hart, §2-tauglich):
1. **Nennwert-Verhältnis (693 II Satz 2):** `nennwert(Stammaktie) ≤ 10 ×
   nennwert(Stimmrechtsaktie)`. → Blocker, wenn überschritten.
2. **Form (693 II Satz 1):** Stimmrechtsaktien (= kleinerer Nennwert) **nur als
   Namenaktien** → Boolean `inhaberaktien` für DIESE Kategorie gesperrt
   (Wechselwirkung mit der bestehenden Inhaberaktien-Weiche, s. §11-5).
3. **Liberierung (693 II Satz 1):** Stimmrechtsaktien **müssen voll liberiert
   sein** → für diese Kategorie `liberierungProzent = 100` erzwingen; Teil-
   liberierung nur auf der Stammaktien-Kategorie zulässig.
4. **Statuten-Pflichtinhalt:** Klausel «Das Stimmrecht bemisst sich nach der
   Zahl der Aktien; auf jede Aktie entfällt eine Stimme» (verdrängt A11-Default
   692 I). Einführung qualifiziert (704 I — im Lang-Statuten-Katalog des
   Hauses bereits gelistet: «die Einführung von Stimmrechtsaktien»), bei der
   **Erstgründung** aber ohne Mehrheitsbeschluss, da originärer Statuteninhalt.
5. **Privileg-Ausnahmen (693 III):** Für vier Beschlüsse zählt **Nennwert-
   Stimmrecht** (RS-Wahl · Sachverständige zur Geschäftsführungsprüfung ·
   Sonderuntersuchung · Verantwortlichkeitsklage). → Statuten-Baustein muss den
   Vorbehalt nennen (deklaratorisch, aber Praxis/ZH-Lang-Muster führen ihn).

## Geltungsbereich / Ausnahmen
- Kapitalrechnung: **Stimmrechtsaktien zählen mit ihrem (kleinen) Nennwert zum
  Aktienkapital** — sie sind *gewöhnliche Aktien mit Stimmprivileg*, keine
  Sonderkapital-Kategorie. `Aktienkapital = Σ (Anzahl × Nennwert)` über **beide**
  Aktien-Kategorien (≠ PS-Kapital, das separat ist, §11-3).
- 693 schafft **keine** Vorzugsrechte vermögensmässig — reines Stimmprivileg.
  Kombination mit Vorzugsaktien (654/656) ist möglich, aber zwei unabhängige
  Gestaltungen.

## Pflegebedarf
Keine datierten Parameter. Faktor «10×» und «voll liberiert» sind feste
Gesetzeswerte → Verfallsregister nur als Norm-Beobachtung (693 stabil seit 2023).

## Abnahme-Status
Erstrecherche (Cache verbatim). David-Abnahme offen.

---

# §11-2 · Vorzugsaktien (Art. 654 / 656 OR)

## Quelle + Stand
OR Art. 654, 656 @ 1.1.2026, Cache verbatim. (Art. 655 aufgehoben 1.7.1992.)

## Wortlaut (verbatim, Cache)
> **Art. 654** ¹ Die Generalversammlung kann nach Massgabe der Statuten oder auf
> dem Wege der Statutenänderung die Ausgabe von Vorzugsaktien beschliessen oder
> bisherige Aktien in Vorzugsaktien umwandeln. ² Hat eine Gesellschaft
> Vorzugsaktien ausgegeben, so können weitere Vorzugsaktien, denen Vorrechte
> gegenüber den bereits bestehenden Vorzugsaktien eingeräumt werden sollen, nur
> mit Zustimmung sowohl einer besonderen Versammlung der beeinträchtigten
> Vorzugsaktionäre als auch einer Generalversammlung sämtlicher Aktionäre
> ausgegeben werden. Eine abweichende Ordnung durch die Statuten bleibt
> vorbehalten. […]
>
> **Art. 656** ¹ Die Vorzugsaktien geniessen gegenüber den Stammaktien die
> Vorrechte, die ihnen in den **ursprünglichen Statuten** oder durch
> Statutenänderung ausdrücklich eingeräumt sind. Sie stehen im Übrigen den
> Stammaktien gleich. ² Die Vorrechte können sich namentlich auf die **Dividende
> mit oder ohne Nachbezugsrecht**, auf den **Liquidationsanteil** und auf die
> **Bezugsrechte** für den Fall der Ausgabe neuer Aktien erstrecken.

## Regel deterministisch
- **Schaffung bei Gründung:** 654 I «nach Massgabe der Statuten» + 656 I
  «ursprüngliche Statuten» → bei der Gründung möglich, **kein** Sonderquorum/
  Sonderversammlung (654 II betrifft nur die *spätere* Ausgabe rangbesserer
  Vorzugsaktien).
- **Vorrechte-Katalog (656 II, nicht abschliessend — «namentlich»):**
  (a) Dividenden-Vorrecht (mit/ohne **Nachbezugsrecht** = kumulativ);
  (b) Liquidationsanteil-Vorrecht; (c) Bezugsrechts-Vorrecht. → in der Maske als
  Mehrfachauswahl je Vorzugsaktien-Kategorie; Freitext für die konkrete
  Ausgestaltung (Prozentsatz, Reihenfolge) Pflicht (656 I «ausdrücklich»).
- **Verhältnis zum Stimmrecht:** Vorzugsaktien sind **stimmberechtigt** wie
  Stammaktien (656 I Satz 2 «im Übrigen gleich»); ein Stimmprivileg gibt es nur
  über 693 (separate Gestaltung). Eine *stimmrechtslose* Vorzugsaktie kennt das
  schweizerische Recht **nicht** — wer Vermögensvorrecht ohne Stimmrecht will,
  nimmt den **Partizipationsschein** (§11-3) oder den Genussschein (657, kein
  Nennwert — ausserhalb dieses Auftrags).

## Geltungsbereich / Ausnahmen
- Statuten-Pflichtinhalt (656 I): die Vorrechte **ausdrücklich**; HRegV 45 I lit.
  k: «im Fall von Vorzugsaktien oder Vorzugspartizipationsscheinen: die damit
  verbundenen Vorrechte» → ins HR einzutragen (≠ blosser Statutenverweis).
- Kapitalrechnung: Vorzugsaktien zählen mit ihrem Nennwert zum Aktienkapital
  (Teil der `Σ Kategorien`).
- 654 II (Sonderversammlung) und 656 (Rangordnung) sind **Folge-/Änderungsrecht**
  — für die Erstgründungs-Maske nur als Hinweis relevant, nicht als Gate.

## Pflegebedarf
Keine datierten Parameter. Norm stabil.

## Abnahme-Status
Erstrecherche (Cache verbatim). David-Abnahme offen. **Fachentscheid:**
Tiefe der Vorrechte-Ausgestaltung (Freitext vs. strukturierte Felder) — s. §8.

---

# §11-3 · Partizipationsscheine (Art. 656a–656g OR)

## Quelle + Stand
OR Art. 656a–656g @ 1.1.2026, Cache verbatim (656a/656b/656c **neu gefasst**
durch Aktienrechtsrevision, in Kraft 1.1.2023; 656d–656g Fassung 1991).

## Wortlaut-Kerne (verbatim, Cache)
> **Art. 656a** ¹ Die Statuten können ein **Partizipationskapital** vorsehen, das
> in Teilsummen (Partizipationsscheine) zerlegt ist. Diese Partizipationsscheine
> müssen **auf dieselbe Währung wie das Aktienkapital** lauten. Sie werden gegen
> Einlage ausgegeben, **haben einen Nennwert und gewähren kein Stimmrecht.**
> ² Die Bestimmungen über das Aktienkapital, die Aktie und den Aktionär gelten,
> soweit das Gesetz nichts anderes vorsieht, auch für das Partizipationskapital
> […]. ³ Die Partizipationsscheine sind als solche zu bezeichnen.
> ⁴ Partizipationskapital kann geschaffen werden: 1. **bei der Gründung**;
> 2. durch ordentliche Kapitalerhöhung; 3. […] bedingtem Kapital; 4. innerhalb
> eines Kapitalbands. ⁵ Die Umwandlung von Aktien in Partizipationsscheine bedarf
> der Zustimmung sämtlicher betroffener Aktionäre.
>
> **Art. 656b** ¹ Der Anteil des Partizipationskapitals, der sich aus
> Partizipationsscheinen zusammensetzt, die **an einer Börse kotiert** sind, darf
> das **Zehnfache** des im Handelsregister eingetragenen Aktienkapitals nicht
> übersteigen. ² Der **übrige** Teil des Partizipationskapitals darf das
> **Doppelte** des im Handelsregister eingetragenen Aktienkapitals nicht
> übersteigen. ³ Die Bestimmungen über das **Mindestkapital finden keine
> Anwendung.** ⁴ Das Partizipationskapital ist dem Aktienkapital **zuzurechnen**
> bei: 1. der Bildung der gesetzlichen Gewinnreserve; 2. der Verwendung der
> gesetzlichen Kapital- und Gewinnreserven; 3. der Beurteilung […] Unterbilanz/
> Kapitalverlust; 4. […] bedingtem Kapital; 5. […] Kapitalband. […]
>
> **Art. 656c** ¹ Der Partizipant hat **kein Stimmrecht** und, sofern die Statuten
> nichts anderes bestimmen, **keines der damit zusammenhängenden Rechte**
> [Einberufung, Teilnahme, Auskunft, Einsicht, Traktandierung/Antrag]. […]
>
> **Art. 656f** ¹ Die Statuten dürfen die Partizipanten bei der Verteilung des
> Bilanzgewinnes und des Liquidationsergebnisses sowie beim Bezug neuer Aktien
> **nicht schlechter stellen als die Aktionäre.** ² Bestehen mehrere Kategorien
> von Aktien, so müssen die Partizipationsscheine zumindest der Kategorie
> gleichgestellt sein, die am **wenigsten bevorzugt** ist. […]

## Regel deterministisch
- **Begriff:** PS = Beteiligungspapier mit **Nennwert**, **gegen Einlage**,
  **kein Stimmrecht**; bildet das **Partizipationskapital** (separates Kapital,
  NICHT Teil des Aktienkapitals). Pflicht-Bezeichnung «Partizipationsschein»
  (656a III).
- **Schranke 656b (für die NICHT-kotierte Gründungs-AG die einschlägige):** Bei
  der Gründung sind keine PS börsenkotiert → es gilt **Abs. 2: PS-Kapital ≤
  2 × (im HR eingetragenes) Aktienkapital.** → **Auftrags-Annahme «max. das
  Doppelte» BESTÄTIGT** für die Gründungs-Maske. Der Faktor 10× (Abs. 1) greift
  nur für kotierte PS und ist im Gründungskontext nicht relevant (Hinweis, kein
  Gate).
  - **Gate:** `partizipationskapital ≤ 2 × aktienkapital` (beides in
    Kapitalwährung). Blocker bei Überschreitung mit Nennung des Maximums.
- **Währung (656a I):** PS **dieselbe Währung wie das AK** → bei FW-Gründung
  erbt das PS-Kapital `waehrung`; eigenes Gate ggf. nicht nötig (erzwungen).
- **Mindestkapital (656b III):** PS-Kapital zählt **nicht** zur Erreichung des
  Mindest-Aktienkapitals (621: 100 000) oder der Mindesteinlage (632: 50 000) →
  die Gates 621/632 bleiben **auf dem reinen Aktienkapital** (s. §11-5).
- **Rechte der Partizipanten (656c ff.):** kein Stimmrecht; Recht auf
  Sonderuntersuchung wie Aktionär (656c II); Einberufungs-Bekanntgabe + Protokoll
  (656d); fakultativ VR-Vertreter (656e); Vermögens-Gleichbehandlung (656f).
  → Für die Statuten: PS-Kapital-Artikel + Vermögensrechte-Verweis; die
  weitergehenden Mitwirkungsrechte sind **fakultativ** (Statuten «können»).
- **Vorzugs-Partizipationsscheine:** möglich (HRegV 45 I lit. k nennt sie) —
  PS mit Vorrecht analog 656 II. Eigene Unterkategorie, NICHT Pflicht.

## Geltungsbereich / Ausnahmen
- **HRegV-Behandlung (45 I lit. j — verbatim):** «falls ein Partizipationskapital
  ausgegeben wird: die **Höhe und die Währung** dieses Partizipationskapitals und
  der darauf geleisteten Einlagen sowie **Anzahl, Nennwert und Art** der
  Partizipationsscheine.» → **separater HR-Eintrag** neben dem Aktienkapital
  (lit. h). lit. k: Vorrechte bei Vorzugs-PS.
- **Errichtungsakt/Zeichnung:** 656a II erklärt die Aktien-Vorschriften auf das
  PS-Kapital anwendbar → Zeichnung der PS **im Errichtungsakt** mit Anzahl/
  Nennwert/Ausgabebetrag wie bei Aktien (629/630 sinngemäss).
- **Liberierung:** 656a II → 632 sinngemäss; PS-Einlagen aber **nicht** an die
  632-II-Mindestsumme (50 000) anrechenbar wegen 656b III (Mindestkapital-
  Vorschriften unanwendbar). *(Tiefere Liberierungsregel je PS = Fachentscheid,
  §8.)*

## Pflegebedarf
Keine datierten Parameter. Faktoren 2×/10× feste Gesetzeswerte. Norm stabil seit
2023.

## Abnahme-Status
Erstrecherche (Cache verbatim). David-Abnahme offen.

---

# §11-4 · Zeichnung / Liberierung / Urkunde bei zwei Kategorien (Art. 629 / 630 / 632 OR · HRegV 44/45)

## Quelle + Stand
OR 629/630/632 @ 1.1.2026 + HRegV 44/45 @ 1.1.2025, Cache verbatim.

## Befund (das Gesetz verlangt Kategorien bereits heute)
> **Art. 630** Die Zeichnung bedarf zu ihrer Gültigkeit: 1. der Angabe von
> **Anzahl, Nennwert, Art, Kategorie und Ausgabebetrag** der Aktien; […]
>
> **Art. 629** ¹ […] In diesem Errichtungsakt zeichnen die Gründer die Aktien und
> stellen fest, dass: 1. sämtliche Aktien gültig gezeichnet sind; 2. die
> versprochenen Einlagen dem gesamten **Ausgabebetrag** entsprechen; […]
>
> **HRegV Art. 44 lit. d** [Urkunde muss enthalten] die Erklärung jeder Gründerin
> […] über die Zeichnung der Aktien unter Angabe von **Anzahl, Nennwert, Art,
> Kategorie und Ausgabebetrag** sowie die bedingungslose Verpflichtung […].

→ **Art (Namen-/Inhaberaktie) und Kategorie (Stamm-/Vorzugs-/Stimmrechtsaktie)
sind gesetzlich vorgeschriebene Zeichnungsangaben.** Die heutige Engine bildet
nur «Art» (Namen vs. Inhaber) ab, **nicht Kategorie**.

## Regel deterministisch
- **Errichtungsakt/Zeichnung je Kategorie:** Anzahl · Nennwert · **Kategorie** ·
  Ausgabebetrag — je Kategorie eine Zeile; je Gründer:in Zuordnung welche
  Kategorie in welcher Stückzahl gezeichnet wird (das ZH-Muster führt die Zeilen
  «a) … Aktien von [Gründer]» bereits, ergänzt um die Kategorie-Spalte).
- **Kapitalberechnung (Gate-relevant):**
  `Aktienkapital = Σ_Kategorien (Anzahl × Nennwert)` — **Stimmrechtsaktien zählen
  mit ihrem (kleinen) Nennwert mit.** `Partizipationskapital = Σ_PS (Anzahl ×
  Nennwert)` **SEPARAT** (656b). Ausgabebetrag je Kategorie eigenständig (Agio
  je Kategorie möglich).
- **Feststellungen 629 II** bleiben unverändert, beziehen sich auf den
  Gesamt-Ausgabebetrag aller Kategorien (Aktien) plus — sinngemäss — PS.

## ZH-Muster (Befund, verbatim)
ZH-Urkunde bar (`.scratch/ag-knowledge/ag_vorlage_urkunde_gruendung_bar.txt`,
Z. 29): «… eingeteilt in [Anzahl, **Art der Aktien sowie gegebenenfalls
Aktien-Kategorie**] zu je CHF [Nennwert], welche zum Ausgabebetrag von CHF [..]
je Aktie wie folgt gezeichnet werden: a) … Aktien von …». Die VR-Vertretung kennt
zudem den **«Vertreter der Aktien-Kategorie»** (Z. 135, Art. 709 I — eigener
Anspruch jeder Kategorie auf VR-Vertretung; Stufe 3, nicht Gründungs-Pflicht).
→ Das amtliche Muster ist **kategorie-fähig**; die Engine muss die heute fehlende
Kategorie-Spalte nachziehen.

## Pflegebedarf
Mindestbeträge 621 (100 000) / 632 (50 000) sind datierte Gesetzeswerte (bereits
im Verfallsregister via ag-gruendung.md). Kein Zusatzbedarf.

## Abnahme-Status
Erstrecherche (Cache verbatim). David-Abnahme offen.

---

# §11-5 · Wechselwirkungen mit bestehenden Engine-Features

| Feature (heute) | Wechselwirkung Zwei-Kategorien | Quelle |
|---|---|---|
| **Teilliberierung je Kategorie** (`liberierungProzent`, individuell je Gründer) | **Stimmrechtsaktien zwingend voll liberiert** (693 II) → für diese Kategorie 100 % erzwingen; Stammaktien teilliberierbar (632 I: ≥ 20 % je Aktie). Bei PS: 632 sinngemäss, aber 50-000-Untergrenze nicht über PS erfüllbar (656b III). | 693 II / 632 / 656b III |
| **Inhaberaktien-Weiche** (`inhaberaktien`/`inhaberKotiert`/`verwahrungsstelle`; Gate 622 I^bis) | **Stimmrechtsaktien MÜSSEN Namenaktien sein** (693 II Satz 1) → Inhaber-Weiche für die Stimmrechts-Kategorie sperren. Vorzugs-/Stammaktien dürfen Inhaberaktien sein (622 I), wenn Kotierung/Bucheffekten erfüllt. **Konflikt-Gate:** Stimmrechtsaktien + Inhaber = Blocker. | 693 II / 622 |
| **Gate 621 (Mindestkapital 100 000)** | Auf **Σ Aktien-Kategorien** (Stimmrechts- + Stamm- + Vorzugsaktien), **OHNE** PS-Kapital (656b III). | 621 / 656b III |
| **Gate 632 (≥ 20 % je Aktie, gesamt ≥ 50 000)** | 20 % je Aktie **je Kategorie**; 50-000-Summe auf den **Aktien**-Einlagen (PS-Einlagen zählen nicht zur Mindestsumme — 656b III). | 632 / 656b III |
| **Kapitalband** (`kbUntergrenze ≥ ½ AK`, `kbObergrenze ≤ 1½ AK`; Gate rechnet gegen `aktienkapitalChf`) | 656b IV Ziff. 5: **PS-Kapital ist dem AK zuzurechnen** bei der Kapitalband-Grenzbestimmung → falls PS vorhanden, Band-Grenzen gegen `(AK + PS-Kapital)`. Heutiges Gate prüft nur `aktienkapitalChf` → **anpassen, wenn PS aktiv.** | 656b IV Ziff. 5 / 653s II |
| **Bedingtes Kapital** (`bkBetrag ≤ ½ AK`; Gate gegen `aktienkapitalChf`) | 656b IV Ziff. 4: PS-Kapital dem AK zuzurechnen bei der **Beschränkung des Umfangs** → Bezugsgrösse `(AK + PS-Kapital)`, wenn PS aktiv. | 656b IV Ziff. 4 / 653a I |
| **Vinkulierung** (`vinkulierung`, nur Namenaktien) | Unverändert je Kategorie (685a); bestehende Sperre «Vinkulierung nur Namenaktien» trägt. Stimmrechtsaktien (Namen) vinkulierbar. | 685a |
| **Statuten-Lang-Weiche** (`statutenUmfang='lang'`) | Heute Inhaberaktien nur mit Kurzfassung erlaubt (Engine-Blocker, Z. 477). Kategorien-Bausteine müssten in beide Umfänge eingepasst werden — **Erstausbau ggf. nur Kurzfassung** (analog Inhaber). | Engine-Status quo |
| **Stimmrecht-Statuten-Baustein A11** (Default 692 I Nennwert) | Bei Stimmrechtsaktien **verdrängt** durch 693-Klausel; A11 wird zur Weiche (Nennwert-Default ODER Aktienzahl-Stimmrecht). | 692/693 |

---

# Bauspezifikations-Skizze (Bau-Absicherung, §6/§8)

> **Leitplanke §6:** Die bestehenden **Ein-Kategorie-Pfade müssen byte-identisch
> bleiben.** Maßstab: heutiger Default `aktienkapitalChf="100'000"`,
> `anzahlAktien="100"`, `nennwertChf="1'000"`, keine PS, keine Vorzugs-/
> Stimmrechtsaktien → jedes Dokument **byte-identisch** zum Status quo. Vor dem
> Bau Golden-Outputs der bestehenden Sweeps festhalten (§6 Ziff. 2).

## 1. Datenmodell — **Fachentscheid David nötig** (zwei Optionen)

**Option A — additive Booleans + Zusatzfelder (minimalinvasiv, §6-schonend):**
Bestehende Felder bleiben die **Stammaktien-Kategorie** (byte-identisch, wenn
keine Zusatzkategorie aktiv). Neu:
```
stimmrechtsaktien: boolean
  srAnzahl, srNennwertChf, srAusgabebetragChf   (voll liberiert erzwungen)
vorzugsaktien: boolean
  vzAnzahl, vzNennwertChf, vzAusgabebetragChf, vzLiberierungProzent
  vzVorrechte: { dividende, nachbezug, liquidation, bezugsrecht }  + vzVorrechtTxt
partizipationsscheine: boolean
  psAnzahl, psNennwertChf, psAusgabebetragChf, psLiberierungProzent
  psVorzug: boolean (+ psVorrechtTxt)   // Vorzugs-PS
```
+ Defaults alle `false`/`''` → existierende Antworten-Sätze unverändert.
*Vorteil:* kleinste Diff, klar §6-tauglich, jede Kategorie hat eigenes Gate-
Feld. *Nachteil:* skaliert nicht auf >1 Vorzugs-/PS-Klasse (für Gründung selten).

**Option B — Kategorien-Array** (`aktienKategorien: AgKategorieZeile[]`,
`psKategorien: AgPsZeile[]`): flexibler, aber **bricht die byte-Identität**, wenn
der Ein-Kategorie-Fall neu durch das Array läuft → erfordert einen
Kompatibilitäts-Pfad (Array mit genau einer Default-Stammaktien-Zeile → exakt
heutige Ausgabe). Höheres §6-Risiko, mehr Test-Aufwand.

→ **Empfehlung Recherche:** **Option A** (additiv) für den Erstausbau; Array
(B) nur, wenn David Mehrklassen-Vorzugsaktien bei der Gründung tatsächlich will.
**Entscheid offen.**

## 2. Gates (alle §2, am Cache verankert)
- `srNennwert × 10 ≥ stammNennwert` (693 II) — sonst Blocker.
- Stimmrechtsaktien: `inhaberaktien` gesperrt (693 II) + `liberierung = 100 %`.
- Vorzugsaktien: mind. ein Vorrecht gewählt + Freitext nicht leer (656 I).
- `psKapital ≤ 2 × aktienkapital` (656b II, nicht-kotiert) — sonst Blocker
  mit Max-Nennung.
- PS-Währung = AK-Währung (656a I) — erzwungen, kein Eingabefeld.
- **Gate 621:** Mindestkapital auf `Σ Aktien-Nennwerte` (ohne PS).
- **Gate 632:** 50-000-Summe auf Aktien-Einlagen (ohne PS, 656b III).
- **Kapitalband/bedingtes Kapital:** Bezugsgrösse `AK + psKapital`, wenn PS aktiv
  (656b IV Ziff. 4/5) — *bestehende Gates rechnen heute nur gegen
  `aktienkapitalChf`; anzupassen.*
- Konsistenz: `Σ je Kategorie gezeichnete Aktien = Anzahl je Kategorie`
  (629 II Ziff. 1, je Kategorie); Ausgabebetrag ≥ Nennwert je Kategorie (624).

## 3. Statuten-Bausteine (Wortlaut-Quelle: OR-Cache + ZH-Lang-Muster)
- **AK-/Aktien-Artikel** wird kategorisiert: «… eingeteilt in [n1] Namenaktien
  zu CHF [x] (Stammaktien), [n2] Namenaktien zu CHF [y] (Stimmrechtsaktien) und
  [n3] Namenaktien zu CHF [z] (Vorzugsaktien mit folgenden Vorrechten: …).»
- **Stimmrecht-Artikel:** Weiche Default (A11, 692 I) ↔ 693-Klausel inkl.
  Ausnahme-Vorbehalt 693 III.
- **Vorzugs-Vorrechte-Artikel:** 656 II-Katalog, gewählte Vorrechte + Freitext.
- **PS-Kapital-Artikel:** Höhe/Währung/Anzahl/Nennwert; «als
  Partizipationsscheine bezeichnet» (656a III); Verweis Vermögens-
  Gleichbehandlung (656f) und ggf. Mitwirkungsrechte (656c ff.).
- ZH-Lang-Muster (`ag_vorlage_statuten_lang.txt`) führt heute **nur** den
  Nennwert-Stimmrecht-Default (Art. «Stimmrecht und Vertretung») und **keine**
  Vorzugs-/PS-/Stimmrechtsaktien-Artikel → **die Bausteine müssen neu formuliert
  werden** (kein fertiges Haus-/ZH-Lang-Muster vorhanden — Fachentscheid Wortlaut).

## 4. Urkunden-/Zeichnungs-Änderungen
- Zeichnungs-Block je Kategorie (Anzahl/Nennwert/**Kategorie**/Ausgabebetrag —
  630 Ziff. 1; ZH-Muster Z. 29 ist bereits kategorie-fähig).
- PS-Zeichnung als eigener Block im Errichtungsakt (656a II → 629/630 sinngemäss).
- 629-II-Feststellungen auf Gesamt-Ausgabebetrag (Aktien + PS).

## 5. HR-Anmeldung
- lit. h: AK-Höhe/Währung + Anzahl/Nennwert/Art je Aktien-Kategorie.
- lit. i: **Stimmrechtsaktien** gesondert eintragen.
- lit. j: **Partizipationskapital** gesondert (Höhe/Währung/Einlagen/Anzahl/
  Nennwert/Art).
- lit. k: Vorrechte der Vorzugsaktien/Vorzugs-PS.

## 6. Sweep-/Golden-Erweiterungen
- Vor Bau: Golden-Snapshot aller bestehenden AG-Sweeps (Ein-Kategorie) festhalten
  → nach Bau byte-identisch (§6 Ziff. 2).
- Neue Sweep-Szenarien: (a) Stamm + Stimmrechtsaktien (10×-Grenze, voll lib.);
  (b) Stamm + Vorzugsaktien (3 Vorrechte); (c) Stamm + PS (2×-Grenze);
  (d) Kombination; (e) Negativ-Gates (11×-Nennwert, PS > 2× AK, Stimmrechts-
  Inhaberaktie, Vorzug ohne Vorrecht).

## 7. Was Davids Fachentscheid braucht (ehrlich markiert, §8)
- [ ] **Datenmodell Option A (additiv) vs. B (Array)** — Recherche empfiehlt A.
- [ ] **Mehrklassen-Vorzugsaktien bei Gründung** abbilden? (selten; entscheidet
      A vs. B).
- [ ] **Vorrechte-Tiefe:** strukturierte Felder (Dividenden-%, Rang) vs. ein
      Freitext nach 656 II. Recherche-Default: Checkbox-Katalog + Freitext.
- [ ] **PS-Liberierung:** eigener Liberierungsgrad je PS-Klasse oder voll? (656a
      II → 632 sinngemäss; 50-000-Anrechnung ausgeschlossen, 656b III).
- [ ] **Statuten-Wortlaute** der neuen Bausteine (kein fertiges ZH-/Haus-Muster —
      muss formuliert und von David abgenommen werden, §7/§8).
- [ ] **Statuten-Umfang:** Kategorien nur in Kurzfassung (analog heutiger
      Inhaber-Beschränkung) oder auch Lang?
- [ ] **Genussscheine (657)** sind NICHT Teil dieses Auftrags (kein Nennwert,
      «zugunsten der Gründer» bei Gründung unzulässig — 657 V) → bewusst
      ausgeklammert; falls gewünscht, eigener Auftrag.

---

## §7-Notizen / Korrekturen an der Auftragsformulierung
- Auftrag fragte «PS-Kapital max. das DOPPELTE … (Rev. 2023-Stand prüfen)» →
  **bestätigt für die nicht-kotierte Gründung (656b II).** Für *kotierte* PS gilt
  10× (656b I) — bei der Gründung nie einschlägig. Faktor und Bezugsgrösse («im
  HR eingetragenes Aktienkapital») verbatim belegt.
- Auftrag fragte «Stimmrechtsaktien voll liberiert? (693 II)» → **ja, verbatim
  bestätigt** (693 II Satz 1). Ebenso «Namenaktien-Pflicht» → **ja** (693 II
  Satz 1).
- Auftrag «693 III: wofür Stimmprivileg NICHT gilt» → **vier Tatbestände
  verbatim** (RS-Wahl, Sachverständige, Sonderuntersuchung, Verantwortlichkeits-
  klage).
- **Korrektur Engine-Annahme:** A11 (gruendungsdokumente-wortlaute.md) führt
  Stimmrechtsaktien als «Backlog»; mit diesem Dossier ist die Normbasis für die
  Verdrahtung gelegt (Status bleibt Recherche bis David-Abnahme).
