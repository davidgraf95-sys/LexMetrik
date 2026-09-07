import { useMemo, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react';
import { Link } from 'react-router-dom';
import { FehlerBox, KopierButton, NormLink, Stepper } from './ui';
import { useZielSichtbar } from './useZielSichtbar';
import { NormChip } from './NormChip';
import { PassendeRechner } from './PassendeRechner';
import { NormText } from '../NormText';
import { useLocale, fedlexLokalisiert } from '../locale';
import { usePaneKlasse } from '../layout/PaneKontext';
import { SeitenTitel } from '../ui/SeitenTitel';
import { dokumentAlsText } from '../../lib/vorlagen/vorlagenText';
import type { AssembleErgebnis } from '../../lib/vorlagen/engine';
import { AUSGABE_LABEL, MUSTER, rolleLabel, type AusgabeStil } from '../../lib/vorlagen/formatvorlagen';
import { VORSCHAU } from './vorschauStil';
import { useAusgabeStil, getAusgabeStil, setAusgabeStil } from './ausgabeStil';
import type { PdfBanner } from '../../lib/vorlagen/banner';

// ─── Generischer Vorlagen-Wizard-Rahmen ─────────────────────────────────────
//
// Der in allen Vorlagen identische Rahmen (CLAUDE.md §10): Kopf mit
// Rückweg/Normen/Badge, Stepper, zweispaltiges Layout (Formular-Karte mit
// Fehlerbox und Zurück/Weiter, Vorschau mobil einklappbar / Desktop klebend),
// dazu VorschauPanel («Papier» + Bausteinprotokoll) und ExportLeiste
// (PDF lazy, DOCX lazy, Text kopieren). Eine neue Vorlage liefert nur noch
// Schema, Schritte und Schritt-Inhalte – KEINE Fachlogik hier (§3).

export function VorlagenWizardRahmen({
  // W2·10-UI-NAV/N0a: «Zurück zum Katalog» führte auf «/» (Startseite) statt
  // auf die Vorlagen-Übersicht — Default ans Label angeglichen (/vorlagen).
  zurueckHref = '/vorlagen', overline, titel, intro, norms, badge,
  fussnote, zuruecksetzen, schritte, schritt, setSchritt, fehler,
  weiterDeaktiviert, inhalt, vorschau, kopfSchalter,
}: {
  zurueckHref?: string;
  overline: string;
  titel: string;
  intro: ReactNode;
  norms: { label: string; url: string }[];
  badge: string;
  /** Eigener Speicher-Hinweis (z. B. «wird nicht gespeichert»); ersetzt den Standard-Hinweis. */
  fussnote?: ReactNode;
  /** Wenn gesetzt: sichtbarer «Eingaben zurücksetzen»-Button (mit Rückfrage) + Speicher-Hinweis. */
  zuruecksetzen?: () => void;
  schritte: readonly { id: string; label: string }[];
  schritt: number;
  setSchritt: Dispatch<SetStateAction<number>>;
  fehler?: string[];
  /** Default: fehler vorhanden. Überschreibbar (z. B. Stopp-Karten). */
  weiterDeaktiviert?: boolean;
  inhalt: ReactNode;
  vorschau: ReactNode;
  /** Optionaler Kopf-Schalter (Detailgrad/Untertyp, FAHRPLAN-VERTRAGS-VARIANTEN
   *  P0) – wird zwischen Kopf und Stepper gerendert. Reine Darstellung (§3). */
  kopfSchalter?: ReactNode;
}) {
  const { locale } = useLocale();
  const weiterAus = weiterDeaktiviert ?? (fehler != null && fehler.length > 0);
  // Grundsatz David (14.6.2026): im leeren Anfangszustand keine Eingabefehler
  // zeigen — die Fehlerbox erscheint erst, nachdem der Nutzer etwas eingegeben
  // hat («berührt»). Der «Weiter»-Button bleibt bei leeren Pflichtfeldern
  // weiterhin deaktiviert (weiterAus oben), nur die MELDUNG wird zurückgehalten.
  const [beruehrt, setBeruehrt] = useState(false);
  const merkeEingabe = () => { if (!beruehrt) setBeruehrt(true); };
  // Split-View E: Formular‖Vorschau-Split nach PANE-Breite (md→@3xl/pane), damit
  // der Wizard in einem schmalen Pane nicht zweispaltig gequetscht wird. Ausserhalb
  // eines Panes byte-gleich (Viewport-md:).
  const pk = usePaneKlasse();

  // Mobile Live-Vorschau (Redesign E6): sie ist das Kernversprechen, war aber
  // auf dem Telefon in allen Eingabe-Schritten zugeklappt. Jetzt steuerbar +
  // automatisch offen, sobald der Prüfen-Schritt erreicht ist (Render-Phasen-
  // Abgleich statt Effect — lint-konform).
  const [vorschauOffen, setVorschauOffen] = useState(false);
  const [letzterSchritt, setLetzterSchritt] = useState(schritt);
  if (schritt !== letzterSchritt) {
    setLetzterSchritt(schritt);
    if (schritt === schritte.length - 1 && !vorschauOffen) setVorschauOffen(true);
  }
  // LM-084 (W2·17-UI-BEFUNDE B10, 4.9.2026): dieser Knopf war der einzige
  // schwebende Sprung-Knopf OHNE Ausblende-Regel — er blieb auch dann über dem
  // Inhalt stehen, wenn sein Ziel schon im Bild war (gemessen 390 px,
  // `/vorlagen/nda`: Vorschau-Griff bei y=580, Knopf unverändert sichtbar über
  // dem Inhalt darunter). Die Schwester-Marke `ErgebnisSprung` blendet seit W5
  // (11.7.2026) genau dafür aus; der Wizard bekommt dieselbe Regel aus
  // demselben Haken statt einer Kopie (§5/§10). Nicht reproduzierbar waren die
  // übrigen Teile des Befunds: der Knopf ist `fixed` (nicht absolut), hält mit
  // `right-4` einen Sicherheitsabstand und liegt bei 390 px vollständig im
  // Viewport (gemessen x=266..374). §3: reine Darstellung — die Sprungfunktion
  // selbst und das `pb-20` der Boden-Polsterung bleiben unberührt.
  const vorschauImBild = useZielSichtbar('wizard-vorschau');
  const zurVorschau = () => {
    setVorschauOffen(true);
    const rm = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    document.getElementById('wizard-vorschau')?.scrollIntoView({ behavior: rm ? 'auto' : 'smooth', block: 'start' });
  };

  return (
    // pb-20 mobil (Auftrag David 25.6.2026): der schwebende «Vorschau ↓»-FAB
    // (fixed bottom-4 right-4) deckte sonst die letzten Felder / den Weiter-
    // Knopf zu — die Boden-Polsterung lässt sie frei darüber scrollen.
    <div className={`space-y-6 pb-20 ${pk('md:pb-0', '@3xl/pane:pb-0')}`}>
      {/* Kopf */}
      <div className="space-y-3">
        <Link to={zurueckHref} className="inline-flex items-center gap-2 no-underline text-body-s font-medium text-brass-700 hover:text-brass-600">
          <span aria-hidden className="inline-flex items-center justify-center w-7 h-7 border border-line bg-surface">←</span>
          Zurück zum Katalog
        </Link>
        <p className="lc-overline">{overline}</p>
        {/* overflow-wrap/hyphens: lange Komposita (z.B. «Geheimhaltungsvereinbarung»)
            sprengten den Titel bei 360px → 12px horizontaler Seiten-Overflow
            (Befund David 25.6.2026, nda). Brechen statt überlaufen. */}
        {/* A-1: EIN Titel-Baustein (`ui/SeitenTitel`); die Umbruch-Regeln bleiben
            hier, weil sie diesem Titel gehören (lange Komposita), nicht der
            Titel-Anatomie. */}
        {/* V2 (R5-F2, 6.9.2026): `stimme="serif"` — der Vorlagen-Titel ist
            Lesetext, nicht Bedienelement (§5: Literata für alles Gelesene).
            Der Baustein trägt die Stimme bereits; sie war hier nur nie gewählt.
            Der Lead folgt ihm (Fliesstext); Chips, Knöpfe, Stepper bleiben
            Archivo — die UI-Hülle wechselt die Schrift NICHT. */}
        <SeitenTitel stimme="serif" className="[overflow-wrap:anywhere] hyphens-auto">{titel}</SeitenTitel>
        <p className="font-serif text-body-l text-ink-600 max-w-reading">{intro}</p>
        {/* lc-chip-zeile (LM-044/N1): Norm-Chips sind <a> (unterstrichen); der
            Status-Badge daneben liegt auf der lc-badge-Achse (Pille, kein Tick)
            und bleibt von der Chip-Grammatik unberührt. */}
        <div className="lc-chip-zeile flex flex-wrap items-center gap-1.5">
          {norms.map((n) => (
            <NormChip key={n.label} artikel={n.label} hrefOverride={fedlexLokalisiert(n.url, locale)} />
          ))}
          {/* `data-formgate`: Tor-Griff (qsui-hierarchie I10). Das Badge trägt die
              Formvorschrift der Vorlage («Eigenhändig abzuschreiben», «Papierform ·
              eigenhändig unterzeichnen») und ist damit die §8-Ansage, die NICHT
              hinter der Eingabestrecke stehen darf. Es steht im Kopf, also im
              ersten Viewport — das Tor nagelt genau das fest. */}
          <span data-formgate className="lc-badge lc-badge-warn">{badge}</span>
        </div>
        {/* V6 (W2·10-UI-NAV): Weg zum passenden Rechner — «Frist zuerst
            rechnen». Rendert nur, wenn die Registry für DIESE Vorlage eine
            Rechner-Kante führt; sonst gibt die Komponente null zurück und der
            Kopf bleibt byte-gleich. */}
        <PassendeRechner />
        {(zuruecksetzen || fussnote) && (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 pt-1">
            {zuruecksetzen && (
              <button type="button"
                onClick={() => { if (window.confirm('Alle Eingaben dieser Vorlage zurücksetzen?')) { zuruecksetzen(); setBeruehrt(false); } }}
                className="lc-btn-outline lc-btn-sm">
                ↺ Eingaben zurücksetzen
              </button>
            )}
            {/* B2/D-1.5 (QS-UI 8b Teil 2): Der Speicher-Hinweis lief mit 976 px über
                die volle Spaltenbreite — gemessen auf 24 Vorlagen-Flächen. Prosa hält
                die Lesespalte; Kacheln und Tabellen bleiben unbegrenzt.
                LM-125 (W2·17-UI-BEFUNDE-B9, 4.9.2026): `max-w-reading` (40rem) ist das
                Mass der 16-px-Prosa, nicht das der Feinschrift. Auf der 12-px-Stufe
                mass dieser Hinweis @1440 110 ch/Zeile (2 Zeilen à 640 px) — über der
                WCAG-Decke SC 1.4.8 (80 ch). `max-w-kleintext` ist die
                Feinschrift-Spalte des Hauses (Herleitung am Token in
                `tailwind.config.js`); dieselbe Messung und dasselbe Mittel wie T2
                (`kontext/KontextGruppe`, Hinweis-Slot) und T3 (`ArtikelLeser`,
                Fussnotenapparat), beide 29.8.2026. */}
            <p className="text-xs text-ink-500 max-w-kleintext">
              {fussnote ?? 'Ihre Eingaben verlassen den Browser nicht, werden aber lokal auf diesem Gerät zwischengespeichert und bleiben nach dem Schliessen erhalten — auf geteilten oder fremden Rechnern bitte «Eingaben zurücksetzen».'}
            </p>
          </div>
        )}
      </div>

      {/* Kopf-Schalter (Detailgrad/Untertyp) – optional, vor dem Stepper */}
      {kopfSchalter}

      {/* Stepper */}
      <Stepper schritte={schritte} aktiv={schritt} onWechsel={setSchritt} />

      {/* Zweispaltig: Formular links, klebende Vorschau rechts;
          mobil einspaltig mit einklappbarer Vorschau.
          ── W2·24-DESIGN-IDENTITAET R5-F2 (6.9.2026) · V1/D6 ─────────────
          Vorgänger-Kommentar (R6-D1, 5.9.2026) behauptete für `md:justify-center`
          «0 px Leerfläche». Nachgemessen (Skript `.scratch/f2-leer.mjs`, Band-Scan
          über die linke Grid-Hälfte, @1440×900, dist von HEAD 0834cbd7b): die
          Zentrierung hat die eine Lücke UNTER der Karte in zwei halb so grosse
          Lücken über UND unter ihr übersetzt — `/vorlagen/mietvertrag` 1180 px,
          `/vorlagen/arbeitsvertrag` 1175 px, `/vorlagen/nda` 802 px. Der Grund
          liegt eine Ebene höher: die Vorschau-Spalte trägt das GANZE Dokument
          (2–3 Bildschirmhöhen), das Grid streckt die Formular-Zelle auf diese
          Höhe, und `md:sticky` blieb wirkungslos, weil ein Sticky-Element, das
          höher ist als der Viewport, nie klebt.
          Der Fix setzt an der Ursache an, nicht an der Ausrichtung:
          (a) `items-start` — die Karte schlägt oben an (Lücke über der Karte 0);
          (b) die klebende Vorschau bekommt eine Viewport-Decke mit eigenem
              Scroller (`max-h`/`overflow-y-auto`) — damit klebt sie wirklich UND
              die Grid-Zeile ist auf eine Bildschirmhöhe gedeckelt statt auf die
              Dokumentlänge. Rest-Weissraum neben der Karte = Spaltendifferenz
              innerhalb EINES Bildschirms, gemessen in `abnahme/design-identitaet/
              R5-F2.md`. */}
      <div data-wizard-grid className={`grid grid-cols-1 items-start ${pk('md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]', '@3xl/pane:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]')} gap-6 ${pk('md:gap-8', '@3xl/pane:gap-8')}`}>
        <div className="flex min-w-0 flex-col">
        {/* V3 (R5-F2): kein 4-seitiger Kasten mehr — Zielbild «Linien statt
            Flächen» (§5). Die Formularstrecke trägt eine harte Kopflinie (2 px
            `--rule`) und eine weiche Schlusslinie (1 px `--rule-soft`); Füllung,
            Radius und Seitenkanten fallen weg. `data-formular-karte` ist der
            Messgriff des Leerflächen-Skripts. */}
        <div data-formular-karte className="border-t-2 border-b border-t-rule border-b-rule-soft pt-5 pb-6 space-y-5"
          onInput={merkeEingabe} onChange={merkeEingabe}>
          {/* key={schritt}: re-mountet den Schrittinhalt → dezenter Einblende-
              Fade beim Schrittwechsel (Redesign E8); Fehlerbox/Buttons bleiben ruhig. */}
          <div key={schritt} className="lc-route space-y-5">
            <h2 className="text-h3 font-serif font-semibold text-ink-900">{schritte[schritt].label}</h2>
            {inhalt}
          </div>

          {/* FAHRPLAN-DESIGN 2.2: vierte Fehlerbox-Variante entfernt —
              EIN Baustein (FehlerBox, role="alert") wie in den Rechner-Forms.
              Grundsatz David: erst nach erster Eingabe zeigen (beruehrt). */}
          {beruehrt && fehler != null && <FehlerBox fehler={fehler} />}

          <div className="flex items-end justify-between gap-3 pt-2 border-t border-line">
            {/* LM-094 (W2·17-UI-BEFUNDE B17, 4.9.2026): «← Zurück» war
                `lc-btn-ghost` — reiner Text ohne Fläche und ohne Rahmen neben
                dem gefüllten «Weiter →». Die beiden Navigationsknöpfe EINES
                Assistenten lasen sich dadurch nicht als Paar. Outline neben
                Primär: gleiche Anatomie und Höhe, verschiedene Gewichtung —
                die Rangfolge bleibt, die Zusammengehörigkeit wird sichtbar.
                Der Deaktiviert-Zustand kommt aus dem Token (`index.css`,
                `.lc-btn*:disabled`), nicht aus einer Utility hier. */}
            <button type="button" onClick={() => setSchritt((s) => Math.max(0, s - 1))}
              disabled={schritt === 0} className="lc-btn-outline">← Zurück</button>
            {schritt < schritte.length - 1 && (
              <div className="flex flex-col items-end gap-1">
                {/* Erklärt den ausgegrauten Weiter-Button (sonst wirkt er wie
                    ein Defekt) — immer sichtbar, nicht fehler-rot. */}
                {weiterAus && (
                  <p id="weiter-hinweis" className="text-xs text-ink-500">Bitte Pflichtfelder ausfüllen</p>
                )}
                <button type="button" onClick={() => setSchritt((s) => s + 1)}
                  disabled={weiterAus} aria-describedby={weiterAus ? 'weiter-hinweis' : undefined}
                  className="lc-btn-primary">
                  Weiter →
                </button>
              </div>
            )}
          </div>
        </div>
        </div>

        {/* Vorschau – mobil einklappbar, Desktop klebend; identischer Inhalt
            zweimal platziert (kein Remount, wie bisheriger Funktionsaufruf) */}
        <details id="wizard-vorschau" className={`${pk('md:hidden', '@3xl/pane:hidden')} bg-surface border border-line scroll-mt-24`}
          open={vorschauOffen} onToggle={(e) => setVorschauOffen((e.currentTarget as HTMLDetailsElement).open)}>
          {/* `data-dokument-platz`: Auf schmalen Schirmen ist das Dokument
              zugeklappt — die STELLE des Dokuments ist dann dieser beschriftete
              Griff. Das Tor (qsui-hierarchie I8) prüft, dass an der Stelle des
              Verdikts immer etwas steht: das Dokument, ein Platzhalter oder ein
              benannter Griff — nie nichts. */}
          {/* LM-060 (B15, 4.9.2026): hier standen ZWEI Klappmarken. Diese
              Summary zeichnete ihr eigenes ▾ und schaltete den nativen Marker
              ab — die App-weite `details > summary::after`-Regel (index.css)
              hängte ihr «▸» aber weiterhin als drittes Flex-Kind ganz rechts
              an. GEMESSEN @640 (bei 1440 ist die Klappe `md:hidden`):
              `::after` = "  ▸" UND ein Textknoten «▾» in derselben Summary.
              Der Rückbau IST der Fix (§17): eigenes Zeichen und die beiden
              Marker-Abschaltungen fallen weg, das EINE Zeichen kommt aus der
              geteilten Regel — dort rechtsbündig und drehend. */}
          <summary data-dokument-platz className="cursor-pointer select-none px-4 py-3 text-body-s font-medium text-ink-700">
            <span>Vorschau & Bausteinprotokoll</span>
          </summary>
          <div className="px-4 pb-4">{vorschau}</div>
        </details>
        {/* R5-F2 (V1-Ursache, 6.9.2026): Die Vorschau-Spalte war so hoch wie das
            ganze Dokument — `sticky` blieb wirkungslos (ein Sticky-Kasten, der
            höher als der Viewport ist, klebt nie) und die Grid-Zeile wuchs auf
            Dokumentlänge, was die Formular-Spalte leer mitzog. Deckel auf eine
            Bildschirmhöhe + eigener Scroller: die Vorschau klebt jetzt wirklich,
            das Dokument bleibt vollständig lesbar (Scroll im Panel), und die
            Zeilenhöhe ist gedeckelt. `tabIndex`/`aria-label`: ein scrollbarer
            Bereich muss per Tastatur erreichbar und benannt sein
            (axe `scrollable-region-focusable`). */}
        {/* Die Vorschau-Zelle trägt ihren Inhalt ABSOLUT: ein absolut
            positioniertes Kind zählt bei der Zeilenhöhe nicht mit, also bemisst
            sich die Grid-Zeile allein an der Formular-Spalte (plus einem
            Mindestmass, damit das Dokument bei sehr kurzen Schritten nicht zum
            Guckloch wird). Genau das ist der Kern von V1: vorher bestimmte das
            2–3 Bildschirme hohe Dokument die Zeilenhöhe und zog die kurze
            Formular-Spalte als Weissfläche mit. Der innere Kasten füllt die
            Zelle (`inset-0`), klebt im Bild (`sticky`) und deckelt sich auf
            Bildschirmhöhe ODER Zellenhöhe — je nachdem, was kleiner ist, damit
            er nie über die Zeile hinausläuft.
            `print:`-Kette: im Ausdruck fällt die ganze Mechanik weg, sonst
            druckte sich nur der sichtbare Ausschnitt (Funktionsverlust).
            KEIN `lc-scrollrand-y`: die Haus-Affordanz malt einen Farbverlauf auf
            den HINTERGRUND des Scrollers — das Dokument-Blatt (`bg-paper-raised`,
            volle Breite) liegt darüber und deckt ihn vollständig zu. Die Marke
            wäre hier eine Klasse ohne Wirkung; die Affordanz trägt der
            angeschnittene Text plus die native Bildlaufleiste. */}
        <div className={pk(
          'hidden md:block md:relative md:self-stretch md:min-h-[26rem]',
          'hidden @3xl/pane:block @3xl/pane:relative @3xl/pane:self-stretch @3xl/pane:min-h-[26rem]')}>
          <div className={pk('md:absolute md:inset-0 print:static', '@3xl/pane:absolute @3xl/pane:inset-0 print:static')}>
            <div tabIndex={0} aria-label="Dokument-Vorschau"
              className={pk(
                'md:sticky md:top-28 md:max-h-[min(calc(100dvh-8rem),100%)] md:overflow-y-auto md:overscroll-contain print:static print:max-h-none print:overflow-visible',
                '@3xl/pane:sticky @3xl/pane:top-28 @3xl/pane:max-h-[min(calc(100dvh-8rem),100%)] @3xl/pane:overflow-y-auto @3xl/pane:overscroll-contain print:static print:max-h-none print:overflow-visible')}>
              {vorschau}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile: Sprung zur Live-Vorschau — der Kernnutzen («was du siehst,
          kommt raus») soll auch beim Tippen erreichbar sein, nicht erst im
          letzten Schritt. */}
      {/* Schwebender Sprung-Knopf zur Live-Vorschau (mobil). Solide, pillen-
          förmig und mit kräftigem Schatten — bewusst KEIN Messing-Rahmen auf
          bg-surface mehr: die frühere lc-btn-outline-Optik glich exakt einer
          (selektierten) Vertragstyp-Kachel und las sich beim initialen Scroll,
          wo der Knopf über dem Vertragstyp-Raster schwebt, wie eine defekte
          Untertyp-Kachel (Responsive-Audit D1). Als gefülltes Pill ist er
          eindeutig ein schwebender Aktions-Knopf, keine Karte. */}
      {/* `data-verdikt-sprung`: derselbe Tor-Griff wie an der Rechner-Sprungmarke
          (`ErgebnisSprung`) — eine Abkürzung zum Verdikt, zwei Bauformen, EIN Griff.
          `print:hidden` aus derselben Fehlerklasse wie B1 in Teil 1: das Element ist
          viewport-`fixed` und läge im Ausdruck sonst auf jeder Seite über dem Inhalt.
          Der globale Druckblock greift hier zwar (es IST ein <button>), aber die
          Utility am Element überlebt jede künftige Umformulierung des Blocks. */}
      {!vorschauImBild && (
        <button type="button" onClick={zurVorschau} data-verdikt-sprung
          className={`${pk('md:hidden', '@3xl/pane:hidden')} print:hidden fixed bottom-4 right-4 z-dropdown lc-btn-primary lc-btn-sm px-4 shadow-lg`}>
          Vorschau ↓
        </button>
      )}
    </div>
  );
}

