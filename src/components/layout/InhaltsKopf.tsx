import type { KopfDaten } from './InhaltsKopfKontext';
import { RuecksprungChip } from './RuecksprungChip';
import { DeepLinkSkeleton } from './DeepLinkSkeleton';
import { OrtsAngabe, StandAngabe } from './OrtsAngabe';
import { ortsLeistenKrumen } from './BrotkrumeRegel';
import { SchliessKnopf } from '../ui/SchliessKnopf';

// ─── Inhalts-Kopf (Einzelansicht «analog Split-View», ohne Verschiebe-Optionen) ─
//
// Wenn EINE Inhaltsseite offen ist (kein Split-View), trägt sie oben — analog zur
// Split-View-Pane-Titelleiste — einen schmalen Kopfbalken: klickbare Breadcrumb
// «woher man kommt» (Gesetze › Bund › OR), bei Gesetzen der gerade gelesene
// Artikel (live), rechts Suche, die beiden Menüs, der Stand + ✕ → Startseite.
// KEINE Verschiebe-/Tausch-Steuerung (es gibt nur diese eine Ansicht). Reine
// Darstellung (§3). Kontext/Helfer (melde, istInhaltsPfad, kopfVonPfad) liegen
// in InhaltsKopfKontext.ts.
//
// ── W2·7-BEZUG/B6 — Gesamtüberarbeitung der Leiste (Auftrag David 28.7.2026:
//    «die gesamte werkzeugsleiste überarbeiten und minimalistischer und
//    praktischer darstellen»). Drei Befunde, drei Antworten:
//
//  ① ORT statt drei Zonen. Die Leiste war ein `grid-cols-[1fr_auto_1fr]`:
//     Brotkrumen links, Artikel MITTIG, Bedien-Cluster rechts. Brotkrumen und
//     Artikel beantworten aber DIESELBE Frage («wo bin ich?») und standen
//     dennoch durch eine leere Mittelspalte getrennt — auf 1440 px klaffte
//     zwischen ihnen ein 300-px-Loch, während sich rechts fünf Griffe drängten.
//     Neu: EINE Ortsangabe links (Krumen · Artikel), EIN Griff-Riegel rechts.
//     Die Wiederholung des Kürzels («… › ZGB · Art. 212 ZGB») entfällt dabei —
//     der Artikel steht ja unmittelbar hinter seinem Erlass (`kuerzeArtikel`).
//
//  ② SCHMALE BREITEN. Bei 360 px teilte das 1fr_auto_1fr-Raster den Rest
//     gleichmässig auf zwei Spalten auf und liess für die Krumen ~30 px übrig;
//     jede Krume truncatete FÜR SICH → die Leiste zeigte «( ) )» statt
//     «Gesetze › Bund › ZGB». Neu: unterhalb sm tragen die führenden Krumen
//     EINEN ‹-Rücksprung auf die Eltern-Ebene (bei Gesetzen die gefilterte
//     Gesetzes-Übersicht — dasselbe Ziel, das die Sektions-Krume «Gesetze»
//     ansteuert), und nur die Blatt-Krume + der Artikel bleiben ausgeschrieben.
//     Gekürzt wird als EINE Einheit, nie Zeichen für Zeichen je Krume.
//     ── ERGÄNZT 31.8.2026 (A-4): Befund und Antwort gelten unverändert;
//        gewandert ist nur die MESSGRÖSSE. Damals «unterhalb sm» (Viewport),
//        seit A-4 «unterhalb 28 rem Ort-Zone» (`@md/ort`, Container-Query in
//        `./OrtsAngabe`) — dieselbe Regel gilt seither auch im Split-View, wo
//        der Viewport die falsche Zahl war.
//
//  ③ VIER ANATOMIEN → EINE. Die Griffe (☰, Suche, Rechtsprechung ▾, Ansicht ▾,
//     ✕) trugen bordierte Knöpfe, `lc-chip` mit Messing-Tick, `lc-input` und
//     blanken Text nebeneinander, in zwei Radien und zwei Schriftgraden. Neu
//     alle auf `lc-leiste-griff` (24 px, rounded-md, Mono-Micro); gruppiert
//     wird über Weissraum statt Rahmen (Reglement F1).
//
// Was NICHT wandert: die Stand-Angabe bleibt in JEDER Breite ausgeschrieben
// sichtbar (D1 — sie ist ein Rechtswert, kein Zierrat; sie wird leiser gesetzt,
// nie versteckt). Kein Griff ist weggefallen, keiner ist in ein Menü gerutscht.
// Höhe unverändert h-9 ⇒ CLS 0 gegenüber dem Vorzustand.
//
// ── A-2 (David 17.8.2026): die Leiste ist ABWÄHLBAR. Meldet die Inhaltsseite
//    `kopfzeileSelbst`, entfällt sie ganz (Herleitung am Feld in
//    `InhaltsKopfKontext.ts` und am `if` unten). Alles darüber gilt unverändert
//    für jede Seite, die das Feld nicht meldet.

