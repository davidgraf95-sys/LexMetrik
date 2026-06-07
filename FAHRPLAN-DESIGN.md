# Fahrplan: Frontend-Design-Anpassungsbedarf (Audit 7.6.2026)

**Auftrag David:** «überprüfe mit frontend design anpassungsbedarf und
erstelle handlungsplan».

**Methode:** 4 parallele Audit-Agents (Token-Treue · Komponenten-Konsistenz ·
Responsive/A11y · gestalterische Qualität) über `src/pages/` + `src/components/`
+ CSS; alle tragenden Befunde danach **empirisch verifiziert** (Grep/Read,
§7-Geist: verifizieren, nicht vertrauen). Verworfene Falschbefunde am Ende
dokumentiert.

**Gesamtbild:** Das Designsystem (Papier/Tinte/Messing, Geist, 8-px-Raster,
Typo-Skala) ist solide und wird weitgehend eingehalten — **keine** Fremdpaletten,
**keine** Hex-Farben in TSX, **kein** verbotenes `text-sm`/`text-lg` (0 Treffer).
Der Anpassungsbedarf liegt in vier Schichten: totes CSS, Baustein-Nachbauten
statt Bausteinen, A11y-Lücken in Eigenbau-Controls, und Identitäts-Feinschliff.

**Umsetzungs-Stand (7.6.2026, «mach einfach»-Freigabe David):** Etappen 1–5
GEBAUT (Commits f96b28c · ed1f7c5 · 542a909 · 3ee2c32 · Etappe 5).
Abweichungen/Präzisierungen bei der Umsetzung:
- 2.5/2.7 kein Handlungsbedarf (Verzugszins-Kacheln = dokumentierte
  Spezialform; Wizard-Top-Level ist bereits space-y-6).
- 3.3: Katalog-Schliessen hatte sichtbaren Text (Audit übertrieb) — nur ✕
  aria-hidden gestellt; Test-Assertion deklariert angepasst.
- 4.1/4.3/4.4: am Code widerlegt (min()-Breiten fangen 360 px; Header
  ≈305 px belegt; Wortmarke mobil = Entscheid David 6.6.) — keine Eingriffe.
- 5.1: Pro war BEREITS h1 (kompakte text-h2-Grösse = Entscheid 5.6.2026,
  bleibt); nur scale-rule ergänzt.
- 5.6 als Konvention (kein Sweep): Zahlen mit Einheit/Betrag/Datum in
  UI-Texten tragen `.num`; bei Neubauten beachten.
- 3.5 FristenKalender: arbeitsfrei ink-300→ink-400 als Kompromiss
  (Abschwächung ist Gestaltungsabsicht; Info zusätzlich in title+Legende).
Offen: Abschluss-Bug-Check §9 (2 Agents) + axe-Stichprobe (3.7) +
Screenshot-Serien (4.6/5.8) als Abnahmegrundlage.

**Grundsätze:** Reine Darstellungsschicht (§3) — `src/lib/` bleibt unberührt;
Golden-Outputs müssen nach JEDER Etappe byte-identisch sein. Tore je Etappe:
`npx tsc -b` · `npm test` · `npm run lint` (volle Ausgabe) · `npm run build` ·
`golden-outputs vergleich`. Push/Deploy nur nach Davids Ja (§9).

---

## Etappe 1 — Totes CSS entfernen (Quick Win, verhaltensneutral)

- [ ] 1.1 **`src/App.css` löschen**: wird NIRGENDS importiert (verifiziert:
  0 Importe), enthält Vite-Boilerplate-Residuen (`.counter`, `.hero`,
  `.next-steps`, `.ticks` — alle 0 Verwendungen) und referenziert
  nicht existierende Tokens (`--accent-bg`, `--accent-border`, `--text-h`,
  `--social-bg`). Reiner Löschvorgang, kein Risiko.
- [ ] 1.2 Kurzer Grep-Nachweis im Commit, dass keine Klasse aus App.css in
  TSX vorkommt.