// ── Werkgetreuer Absatz-Renderer der Vorschau ───────────────────────────────
// Interpretiert EXAKT dieselben Strukturen wie PDF und DOCX (MUSTER aus der
// Formatvorlagen-SSoT): hängende Einzüge für «1.»-Klauseln, doppelt
// eingezogene «–»-Unterpunkte, gezeichnete Unterschriftslinien, Betreff mit
// Haarlinie, Rubrum mit zentrierten Parteirollen und fettem «gegen».
// Reine Darstellung – keine Rechtslogik (§3).

function VorschauZeile({ zeile, dicht, striche }: { zeile: string; dicht?: boolean; striche?: boolean }) {
  // Strichzeilen-Lizenz wie PDF/DOCX (Ultra-Review MITTEL 7.6.2026):
  // nur rolle 'unterschrift' oder Schema-eigene Striche — nie Nutzertext.
  if (striche && MUSTER.STRICHE.test(zeile)) {
    // role="img": aria-label ist auf einem rollenlosen span unzulässig
    // (axe aria-prohibited-attr, 10.6.2026); als benanntes Grafik-Element
    // bleibt die Linie für Screenreader «Unterschriftslinie».
    return <span role="img" style={VORSCHAU.sigLinie} aria-label="Unterschriftslinie" />;
  }
  const num = zeile.match(MUSTER.NUMMER);
  if (num) {
    // Nummerierte Klausel/Begehren: scanbarer hängender Einzug (SSoT vorschauStil).
    return (
      <span style={VORSCHAU.pos}>
        <span style={VORSCHAU.posNr}>{num[1]}.</span>
        <span>{zeile.slice(num[0].length)}</span>
      </span>
    );
  }
  if (MUSTER.SUB.test(zeile)) {
    return (
      <span style={VORSCHAU.sub}>
        <span style={VORSCHAU.subDash}>–</span>
        <span>{zeile.slice(2)}</span>
      </span>
    );
  }
  return <span className={`block min-h-[1em] ${dicht ? 'leading-snug' : ''}`}>{zeile || '\u00a0'}</span>;
}

