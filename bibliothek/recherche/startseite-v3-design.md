# Startseite V3 — Design-Recherche + Council-Entscheid (Dossier)

**Erstellt:** 3.7.2026 (Fable-Ultracode-Session, Auftrag David) · **Status:** zweifach geprüft
(5 Recherche-Stränge + adversariale Kritiken + Devil's Advocate; Council-Verdikt bindend per
Delegation David) — Wort-für-Wort-Abnahme der sichtbaren Texte durch David ausstehend.

**Zweck:** Herleitung und bindender Entscheid für den Startseiten-Neubau + Branding I2
(ROADMAP **W2·5c**, Bau-Spec **`FAHRPLAN-STARTSEITE-V3.md`** — die Spec ist die operative
Wahrheit; dieses Dossier ist die Begründungs- und Provenienz-Schicht, §11).

**Quelle + Stand:** Eigene Erhebung 3.7.2026 — Fable-Ultracode-Workflow (11 Agenten: 5
Recherche-Stränge [Ist-Inventar, Design-Regeln/Tokens, externe Design-Recherche mit
Web-Belegen, Messaging I2, Informationsarchitektur], 2 unabhängige Vollkonzepte, 4 adversariale
Kritiken) + DMAD-Council (12 Agenten: 5 Berater mit distinkten Denkmethoden
[Inversion/Dekomposition/Analogie/naive Befragung/Dependency+Outside-View], 5 anonyme
Peer-Reviews, Devil's Advocate gegen den Konsens, Chairman-Synthese). Externe Referenzen (in
der Recherche mit URLs belegt): legislation.gov.uk-Relaunch, gov.uk-Startmuster, Swiss
Confederation Web Guidelines / USWDS, Fedlex als Negativbeispiel (Einstieg = nackte Suchmaske).

**Auftrag David (3.7.2026, wörtlich):** «eine Einstiegsseite gewährleisten, die modular
aufgebaut ist und einen einfachen Einstieg in die Funktionen von LexMetrik bietet … willkommend
und einfach zu bedienen und schön und modern aussehen»; Recherche+Entscheid Fable/Ultracode,
Bau danach autonom durch Opus ohne David. Weichen David: Design-Rahmen entscheidet der Council
verbindlich · Scope Startseite + Einstiegs-Navigation · I2 mitgebündelt.

## Regel (deterministisch): der Entscheid

**Hybrid «A-Basis + Brass-Hero»** — als Schalter-Liste, bindend (Details/Begründung im
Verdikt unten, operative Fassung in `FAHRPLAN-STARTSEITE-V3.md` §0):

| Schalter | Entscheid |
|---|---|
| Brass-Wash-Hero (`bg-brass-100`, Suche integriert) | JA — einzige Wärme-Dosis; Ein-Klassen-Fallback `bg-surface` |
| Deko-SVG · `text-display-xl` · ✓-Badges · Gruss-Wort · Stagger-Reveal | NEIN (alle) |
| Schnellrechner-Position | VOR den Kacheln (Wiederkehrer-Effizienz schlägt Erstbesuchs-Inszenierung) |
| Zuletzt verwendet (ersetzt Favoriten) | JA; Erstbesuch nicht gerendert; CLS-verifiziert |
| Zeiterfassung | Sektion auf `/rechner`, KEINE eigene Route (`ERWARTETE_ROUTEN` bleibt 57) |
| Messaging I2 | H1 «Schweizer Recht nachschlagen, Fristen und Kosten berechnen»; kein Absolutum, kein «geprüft», «KI-frei» nie als Siegel; SSoT `seo.ts` + Tor `check:seo-index` |

## Kernbefunde der Recherche (kondensiert)

1. **Ist-Inventar:** 7 Module; `Favoriten.tsx` ist eine echte kuratierte Favoriten-Funktion —
   direkter Verstoss gegen Daueranweisung 5.6. («keine Favoriten, nur Zuletzt verwendet»); eine
   Zuletzt-verwendet-Mechanik existierte nirgends (Lücke). I2-Wording an 5 Stellen verstreut
   (`index.html`, `seo.ts`, `KatalogHinweis`, `Methodik`, `og-bild.ts`), `seo.test.ts:81`
   fixiert den Alt-Claim. Prerender-Zähler `ERWARTETE_ROUTEN=57`; 4 e2e-Dateien strukturell an
   «/» gekoppelt.
2. **Design-Regeln:** Token-System vollständig (Papier/Tinte/Brass + 4 Statusfamilien,
   Typo-Skala endet bewusst bei `display-l`); Spielräume liegen in Layout/Dichte/Kartenform/
   Bewegung — NICHT in neuen Farben/Grössen. Bestands-Bausteine `lc-card/tile/chip/notice`.
