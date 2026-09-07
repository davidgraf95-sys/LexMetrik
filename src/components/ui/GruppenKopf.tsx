import type { ReactNode } from 'react';

// ═══ EIN Gruppenkopf, EINE Anatomie (C-2/C-6/C-7, 31.8.2026) ════════════════
//
// GEMESSEN (Design-Konsistenz, Finder-Welle C, Runde 1): derselbe Sachverhalt —
// «hier beginnt eine Gruppe, sie enthält n Einträge» — wurde in ~24 Fundstellen
// in vier Zähler-Schemata und zwei Typo-Stimmen gezeichnet:
//
//   nackte Zahl   12×  Materialien · Rechtsprechung · RechtsgebietUebersicht ·
//                      International · GesetzeGliederung · KantonAuswahl · Suche
//   «(n)»          6×  Katalog (Werkzeug-/Vorlagen-Rubriken)
//   «· n»          4×  Gesetze.tsx (Such-Trefferliste) · KantonSystematik
//   «n verfügbar»  2×  Katalog-Registerkopf   → siehe §8-Ausnahme unten
//
// KANON (Mehrheitsform, das Reglement schweigt zur Zähler-Schreibweise):
// die **nackte Zahl**. Klammern und Mittelpunkt sind Satzzeichen ohne Aussage;
// die Zahl steht ohnehin allein in ihrem Slot. Die Stimme ist `.lc-overline`
// (DESIGN-REGLEMENT §G-e in der Fassung 29.8.2026: Mono trägt «kleine
// STRUKTUR-ETIKETTEN» — ein Gruppenkopf beschriftet eine Region, er wird
// gescannt, nicht gelesen). Sans-H3-Gruppenköpfe (Materialien, International,
// EU-Recht) wechseln darum sichtbar auf Overline.
//
// ANORDNUNG — Titel · Haarlinie · Zahl. Beide Reihenfolgen kamen je 5× vor;
// entschieden hat die umgebende Anatomie: `items-center` (17×) schlägt
// `items-baseline` (5×), und in der `items-center`-Familie steht die Zahl
// rechts der Linie (Materialien, International, GesetzeGliederung-Intl,
// Katalog-Registerkopf). Fachlich trägt dieselbe Richtung: die Linie führt das
// Auge auf einen rechtsbündigen Registerwert; klebt die Zahl am Titel, liest
// sich ein langer Titel («Weitere Entscheide — nicht in der amtlichen Sammlung
// (BGE) 12») als Fliesstext mit angehängter Ziffer.
//
// §8-AUSNAHME, bewusst NICHT eingesammelt: der Katalog-Registerkopf
// («n verfügbar», Katalog.tsx) zählt NICHT die Einträge der Gruppe darunter —
// die Sektion trägt zusätzlich einen «In Vorbereitung»-Block. Eine nackte Zahl
// wäre dort eine falsche Aussage über den Sektionsinhalt, nicht bloss eine
// andere Schreibweise. Das Wort bleibt (§8: Ehrlichkeitstexte nie abschwächen).
//
// ─── R3-β (31.8.2026) · die DICHTE Gestalt desselben Kopfes ────────────────
//
// Runde 3, Befunde B3-1/B3-2 + A3-4. Der Baustein deckte bis hierher nur die
// BREITE Gestalt (Haarlinie, Zahl am rechten Registerrand). Daneben stand
// dieselbe Inhaltsklasse — «hier beginnt eine Gruppe, sie enthält n Einträge» —
// siebenmal handgezeichnet in einer DICHTEN Gestalt, dort wo die Zeile in einem
// schmalen Panel steht und eine Haarlinie das knappe Bild nur zerschnitte:
//
//   `<p className="lc-overline">Werkzeuge<span className="num tabular-nums ml-1
//    font-normal normal-case text-ink-500">{n}</span></p>`
//   6× v3-Panel (PanelAnwendung ×3, PanelMaterialien ×2, PanelEntscheide ×1)
//   1× KontextGruppe (h3, zusätzlich mit Familien-Punkt und Richtungs-Label)
//
// Beide Gestalten sind DERSELBE Kopf, nicht zwei Bausteine: gleiche Stimme
// (`lc-overline`), gleiche Reihenfolge (Marke · Titel · Zahl), gleiche
// Zähler-Schreibweise (nackte Zahl, C-2). Verschieden ist nur, ob die Zeile
// über die volle Breite trägt. Darum eine Prop, kein zweiter Baustein (§5).
//
// FARBE, gemessen statt gesetzt: alle sieben dichten Köpfe stehen in der
// `lc-overline`-GRUNDFARBE (ink-600; KontextGruppe schreibt sie ausdrücklich
// hin, die sechs Panel-Köpfe erben sie), alle breiten in `text-brass-700`.
// Die Messing-Stufe markiert also den Beginn einer Region MIT Haarlinie; im
// Panel, wo die Köpfe dicht übereinander stehen, wäre sie ein zweites
// Akzent-Signal neben der ohnehin akzentuierten Panel-Kante. Der Kanon folgt
// dem Bestand (7:0 bzw. 12:0), nicht neuem Geschmack (FAHRPLAN §1).
//
// TOTE UTILITIES fallen dabei weg (§17-Rückbau): `tabular-nums` steht bereits
// in `.num` (index.css:999), `normal-case` wirkt auf Ziffern nicht, und
// `font-normal` setzt an einem `<p>`/`<h3>` das, was ohnehin gilt —
// `.lc-overline` deklariert kein `font-weight`.
//
// §3: reine Darstellung — der Baustein zählt nichts, er zeigt eine übergebene
// Zahl an.
// ─── R4-B (5.9.2026) · die INLINE-Gestalt und der sprechende Zähler ────────
//
// Runde 4, Befund R3-γ-2. Der App-weite Sweep (der Wächter fegte bis hierher
// nur eine Vierer-Liste, s. `design-r3b-chrome.test.ts`) fand die achte
// handgezeichnete Kopie des dichten Rezepts: die Klassen-Zeile der
// `BezuegeZeile` am Artikelfuss («KANTONAL 13»). Zwei Dinge hielten sie
// draussen, beide gelöst statt umgangen:
//
//   (1) Sie steht INLINE in einer Flex-Zeile neben der Chip-Linie. Ein `<p>`
//       wäre dort Inhaltsmodell-Lärm; darum `als="span"` — dritter Wert
//       derselben Prop, keine dritte Anatomie (§5).
//   (2) Ihr Zähler ist nicht immer eine nackte Zahl: ist die Linie gekürzt,
//       steht «5 von 13 gekürzt». Das ist KEINE zweite Zähler-Schreibweise im
//       Sinne von C-2 (Klammern/Mittelpunkt sind Satzzeichen ohne Aussage) —
//       es ist eine AUSSAGE über die gezeigte Menge, die eine nackte Zahl
//       falsch machen würde (§8: Ehrlichkeitstexte nie abschwächen). Darum
//       nimmt `zahl` auch einen String; die C-2-Schreibweise selbst bleibt
//       vom App-weiten Sweep bewacht, nicht vom Typ.
export function GruppenKopf({
  titel, zahl, stufe = 3, als = 'h', dicht, id, marke, markeStellung = 'links', title, className,
}: {
  titel: ReactNode;
  /** Einträge der Gruppe. Weggelassen = Gruppenkopf ohne Zähler (kein `0`).
   *  Regelfall ist die nackte ZAHL (C-2). Ein String ist nur dort zulässig, wo
   *  der Zähler eine §8-Aussage über die gezeigte Menge trägt, die eine blosse
   *  Zahl falsch machte («5 von 13 gekürzt», `BezuegeZeile`). */
  zahl?: number | string;
  /** Überschriften-Ebene der Umgebung — Darstellung bleibt gleich, nur das
   *  Dokument-Outline folgt der Schachtelung (h2 Seite → h3 Sektion → h4).
   *  Ohne Wirkung bei `als="p"`. */
  stufe?: 2 | 3 | 4;
  /** `'h'` (Default) = Überschrift der `stufe`. `'p'` = KEINE Überschrift —
   *  für Köpfe, die im Dokument-Outline nichts eröffnen dürfen: die
   *  Gruppentitel der Rechner-Formulare (sie stehen INNERHALB eines Schrittes,
   *  dessen Überschrift schon steht) und die Panel-Köpfe des Lesers V3, die im
   *  Outline unter der Panel-Überschrift hingen. Die DARSTELLUNG ist in beiden
   *  Fällen dieselbe — genau darum eine Prop und keine zweite Anatomie.
   *  `'span'` = wie `'p'`, aber INLINE: für Köpfe, die als Zelle einer
   *  Flex-Zeile neben ihrem Inhalt stehen (`BezuegeZeile`), wo ein
   *  Block-Absatz das Inhaltsmodell der Zeile bräche. */
  als?: 'h' | 'p' | 'span';
  /** Dichte Gestalt: OHNE Haarlinie, Zahl direkt am Titel, Overline in ihrer
   *  Grundfarbe. Für schmale Flächen (Panels, Kontext-Gruppen), wo die
   *  Haarlinie das Bild zerschnitte statt es zu ordnen. */
  dicht?: boolean;
  /** Für `aria-labelledby` der umgebenden Sektion. */
  id?: string;
  /** Marke der Zeile (Sachziffer «0.1», Familien-Punkt, Norm-Zitat, Hinweis-
   *  Glyph); rein dekorativ, der Aufrufer setzt `aria-hidden` bzw. den Namen. */
  marke?: ReactNode;
  /** Wo die Marke sitzt: `'links'` (Default) vor dem Titel, `'rechts'` am Ende
   *  der Zeile — also dort, wo auch der Zähler steht (die Haarlinie führt das
   *  Auge auf den rechten Registerrand, s. o.). Stehen beide, kommt zuerst die
   *  Zahl, dann die Marke. */
  markeStellung?: 'links' | 'rechts';
  /** `title`-Attribut des Kopfes — der volle Wortlaut, wo die Zeile gekappt
   *  ist, oder der fachliche Beleg der Gruppe (PanelEntscheide). */
  title?: string;
  /** Zusatz-Klassen: in der breiten Gestalt der ZEILE (Abstände der Umgebung),
   *  in der dichten des Kopf-Elements selbst (dort gibt es keine Zeile) —
   *  Layout/Kappung, nie Typo/Farbe. */
  className?: string;
}) {
  // ── GB-2 (W2·24, Befund G2, 7.9.2026) · DER GRUPPENKOPF IST EIN RANDTITEL ──
  // GEMESSEN: `Literata italic` kam im ersten Bild auf 8 von 9 Routen gar nicht
  // vor — der Serifen-Akzent, den David am Bildbogen mochte, lebte nur auf «/».
  // Dieser Baustein ist die Zeile, die auf JEDER Route einen Abschnitt BENENNT
  // (Randtitel/Blattname); er ist damit der eine Ort, an dem der Akzent ohne
  // Einzelstellen zurückkommt. `.lc-randtitel` (index.css §GB-2) setzt Literata
  // kursiv UND die Registerfarbe der Route (`data-reg` an `layout/RouteHuelle`)
  // — beides in EINEM Rezept, damit «welche Farbe» nie hier entschieden wird.
  // `.lc-overline` selbst bleibt unangetastet (F0.7: Archivo, keine Versalien,
  // ink-500-Boden) — die Variante nimmt der Klasse nichts.
  // GESTRICHEN dabei: `text-brass-700` an der breiten Gestalt. Es war die
  // Ersatz-Farbigkeit aus der Zeit VOR den Registerfarben (§17-Gegengewicht:
  // ersetzen statt addieren) — Messing hätte auf allen vier Registern dasselbe
  // gesagt, also nichts. Die dichte Gestalt trug schon vorher keine Farbe.
  const El = als === 'h' ? (`h${stufe}` as 'h2' | 'h3' | 'h4') : als;
  if (dicht) {
    return (
      <El id={id} title={title} className={className ? `lc-overline lc-randtitel ${className}` : 'lc-overline lc-randtitel'}>
        {markeStellung === 'links' && marke}
        {titel}
        {zahl != null && <span className="num ml-1 text-ink-500">{zahl}</span>}
        {markeStellung === 'rechts' && marke}
      </El>
    );
  }
  return (
    <div className={className ? `flex items-center gap-3 ${className}` : 'flex items-center gap-3'}>
      {markeStellung === 'links' && marke}
      <El id={id} title={title} className="lc-overline lc-randtitel">{titel}</El>
      <span aria-hidden className="flex-1 h-px bg-line" />
      {zahl != null && <span className="num text-body-s text-ink-500">{zahl}</span>}
      {markeStellung === 'rechts' && marke}
    </div>
  );
}