function VorschauAbsatz({ abs, stil }: { abs: AssembleErgebnis['dokument']['absaetze'][number]; stil: AusgabeStil }) {
  const zeilen = abs.text.split('\n');
  const striche = !!abs.stricheErlaubt; // Engine-Boolean (/simplify 7.6.2026)

  // Alle Masse/Stile aus der SSoT (vorschauStil.ts) – keine hartkodierten
  // Tailwind-Abstände mehr; Variante A «Dokument-Handwerk».
  switch (abs.rolle) {
    case 'absender':
    case 'adressat':
      return (
        <div style={abs.rolle === 'adressat' ? VORSCHAU.adressat : VORSCHAU.absender}>
          {zeilen.map((z, i) => <VorschauZeile key={i} zeile={z} dicht striche={striche} />)}
        </div>
      );
    case 'datumzeile':
      return <p style={VORSCHAU.datum}>{abs.text}</p>;
    case 'betreff':
      return (
        <div>
          <p style={{ ...VORSCHAU.betreff, lineHeight: 1.3, whiteSpace: 'pre-line' }}>{abs.text}</p>
          <span style={VORSCHAU.betreffLinie} aria-hidden />
        </div>
      );
    case 'rubrum':
      return (
        <div style={VORSCHAU.rubrum}>
          {zeilen.map((z, i) => {
            const t = z.trim();
            if (MUSTER.RUBRUM_ROLLE.test(t)) return stil === 'modern'
              ? <p key={i} style={VORSCHAU.rubrumRolle}>{rolleLabel(t)}</p>
              : <p key={i} style={VORSCHAU.rubrumRolleKlassisch}>{t}</p>;
            if (t === 'gegen') return <p key={i} style={stil === 'modern' ? VORSCHAU.rubrumGegen : VORSCHAU.rubrumGegenKlassisch}>gegen</p>;
            if (z === 'in Sachen') return <p key={i} style={VORSCHAU.insachen}>{z}</p>;
            if (z.startsWith('betreffend ')) return <p key={i} style={VORSCHAU.betreffend}>{z}</p>;
            return <p key={i} style={VORSCHAU.rubrumZeile}><VorschauZeile zeile={z} dicht={t !== ''} striche={striche} /></p>;
          })}
        </div>
      );
    case 'parteien':
      return (
        <div style={VORSCHAU.parteien}>
          {zeilen.map((z, i) => <VorschauZeile key={i} zeile={z} striche={striche} />)}
        </div>
      );
    case 'anrede':
      return <div style={VORSCHAU.anrede}>{zeilen.map((z, i) => <VorschauZeile key={i} zeile={z} striche={striche} />)}</div>;
    case 'schlussformel':
      return <p style={VORSCHAU.schlussformel}>{abs.text}</p>;
    case 'unterschrift':
      return (
        <div style={VORSCHAU.unterschrift}>
          {zeilen.map((z, i) => <VorschauZeile key={i} zeile={z} striche={striche} />)}
        </div>
      );
    default:
      return (
        <div style={VORSCHAU.block}>
          {abs.ueberschrift && <p style={VORSCHAU.blockTitel}>{abs.ueberschrift}</p>}
          {zeilen.map((z, i) => <VorschauZeile key={i} zeile={z} striche={striche} />)}
        </div>
      );
  }
}