## Etappe 2 — Baustein-Nachbauten durch Bausteine ersetzen (grösste Baustelle)

Verifizierter Kernbefund: Vorlagen-SEITEN bauen nach, was Forms längst als
Baustein nutzen.

- [ ] 2.1 **Neue Klasse `.lc-highlight`** (Messing-Hervorhebungsbox) in
  `index.css`: ersetzt die **13 verifizierten** Inline-Nachbauten
  `style={{ borderColor: 'var(--brass-500)', background: 'var(--brass-100)' }}`
  (12 Vorlage-Seiten + `SchkgFristenForm.tsx:225`). Anatomie einmal
  definieren (Border-Stärke, Radius, Padding), dann Suchen/Ersetzen.
- [ ] 2.2 **Fehler-Boxen vereinheitlichen**: `FehlerBox`
  (`vorlagen/ui.tsx`) wird in 10 Forms genutzt, aber in **0 von 12**
  Vorlage-Seiten — dort stattdessen inline
  `rounded-lg border bg-danger-bg p-4` + `style={{borderColor:…}}`
  (verifiziert u. a. VorlageArbeitsvertrag.tsx:398,
  VorlageKuendigungArbeitgeber.tsx:262, VorlageKlageVereinfacht.tsx:306,
  VorlageKuendigungMieter.tsx:166+260). Entweder `FehlerBox` importieren
  oder auf `.lc-notice-danger` umstellen — EIN Muster für alle.
- [ ] 2.3 **Karten-Nachbauten**: `border border-line rounded-lg p-3/4
  bg-surface` in Forms (SperrereignisseEditor:51, KombinierteAnsicht:123/179,
  SchkgFristenForm:238, ErbteilungForm:260, ZpoFristenForm:295,
  ZustaendigkeitForm mehrfach, GewaehrleistungForm:321) → `.lc-card` /
  `.lc-tile` wo die Anatomie passt; wo bewusst leichter (kein Schatten),
  ggf. `.lc-panel` als dritte dokumentierte Stufe einführen statt
  Freihand-Klassen.
- [ ] 2.4 **Lösch-/Entfernen-Textbuttons** standardisieren
  (SperrereignisseEditor:54, KombinierteAnsicht:200, VerzugszinsForm:221,
  StreitwertForm:152 — vier verschiedene Schreibweisen): eine Variante
  `.lc-btn-ghost`-basiert mit danger-Text definieren.
- [ ] 2.5 **EckdatenKachel-Rollout**: in 7 Dateien genutzt; Teuerung-/
  Verzugszins-/Streitwert-Form bauen Kacheln mit `.lc-tile` frei nach →
  vereinheitlichen.
- [ ] 2.6 **NormChip (ErgebnisAnzeige.tsx) vs. NormLink (vorlagen/ui.tsx)**:
  zwei Implementierungen derselben Fedlex-Anker-Darstellung →
  eine geteilte Komponente (reine Darstellungs-Entdoppelung, §3-konform).
- [ ] 2.7 **Vertikal-Rhythmus Seiten-Top-Level**: Rechner `space-y-6` vs.
  Vorlagen `space-y-4/5` — Standard festlegen (Empfehlung: `space-y-6`
  beide) und durchziehen.
- [ ] 2.8 Bug-Check §9 (2 unabhängige Agents, visuell: Screenshots
  vorher/nachher der betroffenen Seiten) + Golden-Vergleich.

## Etappe 3 — Barrierefreiheit (Zielniveau WCAG 2.1 AA)

- [ ] 3.1 **DatumsFeld-Kalender-Popover** (DatumsFeld.tsx:121–171):
  `role="dialog"` + `aria-modal`, `role="grid"`/`gridcell` für die
  Tages-Matrix, Pfeiltasten-Navigation + Enter/Space-Auswahl,
  `focus-visible`-Stil auf Zellen. Grösster A11y-Einzelposten
  (Eigenbau-Datepicker ist auf jeder Rechner-Seite im Einsatz).