3. **Extern:** «Modern + willkommend» entsteht bei Rechtsdaten durch Ruhe, Lesbarkeit,
   Aufgaben-Führung — nicht durch Farbe/Bild (legislation.gov.uk-Beweis). GOV.UK-Kacheln =
   «Headlines benennen konkret den Nutzen». Fedlex-Negativbeispiel: Einstieg darf nie bei
   reiner Suchmaske landen. Zuletzt-verwendet ist modern belegbar und deckt Davids Vorgabe 1:1.
4. **Messaging:** heutige H1 ist der Zufallsgruss (Value Proposition nur ein `<p>`); 3
   Kandidaten entworfen; Empfehlung A-Headline+B-Subline, im Verdikt verschärft (kein
   Absolutum «jede Angabe», Verbot «geprüfte Bausteine»).
5. **IA:** häufigste Aufgabe quer über alle Nutzergruppen = nachschlagen + Frist/Kosten
   rechnen; Schnellrechner-Demotion wäre der teuerste Fehler beider Konzepte gewesen (von 3
   Council-Stimmen unabhängig gefunden).

## Council-Verdikt (Chairman-Synthese, 3.7.2026 — BINDEND, ungekürzt)

> Nachstehend das vollständige Verdikt; die Schalter-Tabelle und die 10 Auflagen sind in
> `FAHRPLAN-STARTSEITE-V3.md` §0/§9 operativ übernommen.

### Where the Council Agrees
1. ~90 % der Substanz beider Konzepte ist identisch — die A-vs-B-Frage ist keine Richtungs-,
   sondern eine Schalter-Frage (First-Principles-Analyse, von 5/5 Peer-Reviews als stärkste
   gewertet). 2. Scherzpool + tickende Uhr raus, Favoriten raus. 3. Die harten Trust-Blocker
   sitzen im WORDING («jede Angabe …»-Absolutum; «aus geprüften Bausteinen» = reservierter
   Status-Terminus), nicht in der Optik — von Contrarian, beiden Trust-Kritiken und Outsider
   unabhängig gefunden. 4. Bausequenz: richtungs-unabhängige Plumbing zuerst (~70 % der
   Arbeit), Hero-Visualschicht als letzter, reversibelster Layer. 5. Beide Konzepte
   verschlechterten den Frist-Pfad (Schnellrechner-Demotion) — gemeinsamer Bug.