// ── Geteilte Export-Aktion (PDF/DOCX lazy, Fehler sichtbar statt stiller
//    Unhandled Rejection) — genutzt von ExportLeiste und DirektExportZeile ───

function useExportAktion() {
  const [fehler, setFehler] = useState<string | null>(null);
  const [laeuft, setLaeuft] = useState(false);
  // Während des Nachladens/Erzeugens (lazy jsPDF/docx + Dokumentbau) hält
  // `laeuft` die Knöpfe disabled und verhindert Mehrfachklicks/-downloads
  // (§13/F4) — analog PdfExportButton.
  const exportieren = async (aktion: () => Promise<void>, standardMeldung: string) => {
    if (laeuft) return;
    setFehler(null);
    setLaeuft(true);
    try {
      await aktion();
    } catch (e) {
      setFehler(e instanceof Error ? e.message : standardMeldung);
    } finally {
      setLaeuft(false);
    }
  };
  return { fehler, laeuft, exportieren };
}

// Der Ausgabe-Stil wird beim Klick aus dem geteilten Store gelesen (getAusgabeStil),
// damit Vorschau und beide Export-Knöpfe ohne Props-Plumbing denselben Stil nutzen.
const pdfExport = (ergebnis: AssembleErgebnis, ziel: ExportZiel) => async () =>
  (await import('../../lib/vorlagen/vorlagenPdf')).vorlagenPdfErzeugen(ergebnis, { banner: ziel.banner, dateiName: ziel.dateiName, stil: getAusgabeStil() });