- [ ] 3.2 **Touch-Targets**: SelectionGrid-Buttons (~40 px) und
  `Tabs groesse='s'` (h-8 = 32 px) auf min. 44 px Klickfläche anheben
  (`min-h-11` bzw. unsichtbare Hit-Area), Dokumentmappen-Tabs prüfen.
- [ ] 3.3 **Icon-/Symbol-Buttons**: Katalog-Schliessen-Button («✕»,
  Katalog.tsx ~102) mit `aria-label`; Bestand einmal durchgrep-en
  (`>✕<`, `>×<`, Icon-only-Buttons).
- [ ] 3.4 **aria-live verfeinern**: Ergebnisblöcke (`ErgebnisAnzeige.tsx:85`,
  AllgemeineFristForm:245) `aria-atomic="true"` ergänzen, damit
  Screenreader das ganze Ergebnis statt einzelner Knoten ansagen.
- [ ] 3.5 **Kontrast-Durchsicht ink-300/400** (8 verifizierte Stellen):
  echte Disabled-Zustände dürfen bleiben (WCAG-Ausnahme);
  bedeutungstragender Text — RechnerKarte.tsx:74–76 «geplant»-Szenarien
  und «· in Vorbereitung» (ink-400 ≈ 3.4:1 auf Papier) — auf ink-500
  anheben. FristenKalender Sa/So-`ink-300` prüfen (Information auch
  anders kodiert? sonst anheben).
- [ ] 3.6 **Field-Label-Verknüpfung** (vorlagen/ui.tsx `Field`): implizites
  Label beibehalten ODER `htmlFor`/`id` explizit — einheitlich entscheiden;
  axe-core-Lauf als Abnahme.
- [ ] 3.7 Tor zusätzlich: axe-core/Lighthouse über Startseite, 1 Rechner,
  1 Vorlage; Tastatur-Durchlauf (nur Tab/Pfeile/Enter/Esc) protokollieren.

## Etappe 4 — Responsive (Prüfbreite 360/375 px)

- [ ] 4.1 **FristenKalender** (FristenKalender.tsx:57): Mehrmonats-Layout
  `flex flex-wrap gap-x-8` bricht auf 360 px → `grid grid-cols-1
  sm:grid-cols-2` (1 Monat pro Zeile mobil), Overflow-Verhalten testen.
- [ ] 4.2 **Timelines** (VerzugszinsTimeline:96/138, KuendigungTimeline:88–97):
  Marker-Labels mit `fontSize: '0.6rem'`-Inline-Styles überlappen unter
  480 px → auf `text-micro` umstellen (nebenbei Token-Fix) und mobile
  Beschriftungs-Strategie (Stapeln oder Legende statt Inline-Labels).
- [ ] 4.3 **Header mobil** (Header.tsx:56–85): auf 360 px gedrängt —
  Wortmarke verkürzen oder Abstände/Buttongrössen mobil reduzieren;
  zusammen mit 3.2 lösen (nicht unter 44 px rutschen!).
- [ ] 4.4 **Katalog-Panel-Grid** (Katalog.tsx:114): `minmax(min(340px,100%),1fr)`
  gegen Panel-Padding auf 360 px prüfen, ggf. 300 px.
- [ ] 4.5 **Dokumentmappen-Tablisten** (AgDokumentmappe:367,
  GmbhDokumentmappe:360): bei 7+ Dokumenten zweizeilig — akzeptieren
  (wrap) oder `overflow-x-auto`-Scrollleiste; Fokus-Erhalt beim
  Tab-Wechsel testen.
- [ ] 4.6 Tor zusätzlich: Screenshot-Serie 360/768/1280 px der 5 betroffenen
  Ansichten vor/nach.

## Etappe 5 — Identitäts-Feinschliff («Referenzwerk»-Dichte)

Quelle: Design-Reviewer-Agent; alles im bestehenden System (keine neue
Farbwelt, keine neuen Fonts).

- [ ] 5.1 **Pro-Kopf aufwerten**: h1 statt h2 + `scale-rule` wie die
  Startseite — Pro ist die Hauptarbeitsfläche der Zahlkundschaft und
  wirkt derzeit hierarchisch untergeordnet.