### Where the Council Clashes
[Value Tension] Sichtbare Wärme (Wunsch 3.7., Devil's Advocate: lex posterior) vs.
Skeptiker-Trust (Daueranweisung 5.6.; B-Hero-Anatomie = SaaS-Template) → Auflösung: genau EINE
warme Fläche ohne Template-Möblierung. [Value Tension] Erstbesucher-Orientierung vs.
Wiederkehrer-Effizienz → Wiederkehrer gewinnt (Frist rechnen = schärfster Kanzlei-Schmerz).
[Error Catch] Falsche technische Begründungen in BEIDEN Konzepten (Datums-Hydration;
`sichtbar()` nicht SSR-deterministisch — 3× unabhängig gefunden). [Error Catch] B unterschlägt
Kollisionen (`tailwind.config.js` trifft W3·14-Liste 4/4; `seo.ts`+`prerender.ts` vs.
SEO-A11Y); A unterschlägt `/rechner`. [Value Tension] Registry-Über-Abstraktion vs.
FUNDAMENT-Anschluss → behalten, aber entkernt (ohne `sichtbar()`).

### Blind Spots Revealed (Peer-Reviews)
Rahmen-Deferenz (alle ausser First Principles akzeptierten die A-vs-B-Binärfrage aus der
Auftragsformulierung); Executor blind für den Wording-Trust-Bruch; primäre Persona ungeklärt
(David vs. Anwältin-zeigt-Gericht vs. Amtsschreiber im 200. Besuch); «Hybrid»-Rhetorik teils
Schein-Konsens → Verdikt nagelt die Schalter einzeln fest.

### Mediating Assessments (vor der Empfehlung, einzeln bewertet)
1. Trust-Risiko: sitzt nachweislich im Wording + in der Möblierung (Badges/SVG/XL), NICHT im
Brass-Ton — Wash tragbar, Möblierung nicht. 2. Davids 3.7.-Wunsch: reines A ändert viel
Sichtbares, aber das Rest-Risiko «keine Wärme erkennbar» ist real und unbelegt widerlegbar —
eine sichtbare warme Geste ist nötig. 3. Reversibilität: Hero-Optik ist der kleinste, letzte,
reversibelste Layer; Outside-View-Basisrate 1,5–3× Überschreitung bereits eingetreten → warme
Variante ZUERST bauen und notfalls zurückklassen, nicht umgekehrt. 4. Reglement-Treue: Hybrid
mit NULL neuen Farb-/Typo-Tokens baubar (nur 2 `min-h`-Tokens) — `text-display-xl` verletzt
die bewusste Skalen-Grenze. 5. Wiederkehrer: Schnellrechner VOR die Kacheln —
entscheidungsunabhängig, 3× unabhängig gefordert.

### Devil's Advocate — and the Council's Answer
Sein Kernpunkt (lex posterior; «A ohne Wärme sieht aus wie vorher» = Auftrag verfehlt; B-Hero
billig reversibel; Belegbarkeits-Frage) → **teilweise recht, genau dort eingebaut:** deshalb
Brass-Wash-Hero als DEFAULT, nicht als Option. Unrecht: (1) «B mit fünf Streichungen» IST der
verfügte Hybrid — sein Angriff kollabiert in die Empfehlung; (2) sein
legislation.gov.uk-Beleg trägt das XL-Token nicht (echte gov.uk-Startseite = Suchfeld +
Linkliste; Restraint ist dort die Modernität). Outsider-Einwand «erst David Screenshots
zeigen» widerspricht dem erteilten Mandat (bewusste Delegation, keine Rückfrage-Schleifen) —
sein Kern wird BAU-AUFLAGE: Pflicht-Screenshot-Serie + Abnahme-Mappe + dokumentierter
Ein-Klassen-Fallback statt Rückfrage.

### Recommendation
Hybrid «A-Basis + Brass-Hero» gemäss Schalter-Liste (oben / FAHRPLAN §0); Zeiterfassung
Option A (`/rechner`-Sektion); 10 verbindliche Bau-Auflagen (FAHRPLAN §9): Status-Wording
§8-ehrlich · weitere Wording-Fixes (H1, Slogan-Streichung, Zähler-Scope) · `sichtbar()` raus ·
NewsHeader-Leerzustand · Zuletzt-Chips @390 · `seo.test.ts:81` deklariert · Kollisionsprüfung ·
Kontrast-Messung vor Merge · Bausequenz erzwungen · Screenshot-Serie + Abnahme-Mappe.

### What You Lose
Expansionist: die gov.uk-10x-Reinheit (Hero ganz streichen) wird geopfert — die Brass-Geste
ist primär für EINEN Stakeholder (David, 3.7.) da. Trust-Kritik B: Restrisiko «zu warm für die
Gerichts-Demo» bleibt — bewusst gegen den Ein-Klassen-Fallback getauscht, nicht eliminiert.

### Do This First
Baseline-Screenshot-Serie der heutigen Startseite (1280/390, hell/dunkel), dann der
richtungs-unabhängige Plumbing-PR — mit dem `seo.ts`-SSoT + Tor als eigenem gegateten Schritt.
Der Hero kommt zuletzt.

### How to verify
1. Kontrast-Messung vor Merge (dokumentiert im PR). 2. First-Paint-Diff vorher/nachher — der
Unterschied muss ohne Erklärung sichtbar sein (operationalisiertes 3.7.-Kriterium, Inhalt der
Abnahme-Mappe). 3. Outside-View: Budget 3–4 Sessions (davon 1 nur SSoT/Tor); Überschreitung im
Plumbing-PR = Frühindikator, den Schnitt zu verkleinern statt den Hero vorzuziehen.

## Geltungsbereich & Ausnahmen

Gilt für die Startseite «/» + Einstiegs-Navigation (Sidebar-Reihenfolge I1, `/rechner`-Einbau
der Zeiterfassung) + die I2-Messaging-Flächen (`seo.ts`-Projektionen site-weit). NICHT erfasst:
Topbar-`HeaderSuche` (bleibt unverändert; geteilter Knoten mit E2-Suche-Strang),
Reader/Split-View, `/rechner`-Zweiachsen-Matrix.

## Pflegebedarf

- Datums-Overline: rein darstellend, kein datierter Parameter (nichts fürs Verfallsregister).
- Kachel-Zähler: Buildzeit-Codegen + Drift-Tor (kein manuell gepflegter Wert).
- Nach Davids späterer Sichtung der Abnahme-Mappe: Brass-Wash bestätigen oder Ein-Klassen-
  Fallback ziehen (dokumentiert in FAHRPLAN §0).

## Abnahme-Status

Zweifach geprüft (Erstrecherche durch 5 unabhängige Stränge + adversariale Kritiken +
Devil's-Advocate-Durchgang; Design-Entscheid durch Council-Delegation Davids VERBINDLICH).
**Fachliche Wort-für-Wort-Abnahme der sichtbaren Texte durch David steht aus** (Zeitsperre bis
1.12.2026; Status der Seite bleibt ehrlich, Abnahme-Mappe liegt nach dem Bau bereit).

## Rohmaterial (Provenienz)

Die vollständigen Arbeitsdokumente (5 Recherche-Berichte, 2 Vollkonzepte, 4 Kritiken,
Council-Transkript) entstanden im Session-Scratchpad der Fable-Session vom 3.7.2026
(Workflow-Run `wf_20bbdf4e-e4b`); ihre entscheidungsrelevanten Inhalte sind vollständig in
dieses Dossier + `FAHRPLAN-STARTSEITE-V3.md` übernommen. Kondensierung ist bewusst: die Spec
ist die eine operative Quelle (§5), das Scratchpad kein Referenzort.