const docxExport = (ergebnis: AssembleErgebnis, ziel: ExportZiel) => async () =>
  (await import('../../lib/vorlagen/vorlagenDocx')).vorlagenDocxErzeugen(ergebnis, { banner: ziel.banner, dateiName: ziel.dateiName, stil: getAusgabeStil() });

// ── Direkt-Export unter der Vorschau (Daueranweisung David 12.6.2026) ───────
//
// Jede Vorlage ist JEDERZEIT herunterladbar — auch unausgefüllt; leere
// Felder bleiben Ausfüll-Striche («________», Engine-Konvention). Nur
// FACHLICHE Blocker (das Dokument trüge eine falsche Rechtsaussage)
// sperren auch hier; fehlende Angaben sperren nie.

function DirektExportZeile({ ergebnis, pdf, docx, blocker }: {
  ergebnis: AssembleErgebnis; pdf: ExportZiel; docx?: ExportZiel; blocker?: string[];
}) {
  const { fehler, laeuft, exportieren } = useExportAktion();
  const gesperrt = (blocker?.length ?? 0) > 0;
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className="text-xs text-ink-500">
          Direkt herunterladen – auch unausgefüllt (leere Felder bleiben Ausfüll-Striche):
        </span>
        <button type="button" disabled={gesperrt || laeuft} aria-busy={laeuft}
          title={gesperrt ? blocker![0] : undefined}
          onClick={() => exportieren(pdfExport(ergebnis, pdf), 'Der PDF-Export ist fehlgeschlagen. Bitte erneut versuchen.')}
          className="lc-btn-outline lc-btn-sm">
          PDF
        </button>
        {docx && (
          <button type="button" disabled={gesperrt || laeuft} aria-busy={laeuft}
            title={gesperrt ? blocker![0] : undefined}
            onClick={() => exportieren(docxExport(ergebnis, docx), 'Der Word-Export ist fehlgeschlagen. Bitte erneut versuchen.')}
            className="lc-btn-outline lc-btn-sm">
            Word (DOCX)
          </button>
        )}
      </div>
      {fehler && <FehlerBox fehler={[fehler]} />}
    </div>
  );
}