// ── A-4 (31.8.2026): Krumen-Kette, Rücksprung, Artikel-Etikett und die
//    Overflow-Regel dieser Leiste stehen nicht mehr hier, sondern in
//    `./OrtsAngabe` — demselben Baustein, den seither auch der `PaneKopf`
//    konsumiert (§5/§10). Die Herleitungen ② «schmale Breiten» und die
//    Trenner-Messung C5 sind wörtlich mitgewandert; NEU ist allein, dass die
//    Kaskade die ZONE misst statt den Viewport (Herleitung dort). `kuerzeArtikel`
//    lebt ebenfalls dort und ist von hier verschwunden — es war die Ableitung
//    dieser Anzeige, nicht dieser Datei.

export function InhaltsKopf({ daten, breiteKlasse, onSchliessen }: {
  daten: KopfDaten;
  /** Breitenklasse der Inhaltsspalte → Kopf fluchtet mit dem Inhalt. */
  breiteKlasse: string;
  onSchliessen: () => void;
}) {
  // ── A-2 (David 17.8.2026) · EINE KOPFZEILE, NICHT ZWEI ────────────────────
  // Trägt die Inhaltsseite ihre Kopfzeile selbst (`kopfzeileSelbst`, Herleitung
  // im Vertrag), zeigt diese Leiste NICHTS mehr — keine Krume, keinen Stand,
  // kein ✕. Was bleibt, sind die zwei Sprung-Rückmeldungen: sie hängen hier,
  // weil dieser Kopf die einzige Klammer über allen Inhaltsseiten ist
  // (Herleitung unten), rendern im Ruhezustand `null` und liegen ausserhalb des
  // Layoutflusses — sie kosten also nichts, wenn die Leiste schweigt.
  //
  // WARUM DER STILLE TRÄGER BLEIBT und nicht ein blankes Fragment: das
  // `DeepLinkSkeleton` positioniert sich `absolute top-full` an der UNTERKANTE
  // dieser Leiste (statt über eine addierte Pixelhöhe, die still veraltet). Ohne
  // Träger hätte es keinen Anker und läge am Seitenanfang; mit einem Träger OHNE
  // `sticky top-16`/`z` läge es beim Scrollen an der falschen Stelle und unter
  // dem klebenden Seiten-Kopf.
  //
  // ── UND WARUM ER SEINE HÖHE BEHÄLT (gemessen, kein Zierrat) ────────────────
  // Die erste Fassung liess den Träger auf 0 px zusammenfallen. Folge, gemessen
  // 17.8.2026 @1440 StPO: die Route `/gesetze/:ebene/:key` ist `lazy`, die Shell
  // rät bis dahin aus dem Pfad, dass eine Leiste kommt (`kopfVonPfad`) — sagt der
  // Leser dann «ich trage sie selbst», rückte `main#inhalt` 102 → 65 px hoch. EIN
  // Layout-Shift von 0.0238, Gesamt-CLS 0.0309 gegen 0.0048 in V1, und das
  // Bestands-Tor `leser-kopf-cls-s3` (v3 @390) riss seine Schwelle 0.05 mit
  // 0.0573. Ein gerissenes Tor ist keine Verhandlungssache (§6).
  // Darum bleibt das BAND reserviert (h-9 + 1 px Kante = dieselben 37 px wie die
  // laute Leiste): im Fluss oberhalb des Inhalts wandert dann nichts. SICHTBAR
  // gewonnen sind die 37 px trotzdem, weil der Leser-Kopf sich darüberlegt — er
  // verschluckt das Band zusätzlich zur Wrapper-Polsterung (`--leser-v3-app-band`,
  // gesetzt in `pages/gesetz-leser/v3/leserGeometrie.ts`; Kopf-Unterkante
  // 159 → 122 px). Kein Kasten springt, die 37 px liegen hinter einem opaken Kopf.
  // `pointer-events-none`, weil das Band mit höherem z über der oberen Hälfte
  // jenes Kopfes liegt und Klicks auf Krume und Griffe sonst schluckte; die zwei
  // Rückmeldungen holen sich die Klickbarkeit selbst zurück (beide tragen
  // `pointer-events-auto` an ihrem bedienbaren Element).
  // ── WURZEL-FIX 1.9.2026 (QS-PERF/B5) · EIN TRÄGER, ZWEI ZUSTÄNDE ──────────
  // Diese Datei hatte für «still» und «laut» ZWEI `return`-Zweige, und in beiden
  // standen `RuecksprungChip` und `DeepLinkSkeleton`. React ordnet statische
  // Kinder nach POSITION zu: im stillen Zweig lag der Chip an Index 0, im lauten
  // an Index 1 — der Zweigwechsel war damit kein Update, sondern ein UNMOUNT +
  // REMOUNT der beiden Rückmeldungen. Und dieser Zweigwechsel passiert bei JEDEM
  // Leser-Einsprung: die Route `/gesetze/:ebene/:key` ist `lazy`, die Shell rät
  // bis dahin aus dem Pfad eine laute Leiste (`kopfVonPfad`), und sobald der
  // Leser steht, meldet er `kopfzeileSelbst`.
  //
  // FOLGE, gemessen (BV#art-8, 6× CPU-Drossel, rAF-Sampler, n=3): die
  // «Springe zur verlinkten Stelle …»-Ansage ging beim Zweigwechsel AUS und
  // 13–511 ms später wieder AN — ein sichtbares Blinken. Flanken und
  // Zweigwechsel fielen auf die Millisekunde zusammen:
  //     an 678 · aus 823 · an 836 · aus 1441   |  Zweig → still @ 823
  //     an 495 · aus 666 · an 1177 · aus 1250  |  Zweig → still @ 666
  //     an 501 · aus 672 · an 1186 · aus 1263  |  Zweig → still @ 672
  // (Ziel `#art-8` im DOM erst bei 1177–1355 ms.) Der Effekt-Cleanup des
  // sterbenden Skeletons rief `schliesse()`, die neue Instanz baute die Ansage
  // neu auf. Kein Timing-Zufall, sondern eine Kopplung an den MONTAGEORT.
  //
  // Sichtbar wurde das erst, als der Leser schnell genug wurde, dass die Lücke
  // VOR den Artikel-Render fiel — `e2e/leser-ruecksprung-r5-r7.e2e.ts` wartet
  // auf «Ansage weg» und las dann in die Lücke hinein (Ziel noch nicht im DOM).
  // Die Ursache lag aber immer hier, nicht am Tempo (§17: Wurzel, nicht Symptom).
  //
  // FIX: EIN Träger, dessen Zustand nur Attribute, Klassen und den VORDEREN
  // Inhalt ändert; die zwei Rückmeldungen stehen in beiden Zuständen an
  // derselben Position und behalten damit ihre Identität. Das gerenderte Markup
  // ist in beiden Zuständen unverändert (der stille Zustand rendert `null` statt
  // der Leisten-Zeile, `undefined`-Attribute lässt React weg) — Golden und die
  // prerenderten Seiten bleiben byte-gleich.
  const still = !!daten.kopfzeileSelbst;
  return (
    // Klebt unter der Topbar (sticky top-16 = 4rem), bleibt beim Scrollen sichtbar
    // (damit der Live-Artikel mitläuft). z ÜBER den Inhalts-Sticky-Leisten (Suche
    // z-reader-scrim=16 / Sektions-Kontextkopf z-entscheid-sticky=15), damit das
    // A26-«Ansicht»-Dropdown-Panel beim Aufklappen über sie legt statt dahinter zu
    // verschwinden; die Leiste selbst überlappt sie nicht (sie sitzt 36 px höher),
    // das z ist rein fürs Panel.
    // A41 (David 16.7.2026, Overlay-Bug): z BEWUSST UNTER dem Topbar-Stapelkontext
    // (Topbar sticky z-leiste=20). Vorher z-dropdown(30) > 20 → dieser Kopf legte
    // sich über das GANZE Topbar-Fenster inkl. des Header-Such-Dropdowns (dessen
    // z-dropdown IM z-leiste-Topbar-Kontext gefangen ist) → «kopfzeile bei
    // gesetzen verdeckt suchresultate aus dem header». z-inhalt-kopf (C3: benannte
    // Rolle für den vormals rohen Wert 19) hält den Kopf weiter über den
    // Reader-Sticky-Leisten (16/15 → A26-Panel bleibt oben), lässt aber das
    // Header-Dropdown darüber.
    // Der STILLE Zustand (A-2, `kopfzeileSelbst`) trägt denselben Träger mit
    // `h-9` reserviertem, transparentem Band — die Herleitung dafür steht oben
    // («UND WARUM ER SEINE HÖHE BEHÄLT»): fiele er auf 0 px zusammen, sprängen
    // 37 px und das Bestands-Tor `leser-kopf-cls-s3` riss seine Schwelle.
    <div data-inhalt-kopf={still ? undefined : true} data-inhalt-kopf-still={still ? true : undefined}
      className={still
        ? 'pointer-events-none sticky top-16 z-inhalt-kopf h-9 border-b border-transparent'
        : 'sticky top-16 z-inhalt-kopf border-b border-line bg-paper'}>
      {/* `relative`: Anker für das mobile Overlay-Suchfeld (A35, sucheSlot) — es legt
          sich `absolute` über die Zeile, ohne etwas zu verschieben (§15.2). */}
      {still ? null : (
      <div className={`${breiteKlasse} relative mx-auto flex h-9 items-center gap-1.5 px-5 sm:gap-2 sm:px-6 md:gap-3`}>
        {/* ① ORT: Krumen und Artikel als EINE Angabe — seit A-4 (31.8.2026)
            aus dem geteilten Baustein `./OrtsAngabe`, den auch der `PaneKopf`
            konsumiert. `mitLink`, weil in der Einzelansicht der globale Router
            zuständig ist (im Pane ist es der Pane-eigene Navigator). */}
        {/* GA-1 (W2·24, 7.9.2026): die Leiste zeigt NIE das Blatt, nur den
            Rücksprung auf die Sektion — und den nur, wo die Seite keinen
            eigenen trägt. Herleitung und Messung: `./BrotkrumeRegel`. Die
            MELDUNG der Seiten bleibt vollständig (der `PaneKopf` braucht die
            ganze Kette); gefiltert wird an der Leiste, die die Regel betrifft. */}
        <OrtsAngabe breadcrumb={ortsLeistenKrumen(daten.breadcrumb)} artikel={daten.artikel} mitLink navLabel="Brotkrümel" />
        {/* ③ GRIFF-RIEGEL: drei Gruppen (finden · wählen · Blatt), innen gap-1,
            zwischen den Gruppen gap-3 — Nähe trägt die Gruppierung, nicht Linien
            (Reglement F1). */}
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2 md:gap-3">
          {/* A35 (David 19.7.2026): das In-Gesetz-Suchfeld sitzt HIER in der
              Kopfzeile (statt in der früheren full-width Such-Leiste) — zusammen
              mit dem ☰-Gliederungsknopf die Gruppe «finden». */}
          {daten.sucheSlot && <span data-such-slot>{daten.sucheSlot}</span>}
          {/* A26 (David 11.7.2026): das grundart-spezifische Bedien-Element (beim
              Gesetzes-Volltext das Menü-Paar «Rechtsprechung ▾ · Ansicht ▾») —
              links vom Stand/✕, damit es immer erreichbar ist, während man im
              Gesetz ist. */}
          {daten.ansichtSlot}
          {/* D1/§7: der Stand ist ein Rechtswert und bleibt in JEDER Breite
              ausgeschrieben stehen — B6 setzt ihn nur leiser (Micro statt xs),
              versteckt ihn nicht. `ink-600` statt `ink-500`, weil 11-px-Text
              ≥ 4.5:1 tragen muss (F2). */}
          {daten.stand && <StandAngabe stand={daten.stand} />}
          {/* A3-1 (R3-β): EIN Schliess-✕ der App — hier mit `ton="geerbt"`,
              weil die Farbe aus `lc-leiste-griff` kommt: B6 (28.7.2026) hält
              für ALLE Bedien-Elemente dieser Leiste EINE Anatomie fest, und
              eine datierte Entscheidung mit Vorfall wird nicht von einem
              späteren Sweep überschrieben. Neu ist auch hier die
              Komfort-Trefferfläche des Bausteins. */}
          <SchliessKnopf name="Schliessen (zur Startseite)" onClick={onSchliessen}
            ton="geerbt" klasse="lc-leiste-griff"
            /* `komfort={false}`: die Leiste steht dicht (Suche · Menüs · Stand ·
               ✕) — 44 px lägen über der Stand-Angabe und dem Menü-Paar links
               davon. B6 gibt der Leiste ihr Mass, hier gilt es auch für die
               Fläche. */
            komfort={false} />
        </div>
      </div>
      )}
      {/* W2·10-UI-NAV/R5 + R7: die beiden Sprung-Rückmeldungen der Einzelansicht.
          Sie hängen HIER, weil dieser Kopf die einzige Klammer ist, die über allen
          Inhaltsseiten liegt und zugleich weiss, dass eine läuft — beide rendern
          im Ruhezustand `null` und liegen ausserhalb des Layoutflusses, tragen
          also weder zum Markup noch zum CLS dieser Leiste bei (§15). Verschieden
          verankert, je nach Bezugspunkt: der Chip `fixed` am unteren Rand des
          FENSTERS (er gehört dem Daumen), das Skeleton `absolute` an der
          Unterkante DIESER Leiste (`top-full`) — so braucht es keine addierte
          Pixelhöhe von Topbar + Leiste, die still veralten könnte.
          Bewusst nur die Einzelansicht: im Split-View hat jede Pane ihren eigenen
          Scroll-Container und ihre eigene lokale History (PaneKopf) — ein
          fensterweiter Chip könnte dort nicht sagen, WELCHE Pane er meint. */}
      <RuecksprungChip />
      <DeepLinkSkeleton />
    </div>
  );
}
