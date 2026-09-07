import { useState, memo } from 'react';
import { ArtikelBody, FnRef } from '../../../components/normtext/ArtikelBody';
import { WJ } from '../../../components/normtext/wortverbinder';
import { type InternRefs } from '../../../components/NormText';
import { labelMitBereich, artikelGanzAufgehoben } from '../../../lib/normtext/darstellung';
import type { Fussnote } from '../../../lib/normtext/browse';
import { NEUER_TAB } from '../../../lib/benennung';
import { useKopieren } from '../../../components/useKopieren';
import { NormChip } from '../../../components/vorlagen/NormChip';
import type { LeitfallRef } from '../../../lib/rechtsprechung/norm-index';
import type { MaterialBezug } from '../../../lib/normtext/werkzeuge';
import type { ArtikelRevision } from '../../../lib/verzahnung/artikel-revisionen';
import type { BrowseErlass } from '../../../lib/normtext/browse-typen';
import type { NormSnapshot } from '../../../lib/normtext/typen';
import { verifizierLinkArtikel } from '../../../lib/normtext/verifikationslink';
import type { ArtikelHistorie } from '../../../lib/normtext/historie-laden';
import { ArtikelHistorieZeile } from './ArtikelHistorie';
import { margStufeStil, fnTextMitLinks, baueZitat, margLabel } from '../helpers';
import { SUCH_META } from '../suchHighlight';
import { zitatMitAusweis, heuteIso } from '../../../lib/format';
import { schaetzeArtikelHoehe } from '../berechnungen';
import { LeitfallZeile } from './ArtikelLeser.leitfaelle';
import { fussnotenAnzeige, verteileFussnoten, sammleVerweise } from './ArtikelLeser.fussnoten';
import { BezuegeZeile } from './BezuegeZeile';
import { BezuegeKopf, type BezugsMarke } from './BezuegeKopf';
import { useSatzspiegel } from '../v3/satzspiegel';
import type { ArtikelBezuege } from '../bezuegeLaden';
import { urlMitHash } from '../../../lib/liveUrlSync';
import { usePaneKontext } from '../../../components/layout/PaneKontext';
import { Link } from 'react-router-dom';
import { werkzeugeAmArtikel } from '../randNotizWerkzeuge';
import type { Werkzeug } from '../../../lib/normtext/werkzeuge';

// Ein Artikel im Lesefluss (Richtung A): zweispaltig wie die amtliche Druckfassung —
// links «Art. N» als ruhiger Anker mit den Randtiteln darunter (rechtsbündig, nur die
// gegenüber dem Vorartikel GEÄNDERTEN Stufen, `marg`), rechts der Serif-
// Bestimmungstext. Ersetzt den früheren fliegenden Standort-Tracker. Reine Darstellung.
/** Geteilte leere Liste — spart je Artikel ohne Werkzeug-Kante eine Allokation. */
const LEERE_WERKZEUGE: readonly Werkzeug[] = [];