// ── Ausgabe-Stil-Umschalter (nüchtern ⇄ modern) ─────────────────────────────
// Wirkt zugleich auf Vorschau UND Export (geteilter Store, ausgabeStil.ts).
function StilUmschalter({ stil }: { stil: AusgabeStil }) {
  return (
    // R5-F2 (6.9.2026): Segment-Kasten (Rahmen + Radius + Füllung für den
    // aktiven Reiter) → zwei Textknöpfe, die Wahl trägt der Unterstrich (§5:
    // Linien statt Flächen, Links/Wahlen unterstrichen). Zustand, Reihenfolge,
    // `aria-pressed`, Titel-Erklärungen und der Aufruf von `setAusgabeStil`
    // bleiben Wort für Wort — nur die Anatomie wechselt (§3).
    <div className="inline-flex shrink-0 items-center gap-3 text-xs" role="group" aria-label="Ausgabe-Stil">
      {(['nuechtern', 'modern'] as const).map((s) => (
        <button key={s} type="button"
          aria-pressed={stil === s}
          title={s === 'nuechtern' ? 'Klassisch-gerichtstauglich (traditionelles Rubrum mit Gedankenstrichen)' : 'Variante A «Dokument-Handwerk» (ruhige Versal-Labels)'}
          onClick={() => setAusgabeStil(s)}
          className={stil === s
            ? 'py-1 font-medium text-ink-900 underline decoration-2 underline-offset-4'
            : 'py-1 text-ink-600 underline decoration-transparent underline-offset-4 hover:text-ink-900 hover:decoration-line-strong'}>
          {s === 'nuechtern' ? 'Nüchtern' : 'Modern'}
        </button>
      ))}
    </div>
  );
}