- [ ] 5.2 **Sektions-Rhythmus statischer Seiten** (Methodik, Über,
  Datenschutz): `border-t border-line pt-6` (oder sparsame `scale-rule`)
  vor h2-Abschnitten — lange Dokumentseiten bekommen Ruhepunkte.
- [ ] 5.3 **Suspense-Fallback** (App.tsx ~80): neutraler «Wird geladen …»-Text
  → kleine `scale-rule` + ruhige Zeile, damit Laden nicht wie ein Fehler
  aussieht.
- [ ] 5.4 **NotFound** in die Familie holen: Overline + `scale-rule` +
  Standard-Seitencontainer.
- [ ] 5.5 **`.lc-list`** einführen (Messing-Gedankenstrich als Marker) für
  die rohen `<ul><li>`-Listen der Vorlagen-Hinweisblöcke; Startseite-
  Methodikzeile (Startseite.tsx:102, Inline-borderLeft) darauf umstellen.
- [ ] 5.6 **`.num`-Konsequenz**: Zahlen mit Einheit/Betrag/Datum in
  UI-Texten einheitlich `.num` (Stichprobe + Konventions-Notiz in
  STRUKTUR.md, kein Zwangs-Sweep).
- [ ] 5.7 **Details-Akzent**: Rechenweg/Annahmen-`<details>` in
  ErgebnisAnzeige bei `[open]` mit dezentem Messing-Signal
  (border-left o. ä.) — Marken-Element im täglichsten Interaktionspunkt.
- [ ] 5.8 Bug-Check §9 + Golden-Vergleich; Screenshots als Abnahmegrundlage
  für David.

---

## Verworfene Audit-Befunde (Transparenz, §7)

| Agent-Behauptung | Verifikation | Verdikt |
|---|---|---|
| «`text-xs` ist Tailwind-Default mit falscher lh, 40+ Verstösse, HOCH» | `xs: 0.75rem/1.4` ist in tailwind.config.js **definiertes Token**; verboten sind nur `text-sm`/`text-lg` → **0 Treffer** | falsch, verworfen |
| «ErgebnisAnzeige (204 Zeilen) wird nirgends importiert» | in **16 Forms** importiert | falsch, verworfen |
| «`<html lang>` wird beim Sprachwechsel nicht gesetzt» | `locale.tsx:44` setzt `document.documentElement.lang` | falsch, verworfen |
| «Half-Step-Abstände (py-1.5, gap-1.5 …) sind Raster-Verstösse» | Mikro-Layout innerhalb von Komponenten; das 8-px-Raster gilt laut Token-Kommentar für **Bandabstände** | kein Handlungsbedarf |
| «border-t-[3px] Verstoss» | Messing-Oberkante = dokumentiertes Signatur-Element | kein Handlungsbedarf |

## Entscheide für David

1. **Reihenfolge:** Empfehlung 1 → 2 → 3 → 4 → 5 (1 ist gratis; 2 senkt
   die Kosten von allem Folgenden; 3/4 sind Nutzerwirkung; 5 ist Kür).
   Einverstanden, oder A11y (3) vorziehen?
2. **`.lc-panel` als dritte Karten-Stufe** (2.3) einführen oder alles auf
   lc-card/lc-tile zwingen?
3. **Kontrast-Politik** (3.5): ink-400 für «geplant»-Texte auf ink-500
   anheben — oder ist die Zurücknahme dort gestalterisch gewollt
   (dann dokumentieren statt ändern)?
4. **Etappe 5 ganz/teilweise** — Feinschliff jetzt oder nach den
   fachlichen Vorhaben (FAHRPLAN-AG-GRUENDUNG Etappen 1–5)?

**Abgrenzung:** Läuft NEBEN den fachlichen Fahrplänen; keine Engine-,
Schema- oder Vorlagen-Textänderung. Erledigtes hier abhaken; Stand in
HANDLUNGSPLAN.md spiegeln.