export const ArtikelLeser = memo(function ArtikelLeser({ e, erlass, basisPfad, fussnoten, intern, marg, margBasis, imTreffer, onSpringe, leitfaelle, bezuege, bezuegeImKopf, materialien, onBezuegeOeffnen, bezuegeLaedt, revision, historie, zaehler, istAnhang = false }: {
  e: NormSnapshot; erlass: BrowseErlass; basisPfad: string; fussnoten?: Fussnote[]; intern?: InternRefs;
  marg?: string[];
  /** G-HIST-UI: Fassungshistorie dieses Artikels aus dem erlass-lokalen Shard
   *  (Reader lädt ihn einmal idle). undefined = kein Eintrag ⇒ kein Badge (§8). */
  historie?: ArtikelHistorie;
  /**
   * W2·24-R6c · die ZAHLEN der Bezüge-Zeile, buildseitig gezählt
   * (`../bezuegeZaehler`, Zähl-Datei je Erlass, ø 289 B). Sie sagen, WIE VIELE
   * Entscheide und Materialien an diesem Artikel hängen — nicht WELCHE. Damit
   * steht die Zeile vollständig da, bevor irgendein Shard geladen ist, und die
   * Rubrik «Materialie» wird überhaupt erst möglich: ihr Shard kommt im Leser
   * sonst gar nicht vor (§8 — bis hierher fehlte die Rubrik lieber ganz, als
   * eine Zusage ohne Deckung zu machen).
   * `undefined` = keine Datei oder noch nicht geladen ⇒ die Zeile fällt auf
   * das zurück, was der Artikel ohnehin führt.
   */
  zaehler?: { entscheide: number; materialien: number };
  /** W2·5d G3b (③/⑤): der Eintrag ist ein Anhang (`annex_*`) bzw. Staatsvertrags-
   *  Protokoll (`lvl_*`) — als eigenständig erkennbarer, klar abgesetzter Block
   *  rendern (Struktur-Trenner statt Artikel-Trenner, «Anhang N»/«Protokoll N» als
   *  Struktur-Überschrift statt Artikelnummer). Reine Darstellung (§3); Prosa
   *  byte-gleich, nur Markup/Klassen. Delimitation über Typo + Struktur-Trenner
   *  (Linien-Kanon «Ruhe durch Reduktion» — keine Farb-/Box-Sprache). */
  istAnhang?: boolean;
  /** Leitfälle dieses Artikels (V1a-Form, flache BGE-Chip-Reihe).
   *
   *  W2·7-BEZUG/B4: DER READER SETZT DIESE PROP NICHT MEHR. Seit der Vorgabe
   *  David 28.7.2026 speist sich der Artikelfuss ausschliesslich aus `bezuege`
   *  (facettierte Auflistung; der Bezugs-Shard ist die Obermenge des schlanken
   *  Leitfall-Shards). Die Prop und `LeitfallZeile` bleiben als unveränderte
   *  Darstellungsform bestehen — sie werden weiterhin direkt konsumiert (u. a.
   *  vom Farbwörterbuch-Test) und sind kein toter Zweig, sondern ein nicht mehr
   *  vom Reader bedienter Eingang. */
  leitfaelle?: LeitfallRef[];
  /** W2·7-BEZUG/B4: facettierte Bezüge dieses Artikels, sobald der Nutzer die
   *  Facetten erweitert hat. Gesetzt ⇒ die `BezuegeZeile` tritt AN DIE STELLE
   *  der `LeitfallZeile` (der Bezugs-Shard ist deren Obermenge, §5 — nie beide
   *  nebeneinander, das wären zwei Wahrheiten am selben Artikel). */
  bezuege?: ArtikelBezuege;
  /**
   * D30 · der Inhalt der AUFGEKLAPPTEN Bezüge-Zeile am Artikelkopf.
   *
   * BEWUSST NICHT `bezuege` (Nullprobe 7.9.2026, `leser-v3-kontext-cls` (b)):
   * `bezuege` speist AUCH den Artikelfuss der schmalen Form und der Suchsicht
   * (`!kopfForm`, unten). Wer im V3-Leser `bezuege` setzt, bringt damit Pos. 12
   * zurück — gemessen @390 an der StPO: das Öffnen des Panels lud den Shard, und
   * die Fuss-Zeile wuchs an JEDEM Artikel in den Lesekörper hinein (Artikel-y
   * 1385→1493, 1798→2013, 2461→2783). Genau das verbietet der CLS-Fall.
   *
   * Zwei Props also, weil es zwei ORTE sind (§5 gilt für die Daten, nicht für
   * den Prop-Namen): dieselbe `ArtikelBezuege`-Form, aber die eine landet nur
   * innerhalb des `<details>`, das der Leser selbst geöffnet hat, und die
   * andere unbedingt im Fluss. Die V3-Hülle setzt ausschliesslich die erste.
   */
  bezuegeImKopf?: ArtikelBezuege;
  /** D30 (David 6.9.2026) · die Materialien DIESES Artikels, sobald der Leser
   *  die Bezüge-Zeile einmal aufgeklappt hat (`../artikelMaterialienLaden`).
   *  Bis dahin `undefined` — die Rubrik zeigt dann ihre gezählte Zahl aus der
   *  Zähl-Datei und noch keine Liste. Gleiche Quelle wie die Zahl (§5). */
  materialien?: MaterialBezug[];
  /** D30 · wird beim Aufklappen der Bezüge-Zeile gerufen und armiert den
   *  bestehenden Ladepfad (`v3/panelModell.ts` → `weckeDaten`). Ohne die Prop
   *  bleibt die Zeile, was sie war (Ist-Hülle, Tests, Druck). */
  onBezuegeOeffnen?: () => void;
  /** D30 · der Apparat ist unterwegs ⇒ Skelett-Zeile «lädt …» statt Leere. */
  bezuegeLaedt?: boolean;
  /** Revision r(a) dieses Artikels (§V1c) — an die LeitfallZeile durchgereicht. */
  revision?: ArtikelRevision | null;
  // Absolute Tiefe der ERSTEN gezeigten Randtitel-Stufe (Delta-Offset). Damit
  // wird die Stufe einheitlich je absoluter Tiefe formatiert, auch wenn nur
  // die geänderten Stufen gezeigt werden. 0 (Default) = volle Kette (Suchsicht).
  margBasis?: number;
  // Treffer-Modus (Auftrag David): Klick auf die Artikelnummer springt in den
  // VOLLTEXT zu diesem Artikel und löscht die Suche, statt nur innerhalb der
  // Trefferliste zu ankern.
  imTreffer?: boolean; onSpringe?: (token: string) => void;
}) {
  // R4-D (5.9.2026): der Zwei-Ziele-Zustand war der Grund, warum diese Fläche
  // den geteilten Hook nicht nutzen konnte — die Zeile trägt ZWEI Kopier-Knöpfe
  // («Zitat», «Link»), und nur der geklickte darf sein Häkchen zeigen. Der Hook
  // kennt dafür jetzt eine MARKE; der lokale Timer entfällt samt seiner
  // Lücken (kein Handle, kein Unmount-Aufräumen).
  const { marke: kopiert, kopieren } = useKopieren();
  // LM-202: der Teilen-Knopf schreibt die Adresse — im SEKUNDÄREN Pane nicht
  // (Herleitung unten bei `kopiere`; massgeblich ist die Rolle, nicht `imPane`).
  // Ohne montierten Provider liefert der Kontext `rolle: 'primaer'` ⇒
  // Einzelansicht/Prerender unverändert.
  const { rolle } = usePaneKontext();
  const istSekundaer = rolle === 'sekundaer';
  const label = labelMitBereich(e.artikelLabel, e.artikel);
  // KURZ-Zitat («Art. 957 OR») — Fundstellen-Signal für den Entscheid-Sprung
  // (LeitfallZeile `normZitat` → ?norm=). MUSS knapp bleiben, sonst matcht der
  // EntscheidLeser die zitierende Erwägung nicht mehr.
  const zitat = `${label} ${erlass.kuerzel}`;
  // VOLL-Zitat (W2·5d G2b) für die Kopier-Aktion: Fundstelle + SR + Stand (§7 a–d).
  const zitatVoll = baueZitat(erlass, label);
  // EID-2 (W2·5d §12): Verifizier-Deep-Link «amtliche Fassung an genau dieser
  // Stelle» — die per-Artikel-ELI-URL des Snapshots (quelleUrl#art_…), validiert
  // im Builder (§5-SSoT; Kanton/aufgehoben/Synthese-Suffix ⇒ null = KEIN Link, §8).
  const amtlich = verifizierLinkArtikel(e, erlass);
  // Vollständig aufgehobener Artikel → dezent + standardmässig eingeklappt
  // (Auftrag David: «nicht so präsent», aufklappbar über den ▾/▸-Toggle).
  // G-AUFH-ART: e.aufgehoben (amtlich verifiziertes Adapter-Signal) hat Vorrang
  // vor der Text-Heuristik, falls gesetzt (s. artikelGanzAufgehoben-Doku).
  const ganzAufgehoben = artikelGanzAufgehoben(e.bloecke, e.aufgehoben);
  // Welche Fussnoten der Apparat zeigt und in welcher Reihenfolge:
  // `./ArtikelLeser.fussnoten` (§6.6-Split, Herleitung dort).
  const fussAnzeige: Fussnote[] = fussnotenAnzeige(e, fussnoten);
  const [artOffen, setArtOffen] = useState(!ganzAufgehoben); // einzelner Artikel ein-/ausklappbar; aufgehoben → zu
  // Marker-Verteilung (Absatz · Item · Randtitel · Artikelebene) samt Inline-
  // Positionen und Klassen: `./ArtikelLeser.fussnoten` (§6.6-Split, Namen
  // unveraendert).
  const {
    fnProAbsatz, fnProItem, fnArtikelEbene, fnProSektion, fnInlineAbsatz, fnInlineItem, fnKlasse,
  } = verteileFussnoten(fussAnzeige, e.bloecke);
  // Marker nur, wenn der Artikel offen ist (Ziel <p id=fn-…> lebt im artOffen-Block):
  // sonst öffnete der sichtbare Marker am eingeklappten Artikel ein leeres Popover
  // (toter Bedienpfad — typisch bei aufgehobenen Artikeln, Default eingeklappt).
  // W2·5d G2b (Fussnoten-Unifizierung): der Marker rendert jetzt IMMER (nur an
  // `artOffen` gebunden, nicht mehr am alten `fussnotenAuf`-React-Schalter) —
  // amtliche Substanz bleibt im DOM (R9/§8, Ctrl+F/Print/Screenreader). Die
  // Prominenz steuert allein der data-fussnoten-CSS-Toggle (index.css): «AUS»
  // DÄMPFT, versteckt nie. So gibt es EINE Fussnoten-Bedienung statt zweier.
  // A31 (David 16.7.2026): der Fussnoten-Marker klebt auf Fedlex DIREKT an der
  // Artikelnummer (kein Abstand). Darum KEIN `ml-0.5` mehr und der Marker sitzt im
  // selben Inline-Kontext wie das «Art. N»-Label (unten in whitespace-nowrap
  // gewickelt), nicht als eigenes flex-Kind mit gap-x-2.
  // W2·5i: `data-fn-klasse` sitzt am PER-NR-Wrapper, nicht (nur) am FnRef — sonst
  // bliebe beim Ausblenden eines A-Markers dessen Trenn-Komma stehen. Der Wrapper
  // trägt Komma UND Marker, verschwindet also als Ganzes.
  const fnMarker = artOffen && fnArtikelEbene.length > 0
    ? <span data-fn-marker>{fnArtikelEbene.map((nr, i) => (
        <span key={nr} data-fn-klasse={fnKlasse[nr]}>{i > 0 && <span className="align-super text-[length:var(--hochgestellt)] text-ink-500">,</span>}<FnRef artikel={e.artikel} nr={nr} /></span>
      ))}</span>
    : null;
  // VERWEISE: im Artikel genannte, aufloesbare (Bund-)Normverweise als Chips am
  // Fuss sammeln — Herleitung und Dedupe in `./ArtikelLeser.fussnoten` (§6.6-Split).
  const verweise: string[] = sammleVerweise(e.bloecke);
  const kopiere = (was: 'zitat' | 'link') => {
    // §5 — der Permalink wird mit DERSELBEN Funktion kodiert, die unten die
    // Adresse schreibt (`urlMitHash`). Vorher stand hier ein handgebauter
    // String, und die beiden gerieten bei 54 Artikel-Token auseinander: Tokens
    // mit Leerzeichen oder Halbgeviert («22 a» in BS-215.400, «36–42» in
    // AR-233.3, «10. 1» in BS-785.700) liefen als Kopie roh («#art-22 a»), als
    // Adresse prozent-kodiert («#art-22%20a») aus dem Haus. Kopie ≠ Adresse ist
    // genau das, was LM-202 abstellt — und ein Leerzeichen im Permalink bricht
    // zusätzlich die Auto-Verlinkung in Mail- und Chat-Programmen.
    // `origin` nur im Browser; `kopiere` läuft ausschliesslich aus einem
    // onClick, der Zweig ohne `window` ist reine Absicherung (kein URL-Wurf).
    const permalink = typeof window !== 'undefined'
      ? urlMitHash(`${window.location.origin}${basisPfad}`, `art-${e.artikel}`)
      : `${basisPfad}#art-${e.artikel}`;
    // B-6 (QS-BASIS): die Zitat-Kopie trägt jetzt den Stand-Ausweis (§7 a–d) —
    // `zitatVoll` (baueZitat) liefert bereits «… (Stand …)» = die Fassung, der
    // Baustein ergänzt Abrufdatum + Permalink (kein doppeltes Standdatum, §5).
    // W2·10-UI-NAV/R3: zusätzlich der amtliche Deep-Link (`amtlich`, EID-2) —
    // derselbe Wert, den der «amtliche Fassung ↗»-Knopf daneben ansteuert (§5,
    // EINE Quelle: `verifizierLinkArtikel`). Er stand bisher nur ALS KLICK im
    // UI; wer das Zitat kopierte, verlor genau den Nachweis, der es überprüfbar
    // macht. `?? undefined`: liefert der Validator null (Kanton, aufgehoben,
    // Synthese-Suffix), bleibt die Zeile ohne amtliche Quelle statt mit einer
    // geratenen (§8).
    const text = was === 'zitat'
      ? zitatMitAusweis(zitatVoll, {
          abruf: heuteIso(new Date()), permalink, amtlich: amtlich ?? undefined,
        })
      : permalink;
    kopieren({ text, marke: was });
    // ── LM-202 (W2·10-UI-NAV-URL, David-Entscheid 3.8.2026) ──────────────────
    // «Die URL ändert sich NUR bei explizitem Klick auf einen Artikel-Anker bzw.
    // bei der Teilen-Aktion.» Der «Link»-Knopf IST die Teilen-Aktion — er legte
    // den Permalink bisher in die Zwischenablage, während die Adressleiste auf
    // dem zuletzt angesprungenen Anker stehen blieb. Wer den Link teilte und
    // danach die Adresse las, sah zwei verschiedene Fundstellen (genau die
    // LM-202-Beobachtung). Darum: der Teilen-Klick setzt den Anker auch in die
    // Adresse — per `replaceState`, damit das Kopieren keinen «Zurück»-Schritt
    // erzeugt (Verlaufs-Ökonomie wie LM-209).
    //
    // NUR beim «Link»-Knopf, nicht beim «Zitat»-Knopf: das Zitat wandert in
    // einen Schriftsatz, es ist kein Ortswechsel.
    //
    // Und nur, wenn dieser Teilbaum die ADRESSIERTE Seite ist. Die Grenze heisst
    // darum `!istSekundaer`, NICHT `!imPane` — die beiden fallen im Split-View
    // auseinander: `Shell.tsx` montiert auch das PRIMÄRE Pane mit
    // `imPane: true` (Container-Query-Modus), nur die Rolle unterscheidet die
    // beiden. Mit `!imPane` schwieg der Teilen-Knopf im Split-View auf BEIDEN
    // Seiten, während `springeZuArtikel` (inhalt.tsx) im primären Pane sehr wohl
    // schrieb — das LM-202-Symptom (Kopie ≠ Adresse) überlebte dort also genau
    // in der Ansicht, für die es gebaut wurde. `springeZuArtikel` zieht die
    // Grenze seit je über `istSekundaer`; hier gilt dieselbe (§5, EINE Grenze).
    // Sekundäres Pane bleibt aussen vor: es ist nicht die adressierte Seite und
    // darf die Haupt-URL nie umschreiben (Konvention auch von `wechsleTab`).
    //
    // `?r=`-Instanz-Diskriminator: die Adresse behält ihn (er ist die Reiter-
    // Identität), der KOPIERTE Link trägt ihn bewusst nicht — er ist rein lokal
    // und hätte beim Empfänger keine Bedeutung. Ohne offene Zweitinstanz sind
    // beide zeichengleich.
    if (was === 'link' && !istSekundaer && typeof window !== 'undefined' && window.history) {
      window.history.replaceState(window.history.state, '', urlMitHash(window.location.href, `art-${e.artikel}`));
    }
  };
  // Aufhebungsnotiz (G16/#3): die amtliche «Aufgehoben durch … (AS …)»-Notiz eines
  // voll aufgehobenen Artikels liegt als artikel-Ebene-Fussnote im Snapshot
  // (absatz/item = null). M2 (David 29.6.2026) / G2b: sie ist eine Fussnote und liegt
  // wie jede Fussnote IMMER im DOM (data-fn-apparat, per data-fussnoten-CSS dämpfbar,
  // R9); die Statuszeile «· aufgehoben» (Artikelzustand) bleibt davon unberührt
  // immer sichtbar. Wortlaut nie erfunden (§1).
  const aufhebungNotiz: Fussnote[] = ganzAufgehoben
    ? fussAnzeige.filter((f) => f.absatz == null && f.item == null)
    : [];
  // ═══ W2·24-R6b · DIE FORM DES ARTIKELS ══════════════════════════════════
  // Der Rahmen (`v3/rahmenSpalten.ts`) hat gerechnet, wie viel die Lese-Zelle
  // trägt; hier wird daraus Markup. ZWEI Formen, EIN Baum:
  //   'zeile' — Ist-Form: Randtitel als Zeile über dem Artikel, Beiwerk
  //             darunter. Gilt im Pane, auf dem Handy, in der Trefferliste und
  //             ohne Provider (V1) — dort ändert sich nichts (§6).
  //   'breit' — Randtitel + Fassungsdatum IM ARTIKELKOPF, die Bezüge als EINE
  //             aufklappbare Zeile darunter. Keine Randspalten mehr.
  //
  // BIS R6 STANDEN HIER DREI FORMEN mit zwei Randspuren (Marginalie links 150 px,
  // Randnotizen rechts 210 px). Sie sind auf Davids Befund vom 6.9.2026 gefallen
  // — sie nahmen der Lese-Zelle 432 px. Wohin ihr Inhalt gewandert ist und warum:
  // `../v3/satzspiegel.ts`.
  const spiegel = useSatzspiegel();
  // In der TREFFERLISTE bleibt jeder Artikel in Zeilenform: sie steht in einer
  // eigenen, schmalen Fläche und soll den Treffer zeigen, nicht seinen Apparat.
  const kopfForm = spiegel === 'breit' && !imTreffer;
  // «Rechnen» in der Bezüge-Zeile (seit W2·24-R6): statische Kantentabelle, kein
  // Ladepfad — Herleitung in `randNotizWerkzeuge.ts`. Nur in der Breitform
  // gefragt; in der Zeilenform bleibt der Artikel byte-gleich (§6).
  const werkzeuge = kopfForm ? werkzeugeAmArtikel(erlass?.key, e.artikel) : LEERE_WERKZEUGE;
  // Fassungsdatum in den Artikelkopf (Auftrag (a)): «Gilt seit …» steht klein
  // neben dem Randtitel, nicht mehr in einer eigenen Randspalte und nicht mehr
  // unten im Beiwerk.
  // Verlagert wird der SLOT samt `data-hist-slot`, nicht sein Inhalt — der
  // Schalter «Änderungsvermerke» (`index.css`, `html[data-histansicht="aus"]`)
  // greift unverändert, und die 24-px-Reserve (`min-h-beiwerk`, CLS) steht
  // weiter am selben Element. Im Kopf kann sie sogar nicht mehr schieben: die
  // Artikelhöhe kommt aus der Textspalte.
  const histImKopf = kopfForm;
  /** Trägt die Randtitel-Zeile der ZEILENFORM überhaupt etwas? Ohne das stünde
   *  der Registerfarben-Strich als Balken über einer leeren Zeile — Lärm statt
   *  Gliederung. In React entschieden und nicht per `:has()`: eine
   *  `:has()`-Regel über 1686 Artikel ist genau die Bauart, die
   *  W2·19-GLIEDERUNG/F1 als Scroll-Bremse nachgewiesen hat. */
  const randInhalt = (marg != null && marg.length > 0) || !!e.titel;
  const histSlot = (
    <div {...{ [SUCH_META]: '' }} data-hist-slot
      className={fussAnzeige.length > 0 || historie
        ? `min-h-beiwerk${histImKopf ? '' : ' mt-4'}`
        : undefined}>
      <ArtikelHistorieZeile historie={historie} artikel={e.artikel} />
    </div>
  );
  /** Die Randtitel selbst — in beiden Formen DASSELBE Markup, nur an einem
   *  anderen Ort (§5: eine Quelle für die Stufen-Stimme, `helpers.tsx`). */
  const randTitel = marg && marg.length > 0 ? (
    <div className="mb-1 space-y-0.5 font-serif leading-snug">
      {marg.map((m, i) => (
        // `lr-blatt` markiert die unterste Stufe (die Sachüberschrift des
        // Artikels). Nur sie wird in der Breitform zur kursiven Serifen-Zeile;
        // die Vorfahren-Stufen bleiben Grotesk.
        <div key={i} className={`${margStufeStil((margBasis ?? 0) + i, i === marg.length - 1)}${i === marg.length - 1 ? ' lr-blatt' : ''}`}>
          {/* A30: bis/ter-Suffix des Enumerators hochgestellt (margLabel). */}
          {margLabel(m)}
          {/* G11: section-heading-Fussnoten-Marker an der passenden Randtitel-
              Zeile (blatt im Volltext, ganze Kette in der Suchsicht). G2b:
              immer (an artOffen gebunden), Prominenz via data-fussnoten-CSS.
              A31: Wort-Verbinder (U+2060) klebt den Marker DIREKT an den
              Randtitel (kein Abstand, kein Umbruch auf eine eigene Zeile). */}
          {artOffen && fnProSektion[m]?.map((nr, j) => (
            <span key={nr} data-fn-marker data-fn-klasse={fnKlasse[nr]}>{WJ}{j > 0 && <span className="align-super text-[length:var(--hochgestellt)] text-ink-500">,</span>}<FnRef artikel={e.artikel} nr={nr} /></span>
          ))}
        </div>
      ))}
    </div>
  ) : e.titel ? (
    /* S2 · Ä7: derselbe Stil wie das Randtitel-BLATT in `margStufeStil`
       (dort steht die Herleitung) — es ist dieselbe Rolle, nur aus der
       anderen Quelle (`article_title` statt `marg`). Beide müssen gleich
       aussehen, sonst wechselt die Sachüberschrift zwischen Artikeln ihre
       Stimme (§5). */
    <div className="lr-blatt mb-1 font-sans text-leser-rand font-semibold text-ink-800">
      {e.titel}
    </div>
  ) : null;
  /** Die Zahlen der Bezüge-Zeile — ausschliesslich aus Daten, die der Artikel
   *  ohnehin führt (§8: keine Rubrik ohne echte Zahl, keine neue Ladelogik). */
  // W2·24-R6c: die Zähl-Datei schlägt beide bisherigen Quellen — sie ist
  // GEZÄHLT, nicht gefiltert, und deshalb dieselbe Zahl vor und nach dem Laden
  // des Shards (die Zeile springt nicht mehr um, sobald der Apparat eintrifft).
  // Ohne Datei bleibt die frühere Reihenfolge unverändert bestehen: gefilterte
  // Kanten, sonst Leitfälle.
  // ── D30 (David 6.9.2026) · «ZÄHLER = LISTENLÄNGE NACH DEM LADEN» ──────────
  // Die Reihenfolge unten bleibt die von R6c (Zähl-Datei zuerst) — sie ist der
  // Grund, aus dem die Zahl beim Eintreffen des Shards nicht umspringt.
  //
  // DAVIDS REGEL IST DAMIT NICHT UMGANGEN, SONDERN AN DER WURZEL ERFÜLLT: die
  // Zähl-Datei zählt `gesamtProArtikel` des Shards, also OHNE UI-Filter
  // (`scripts/gen-bezuege-zaehler.ts`), und die Liste bezieht ihre Kanten seit
  // D30 aus `alleFuer` — ebenfalls ohne UI-Filter. Beide Wege zählen dasselbe;
  // die Zahl kann also gar nicht mehr springen, egal welcher zuerst da ist.
  // (Bis D30 tat sie es: gemessen OR 336c «11 Entscheide» im Kopf gegen 3
  // gezeigte, weil `bezuegeFuer` die Panel-Facetten anwandte — Herleitung in
  // `../bezuegeLaden`.) Dass die beiden Wege übereinstimmen, ist eine ZUSAGE
  // und keine Hoffnung: `e2e/leser-bezuege-inhalt-d30.e2e.ts` (b) misst
  // Kopfzahl gegen die Zahl der gerenderten Zeilen.
  //
  // Der Fallback nimmt `bezuegeImKopf` VOR `bezuege`: in der Kopf-Form ist das
  // die Quelle, die auch die Liste darunter zeigt — die Zahl beschriebe sonst
  // eine andere Menge als das, was daneben steht.
  const bezugsMarken: BezugsMarke[] = [
    {
      reg: 'r',
      anzahl: zaehler ? zaehler.entscheide : ((bezuegeImKopf ?? bezuege) ? (bezuegeImKopf ?? bezuege)!.kanten.length : (leitfaelle?.length ?? 0)),
      wort: ['Entscheid', 'Entscheide'],
    },
    // Die Rubrik erscheint NUR mit echter Zahl (`anzahl > 0` filtert sie sonst
    // in `BezuegeKopf` heraus) — ohne Zähl-Datei steht sie also gar nicht da,
    // statt eine Null zu behaupten (§8). Dieselbe Deckungsgleichheit wie oben:
    // die Zähl-Datei entdoppelt die Material-Kanten nach Dokument, und genau so
    // baut `projiziereMaterialien` die Liste (ein Eintrag je Dokument).
    { reg: 'm', anzahl: zaehler?.materialien ?? (materialien?.length ?? 0), wort: ['Materialie', 'Materialien'] },
    { reg: 'g', anzahl: verweise.length, wort: ['Verweis', 'Verweise'] },
    { reg: 'w', anzahl: werkzeuge.length, wort: ['Rechner', 'Rechner'] },
  ];
  // W2·5d G3b (③/⑤): Anhang/Protokoll tragen einen kräftigeren Struktur-Trenner
  // (rule-struktur statt rule-artikel) + mehr Weissraum — so hebt sich jeder
  // Anhang-Block klar vom Normtext und vom Vor-Anhang ab (Linien-Kanon-Rolle
  // «Struktur-Trenner», wie oberste Sektionen/Ingress). Reine Darstellung (§3).
  return (
    <article id={`art-${e.artikel}`} data-normtext-linie data-anhang={istAnhang ? '' : undefined}
      // W2·5d U-POSITION/A2: inhalts-proportionale content-visibility-Platzhalter-
      // höhe (überschreibt den flachen 320px-Default der .nt-art-cv-Klasse) → der
      // Scrollbalken wird proportional. `content-visibility:auto` (Klasse) bleibt;
      // reiner Platzhalter-Schätzwert, kein DOM-/Inhalts-Eingriff (§15/1).
      style={{ containIntrinsicSize: `auto ${schaetzeArtikelHoehe(e)}px` }}
      // ─── W2·19-GLIEDERUNG / F1: Hover-Spotlight ERSATZLOS entfernt ──────────
      // WAR: `transition duration-200 group-has-[[data-lese]:hover]/lese:opacity-80
      //       has-[[data-lese]:hover]:!opacity-100 has-[[data-lese]:hover]:z-[5]`
      // (Commit 820db9dc1, 18.6.2026 — «andere Artikel dimmen», Davids Wunsch).
      //
      // WARUM WEG (Messung, bibliothek/betrieb/gliederung-perf-diagnose-2026-08-08.md):
      // die Kette hing an JEDEM der 1686 <article> des OR. Jedes Hover-Kippen beim
      // Scrollen startete 1686 gleichzeitige Opazitäts-Transitionen (4 Ereignisse je
      // Element) — gemessen 142 208 Transition-Ereignisse je 60-Schritt-Scroll,
      // React-Root-Dispatcher 284 499 Aufrufe/7 s. Anteil an der Blockierzeit ~78 %
      // (U1); die verbleibenden ~20 % (U2) sind die `:has()`-Invalidierung über die
      // ganze Lesespalte, die mit der Kette ebenfalls entfällt. Belegte Wirkung:
      // Frame-Median 33.3 → 16.7 ms (30 → 60 fps) @1×, TBT @4× 8845–9003 ms →
      // Boden 283–297 ms (Maus-am-Rand-Referenzmessung).
      //
      // ERSATZLOS auf Entscheid David 8.8.2026 abends: «der Dimm-Effekt kann auch weg
      // — Gliederung ist wichtiger». Damit entfällt auch der im Dossier aufgeschobene
      // Scrim-Ersatz (F1b); es wird KEIN anderes Mittel eingesetzt.
      //
      // WAS BLEIBT: `group` (der Aktions-Slot der Kopfzeile hängt mit
      // `group-hover:opacity-100` daran, s. u.), `relative z-base` (unveränderte
      // Stapelordnung des Ruhezustands — nur der Hover-Sprung auf z-[5] fällt weg;
      // `z-base` = C3-Rolle für den Wert 0, s. index.css bei --z-base).
      // §15-Logikverlust: keiner — reine Darstellung (§3), Normtext, Anker, Ctrl+F,
      // Druck und Golden-Ausgaben sind unberührt.
      className={`lr-satz nt-art-cv group relative z-base nt-anker border-t ${istAnhang ? 'border-rule-struktur pt-9 mt-9' : 'border-rule-artikel pt-7 mt-7'} first:border-t-0 first:mt-0 first:pt-0`}>
      {/* ═══ W2·24-R6b · DER ARTIKEL: KOPF · WORTLAUT · BEIWERK ═════════════
          Bis R6 lagen hier drei Grid-Spalten (Marginalie · Text · Randnotizen).
          Beide Randspuren sind gefallen (Auftrag David 6.9.2026, Herleitung in
          `../v3/satzspiegel.ts`); übrig bleibt der EINE Fluss, den die
          Zeilenform immer schon hatte — nur trägt der Artikelkopf in der
          Breitform jetzt den Randtitel, das Fassungsdatum und die Bezüge-Zeile.

          Die Zeilenform ist damit unverändert: Randtitel als Zeile über der
          Artikelnummer (Auftrag David 26.6.2026 — Fedlex-Stil; bleibt auch bei
          eingeklapptem/aufgehobenem Artikel sichtbar), Beiwerk unter dem
          Wortlaut. */}
      {!kopfForm && (
        <div className="lr-rand">
          {/* Registerfarben-Strich: ausserhalb der Randspalte 0 px hoch
              (`index.css`, `.lr-reg`) — er darf die Zeilenform nicht um eine
              Zeile verschieben. */}
          {randInhalt && <span aria-hidden className="lr-reg" />}
          {randTitel}
        </div>
      )}
      <div className="lr-text">
        {/* ── (a) BREITFORM: Randtitel + Fassungsdatum ÜBER der Artikelnummer ──
            Auftrag David 6.9.2026: der Randtitel als kursive Literata-Zeile im
            Artikelkopf, das Fassungsdatum klein daneben. Beides stand bis R6
            links in einer 150-px-Spalte, die dem Text die Breite nahm. Der
            Fassungs-Slot wandert MIT SEINER RESERVE (`min-h-beiwerk`), damit der
            späte Shard-Resolve weiter reservierten Platz füllt statt zu schieben
            (§15.2). */}
        {kopfForm && (randTitel || fussAnzeige.length > 0 || historie) && (
          <div className="lr7-kopf">
            <div className="lr7-kopf-titel">{randTitel}</div>
            <div className="lr7-fassung">{histSlot}</div>
          </div>
        )}
        {/* Kopfzeile des Artikels: «Art. N» als Anker über dem Fliesstext. */}
        <div className="mb-1.5">
          {/* Artikelnummer-Zeile: «Art. N» als Anker; Zitat/Link rechtsbündig INLINE
              (ml-auto) statt als eigene Zeile darunter — schliesst den Abstand zum
              ersten Absatz (Auftrag David 26.6.2026, P8). */}
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            {/* M9: aufgehobener Artikel trägt kein Klapp-Chevron (nichts zu entfalten —
                der Wortlaut ist «…»), aber EINEN gleich breiten w-4-Platzhalter wie der
                Chevron-Knopf der aktiven Artikel → die «Art. N» fluchten bündig auf
                EINER Ebene (Art. 349–358 ZGB bündig zu Art. 348). Beide inline-flex
                w-4 justify-center, damit die Glyphe nicht die Spaltenbreite verschiebt. */}
            {ganzAufgehoben
              ? <span className="inline-flex w-4 shrink-0" aria-hidden />
              : <button type="button" onClick={() => setArtOffen((v) => !v)} aria-expanded={artOffen}
                  // WCAG 4.1.2 · konstanter, den Artikel BENENNENDER Name
                  // (QS-UI Folgeschritt, 5.9.2026; in Teilpass (e) noch
                  // zurückgestellt, weil er Test-Zeilen berührt).
                  // Vorher: `artOffen ? 'Artikel einklappen' : 'Artikel
                  // ausklappen'`. Gemessen an /gesetze/bund/GEBV_HREG: ZWÖLF
                  // Knöpfe mit wortgleichem Namen «Artikel einklappen» auf EINER
                  // Seite (auf dem OR 1598 bei derselben Erhebung über alle
                  // aria-expanded-Knöpfe der Artikel) — in der Knopf-Liste eines
                  // Screenreaders ununterscheidbar; dazu wechselte der Name beim
                  // Klick, worauf Sprachsteuerung ins Leere zielt. Jetzt trägt
                  // der Name den Artikel, den er klappt, den Zustand trägt
                  // allein `aria-expanded` — dasselbe Muster wie beim Zwilling
                  // `SektionBaumTOC.tsx` (dort steht die ausführliche
                  // Herleitung). Bewacht von `ARIA_ZUSTANDSNAME`
                  // (eslint.config.js); die Ausnahme aus Teilpass (e) ist
                  // ersatzlos weg, das Tor ist hier wieder scharf.
                  aria-label={`«${label}» auf- und zuklappen`}
                  // F3/C5 (29.8.2026): ink-300 → ink-500 — einzige Affordanz
                  // des Klapp-Knopfes, gemessen 2.28:1 hell / 2.34:1 dunkel
                  // gegen `--paper`, unter der F2-Schwelle 3:1 für Nicht-Text.
                  // Herleitung ausführlich am Zwilling in `SektionBaumTOC.tsx`.
                  className="inline-flex w-4 shrink-0 justify-center text-micro text-ink-500 hover:text-brass-700">{artOffen ? '▾' : '▸'}</button>}
            {/* Anhang/Protokoll (③/⑤): «Anhang N»/«Protokoll N …» als Struktur-
                Überschrift (font-display, Titel-Grösse) statt als Artikelnummer
                (num/bold) — es ist ein Block-Titel, keine zitierbare Bestimmung. */}
            {/* A31: «Art. N» + Fussnoten-Marker als EIN Inline-/flex-Kind (whitespace-
                nowrap) — der Marker klebt direkt an der Nummer (kein gap-x-2, kein
                Umbruch auf eine eigene Zeile), genau wie auf Fedlex. */}
            <span className="whitespace-nowrap">
            {imTreffer && onSpringe ? (
              <button type="button" onClick={() => onSpringe(e.artikel)}
                title="Im Volltext zu diesem Artikel springen"
                className={istAnhang
                  ? 'font-display text-h3 font-semibold text-ink-900 hover:text-brass-700 text-left'
                  : `num text-base font-bold tracking-wide hover:text-brass-700 text-left ${ganzAufgehoben ? 'text-ink-500 font-normal' : 'text-ink-900'}`}>{label}</button>
            ) : (
              <a href={`#art-${e.artikel}`} className={istAnhang
                ? 'font-display text-h3 font-semibold text-ink-900 hover:text-brass-700 no-underline'
                : `num text-base font-bold tracking-wide hover:text-brass-700 no-underline ${ganzAufgehoben ? 'text-ink-500 font-normal' : 'text-ink-900'}`}>{label}</a>
            )}{fnMarker}
            </span>
            {/* aufgehoben gedämpft, aber ink-500 (WCAG 4.5:1 hell+dunkel) statt
                ink-400 (3.2–3.6:1) — essentieller Link-Text, kein incidental. */}
            {ganzAufgehoben && <span {...{ [SUCH_META]: '' }} className="text-xs italic text-ink-500">· aufgehoben</span>}
            {artOffen && (
              // W2·19-GLIEDERUNG/S8 (Bau-Spec §4.4): `data-such-meta` — die
              // Aktions-Zeile ist BEDIENUNG, kein Gesetzestext. Ohne die Marke
              // malte die Suche nach «Zitat» oder «Link» in JEDEM Artikel eine
              // Fundstelle, die der datenseitige Zähler zu Recht nicht kennt
              // (gemessen am BGFA: 0 gezählt gegen 39 gemalt) — und weil die
              // Zeile bis zum Hover `opacity-0` trägt, wären es 39 UNSICHTBARE
              // Markierungen. Genau der Fall, für den SUCH_META gebaut wurde
              // (Bug-Check §9 vom 4.8.2026, B1).
              <span {...{ [SUCH_META]: '' }}
                className="ml-auto flex shrink-0 gap-3 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100 [@media(hover:none)]:opacity-100">
                {/* LM-091 (W2·17-UI-BEFUNDE B10, 4.9.2026). Teilwiderlegt und
                    teilgebaut. WIDERLEGT: die Zeile hat Abstand (`gap-3`) und
                    erscheint nicht nur bei Mausbedienung — `focus-within` holt
                    sie per Tastatur, `[@media(hover:none)]` auf Touch.
                    REPRODUZIERT: «als Aktion erkennbar». Gemessen 22×13 px,
                    border 0, Farbe ink-500 — unter der AA-Untergrenze
                    (WCAG 2.5.8, 24 px) und optisch nicht von einem
                    Fliesstext-Link zu unterscheiden. `.lc-btn-mini` gibt allen
                    dreien Fläche, Haarlinie und `--tap-ziel` als Mindesthöhe.
                    Die PLATZIERUNG (rechts oben in der Artikel-Kopfzeile)
                    bleibt unangetastet — sie ist mit EID-2 am 25.7.2026
                    abgenommen (FAHRPLAN-GESETZES-UX §12.5, PR #349) und wird
                    von einem Affordanz-Fix nicht umgeworfen; ebenso bleibt die
                    leise Stimme (`text-micro`/`ink-500`, §13). */}
                <button type="button" onClick={() => kopiere('zitat')} className="lc-btn-mini text-micro text-ink-500 hover:text-brass-700" aria-label={`Zitat kopieren: ${zitatVoll}`}>{kopiert === 'zitat' ? '✓ kopiert' : 'Zitat'}</button>
                <button type="button" onClick={() => kopiere('link')} className="lc-btn-mini text-micro text-ink-500 hover:text-brass-700" aria-label="Permalink kopieren">{kopiert === 'link' ? '✓' : 'Link'}</button>
                {/* EID-2: Outbound zur amtlichen Fassung AN DIESER STELLE (ELI-Form,
                    target/rel wie die bestehenden amtlichen Links, §12.4). Stil =
                    dieselbe dezente Aktions-Stimme wie Zitat/Link daneben (§13). */}
                {amtlich && (
                  <a href={amtlich} target="_blank" rel="noopener noreferrer"
                    className="lc-btn-mini text-micro text-ink-500 hover:text-brass-700 no-underline whitespace-nowrap"
                    aria-label={`Amtliche Fassung von ${zitat} auf Fedlex öffnen ${NEUER_TAB}`}
                    // Ä110 (18.8.2026): EINE Schreibung für EIN Ziel — der
                    // sichtbare Text folgt dem `aria-label` und dem `title`
                    // darüber, die schon immer «Amtliche Fassung» sagten.
                    title="Amtliche Fassung an genau dieser Stelle (Fedlex)">Amtliche Fassung ↗</a>
                )}
              </span>
            )}
            {/* Amtliche Aufhebungsnotiz (eigene Zeile, dezent eingerückt) — M2: erst
                auf Klick (hinter dem Fussnoten-Schalter), wie jede andere Fussnote.
                Die Statuszeile «· aufgehoben» oben bleibt unabhängig immer sichtbar. */}
            {ganzAufgehoben && aufhebungNotiz.length > 0 && (
              /* S2: `text-leser-fn` wie der Haupt-Apparat am Artikelfuss. Beide tragen
                 `data-fn-apparat`, sind also dieselbe Rolle — bis S2 lief dieser hier
                 auf `text-xs` (12 px) und der andere auf 11 px, zwei Grössen für eine
                 Sache (§5). Der eigene `leading-snug` fällt mit: die Zeilenhöhe kommt
                 aus der Stufe. */
              /* T3 (29.8.2026): dieselbe Feinschrift-Spalte wie der Haupt-Apparat
                 am Artikelfuss — es ist dieselbe Rolle (§5). */
              <span data-fn-apparat className="basis-full pl-6 max-w-kleintext text-leser-fn text-ink-500">
                {aufhebungNotiz.map((fn, i) => (
                  <span key={i}>{i > 0 && '; '}{fnTextMitLinks(fn)}</span>
                ))}
              </span>
            )}
          </div>
          {/* G23 (M8): Delegationsnorm-Grundlage «(Art. N ArG)» — Fedlex zeigt sie
              dezent unter der Überschrift; amtlicher Inhalt (§2), bisher verworfen.
              Immer sichtbar (auch eingeklappt), wie der Randtitel. */}
          {e.grundlage && (
            <div className="mt-0.5 text-xs italic leading-snug text-ink-500">{e.grundlage}</div>
          )}
        </div>
        {/* ── (b) BREITFORM: die Bezüge als EINE Zeile unter dem Artikelkopf ──
            Dieselben Blöcke, die bis R6 in der Randspalte standen — eingeklappt
            eine Zeile mit Registerfarben-Marken, aufgeklappt der volle Apparat.
            `data-such-meta`: Bezüge sind Referenzschicht, kein Wortlaut (§4.4).
            Ausserhalb von `artOffen`, genau wie die Randspalte vorher: der
            Apparat gehört zum Artikel, nicht zu seinem entfalteten Wortlaut. */}
        {kopfForm && (
          <div {...{ [SUCH_META]: '' }}>
            <BezuegeKopf marken={bezugsMarken} zitat={zitat}
              onOeffnen={onBezuegeOeffnen} laedt={bezuegeLaedt && !bezuege}>
              {/* ── D30 · DIE ENTSCHEIDE, DIE DER ZÄHLER VERSPRICHT ─────────
                  `form="rand"`: senkrecht gestapelte Zeilen mit Zitierung und
                  Regeste, Leitentscheide zuerst (die Gruppen laufen nach
                  `STATUS_RANG`, BGE vor allem anderen). Das ist DIESELBE
                  Komponente und dieselbe Portionierung wie überall sonst — nur
                  die Gestalt, die R4 für die schmale Randspalte gebaut hat und
                  die hier aus demselben Grund richtig ist: in einer aufgeklappten
                  Liste unter dem Artikelkopf sucht niemand eine waagrechte
                  Scrollachse. Der Klick öffnet daneben (Split-Regel M3) — das
                  bringt `KanteMitVorschau` mit, nicht diese Stelle. */}
              {((bezuegeImKopf ?? bezuege) || (leitfaelle && leitfaelle.length > 0)) && (
                <div className="lr7-bez-block" data-reg="r">
                  {(() => {
                    const b = bezuegeImKopf ?? bezuege;
                    return b
                      ? <BezuegeZeile kanten={b.kanten} gesamt={b.gesamt}
                          zeitAktiv={b.zeitAktiv} kantonAktiv={b.kantonAktiv}
                          normZitat={zitat} revision={revision} form="rand" />
                      : <LeitfallZeile refs={leitfaelle} normZitat={zitat} revision={revision} />;
                  })()}
                </div>
              )}
              {/* ── D30 · MATERIALIEN, dieselbe Anatomie wie «Rechnen» ───────
                  Ein Titel je Dokument, daneben die Art (Behörde + Doktyp) —
                  dieselbe Zeilenform wie der Rechnen-Block unten (§5), damit die
                  drei Rubriken der aufgeklappten Zeile EINE Liste sind und nicht
                  drei Gestalten. `sublabel` ist die amtliche Fundstelle-Ziffer
                  im Dokument; sie steht nur, wenn der Kanten-Shard sie führt. */}
              {materialien && materialien.length > 0 && (
                <div className="lr7-bez-block" data-reg="m">
                  <span className="lc-overline mr-1"><span className="lc-punkt" aria-hidden />Materialien</span>
                  <ul className="lr6-notiz-liste">
                    {materialien.map((mat) => (
                      <li key={mat.key} data-bez-material>
                        <Link to={mat.pfad}>{mat.titel}</Link>
                        <span className="lr6-notiz-art">
                          {mat.behoerdeKuerzel} {mat.doktypLabel}{mat.sublabel ? ` · ${mat.sublabel}` : ''}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {verweise.length > 0 && (
                <div className="lr7-bez-block" data-reg="g">
                  <span className="lc-overline mr-1"><span className="lc-punkt" aria-hidden />Verweise</span>
                  <span className="inline-flex flex-wrap items-center gap-1.5 align-middle">
                    {verweise.map((v) => <NormChip key={v} artikel={v} />)}
                  </span>
                </div>
              )}
              {werkzeuge.length > 0 && (
                <div className="lr7-bez-block" data-reg="w">
                  <span className="lc-overline mr-1"><span className="lc-punkt" aria-hidden />Rechnen</span>
                  <ul className="lr6-notiz-liste">
                    {werkzeuge.map((w) => (
                      <li key={w.id}>
                        <Link to={w.href}>{w.titel}</Link>
                        {/* Art des Werkzeugs: ein Rechner rechnet, eine Vorlage
                            füllt ein Dokument — für die Auswahl der Unterschied. */}
                        <span className="lr6-notiz-art">{w.modus === 'vorlage' ? 'Vorlage' : 'Rechner'}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </BezuegeKopf>
          </div>
        )}
        {/* Rechte Lesespalte: grosse Serifenschrift, hängende Messing-Absatznummern.
            overflow-x-clip + min-w-0: bei geteiltem/schmalem Bildschirm darf der
            Artikel-Block (hängender Absatz-Einzug pl-9/-indent-9) NICHT über die
            Spalte hinausragen → sonst wurde Text rechts abgeschnitten (Befund David
            25.6.2026). Der Wortumbruch im Absatz (overflow-wrap:anywhere) bleibt. */}
        {artOffen && (
        <div className="max-w-normtext min-w-0 overflow-x-clip">
          <ArtikelBody bloecke={e.bloecke} artikel={e.artikel} passus={{ absatz: null }} autolink
            zitierKontext={{ artikelLabel: label, kuerzel: erlass.kuerzel, fassung: erlass.stand, permalinkBasis: `${basisPfad}#art-${e.artikel}` }}
            fnProAbsatz={fnProAbsatz} fnProItem={fnProItem}
            fnInlineAbsatz={fnInlineAbsatz} fnInlineItem={fnInlineItem}
            fnKlasse={fnKlasse}
            intern={intern}
            /* S2 (Pos. 19, F3 = V2 «amtsnah kompakt», David 17.8.2026 am Bildbogen):
               `text-leser-text` (17 px / lh 1.55) ERSETZT das Paar
               `text-body-l leading-[1.65]`. Der rohe Arbitrary-Override fällt damit
               weg — die Zeilenhöhe gehört zur Stufe (Design-Grundlage Kap. 8 Nr. 4:
               «kein fixer Leading-Wert über alle Grössen»); Wächter
               `src/tests/leser-typo-tokens.test.ts`. WCAG 1.4.8 gemessen @1440:
               lh 1.55 ≥ 1.5 und ≤ 80 ch (Lesemass `max-w-normtext` 42 rem
               unverändert).

               EINE ZAHL, EINE MESSUNG (Nachzug 17.8.2026, Arch-Prüfer 9): hier stand
               «53–58 ch», im Fahrplan «73 / 71 / 61 ch» — zwei Zahlen für dieselbe
               Sache. Massgeblich ist die Methode des Tors (`e2e/leser-lesemass.e2e.ts`:
               längster mehrzeiliger Fliesstext-Absatz, Textlänge / Zeilenkisten).
               Damit @1440 gemessen: ZGB 68 · OR 71 · StPO 73 · VMWG 74 · StGB 77 ch.
               Die 80-ch-Decke der WCAG hält überall; die engere HAUSdecke von 75 ch
               nicht mehr überall (StGB 77) — Notiz an der Schwelle im Tor und als
               offener Punkt im Vollzugsvermerk S2. */
            className="space-y-3.5 font-serif text-leser-text text-ink-800" />
          {/* ═══ BEIWERK-ZONE (S2 · Pos. 13, Fahrplan Kap. 4c / Grundlage Kap. 3) ═══
              EIN benannter Ort für alles, was unter dem Wortlaut steht: Verweis-Chips ·
              Rechtsprechung (ab H3 der leise Zähler «⚖ n Entscheide →») · Fassungs-
              Zeile · Fussnoten-Apparat. Vorher lagen die vier Blöcke unverbunden
              nebeneinander, jeder mit eigenem Abstand und der Historie-Slot mit einer
              EIGENEN Reservierung — es gab keine Zone, die man reservieren, messen oder
              per CSS greifen konnte. `data-beiwerk` ist der Vertrag (ein
              Daten-Attribut, kein Utility-Klassenname — Lehre aus der
              `.text-body-l`-Kopplung der Schriftskala, index.css).

              KEINE eigene Reservierung an der Zone, und das ist gemessen, nicht
              gespart: das einzige spät eintreffende, heute unreservierte Element ist
              die Rechtsprechungs-Zeile, und ihre Reservierung ist bewusst verworfen
              (§15.2 — sie zöge Weissraum in fast jeden Artikel; gemessen 17.8.2026
              @1440 tragen 326/480 Artikel der StPO und 376/1686 des OR eine solche
              Zeile). Die Reservierung sitzt darum weiterhin an dem Element, das der
              Schalter «Änderungsvermerke» mit ausblendet (`[data-hist-slot]`, S1) —
              eine Reservierung, die den Schalter überlebt, wäre die Phantom-Lücke,
              gegen die S1 sie überhaupt an den Slot gehängt hat.

              ABWEICHUNG ZUM ABNAHME-KRITERIUM DER ETAPPE, offengelegt (§7): «Das
              Umschalten aller drei Schalter erzeugt an keinem Artikel einen
              Layout-Sprung» ist mit dem David-Entscheid **A1 vom 5.7.2026** («AUS» =
              verschwinden statt dämpfen) nicht erfüllbar. Gemessen 17.8.2026 @1440
              trägt der Fussnoten-Apparat je Artikel 27–187 px; ihn höhenfest zu
              reservieren hiesse, bei «Fussnoten: aus» ein bis zu 187 px hohes leeres
              Loch stehen zu lassen — genau das Dämpfen, das A1 verboten hat. Eine
              feste Mindesthöhe kann nur Elemente auffangen, die KLEINER als der Boden
              sind. Erfüllt und gemessen ist deshalb die Zusage, die zählt: der
              Lade-Sprung (CLS) bleibt bei 0.004–0.016; das Umschalten ist
              klick-getrieben, liegt binnen 500 ms nach der Eingabe und ist damit per
              Definition kein unerwarteter Sprung. Zahlen im Vollzugsvermerk S2. */}
          <div data-beiwerk>
          {/* VERWEISE: auflösbare Normverweise des Artikels als Chips (Referenz David).
              R6b: in der Breitform steht dieser Block in der Bezüge-Zeile am
              Artikelkopf (`kopfForm`) — NIE an beiden Orten; das wären zwei
              Wahrheiten am selben Artikel (§5). */}
          {/* S8: Verweis-Chips sind Wegweiser, kein Wortlaut — `data-such-meta`,
              damit die Suche nach «Verweise» oder einer Chip-Beschriftung nicht
              eine Fundstelle malt, die es im Gesetzestext nicht gibt (§4.4). */}
          {!kopfForm && verweise.length > 0 && (
            <div {...{ [SUCH_META]: '' }} className="mt-4 flex flex-wrap items-center gap-2">
              <span className="lc-overline mr-1"><span className="lc-punkt" aria-hidden />Verweise</span>
              {verweise.map((v) => <NormChip key={v} artikel={v} />)}
            </div>
          )}
          {/* LEITFÄLLE (§11.2): Bundesgerichtsentscheide zu genau diesem Artikel, lazy
              aus dem erlass-lokalen Shard. Verdrahtet das bisher tote proNormArtikel-
              Modell (norm-index.ts) sichtbar — vom Artikel direkt zur Rechtsprechung.

              W2·7-BEZUG/B4: der Reader liefert `bezuege` — die nach Instanz
              gruppierte Auflistung aus dem Bezugs-Shard. Sie tritt AN DIE STELLE
              der V1a-Zeile (Obermenge, §5): nie beide, sonst stünden dieselben
              BGE zweimal am Artikel. Ist keine Facette aktiv, ist `bezuege`
              undefined UND `leitfaelle` ungesetzt ⇒ unter dem Artikel steht
              nichts (Vorgabe David 28.7.2026). */}
          {/* S8: die Rechtsprechungs-Zeile am Artikelfuss ist Referenzschicht,
              kein Normtext (§4.4) — sie zählt nicht zu den Fundstellen und
              wird darum auch nicht markiert. */}
          {!kopfForm && (
          <div {...{ [SUCH_META]: '' }}>
            {bezuege
              ? <BezuegeZeile kanten={bezuege.kanten} gesamt={bezuege.gesamt}
                  zeitAktiv={bezuege.zeitAktiv} kantonAktiv={bezuege.kantonAktiv}
                  normZitat={zitat} revision={revision} />
              : <LeitfallZeile refs={leitfaelle} normZitat={zitat} revision={revision} />}
          </div>
          )}
          {/* G-HIST-UI: «Gilt seit»-Badge + aufklappbare Fassungs-Timeline dieses
              Artikels (aus dem erlass-lokalen Historie-Shard, idle geladen). Am
              Artikel-Fuss wie Verweise/Leitfälle. §15.2: der Slot steht ab dem
              ERSTEN Render und reserviert die eine Chip-Zeile (`min-h-beiwerk`,
              Token — gemessen exakt 24 px, deterministisch über alle Artikel), damit
              der idle-Shard-Resolve reservierten Platz FÜLLT statt sichtbare Artikel
              zu schieben (Messung 20.7.: sonst CLS 0.0227 statt 0.0002 unter 6×). Der
              Aussenabstand sitzt hier am Slot, nicht in der Zeile — sonst fallen
              reservierte und gefüllte Höhe auseinander. */}
          {/* S8: «Gilt seit»-Badge und Fassungs-Timeline sind abgeleitete
              Metadaten, kein Wortlaut (§4.4) — `data-such-meta`.

              S1 (Kap. 4f, Befund K4): der Slot trägt `data-hist-slot`, damit der
              Schalter «Änderungsvermerke» ihn MIT ausblenden kann. Bis S1 hing die
              «Fassung»-Zeile an gar keinem Schalter — bei «Änderungsvermerke aus»
              blieb die Fassungshistorie als einzige Historie-Spur im Lesetext
              stehen. Ausgeblendet wird der SLOT, nicht nur die Zeile darin: sonst
              bliebe seine reservierte Höhe (`mt-4 min-h-beiwerk` = 16+24 px) als
              Phantom-Lücke unter jedem Artikel zurück, und «aus» hätte doch eine
              Spur hinterlassen. Der Inhalt bleibt im DOM (A1-Mechanik, David
              5.7.2026: `display:none`, nie gelöscht) und «an» stellt ihn
              vollständig wieder her.

              S2 · Ä26 (Phantom-Lücke, Ästhetik-Prüfer 17.8.2026): die Reservierung
              stand bisher unter JEDEM Artikel JEDES Erlasses — auch dort, wo nie eine
              Fassungs-Zeile eintreffen kann (auf BS-640.100 sind das 292 von 292).
              Sie folgt jetzt dem Datenmodell, und zwar ARTIKELWEISE.

              DIE FRAGE, die die Reservierung stellen MUSS: «kann in DIESEM Slot je
              eine Fassungs-Zeile eintreffen?» Sie ist am Datenmodell exakt
              beantwortbar, weil der Erzeuger sie selbst so stellt:
              `scripts/normtext/historie-generieren.ts` baut die Shard-Einträge
              AUSSCHLIESSLICH aus den gespeicherten Fussnoten des jeweiligen Artikels
              (`artikel[<token>].fussnoten` → `baueArtikelHistorie`). Ein Artikel ohne
              Fussnote kann darum keinen Eintrag bekommen — das ist eine
              GENERATOR-INVARIANTE, keine Korpus-Zufälligkeit. Empirisch gegengeprüft
              (17.8.2026, alle 209 Shards gegen alle Struktur-Sidecars): 24 511
              Artikel, 13 093 mit Historie-Eintrag, davon **0** ohne Fussnote.

              KEINE EBENEN-WEICHE. Ein früherer S2-Zwischenstand hing die Reserve an
              `erlass.ebene === 'bund'`. Das traf den Korpus von heute (209 Shards,
              alle Bund — der Generator liest nur `struktur/bund`), war aber ein
              ERLASS-SONDERPFAD in einer Komponente, die erlass-neutral rendern soll:
              die Eigenschaft heisst «kann eine Fassungs-Zeile tragen», nicht «ist
              Bundesrecht». Genau diesen Fehler hat S1-B3 an derselben Mechanik schon
              einmal vermieden (`zaehleAenderungsvermerke`, berechnungen.ts: «das
              entscheidet das DATENMODELL, nicht die Herkunft»); wäre `ebene`
              stehengeblieben, hätte der Tag, an dem der Generator Kantonsrecht
              aufnimmt, eine stille Phantom-Lücke erzeugt statt eines Testfehlers.

              WARUM ARTIKELWEISE UND NICHT ERLASSWEISE: die Shard-Existenz (404 vs.
              Treffer) ist erst NACH dem idle-Fetch bekannt — also genau dann, wenn
              die Zeile schon eintrifft. Eine Reserve, die auf diese Antwort wartet,
              käme zu spät und müsste bei 404 wieder einfallen (ein Sprung nach oben,
              den es heute nicht gibt). Die Fussnoten dagegen kommen mit dem
              Struktur-Sidecar, aus dem auch der Apparat direkt darunter rendert
              (`fussAnzeige`, s. u.) — Reserve und Apparat erscheinen im SELBEN Paint,
              der spätere Shard-Resolve füllt nur noch. Die Reserve ist damit
              MONOTON: sie verschwindet nie wieder.

              `historie` steht als zweite Bedingung im ODER, obwohl die Invariante ihn
              überflüssig macht: träfe je ein Eintrag ohne Fussnote ein, bekäme der
              Slot trotzdem seinen Boden. Die Regel kann so nur überreservieren, nie
              einen Sprung durchlassen (§1 — lieber die Prüfung verdoppeln).

              WIRKUNG, gemessen (17.8.2026): korpusweit reservieren 17 547 statt
              25 403 Artikel (−31 %); auf BS-640.100 fallen 278 von 292 Slots weg
              (95 %), auf dem OR 1092 von 1686, auf der StPO 346 von 480.
              REST-ÜBERRESERVIERUNG, benannt statt versteckt: 4454 Artikel tragen
              Fussnoten, aber keinen Eintrag (25 % der reservierenden) — darunter die
              14 Fussnoten-Artikel von BS-640.100, für die es heute gar keinen Shard
              geben kann. Das enger zu ziehen bräuchte ein Shard-Manifest im
              Prerender-Pfad (eigener Schritt, Datenhaltung). VERWORFEN als engere
              Regel: «Artikel trägt eine `kl:'A'`-Fussnote» reserviert nur 13 046,
              verfehlt aber 182 Artikel MIT Eintrag (u. a. ZGB Art. 159, 181, 451) —
              unsound, das wären 182 echte Sprünge.

              Der Token heisst seit S2 `min-h-beiwerk` (Wert unverändert 1.5 rem = die
              gemessenen 24 px der einen Chip-Zeile): er reserviert den Boden der
              Beiwerk-Zone, nicht «eine Historie-Zeile». */}
          {!histImKopf && histSlot}
          {/* Fussnoten (Änderungs-/Quellenhistorie, AS/BBl klickbar). W2·5d G2b:
              der Apparat liegt IMMER im DOM (Ctrl+F/Print/Screenreader, R9/§8);
              der data-fussnoten-CSS-Toggle dämpft ihn bei «AUS» (data-fn-apparat),
              versteckt ihn nie. Marker + Apparat = EINE Bedienung (Options-Leiste). */}
          {fussAnzeige.length > 0 && (
            <div data-fn-apparat className="mt-3 border-t border-rule-artikel pt-2 space-y-1">
              {fussAnzeige.map((fn, i) => (
                <p key={i} id={fn.nr ? `fn-${e.artikel}-${fn.nr}` : undefined} data-fn-klasse={fn.kl}
                  /* S2 (V2-Spalte «Fussnoten-Body 0.6875 rem / lh 1.3»): `text-leser-fn`
                     ersetzt `text-xs leading-normal` (12 px / 1.5). Fahrplan Kap. 8
                     nennt als Ist-Zustand `text-micro` 0.6875/1.2 — am Code gemessen
                     war es `text-xs`; die Spalte gilt, der Ist-Vermerk war falsch (§7).

                     T3 (Design-Qualitäts-Pass 29.8.2026): der Apparat lief auf der
                     VOLLEN Lesespalte — gemessen @1440 am OR 640 px Kasten, längster
                     Eintrag 108 ch/Zeile (5.88 px/ch), Einzelzeilen bis 128 ch. Auf
                     11 px ist das keine lesbare Spalte mehr. `max-w-kleintext`
                     (26 rem, Herleitung am Token in `tailwind.config.js`) setzt die
                     Feinschrift auf ihr eigenes Mass; der Trenner darüber bleibt
                     bewusst über die volle Spalte (Linien-Kanon §4b: der
                     Artikel-Trenner trennt die SPALTE, nicht den Textblock). */
                  className="nt-anker max-w-kleintext text-leser-fn text-ink-500 target:bg-brass-100">
                  {/* WCAG-AA (§13): Fussnoten-Nummer ist semantischer Text (kein aria-hidden).
                      LM-153 (W2·17-UI-BEFUNDE-B4): die Marke im Fliesstext (FnRef,
                      ArtikelBody.tsx) ist hochgestellt UND brass-700; der Apparat-Eintrag
                      stand bisher als ink-500-Zahl auf der Grundlinie — andere Auszeichnung,
                      dieselbe Referenz. Baseline/Grösse bleiben (eine Liste aus hochgestellten
                      Mini-Ziffern wäre unlesbar), aber die FARBE wird auf dieselbe brass-700-
                      Familie gehoben — der Leser verbindet Marke↔Eintrag über die Farbe, wie
                      im Fliesstext. brass-700 ist bereits an der Marke selbst AA-geprüft
                      (kleinere Schrift, `--hochgestellt`) und trägt hier bei 11px erst recht
                      (S2: der Apparat läuft auf `text-leser-fn`). */}
                  {fn.nr && <span className="num mr-1 text-brass-700">{fn.nr}</span>}
                  {fnTextMitLinks(fn)}
                </p>
              ))}
            </div>
          )}
          </div>{/* /data-beiwerk */}
        </div>
        )}
      </div>
    </article>
  );
});