// ── Vorschau-Spalte: Live-«Papier» + Bausteinprotokoll ──────────────────────

export function VorschauPanel({ ergebnis, kompakt, extra, nichtAufgenommen, direktExport, stil: stilOverride }: {
  ergebnis: AssembleErgebnis;
  /** Etwas kleinere Papier-Schrift (Schlichtungsgesuch). */
  kompakt?: boolean;
  /** Erzwingt einen Ausgabe-Stil (Tests/Snapshots); sonst aus dem geteilten Store. */
  stil?: AusgabeStil;
  /** Vorlagenspezifische Panels zwischen Papier und Protokoll (z. B. Pflichtteile). */
  extra?: ReactNode;
  /** Wenn übergeben: Protokoll-Zusammenfassung «aufgenommen · nicht aufgenommen» + Liste. */
  nichtAufgenommen?: { label: string; grund: string }[];
  /** Blanko-/Direkt-Download (Daueranweisung David 12.6.2026) — nur
      FACHLICHE Blocker übergeben, nie blosse Vollständigkeits-Mängel. */
  direktExport?: { pdf: ExportZiel; docx?: ExportZiel; blocker?: string[] };
}) {
  const stilStore = useAusgabeStil();
  const stil = stilOverride ?? stilStore;
  return (
    <div className="space-y-4">
      {/* Live-Vorschau als «Papier» – interpretiert dieselben Formatvorlagen
          (format + Absatz-Rollen) wie PDF und DOCX; der Stil-Umschalter wirkt
          identisch auf Vorschau und Export. */}
      {/* `data-dokument`: Tor-Griff (qsui-hierarchie I8/I9) — DAS ist auf einer
          Vorlagen-Fläche das Verdikt: das fertige Dokument, nicht die Eingabe. */}
      {/* `rounded-lg shadow-md` entfernt (R5-F2): `--radius-*` steht seit R1 auf
          0 und `--shadow-md` auf `none` — die beiden Utilities waren wirkungslos
          und lasen sich beim Nachschlagen wie eine Absicht. Das Blatt bleibt ein
          Blatt (Fläche + Kante), das ist im Zielbild das Dokument selbst. */}
      <section data-dokument aria-label="Vorschau" className="bg-paper-raised border border-line p-5 sm:p-9">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
          <p className="lc-overline">
            Vorschau · aktualisiert sich live
            {AUSGABE_LABEL[ergebnis.dokument.ausgabeArt] && (
              <span className="ml-2 lc-chip normal-case tracking-normal">{AUSGABE_LABEL[ergebnis.dokument.ausgabeArt]}</span>
            )}
          </p>
          <StilUmschalter stil={stil} />
        </div>
        <div className="font-sans text-ink-900" style={{ ...VORSCHAU.papier, ...(kompakt ? { fontSize: 'var(--vorschau-fs-kompakt)', lineHeight: 1.55 } : { fontSize: 'var(--vorschau-fs)', lineHeight: 1.6 }) }}>
          {/* Eingaben tragen ihren Titel im fetten Betreff – kein Dokumenttitel;
              Verfügung/Vertrag: zentrierter Titel MIT Haarlinie (wie PDF/DOCX) */}
          {ergebnis.dokument.format !== 'eingabe' && (
            <div>
              <p style={VORSCHAU.titel}>{ergebnis.dokument.titel}</p>
              <span style={VORSCHAU.titelLinie} aria-hidden />
            </div>
          )}
          {ergebnis.dokument.absaetze.map((abs) => (
            <VorschauAbsatz key={abs.bausteinId + abs.text.slice(0, 12)} abs={abs} stil={stil} />
          ))}
        </div>
        <p className="text-micro text-ink-500 mt-6 pt-3 border-t border-line">{ergebnis.dokument.disclaimer}</p>
      </section>

      {direktExport && <DirektExportZeile ergebnis={ergebnis} {...direktExport} />}

      {extra}

      {/* Bausteinprotokoll */}
      <details className="lc-card p-4">
        <summary className="cursor-pointer text-body-s font-medium text-ink-700">
          Bausteinprotokoll ({nichtAufgenommen
            ? `${ergebnis.protokoll.length} aufgenommen · ${nichtAufgenommen.length} nicht aufgenommen`
            : `${ergebnis.protokoll.length} Bausteine`})
        </summary>
        <ul className="mt-3 space-y-2.5">
          {ergebnis.protokoll.map((p) => (
            <li key={p.bausteinId} className="text-body-s text-ink-600 space-y-1">
              <p><span className="num text-ink-500">{p.bausteinId}</span> – <NormText text={p.begruendung} /></p>
              {p.hinweis && <p className="text-xs text-warn-700">⚠ <NormText text={p.hinweis} /></p>}
              {p.norm && <p><NormLink artikel={p.norm} /></p>}
            </li>
          ))}
        </ul>
        {nichtAufgenommen && (
          <>
            <p className="lc-overline mt-4 mb-2">Nicht aufgenommen</p>
            <ul className="space-y-1">
              {nichtAufgenommen.map((n) => (
                <li key={n.label} className="text-xs text-ink-500">– {n.label}: {n.grund}</li>
              ))}
            </ul>
          </>
        )}
      </details>
    </div>
  );
}

// ── Export-Leiste: PDF (lazy) · optional DOCX (lazy) · Text kopieren ────────

export type ExportZiel = { label: string; banner: PdfBanner; dateiName: string };

export function ExportLeiste({ ergebnis, deaktiviert, kopiert, onKopieren, pdf, docx }: {
  ergebnis: AssembleErgebnis;
  deaktiviert: boolean;
  kopiert: boolean;
  onKopieren: (text: string) => void;
  pdf: ExportZiel;
  /** Nur übergeben, wo die Formvorschrift DOCX zulässt (Form-Gate hat Vorrang). */
  docx?: ExportZiel;
}) {
  // Async-Export mit try/catch (useExportAktion): scheitert das Nachladen der
  // Renderer oder die Dokument-Erzeugung – etwa der bewusste Sperr-Wurf des
  // Word-Exports bei eigenhändigkeitspflichtigen Geschäften (vorlagenDocx.ts)
  // –, erscheint die Meldung sichtbar statt als stille Unhandled Rejection.
  const { fehler, laeuft, exportieren } = useExportAktion();
  // Der Kopier-Text hing zuvor am Klick; als Prop liefe die Serialisierung des
  // ganzen Dokuments sonst bei jedem Render mit (§15) — darum memoisiert.
  const kopierText = useMemo(() => dokumentAlsText(ergebnis), [ergebnis]);
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        <button type="button" disabled={deaktiviert || laeuft} aria-busy={laeuft}
          onClick={() => exportieren(pdfExport(ergebnis, pdf), 'Der PDF-Export ist fehlgeschlagen. Bitte erneut versuchen.')}
          className="lc-btn-primary">
          {pdf.label}
        </button>
        {docx && (
          <button type="button" disabled={deaktiviert || laeuft} aria-busy={laeuft}
            onClick={() => exportieren(docxExport(ergebnis, docx), 'Der Word-Export ist fehlgeschlagen. Bitte erneut versuchen.')}
            className="lc-btn-outline">
            {docx.label}
          </button>
        )}
        {/* R2-E/F1-10: der geteilte KopierButton. Zustand und Auslöser bleiben
            beim Aufrufer (`useVorlage` hält `kopiert` für die ganze Seite) —
            darum der gesteuerte Modus. Die Grösse bleibt bewusst `lc-btn-outline`
            ohne `lc-btn-sm`: dieser Knopf steht in EINER Reihe mit dem
            PDF-/DOCX-Export und muss deren Höhe halten. */}
        <KopierButton text={kopierText} gegenstand="Text"
          className="lc-btn-outline" disabled={deaktiviert}
          kopiert={kopiert} onKopieren={onKopieren} />
      </div>
      {fehler && <FehlerBox fehler={[fehler]} />}
    </div>
  );
}
